// --- ROUTE XÁC THỰC NGƯỜI DÙNG ---
// File: server/routes/auth.js
// Mô tả: Xử lý đăng ký (register), đăng nhập (login) và lấy thông tin người dùng hiện tại (me)

const express = require('express');
const bcrypt = require('bcryptjs');   // Thư viện hash mật khẩu
const jwt = require('jsonwebtoken');   // Thư viện tạo và xác thực JWT token
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { JWT_SECRET } = require('../middleware/auth'); // Lấy secret key từ middleware auth

const genId = () => crypto.randomUUID();

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

const readDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    throw new Error('Database file corrupted');
  }
};
// Hàm ghi database ra file JSON
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

/* POST /api/auth/register - Đăng ký tài khoản mới
 * Nhận: { name, email, password } từ body request
 * Trả về: { success, token, user } nếu thành công
 * Kiểm tra: các trường bắt buộc, email đã tồn tại chưa */
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;
    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate và sanitize
    name = String(name).trim().slice(0, 100);
    email = String(email).trim().toLowerCase().slice(0, 255);
    if (password.length < 4 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be between 4-128 characters' });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && email !== 'admin') {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const db = readDB();
    // Kiểm tra email đã có người dùng chưa
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash mật khẩu với salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tạo user mới
    const newUser = {
      id: genId(),          // ID ngẫu nhiên duy nhất
      name,
      email,
      password: hashedPassword, // Lưu mật khẩu đã hash
      role: 'user'             // Mặc định là user thường
    };

    // Thêm user vào database và ghi lại
    db.users.push(newUser);
    writeDB(db);

    // Tạo JWT token chứa thông tin user, hết hạn sau 7 ngày
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });

    // Trả về token và thông tin user (không kèm password)
    res.json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const db = readDB();
    // Tìm user theo email
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // So sánh mật khẩu bằng bcrypt cho TẤT CẢ tài khoản (kể cả admin)
    // Không có ngoại lệ plaintext - tăng cường bảo mật chống brute force
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Tạo JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Trả về token và thông tin user
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/login', (req, res) => {
  res.json({
    success: false,
    message: 'Use POST method to login.',
  });
});

/* GET /api/auth/me - Lấy thông tin người dùng hiện tại từ token
 * Header: Authorization: Bearer <token>
 * Trả về: { success, user } nếu token hợp lệ */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  // Kiểm tra header Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token' });
  }

  try {
    // Giải mã token để lấy thông tin user
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const db = readDB();
    // Tìm user trong database theo id từ token
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Trả về thông tin user (không kèm password)
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
