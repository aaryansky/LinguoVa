const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAILogs,
  clearAILogs,
  getConfig,
  updateConfig
} = require('../controllers/adminController');

// All routes here require login and admin privileges
router.use(protect);
router.use(adminOnly);

// ── Admin stats
router.get('/stats', getStats);

// ── User Management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ── AI Log Management
router.get('/ai-logs', getAILogs);
router.delete('/ai-logs', clearAILogs);

// ── Platform Configuration
router.get('/config', getConfig);
router.put('/config', updateConfig);

module.exports = router;
