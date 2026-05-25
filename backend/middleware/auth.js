const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function runs BEFORE protected routes
// It checks: "Is the user logged in?"
const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header: "Bearer <token>"
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extract token
      
      // Verify the token using our JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to the request object
      req.user = await User.findById(decoded.id).select('-password');
      // select('-password') = get user but DON'T include their password
      
      // Maintenance check for non-admins
      if (req.user && req.user.role !== 'admin') {
        const PlatformConfig = require('../models/PlatformConfig');
        const config = await PlatformConfig.findOne({ key: 'global_config' });
        if (config && config.maintenanceMode) {
          return res.status(503).json({ message: 'LinguoVa is currently under maintenance. Please check back later.' });
        }
      }

      next(); // Move on to the actual route
    } catch {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin-only protection
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
