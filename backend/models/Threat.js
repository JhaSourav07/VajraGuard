const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Brute Force Attack', 'Account Takeover', 'Port Scan', 'Suspicious Login', 'Web Attack', 'Unknown Threat'],
    default: 'Unknown Threat',
  },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  sourceIp: { type: String, required: true },
  explanation: { type: String, default: '' },
  recommendedActions: [{ type: String }],
  relatedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SecurityEvent' }],
  aiAnalyzed: { type: Boolean, default: false },
  detectedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'blocked', 'resolved'], default: 'active' },
});

module.exports = mongoose.model('Threat', threatSchema);
