const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper: generate a JWT token for a user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  // Token expires in 30 days — user stays logged in for 30 days
};

// ── REGISTER: POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, language, level } = req.body;

  try {
    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Create new user (password is auto-hashed by our schema)
    const user = await User.create({ name, email, password, language, level });

    // Send back user info + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      wordsLearned: user.wordsLearned,
      accuracy: user.accuracy,
      progress: user.progress ? Object.fromEntries(user.progress) : {},
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── LOGIN: POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check password using our matchPassword method
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      xp: user.xp,
      streak: user.streak,
      wordsLearned: user.wordsLearned,
      accuracy: user.accuracy,
      progress: user.progress ? Object.fromEntries(user.progress) : {},
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GOOGLE LOGIN: POST /api/auth/google
const googleLogin = async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Create user if they don't exist
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: randomPassword,
        role: 'user',
        language: 'Japanese',
        level: 'Beginner'
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      xp: user.xp,
      streak: user.streak,
      wordsLearned: user.wordsLearned,
      accuracy: user.accuracy,
      progress: user.progress ? Object.fromEntries(user.progress) : {},
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStats = async (req, res) => {
  const { xp, streak, wordsLearned, accuracy, language: bodyLanguage } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user active language if provided in request body
    if (bodyLanguage) {
      user.language = bodyLanguage;
    }
    const language = user.language || 'Japanese';

    // Initialize progress map if missing
    if (!user.progress) user.progress = new Map();

    const langStats = user.progress.get(language) || { xp: 0, streak: 0, wordsLearned: 0, accuracy: 0 };
    if (xp !== undefined) langStats.xp = Number(xp);
    if (streak !== undefined) langStats.streak = Number(streak);
    if (wordsLearned !== undefined) langStats.wordsLearned = Number(wordsLearned);
    if (accuracy !== undefined) langStats.accuracy = Number(accuracy);

    user.progress.set(language, langStats);

    // Sync top-level fields for active language course (backwards compatibility)
    user.xp = langStats.xp;
    user.streak = langStats.streak;
    user.wordsLearned = langStats.wordsLearned;
    user.accuracy = langStats.accuracy;

    user.markModified('progress');
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Stats updated successfully',
      xp: user.xp,
      streak: user.streak,
      wordsLearned: user.wordsLearned,
      accuracy: user.accuracy,
      language: user.language,
      progress: Object.fromEntries(user.progress)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, googleLogin, updateStats };
