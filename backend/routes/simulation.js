const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { runSimulation } = require('../controllers/simulationController');

router.post('/', authMiddleware, runSimulation);

module.exports = router;
