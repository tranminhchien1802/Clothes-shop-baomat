// --- ROUTE QUẢN LÝ NGƯỜI DÙNG ---
// File: server/routes/users.js
// Mô tả: API cho admin xem danh sách users và xóa user (yêu cầu quyền admin)

const express = require('express');
const fs = require('fs');
const path = require('path');
const { adminAuth } = require('../middleware/auth'); // Middleware yêu cầu quyền admin

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

/* GET /api/users/all - Lấy danh sách tất cả người dùng (yêu cầu admin)
 * Trả về: { success, users }
 * Không trả về mật khẩu của user vì lý do bảo mật */
router.get('/all', adminAuth, (req, res) => {
  const db = readDB();
  // Map users, chỉ lấy các trường cần thiết (ẩn password)
  const users = db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  res.json({ success: true, users });
});

/* DELETE /api/users/:id - Xóa người dùng theo ID (yêu cầu admin)
 * Params: id - ID của user cần xóa
 * Không cho phép xóa user có role 'admin'
 * Khi xóa user, cũng xóa luôn giỏ hàng của user đó */
router.delete('/:id', adminAuth, (req, res) => {
  const db = readDB();
  // Tìm index của user trong mảng
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  // Không cho phép xóa tài khoản admin
  if (db.users[index].role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete admin' });
  }
  // Xóa user khỏi danh sách
  db.users.splice(index, 1);
  // Xóa giỏ hàng tương ứng với user đó
  db.carts = db.carts.filter(c => c.userId !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = router;
