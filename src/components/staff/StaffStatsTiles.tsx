import { ParaPro, Schedule } from '@/types';
    import { isFriday, isSaturday } from 'date-fns';

    interface StaffStatsTilesProps {
      parapros: ParaPro[];
      activeSchedule: Schedule;
    }

    export function StaffStatsTiles({ parapros, activeSchedule }: StaffStatsTilesProps) {
      return (
        <div className="grid gap-4 p-6 pt-0 sm:grid-cols-2 lg:grid-cols-3">
          {parapros.map((parapro) => {
            const stats = activeSchedule.stats[parapro.id] || { primary: 0, secondary: 0, weekend: 0 };
            const total = stats.primary + stats.secondary;

            return (
              <div
                key={parapro.id}
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{parapro.name}</h4>
                  <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    parapro.type === 'returner' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {parapro.type === 'returner' ? 'R' : 'N'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center">
                  <dl className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <dt className="text-sm text-gray-500">Primary</dt>
                      <dd className="text-lg font-semibold text-blue-600">{stats.primary}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Secondary</dt>
                      <dd className="text-lg font-semibold text-amber-600">{stats.secondary}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Weekends</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.weekend}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Total</dt>
                      <dd className="text-xl font-bold text-gray-900">{total}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
