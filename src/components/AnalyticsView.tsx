import React, { useState } from 'react';
import { Habit, HabitCompletionRecord } from '../types';
import { calculateAnalyticsMetrics } from '../utils/streakEngine';
import { getLocalDateString } from '../utils/dateUtils';
import { TranslationDictionary } from '../i18n/translations';
import { HabitIcon } from './HabitIcon';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  AlertCircle, 
  PieChart, 
  Calendar,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  t: TranslationDictionary;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  habits,
  completions,
  t,
}) => {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const todayStr = getLocalDateString();

  const metrics = calculateAnalyticsMetrics(habits, completions, timeRange, todayStr);
  const hasData = metrics.totalCompletions > 0 || habits.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header and Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F3F4F6] tracking-tight">{t.analytics.title}</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">{t.analytics.subtitle}</p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center bg-[#151925] p-1 rounded-xl border border-[#293043] self-start sm:self-auto">
          {[
            { days: 7 as const, label: t.analytics.last7Days },
            { days: 30 as const, label: t.analytics.last30Days },
            { days: 90 as const, label: t.analytics.last90Days },
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => setTimeRange(item.days)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeRange === item.days
                  ? 'bg-[#8B5CF6] text-white shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-[#151925] border border-[#293043] rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A2030] text-[#9CA3AF] flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F3F4F6]">{t.analytics.noDataTitle}</h3>
            <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">{t.analytics.noDataSub}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#151925] border border-[#293043] rounded-2xl p-5">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{t.analytics.totalCompletions}</span>
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              </div>
              <div className="text-3xl font-black text-[#F3F4F6] tabular-nums">
                {metrics.totalCompletions}
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-1">Verified logged events</div>
            </div>

            <div className="bg-[#151925] border border-[#293043] rounded-2xl p-5">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{t.analytics.avgCompletionRate}</span>
                <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div className="text-3xl font-black text-[#A78BFA] tabular-nums">
                {metrics.averageCompletionRate}%
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-1">
                Across {metrics.scheduledOpportunities} opportunities
              </div>
            </div>

            <div className="bg-[#151925] border border-[#293043] rounded-2xl p-5">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{t.analytics.longestStreak}</span>
                <Award className="w-4 h-4 text-[#FBBF24]" />
              </div>
              <div className="text-3xl font-black text-[#F3F4F6] tabular-nums flex items-baseline gap-1">
                {metrics.longestStreakEver}
                <span className="text-sm font-normal text-[#9CA3AF]">days</span>
              </div>
              <div className="text-[11px] text-[#FBBF24] mt-1">Historical all-time best</div>
            </div>

            <div className="bg-[#151925] border border-[#293043] rounded-2xl p-5">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Window Analyzed</span>
                <Calendar className="w-4 h-4 text-[#22D3EE]" />
              </div>
              <div className="text-3xl font-black text-[#22D3EE] tabular-nums flex items-baseline gap-1">
                {timeRange}
                <span className="text-sm font-normal text-[#9CA3AF]">days</span>
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-1">Consecutive calendar days</div>
            </div>
          </div>

          {/* Chart 1: Daily Completion Trend Over Time */}
          <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F3F4F6]">{t.analytics.completionTrend}</h3>
                <p className="text-xs text-[#9CA3AF]">Daily percentage of scheduled habits completed</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#34D399] px-2.5 py-1 bg-[#34D399]/15 rounded-lg border border-[#34D399]/30">
                {metrics.averageCompletionRate}% average
              </span>
            </div>

            {/* SVG Interactive Trend Chart */}
            <div className="pt-4">
              <div className="flex items-end gap-1 sm:gap-1.5 h-44 w-full overflow-x-auto pb-2">
                {metrics.dailyTrends.map((point) => (
                  <div
                    key={point.date}
                    className="flex-1 min-w-[8px] sm:min-w-[14px] flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute bottom-full mb-2 z-20 bg-[#0B0D12] border border-[#293043] text-[10px] text-[#F3F4F6] p-2 rounded-xl whitespace-nowrap shadow-xl pointer-events-none">
                      <div className="font-bold text-[#A78BFA]">{point.date}</div>
                      <div>Rate: {point.rate}%</div>
                      <div>Completed: {point.completed}/{point.scheduled}</div>
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        point.rate === 100
                          ? 'bg-[#34D399]'
                          : point.rate >= 60
                          ? 'bg-[#8B5CF6]'
                          : point.rate > 0
                          ? 'bg-[#A78BFA]/50'
                          : 'bg-[#1F2637]'
                      }`}
                      style={{ height: `${Math.max(4, point.rate)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-mono pt-2 border-t border-[#293043]">
                <span>{metrics.dailyTrends[0]?.date}</span>
                <span>{metrics.dailyTrends[Math.floor(metrics.dailyTrends.length / 2)]?.date}</span>
                <span>{metrics.dailyTrends[metrics.dailyTrends.length - 1]?.date} (Today)</span>
              </div>
            </div>
          </div>

          {/* Chart 2 & 3: Most Consistent Habits vs Habits Needing Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Consistent Habits */}
            <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F3F4F6]">{t.analytics.mostConsistent}</h3>
                  <p className="text-[11px] text-[#9CA3AF]">Highest completion rates in the last {timeRange} days</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.mostConsistentHabits.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] py-4">No habit data available</p>
                ) : (
                  metrics.mostConsistentHabits.map(({ habit, rate, currentStreak }) => (
                    <div key={habit.id} className="p-3 bg-[#10131B] rounded-2xl border border-[#293043] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                          >
                            <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-[#F3F4F6] truncate">{habit.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-[11px] text-[#FBBF24]">
                            <Flame className="w-3 h-3 fill-current" />
                            <span>{currentStreak}d</span>
                          </span>
                          <span className="font-bold text-[#34D399] font-mono">{rate}%</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#151925] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#8B5CF6] to-[#34D399] rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Habits Needing Attention */}
            <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F87171]/15 text-[#F87171] flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F3F4F6]">{t.analytics.needsAttention}</h3>
                  <p className="text-[11px] text-[#9CA3AF]">Routines with lowest adherence or broken streaks</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.habitsNeedingAttention.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] py-4">All habits are tracking well!</p>
                ) : (
                  metrics.habitsNeedingAttention.map(({ habit, rate, currentStreak }) => (
                    <div key={habit.id} className="p-3 bg-[#10131B] rounded-2xl border border-[#293043] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                          >
                            <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-[#F3F4F6] truncate">{habit.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#9CA3AF]">{currentStreak}d streak</span>
                          <span className="font-bold text-[#F87171] font-mono">{rate}%</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#151925] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#F87171] to-[#FBBF24] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, rate)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chart 4 & 5: Category Breakdown & Weekday Consistency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-sm font-bold text-[#F3F4F6]">{t.analytics.categoryPerformance}</h3>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] py-4">No categories recorded</p>
                ) : (
                  metrics.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F3F4F6]">{cat.category}</span>
                        <span className="font-mono text-[#A78BFA] font-bold">
                          {cat.completed}/{cat.scheduled} ({cat.rate}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#10131B] h-2.5 rounded-full overflow-hidden border border-[#293043]">
                        <div
                          className="h-full bg-[#8B5CF6] rounded-full"
                          style={{ width: `${cat.rate}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekday Consistency */}
            <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold text-[#F3F4F6]">{t.analytics.dayOfWeekConsistency}</h3>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-4 items-end h-40">
                {metrics.weekdayConsistency.map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition duration-150 text-[10px] bg-[#0B0D12] text-[#F3F4F6] px-1.5 py-0.5 rounded-md border border-[#293043] pointer-events-none mb-1">
                      {item.rate}%
                    </div>
                    <div className="w-full bg-[#10131B] rounded-xl h-24 p-1 flex flex-col justify-end">
                      <div
                        className="w-full bg-[#22D3EE] rounded-lg transition-all duration-300"
                        style={{ height: `${Math.max(6, item.rate)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#9CA3AF]">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
