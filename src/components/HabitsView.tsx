import React, { useState } from 'react';
import { Habit, HabitCompletionRecord, HabitCategory } from '../types';
import { calculateHabitStreak } from '../utils/streakEngine';
import { getLocalDateString, formatDisplayDate } from '../utils/dateUtils';
import { HabitIcon } from './HabitIcon';
import { TranslationDictionary } from '../i18n/translations';
import { 
  Plus, 
  Search, 
  Flame, 
  Award, 
  Edit2, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  Clock, 
  Target,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface HabitsViewProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  onOpenAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onArchiveHabit: (habitId: string) => void;
  onUnarchiveHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  t: TranslationDictionary;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  completions,
  onOpenAddHabit,
  onEditHabit,
  onArchiveHabit,
  onUnarchiveHabit,
  onDeleteHabit,
  searchQuery,
  onSearchChange,
  t,
}) => {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const todayStr = getLocalDateString();

  const categories: (HabitCategory | 'all')[] = [
    'all',
    'Health & Fitness',
    'Learning & Study',
    'Reading',
    'Productivity',
    'Mindfulness',
    'Personal Growth',
    'Sleep Routine',
    'Custom',
  ];

  const filteredHabits = habits.filter((h) => {
    // Tab filter
    if (tab === 'active' && h.archived) return false;
    if (tab === 'archived' && !h.archived) return false;

    // Category filter
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchDesc = h.description?.toLowerCase().includes(q);
      const matchCat = h.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  const habitToDelete = habits.find((h) => h.id === deleteConfirmationId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F3F4F6] tracking-tight">{t.habits.title}</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">{t.habits.subtitle}</p>
        </div>

        <button
          onClick={onOpenAddHabit}
          className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#8B5CF6]/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.habits.newHabit}</span>
        </button>
      </div>

      {/* Controls: Search, Tabs & Categories */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Active vs Archived Tabs */}
          <div className="flex items-center bg-[#151925] p-1 rounded-xl border border-[#293043] self-start">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                tab === 'active'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {t.habits.active} ({habits.filter((h) => !h.archived).length})
            </button>
            <button
              onClick={() => setTab('archived')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                tab === 'archived'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {t.habits.archived} ({habits.filter((h) => h.archived).length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.habits.searchPlaceholder}
              className="w-full bg-[#151925] border border-[#293043] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[#8B5CF6] focus:outline-hidden transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-medium ${
                selectedCategory === cat
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                  : 'bg-[#151925] border-[#293043] text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {cat === 'all' ? t.dashboard.allCategories : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length === 0 ? (
        <div className="bg-[#151925] border border-[#293043] rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A2030] text-[#9CA3AF] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F3F4F6]">{t.habits.noHabitsFound}</h3>
            <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">{t.habits.createFirstHabit}</p>
          </div>
          {tab === 'active' && (
            <button
              onClick={onOpenAddHabit}
              className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-md shadow-[#8B5CF6]/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.habits.newHabit}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => {
            const streakStats = calculateHabitStreak(habit, completions, todayStr);

            return (
              <div
                key={habit.id}
                className="bg-[#151925] border border-[#293043] hover:border-[#3E4760] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm"
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    >
                      <HabitIcon name={habit.icon} className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#10131B] text-[#9CA3AF] border border-[#293043]">
                        {habit.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#F3F4F6] line-clamp-1">{habit.name}</h3>
                    {habit.description ? (
                      <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2 leading-relaxed">
                        {habit.description}
                      </p>
                    ) : (
                      <p className="text-xs text-[#6B7280] italic mt-1">No description provided</p>
                    )}
                  </div>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#293043]/60">
                    <div className="p-2.5 bg-[#10131B] rounded-xl border border-[#293043]">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-[#9CA3AF] uppercase">
                        <Flame className="w-3 h-3 text-[#FBBF24]" />
                        <span>Current Streak</span>
                      </div>
                      <div className="text-base font-extrabold text-[#F3F4F6] mt-0.5 tabular-nums">
                        {streakStats.currentStreak} <span className="text-xs font-normal text-[#9CA3AF]">days</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#10131B] rounded-xl border border-[#293043]">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-[#9CA3AF] uppercase">
                        <Award className="w-3 h-3 text-[#A78BFA]" />
                        <span>Best Streak</span>
                      </div>
                      <div className="text-base font-extrabold text-[#A78BFA] mt-0.5 tabular-nums">
                        {streakStats.longestStreak} <span className="text-xs font-normal text-[#9CA3AF]">days</span>
                      </div>
                    </div>
                  </div>

                  {/* Habit Metadata */}
                  <div className="space-y-1.5 text-[11px] text-[#9CA3AF] pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#8B5CF6]" />
                        <span>Schedule:</span>
                      </span>
                      <span className="font-medium text-[#F3F4F6]">
                        {habit.frequency === 'daily' && 'Every Day'}
                        {habit.frequency === 'weekdays' && `${habit.weekdays.length} days / week`}
                        {habit.frequency === 'weekly_target' && `${habit.weeklyTarget}x weekly goal`}
                      </span>
                    </div>

                    {habit.targetQuantity && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-[#22D3EE]" />
                          <span>Target:</span>
                        </span>
                        <span className="font-medium text-[#22D3EE]">
                          {habit.targetQuantity} {habit.targetUnit || ''}
                        </span>
                      </div>
                    )}

                    {habit.reminderEnabled && habit.reminderTime && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#34D399]" />
                          <span>Reminder:</span>
                        </span>
                        <span className="font-medium text-[#34D399] font-mono">{habit.reminderTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-[#293043] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onEditHabit(habit)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#10131B] border border-[#293043] text-xs font-semibold text-[#F3F4F6] hover:bg-[#1A2030] hover:border-[#8B5CF6] transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>{t.habits.edit}</span>
                  </button>

                  {habit.archived ? (
                    <button
                      onClick={() => onUnarchiveHabit(habit.id)}
                      className="p-2 rounded-xl bg-[#10131B] border border-[#293043] text-[#34D399] hover:bg-[#1A2030] transition"
                      title={t.habits.unarchive}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchiveHabit(habit.id)}
                      className="p-2 rounded-xl bg-[#10131B] border border-[#293043] text-[#FBBF24] hover:bg-[#1A2030] transition"
                      title={t.habits.archive}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirmationId(habit.id)}
                    className="p-2 rounded-xl bg-[#10131B] border border-[#293043] text-[#F87171] hover:bg-[#1A2030] transition"
                    title={t.habits.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#F87171]/15 text-[#F87171] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F3F4F6]">{t.habits.deleteConfirmTitle}</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                You are about to permanently delete <strong className="text-[#F3F4F6]">{habitToDelete.name}</strong>. {t.habits.deleteConfirmText}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:bg-[#1A2030]"
              >
                {t.habits.cancel}
              </button>
              <button
                onClick={() => {
                  onDeleteHabit(deleteConfirmationId);
                  setDeleteConfirmationId(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#F87171] hover:bg-[#EF4444] text-white shadow-md transition"
              >
                {t.habits.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
