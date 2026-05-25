const mongoose = require('mongoose');

const ScenarioSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenarioKey: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  transcript: [
    {
      role: { type: String, required: true },
      text: { type: String, required: true }
    }
  ],
  grammarScore: {
    type: Number,
    required: true
  },
  grammaticalReport: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScenarioSession', ScenarioSessionSchema);
