const Threat = require('../models/Threat');
const SecurityEvent = require('../models/SecurityEvent');
const { lookupIps } = require('../services/geoip');

function identityFilter(req) {
  if (req.isGuest) return { guestId: req.guestId };
  return { userId: req.userId };
}

/**
 * GET /api/threats
 */
exports.getThreats = async (req, res) => {
  try {
    const filter = identityFilter(req);
    const threats = await Threat.find(filter).sort({ detectedAt: -1 }).limit(100);
    res.json({ success: true, threats });
  } catch (err) {
    res.json({ success: true, threats: [] });
  }
};

/**
 * GET /api/threats/stats
 */
exports.getStats = async (req, res) => {
  try {
    const filter = identityFilter(req);
    const [total, critical, high, suspicious, events, blocked] = await Promise.all([
      Threat.countDocuments(filter),
      Threat.countDocuments({ ...filter, riskLevel: 'Critical' }),
      Threat.countDocuments({ ...filter, riskLevel: 'High' }),
      Threat.distinct('sourceIp', filter),
      SecurityEvent.countDocuments(filter),
      Threat.countDocuments({ ...filter, status: 'blocked' }),
    ]);

    res.json({
      success: true,
      total,
      critical,
      high,
      suspicious_ips: suspicious.length,
      events,
      blocked,
    });
  } catch (err) {
    res.json({ success: true, total:0, critical:0, high:0, suspicious_ips:0, events:0, blocked:0 });
  }
};

/**
 * GET /api/threats/geo
 */
exports.getGeoData = async (req, res) => {
  try {
    const filter = identityFilter(req);
    const threats = await Threat.find({ ...filter, status: 'active' }).limit(50);
    const ips = threats.map((t) => t.sourceIp);
    const geoResults = await lookupIps(ips);
    const geoThreats = geoResults.map((geo) => {
      const threat = threats.find((t) => t.sourceIp === geo.ip);
      return { ...geo, type: threat?.type, riskLevel: threat?.riskLevel };
    });
    res.json({ success: true, geoData: geoThreats });
  } catch (err) {
    res.json({ success: true, geoData: [] });
  }
};

/**
 * PATCH /api/threats/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const filter = identityFilter(req);
    const threat = await Threat.findOneAndUpdate(
      { _id: req.params.id, ...filter },
      { status },
      { new: true }
    );
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });
    res.json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
