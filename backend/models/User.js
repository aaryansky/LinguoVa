const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // ── Basic Info
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // ── Language Learning Data
  language: { type: String, default: 'Japanese' },
  level:    { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  
  // ── Progress Stats
  xp:           { type: Number, default: 0 },
  streak:       { type: Number, default: 0 },
  wordsLearned: { type: Number, default: 0 },
  accuracy:     { type: Number, default: 0 },
  lastLogin:    { type: Date, default: Date.now },
  progress:     { type: Map, of: Object, default: {} },
  
  // ── Timestamps
  createdAt: { type: Date, default: Date.now }
});

// ── BEFORE saving a user, hash their password
// In Mongoose 9, async hooks use promises — no need for next()
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  // Only hash if password was changed (not on every save)

  const salt = await bcrypt.genSalt(10);  // 10 = strength level
  this.password = await bcrypt.hash(this.password, salt);
  // "Aryan2026" becomes "$2a$10$xyz..." — unreadable, secure
});

// ── Method to check if entered password matches stored hash
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
