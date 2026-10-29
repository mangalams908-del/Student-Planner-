import React from 'react';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface DashboardStatsProps {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCount,
  pendingCount,
  completedCount,
}) => {
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0c1f38] tracking-tight">
            My Study Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize coursework, track deadlines & boost productivity
          </p>
        </div>
        <div className="mt-1 sm:mt-0 flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-100">
          <span>{completionPercentage}% completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-200/50">
        <div
          className="bg-[#1e40af] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Pending Card */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 tracking-tight">{pendingCount}</p>
          <span className="text-[10px] text-amber-700/80 mt-0.5">Tasks to finish</span>
        </div>

        {/* Completed Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 tracking-tight">{completedCount}</p>
          <span className="text-[10px] text-emerald-700/80 mt-0.5">Finished tasks</span>
        </div>

        {/* Total Card */}
        <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1e3a8a] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total</span>
            <ListTodo className="w-4 h-4 text-[#1e40af]" />
          </div>
          <p className="text-2xl font-bold text-[#0c1f38] tracking-tight">{totalCount}</p>
          <span className="text-[10px] text-slate-500 mt-0.5">All assignments</span>
        </div>
      </div>
    </div>
  );
};
