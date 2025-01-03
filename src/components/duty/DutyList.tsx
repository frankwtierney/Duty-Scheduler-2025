import { useState, useEffect } from 'react';
import { DutyAssignment } from '@/types';
import { DutyCalendarView } from './DutyCalendarView';
import { DutyTableView } from './DutyTableView';
import { useStore } from '@/lib/store';

interface DutyListProps {
  view: 'list' | 'calendar';
}

export function DutyList({ view }: DutyListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { schedules, activeScheduleId } = useStore();

  const activeSchedule = schedules.find(s => s.id === activeScheduleId);
  const duties = activeSchedule?.duties || [];

  useEffect(() => {
    // Simulate loading state for smoother transitions
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [view, activeScheduleId]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!activeSchedule) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-gray-500">No active schedule. Generate a schedule to view duties.</p>
      </div>
    );
  }

  return view === 'calendar' ? (
    <DutyCalendarView duties={duties} />
  ) : (
    <DutyTableView duties={duties} />
  );
}
