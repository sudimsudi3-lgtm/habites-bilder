import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Gemini AI Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured in this environment.',
        details: 'You can configure your key in the Secrets panel, or continue using Habit Builder AI with built-in behavioral guidance.'
      });
    }

    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const activeHabitsList = context?.activeHabits?.map((h: any) => 
      `- ${h.name} (${h.category}, frequency: ${h.frequency}, target: ${h.targetQuantity || 'N/A'} ${h.targetUnit || ''}, current streak: ${h.currentStreak || 0} days, completion rate: ${h.completionRate || 0}%)`
    ).join('\n') || 'None recorded yet';

    const systemInstruction = `You are the Habit Builder AI Coach, an expert behavioural psychologist and supportive routine architect.
Your philosophy is inspired by James Clear (Atomic Habits) and Dr. B.J. Fogg (Tiny Habits):
- Focus on consistency over perfection. Small actions compound into remarkable transformations.
- Never shame, guilt-trip, or scold the user for missed days. Missed days are data points, not failures.
- Encourage with rules like "Never miss twice" and lowering friction.
- Distinguish between real observed data and suggestions. Refer directly to the user's tracked habits when relevant.
- When recommending habits, keep them realistic and tiny (e.g. 5 minutes or 2 pages).
- If the user asks for a habit, you can optionally format a clean JSON block at the very end of your response with the schema:
  \`\`\`suggested_habit
  {"name": "...", "category": "Reading", "frequency": "daily", "targetQuantity": 15, "targetUnit": "mins"}
  \`\`\`

USER TRACKED DATA CONTEXT:
Active Habits (${context?.activeHabits?.length || 0}):
${activeHabitsList}

Today's completion rate: ${context?.todayProgress?.percentage ?? 'N/A'}% (${context?.todayProgress?.completedCount ?? 0}/${context?.todayProgress?.totalScheduled ?? 0} scheduled habits)
Current Consistency Streak: ${context?.overallStreak ?? 0} days
Best Habit Streak: ${context?.bestHabitStreak ?? 0} days
Selected Language: ${context?.language || 'English'}
User Name: ${context?.displayName || 'User'}`;

    // Transform chat messages for @google/genai contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here to support your habit consistency. What goal would you like to work on today?";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Server error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to communicate with AI model.',
    });
  }
});

// Start dev or production server
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Habit Builder AI] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
