// ── 1. Load environment variables FIRST (before anything else)
require('dotenv').config();

// ── 2. Import libraries
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── 3. Connect to MongoDB
connectDB();

// ── 4. Create the Express app
const app = express();

// Global request logger for debugging
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ── 5. Middleware (processes every request before it hits your routes)
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null'],
  credentials: true
}));
// cors() → allows frontend at localhost:3000 to talk to backend at localhost:5000

app.use(express.json());
// express.json() → allows reading JSON data sent in request body

const path = require('path');

// ── 6. Routes
app.use('/api/auth',       require('./routes/auth'));  // Login & Register
app.use('/api/ai',         require('./routes/ai'));    // Gemini AI Chat
app.use('/api/admin',      require('./routes/admin')); // Admin Actions
app.use('/api/curriculum', require('./routes/curriculum')); // Curriculum (Vocab & Grammar)


// Serve the frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── 7. Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: '🌐 LinguoVa API is running!' });
});

// ── 8. Start listening for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
