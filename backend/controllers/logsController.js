const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');
const SecurityEvent = require('../models/SecurityEvent');
const Threat = require('../models/Threat');
const { parseLog } = require('../services/logParser');
const { correlateThreats } = require('../services/threatEngine');
const { analyzeThreat } = require('../services/asiClient');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Build the identity filter and extra fields for new documents
function identityFields(req) {
  const GUEST_TTL = 24 * 60 * 60 * 1000; // 24 h
  if (req.isGuest) {
    return {
      filter: { guestId: req.guestId },
      extra:  { guestId: req.guestId, isGuest: true, guestExpiresAt: new Date(Date.now() + GUEST_TTL) },
    };
  }
  return {
    filter: { userId: req.userId },
    extra:  { userId: req.userId, isGuest: false },
  };
}

/**
 * POST /api/logs/upload
 */
exports.uploadLog = async (req, res) => {
  try {
    if (!req.file) {
      console.warn(`[API] ⚠️ log upload attempt failed: No file provided.`);
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    console.log(`\n[API] 📥 Received log file upload: ${req.file.originalname} (${req.file.size} bytes)`);

    const { filter, extra } = identityFields(req);
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const parsedEvents = parseLog(fileContent);

    // Save log record
    let logRecord = null;
    try {
      logRecord = await Log.create({
        filename: req.file.originalname,
        originalContent: fileContent.slice(0, 50000),
        eventCount: parsedEvents.length,
        ...extra,
      });
    } catch (_) {}

    // Save parsed events
    let savedEvents = parsedEvents;
    try {
      const eventDocs = parsedEvents.map((e) => ({ ...e, logId: logRecord?._id, ...extra }));
      savedEvents = await SecurityEvent.insertMany(eventDocs);
    } catch (_) {}

    // Rule-based threat correlation
    console.log(`[Engine] 🔍 Correlating threats from ${parsedEvents.length} events...`);
    const ruleThreats = correlateThreats(parsedEvents);
    console.log(`[Engine] 🎯 Found ${ruleThreats.length} threats based on rules.`);

    // Save threats
    let savedThreats = [];
    try {
      const threatDocs = ruleThreats.map((t) => ({
        type: t.type,
        riskLevel: t.riskLevel,
        sourceIp: t.sourceIp,
        explanation: t.explanation,
        recommendedActions: t.recommendedActions,
        ...extra,
      }));
      savedThreats = await Threat.insertMany(threatDocs);
    } catch (_) {
      savedThreats = ruleThreats;
    }

    // AI analysis
    let aiAnalysis = null;
    try {
      if (ruleThreats.length > 0) {
        console.log(`[ASI-1] 🤖 Requesting AI analysis for ${ruleThreats.length} detected threats...`);
      }
      const aiResult = await analyzeThreat(parsedEvents, ruleThreats);
      aiAnalysis = aiResult.analysis;
      try {
        await Threat.updateMany(
          { sourceIp: { $in: ruleThreats.map((t) => t.sourceIp) }, ...filter },
          { aiAnalyzed: true }
        );
      } catch (_) {}
    } catch (_) {}

    try { fs.unlinkSync(req.file.path); } catch (_) {}

    console.log(`[API] ✅ Successfully processed ${req.file.originalname}. Returning response to client.\n`);

    res.json({
      success: true,
      message: '✅ Log parsed successfully',
      filename: req.file.originalname,
      eventCount: parsedEvents.length,
      threatsDetected: ruleThreats.length,
      events: parsedEvents.slice(0, 50),
      threats: savedThreats,
      aiAnalysis,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/logs
 */
exports.getLogs = async (req, res) => {
  try {
    const { filter } = identityFields(req);
    const logs = await Log.find(filter).sort({ uploadedAt: -1 }).limit(20);
    res.json({ success: true, logs });
  } catch (err) {
    res.json({ success: true, logs: [] });
  }
};
