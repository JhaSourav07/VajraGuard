const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const threatsController = require('../controllers/threatsController');

router.get('/',             authMiddleware, threatsController.getThreats);
router.get('/stats',        authMiddleware, threatsController.getStats);
router.get('/geo',          authMiddleware, threatsController.getGeoData);
router.patch('/:id/status', authMiddleware, threatsController.updateStatus);

module.exports = router;
