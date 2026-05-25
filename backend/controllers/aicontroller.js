const { GoogleGenerativeAI } = require('@google/generative-ai');
const AILog = require('../models/AILog');
const PlatformConfig = require('../models/PlatformConfig');
const ScenarioSession = require('../models/ScenarioSession');


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model priority list — tries each in order if the previous fails
const MODEL_PRIORITY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro'
];

// Helper: generate content with fallback
async function generateWithFallback(prompt) {
  let activeModels = [...MODEL_PRIORITY];
  try {
    const config = await PlatformConfig.findOne({ key: 'global_config' });
    if (config && config.activeModel) {
      activeModels = [config.activeModel, ...MODEL_PRIORITY.filter(m => m !== config.activeModel)];
    }
  } catch (err) {
    console.error('Failed to load active model config:', err.message);
  }

  let lastErr;
  for (const modelName of activeModels) {
    try {
      console.log(`Attempting generateContent with model: ${modelName}`);
      const m = genAI.getGenerativeModel({ model: modelName });
      const result = await m.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      console.error(`Error with model ${modelName} during generateContent:`, err.message);
      // Fallback: try the next model in activeModels list
    }
  }
  throw lastErr;
}


// Simple in-memory cache so daily words don't regenerate on every request
const wordCache = {};

