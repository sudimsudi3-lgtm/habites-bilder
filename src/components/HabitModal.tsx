import React, { useState, useEffect } from 'react';
import { Habit, HabitCategory, HabitFrequency } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS, HabitIcon } from './HabitIcon';
import { getLocalDateString } from '../utils/dateUtils';
import { X, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'archived'> & { id?: string }) => void;
  habitToEdit?: Habit | null;
}

const CATEGORIES: HabitCategory[] = [
  'Health & Fitness',
  'Learning & Study',
  'Reading',
  'Productivity',
  'Mindfulness',
  'Personal Growth',
  'Sleep Routine',
  'Custom',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  habitToEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Health & Fitness');
  const [icon, setIcon] = useState('Sparkles');
  const [color, setColor] = useState('#8B5CF6');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(4);
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [targetQuantity, setTargetQuantity] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category);
      setIcon(habitToEdit.icon || 'Sparkles');
      setColor(habitToEdit.color || '#8B5CF6');
      setFrequency(habitToEdit.frequency);
      setWeekdays(habitToEdit.weekdays || [1, 2, 3, 4, 5]);
      setWeeklyTarget(habitToEdit.weeklyTarget || 4);
      setStartDate(habitToEdit.startDate || getLocalDateString());
      setTargetQuantity(habitToEdit.targetQuantity ? String(habitToEdit.targetQuantity) : '');
      setTargetUnit(habitToEdit.targetUnit || '');
      setReminderEnabled(habitToEdit.reminderEnabled);
      setReminderTime(habitToEdit.reminderTime || '08:00');
    } else {
      setName('');
      setDescription('');
      setCategory('Health & Fitness');
      setIcon('Sparkles');
      setColor('#8B5CF6');
      setFrequency('daily');
      setWeekdays([0, 1, 2, 3, 4, 5, 6]);
      setWeeklyTarget(4);
      setStartDate(getLocalDateString());
      setTargetQuantity('');
      setTargetUnit('');
      setReminderEnabled(false);
      setReminderTime('08:00');
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      if (weekdays.length === 1) return; // Keep at least one
      setWeekdays(weekdays.filter((d) => d !== day));
    } else {
      setWeekdays([...weekdays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a name for your habit.');
      return;
    }

    if (frequency === 'weekdays' && weekdays.length === 0) {
      setError('Please select at least one weekday for this habit.');
      return;
    }

    const parsedQty = targetQuantity ? parseFloat(targetQuantity) : undefined;
    if (targetQuantity && (isNaN(parsedQty!) || parsedQty! <= 0)) {
      setError('Target quantity must be a positive number.');
      return;
    }

    onSave({
      id: habitToEdit?.id,
      name: trimmedName,
      description: description.trim() || undefined,
      category,
      icon,
      color,
      frequency,
      weekdays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : weekdays,
      weeklyTarget: frequency === 'weekly_target' ? weeklyTarget : weekdays.length,
      startDate,
      targetQuantity: parsedQty,
      targetUnit: targetUnit.trim() || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-[#151925] border border-[#293043] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#293043] flex items-center justify-between bg-[#10131B]/80">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <HabitIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 id="habit-modal-title" className="text-lg font-bold text-[#F3F4F6]">
                {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Small actions compound into remarkable consistency.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-lg hover:bg-[#1A2030] transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl flex items-center gap-2 text-[#F87171] text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                Habit Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read for 20 minutes, 10 Pushups, Drink Water"
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                Why / Intention (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Sharpens my mind and helps me wind down before bed."
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-hidden focus:border-[#8B5CF6] transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-2 text-xs rounded-xl border text-center transition font-medium ${
                    category === cat
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                      : 'bg-[#10131B] border-[#293043] text-[#9CA3AF] hover:border-[#3E4760] hover:text-[#F3F4F6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Icon Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full transition transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#10131B] rounded-xl border border-[#293043]">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-lg transition ${
                      icon === ic
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1A2030]'
                    }`}
                  >
                    <HabitIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frequency & Schedule */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'daily', label: 'Every Day' },
                { id: 'weekdays', label: 'Selected Days' },
                { id: 'weekly_target', label: 'Weekly Target' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id as HabitFrequency)}
                  className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                    frequency === f.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                      : 'bg-[#10131B] border-[#293043] text-[#9CA3AF] hover:border-[#3E4760]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {frequency === 'weekdays' && (
              <div className="flex items-center justify-between gap-1 p-3 bg-[#10131B] border border-[#293043] rounded-xl">
                {WEEKDAY_NAMES.map((name, idx) => {
                  const isSelected = weekdays.includes(idx);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleWeekday(idx)}
                      className={`w-9 h-9 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-[#8B5CF6] text-white shadow-xs'
                          : 'bg-[#1A2030] text-[#9CA3AF] hover:text-[#F3F4F6]'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}

            {frequency === 'weekly_target' && (
              <div className="p-3 bg-[#10131B] border border-[#293043] rounded-xl flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">Days per week:</span>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWeeklyTarget(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        weeklyTarget === num
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-[#1A2030] text-[#9CA3AF] hover:text-[#F3F4F6]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Target Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                Target Quantity (Optional)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                placeholder="e.g. 20, 5, 2000"
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-hidden focus:border-[#8B5CF6] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                Unit (Optional)
              </label>
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="e.g. pages, mins, ml, steps"
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-hidden focus:border-[#8B5CF6] transition"
              />
            </div>
          </div>

          {/* Start Date & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Start Tracking From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-hidden focus:border-[#8B5CF6] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
                Daily Reminder
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminderToggle"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-4 h-4 rounded-sm bg-[#10131B] border-[#293043] text-[#8B5CF6] focus:ring-0"
                />
                <input
                  type="time"
                  disabled={!reminderEnabled}
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className={`w-full bg-[#10131B] border border-[#293043] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] transition ${
                    !reminderEnabled ? 'opacity-40 cursor-not-allowed' : 'focus:border-[#8B5CF6]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-[#293043] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1A2030] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9061F9] hover:to-[#6D28D9] text-white shadow-lg shadow-[#8B5CF6]/20 transition flex items-center gap-2"
            >
              {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
