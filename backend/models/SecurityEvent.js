const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  event_type: {
    type: String,
    enum: ['failed_login', 'successful_login', 'port_scan', 'web_request', 'firewall_block', 'data_access', 'unknown'],
    default: 'unknown',
  },
  ip: { type: String, default: null },
  username: { type: String, default: null },
  port: { type: Number, default: null },
  url: { type: String, default: null },
  statusCode: { type: Number, default: null },
  method: { type: String, default: null },
  timestamp: { type: String },
  rawLine: { type: String },
  logId: { type: mongoose.Schema.Types.ObjectId, ref: 'Log', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
