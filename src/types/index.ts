export type HabitCategory =
  | 'Health & Fitness'
  | 'Learning & Study'
  | 'Reading'
  | 'Productivity'
  | 'Mindfulness'
  | 'Personal Growth'
  | 'Sleep Routine'
  | 'Custom';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekly_target';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  weekdays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  weeklyTarget: number; // e.g. 3, 4, 5 days per week
  startDate: string; // YYYY-MM-DD
  targetQuantity?: number;
  targetUnit?: string; // e.g. "pages", "mins", "glasses", "km"
  reminderTime?: string; // "08:30"
  reminderEnabled: boolean;
  archived: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface HabitCompletionRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD (local calendar date)
  completedAt: string; // ISO timestamp
  quantity?: number;
  notes?: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 - 100
  isCompletedToday: boolean;
  isScheduledToday: boolean;
  lastCompletedDate?: string;
}

export type SupportedLanguage = 'en' | 'roman_ur' | 'ur';

export interface UserSettings {
  displayName: string;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  theme: 'dark' | 'midnight' | 'contrast';
  language: SupportedLanguage;
  dailyGoalPercentage: number;
  notificationsEnabled: boolean;
  soundEffectsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  isDemoData: boolean;
}

export interface StorageDataV1 {
  version: 1;
  habits: Habit[];
  completions: HabitCompletionRecord[];
  settings: UserSettings;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedHabit?: Partial<Habit>;
}

export interface DayCompletionSummary {
  date: string;
  dayOfWeek: number;
  totalScheduled: number;
  completedCount: number;
  percentage: number;
  habits: {
    habit: Habit;
    completed: boolean;
    record?: HabitCompletionRecord;
  }[];
}

export interface AnalyticsMetrics {
  totalCompletions: number;
  averageCompletionRate: number;
  scheduledOpportunities: number;
  longestStreakEver: number;
  mostConsistentHabits: { habit: Habit; rate: number; currentStreak: number }[];
  habitsNeedingAttention: { habit: Habit; rate: number; currentStreak: number }[];
  categoryBreakdown: { category: HabitCategory; scheduled: number; completed: number; rate: number }[];
  dailyTrends: { date: string; rate: number; completed: number; scheduled: number }[];
  weekdayConsistency: { day: string; rate: number; total: number }[];
}
