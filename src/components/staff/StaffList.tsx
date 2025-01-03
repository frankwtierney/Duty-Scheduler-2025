import { useState } from 'react';
import { ParaPro } from '@/types';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { UnavailabilityForm } from '../unavailability/UnavailabilityForm';

export function StaffList() {
  const [showUnavailability, setShowUnavailability] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Get parapros and addParaPro from store
  const parapros = useStore(state => state.parapros);
  const addParaPro = useStore(state => state.addParaPro);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (name && email) {
      addParaPro({ name, email });
      setShowAddForm(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {showAddForm ? 'Cancel' : 'Add ParaPro'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" size="sm">
              Add ParaPro
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {parapros.map(person => (
              <tr key={person.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {person.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {person.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnavailability(
                      showUnavailability === person.id ? null : person.id
                    )}
                  >
                    {showUnavailability === person.id ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Unavailability
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        View Unavailability
                      </>
                    )}
                  </Button>
                </td>
                {showUnavailability === person.id && (
                  <td colSpan={3} className="px-6 py-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h4 className="mb-4 text-sm font-medium text-gray-900">
                        Manage Unavailability for {person.name}
                      </h4>
                      <UnavailabilityForm userId={person.id} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
