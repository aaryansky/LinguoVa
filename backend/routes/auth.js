const express = require('express');
const router = express.Router();
const { register, login, googleLogin, updateStats } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register → calls register function
router.post('/register', register);

// POST /api/auth/login → calls login function
router.post('/login', login);

// POST /api/auth/google → calls googleLogin function
router.post('/google', googleLogin);

// PUT /api/auth/stats → calls updateStats function (protected)
router.put('/stats', protect, updateStats);

module.exports = router;
