const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');
const SecurityEvent = require('../models/SecurityEvent');
const Threat = require('../models/Threat');
const { parseLog } = require('../services/logParser');
const { correlateThreats } = require('../services/threatEngine');
const { analyzeThreat } = require('../services/asiClient');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/**
 * POST /api/logs/upload
 * Upload a log file, parse it, correlate threats, run AI analysis
 */
exports.uploadLog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a .log or .txt file.' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');

    // Parse log content
    const parsedEvents = parseLog(fileContent);

    // Save log record
    let logRecord = null;
    try {
      logRecord = await Log.create({
        filename: req.file.originalname,
        originalContent: fileContent.slice(0, 50000), // cap stored content
        eventCount: parsedEvents.length,
      });
    } catch (_) { /* DB optional */ }

    // Save parsed events
    let savedEvents = parsedEvents;
    try {
      const eventDocs = parsedEvents.map((e) => ({ ...e, logId: logRecord?._id }));
      savedEvents = await SecurityEvent.insertMany(eventDocs);
    } catch (_) { /* DB optional */ }

    // Rule-based threat correlation
    const ruleThreats = correlateThreats(parsedEvents);

    // Save threats
    let savedThreats = [];
    try {
      const threatDocs = ruleThreats.map((t) => ({
        type: t.type,
        riskLevel: t.riskLevel,
        sourceIp: t.sourceIp,
        explanation: t.explanation,
        recommendedActions: t.recommendedActions,
      }));
      savedThreats = await Threat.insertMany(threatDocs);
    } catch (_) {
      savedThreats = ruleThreats;
    }

    // AI analysis (async, non-blocking for speed)
    let aiAnalysis = null;
    try {
      const aiResult = await analyzeThreat(parsedEvents, ruleThreats);
      aiAnalysis = aiResult.analysis;

      // Update threats with AI flag
      try {
        await Threat.updateMany(
          { sourceIp: { $in: ruleThreats.map((t) => t.sourceIp) } },
          { aiAnalyzed: true }
        );
      } catch (_) {}
    } catch (_) {}

    // Clean up uploaded file
    try { fs.unlinkSync(req.file.path); } catch (_) {}

    res.json({
      success: true,
      message: `✅ Log parsed successfully`,
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
    const logs = await Log.find().sort({ uploadedAt: -1 }).limit(20);
    res.json({ success: true, logs });
  } catch (err) {
    res.json({ success: true, logs: [] });
  }
};
