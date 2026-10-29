/**
 * STREAK CALCULATION ENGINE
 * 
 * Rules & Conventions:
 * 1. Only scheduled dates are evaluated.
 * 2. Unscheduled dates NEVER break a streak.
 * 3. A missed scheduled date breaks a consecutive streak.
 * 4. A habit created on a given startDate only checks scheduled dates on or after startDate.
 * 5. If today is scheduled and completed: streak includes today and counts backward consecutively through past scheduled dates.
 * 6. If today is scheduled and NOT completed: today is considered "in progress".
 *    The streak is preserved from the most recent previous scheduled date (e.g. yesterday).
 * 7. Duplicate completion records on the same date are deduplicated.
 * 8. Future dates are NEVER evaluated as missed.
 * 9. Longest streak is the maximum consecutive scheduled completions in the habit's recorded history.
 */

import { Habit, HabitCompletionRecord, StreakStats, AnalyticsMetrics, HabitCategory } from '../types';
import { getLocalDateString, addDays, isHabitScheduledOnDate, getDayOfWeek } from './dateUtils';

/**
 * Calculates streak metrics for an individual habit.
 */
export function calculateHabitStreak(
  habit: Habit,
  records: HabitCompletionRecord[],
  todayStr: string = getLocalDateString()
): StreakStats {
  // Deduplicate completions for this habit by date
  const completedDates = new Set<string>();
  records
    .filter((r) => r.habitId === habit.id)
    .forEach((r) => completedDates.add(r.date));

  const totalCompletions = completedDates.size;
  const isScheduledToday = isHabitScheduledOnDate(habit, todayStr);
  const isCompletedToday = completedDates.has(todayStr);

  // Find most recent completed date
  let lastCompletedDate: string | undefined = undefined;
  if (completedDates.size > 0) {
    const sorted = Array.from(completedDates).sort().reverse();
    lastCompletedDate = sorted[0];
  }

  // If habit has never been completed, streaks are 0
  if (completedDates.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
      isCompletedToday: false,
      isScheduledToday,
      lastCompletedDate: undefined,
    };
  }

  // --- Calculate Current Streak ---
  let currentStreak = 0;

  // Determine starting point for checking current streak:
  // If today is scheduled:
  //   - if completed today: start backward check from today (dayOffset = 0)
  //   - if not completed today: today is in progress, start backward check from yesterday (dayOffset = -1)
  // If today is NOT scheduled:
  //   - start backward check from yesterday (or most recent scheduled day before today)
  let checkDate = isScheduledToday && isCompletedToday ? todayStr : addDays(todayStr, -1);

  // Walk backward day by day until habit's start date
  // (guard against checking earlier than habit.startDate, or max 365 days)
  let guard = 0;
  while (checkDate >= habit.startDate && guard < 1000) {
    guard++;
    const scheduled = isHabitScheduledOnDate(habit, checkDate);
    if (!scheduled) {
      // Unscheduled days do NOT break streak - continue backward
      checkDate = addDays(checkDate, -1);
      continue;
    }

    if (completedDates.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    } else {
      // A scheduled date was missed - the consecutive streak ends
      break;
    }
  }

  // --- Calculate Longest Streak ---
  // Find all scheduled dates from habit.startDate to todayStr
  let longestStreak = 0;
  let runningStreak = 0;
  let iterDate = habit.startDate;
  let iterGuard = 0;

  while (iterDate <= todayStr && iterGuard < 2000) {
    iterGuard++;
    const scheduled = isHabitScheduledOnDate(habit, iterDate);
    if (!scheduled) {
      iterDate = addDays(iterDate, 1);
      continue;
    }

    if (completedDates.has(iterDate)) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      // If it's today and not completed yet, don't reset running streak if it wasn't broken yet
      if (iterDate === todayStr) {
        // Today is in progress
      } else {
        runningStreak = 0;
      }
    }

    iterDate = addDays(iterDate, 1);
  }

  // If currentStreak exceeds longestStreak recorded, update longest
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // --- Calculate Overall Completion Rate for this Habit ---
  // Count scheduled opportunities from startDate to todayStr
  let totalScheduledDates = 0;
  let compCount = 0;
  let scanDate = habit.startDate;
  let scanGuard = 0;

  while (scanDate <= todayStr && scanGuard < 2000) {
    scanGuard++;
    if (isHabitScheduledOnDate(habit, scanDate)) {
      totalScheduledDates++;
      if (completedDates.has(scanDate)) {
        compCount++;
      }
    }
    scanDate = addDays(scanDate, 1);
  }

  const completionRate = totalScheduledDates > 0
    ? Math.round((compCount / totalScheduledDates) * 100)
    : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
    isCompletedToday,
    isScheduledToday,
    lastCompletedDate,
  };
}

