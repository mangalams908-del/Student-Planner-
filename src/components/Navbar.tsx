import React from 'react';
import { BookOpen, LogOut, TrendingUp, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MainViewTab } from '../types';

interface NavbarProps {
  activeTab: MainViewTab;
  onTabChange: (tab: MainViewTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { currentUser, logout, isFirebaseLive } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#0c1f38] text-white shadow-md border-b border-[#1b3457]">
      <div className="max-w-xl mx-auto px-4 py-2.5">
        {/* Top row: Brand + User Info + Logout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-200 shadow-inner">
              <BookOpen className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                Student Planner <span className="text-blue-300 font-semibold text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/20">Lite</span>
              </h1>
              <p className="text-[10px] text-slate-300 truncate max-w-[170px] sm:max-w-xs">
                {currentUser?.email ? `${currentUser.email}` : 'Personal Study Planner'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {currentUser && (
              <button
                onClick={() => logout()}
                title="Log out of account"
                aria-label="Log out"
                className="flex items-center gap-1 text-[11px] text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 transition-all px-2.5 py-1.5 rounded-lg border border-rose-400/20 font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Tab Navigation between Tasks & Growth Dashboard */}
        {currentUser && (
          <div className="flex items-center mt-2.5 pt-2 border-t border-[#1b3457]/80 gap-2">
            <button
              onClick={() => onTabChange('tasks')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Study Tasks</span>
            </button>

            <button
              onClick={() => onTabChange('growth')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'growth'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Growth Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
