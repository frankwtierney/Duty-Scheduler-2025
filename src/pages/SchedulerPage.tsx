import { useState } from 'react';
    import { useStore } from '@/lib/store';
    import { Button } from '@/components/ui/Button';
    import { Calendar as CalendarIcon, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
    import { format } from 'date-fns';
    import { Calendar } from '@/components/ui/Calendar';
    import { DutyList } from '@/components/duty/DutyList';
    import { ClipboardList, List, Grid, User } from 'lucide-react';
    import { StaffStatsList } from '@/components/staff/StaffStatsList';
    import { StaffStatsTiles } from '@/components/staff/StaffStatsTiles';
    import { ParaProDutyList } from '@/components/duty/ParaProDutyList';

    export function SchedulerPage() {
      const { schedules, activeScheduleId, parapros, createSchedule, semesterSettings, regenerateActiveSchedule, updateSchedule } = useStore();
      const [isStatsExpanded, setIsStatsExpanded] = useState(false);
      const [dutyView, setDutyView] = useState<'list' | 'calendar'>('list');
      const [statsView, setStatsView] = useState<'tiles' | 'list'>('tiles');
      const [paraproView, setParaproView] = useState<string | null>(null);
      const activeSchedule = schedules.find(s => s.id === activeScheduleId);
      const [selectedDates, setSelectedDates] = useState<Date[]>([]);
      const [scheduleName, setScheduleName] = useState('');

      const handleGenerateSchedule = () => {
        if (!semesterSettings.startDate || !semesterSettings.endDate) {
          alert('Please set semester start and end dates first.');
          return;
        }

        createSchedule(
          scheduleName || `Schedule ${format(new Date(), 'MM-dd-yyyy HH:mm')}`,
          new Date(semesterSettings.startDate),
          new Date(semesterSettings.endDate)
        );
        setScheduleName('');
      };

      const handleDateSelect = (dates: Date[] | undefined) => {
        if (dates) {
          setSelectedDates(dates);
        }
      };

      const handleSubmit = () => {
        if (!scheduleName || selectedDates.length === 0) return;

        const startDate = selectedDates[0];
        const endDate = selectedDates[selectedDates.length - 1];

        createSchedule(scheduleName, startDate, endDate);
        setSelectedDates([]);
      };

      const handleUpdateStats = () => {
        if (!activeSchedule) return;

        const stats = parapros.reduce((acc, parapro) => {
          acc[parapro.id] = {
            primary: activeSchedule.duties.filter(d => d.primaryParaproId === parapro.id).length,
            secondary: activeSchedule.duties.filter(d => d.secondaryParaproId === parapro.id).length,
            weekend: activeSchedule.duties.filter(d => (isFriday(new Date(d.date)) || isSaturday(new Date(d.date))) && (d.primaryParaproId === parapro.id || d.secondaryParaproId === parapro.id)).length,
          };
          return acc;
        }, {} as Record<string, { primary: number; secondary: number; weekend: number }>);

        updateSchedule(activeSchedule.id, { ...activeSchedule, stats });
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Scheduler</h2>
            <div className="flex space-x-2">
              <Button
                onClick={handleGenerateSchedule}
                size="sm"
                className="bg-[#74aa50] hover:bg-[#5f8a41]"
              >
                Generate Schedule
              </Button>
            </div>
          </div>

          {/* Staff Stats */}
          {activeSchedule && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  Staff Statistics
                </h3>
                <span className="ml-auto text-sm font-medium text-gray-500">
                  Total Duty Shifts: {activeSchedule.duties.length}
                </span>
                
                {isStatsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isStatsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="flex items-center justify-end p-6 pt-0">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUpdateStats}
                      className="bg-[#74aa50] hover:bg-[#5f8a41]"
                    >
                      <RotateCcw className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant={statsView === 'tiles' ? 'primary' : 'outline'}
                      onClick={() => setStatsView('tiles')}
                      size="sm"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={statsView === 'list' ? 'primary' : 'outline'}
                      onClick={() => setStatsView('list')}
                      size="sm"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {statsView === 'tiles' ? (
                  <StaffStatsTiles parapros={parapros} activeSchedule={activeSchedule} />
                ) : (
                  <StaffStatsList parapros={parapros} activeSchedule={activeSchedule} />
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Duty Schedule</h3>
              <div className="flex space-x-2">
                <Button
                  variant={dutyView === 'list' ? 'primary' : 'outline'}
                  onClick={() => setDutyView('list')}
                  size="sm"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  List View
                </Button>
                <Button
                  variant={dutyView === 'calendar' ? 'primary' : 'outline'}
                  onClick={() => setDutyView('calendar')}
                  size="sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendar View
                </Button>
                <Button
                  variant={paraproView ? 'primary' : 'outline'}
                  onClick={() => setParaproView(paraproView ? null : parapros[0]?.id || null)}
                  size="sm"
                >
                  <User className="mr-2 h-4 w-4" />
                  ParaPro View
                </Button>
              </div>
            </div>
            <div className="mt-4">
              {paraproView ? (
                <div className="space-y-4">
                  <select
                    value={paraproView}
                    onChange={(e) => setParaproView(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {parapros.map(parapro => (
                      <option key={parapro.id} value={parapro.id}>
                        {parapro.name}
                      </option>
                    ))}
                    <option value="">All ParaPros</option>
                  </select>
                  <ParaProDutyList paraproId={paraproView} duties={activeSchedule?.duties || []} onClose={() => setParaproView(null)} />
                </div>
              ) : (
                <DutyList view={dutyView} />
              )}
            </div>
          </div>
        </div>
      );
    }
