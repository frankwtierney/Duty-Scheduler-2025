import { useState } from 'react';
    import { DutyAssignment, ParaPro } from '@/types';
    import { format } from 'date-fns';
    import { Button } from '@/components/ui/Button';
    import { Download, Pencil, X, Check, AlertCircle } from 'lucide-react';
    import { useStore } from '@/lib/store';
    import { isParaproAvailable } from '@/lib/scheduling/utils';

    interface DutyTableViewProps {
      duties: DutyAssignment[];
    }

    interface EditingDuty {
      dutyId: string;
      primaryId: string;
      secondaryId: string;
    }

    export function DutyTableView({ duties }: DutyTableViewProps) {
      const [sortConfig, setSortConfig] = useState<{
        key: keyof DutyAssignment;
        direction: 'asc' | 'desc';
      }>({ key: 'date', direction: 'asc' });

      const [editingDuty, setEditingDuty] = useState<EditingDuty | null>(null);
      const [error, setError] = useState<string | null>(null);

      const parapros = useStore(state => state.parapros);
      const unavailability = useStore(state => state.unavailability);
      const updateDuty = useStore(state => state.updateDuty);

      const getParaproInfo = (id: string) => {
        const parapro = parapros.find(p => p.id === id);
        return {
          name: parapro?.name || 'Unknown ParaPro',
          type: parapro?.type || 'new'
        };
      };

      const sortedDuties = [...duties].sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return sortConfig.direction === 'asc'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
        return 0;
      });

      const handleSort = (key: keyof DutyAssignment) => {
        setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
      };

      const exportToCsv = () => {
        const headers = ['Date', 'Primary ParaPro', 'Secondary ParaPro'];
        const rows = sortedDuties.map(duty => [
          format(new Date(duty.date), 'MM/dd/yyyy'),
          getParaproInfo(duty.primaryParaproId).name,
          getParaproInfo(duty.secondaryParaproId).name,
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `duty-schedule-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const handleEdit = (duty: DutyAssignment) => {
        setEditingDuty({
          dutyId: duty.id,
          primaryId: duty.primaryParaproId,
          secondaryId: duty.secondaryParaproId,
        });
        setError(null);
      };

      const handleCancel = () => {
        setEditingDuty(null);
        setError(null);
      };

      const handleSave = (duty: DutyAssignment) => {
        if (!editingDuty) return;

        // Validate selections
        if (editingDuty.primaryId === editingDuty.secondaryId) {
          setError('Cannot assign the same ParaPro to both Primary and Secondary roles');
          return;
        }

        const dutyDate = new Date(duty.date);
        const primaryAvailable = isParaproAvailable(editingDuty.primaryId, dutyDate, unavailability);
        const secondaryAvailable = isParaproAvailable(editingDuty.secondaryId, dutyDate, unavailability);

        if (!primaryAvailable) {
          setError('Selected Primary ParaPro is not available on this date');
          return;
        }

        if (!secondaryAvailable) {
          setError('Selected Secondary ParaPro is not available on this date');
          return;
        }

        // Update the duty
        updateDuty(duty.id, {
          primaryParaproId: editingDuty.primaryId,
          secondaryParaproId: editingDuty.secondaryId,
          isOverridden: true,
        });

        setEditingDuty(null);
        setError(null);
      };

      const getAvailableParapros = (date: Date, currentPrimary: string, currentSecondary: string) => {
        return parapros.filter(parapro => {
          if (editingDuty?.primaryId === currentPrimary && parapro.id === currentSecondary) return false;
          if (editingDuty?.secondaryId === currentSecondary && parapro.id === currentPrimary) return false;
          return isParaproAvailable(parapro.id, date, unavailability);
        });
      };

      return (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportToCsv} size="sm" className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Primary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Secondary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedDuties.map(duty => {
                  const isEditing = editingDuty?.dutyId === duty.id;
                  const primary = getParaproInfo(duty.primaryParaproId);
                  const secondary = getParaproInfo(duty.secondaryParaproId);
                  const dutyDate = new Date(duty.date);
                  const availableParapros = getAvailableParapros(
                    dutyDate,
                    duty.primaryParaproId,
                    duty.secondaryParaproId
                  );

                  return (
                    <tr key={duty.id} className={isEditing ? 'bg-blue-50' : undefined}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {format(dutyDate, 'MMMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {isEditing ? (
                          <div className="mb-1">
                            <p className="text-sm text-gray-500">
                              Current: {primary.name} ({primary.type === 'returner' ? 'R' : 'N'})
                            </p>
                            <select
                              value={editingDuty.primaryId}
                              onChange={(e) => setEditingDuty({
                                ...editingDuty,
                                primaryId: e.target.value,
                              })}
                              className="rounded-md border-gray-300 text-sm"
                            >
                              <option value="">Select ParaPro</option>
                              {availableParapros.map(parapro => (
                                <option key={parapro.id} value={parapro.id}>
                                  {parapro.name} ({parapro.type === 'returner' ? 'R' : 'N'})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{primary.name}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              primary.type === 'returner' 
                                ? 'bg-blue-100 text-blue-900' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {primary.type === 'returner' ? 'R' : 'N'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {isEditing ? (
                          <div className="mb-1">
                            <p className="text-sm text-gray-500">
                              Current: {secondary.name} ({secondary.type === 'returner' ? 'R' : 'N'})
                            </p>
                            <select
                              value={editingDuty.secondaryId}
                              onChange={(e) => setEditingDuty({
                                ...editingDuty,
                                secondaryId: e.target.value,
                              })}
                              className="rounded-md border-gray-300 text-sm"
                            >
                              <option value="">Select ParaPro</option>
                              {availableParapros.map(parapro => (
                                <option key={parapro.id} value={parapro.id}>
                                  {parapro.name} ({parapro.type === 'returner' ? 'R' : 'N'})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{secondary.name}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              secondary.type === 'returner' 
                                ? 'bg-blue-100 text-blue-900' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {secondary.type === 'returner' ? 'R' : 'N'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSave(duty)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(duty)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
