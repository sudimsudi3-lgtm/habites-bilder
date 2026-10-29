/**
 * Timezone-safe local calendar date utilities.
 * Always formats and parses as YYYY-MM-DD using local browser time
 * to prevent accidental date-shifting caused by UTC conversions.
 */

import { Habit } from '../types';

/**
 * Format a Date object into YYYY-MM-DD using local timezone components
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date object set at 12:00 noon local time
 * (noon avoids daylight saving boundary issues)
 */
export function parseLocalDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Format date string for user-friendly display (e.g. "Thursday, Oct 29, 2026")
 */
export function formatDisplayDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const d = parseLocalDateString(dateStr);
  const defaultOpts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return d.toLocaleDateString(undefined, defaultOpts);
}

/**
 * Get relative label: "Today", "Yesterday", or formatted date
 */
export function getRelativeDateLabel(dateStr: string, todayStr: string = getLocalDateString()): string {
  if (dateStr === todayStr) return 'Today';
  
  const todayDate = parseLocalDateString(todayStr);
  const targetDate = parseLocalDateString(dateStr);
  
  const diffTime = todayDate.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 6) return `${diffDays} days ago`;
  
  return formatDisplayDate(dateStr, { month: 'short', day: 'numeric' });
}

/**
 * Get day of week for a YYYY-MM-DD string: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export function getDayOfWeek(dateStr: string): number {
  return parseLocalDateString(dateStr).getDay();
}

/**
 * Add or subtract days to a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDateString(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/**
 * Generates an inclusive array of YYYY-MM-DD strings between start and end date
 */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  if (startDate > endDate) return dates;
  
  let current = startDate;
  // Guard max 1000 days to avoid accidental infinite loops
  let guard = 0;
  while (current <= endDate && guard < 1000) {
    dates.push(current);
    current = addDays(current, 1);
    guard++;
  }
  return dates;
}

/**
 * Returns the last 7 dates ending on referenceDate (inclusive)
 */
export function getSevenDayRange(referenceDate: string = getLocalDateString()): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(addDays(referenceDate, -i));
  }
  return dates;
}

/**
 * Returns whether a habit is scheduled on a given local date string
 */
export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.archived) return false;
  // If date is before habit start date, it is not scheduled
  if (dateStr < habit.startDate) return false;

  if (habit.frequency === 'daily') {
    return true;
  }

  if (habit.frequency === 'weekdays') {
    const dayOfWeek = getDayOfWeek(dateStr);
    return habit.weekdays.includes(dayOfWeek);
  }

  if (habit.frequency === 'weekly_target') {
    // For weekly target habits, each day can be an opportunity up to the target,
    // or every day in the week is an active day until weekly target is satisfied.
    // In our calculation engine, every day is open for completion until weekly target is met.
    return true;
  }

  return true;
}

/**
 * Helper to get short weekday name
 */
export function getWeekdayShortName(dayIndex: number): string {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[dayIndex % 7];
}
