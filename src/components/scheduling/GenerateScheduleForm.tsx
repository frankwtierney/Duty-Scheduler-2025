import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { DutyScheduler } from '@/lib/scheduling/scheduler';
import { saveSchedule } from '@/lib/scheduling/utils';
import { format } from 'date-fns';

const scheduleFormSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

export function GenerateScheduleForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
  });

  const onSubmit = async (data: ScheduleFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const scheduler = new DutyScheduler();
      const result = await scheduler.generateSchedule({
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        requiredDutiesPerNight: 2,
      });

      if (!result.success) {
        setError(result.errors?.join('\n') || 'Failed to generate schedule');
        return;
      }

      await saveSchedule(result);
    } catch (err) {
      setError('An error occurred while generating the schedule');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            {...register('startDate')}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            {...register('endDate')}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating Schedule...' : 'Generate Schedule'}
      </Button>
    </form>
  );
}
