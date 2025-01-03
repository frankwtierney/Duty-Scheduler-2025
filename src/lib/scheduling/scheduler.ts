import { eachDayOfInterval, isSameDay, addDays, differenceInDays, isFriday, isSaturday } from 'date-fns';
    import { ParaPro, UnavailabilityPeriod, DutyAssignment } from '@/types';

    interface ScheduleResult {
      duties: DutyAssignment[];
      stats: Record<string, { primary: number; secondary: number; weekend: number }>;
    }

    interface ScheduleOptions {
      pairReturnerWithNew?: boolean;
      excludeDates?: Date[];
    }

    export function generateSchedule(
      parapros: ParaPro[],
      unavailability: UnavailabilityPeriod[],
      startDate: Date,
      endDate: Date,
      options: ScheduleOptions = {}
    ): ScheduleResult {
      const duties: DutyAssignment[] = [];
      const stats: Record<string, { primary: number; secondary: number; weekend: number }> = {};
      const lastAssignmentDate: Record<string, Date> = {};
      const maxUnavailabilityDays = 14;

      // Initialize stats for all ParaPros
      parapros.forEach(p => {
        stats[p.id] = { primary: 0, secondary: 0, weekend: 0 };
        lastAssignmentDate[p.id] = new Date(0);
      });

      const isParaproAvailable = (paraproId: string, date: Date) => {
        // Check no-duty dates
        if (options.excludeDates?.some(excludeDate => 
          isSameDay(new Date(excludeDate), date)
        )) {
          return false;
        }

        // Check unavailability periods
        const isUnavailable = unavailability
          .filter(u => u.paraproId === paraproId)
          .some(u => isSameDay(new Date(u.startDate), date));

        // Check if assigned the previous day
        const lastAssignment = lastAssignmentDate[paraproId];
        const isConsecutive = isSameDay(addDays(lastAssignment, 1), date);

        return !isUnavailable && !isConsecutive;
      };

      // Get all dates excluding no-duty dates
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      const dates = allDates.filter(date => 
        !options.excludeDates?.some(excludeDate => 
          isSameDay(new Date(excludeDate), date)
        )
      );

      // Helper function to get total duties and specific duty type count
      const getDutyStats = (paraproId: string, dutyType: 'primary' | 'secondary') => {
        const paraproStats = stats[paraproId];
        return {
          total: paraproStats.primary + paraproStats.secondary,
          typeCount: dutyType === 'primary' ? paraproStats.primary : paraproStats.secondary
        };
      };

      // Helper function to get available ParaPros sorted by duty count
      const getAvailableParaPros = (date: Date, dutyType: 'primary' | 'secondary', excludeId?: string) => {
        return parapros
          .filter(p => p.id !== excludeId && isParaproAvailable(p.id, date))
          .sort((a, b) => {
            const statsA = getDutyStats(a.id, dutyType);
            const statsB = getDutyStats(b.id, dutyType);
            
            // First prioritize by specific duty type count
            if (statsA.typeCount !== statsB.typeCount) {
              return statsA.typeCount - statsB.typeCount;
            }
            
            // Then by total duties
            if (statsA.total !== statsB.total) {
              return statsA.total - statsB.total;
            }

            // Finally by last assignment date
            return lastAssignmentDate[a.id].getTime() - lastAssignmentDate[b.id].getTime();
          });
      };

      // Calculate the dynamic minimum duty target
      const totalDutyShifts = dates.length;
      const targetMinDuties = Math.round(totalDutyShifts / (parapros.length / 2));

      // Find the first Friday and Saturday
      let firstFriday: Date | null = null;
      let firstSaturday: Date | null = null;

      for (const date of dates) {
        if (isFriday(date) && !firstFriday) {
          firstFriday = date;
        } else if (isSaturday(date) && !firstSaturday) {
          firstSaturday = date;
        }
        if (firstFriday && firstSaturday) break;
      }

      // Generate schedule for each day
      dates.forEach((date, index) => {
        let primary: ParaPro | undefined;
        let secondary: ParaPro | undefined;

        // Prioritize returners for the first Friday and Saturday
        if (firstFriday && isSameDay(date, firstFriday) || (firstSaturday && isSameDay(date, firstSaturday))) {
          const availableReturners = getAvailableParaPros(date, 'primary')
            .filter(p => p.type === 'returner');
          const availableNew = getAvailableParaPros(date, 'secondary')
            .filter(p => p.type === 'new');

          if (availableReturners.length > 0 && availableNew.length > 0) {
            // 70/30 balance for primary
            if (Math.random() < 0.7) {
              primary = availableReturners[0];
              const availableSecondary = getAvailableParaPros(date, 'secondary', primary.id).filter(p => p.type === 'new');
              secondary = availableSecondary[0] || availableNew[0];
            } else {
              primary = availableNew[0];
              const availableSecondary = getAvailableParaPros(date, 'secondary', primary.id).filter(p => p.type === 'returner');
              secondary = availableSecondary[0] || availableReturners[0];
            }
          }
        }

        // Prioritize returners for the first 10 days
        const isWithinFirstTenDays = index < 10;
        if (!primary && isWithinFirstTenDays) {
          const availableReturners = getAvailableParaPros(date, 'primary')
            .filter(p => p.type === 'returner');
          const availableNew = getAvailableParaPros(date, 'secondary')
            .filter(p => p.type === 'new');

          if (availableReturners.length > 0 && availableNew.length > 0) {
            // 70/30 balance for primary
            if (Math.random() < 0.7) {
              primary = availableReturners[0];
              const availableSecondary = getAvailableParaPros(date, 'secondary', primary.id).filter(p => p.type === 'new');
              secondary = availableSecondary[0] || availableNew[0];
            } else {
              primary = availableNew[0];
              const availableSecondary = getAvailableParaPros(date, 'secondary', primary.id).filter(p => p.type === 'returner');
              secondary = availableSecondary[0] || availableReturners[0];
            }
          }
        }

        // If pairing wasn't possible, use standard assignment
        if (!primary || !secondary) {
          const availableForPrimary = getAvailableParaPros(date, 'primary');
          if (availableForPrimary.length > 0) {
            primary = availableForPrimary[0];
            const availableForSecondary = getAvailableParaPros(date, 'secondary', primary.id);
            if (availableForSecondary.length > 0) {
              secondary = availableForSecondary[0];
            }
          }
        }

        if (primary && secondary) {
          // Update stats and last assignment dates
          stats[primary.id].primary++;
          stats[secondary.id].secondary++;
          lastAssignmentDate[primary.id] = date;
          lastAssignmentDate[secondary.id] = date;

          if (isFriday(date) || isSaturday(date)) {
            stats[primary.id].weekend++;
            stats[secondary.id].weekend++;
          }

          duties.push({
            id: `duty-${index + 1}`,
            date,
            primaryParaproId: primary.id,
            secondaryParaproId: secondary.id,
          });
        }
      });

      return { duties, stats };
    }
