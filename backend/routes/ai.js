const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/analyze
router.post('/analyze', aiController.analyze);

module.exports = router;
