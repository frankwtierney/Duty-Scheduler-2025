import { useState } from 'react';
    import { DutyAssignment, ParaPro } from '@/types';
    import { format, isSameDay } from 'date-fns';
    import { Button } from '@/components/ui/Button';
    import { X, Download } from 'lucide-react';
    import { useStore } from '@/lib/store';
    import { saveAs } from 'file-saver';
    import JSZip from 'jszip';

    interface ParaProDutyListProps {
      paraproId: string | null;
      duties: DutyAssignment[];
      onClose: () => void;
    }

    export function ParaProDutyList({ paraproId, duties, onClose }: ParaProDutyListProps) {
      const parapros = useStore(state => state.parapros);
      const parapro = parapros.find(p => p.id === paraproId);

      const exportAllToCsv = async () => {
        const zip = new JSZip();

        for (const parapro of parapros) {
          const filteredDuties = duties.filter(duty =>
            duty.primaryParaproId === parapro.id || duty.secondaryParaproId === parapro.id
          ).sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });

          const headers = ['Date', 'Role'];
          const rows = filteredDuties.map(duty => [
            format(new Date(duty.date), 'MM/dd/yyyy'),
            duty.primaryParaproId === parapro.id ? 'Primary' : 'Secondary',
          ]);

          const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
          zip.file(`${parapro.name}-duty-schedule.csv`, csv);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `all-parapro-schedules-${format(new Date(), 'yyyy-MM-dd')}.zip`);
      };

      const exportToCsv = () => {
        if (!parapro) return;

        const filteredDuties = duties.filter(duty =>
          duty.primaryParaproId === paraproId || duty.secondaryParaproId === paraproId
        ).sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        const headers = ['Date', 'Role'];
        const rows = filteredDuties.map(duty => [
          format(new Date(duty.date), 'MM/dd/yyyy'),
          duty.primaryParaproId === paraproId ? 'Primary' : 'Secondary',
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${parapro.name}-duty-schedule-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {parapro ? `Duty Schedule for ${parapro.name}` : 'Duty Schedule'}
            </h3>
            <div className="flex space-x-2">
              {parapro && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCsv}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportAllToCsv}
              >
                <Download className="h-4 w-4" />
                Export All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {parapro ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {duties.filter(duty =>
                    duty.primaryParaproId === paraproId || duty.secondaryParaproId === paraproId
                  ).sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                    return dateA.getTime() - dateB.getTime();
                  }).map(duty => {
                    const dutyDate = duty.date instanceof Date ? duty.date : new Date(duty.date);
                    const role = duty.primaryParaproId === paraproId ? 'Primary' : 'Secondary';

                    return (
                      <tr key={duty.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {format(dutyDate, 'MMMM d, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {role}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No duties assigned to this ParaPro.</p>
          )}
        </div>
      );
    }
