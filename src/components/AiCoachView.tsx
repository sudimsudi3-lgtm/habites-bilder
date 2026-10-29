import React, { useState, useRef, useEffect } from 'react';
import { Habit, HabitCompletionRecord, ChatMessage } from '../types';
import { AiService, HabitAiContext } from '../services/aiService';
import { calculateDailyProgress, calculateHabitStreak, calculateOverallConsistencyStreak } from '../utils/streakEngine';
import { getLocalDateString } from '../utils/dateUtils';
import { TranslationDictionary } from '../i18n/translations';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Plus, 
  Flame, 
  AlertCircle, 
  Lightbulb, 
  RefreshCw,
  Check
} from 'lucide-react';

interface AiCoachViewProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  displayName: string;
  language: string;
  onAdoptHabit: (habitData: Partial<Habit>) => void;
  t: TranslationDictionary;
}

export const AiCoachView: React.FC<AiCoachViewProps> = ({
  habits,
  completions,
  displayName,
  language,
  onAdoptHabit,
  t,
}) => {
  const todayStr = getLocalDateString();
  const activeHabits = habits.filter((h) => !h.archived);

  // Compile context
  const todayProgress = calculateDailyProgress(habits, completions, todayStr);
  const overallStreak = calculateOverallConsistencyStreak(habits, completions, todayStr);
  let bestHabitStreak = 0;
  activeHabits.forEach((h) => {
    const s = calculateHabitStreak(h, completions, todayStr);
    if (s.longestStreak > bestHabitStreak) bestHabitStreak = s.longestStreak;
  });

  const habitsWithStats = activeHabits.map((h) => {
    const s = calculateHabitStreak(h, completions, todayStr);
    return {
      ...h,
      currentStreak: s.currentStreak,
      completionRate: s.completionRate,
    };
  });

  const aiContext: HabitAiContext = {
    activeHabits: habitsWithStats,
    todayProgress,
    overallStreak,
    bestHabitStreak,
    displayName,
    language,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-coach',
      role: 'model',
      content: `Hello ${displayName || 'friend'}! I am your AI Habit Coach.\n\nI have access to your active routines, real completion records, and current ${overallStreak}-day streak. How can I help you build consistency today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adoptedHabitIds, setAdoptedHabitIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const serverMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await AiService.sendMessage(serverMessages, aiContext);

      const botMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedHabit: res.suggestedHabit,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `Unable to connect to AI server. ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdopt = (msgId: string, habitData: any) => {
    onAdoptHabit(habitData);
    setAdoptedHabitIds((prev) => new Set(prev).add(msgId));
  };

  const suggestedPrompts = [
    t.aiCoach.prompt1,
    t.aiCoach.prompt2,
    t.aiCoach.prompt3,
    t.aiCoach.prompt4,
    t.aiCoach.prompt5,
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#F3F4F6] tracking-tight">{t.aiCoach.title}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
              {t.aiCoach.badge}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">{t.aiCoach.subtitle}</p>
        </div>

        {/* Real Context Badge */}
        <div className="flex items-center gap-3 p-2 bg-[#151925] border border-[#293043] rounded-2xl text-xs text-[#9CA3AF] self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[#F3F4F6] font-semibold">{activeHabits.length} Habits Tracked</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-[#FBBF24]">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold">{overallStreak}d streak</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>{t.aiCoach.suggestedHeading}</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#151925] border border-[#293043] hover:border-[#8B5CF6] text-[#9CA3AF] hover:text-[#F3F4F6] whitespace-nowrap transition font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-[#151925] border border-[#293043] rounded-3xl shadow-xl overflow-hidden flex flex-col h-[540px]">
        {/* Messages list */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const hasAdopted = adoptedHabitIds.has(m.id);

            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#8B5CF6] text-white shadow-xs'
                      : 'bg-[#10131B] border border-[#293043] text-[#22D3EE]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-tr-xs shadow-md'
                        : 'bg-[#10131B] border border-[#293043] text-[#F3F4F6] rounded-tl-xs whitespace-pre-wrap'
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* If coach generated a suggested habit blueprint */}
                  {m.suggestedHabit && (
                    <div className="p-3.5 bg-[#1A2030] border border-[#8B5CF6]/40 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#A78BFA] tracking-wider">
                          Suggested Habit Blueprint
                        </span>
                        <p className="font-bold text-[#F3F4F6] mt-0.5">{m.suggestedHabit.name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">
                          {m.suggestedHabit.category} • {m.suggestedHabit.targetQuantity || 15} {m.suggestedHabit.targetUnit || 'mins'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAdopt(m.id, m.suggestedHabit)}
                        disabled={hasAdopted}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                          hasAdopted
                            ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                            : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-md'
                        }`}
                      >
                        {hasAdopted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{t.aiCoach.adoptHabit}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-[#6B7280] font-mono ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-[#10131B] border border-[#293043] text-[#22D3EE] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 bg-[#10131B] border border-[#293043] rounded-2xl rounded-tl-xs text-xs text-[#9CA3AF] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" />
                <span>{t.aiCoach.thinking}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-[#293043] bg-[#10131B] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.aiCoach.placeholder}
            disabled={isLoading}
            className="flex-1 bg-[#151925] border border-[#293043] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:border-[#8B5CF6] focus:outline-hidden transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9061F9] hover:to-[#6D28D9] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#8B5CF6]/20 transition disabled:opacity-40"
          >
            <span>{t.aiCoach.send}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
