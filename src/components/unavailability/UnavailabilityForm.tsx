import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';

const unavailabilitySchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type UnavailabilityFormData = z.infer<typeof unavailabilitySchema>;

interface UnavailabilityFormProps {
  userId: string;
}

export function UnavailabilityForm({ userId }: UnavailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const addUnavailability = useStore(state => state.addUnavailability);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnavailabilityFormData>({
    resolver: zodResolver(unavailabilitySchema),
  });

  const onSubmit = async (data: UnavailabilityFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      addUnavailability({
        paraproId: userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason || '',
      });
      
      reset();
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting unavailability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          {...register('startDate')}
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason (Optional)
        </label>
        <textarea
          {...register('reason')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {submitSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">Unavailability period submitted successfully!</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Unavailability'}
      </Button>
    </form>
  );
}
