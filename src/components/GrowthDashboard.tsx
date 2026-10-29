import React from 'react';
import { Task } from '../types';
import { TrendingUp, CheckCircle2, Clock, Award, BarChart3, Calendar, Flame } from 'lucide-react';

interface GrowthDashboardProps {
  tasks: Task[];
  onGoToTasks: () => void;
}

export const GrowthDashboard: React.FC<GrowthDashboardProps> = ({ tasks, onGoToTasks }) => {
  // Aggregate core statistics
  const totalCount = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compute 7 days breakdown (Day 6 down to Day 0 = Today)
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const last7Days: { date: Date; dateStr: string; label: string; shortDay: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const isToday = i === 0;

    // Count tasks completed on this day using actual completedAt timestamp
    const count = completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      return t.completedAt >= d.getTime() && t.completedAt <= endOfDay.getTime();
    }).length;

    last7Days.push({
      date: d,
      dateStr: monthDay,
      label: isToday ? 'Today' : dayName,
      shortDay: dayName,
      count,
    });
  }

  // Check historical tasks for previous week (Day 13 to Day 7)
  const sevenDaysAgoStart = new Date(today);
  sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 6);
  sevenDaysAgoStart.setHours(0, 0, 0, 0);

  const fourteenDaysAgoStart = new Date(today);
  fourteenDaysAgoStart.setDate(fourteenDaysAgoStart.getDate() - 13);
  fourteenDaysAgoStart.setHours(0, 0, 0, 0);

  const hasHistoricalRecords = tasks.some(
    (t) => (t.completedAt && t.completedAt < sevenDaysAgoStart.getTime()) || t.createdAt < sevenDaysAgoStart.getTime()
  );

  const previousWeekCompletedCount = completedTasks.filter((t) => {
    if (!t.completedAt) return false;
    return t.completedAt >= fourteenDaysAgoStart.getTime() && t.completedAt < sevenDaysAgoStart.getTime();
  }).length;

  const currentWeekCompletedCount = last7Days.reduce((acc, curr) => acc + curr.count, 0);

  let weeklyComparisonNode: React.ReactNode = null;
  if (hasHistoricalRecords) {
    if (previousWeekCompletedCount === 0) {
      weeklyComparisonNode = (
        <span className="text-emerald-700 font-semibold">
          +{currentWeekCompletedCount} tasks vs prior week
        </span>
      );
    } else {
      const diff = currentWeekCompletedCount - previousWeekCompletedCount;
      const pctChange = Math.round((diff / previousWeekCompletedCount) * 100);
      weeklyComparisonNode = (
        <span className={diff >= 0 ? 'text-emerald-700 font-semibold' : 'text-slate-600 font-semibold'}>
          {diff >= 0 ? `+${pctChange}%` : `${pctChange}%`} vs prior 7 days ({previousWeekCompletedCount} completed)
        </span>
      );
    }
  }

  // Calculate highest day count for chart scaling
  const maxDailyCount = Math.max(...last7Days.map((d) => d.count), 1);
  const chartHeightPx = 160;

  // Study focus breakdown (by subject for completed tasks)
  const subjectBreakdown: Record<string, number> = {};
  completedTasks.forEach((t) => {
    subjectBreakdown[t.subject] = (subjectBreakdown[t.subject] || 0) + 1;
  });
  const topSubject = Object.entries(subjectBreakdown).sort((a, b) => b[1] - a[1])[0];

  // Consecutive completion streak
  let currentStreak = 0;
  for (let i = last7Days.length - 1; i >= 0; i--) {
    if (last7Days[i].count > 0) {
      currentStreak++;
    } else if (i === last7Days.length - 1) {
      // If today has 0, check if yesterday had completions
      continue;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0c1f38] text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0c1f38] leading-tight">
                Productivity Growth
              </h2>
              <p className="text-xs text-slate-500">
                Real completion metrics & 7-day study activity
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#1e40af] rounded-full border border-blue-100">
            Last 7 Days
          </span>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Tasks</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0c1f38] mt-1">{totalCount}</p>
          <span className="text-[10px] text-slate-400 mt-1">In your planner</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{completedCount}</p>
          <span className="text-[10px] text-emerald-700/80 mt-1">Assignments done</span>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-amber-700/80 mt-1">Awaiting completion</span>
        </div>

        {/* Completion % */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1e40af]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completion</span>
            <Award className="w-4 h-4 text-[#1e40af]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0c1f38] mt-1">{completionPercentage}%</p>
          <span className="text-[10px] text-slate-500 mt-1">Overall progress</span>
        </div>
      </div>

      {/* 7-Day Completion Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0c1f38] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1e40af]" />
              Completed Tasks Per Day
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified from actual task completion timestamps
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{last7Days[0].dateStr} — {last7Days[6].dateStr}</span>
          </div>
        </div>

        {/* Chart Canvas */}
        {completedCount > 0 ? (
          <div>
            {/* Y-Axis Label and Values Guide */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-2 px-1">
              <span>Peak: {maxDailyCount} tasks</span>
              <span>Baseline: 0</span>
            </div>

            {/* Bars Container */}
            <div
              className="flex items-end justify-between gap-2 pt-4 pb-2 border-b border-slate-200 px-1 sm:px-3"
              style={{ height: `${chartHeightPx}px` }}
            >
              {last7Days.map((day, idx) => {
                const isToday = idx === last7Days.length - 1;
                // Height ratio
                const heightPercent = maxDailyCount > 0 ? Math.max((day.count / maxDailyCount) * 100, 6) : 6;

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Count label above bar */}
                    <span
                      className={`text-[11px] font-bold mb-1.5 transition-all ${
                        day.count > 0 ? (isToday ? 'text-[#0c1f38]' : 'text-slate-700') : 'text-slate-300'
                      }`}
                    >
                      {day.count}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[38px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all">
                      <div
                        style={{ height: `${day.count > 0 ? heightPercent : 4}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          day.count > 0
                            ? isToday
                              ? 'bg-[#0c1f38] shadow-xs'
                              : 'bg-[#1e40af]'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Day Labels */}
            <div className="flex items-center justify-between gap-2 mt-2 px-1 sm:px-3 text-center">
              {last7Days.map((day, idx) => {
                const isToday = idx === last7Days.length - 1;
                return (
                  <div key={`label-${day.dateStr}`} className="flex-1">
                    <p
                      className={`text-[11px] font-bold truncate ${
                        isToday ? 'text-[#0c1f38]' : 'text-slate-600'
                      }`}
                    >
                      {day.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {day.dateStr}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Weekly Comparison or Informative notice */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#1e40af]" />
                {hasHistoricalRecords && weeklyComparisonNode ? (
                  <span>Weekly Pace: {weeklyComparisonNode}</span>
                ) : (
                  <span className="text-slate-500">
                    Weekly comparison unlocks once you record study activity over more than 7 days.
                  </span>
                )}
              </div>

              {currentStreak > 0 && (
                <div className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 self-start sm:self-auto">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>{currentStreak} Day Study Streak</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State for New Users */
          <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e40af] flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#0c1f38] mb-1">
              No tasks completed yet
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
              As you mark assignments or study sessions as completed, your 7-day productivity curve and subject momentum will render here automatically.
            </p>
            <button
              onClick={onGoToTasks}
              className="px-4 py-2 bg-[#0c1f38] hover:bg-[#163359] text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              Go to Task Planner
            </button>
          </div>
        )}
      </div>

      {/* Additional Productivity Insights (Derived Strictly from Real Records) */}
      {topSubject && completedCount > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Most Focused Subject
            </span>
            <p className="text-sm font-bold text-[#0c1f38] mt-0.5">
              {topSubject[0]}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200">
            {topSubject[1]} completed {topSubject[1] === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      )}
    </div>
  );
};
