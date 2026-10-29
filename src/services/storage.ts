import { Habit, HabitCompletionRecord, UserSettings, StorageDataV1 } from '../types';
import { getLocalDateString, addDays } from '../utils/dateUtils';

const STORAGE_KEY = 'HABIT_BUILDER_AI_DATA_V1';

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'Consistency Seeker',
  weekStartsOn: 1, // Monday default
  theme: 'dark',
  language: 'en',
  dailyGoalPercentage: 80,
  notificationsEnabled: false,
  soundEffectsEnabled: true,
  hasCompletedOnboarding: false,
  isDemoData: false,
};

export const STARTER_SUGGESTIONS: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'startDate' | 'archived'>[] = [
  {
    name: 'Read for 15 minutes',
    description: 'Read a book, article, or educational material without distractions.',
    icon: 'BookOpen',
    color: '#8B5CF6',
    category: 'Reading',
    frequency: 'daily',
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    weeklyTarget: 7,
    targetQuantity: 15,
    targetUnit: 'mins',
    reminderTime: '21:00',
    reminderEnabled: false,
  },
  {
    name: 'Daily 20-min Walk or Exercise',
    description: 'Brisk walking, workout, stretching or cycling to energize body and mind.',
    icon: 'Dumbbell',
    color: '#22D3EE',
    category: 'Health & Fitness',
    frequency: 'weekdays',
    weekdays: [1, 2, 3, 4, 5],
    weeklyTarget: 5,
    targetQuantity: 20,
    targetUnit: 'mins',
    reminderTime: '07:30',
    reminderEnabled: false,
  },
  {
    name: 'Study or Deep Work Session',
    description: 'Focused 25-minute Pomodoro study sprint with zero notifications.',
    icon: 'GraduationCap',
    color: '#34D399',
    category: 'Learning & Study',
    frequency: 'weekdays',
    weekdays: [1, 2, 3, 4, 5],
    weeklyTarget: 5,
    targetQuantity: 25,
    targetUnit: 'mins',
    reminderTime: '10:00',
    reminderEnabled: false,
  },
  {
    name: 'Plan Tomorrow & Review Goals',
    description: 'Jot down top 3 priorities for tomorrow before sleeping.',
    icon: 'CheckSquare',
    color: '#FBBF24',
    category: 'Productivity',
    frequency: 'daily',
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    weeklyTarget: 7,
    reminderTime: '21:45',
    reminderEnabled: false,
  },
  {
    name: '5-Minute Mindful Breathing',
    description: 'Quiet meditation, box breathing, or journaling for mental clarity.',
    icon: 'Sparkles',
    color: '#F472B6',
    category: 'Mindfulness',
    frequency: 'daily',
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    weeklyTarget: 7,
    targetQuantity: 5,
    targetUnit: 'mins',
    reminderTime: '08:00',
    reminderEnabled: false,
  },
  {
    name: 'Screen-Free Bedtime Routine',
    description: 'Disconnect from all phones, tablets, and laptops 30 minutes before bed.',
    icon: 'Moon',
    color: '#818CF8',
    category: 'Sleep Routine',
    frequency: 'daily',
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    weeklyTarget: 7,
    reminderTime: '22:30',
    reminderEnabled: false,
  },
];

/**
 * Generates sample demo records spanning the last 14 days
 * to test full analytics and streak metrics without fabricating hidden records.
 */
