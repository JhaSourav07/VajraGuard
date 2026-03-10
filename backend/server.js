require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const logsRouter = require('./routes/logs');
const threatsRouter = require('./routes/threats');
const eventsRouter = require('./routes/events');
const aiRouter = require('./routes/ai');
const simulationRouter = require('./routes/simulation');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'VajraGuard API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/logs', logsRouter);
app.use('/api/threats', threatsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/simulate', simulationRouter);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vajraguard')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🛡️  VajraGuard API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Still start server for demo purposes even without DB
    app.listen(PORT, () => {
      console.log(`🛡️  VajraGuard API running on http://localhost:${PORT} (no DB)`);
    });
  });

module.exports = app;
