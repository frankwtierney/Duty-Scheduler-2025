import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Calendar, ClipboardList, Users } from 'lucide-react';
import { StaffList } from '../staff/StaffList';
import { DutyList } from '../duty/DutyList';
import { GenerateScheduleForm } from '../scheduling/GenerateScheduleForm';

export function AdminDashboard() {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="flex items-center text-lg font-semibold text-gray-900">
              <Users className="mr-2 h-5 w-5" />
              Staff Management
            </h3>
            <div className="mt-4">
              <StaffList />
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Generate Schedule
            </h3>
            <div className="mt-4">
              <GenerateScheduleForm />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">Duty Schedule</h3>
        <div className="mt-4">
          <DutyList view={view} />
        </div>
      </div>
    </div>
  );
}
