import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/Calendar';
import { UnavailabilityPeriod } from '@/types';

export function AvailabilityPage() {
  const { parapros, unavailability, addUnavailability, removeUnavailability } = useStore();
  const [selectedParaPro, setSelectedParaPro] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [expandedParaPro, setExpandedParaPro] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const getParaproUnavailability = (paraproId: string): UnavailabilityPeriod[] => {
    return unavailability
      .filter((u) => u.paraproId === paraproId)
      .map(period => ({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
    }
  };

  const handleSubmit = () => {
    if (!selectedParaPro || selectedDates.length === 0) return;

    selectedDates.forEach(date => {
      addUnavailability({
        paraproId: selectedParaPro,
        startDate: date,
        endDate: date,
      });
    });

    setSelectedDates([]);
    setShowCalendar(false);
  };

  const toggleParaPro = (paraproId: string) => {
    setExpandedParaPro(current => current === paraproId ? null : paraproId);
    setSelectedParaPro(paraproId);
    setShowCalendar(true);
    setSelectedDates([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Availability Management</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ParaPro List */}
        <div className="space-y-4">
          {parapros.map((parapro) => {
            const unavailableDates = getParaproUnavailability(parapro.id);
            const isExpanded = expandedParaPro === parapro.id;

            return (
              <div
                key={parapro.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleParaPro(parapro.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{parapro.name}</h3>
                    <p className="text-sm text-gray-500">
                      {unavailableDates.length} unavailable {unavailableDates.length === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    {unavailableDates.length > 0 ? (
                      <ul className="space-y-2">
                        {unavailableDates.map((date) => (
                          <li
                            key={date.id}
                            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                          >
                            <span className="text-sm text-gray-700">
                              {format(date.startDate, 'MMMM d, yyyy')}
                            </span>
                            <button
                              onClick={() => removeUnavailability(date.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No unavailable dates</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar View */}
        {showCalendar && selectedParaPro && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Select Dates for {parapros.find(p => p.id === selectedParaPro)?.name}
              </h3>
              <p className="text-sm text-gray-500">Click dates to select/deselect them</p>
            </div>

            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />

            {selectedDates.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="rounded-md bg-blue-50 p-4">
                  <h4 className="text-sm font-medium text-blue-800">Selected Dates:</h4>
                  <ul className="mt-2 space-y-1">
                    {selectedDates.map((date, index) => (
                      <li key={index} className="text-sm text-blue-700">
                        {format(date, 'MMMM d, yyyy')}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add {selectedDates.length} {selectedDates.length === 1 ? 'Date' : 'Dates'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
