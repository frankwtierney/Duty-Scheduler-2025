import { useState } from 'react';
import { ParaPro } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pencil, GripVertical, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DeleteConfirmationProps {
  parapro: ParaPro;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ parapro, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-lg">
      <h4 className="text-lg font-medium text-gray-900">Delete {parapro.name}?</h4>
      <p className="mt-2 text-sm text-gray-500">
        This will permanently remove {parapro.name} and all their unavailability records.
        This action cannot be undone.
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
          onClick={onConfirm}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

interface SortableRowProps {
  parapro: ParaPro;
  onEdit: (id: string) => void;
  onDelete: (parapro: ParaPro) => void;
}

interface DraggableStaffListProps {
  onEdit: (id: string) => void;
}

function SortableRow({ parapro, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: parapro.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'bg-gray-50' : 'bg-white'}`}
    >
      <td className="w-4 px-6 py-4">
        <button
          className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
        {parapro.name}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {parapro.email}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
          parapro.type === 'returner' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {parapro.type === 'returner' ? 'Returner' : 'New'}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(parapro.id)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(parapro)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function DraggableStaffList({ onEdit }: DraggableStaffListProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<ParaPro | null>(null);
  const parapros = useStore(state => state.parapros);
  const reorderParaPros = useStore(state => state.reorderParaPros);
  const deleteParaPro = useStore(state => state.deleteParaPro);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = parapros.findIndex((p) => p.id === active.id);
      const newIndex = parapros.findIndex((p) => p.id === over.id);
      
      const newOrder = arrayMove(parapros, oldIndex, newIndex);
      reorderParaPros(newOrder);
    }
  };

  const handleDelete = (parapro: ParaPro) => {
    setDeleteConfirmation(parapro);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation) {
      deleteParaPro(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-4 px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <SortableContext
              items={parapros.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {parapros.map((parapro) => (
                <SortableRow
                  key={parapro.id}
                  parapro={parapro}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>

      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <DeleteConfirmation
            parapro={deleteConfirmation}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteConfirmation(null)}
          />
        </div>
      )}
    </>
  );
}
