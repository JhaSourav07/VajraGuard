const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalContent: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  eventCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Log', logSchema);
