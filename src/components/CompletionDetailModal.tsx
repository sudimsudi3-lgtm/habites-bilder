import React, { useState, useEffect } from 'react';
import { Habit, HabitCompletionRecord } from '../types';
import { X, CheckCircle2, MessageSquare, Target } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils';

interface CompletionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  dateStr: string;
  existingRecord?: HabitCompletionRecord;
  onSave: (habitId: string, dateStr: string, quantity?: number, notes?: string) => void;
}

export const CompletionDetailModal: React.FC<CompletionDetailModalProps> = ({
  isOpen,
  onClose,
  habit,
  dateStr,
  existingRecord,
  onSave,
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existingRecord) {
      setQuantity(existingRecord.quantity !== undefined ? String(existingRecord.quantity) : '');
      setNotes(existingRecord.notes || '');
    } else if (habit?.targetQuantity) {
      setQuantity(String(habit.targetQuantity));
      setNotes('');
    } else {
      setQuantity('');
      setNotes('');
    }
  }, [existingRecord, habit, isOpen]);

  if (!isOpen || !habit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = quantity ? parseFloat(quantity) : undefined;
    onSave(habit.id, dateStr, parsedQty, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="bg-[#151925] border border-[#293043] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200"
        role="dialog"
      >
        <div className="px-6 py-4 border-b border-[#293043] flex items-center justify-between bg-[#10131B]/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
            <h3 className="text-base font-bold text-[#F3F4F6]">
              {existingRecord ? 'Edit Log Entry' : 'Log Completion Details'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-[#10131B] rounded-xl border border-[#293043]">
            <p className="text-sm font-semibold text-[#F3F4F6]">{habit.name}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Date: <span className="text-[#A78BFA] font-medium">{formatDisplayDate(dateStr)}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#22D3EE]" />
              Amount / Quantity Achieved
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={habit.targetQuantity ? `Target: ${habit.targetQuantity}` : 'e.g. 20, 30'}
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2 text-sm text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-hidden"
                autoFocus
              />
              {habit.targetUnit && (
                <span className="text-xs text-[#9CA3AF] font-semibold px-2 py-1 bg-[#1A2030] rounded-lg shrink-0">
                  {habit.targetUnit}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#A78BFA]" />
              Reflection or Note (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Felt energized today, finished ahead of schedule!"
              className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[#8B5CF6] focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#293043] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:bg-[#1A2030]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-md transition"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
