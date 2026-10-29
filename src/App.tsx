/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Habit, HabitCompletionRecord, UserSettings, StorageDataV1 } from './types';
import { StorageService } from './services/storage';
import { getLocalDateString } from './utils/dateUtils';
import { calculateDailyProgress, calculateOverallConsistencyStreak } from './utils/streakEngine';
import { translations, TranslationDictionary } from './i18n/translations';

// Navigation & Layout Components
import { Sidebar, NavView } from './components/Sidebar';
import { TopBar } from './components/TopBar';

// Views
import { DashboardView } from './components/DashboardView';
import { HabitsView } from './components/HabitsView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiCoachView } from './components/AiCoachView';
import { SettingsView } from './components/SettingsView';

// Modals
import { HabitModal } from './components/HabitModal';
import { CompletionDetailModal } from './components/CompletionDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { TestRunnerModal } from './components/TestRunnerModal';

export default function App() {
  const [data, setData] = useState<StorageDataV1>(() => StorageService.load());
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean;
    habit: Habit | null;
    dateStr: string;
  }>({
    isOpen: false,
    habit: null,
    dateStr: getLocalDateString(),
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);

  // Auto-trigger onboarding if first time
  useEffect(() => {
    if (!data.settings.hasCompletedOnboarding && data.habits.length === 0) {
      setIsOnboardingOpen(true);
    }
  }, [data.settings.hasCompletedOnboarding, data.habits.length]);

  // Sync state changes to storage
  const persist = (updater: (prev: StorageDataV1) => StorageDataV1) => {
    setData((prev) => {
      const next = updater(prev);
      StorageService.save(next);
      return next;
    });
  };

  const todayStr = getLocalDateString();
  const t: TranslationDictionary = translations[data.settings.language] || translations.en;

  // Real-time calculations
  const dailyProgress = calculateDailyProgress(data.habits, data.completions, todayStr);
  const overallStreak = calculateOverallConsistencyStreak(data.habits, data.completions, todayStr);

  // --- CRUD Handlers ---

  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'archived'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    persist((prev) => {
      if (habitData.id) {
        // Edit existing habit
        const updatedHabits = prev.habits.map((h) => {
          if (h.id === habitData.id) {
            return {
              ...h,
              ...habitData,
              id: h.id,
              archived: h.archived,
              createdAt: h.createdAt,
              updatedAt: now,
            } as Habit;
          }
          return h;
        });
        return { ...prev, habits: updatedHabits };
      } else {
        // Create new habit
        const newHabit: Habit = {
          ...habitData,
          id: `habit-${Date.now()}`,
          archived: false,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, habits: [newHabit, ...prev.habits] };
      }
    });
    setEditingHabit(null);
  };

  const handleToggleCompletion = (habitId: string, dateStr: string) => {
    persist((prev) => {
      const existingIdx = prev.completions.findIndex(
        (c) => c.habitId === habitId && c.date === dateStr
      );

      let nextCompletions: HabitCompletionRecord[];
      if (existingIdx >= 0) {
        // Remove completion
        nextCompletions = prev.completions.filter((_, idx) => idx !== existingIdx);
      } else {
        // Add completion
        const newRecord: HabitCompletionRecord = {
          id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          habitId,
          date: dateStr,
          completedAt: new Date().toISOString(),
        };
        nextCompletions = [newRecord, ...prev.completions];
      }

      return { ...prev, completions: nextCompletions };
    });
  };

  const handleSaveCompletionDetail = (
    habitId: string,
    dateStr: string,
    quantity?: number,
    notes?: string
  ) => {
    persist((prev) => {
      const existingIdx = prev.completions.findIndex(
        (c) => c.habitId === habitId && c.date === dateStr
      );

      let nextCompletions: HabitCompletionRecord[];
      if (existingIdx >= 0) {
        nextCompletions = prev.completions.map((c, idx) => {
          if (idx === existingIdx) {
            return { ...c, quantity, notes };
          }
          return c;
        });
      } else {
        const newRecord: HabitCompletionRecord = {
          id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          habitId,
          date: dateStr,
          completedAt: new Date().toISOString(),
          quantity,
          notes,
        };
        nextCompletions = [newRecord, ...prev.completions];
      }

      return { ...prev, completions: nextCompletions };
    });
  };

  const handleArchiveHabit = (habitId: string) => {
    persist((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, archived: true } : h)),
    }));
  };

  const handleUnarchiveHabit = (habitId: string) => {
    persist((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, archived: false } : h)),
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    persist((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
      completions: prev.completions.filter((c) => c.habitId !== habitId),
    }));
  };

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    persist((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  };

  // Export JSON
  const handleExportData = () => {
    const jsonStr = StorageService.exportJSON(data);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-builder-ai-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportData = async (file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      const text = await file.text();
      const res = StorageService.validateAndImportJSON(text);
      if (res.success && res.data) {
        setData(res.data);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Demo Dataset
  const handleLoadDemo = () => {
    const demo = StorageService.loadDemo();
    setData(demo);
  };

  // Reset Data
  const handleResetData = () => {
    const empty = StorageService.reset();
    setData(empty);
  };

  // Onboarding Complete
  const handleOnboardingComplete = (selectedHabits: Habit[]) => {
    persist((prev) => ({
      ...prev,
      habits: [...selectedHabits, ...prev.habits],
      settings: { ...prev.settings, hasCompletedOnboarding: true },
    }));
  };

  // Adopt habit suggested by AI Coach
  const handleAdoptSuggestedHabit = (habitBlueprint: Partial<Habit>) => {
    setEditingHabit({
      id: '',
      name: habitBlueprint.name || 'New Habit',
      description: habitBlueprint.description || '',
      icon: habitBlueprint.icon || 'Sparkles',
      color: habitBlueprint.color || '#8B5CF6',
      category: habitBlueprint.category || 'Health & Fitness',
      frequency: habitBlueprint.frequency || 'daily',
      weekdays: habitBlueprint.weekdays || [0, 1, 2, 3, 4, 5, 6],
      weeklyTarget: habitBlueprint.weeklyTarget || 7,
      startDate: todayStr,
      targetQuantity: habitBlueprint.targetQuantity,
      targetUnit: habitBlueprint.targetUnit,
      reminderEnabled: false,
      archived: false,
      createdAt: '',
      updatedAt: '',
    });
    setIsHabitModalOpen(true);
  };

  // Page Title mapping
  const pageTitles: Record<NavView, string> = {
    dashboard: t.nav.dashboard,
    habits: t.nav.habits,
    calendar: t.nav.calendar,
    analytics: t.nav.analytics,
    aiCoach: t.nav.aiCoach,
    settings: t.nav.settings,
  };

  return (
    <div className="flex min-h-screen bg-[#0B0D12] text-[#F3F4F6]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        remainingCount={dailyProgress.remainingCount}
        currentStreak={overallStreak}
        isDemoData={data.settings.isDemoData}
        t={t}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          pageTitle={pageTitles[currentView]}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddHabit={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          language={data.settings.language}
          onLanguageChange={(lang) => handleUpdateSettings({ language: lang })}
          displayName={data.settings.displayName}
          t={t}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              habits={data.habits}
              completions={data.completions}
              onToggleCompletion={handleToggleCompletion}
              onOpenAddHabit={() => {
                setEditingHabit(null);
                setIsHabitModalOpen(true);
              }}
              onEditHabit={(h) => {
                setEditingHabit(h);
                setIsHabitModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
              onArchiveHabit={handleArchiveHabit}
              onOpenDetailsModal={(h, dateStr) =>
                setDetailModalState({ isOpen: true, habit: h, dateStr })
              }
              displayName={data.settings.displayName}
              soundEnabled={data.settings.soundEffectsEnabled}
              searchQuery={searchQuery}
              t={t}
            />
          )}

          {currentView === 'habits' && (
            <HabitsView
              habits={data.habits}
              completions={data.completions}
              onOpenAddHabit={() => {
                setEditingHabit(null);
                setIsHabitModalOpen(true);
              }}
              onEditHabit={(h) => {
                setEditingHabit(h);
                setIsHabitModalOpen(true);
              }}
              onArchiveHabit={handleArchiveHabit}
              onUnarchiveHabit={handleUnarchiveHabit}
              onDeleteHabit={handleDeleteHabit}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              t={t}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              habits={data.habits}
              completions={data.completions}
              onToggleCompletion={handleToggleCompletion}
              onOpenDetailsModal={(h, dateStr) =>
                setDetailModalState({ isOpen: true, habit: h, dateStr })
              }
              t={t}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              habits={data.habits}
              completions={data.completions}
              t={t}
            />
          )}

          {currentView === 'aiCoach' && (
            <AiCoachView
              habits={data.habits}
              completions={data.completions}
              displayName={data.settings.displayName}
              language={data.settings.language}
              onAdoptHabit={handleAdoptSuggestedHabit}
              t={t}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={data.settings}
              onUpdateSettings={handleUpdateSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onLoadDemo={handleLoadDemo}
              onResetData={handleResetData}
              onReplayOnboarding={() => setIsOnboardingOpen(true)}
              t={t}
            />
          )}
        </main>
      </div>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        habitToEdit={editingHabit}
      />

      {/* Completion Detail / Note Modal */}
      <CompletionDetailModal
        isOpen={detailModalState.isOpen}
        onClose={() =>
          setDetailModalState({ isOpen: false, habit: null, dateStr: todayStr })
        }
        habit={detailModalState.habit}
        dateStr={detailModalState.dateStr}
        existingRecord={data.completions.find(
          (c) =>
            c.habitId === detailModalState.habit?.id && c.date === detailModalState.dateStr
        )}
        onSave={handleSaveCompletionDetail}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          handleUpdateSettings({ hasCompletedOnboarding: true });
        }}
        onComplete={handleOnboardingComplete}
      />

      {/* Part 17 Automated Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
    </div>
  );
}
