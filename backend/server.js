require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

const authRouter       = require('./routes/auth');
const logsRouter       = require('./routes/logs');
const threatsRouter    = require('./routes/threats');
const eventsRouter     = require('./routes/events');
const aiRouter         = require('./routes/ai');
const simulationRouter = require('./routes/simulation');
const settingsRouter   = require('./routes/settings');

const app  = express();
const PORT = process.env.PORT || 5000;

// CORS – allow auth headers from frontend
app.use(cors({
  origin: true, // reflect the request origin
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-Id'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use(morgan('dev'));

// Health check (public)
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'VajraGuard API', timestamp: new Date().toISOString() })
);

// Routes
app.use('/api/auth',     authRouter);       // public + protected auth routes
app.use('/api/logs',     logsRouter);       // all protected
app.use('/api/threats',  threatsRouter);    // all protected
app.use('/api/events',   eventsRouter);     // all protected
app.use('/api/ai',       aiRouter);         // all protected
app.use('/api/simulate', simulationRouter); // all protected
app.use('/api/settings', settingsRouter);   // all protected

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Express Error] ${req.method} ${req.url}:`, err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vajraguard')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🛡️  VajraGuard API → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    app.listen(PORT, () => console.log(`🛡️  VajraGuard API → http://localhost:${PORT} (no DB)`));
  });

module.exports = app;
