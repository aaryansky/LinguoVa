const mongoose = require('mongoose');

const VocabCardSchema = new mongoose.Schema({
  language:    { type: String, required: true },
  word:        { type: String, required: true },
  phonetic:    { type: String, default: '' },
  pos:         { type: String, default: 'noun' },
  meaning:     { type: String, required: true },
  example:     { type: String, default: '' },
  translation: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('VocabCard', VocabCardSchema);
