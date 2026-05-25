const mongoose = require('mongoose');

const PlatformConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global_config'
  },
  activeModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  dailyXpGoal: {
    type: Number,
    default: 50
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  signupBonusXp: {
    type: Number,
    default: 100
  },
  wordsLearnedXp: {
    type: Number,
    default: 10
  }
});

module.exports = mongoose.model('PlatformConfig', PlatformConfigSchema);
