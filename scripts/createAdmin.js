/**
 * createAdmin.js
 * ─────────────────────────────────────────────
 * Run this ONCE to create an admin account.
 * Usage: node scripts/createAdmin.js
 * ─────────────────────────────────────────────
 */

require('dotenv').config();                        // Load .env secrets
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dns      = require('dns');

// Fix for Indian ISP DNS issues (same as db.js)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ── CHANGE THESE to whatever you want ──────────
const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@linguova.com';
const ADMIN_PASSWORD = 'Admin@2026';
// ───────────────────────────────────────────────

async function createAdmin() {
  try {
    // 1. Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB!');

    // 2. Define a simple User schema (same as models/User.js)
    const UserSchema = new mongoose.Schema({
      name:     String,
      email:    { type: String, unique: true, lowercase: true },
      password: String,
      role:     { type: String, default: 'user' },
      language: { type: String, default: 'Japanese' },
      level:    { type: String, default: 'Beginner' },
      xp:           { type: Number, default: 0 },
      streak:       { type: Number, default: 0 },
      wordsLearned: { type: Number, default: 0 },
      accuracy:     { type: Number, default: 0 },
      lastLogin:    { type: Date, default: Date.now },
      createdAt:    { type: Date, default: Date.now }
    });

    // Use existing model if already loaded, otherwise create it
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // 3. Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`⚠️  Admin already exists: ${ADMIN_EMAIL}`);
      } else {
        // User exists but is not admin — upgrade them
        existing.role = 'admin';
        await existing.save();
        console.log(`✅ Upgraded existing user to admin: ${ADMIN_EMAIL}`);
      }
      process.exit(0);
    }

    // 4. Hash the password
    const salt     = await bcrypt.genSalt(10);
    const hashed   = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // 5. Create the admin user
    const admin = await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: hashed,
      role:     'admin',           // ← This is what makes them admin
    });

    console.log('');
    console.log('🎉 Admin account created successfully!');
    console.log('────────────────────────────────────');
    console.log(`   Name     : ${admin.name}`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);
    console.log(`   Role     : ${admin.role}`);
    console.log('────────────────────────────────────');
    console.log('✅ You can now log in at http://localhost:5000');
    console.log('');

    process.exit(0);   // Exit cleanly

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
