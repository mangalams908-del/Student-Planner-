import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { COMMON_SUBJECTS } from '../data/sampleTasks';
import { X, CheckCircle2, Clock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>, taskId?: string) => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate || '');

      if (COMMON_SUBJECTS.includes(taskToEdit.subject)) {
        setSubject(taskToEdit.subject);
        setIsCustomSubject(false);
        setCustomSubject('');
      } else {
        setSubject('Other');
        setIsCustomSubject(true);
        setCustomSubject(taskToEdit.subject);
      }
    } else {
      // Reset form
      setTitle('');
      setSubject(COMMON_SUBJECTS[0]);
      setIsCustomSubject(false);
      setCustomSubject('');
      setStatus('Pending');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task name.');
      return;
    }

    const finalSubject = isCustomSubject
      ? customSubject.trim() || 'General'
      : subject === 'Other' && customSubject.trim()
      ? customSubject.trim()
      : subject;

    onSave(
      {
        title: title.trim(),
        subject: finalSubject,
        status,
        dueDate: dueDate.trim() || undefined,
      },
      taskToEdit?.id
    );
    onClose();
  };

  const handleSubjectSelect = (val: string) => {
    setSubject(val);
    if (val === 'Other') {
      setIsCustomSubject(true);
    } else {
      setIsCustomSubject(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card / Bottom Sheet on mobile */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 z-10 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#0c1f38] text-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              {taskToEdit ? 'Edit Study Task' : 'Add New Study Task'}
            </h3>
            <p className="text-xs text-slate-300">
              {taskToEdit ? 'Update task details' : 'Keep track of college assignments and readings'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Read Calculus Ch 4, Submit CS Assignment 2..."
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af] bg-slate-50/50"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Subject
              </label>
              {!isCustomSubject && (
                <button
                  type="button"
                  onClick={() => setIsCustomSubject(true)}
                  className="text-xs text-[#1e40af] hover:underline font-medium cursor-pointer"
                >
                  + Custom Subject
                </button>
              )}
            </div>

            {!isCustomSubject ? (
              <select
                value={subject}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af]"
              >
                {COMMON_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter subject name (e.g., Organic Chem 202)..."
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af] bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomSubject(false);
                    setSubject(COMMON_SUBJECTS[0]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Choose from common subjects list
                </button>
              </div>
            )}
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Pending')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  status === 'Pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatus('Completed')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  status === 'Completed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completed
              </button>
            </div>
          </div>

          {/* Due date / Schedule note (optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Due Date / Deadline <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g., Today, Tomorrow, Friday, or Nov 2"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af] bg-slate-50/50"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#0c1f38] hover:bg-[#163359] text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
