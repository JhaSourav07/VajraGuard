const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Brute Force Attack', 'Account Takeover', 'Port Scan', 'Suspicious Login', 'Web Attack', 'Unknown Threat'],
    default: 'Unknown Threat',
  },
  riskLevel:          { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  sourceIp:           { type: String, required: true },
  explanation:        { type: String, default: '' },
  recommendedActions: [{ type: String }],
  relatedEvents:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'SecurityEvent' }],
  aiAnalyzed:         { type: Boolean, default: false },
  detectedAt:         { type: Date, default: Date.now },
  status:             { type: String, enum: ['active', 'blocked', 'resolved'], default: 'active' },
  createdAt:          { type: Date, default: Date.now },

  // ─── Auth scoping ─────────────────────────────────────
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestId:         { type: String, default: null },
  isGuest:         { type: Boolean, default: false },
  // TTL: guest documents auto-deleted 24 h after creation
  guestExpiresAt:  { type: Date, default: null },
});

// TTL index — MongoDB removes documents when guestExpiresAt is reached
threatSchema.index({ guestExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Threat', threatSchema);
