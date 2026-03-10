const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const logsController = require('../controllers/logsController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.log' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only .log and .txt files are allowed'));
    }
  },
});

// POST /api/logs/upload
router.post('/upload', upload.single('logfile'), logsController.uploadLog);

// GET /api/logs
router.get('/', logsController.getLogs);

module.exports = router;
