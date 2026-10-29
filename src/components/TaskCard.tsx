import React from 'react';
import { Task } from '../types';
import { Check, Edit3, Trash2, Clock, CheckCircle2, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

// Map subjects to subtle readable color accents
const getSubjectBadgeStyle = (subject: string) => {
  const normalized = subject.toLowerCase();
  if (normalized.includes('calc') || normalized.includes('math')) {
    return 'bg-blue-50 text-blue-800 border-blue-200';
  }
  if (normalized.includes('cs') || normalized.includes('computer') || normalized.includes('code')) {
    return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  }
  if (normalized.includes('chem') || normalized.includes('bio') || normalized.includes('sci')) {
    return 'bg-teal-50 text-teal-800 border-teal-200';
  }
  if (normalized.includes('econ') || normalized.includes('business')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (normalized.includes('lit') || normalized.includes('english') || normalized.includes('hist')) {
    return 'bg-purple-50 text-purple-800 border-purple-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'Completed';

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 transition-all duration-200 border ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/60 shadow-xs'
          : 'border-slate-200 hover:border-[#1e40af]/40 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox button: 44px touch target on mobile */}
        <button
          onClick={() => onToggleStatus(task.id)}
          aria-label={isCompleted ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`}
          className={`flex-shrink-0 w-8 h-8 sm:w-7 sm:h-7 mt-0.5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
            isCompleted
              ? 'bg-[#1e40af] border-[#1e40af] text-white'
              : 'border-slate-300 hover:border-[#1e40af] bg-white text-transparent active:scale-95'
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Subject Tag */}
            <span
              className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getSubjectBadgeStyle(
                task.subject
              )}`}
            >
              {task.subject}
            </span>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Completed
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-600" />
                  Pending
                </>
              )}
            </span>

            {/* Due Date if present */}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 ml-auto">
                <Calendar className="w-3 h-3 text-slate-400" />
                {task.dueDate}
              </span>
            )}
          </div>

          {/* Task Name */}
          <h3
            onClick={() => onToggleStatus(task.id)}
            className={`text-sm sm:text-base font-medium leading-snug cursor-pointer select-none transition-colors ${
              isCompleted ? 'line-through text-slate-400 font-normal' : 'text-[#0c1f38]'
            }`}
          >
            {task.title}
          </h3>

          {/* Action Row for Mobile: clear touch targets for edit and delete */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
            <button
              onClick={() => onToggleStatus(task.id)}
              className="text-xs text-slate-500 hover:text-[#1e40af] font-medium py-1 px-1 cursor-pointer transition-colors"
            >
              {isCompleted ? 'Mark as Pending' : 'Mark as Done'}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                aria-label={`Edit task ${task.title}`}
                title="Edit task"
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-[#0c1f38] hover:bg-slate-100 active:scale-95 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(task)}
                aria-label={`Delete task ${task.title}`}
                title="Delete task"
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:scale-95 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
