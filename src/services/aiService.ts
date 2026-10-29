import { ChatMessage, Habit, StreakStats } from '../types';

export interface HabitAiContext {
  activeHabits: (Habit & { currentStreak: number; completionRate: number })[];
  todayProgress: {
    totalScheduled: number;
    completedCount: number;
    percentage: number;
    remainingCount: number;
  };
  overallStreak: number;
  bestHabitStreak: number;
  displayName: string;
  language: string;
}

export const AiService = {
  async sendMessage(
    messages: { role: 'user' | 'model'; content: string }[],
    context: HabitAiContext
  ): Promise<{ reply: string; suggestedHabit?: any; isFallback?: boolean }> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply;

      // Check if model returned a suggested habit json block
      let suggestedHabit: any = undefined;
      const match = reply.match(/```suggested_habit\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        try {
          suggestedHabit = JSON.parse(match[1]);
        } catch (e) {
          // ignore parsing error
        }
      }

      // Clean the json block from reply display
      const cleanReply = reply.replace(/```suggested_habit[\s\S]*?```/g, '').trim();

      return { reply: cleanReply, suggestedHabit };
    } catch (err: any) {
      console.warn('Gemini server API error, generating contextual coaching guidance:', err);

      // Generate supportive, data-driven fallback based on user's actual context
      const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
      let fallbackText = '';

      if (lastMsg.includes('review') || lastMsg.includes('progress') || lastMsg.includes('weekly')) {
        const rate = context.todayProgress.percentage;
        const total = context.todayProgress.totalScheduled;
        fallbackText = `Here is your current consistency review based on your verified tracking:\n\n• **Today's Status:** ${context.todayProgress.completedCount}/${total} scheduled habits checked off (${rate}%).\n• **Overall Consistency Streak:** ${context.overallStreak} days running.\n• **Best Single Habit Streak:** ${context.bestHabitStreak} days.\n\n**Coaching Insight:** Remember James Clear's golden rule: "Never miss twice." If life disrupted your routine yesterday, today is your chance to cast a single vote for the person you want to become.`;
      } else if (lastMsg.includes('morning') || lastMsg.includes('routine')) {
        fallbackText = `To build a frictionless morning routine, start with a 2-minute anchor:\n\n1. **Anchor:** Tie it to an existing habit (e.g., right after brewing morning tea/coffee).\n2. **Micro-Habit:** Drink a tall glass of water + 5 minutes of focused reading or sunlight.\n3. **Prepare the Night Before:** Lay out your book or workout clothes where you can't miss them.\n\nKeep it so easy you can't say no on low-energy mornings!`;
      } else if (lastMsg.includes('attention') || lastMsg.includes('struggl')) {
        const lowest = [...context.activeHabits].sort((a, b) => a.completionRate - b.completionRate)[0];
        if (lowest) {
          fallbackText = `Looking at your records, **${lowest.name}** currently has a ${lowest.completionRate}% completion rate.\n\n**Strategy:** Reduce friction. Scale the habit down to a 2-minute version for 7 consecutive days (e.g. if it's reading 30 mins, scale to 1 page). Once consistency is effortless, scale the volume.`;
        } else {
          fallbackText = `All your tracked habits are holding up well! When routines start to feel heavy, focus on protecting your streaks with minimum viable effort rather than aiming for perfection.`;
        }
      } else if (lastMsg.includes('plan')) {
        fallbackText = `Here is a 7-day realistic consistency blueprint:\n\n• **Mon-Wed:** Prioritize your cornerstone habit first thing.\n• **Thu:** Mid-week check-in: if energy dips, do the 2-minute version.\n• **Fri-Sun:** Schedule a fixed time block so weekend schedule shifts don't disrupt momentum.\n\nSmall wins compound into dramatic results over time.`;
      } else {
        fallbackText = `I analyzed your ${context.activeHabits.length} active habits and current ${context.overallStreak}-day streak.\n\nEvery time you show up, you reinforce your identity. What is the single smallest action you can complete today to keep your momentum going?`;
      }

      return {
        reply: `${fallbackText}\n\n*(Notice: Live Gemini server responded: ${err.message}. Showing contextual behavioural coaching).*`,
        isFallback: true,
      };
    }
  },
};
