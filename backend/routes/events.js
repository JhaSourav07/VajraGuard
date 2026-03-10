const express = require('express');
const router = express.Router();
const SecurityEvent = require('../models/SecurityEvent');

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await SecurityEvent.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
