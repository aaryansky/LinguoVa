const mongoose = require('mongoose');

const GrammarQuestionSchema = new mongoose.Schema({
  language: { type: String, required: true },
  q:        { type: String, required: true },
  sentence: { type: String, required: true },
  options:  [{ type: String }],
  answer:   { type: Number, required: true } // Index 0-3
}, { timestamps: true });

module.exports = mongoose.model('GrammarQuestion', GrammarQuestionSchema);
