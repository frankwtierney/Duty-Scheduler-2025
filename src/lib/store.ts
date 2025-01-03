import { create } from 'zustand';
    import { ParaPro, UnavailabilityPeriod, Schedule, SemesterSettings, DutyAssignment } from '@/types';
    import { generateSchedule } from './scheduling/scheduler';
    import { isSameDay, isFriday, isSaturday } from 'date-fns';

    interface State {
      parapros: ParaPro[];
      unavailability: UnavailabilityPeriod[];
      schedules: Schedule[];
      activeScheduleId: string | null;
      semesterSettings: SemesterSettings;
      addParaPro: (parapro: Omit<ParaPro, 'id' | 'order'>) => void;
      updateParaPro: (id: string, updates: Partial<Omit<ParaPro, 'id' | 'order'>>) => void;
      deleteParaPro: (id: string) => void;
      reorderParaPros: (newOrder: ParaPro[]) => void;
      addUnavailability: (period: Omit<UnavailabilityPeriod, 'id'>) => void;
      removeUnavailability: (id: string) => void;
      createSchedule: (name: string, startDate: Date, endDate: Date, options?: { pairReturnerWithNew?: boolean }) => void;
      updateSchedule: (id: string, updates: Partial<Schedule>) => void;
      updateDuty: (id: string, updates: Partial<Omit<DutyAssignment, 'id' | 'date'>>) => void;
      archiveSchedule: (id: string) => void;
      setActiveSchedule: (id: string | null) => void;
      setSemesterDates: (startDate: Date | null, endDate: Date | null) => void;
      toggleNoDutyDate: (date: Date) => void;
      clearNoDutyDates: () => void;
      resetSemesterSettings: () => void;
      regenerateActiveSchedule: () => void;
    }

    export const useStore = create<State>((set, get) => ({
      parapros: [],
      unavailability: [],
      schedules: [],
      activeScheduleId: null,
      semesterSettings: {
        startDate: null,
        endDate: null,
        noDutyDates: [],
      },

      addParaPro: (parapro) => set((state) => ({
        parapros: [
          ...state.parapros,
          {
            ...parapro,
            id: `parapro-${state.parapros.length + 1}`,
            order: state.parapros.length,
          },
        ],
      })),

      updateParaPro: (id, updates) => set((state) => ({
        parapros: state.parapros.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

      deleteParaPro: (id) => set((state) => ({
        parapros: state.parapros.filter((p) => p.id !== id),
        unavailability: state.unavailability.filter((u) => u.paraproId !== id),
      })),

      reorderParaPros: (newOrder) => set(() => ({
        parapros: newOrder.map((p, index) => ({ ...p, order: index })),
      })),

      addUnavailability: (period) => {
        const state = get();
        const newUnavailability = [
          ...state.unavailability,
          {
            ...period,
            id: `unavail-${state.unavailability.length + 1}`,
          },
        ];
        
        set({ unavailability: newUnavailability });
      },

      removeUnavailability: (id) => {
        const state = get();
        const newUnavailability = state.unavailability.filter((u) => u.id !== id);
        
        set({ unavailability: newUnavailability });
      },

      createSchedule: (name, startDate, endDate, options) => set((state) => {
        const scheduleStartDate = state.semesterSettings.startDate || startDate;
        const scheduleEndDate = state.semesterSettings.endDate || endDate;

        if (!scheduleStartDate || !scheduleEndDate) {
          throw new Error('Start and end dates are required');
        }

        const { duties, stats } = generateSchedule(
          state.parapros,
          state.unavailability,
          scheduleStartDate,
          scheduleEndDate,
          {
            ...options,
            excludeDates: state.semesterSettings.noDutyDates,
          }
        );

        const newSchedule: Schedule = {
          id: `schedule-${state.schedules.length + 1}`,
          name,
          startDate: scheduleStartDate,
          endDate: scheduleEndDate,
          duties,
          stats,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          schedules: [...state.schedules, newSchedule],
          activeScheduleId: newSchedule.id,
        };
      }),

      updateSchedule: (id, updates) => set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
        ),
      })),

      updateDuty: (id, updates) => set((state) => {
        const activeSchedule = state.schedules.find(s => s.id === state.activeScheduleId);
        if (!activeSchedule) return state;

        const updatedDuties = activeSchedule.duties.map(duty =>
          duty.id === id ? { ...duty, ...updates } : duty
        );

        // Recalculate stats
        const stats = state.parapros.reduce((acc, parapro) => {
          acc[parapro.id] = {
            primary: updatedDuties.filter(d => d.primaryParaproId === parapro.id).length,
            secondary: updatedDuties.filter(d => d.secondaryParaproId === parapro.id).length,
            weekend: updatedDuties.filter(d => (isFriday(new Date(d.date)) || isSaturday(new Date(d.date))) && (d.primaryParaproId === parapro.id || d.secondaryParaproId === parapro.id)).length,
          };
          return acc;
        }, {} as Record<string, { primary: number; secondary: number; weekend: number }>);

        return {
          schedules: state.schedules.map(schedule =>
            schedule.id === state.activeScheduleId
              ? {
                  ...schedule,
                  duties: updatedDuties,
                  stats,
                  updatedAt: new Date(),
                }
              : schedule
          ),
        };
      }),

      archiveSchedule: (id) => set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === id ? { ...s, isArchived: true, updatedAt: new Date() } : s
        ),
      })),

      setActiveSchedule: (id) => set(() => ({
        activeScheduleId: id,
      })),

      setSemesterDates: (startDate, endDate) => set((state) => ({
        semesterSettings: {
          ...state.semesterSettings,
          startDate,
          endDate,
        },
      })),

      toggleNoDutyDate: (date) => {
        const state = get();
        const existingIndex = state.semesterSettings.noDutyDates.findIndex(
          (d) => d.getTime() === date.getTime()
        );

        const noDutyDates = existingIndex >= 0
          ? state.semesterSettings.noDutyDates.filter((_, i) => i !== existingIndex)
          : [...state.semesterSettings.noDutyDates, date];

        set({
          semesterSettings: {
            ...state.semesterSettings,
            noDutyDates,
          },
        });
      },

      clearNoDutyDates: () => {
        const state = get();
        set({
          semesterSettings: {
            ...state.semesterSettings,
            noDutyDates: [],
          },
        });
      },

      resetSemesterSettings: () => {
        set({
          semesterSettings: {
            startDate: null,
            endDate: null,
            noDutyDates: [],
          },
        });
      },

      regenerateActiveSchedule: () => {
        const state = get();
        const activeSchedule = state.schedules.find(s => s.id === state.activeScheduleId);
        
        if (!activeSchedule) return;

        const { duties, stats } = generateSchedule(
          state.parapros,
          state.unavailability,
          new Date(activeSchedule.startDate),
          new Date(activeSchedule.endDate),
          {
            excludeDates: state.semesterSettings.noDutyDates,
          }
        );

        set({
          schedules: state.schedules.map(s =>
            s.id === state.activeScheduleId
              ? { ...s, duties, stats, updatedAt: new Date() }
              : s
          ),
        });
      },
    }));
