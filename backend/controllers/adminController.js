const User = require('../models/User');
const AILog = require('../models/AILog');
const PlatformConfig = require('../models/PlatformConfig');

// ── GET STATS: GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Active today = lastLogin >= start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({ lastLogin: { $gte: startOfToday } });
    
    const totalAILogs = await AILog.countDocuments();
    
    // Average accuracy
    const accuracyAgg = await User.aggregate([
      { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
    ]);
    const avgAccuracy = accuracyAgg[0] ? Math.round(accuracyAgg[0].avgAccuracy) : 74;

    res.json({
      totalUsers,
      activeToday,
      totalAILogs,
      avgAccuracy
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET USERS: GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE USER: PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided in body
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.language !== undefined) user.language = req.body.language;
    if (req.body.level !== undefined) user.level = req.body.level;
    if (req.body.xp !== undefined) user.xp = Number(req.body.xp);
    if (req.body.streak !== undefined) user.streak = Number(req.body.streak);
    if (req.body.wordsLearned !== undefined) user.wordsLearned = Number(req.body.wordsLearned);
    if (req.body.accuracy !== undefined) user.accuracy = Number(req.body.accuracy);

    const updatedUser = await user.save({ validateBeforeSave: false });
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      language: updatedUser.language,
      level: updatedUser.level,
      xp: updatedUser.xp,
      streak: updatedUser.streak,
      wordsLearned: updatedUser.wordsLearned,
      accuracy: updatedUser.accuracy
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE USER: DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account!' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET AI LOGS: GET /api/admin/ai-logs
const getAILogs = async (req, res) => {
  try {
    const logs = await AILog.find({}).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CLEAR AI LOGS: DELETE /api/admin/ai-logs
const clearAILogs = async (req, res) => {
  try {
    await AILog.deleteMany({});
    res.json({ message: 'All AI logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET PLATFORM CONFIG: GET /api/admin/config
const getConfig = async (req, res) => {
  try {
    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await PlatformConfig.create({ key: 'global_config' });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE PLATFORM CONFIG: PUT /api/admin/config
const updateConfig = async (req, res) => {
  try {
    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = new PlatformConfig({ key: 'global_config' });
    }

    if (req.body.activeModel !== undefined) config.activeModel = req.body.activeModel;
    if (req.body.dailyXpGoal !== undefined) config.dailyXpGoal = Number(req.body.dailyXpGoal);
    if (req.body.maintenanceMode !== undefined) config.maintenanceMode = req.body.maintenanceMode === true;
    if (req.body.signupBonusXp !== undefined) config.signupBonusXp = Number(req.body.signupBonusXp);
    if (req.body.wordsLearnedXp !== undefined) config.wordsLearnedXp = Number(req.body.wordsLearnedXp);

    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAILogs,
  clearAILogs,
  getConfig,
  updateConfig
};
