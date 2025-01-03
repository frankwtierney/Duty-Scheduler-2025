import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { CSVImport } from '@/components/staff/CSVImport';
import { DraggableStaffList } from '@/components/staff/DraggableStaffList';
import { ParaPro } from '@/types';

export function StaffPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingParaPro, setEditingParaPro] = useState<ParaPro | null>(null);
  
  const { parapros, addParaPro, updateParaPro } = useStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const type = formData.get('type') as 'returner' | 'new';

    if (name && email && type) {
      if (editingParaPro) {
        updateParaPro(editingParaPro.id, { name, email, type });
        setEditingParaPro(null);
      } else {
        addParaPro({ name, email, type });
      }
      setShowAddForm(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEdit = (id: string) => {
    const parapro = parapros.find(p => p.id === id);
    if (parapro) {
      setEditingParaPro(parapro);
      setShowAddForm(true);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingParaPro(null);
  };

  const handleImport = (newParapros: Omit<ParaPro, 'id' | 'order'>[]) => {
    newParapros.forEach(parapro => {
      addParaPro(parapro);
    });
    setShowImport(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowImport(true)}
            size="sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            size="sm"
            className="bg-[#74aa50] hover:bg-[#5f8a41]"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showAddForm ? 'Cancel' : 'Add ParaPro'}
          </Button>
        </div>
      </div>

      {showImport && (
        <CSVImport
          existingParapros={parapros}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

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
                defaultValue={editingParaPro?.name || ''}
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
                defaultValue={editingParaPro?.email || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Staff Type</label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="returner"
                  defaultChecked={editingParaPro?.type === 'returner'}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Returner</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="new"
                  defaultChecked={editingParaPro?.type === 'new'}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">New</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="bg-[#74aa50] hover:bg-[#5f8a41]"
            >
              {editingParaPro ? 'Update ParaPro' : 'Add ParaPro'}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <DraggableStaffList onEdit={handleEdit} />
      </div>
    </div>
  );
}
