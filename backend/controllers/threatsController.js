const Threat = require('../models/Threat');
const SecurityEvent = require('../models/SecurityEvent');
const { lookupIps } = require('../services/geoip');

/**
 * GET /api/threats
 */
exports.getThreats = async (req, res) => {
  try {
    const threats = await Threat.find().sort({ detectedAt: -1 }).limit(100);
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
    const [total, critical, high, medium, low, byType] = await Promise.all([
      Threat.countDocuments(),
      Threat.countDocuments({ riskLevel: 'Critical' }),
      Threat.countDocuments({ riskLevel: 'High' }),
      Threat.countDocuments({ riskLevel: 'Medium' }),
      Threat.countDocuments({ riskLevel: 'Low' }),
      Threat.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);

    const eventCount = await SecurityEvent.countDocuments();
    const suspiciousIps = await Threat.distinct('sourceIp');

    res.json({
      success: true,
      stats: {
        total,
        critical,
        high,
        medium,
        low,
        eventCount,
        suspiciousIpCount: suspiciousIps.length,
        byType: byType.map((t) => ({ type: t._id, count: t.count })),
      },
    });
  } catch (err) {
    // Return mock stats if DB unavailable
    res.json({
      success: true,
      stats: {
        total: 0, critical: 0, high: 0, medium: 0, low: 0,
        eventCount: 0, suspiciousIpCount: 0, byType: [],
      },
    });
  }
};

/**
 * GET /api/threats/geo
 * Returns array of { ip, lat, lng, city, country, type, riskLevel } for map
 */
exports.getGeoData = async (req, res) => {
  try {
    const threats = await Threat.find({ status: 'active' }).limit(50);
    const ips = threats.map((t) => t.sourceIp);
    const geoResults = await lookupIps(ips);

    // Merge threat data with geo data
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
    const threat = await Threat.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