// ── CHAT: POST /api/ai/chat
const chat = async (req, res) => {
  const { message, language, level, history, systemPrompt: customPrompt } = req.body;

  const systemPrompt = customPrompt || `You are Coach Emma, a friendly ${language} language tutor for ${level} level students.
  Rules:
  - Respond conversationally in English but teach in ${language}
  - Correct grammar mistakes gently
  - Keep responses concise (2-3 sentences max)
  - If the user makes an error, show the correction in a "💡 SUGGESTION:" block
  - Award encouragement naturally`;

  try {
    const chatHistory = history?.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })) || [];

    let activeModels = [...MODEL_PRIORITY];
    try {
      const config = await PlatformConfig.findOne({ key: 'global_config' });
      if (config && config.activeModel) {
        activeModels = [config.activeModel, ...MODEL_PRIORITY.filter(m => m !== config.activeModel)];
      }
    } catch (err) {
      console.error('Failed to load active model config:', err.message);
    }

    let responseText = null;
    let lastErr;
    let selectedModel = 'unknown';

    for (const modelName of activeModels) {
      try {
        console.log(`Attempting chat sendMessage with model: ${modelName}`);
        const m = genAI.getGenerativeModel({ model: modelName });
        const chatSession = m.startChat({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          history: chatHistory,
        });
        const result = await chatSession.sendMessage(message);
        responseText = result.response.text();
        selectedModel = modelName;
        break; // Success! Break out of loop
      } catch (err) {
        lastErr = err;
        console.error(`Error with model ${modelName} during chat:`, err.message);
        // Fallback: try the next model in activeModels list
      }
    }

    if (responseText !== null) {
      // Log interaction in background
      try {
        await AILog.create({
          userId: req.user?._id,
          userName: req.user?.name || 'Anonymous User',
          userMessage: message,
          aiResponse: responseText,
          language,
          level,
          modelUsed: selectedModel
        });
      } catch (logErr) {
        console.error('Failed to save AI log:', logErr.message);
      }

      return res.json({ reply: responseText });
    }

    throw lastErr;
  } catch (err) {
    if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate limit')) {
      return res.status(429).json({ message: 'You hit the free AI rate limit! Please wait a full 60 seconds without clicking send, then try again.' });
    }
    if (err.message?.includes('503') || err.message?.includes('overloaded')) {
      return res.status(503).json({ message: 'The AI is temporarily overloaded. Please wait a few seconds and try again.' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ── DAILY WORDS: POST /api/ai/daily-words
const dailyWords = async (req, res) => {
  const { language } = req.body;
  console.log('📥 Daily Words Request Received for language:', language);
  const today = new Date().toDateString();
  const cacheKey = `${language}_${today}`;

  if (wordCache[cacheKey]) {
    return res.json(wordCache[cacheKey]);
  }

  const prompt = `Generate exactly 5 challenging but useful vocabulary words for a ${language} language learner.
For each word provide:
1. The word in ${language} script
2. Romanized pronunciation (phonetic, how an English speaker would say it)
3. English meaning (short, 1-5 words)
4. One example sentence in ${language}
5. English translation of that sentence
6. Difficulty: Intermediate or Advanced

Respond ONLY with a valid JSON array, no extra text:
[{"word":"","pronunciation":"","meaning":"","example":"","translation":"","difficulty":""}]`;

  try {
    const text = await generateWithFallback(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid JSON from Gemini');
    const words = JSON.parse(jsonMatch[0]);
    const payload = { words, language, date: today };
    wordCache[cacheKey] = payload;
    res.json(payload);
  } catch (err) {
    if (err.message?.includes('503') || err.message?.includes('overloaded')) {
      return res.status(503).json({ message: 'The AI is temporarily overloaded. Please wait a moment and refresh.' });
    }
    res.status(500).json({ message: 'Could not generate words: ' + err.message });
  }
};

// ── ANALYZE SCENARIO: POST /api/ai/analyze-scenario
const analyzeScenario = async (req, res) => {
  const { scenarioKey, transcript } = req.body;
  const language = req.user.language || 'Japanese';
  const level = req.user.level || 'Beginner';

  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return res.status(400).json({ message: 'Transcript is required' });
  }

  // Filter only user messages to evaluate
  const userMessages = transcript
    .filter(t => t.role === 'user')
    .map(t => t.text)
    .join('\n- ');

  const prompt = `You are an expert language teacher. Analyze the following conversation transcript between a student learning ${language} (at ${level} level) and an AI partner in a "${scenarioKey}" scenario.
  
  Evaluate only the student's messages:
  - ${userMessages}

  Here is the full conversation transcript for context:
  ${JSON.stringify(transcript)}

  Provide:
  1. An overall grammar score out of 100 as an integer.
  2. A detailed grammatical feedback report in markdown format. 
     - CRITICAL: The entire grammatical report (all feedback, suggestions, headings, and explanations) MUST be written in English. Do not write the explanations in ${language}. Use ${language} ONLY for quoting the student's original messages and showing the corrected target language sentences.
     - Highlight spelling/grammar errors in the student's messages.
     - Show the corrected version of their mistakes.
     - Provide an English translation for every student message being analyzed and its corresponding correction, so the student can easily understand what they wrote and how to fix it in English.
     - Keep it friendly, positive, and educational.

  Respond strictly in JSON format. Do not wrap the JSON in markdown code blocks. The JSON must contain exactly two fields:
  {
    "score": [integer score between 0 and 100],
    "report": "[markdown formatted report string]"
  }`;

  try {
    const text = await generateWithFallback(prompt);
    // Parse Gemini response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = [text];
    }
    const data = JSON.parse(jsonMatch[0].trim());
    const score = Number(data.score) || 75;
    const report = data.report || 'No grammar report available.';

    // Save session in database
    const session = await ScenarioSession.create({
      userId: req.user._id,
      scenarioKey,
      language,
      level,
      transcript,
      grammarScore: score,
      grammaticalReport: report
    });

    res.status(201).json(session);
  } catch (err) {
    console.error('Error analyzing scenario practice:', err);
    res.status(500).json({ message: 'Failed to analyze scenario session: ' + err.message });
  }
};

// ── GET SCENARIO HISTORY: GET /api/ai/scenario-history
const getScenarioHistory = async (req, res) => {
  try {
    const history = await ScenarioSession.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve scenario history: ' + err.message });
  }
};

module.exports = { chat, dailyWords, analyzeScenario, getScenarioHistory };

