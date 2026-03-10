const express = require('express');
const router = express.Router();
const SecurityEvent = require('../models/SecurityEvent');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = req.isGuest ? { guestId: req.guestId } : { userId: req.userId };
    const events = await SecurityEvent.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
