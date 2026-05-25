const express = require('express');
const router = express.Router();
const { chat, dailyWords, analyzeScenario, getScenarioHistory } = require('../controllers/aicontroller');
const { protect } = require('../middleware/auth');

// POST /api/ai/chat → AI conversation (protected)
router.post('/chat', protect, chat);

// POST /api/ai/daily-words → Generate 5 daily words (protected)
router.post('/daily-words', protect, dailyWords);

// POST /api/ai/analyze-scenario → Analyze scenario chat transcript (protected)
router.post('/analyze-scenario', protect, analyzeScenario);

// GET /api/ai/scenario-history → Retrieve past scenario transcripts (protected)
router.get('/scenario-history', protect, getScenarioHistory);

module.exports = router;