export function generateDemoDataset(): StorageDataV1 {
  const todayStr = getLocalDateString();
  const twoWeeksAgo = addDays(todayStr, -14);
  const now = new Date().toISOString();

  const habits: Habit[] = STARTER_SUGGESTIONS.slice(0, 4).map((s, idx) => ({
    ...s,
    id: `demo-habit-${idx + 1}`,
    startDate: twoWeeksAgo,
    archived: false,
    createdAt: twoWeeksAgo,
    updatedAt: now,
  }));

  const completions: HabitCompletionRecord[] = [];
  let recordId = 1;

  // Simulate realistic completion pattern over the past 14 days
  // Reading: High consistency (completed 12 of 14 days, with 6-day current streak)
  for (let i = 13; i >= 0; i--) {
    const date = addDays(todayStr, -i);
    // Skip 2 random days in the past (e.g. 7 days ago and 11 days ago)
    if (i !== 7 && i !== 11) {
      completions.push({
        id: `demo-comp-${recordId++}`,
        habitId: habits[0].id,
        date,
        completedAt: `${date}T20:30:00.000Z`,
        quantity: 15,
        notes: i === 0 ? 'Finished Chapter 4 on atomic habits!' : undefined,
      });
    }
  }

  // Exercise: Monday to Friday
  for (let i = 13; i >= 0; i--) {
    const date = addDays(todayStr, -i);
    const day = new Date(date).getDay();
    // Monday-Friday: 1 to 5
    if (day >= 1 && day <= 5) {
      // Completed most weekdays
      if (i !== 3) {
        completions.push({
          id: `demo-comp-${recordId++}`,
          habitId: habits[1].id,
          date,
          completedAt: `${date}T08:15:00.000Z`,
          quantity: 25,
          notes: 'Great morning jog in the crisp air.',
        });
      }
    }
  }

  // Study: Pomodoro sessions
  for (let i = 10; i >= 1; i--) {
    const date = addDays(todayStr, -i);
    const day = new Date(date).getDay();
    if (day >= 1 && day <= 5 && i % 2 === 0) {
      completions.push({
        id: `demo-comp-${recordId++}`,
        habitId: habits[2].id,
        date,
        completedAt: `${date}T11:00:00.000Z`,
        quantity: 30,
        notes: 'TypeScript generics deep-dive.',
      });
    }
  }

  // Plan tomorrow: Completed 9 days
  for (let i = 9; i >= 1; i--) {
    const date = addDays(todayStr, -i);
    if (i !== 4) {
      completions.push({
        id: `demo-comp-${recordId++}`,
        habitId: habits[3].id,
        date,
        completedAt: `${date}T21:50:00.000Z`,
      });
    }
  }

  return {
    version: 1,
    habits,
    completions,
    settings: {
      ...DEFAULT_SETTINGS,
      displayName: 'Alex Rider',
      hasCompletedOnboarding: true,
      isDemoData: true,
    },
    lastUpdated: now,
  };
}

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // ignore access error
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
  } catch (e) {
    // ignore quota/security error
  }
  memoryStore[key] = val;
}

/**
 * Storage service managing persistent local data.
 */
export const StorageService = {
  load(): StorageDataV1 {
    try {
      const raw = safeGetItem(STORAGE_KEY);
      if (!raw) {
        // Return clean initial state
        return {
          version: 1,
          habits: [],
          completions: [],
          settings: { ...DEFAULT_SETTINGS },
          lastUpdated: new Date().toISOString(),
        };
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        console.warn('Unknown storage schema version. Returning fallback.');
        return {
          version: 1,
          habits: [],
          completions: [],
          settings: { ...DEFAULT_SETTINGS },
          lastUpdated: new Date().toISOString(),
        };
      }

      // Ensure properties are arrays / valid objects
      return {
        version: 1,
        habits: Array.isArray(parsed.habits) ? parsed.habits : [],
        completions: Array.isArray(parsed.completions) ? parsed.completions : [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    } catch (e) {
      console.error('Failed to load storage from localStorage:', e);
      return {
        version: 1,
        habits: [],
        completions: [],
        settings: { ...DEFAULT_SETTINGS },
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  save(data: StorageDataV1): void {
    try {
      const payload: StorageDataV1 = {
        version: 1,
        habits: data.habits,
        completions: data.completions,
        settings: data.settings,
        lastUpdated: new Date().toISOString(),
      };
      safeSetItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },

  reset(): StorageDataV1 {
    const empty: StorageDataV1 = {
      version: 1,
      habits: [],
      completions: [],
      settings: { ...DEFAULT_SETTINGS, hasCompletedOnboarding: true },
      lastUpdated: new Date().toISOString(),
    };
    StorageService.save(empty);
    return empty;
  },

  loadDemo(): StorageDataV1 {
    const demo = generateDemoDataset();
    StorageService.save(demo);
    return demo;
  },

  exportJSON(data: StorageDataV1): string {
    return JSON.stringify(data, null, 2);
  },

  validateAndImportJSON(rawJSON: string): { success: boolean; data?: StorageDataV1; error?: string } {
    try {
      const parsed = JSON.parse(rawJSON);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Uploaded file is not a valid JSON object.' };
      }

      if (!Array.isArray(parsed.habits)) {
        return { success: false, error: 'JSON missing valid habits array.' };
      }

      if (!Array.isArray(parsed.completions)) {
        return { success: false, error: 'JSON missing valid completions array.' };
      }

      // Basic field validation on habits
      for (const h of parsed.habits) {
        if (!h.id || typeof h.name !== 'string' || !h.frequency || !h.startDate) {
          return { success: false, error: `Invalid habit entry found: ${h.name || 'Unnamed'}` };
        }
      }

      // Basic field validation on completions
      for (const c of parsed.completions) {
        if (!c.id || !c.habitId || !c.date) {
          return { success: false, error: 'Invalid completion record found in data.' };
        }
      }

      const imported: StorageDataV1 = {
        version: 1,
        habits: parsed.habits,
        completions: parsed.completions,
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}), isDemoData: false },
        lastUpdated: new Date().toISOString(),
      };

      StorageService.save(imported);
      return { success: true, data: imported };
    } catch (err: any) {
      return { success: false, error: `JSON Parse error: ${err.message}` };
    }
  },
};
