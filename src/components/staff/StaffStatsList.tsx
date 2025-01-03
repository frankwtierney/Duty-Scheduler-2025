import { ParaPro, Schedule } from '@/types';
    import { isFriday, isSaturday } from 'date-fns';

    interface StaffStatsListProps {
      parapros: ParaPro[];
      activeSchedule: Schedule;
    }

    export function StaffStatsList({ parapros, activeSchedule }: StaffStatsListProps) {
      return (
        <div className="p-6 pt-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Primary
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Secondary
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Weekends
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {parapros.map((parapro) => {
                const stats = activeSchedule.stats[parapro.id] || { primary: 0, secondary: 0, weekend: 0 };
                const total = stats.primary + stats.secondary;

                return (
                  <tr key={parapro.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {parapro.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-center text-blue-600">
                      {stats.primary}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-center text-amber-600">
                      {stats.secondary}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-center text-gray-900">
                      {stats.weekend}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-center text-gray-900">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
