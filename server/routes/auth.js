const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { JWT_SECRET } = require('../middleware/auth');

const genId = () => crypto.randomUUID();

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

const readDB = () => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (!data.refreshTokens) data.refreshTokens = [];
    return data;
  } catch (e) {
    throw new Error('Database file corrupted');
  }
};

const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ─── CAPTCHA (in-memory) ───
const captchaStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore) {
    if (now > data.expiresAt) captchaStore.delete(id);
  }
}, 120000);

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

router.get('/captcha', (req, res) => {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  const id = genId();
  captchaStore.set(id, { answer: code.toLowerCase(), expiresAt: Date.now() + 300000 });
  res.json({ success: true, captcha_id: id, code });
});

// ─── TOKEN HELPERS ───
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (user, ua) => {
  return jwt.sign({ id: user.id, role: user.role, ua }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const saveRefreshToken = (token, userId) => {
  const db = readDB();
  db.refreshTokens.push({
    token,
    userId,
    expiresAt: Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
  // Clean expired tokens
  db.refreshTokens = db.refreshTokens.filter(rt => rt.expiresAt > Date.now());
  writeDB(db);
};

const validateCaptcha = (req, res) => {
  const { captcha_id, captcha_answer } = req.body;
  if (!captcha_id) return true; // captcha is optional (e.g. admin login)
  const data = captchaStore.get(captcha_id);
  if (!data || Date.now() > data.expiresAt) {
    res.status(400).json({ success: false, message: 'Captcha expired or invalid' });
    return false;
  }
  if (String(captcha_answer).toLowerCase() !== data.answer) {
    captchaStore.delete(captcha_id);
    res.status(400).json({ success: false, message: 'Incorrect captcha answer' });
    return false;
  }
  captchaStore.delete(captcha_id);
  return true;
};

const buildAuthResponse = (user, ua) => {
  const accessToken = generateAccessToken(user, ua);
  const refreshToken = generateRefreshToken();
  saveRefreshToken(refreshToken, user.id);
  return {
    success: true,
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

// ─── REGISTER ───
router.post('/register', async (req, res) => {
  try {
    if (!validateCaptcha(req, res)) return;

    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    name = String(name).trim().slice(0, 100);
    email = String(email).trim().toLowerCase().slice(0, 255);
    if (password.length < 4 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be between 4-128 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && email !== 'admin') {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: genId(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
    };

    db.users.push(newUser);
    writeDB(db);

    const ua = req.headers['user-agent'] || '';
    res.json(buildAuthResponse(newUser, ua));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── LOGIN ───
router.post('/login', async (req, res) => {
  try {
    if (!validateCaptcha(req, res)) return;

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const ua = req.headers['user-agent'] || '';
    res.json(buildAuthResponse(user, ua));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/login', (req, res) => {
  res.json({ success: false, message: 'Use POST method to login.' });
});

// ─── REFRESH TOKEN ───
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const db = readDB();
    const stored = db.refreshTokens.find(rt => rt.token === refreshToken);
    if (!stored) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    if (Date.now() > stored.expiresAt) {
      db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== refreshToken);
      writeDB(db);
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    const user = db.users.find(u => u.id === stored.userId);
    if (!user) {
      db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== refreshToken);
      writeDB(db);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Rotation: remove old, issue new
    db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== refreshToken);

    const ua = req.headers['user-agent'] || '';
    const accessToken = generateAccessToken(user, ua);
    const newRefreshToken = generateRefreshToken();

    db.refreshTokens.push({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });
    writeDB(db);

    res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── LOGOUT ───
router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const db = readDB();
      db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== refreshToken);
      writeDB(db);
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── ME ───
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const currentUA = req.headers['user-agent'] || '';
    if (decoded.ua && decoded.ua !== currentUA) {
      return res.status(401).json({ success: false, message: 'UA mismatch — session hijacking detected' });
    }
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

router.get('/expired-token', (req, res) => {
  const token = jwt.sign({ id: 'test-expired', role: 'user' }, JWT_SECRET, { expiresIn: '-1d' });
  res.json({ success: true, message: 'Token này đã hết hạn 1 ngày', token });
});

router.get('/test-hijack', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const fakeUA = decoded.ua === 'Chrome' ? 'Firefox/100' : 'FakeBrowser/1.0';
    const realUA = req.headers['user-agent'] || '';
    if (decoded.ua !== fakeUA) {
      return res.json({
        success: false,
        message: 'UA mismatch — session hijacking detected',
        tokenUA: decoded.ua,
        requestUA: fakeUA,
      });
    }
    res.json({ success: true, message: 'UA matched' });
  } catch (e) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
