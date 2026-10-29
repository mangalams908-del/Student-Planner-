import React from 'react';
import { BookOpenCheck, Plus, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onAddTask: () => void;
  onClearFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onAddTask,
  onClearFilter,
}) => {
  if (isFiltered) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs my-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0c1f38] mb-1">No matching tasks found</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
          Try adjusting your search terms or filter tabs to view other study assignments.
        </p>
        {onClearFilter && (
          <button
            onClick={onClearFilter}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0c1f38] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Show All Tasks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center shadow-xs my-3">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1e40af] mb-3">
        <BookOpenCheck className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#0c1f38] mb-1">No tasks yet. Add your first task!</h3>
      <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
        Your study planner is completely clear. Plan your coursework, assignments, or revision schedule to stay on track.
      </p>

      <div className="flex items-center justify-center max-w-xs mx-auto">
        <button
          onClick={onAddTask}
          className="w-full px-5 py-2.5 bg-[#0c1f38] hover:bg-[#163359] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add First Task
        </button>
      </div>
    </div>
  );
};