/**
 * Calculates daily progress for a given date.
 * Excludes archived habits and unscheduled habits from the denominator.
 */
export function calculateDailyProgress(
  habits: Habit[],
  records: HabitCompletionRecord[],
  dateStr: string = getLocalDateString()
) {
  const activeHabits = habits.filter((h) => !h.archived);
  const scheduledToday = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateStr));
  
  const recordsOnDate = new Set(
    records.filter((r) => r.date === dateStr).map((r) => r.habitId)
  );

  const completedCount = scheduledToday.filter((h) => recordsOnDate.has(h.id)).length;
  const totalScheduled = scheduledToday.length;
  const percentage = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;
  const remainingCount = Math.max(0, totalScheduled - completedCount);

  return {
    totalScheduled,
    completedCount,
    percentage,
    remainingCount,
    scheduledHabits: scheduledToday,
  };
}

/**
 * Calculates overall user consistency streak across all active habits.
 * Definition: Consecutive days where at least 1 scheduled habit was completed.
 * If today is in progress (no habits completed yet today), streak is preserved from yesterday.
 */
export function calculateOverallConsistencyStreak(
  habits: Habit[],
  records: HabitCompletionRecord[],
  todayStr: string = getLocalDateString()
): number {
  const activeHabits = habits.filter((h) => !h.archived);
  if (activeHabits.length === 0 || records.length === 0) return 0;

  // Map each date to whether at least 1 habit was completed
  const datesWithCompletions = new Set(records.map((r) => r.date));

  // Find if today had any completion
  const hasToday = datesWithCompletions.has(todayStr);

  // If today had completion, start checking from today; otherwise start from yesterday
  let checkDate = hasToday ? todayStr : addDays(todayStr, -1);
  let streak = 0;
  let guard = 0;

  while (guard < 365) {
    guard++;
    // Check if any active habit was scheduled on this date
    const hadScheduledHabits = activeHabits.some((h) => isHabitScheduledOnDate(h, checkDate));
    
    // If no habits were scheduled on this date, skip it without breaking streak
    if (!hadScheduledHabits) {
      checkDate = addDays(checkDate, -1);
      continue;
    }

    if (datesWithCompletions.has(checkDate)) {
      streak++;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates weekly completion percentage over a 7-day period.
 */
export function calculateWeeklyProgress(
  habits: Habit[],
  records: HabitCompletionRecord[],
  endDateStr: string = getLocalDateString()
): number {
  let totalScheduled = 0;
  let totalCompleted = 0;

  for (let i = 0; i < 7; i++) {
    const d = addDays(endDateStr, -i);
    const dayStats = calculateDailyProgress(habits, records, d);
    totalScheduled += dayStats.totalScheduled;
    totalCompleted += dayStats.completedCount;
  }

  if (totalScheduled === 0) return 0;
  return Math.round((totalCompleted / totalScheduled) * 100);
}

/**
 * Calculates comprehensive analytics metrics for a given time window (e.g. 7, 30, 90 days).
 */
export function calculateAnalyticsMetrics(
  habits: Habit[],
  records: HabitCompletionRecord[],
  daysBack: number = 30,
  todayStr: string = getLocalDateString()
): AnalyticsMetrics {
  const activeHabits = habits.filter((h) => !h.archived);
  const startDateStr = addDays(todayStr, -(daysBack - 1));

  // Filter records within date window
  const windowRecords = records.filter(
    (r) => r.date >= startDateStr && r.date <= todayStr
  );

  let totalScheduledOpportunities = 0;
  let totalCompletedEvents = 0;

  // Daily trends
  const dailyTrends: { date: string; rate: number; completed: number; scheduled: number }[] = [];

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = addDays(todayStr, -i);
    const dayStats = calculateDailyProgress(habits, records, d);
    dailyTrends.push({
      date: d,
      rate: dayStats.percentage,
      completed: dayStats.completedCount,
      scheduled: dayStats.totalScheduled,
    });
    totalScheduledOpportunities += dayStats.totalScheduled;
    totalCompletedEvents += dayStats.completedCount;
  }

  const averageCompletionRate = totalScheduledOpportunities > 0
    ? Math.round((totalCompletedEvents / totalScheduledOpportunities) * 100)
    : 0;

  // Habit consistency ranking
  const habitPerformances = activeHabits.map((habit) => {
    const streak = calculateHabitStreak(habit, records, todayStr);
    
    // Calculate rate inside this window specifically
    let schedInWindow = 0;
    let compInWindow = 0;
    dailyTrends.forEach((dt) => {
      if (isHabitScheduledOnDate(habit, dt.date)) {
        schedInWindow++;
        const didComplete = windowRecords.some(
          (r) => r.habitId === habit.id && r.date === dt.date
        );
        if (didComplete) compInWindow++;
      }
    });

    const windowRate = schedInWindow > 0 ? Math.round((compInWindow / schedInWindow) * 100) : 0;

    return {
      habit,
      rate: windowRate,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
    };
  });

  // Sort by rate descending
  const sorted = [...habitPerformances].sort((a, b) => b.rate - a.rate);
  const mostConsistentHabits = sorted.slice(0, 5);
  // Habits with lower completion rates or 0% that need attention
  const habitsNeedingAttention = [...sorted].reverse().slice(0, 5);

  // Longest streak ever among all habits
  let longestStreakEver = 0;
  activeHabits.forEach((h) => {
    const stats = calculateHabitStreak(h, records, todayStr);
    if (stats.longestStreak > longestStreakEver) {
      longestStreakEver = stats.longestStreak;
    }
  });

  // Category breakdown
  const categoryMap = new Map<HabitCategory, { scheduled: number; completed: number }>();
  activeHabits.forEach((h) => {
    if (!categoryMap.has(h.category)) {
      categoryMap.set(h.category, { scheduled: 0, completed: 0 });
    }
  });

  dailyTrends.forEach((dt) => {
    activeHabits.forEach((h) => {
      if (isHabitScheduledOnDate(h, dt.date)) {
        const entry = categoryMap.get(h.category) || { scheduled: 0, completed: 0 };
        entry.scheduled++;
        const isDone = windowRecords.some((r) => r.habitId === h.id && r.date === dt.date);
        if (isDone) entry.completed++;
        categoryMap.set(h.category, entry);
      }
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    scheduled: stats.scheduled,
    completed: stats.completed,
    rate: stats.scheduled > 0 ? Math.round((stats.completed / stats.scheduled) * 100) : 0,
  }));

  // Weekday consistency
  const weekdayTotals = [
    { day: 'Sun', scheduled: 0, completed: 0 },
    { day: 'Mon', scheduled: 0, completed: 0 },
    { day: 'Tue', scheduled: 0, completed: 0 },
    { day: 'Wed', scheduled: 0, completed: 0 },
    { day: 'Thu', scheduled: 0, completed: 0 },
    { day: 'Fri', scheduled: 0, completed: 0 },
    { day: 'Sat', scheduled: 0, completed: 0 },
  ];

  dailyTrends.forEach((dt) => {
    const dow = getDayOfWeek(dt.date);
    weekdayTotals[dow].scheduled += dt.scheduled;
    weekdayTotals[dow].completed += dt.completed;
  });

  const weekdayConsistency = weekdayTotals.map((w) => ({
    day: w.day,
    rate: w.scheduled > 0 ? Math.round((w.completed / w.scheduled) * 100) : 0,
    total: w.completed,
  }));

  return {
    totalCompletions: windowRecords.length,
    averageCompletionRate,
    scheduledOpportunities: totalScheduledOpportunities,
    longestStreakEver,
    mostConsistentHabits,
    habitsNeedingAttention,
    categoryBreakdown,
    dailyTrends,
    weekdayConsistency,
  };
}
