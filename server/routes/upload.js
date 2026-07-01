const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

let securityMode = 'vulnerable';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    if (securityMode === 'secure') {
      const safe = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
      cb(null, safe);
    } else {
      cb(null, file.originalname);
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (securityMode === 'secure') {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('File type not allowed'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: securityMode === 'secure' ? 5 * 1024 * 1024 : 50 * 1024 * 1024 }
});

router.post('/', adminAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      message: 'File uploaded',
      file: {
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  });
});

router.post('/webshell', adminAuth, (req, res) => {
  const { content, filename } = req.body;
  if (!content || !filename) {
    return res.status(400).json({ success: false, message: 'Missing content or filename' });
  }
  // Check Secure mode
  if (securityMode === 'secure') {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    const ext = path.extname(filename).toLowerCase();
    if (!allowed.includes(ext)) {
      return res.status(400).json({ success: false, message: 'File type not allowed in secure mode' });
    }
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    const filePath = path.join(UPLOAD_DIR, safeName);
    fs.writeFileSync(filePath, content);
    return res.json({
      success: true,
      message: 'File written (secure mode — renamed)',
      path: `/uploads/${safeName}`
    });
  }
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, content);
  res.json({
    success: true,
    message: 'File written',
    path: `/uploads/${filename}`
  });
});

router.get('/mode', adminAuth, (req, res) => {
  res.json({ success: true, mode: securityMode });
});

router.put('/mode', adminAuth, (req, res) => {
  const { mode } = req.body;
  if (!['vulnerable', 'secure'].includes(mode)) {
    return res.status(400).json({ success: false, message: 'Mode must be "vulnerable" or "secure"' });
  }
  securityMode = mode;
  res.json({ success: true, message: `Security mode set to ${mode}`, mode });
});

module.exports = router;
