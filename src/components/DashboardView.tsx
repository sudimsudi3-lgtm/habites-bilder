import React, { useState } from 'react';
import { 
  Habit, 
  HabitCompletionRecord, 
  HabitCategory 
} from '../types';
import { 
  calculateDailyProgress, 
  calculateHabitStreak, 
  calculateOverallConsistencyStreak, 
  calculateWeeklyProgress 
} from '../utils/streakEngine';
import { 
  getLocalDateString, 
  getSevenDayRange, 
  formatDisplayDate, 
  getRelativeDateLabel, 
  getDayOfWeek, 
  getWeekdayShortName 
} from '../utils/dateUtils';
import { CircularProgress } from './CircularProgress';
import { HabitIcon } from './HabitIcon';
import { TranslationDictionary } from '../i18n/translations';
import { 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  Plus, 
  MoreVertical, 
  Filter, 
  Check, 
  Sparkles,
  Info,
  Edit2,
  Trash2,
  Archive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCompletionSound } from '../utils/notificationUtils';

interface DashboardViewProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  onToggleCompletion: (habitId: string, dateStr: string) => void;
  onOpenAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onArchiveHabit: (habitId: string) => void;
  onOpenDetailsModal: (habit: Habit, dateStr: string) => void;
  displayName: string;
  soundEnabled: boolean;
  searchQuery: string;
  t: TranslationDictionary;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  habits,
  completions,
  onToggleCompletion,
  onOpenAddHabit,
  onEditHabit,
  onDeleteHabit,
  onArchiveHabit,
  onOpenDetailsModal,
  displayName,
  soundEnabled,
  searchQuery,
  t,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(null);

  const todayStr = getLocalDateString();
  const activeHabits = habits.filter((h) => !h.archived);

  // Daily statistics for today
  const dailyProgress = calculateDailyProgress(habits, completions, todayStr);
  const overallStreak = calculateOverallConsistencyStreak(habits, completions, todayStr);
  const weeklyProgress = calculateWeeklyProgress(habits, completions, todayStr);

  // Best single habit streak
  let bestHabitStreak = 0;
  let bestHabitName = '';
  activeHabits.forEach((h) => {
    const stats = calculateHabitStreak(h, completions, todayStr);
    if (stats.longestStreak > bestHabitStreak) {
      bestHabitStreak = stats.longestStreak;
      bestHabitName = h.name;
    }
  });

  // 7-day overview data
  const sevenDays = getSevenDayRange(todayStr);
  const weeklyTrends = sevenDays.map((dateStr) => {
    const dayStats = calculateDailyProgress(habits, completions, dateStr);
    return {
      date: dateStr,
      dayName: getWeekdayShortName(getDayOfWeek(dateStr)),
      isToday: dateStr === todayStr,
      percentage: dayStats.percentage,
      completed: dayStats.completedCount,
      scheduled: dayStats.totalScheduled,
    };
  });

  // Filter scheduled habits due today
  const todayScheduledHabits = dailyProgress.scheduledHabits.filter((h) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchCat = h.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && h.category !== selectedCategory) {
      return false;
    }

    // Status filter
    const isCompleted = completions.some((c) => c.habitId === h.id && c.date === todayStr);
    if (statusFilter === 'completed' && !isCompleted) return false;
    if (statusFilter === 'incomplete' && isCompleted) return false;

    return true;
  });

  // Verified recent activity list (sorted descending by timestamp)
  const recentCompletions = [...completions]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 6)
    .map((record) => {
      const linkedHabit = habits.find((h) => h.id === record.habitId);
      return {
        record,
        habit: linkedHabit,
      };
    })
    .filter((item) => item.habit !== undefined);

  // Handle checking with sound and celebratory confetti on completion
  const handleCheck = (habitId: string) => {
    const isAlreadyDone = completions.some((c) => c.habitId === habitId && c.date === todayStr);
    onToggleCompletion(habitId, todayStr);

    if (!isAlreadyDone) {
      if (soundEnabled) playCompletionSound();
      // Confetti burst if finishing all habits today or milestone
      if (dailyProgress.remainingCount <= 1) {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#8B5CF6', '#22D3EE', '#34D399', '#FBBF24'],
        });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-[#151925] via-[#1A2030] to-[#151925] border border-[#293043] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>{displayName ? `Hello, ${displayName}` : 'Welcome'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F3F4F6] tracking-tight">
              {t.dashboard.welcomeTitle}
            </h1>
            <p className="text-sm text-[#9CA3AF] max-w-xl leading-relaxed">
              {t.dashboard.welcomeSubtitle} — <span className="text-[#F3F4F6] font-medium">{t.dashboard.encouragingMessage}</span>
            </p>
          </div>

          {/* Quick Circular Progress Ring */}
          <div className="shrink-0 flex items-center gap-4 bg-[#10131B]/80 border border-[#293043] p-4 rounded-2xl">
            <CircularProgress
              completed={dailyProgress.completedCount}
              total={dailyProgress.totalScheduled}
              percentage={dailyProgress.percentage}
              size={110}
              strokeWidth={10}
              sublabel={t.dashboard.completed}
            />
            <div className="text-left space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {t.dashboard.todayProgress}
              </div>
              <div className="text-lg font-black text-[#F3F4F6]">
                {dailyProgress.remainingCount}{' '}
                <span className="text-xs font-normal text-[#9CA3AF]">{t.dashboard.remaining}</span>
              </div>
              <div className="text-[11px] text-[#A78BFA] font-medium">
                {dailyProgress.completedCount} of {dailyProgress.totalScheduled} {t.dashboard.scheduled}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Summary Cards (Parts 4A - 4F) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* A. Active Habits */}
        <div className="bg-[#151925] border border-[#293043] rounded-2xl p-4 transition hover:border-[#3E4760]">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{t.dashboard.activeHabits}</span>
            <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-black text-[#F3F4F6] tabular-nums">
            {activeHabits.length}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Non-archived routines</div>
        </div>

        {/* B. Completed Today */}
        <div className="bg-[#151925] border border-[#293043] rounded-2xl p-4 transition hover:border-[#3E4760]">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{t.dashboard.completedToday}</span>
            <Calendar className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-black text-[#F3F4F6] tabular-nums">
            {dailyProgress.completedCount}
            <span className="text-sm font-medium text-[#6B7280]">/{dailyProgress.totalScheduled}</span>
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Scheduled for today</div>
        </div>

        {/* C. Completion Rate */}
        <div className="bg-[#151925] border border-[#293043] rounded-2xl p-4 transition hover:border-[#3E4760]">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{t.dashboard.completionRate}</span>
            <TrendingUp className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-black text-[#34D399] tabular-nums">
            {dailyProgress.percentage}%
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Today&apos;s fulfillment</div>
        </div>

        {/* D. Current Streak */}
        <div className="bg-[#151925] border border-[#293043] rounded-2xl p-4 transition hover:border-[#3E4760]">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{t.dashboard.currentStreak}</span>
            <Flame className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-black text-[#F3F4F6] tabular-nums flex items-baseline gap-1">
            {overallStreak}
            <span className="text-xs font-normal text-[#9CA3AF]">days</span>
          </div>
          <div className="text-[11px] text-[#FBBF24] mt-1 flex items-center gap-1" title="Consecutive days where at least 1 scheduled habit was completed">
            <Info className="w-3 h-3" />
            <span>Overall rhythm</span>
          </div>
        </div>

        {/* E. Best Habit Streak */}
        <div className="bg-[#151925] border border-[#293043] rounded-2xl p-4 transition hover:border-[#3E4760]">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{t.dashboard.bestHabitStreak}</span>
            <Award className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-black text-[#A78BFA] tabular-nums flex items-baseline gap-1">
            {bestHabitStreak}
            <span className="text-xs font-normal text-[#9CA3AF]">days</span>
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1 truncate" title={bestHabitName || 'No streak yet'}>
            {bestHabitName ? bestHabitName : 'Across all habits'}
          </div>
        </div>

        {/* F. Weekly Progress */}
        <div className="bg-[#151925] border border-[#293043] rounded-2xl p-4 transition hover:border-[#3E4760]">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{t.dashboard.weeklyProgress}</span>
            <Clock className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-black text-[#22D3EE] tabular-nums">
            {weeklyProgress}%
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Last 7-day average</div>
        </div>
      </div>

      {/* Main Dashboard Grid: Today's Habits (Left) + Weekly Overview & Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Habits (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#F3F4F6] flex items-center gap-2">
                <span>Today&apos;s Habits</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1A2030] text-[#A78BFA] border border-[#293043]">
                  {todayScheduledHabits.length}
                </span>
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Habits scheduled for {formatDisplayDate(todayStr, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#151925] p-1 rounded-xl border border-[#293043] text-xs">
                {(['all', 'incomplete', 'completed'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setStatusFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      statusFilter === filterKey
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    {filterKey === 'all' && t.dashboard.filterAll}
                    {filterKey === 'incomplete' && t.dashboard.filterIncomplete}
                    {filterKey === 'completed' && t.dashboard.filterCompleted}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Habit Rows */}
          {todayScheduledHabits.length === 0 ? (
            <div className="bg-[#151925] border border-[#293043] rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A2030] text-[#9CA3AF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F3F4F6]">
                  {activeHabits.length === 0 ? 'No habits created yet' : t.dashboard.noHabitsToday}
                </h3>
                <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
                  {activeHabits.length === 0
                    ? 'Start your journey by adding your first daily or weekly habit.'
                    : t.dashboard.noHabitsTodaySub}
                </p>
              </div>
              <button
                onClick={onOpenAddHabit}
                className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-md shadow-[#8B5CF6]/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.dashboard.addHabit}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayScheduledHabits.map((habit) => {
                const isCompleted = completions.some(
                  (c) => c.habitId === habit.id && c.date === todayStr
                );
                const habitRecord = completions.find(
                  (c) => c.habitId === habit.id && c.date === todayStr
                );
                const streakStats = calculateHabitStreak(habit, completions, todayStr);
                const isMenuOpen = activeMenuHabitId === habit.id;

                return (
                  <div
                    key={habit.id}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group ${
                      isCompleted
                        ? 'bg-[#151925]/70 border-[#34D399]/30'
                        : 'bg-[#151925] border-[#293043] hover:border-[#3E4760]'
                    }`}
                  >
                    {/* Left: Checkbox & Habit Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleCheck(habit.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition shrink-0 ${
                          isCompleted
                            ? 'bg-[#34D399] text-[#0B0D12] shadow-md shadow-[#34D399]/30'
                            : 'border-2 border-[#3E4760] hover:border-[#8B5CF6] bg-[#10131B]'
                        }`}
                        aria-label={isCompleted ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
                      >
                        {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Habit Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition"
                        style={{
                          backgroundColor: `${habit.color}20`,
                          color: habit.color,
                        }}
                      >
                        <HabitIcon name={habit.icon} className="w-5 h-5" />
                      </div>

                      {/* Name, Category, Target info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold truncate transition ${
                              isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#F3F4F6]'
                            }`}
                          >
                            {habit.name}
                          </h4>
                          {habit.targetQuantity && (
                            <span className="text-[11px] font-medium text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-md border border-[#22D3EE]/20 shrink-0">
                              {habit.targetQuantity} {habit.targetUnit || ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] mt-0.5">
                          <span>{habit.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#FBBF24]">
                            <Flame className="w-3 h-3 fill-current" />
                            <span className="font-bold tabular-nums">{streakStats.currentStreak}d streak</span>
                          </span>
                          {habitRecord?.notes && (
                            <>
                              <span>•</span>
                              <span className="text-[#A78BFA] truncate max-w-[120px] sm:max-w-xs" title={habitRecord.notes}>
                                &ldquo;{habitRecord.notes}&rdquo;
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Log details button */}
                      <button
                        onClick={() => onOpenDetailsModal(habit, todayStr)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#22D3EE] hover:bg-[#1A2030] transition border border-transparent hover:border-[#293043]"
                        title="Add/Edit Note or Quantity"
                      >
                        {habitRecord ? 'Edit Log' : '+ Note'}
                      </button>

                      {/* Quick Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuHabitId(isMenuOpen ? null : habit.id)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-lg hover:bg-[#1A2030] transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-36 bg-[#1A2030] border border-[#293043] rounded-xl shadow-xl py-1 z-30 animate-in fade-in duration-150">
                            <button
                              onClick={() => {
                                onEditHabit(habit);
                                setActiveMenuHabitId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-left text-[#F3F4F6] hover:bg-[#252E44] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                              <span>Edit Habit</span>
                            </button>
                            <button
                              onClick={() => {
                                onArchiveHabit(habit.id);
                                setActiveMenuHabitId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-left text-[#F3F4F6] hover:bg-[#252E44] flex items-center gap-2"
                            >
                              <Archive className="w-3.5 h-3.5 text-[#FBBF24]" />
                              <span>Archive</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteHabit(habit.id);
                                setActiveMenuHabitId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-left text-[#F87171] hover:bg-[#252E44] flex items-center gap-2 border-t border-[#293043]"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#F87171]" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Consistency Overview + Recent Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weekly Consistency Bar Overview */}
          <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F3F4F6]">
                  {t.dashboard.weeklyConsistencyOverview}
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">
                  Past 7 days completion percentages
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#A78BFA] px-2 py-0.5 bg-[#8B5CF6]/15 rounded-md border border-[#8B5CF6]/30">
                {weeklyProgress}% avg
              </span>
            </div>

            {/* 7-day Bar Graph */}
            <div className="grid grid-cols-7 gap-2 pt-4 items-end h-36">
              {weeklyTrends.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition duration-150 text-[10px] bg-[#0B0D12] text-[#F3F4F6] px-1.5 py-0.5 rounded-md pointer-events-none mb-1 border border-[#293043] whitespace-nowrap">
                    {day.percentage}% ({day.completed}/{day.scheduled})
                  </div>

                  {/* Vertical bar */}
                  <div className="w-full bg-[#10131B] rounded-xl h-24 p-1 flex flex-col justify-end">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        day.isToday
                          ? 'bg-linear-to-t from-[#8B5CF6] to-[#22D3EE] shadow-md shadow-[#8B5CF6]/30'
                          : day.percentage >= 80
                          ? 'bg-[#34D399]'
                          : day.percentage > 0
                          ? 'bg-[#8B5CF6]/60'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(6, day.percentage)}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] font-semibold tracking-tight ${
                      day.isToday ? 'text-[#22D3EE] font-black' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real Recent Activity Feed */}
          <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F3F4F6]">
                  {t.dashboard.recentActivity}
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">
                  Chronological log of verified completions
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
            </div>

            {recentCompletions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9CA3AF] space-y-1">
                <p className="font-semibold text-[#F3F4F6]">{t.dashboard.noRecentActivity}</p>
                <p>{t.dashboard.noRecentActivitySub}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCompletions.map(({ record, habit }) => {
                  if (!habit) return null;
                  return (
                    <div
                      key={record.id}
                      className="p-3 bg-[#10131B] border border-[#293043] rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                        >
                          <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#F3F4F6] truncate">{habit.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                            <span>{getRelativeDateLabel(record.date, todayStr)}</span>
                            {record.quantity && (
                              <>
                                <span>•</span>
                                <span className="text-[#22D3EE] font-medium">
                                  {record.quantity} {habit.targetUnit || ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded-full border border-[#34D399]/30 shrink-0">
                        Completed
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
