import { useState, useEffect } from 'react';
    import { useStore } from '@/lib/store';
    import { Button } from '@/components/ui/Button';
    import { Calendar } from '@/components/ui/Calendar';
    import { format, isWithinInterval, isSameDay, parseISO, setMonth, getYear } from 'date-fns';
    import { Calendar as CalendarIcon, Trash2, RotateCcw, Check } from 'lucide-react';

    export function SemesterPage() {
      const {
        semesterSettings,
        setSemesterDates,
        toggleNoDutyDate,
        clearNoDutyDates,
        resetSemesterSettings,
      } = useStore();

      const [semesterType, setSemesterType] = useState<'FALL' | 'SPRING'>('FALL');
      const [startDate, setStartDate] = useState(
        semesterSettings.startDate ? format(new Date(semesterSettings.startDate), 'yyyy-MM-dd') : ''
      );
      const [endDate, setEndDate] = useState(
        semesterSettings.endDate ? format(new Date(semesterSettings.endDate), 'yyyy-MM-dd') : ''
      );
      const [showSuccess, setShowSuccess] = useState(false);

      useEffect(() => {
        const currentYear = getYear(new Date());
        if (semesterType === 'FALL') {
          setStartDate(format(setMonth(new Date(currentYear, 7), 7), 'yyyy-MM-dd'));
          setEndDate(format(setMonth(new Date(currentYear, 11), 11), 'yyyy-MM-dd'));
        } else if (semesterType === 'SPRING') {
          setStartDate(format(setMonth(new Date(currentYear, 0), 0), 'yyyy-MM-dd'));
          setEndDate(format(setMonth(new Date(currentYear, 4), 4), 'yyyy-MM-dd'));
        }
      }, [semesterType]);

      const handleSaveDates = () => {
        setSemesterDates(
          startDate ? parseISO(startDate) : null,
          endDate ? parseISO(endDate) : null
        );
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      };

      const handleReset = () => {
        setStartDate('');
        setEndDate('');
        resetSemesterSettings();
      };

      const isDateWithinSemester = (date: Date) => {
        if (!semesterSettings.startDate || !semesterSettings.endDate) return true;
        return isWithinInterval(date, {
          start: new Date(semesterSettings.startDate),
          end: new Date(semesterSettings.endDate),
        });
      };

      const isDateSelected = (date: Date) =>
        semesterSettings.noDutyDates.some(d => isSameDay(new Date(d), date));

      const sortedNoDutyDates = [...semesterSettings.noDutyDates]
        .map(date => new Date(date))
        .sort((a, b) => a.getTime() - b.getTime());

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Semester Setup</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All Settings
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Semester Date Configuration */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Semester Dates</h3>
              <div className="mb-4">
                <label htmlFor="semesterType" className="block text-sm font-medium text-gray-700">
                  Semester Type
                </label>
                <select
                  id="semesterType"
                  value={semesterType}
                  onChange={(e) => setSemesterType(e.target.value as 'FALL' | 'SPRING')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="FALL">Fall</option>
                  <option value="SPRING">Spring</option>
                </select>
              </div>
              <div className="grid gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <Button 
                  onClick={handleSaveDates} 
                  disabled={!startDate || !endDate}
                  className="bg-[#74aa50] hover:bg-[#5f8a41]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Save Semester Dates
                </Button>

                {showSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <Check className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Semester dates saved successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {semesterSettings.startDate && semesterSettings.endDate && (
                  <div className="rounded-md bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">
                      Current semester period: {' '}
                      <span className="font-medium">
                        {format(new Date(semesterSettings.startDate), 'MMMM d, yyyy')}
                      </span>
                      {' '} to {' '}
                      <span className="font-medium">
                        {format(new Date(semesterSettings.endDate), 'MMMM d, yyyy')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* No-Duty Date Selection */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">No-Duty Dates</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearNoDutyDates}
                  disabled={semesterSettings.noDutyDates.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>

              {sortedNoDutyDates.length > 0 && (
                <div className="mb-4 rounded-md bg-blue-50 p-4">
                  <h4 className="text-sm font-medium text-blue-800">Selected Dates:</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sortedNoDutyDates.map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {format(date, 'MMM d, yyyy')}
                        <button
                          type="button"
                          onClick={() => toggleNoDutyDate(date)}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                        >
                          <span className="sr-only">Remove date</span>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Calendar
                mode="multiple"
                selected={sortedNoDutyDates}
                onSelect={(dates) => {
                  if (!Array.isArray(dates)) return;
                  const lastDate = dates[dates.length - 1];
                  if (lastDate) {
                    toggleNoDutyDate(lastDate);
                  }
                }}
                className="rounded-md border"
                modifiers={{
                  disabled: (date) => !isDateWithinSemester(date),
                  selected: (date) => isDateSelected(date),
                }}
                modifiersStyles={{
                  disabled: { opacity: 0.5 },
                  selected: { backgroundColor: '#1e40af', color: 'white' },
                }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Instructions</h3>
            <div className="prose prose-sm max-w-none text-gray-500">
              <ul className="list-inside list-disc space-y-2">
                <li>Set the semester start and end dates to define the duty scheduling period</li>
                <li>Click dates in the calendar to toggle them as no-duty dates</li>
                <li>Selected no-duty dates will be automatically excluded from duty scheduling</li>
                <li>Use the clear button to remove all selected no-duty dates</li>
                <li>All changes are automatically saved and will persist across sessions</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
