// --- MIDDLEWARE XÁC THỰC ---
// File: server/middleware/auth.js
// Mô tả: Middleware kiểm tra JWT token cho route cần đăng nhập (auth) và route yêu cầu quyền admin (adminAuth)

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Sử dụng biến môi trường JWT_SECRET, nếu không có thì tạo key ngẫu nhiên (không hardcode)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

/* Middleware xác thực người dùng thông thường
 * Kiểm tra header Authorization có chứa Bearer token hợp lệ không
 * Nếu hợp lệ → gắn thông tin user decoded vào req.user và gọi next()
 * Nếu không → trả về 401 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Kiểm tra sự tồn tại của header và định dạng Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Tách token từ chuỗi "Bearer <token>"
  const token = authHeader.split(' ')[1];
  try {
    // Verify token với JWT_SECRET, nếu ok thì decode payload
    const decoded = jwt.verify(token, JWT_SECRET);
    // Kiểm tra User-Agent binding — chống session hijacking
    const currentUA = req.headers['user-agent'] || '';
    if (decoded.ua && decoded.ua !== currentUA) {
      return res.status(401).json({ success: false, message: 'UA mismatch — session hijacking detected' });
    }
    req.user = decoded; // Lưu thông tin user vào request để dùng ở controller tiếp theo
    next();
  } catch (error) {
    // Token không hợp lệ hoặc đã hết hạn
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/* Middleware xác thực admin
 * Chạy auth trước, sau đó kiểm tra role của user có phải 'admin' không
 * Nếu không phải admin → trả về 403 Forbidden */
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    next();
  });
};

// Export cả hai middleware và JWT_SECRET để dùng ở nơi khác
module.exports = { auth, adminAuth, JWT_SECRET };
