import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

interface CalendarProps {
  mode?: 'single' | 'multiple';
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  className?: string;
  modifiers?: {
    disabled?: (date: Date) => boolean;
    selected?: (date: Date) => boolean;
  };
  modifiersStyles?: {
    disabled?: React.CSSProperties;
    selected?: React.CSSProperties;
  };
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  className,
  modifiers,
  modifiersStyles,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all dates to display in the calendar grid
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

  const handleDateClick = (date: Date) => {
    if (!onSelect) return;
    if (modifiers?.disabled?.(date)) return;

    if (mode === 'single') {
      onSelect(date);
    } else if (mode === 'multiple') {
      const selectedDates = Array.isArray(selected) ? selected : [];
      const dateExists = selectedDates.some(d => isSameDay(d, date));
      
      if (dateExists) {
        onSelect(selectedDates.filter(d => !isSameDay(d, date)));
      } else {
        onSelect([...selectedDates, date]);
      }
    }
  };

  const isSelected = (date: Date) => {
    if (modifiers?.selected) {
      return modifiers.selected(date);
    }
    if (!selected) return false;
    if (Array.isArray(selected)) {
      return selected.some(d => isSameDay(d, date));
    }
    return isSameDay(selected, date);
  };

  return (
    <div className={cn('p-3', className)}>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isDisabled = modifiers?.disabled?.(date) ?? false;
          const isDateSelected = isSelected(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={cn(
                'h-8 w-full rounded-md text-sm',
                'hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDateSelected && !isDisabled && 'bg-blue-600 text-white hover:bg-blue-700',
                !isCurrentMonth && 'text-gray-300',
                isDisabled && 'cursor-not-allowed opacity-50',
                modifiersStyles?.selected && isDateSelected && modifiersStyles.selected,
                modifiersStyles?.disabled && isDisabled && modifiersStyles.disabled,
              )}
              disabled={isDisabled}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
