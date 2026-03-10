const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const { authMiddleware } = require('../middleware/auth');
const logsController = require('../controllers/logsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ext === '.log' || ext === '.txt' ? cb(null, true) : cb(new Error('Only .log and .txt files allowed'));
  },
});

router.post('/upload', authMiddleware, upload.single('logfile'), logsController.uploadLog);
router.get('/',        authMiddleware, logsController.getLogs);

module.exports = router;
