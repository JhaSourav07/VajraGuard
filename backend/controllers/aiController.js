const SecurityEvent = require('../models/SecurityEvent');
const Threat = require('../models/Threat');
const { askAssistant } = require('../services/asiClient');

/**
 * POST /api/ai/analyze
 * Body: { question: string }
 */
exports.analyze = async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }

  try {
    const [events, threats] = await Promise.all([
      SecurityEvent.find().sort({ createdAt: -1 }).limit(50).lean(),
      Threat.find().sort({ detectedAt: -1 }).limit(20).lean(),
    ]);

    const result = await askAssistant(question, events, threats);
    res.json({ success: true, response: result.response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
