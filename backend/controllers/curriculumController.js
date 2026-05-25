const VocabCard = require('../models/VocabCard');
const GrammarQuestion = require('../models/GrammarQuestion');

// ── GET CURRICULUM: GET /api/curriculum
const getCurriculum = async (req, res) => {
  const { language } = req.query;
  const filter = {};
  if (language) filter.language = language;

  try {
    const vocab = await VocabCard.find(filter).sort({ createdAt: 1 });
    const grammar = await GrammarQuestion.find(filter).sort({ createdAt: 1 });

    res.json({ vocab, grammar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADD VOCAB: POST /api/curriculum/vocab (Admin only)
const addVocab = async (req, res) => {
  const { language, word, phonetic, pos, meaning, example, translation } = req.body;

  if (!language || !word || !meaning) {
    return res.status(400).json({ message: 'Language, word, and meaning are required.' });
  }

  try {
    const card = await VocabCard.create({
      language,
      word,
      phonetic: phonetic || '',
      pos: pos || 'noun',
      meaning,
      example: example || '',
      translation: translation || ''
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE VOCAB: DELETE /api/curriculum/vocab/:id (Admin only)
const deleteVocab = async (req, res) => {
  try {
    const card = await VocabCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Vocabulary word not found.' });

    await VocabCard.deleteOne({ _id: req.params.id });
    res.json({ message: 'Vocabulary word deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADD GRAMMAR: POST /api/curriculum/grammar (Admin only)
const addGrammar = async (req, res) => {
  const { language, q, sentence, options, answer } = req.body;

  if (!language || !q || !sentence || !options || answer === undefined) {
    return res.status(400).json({ message: 'All grammar question fields are required.' });
  }

  try {
    const question = await GrammarQuestion.create({
      language,
      q,
      sentence,
      options,
      answer: Number(answer)
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE GRAMMAR: DELETE /api/curriculum/grammar/:id (Admin only)
const deleteGrammar = async (req, res) => {
  try {
    const question = await GrammarQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Grammar question not found.' });

    await GrammarQuestion.deleteOne({ _id: req.params.id });
    res.json({ message: 'Grammar question deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCurriculum,
  addVocab,
  deleteVocab,
  addGrammar,
  deleteGrammar
};
