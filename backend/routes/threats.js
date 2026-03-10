const express = require('express');
const router = express.Router();
const threatsController = require('../controllers/threatsController');

// GET /api/threats
router.get('/', threatsController.getThreats);

// GET /api/threats/stats
router.get('/stats', threatsController.getStats);

// GET /api/threats/geo
router.get('/geo', threatsController.getGeoData);

// PATCH /api/threats/:id/status
router.patch('/:id/status', threatsController.updateStatus);

module.exports = router;
