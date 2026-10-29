import React from 'react';
import { FilterStatus } from '../types';
import { Search } from 'lucide-react';

interface TaskFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-2.5 mb-4">
      {/* Search Input for mobile convenience */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by task name or subject..."
          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af] shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 text-xs font-semibold">
        <button
          onClick={() => onFilterChange('All')}
          className={`flex-1 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
            currentFilter === 'All'
              ? 'bg-[#0c1f38] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => onFilterChange('Pending')}
          className={`flex-1 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
            currentFilter === 'Pending'
              ? 'bg-[#0c1f38] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => onFilterChange('Completed')}
          className={`flex-1 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
            currentFilter === 'Completed'
              ? 'bg-[#0c1f38] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          Completed ({counts.completed})
        </button>
      </div>
    </div>
  );
};
