import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { UnavailabilityForm } from '../unavailability/UnavailabilityForm';
import { DutyList } from '../duty/DutyList';
import { Calendar, ClipboardList } from 'lucide-react';
import { Button } from '../ui/Button';

export function ParaproDashboard() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
        <div className="flex space-x-2">
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setView('calendar')}
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Submit Unavailability</h3>
          <div className="mt-4">
            <UnavailabilityForm userId={user?.id} />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Your Duties</h3>
          <div className="mt-4">
            <DutyList userId={user?.id} view={view} />
          </div>
        </div>
      </div>
    </div>
  );
}
