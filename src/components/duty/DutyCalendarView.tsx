import { useState } from 'react';
    import { DutyAssignment } from '@/types';
    import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
    import { ChevronLeft, ChevronRight } from 'lucide-react';
    import { Button } from '@/components/ui/Button';
    import { useStore } from '@/lib/store';

    interface DutyCalendarViewProps {
      duties: DutyAssignment[];
    }

    export function DutyCalendarView({ duties }: DutyCalendarViewProps) {
      const [currentDate, setCurrentDate] = useState(new Date());
      const parapros = useStore(state => state.parapros);

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

      const getParaproInfo = (id: string) => {
        const parapro = parapros.find(p => p.id === id);
        return {
          name: parapro?.name || 'Unknown ParaPro',
          type: parapro?.type || 'new'
        };
      };

      const getDutyForDate = (date: Date) => 
        duties.find(duty => {
          const dutyDate = duty.date instanceof Date ? duty.date : new Date(duty.date);
          return isSameDay(dutyDate, date);
        });

      const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
      };

      const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex space-x-2">
              <Button onClick={prevMonth} variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={nextMonth} variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="bg-gray-50 px-2 py-2 text-center text-xs font-medium uppercase text-gray-500"
              >
                {day}
              </div>
            ))}

            {calendarDays.map(date => {
              const duty = getDutyForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              
              return (
                <div
                  key={date.toISOString()}
                  className={`relative min-h-[100px] bg-white p-2 ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className={`text-sm ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {duty && isCurrentMonth && (
                    <div className="mt-1 space-y-1">
                      <div className="rounded-md bg-blue-50 p-1 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-blue-800">Primary:</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                            getParaproInfo(duty.primaryParaproId).type === 'returner' 
                              ? 'bg-blue-100 text-blue-900' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getParaproInfo(duty.primaryParaproId).type === 'returner' ? 'R' : 'N'}
                          </span>
                        </div>
                        <p className="text-blue-900">{getParaproInfo(duty.primaryParaproId).name}</p>
                      </div>
                      
                      <div className="rounded-md bg-amber-50 p-1 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-amber-800">Secondary:</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                            getParaproInfo(duty.secondaryParaproId).type === 'returner' 
                              ? 'bg-blue-100 text-blue-900' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getParaproInfo(duty.secondaryParaproId).type === 'returner' ? 'R' : 'N'}
                          </span>
                        </div>
                        <p className="text-amber-900">{getParaproInfo(duty.secondaryParaproId).name}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
