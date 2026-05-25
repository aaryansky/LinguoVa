const mongoose = require('mongoose');
const dns = require('dns');  // Built-in Node.js DNS module (no install needed)

// Override Node.js DNS to use Google DNS — fixes ISP blocking of MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {        // async because connecting takes time
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,           // Force IPv4 (fixes DNS SRV issues on Indian ISPs)
      serverSelectionTimeoutMS: 10000,  // Wait 10s before giving up
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // Seed curriculum if empty
    const seedCurriculum = require('./seedCurriculum');
    await seedCurriculum();

    // Auto-repair platform config model if invalid or non-existent in priority list
    try {
      const PlatformConfig = require('../models/PlatformConfig');
      let config = await PlatformConfig.findOne({ key: 'global_config' });
      console.log('🤖 Loaded platform config from database:', config);
      const validModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'];
      if (config && !validModels.includes(config.activeModel)) {
        console.log(`🔧 Auto-repairing active AI model from "${config.activeModel}" to "gemini-2.5-flash"`);
        config.activeModel = 'gemini-2.5-flash';
        await config.save();
        console.log('🤖 Saved repaired config:', config);
      }
    } catch (err) {
      console.warn('⚠️ Non-blocking: Could not verify/repair AI model config on startup:', err.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.error('💡 Fix: Go to Atlas → Network Access → Add 0.0.0.0/0');
    // Retry connection after 5 seconds instead of crashing
    console.log('🔄 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;  // Export so server.js can use it
