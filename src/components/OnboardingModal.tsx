import React, { useState } from 'react';
import { STARTER_SUGGESTIONS } from '../services/storage';
import { Habit } from '../types';
import { HabitIcon } from './HabitIcon';
import { getLocalDateString } from '../utils/dateUtils';
import { Sparkles, ArrowRight, Check, X, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedHabits: Habit[]) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 3]); // Pick reading, workout, plan tomorrow by default
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<any>('Health & Fitness');

  if (!isOpen) return null;

  const toggleSuggestion = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleFinish = () => {
    const todayStr = getLocalDateString();
    const now = new Date().toISOString();

    const created: Habit[] = selectedIndices.map((idx, i) => {
      const template = STARTER_SUGGESTIONS[idx];
      return {
        ...template,
        id: `habit-${Date.now()}-${i}`,
        startDate: todayStr,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
    });

    if (customName.trim()) {
      created.push({
        id: `habit-${Date.now()}-custom`,
        name: customName.trim(),
        icon: 'Sparkles',
        color: '#8B5CF6',
        category: customCategory,
        frequency: 'daily',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        weeklyTarget: 7,
        startDate: todayStr,
        reminderEnabled: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    onComplete(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#151925] border border-[#293043] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
        role="dialog"
      >
        {/* Header with step indicators */}
        <div className="px-6 py-4 border-b border-[#293043] flex items-center justify-between bg-[#10131B]/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center font-bold text-xs">
              {step}/3
            </div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              {step === 1 && 'Welcome'}
              {step === 2 && 'Select Habits'}
              {step === 3 && 'Your Custom Habit'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6] font-medium transition px-2 py-1 rounded-md hover:bg-[#1A2030]"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#8B5CF6] to-[#22D3EE] p-0.5 mx-auto shadow-lg shadow-[#8B5CF6]/30">
              <div className="w-full h-full bg-[#151925] rounded-[14px] flex items-center justify-center text-[#A78BFA]">
                <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#F3F4F6]">
                Welcome to Habit Builder AI
              </h2>
              <p className="text-sm text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
                Small actions lead to meaningful progress. Consistency matters far more than perfection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3.5 bg-[#10131B] rounded-2xl border border-[#293043]">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center font-bold text-xs mb-2">
                  01
                </div>
                <h4 className="text-xs font-bold text-[#F3F4F6]">Micro-Routines</h4>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Start tiny so friction is low on busy days.</p>
              </div>

              <div className="p-3.5 bg-[#10131B] rounded-2xl border border-[#293043]">
                <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center font-bold text-xs mb-2">
                  02
                </div>
                <h4 className="text-xs font-bold text-[#F3F4F6]">Honest Analytics</h4>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Streaks calculated from true logs, no fake metrics.</p>
              </div>

              <div className="p-3.5 bg-[#10131B] rounded-2xl border border-[#293043]">
                <div className="w-7 h-7 rounded-lg bg-[#34D399]/20 text-[#34D399] flex items-center justify-center font-bold text-xs mb-2">
                  03
                </div>
                <h4 className="text-xs font-bold text-[#F3F4F6]">AI Guidance</h4>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Gemini AI coach tailored to your real history.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-sm shadow-lg shadow-[#8B5CF6]/25 transition flex items-center justify-center gap-2 mx-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pick suggested habits */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#F3F4F6]">Pick starter habits</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Choose 1 to 4 cornerstone habits to establish momentum. You can adjust schedules anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {STARTER_SUGGESTIONS.map((s, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => toggleSuggestion(idx)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]'
                        : 'bg-[#10131B] border-[#293043] hover:border-[#3E4760]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${s.color}25`, color: s.color }}
                    >
                      <HabitIcon name={s.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F3F4F6] truncate">{s.name}</span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center ${
                            isSelected ? 'bg-[#8B5CF6] text-white' : 'border border-[#293043]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] line-clamp-2 mt-1 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#293043]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Optional Custom Habit */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#F3F4F6]">Add a personal goal</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Have a specific habit in mind? Enter it below or finish right away with your selections.
              </p>
            </div>

            <div className="space-y-3 bg-[#10131B] p-4 rounded-2xl border border-[#293043]">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                  Custom Habit Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Practice Spanish on Duolingo, Write journal"
                  className="w-full bg-[#151925] border border-[#293043] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-[#151925] border border-[#293043] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-hidden"
                >
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Learning & Study">Learning & Study</option>
                  <option value="Reading">Reading</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Sleep Routine">Sleep Routine</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl flex items-center gap-3 text-xs text-[#A78BFA]">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#22D3EE]" />
              <span>You have selected {selectedIndices.length + (customName.trim() ? 1 : 0)} habits. You can edit them anytime.</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#293043]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-7 py-2.5 rounded-xl bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] text-white font-bold text-xs shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
