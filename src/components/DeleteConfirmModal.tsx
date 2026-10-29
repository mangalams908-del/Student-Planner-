import React from 'react';
import { Task } from '../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0c1f38] mb-1">Delete Task?</h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 px-2">
          Are you sure you want to remove &quot;{task.title}&quot;?
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(task.id);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
