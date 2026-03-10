const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Threat = require('../models/Threat');
const SecurityEvent = require('../models/SecurityEvent');
const Log = require('../models/Log');
const User = require('../models/User');

/**
 * DELETE /api/settings/reset-data
 * Wipes all threats, events, and logs belonging to the caller.
 * For authenticated users this also makes it possible to delete the account.
 */
router.delete('/reset-data', authMiddleware, async (req, res) => {
  try {
    const filter = req.isGuest ? { guestId: req.guestId } : { userId: req.userId };

    const [threats, events, logs] = await Promise.all([
      Threat.deleteMany(filter),
      SecurityEvent.deleteMany(filter),
      Log.deleteMany(filter),
    ]);

    res.json({
      success: true,
      message: 'All data deleted successfully',
      deleted: {
        threats: threats.deletedCount,
        events:  events.deletedCount,
        logs:    logs.deletedCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/settings/account
 * Deletes all data AND the user account.
 * Guests cannot call this (no account to delete).
 */
router.delete('/account', authMiddleware, async (req, res) => {
  if (req.isGuest)
    return res.status(400).json({ success: false, message: 'Guests do not have accounts' });

  try {
    const filter = { userId: req.userId };
    await Promise.all([
      Threat.deleteMany(filter),
      SecurityEvent.deleteMany(filter),
      Log.deleteMany(filter),
      User.findByIdAndDelete(req.userId),
    ]);
    res.json({ success: true, message: 'Account and all data deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
