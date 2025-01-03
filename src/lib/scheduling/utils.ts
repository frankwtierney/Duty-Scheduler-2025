import { addDays, differenceInDays, isWithinInterval, isSameDay } from 'date-fns';
import { UnavailabilityPeriod } from '@/types';

export function validateSchedulingPeriod(startDate: Date, endDate: Date): string | null {
  if (endDate < startDate) {
    return 'End date must be after start date';
  }

  const daysDifference = differenceInDays(endDate, startDate);
  if (daysDifference > 180) { // 6 months maximum
    return 'Scheduling period cannot exceed 6 months';
  }

  return null;
}

export function isParaproAvailable(
  paraproId: string,
  date: Date,
  unavailability: UnavailabilityPeriod[]
): boolean {
  return !unavailability
    .filter(u => u.paraproId === paraproId)
    .some(u => isWithinInterval(date, {
      start: new Date(u.startDate),
      end: new Date(u.endDate)
    }));
}
