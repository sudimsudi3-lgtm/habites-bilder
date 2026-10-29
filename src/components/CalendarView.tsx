import React, { useState } from 'react';
import { Habit, HabitCompletionRecord } from '../types';
import { 
  getLocalDateString, 
  parseLocalDateString, 
  formatDisplayDate, 
  isHabitScheduledOnDate 
} from '../utils/dateUtils';
import { calculateDailyProgress } from '../utils/streakEngine';
import { HabitIcon } from './HabitIcon';
import { TranslationDictionary } from '../i18n/translations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  CheckCircle2, 
  Circle,
  Plus
} from 'lucide-react';

interface CalendarViewProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  onToggleCompletion: (habitId: string, dateStr: string) => void;
  onOpenDetailsModal: (habit: Habit, dateStr: string) => void;
  t: TranslationDictionary;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  habits,
  completions,
  onToggleCompletion,
  onOpenDetailsModal,
  t,
}) => {
  const todayStr = getLocalDateString();
  const [currentYear, setCurrentYear] = useState(parseLocalDateString(todayStr).getFullYear());
  const [currentMonth, setCurrentMonth] = useState(parseLocalDateString(todayStr).getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const now = parseLocalDateString(todayStr);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: i, isCurrentMonth: true });
  }

  // Trailing next month days to complete 35 or 42 grid cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: i, isCurrentMonth: false });
  }

  // Details for selected date
  const selectedDayProgress = calculateDailyProgress(habits, completions, selectedDate);
  const activeHabits = habits.filter((h) => !h.archived);
  const habitsForSelectedDate = activeHabits.filter((h) => isHabitScheduledOnDate(h, selectedDate));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F3F4F6] tracking-tight">{t.calendar.title}</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">{t.calendar.subtitle}</p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-[#151925] p-1.5 rounded-2xl border border-[#293043] self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-2 text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1A2030] rounded-xl transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-[#F3F4F6] px-3 font-mono">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button
            onClick={nextMonth}
            className="p-2 text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1A2030] rounded-xl transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#A78BFA] text-xs font-semibold transition border border-[#8B5CF6]/30 ml-1"
          >
            {t.calendar.today}
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar (Left 7-8 cols) + Selected Day Inspector (Right 4-5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-8 bg-[#151925] border border-[#293043] rounded-3xl p-5 sm:p-6 shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell) => {
              const dayStats = calculateDailyProgress(habits, completions, cell.dateStr);
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              const isFuture = cell.dateStr > todayStr;

              // Color badge calculation
              let badgeBg = 'bg-transparent text-transparent';
              let badgeBorder = 'border-transparent';
              let badgeText = '';

              if (dayStats.totalScheduled > 0 && !isFuture) {
                if (dayStats.percentage === 100) {
                  badgeBg = 'bg-[#34D399]/20 text-[#34D399]';
                  badgeBorder = 'border-[#34D399]/40';
                  badgeText = '100%';
                } else if (dayStats.percentage > 0) {
                  badgeBg = 'bg-[#8B5CF6]/20 text-[#A78BFA]';
                  badgeBorder = 'border-[#8B5CF6]/40';
                  badgeText = `${dayStats.percentage}%`;
                } else {
                  badgeBg = 'bg-[#1A2030] text-[#6B7280]';
                  badgeBorder = 'border-[#293043]';
                  badgeText = '0%';
                }
              }

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[88px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 ${
                    isSelected
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-md ring-1 ring-[#8B5CF6]'
                      : cell.isCurrentMonth
                      ? 'bg-[#10131B] border-[#293043] hover:border-[#3E4760]'
                      : 'bg-[#0B0D12]/40 border-transparent opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Top: Day Number and Today Indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-black'
                          : cell.isCurrentMonth
                          ? 'text-[#F3F4F6]'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Completion count small indicator */}
                    {dayStats.totalScheduled > 0 && !isFuture && (
                      <span className="text-[10px] font-mono text-[#9CA3AF]">
                        {dayStats.completedCount}/{dayStats.totalScheduled}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Progress Badge */}
                  <div className="mt-1">
                    {dayStats.totalScheduled > 0 && !isFuture ? (
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border text-center ${badgeBg} ${badgeBorder}`}>
                        {badgeText}
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector (Right Column) */}
        <div className="lg:col-span-4 bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-5 shadow-sm h-fit">
          <div className="border-b border-[#293043] pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
              <CalendarIcon className="w-4 h-4" />
              <span>Selected Date</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#F3F4F6] mt-1">
              {formatDisplayDate(selectedDate, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {selectedDayProgress.completedCount} of {selectedDayProgress.totalScheduled} completed ({selectedDayProgress.percentage}%)
            </p>
          </div>

          {/* Scheduled Habits list */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {habitsForSelectedDate.length === 0 ? (
              <div className="p-6 bg-[#10131B] rounded-2xl border border-[#293043] text-center text-xs text-[#9CA3AF] space-y-1">
                <p className="font-semibold text-[#F3F4F6]">{t.calendar.noHabitsOnDate}</p>
                <p>No active routines were scheduled on this calendar day.</p>
              </div>
            ) : (
              habitsForSelectedDate.map((habit) => {
                const isCompleted = completions.some(
                  (c) => c.habitId === habit.id && c.date === selectedDate
                );
                const record = completions.find(
                  (c) => c.habitId === habit.id && c.date === selectedDate
                );

                return (
                  <div
                    key={habit.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      isCompleted
                        ? 'bg-[#10131B] border-[#34D399]/30'
                        : 'bg-[#10131B] border-[#293043]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => onToggleCompletion(habit.id, selectedDate)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                            isCompleted
                              ? 'bg-[#34D399] text-[#0B0D12]'
                              : 'border-2 border-[#3E4760] hover:border-[#8B5CF6] bg-[#151925]'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#F3F4F6]'}`}>
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
                            <span>{habit.category}</span>
                            {habit.targetQuantity && (
                              <>
                                <span>•</span>
                                <span className="text-[#22D3EE] font-medium">
                                  Target: {habit.targetQuantity} {habit.targetUnit || ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Log details trigger */}
                      <button
                        onClick={() => onOpenDetailsModal(habit, selectedDate)}
                        className="text-[11px] font-semibold text-[#A78BFA] hover:text-[#F3F4F6] px-2 py-1 rounded-lg hover:bg-[#1A2030] transition shrink-0"
                      >
                        {record ? 'Edit Note' : '+ Note'}
                      </button>
                    </div>

                    {/* Note display if present */}
                    {record?.notes && (
                      <div className="mt-2.5 p-2 bg-[#151925] rounded-xl border border-[#293043] text-[11px] text-[#A78BFA] italic">
                        &ldquo;{record.notes}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
