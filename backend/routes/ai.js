const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { analyze } = require('../controllers/aiController');

// Scope AI context to the caller's data
router.post('/analyze', authMiddleware, analyze);

module.exports = router;
