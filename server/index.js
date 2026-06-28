// --- SERVER CHÍNH ---
// File: server/index.js
// Mô tả: Entry point của backend server, khởi tạo Express app, kết nối các route, seed dữ liệu ban đầu

// Load biến môi trường từ file .env (quan trọng: phải ở đầu tiên)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import các router từ thư mục routes
const authRoutes = require('./routes/auth');       // Router xử lý đăng nhập / đăng ký
const cartRoutes = require('./routes/cart');        // Router xử lý giỏ hàng
const ordersRoutes = require('./routes/orders');    // Router xử lý đơn hàng
const usersRoutes = require('./routes/users');      // Router quản lý người dùng (admin)
const productsRoutes = require('./routes/products');
const statsRoutes = require('./routes/stats'); // Router quản lý sản phẩm (admin)

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(helmet({
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (server-to-server, mobile app, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Giới hạn kích thước request body (chống DoS)
app.use(express.json({ limit: '1mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stats', statsRoutes);

// Endpoint kiểm tra sức khỏe server
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler - KHÔNG rò rỉ stack trace ra ngoài
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const bcrypt = require('bcryptjs');
const fs = require('fs');
const DB_PATH = path.join(__dirname, 'db.json');

// Dữ liệu sản phẩm mẫu để seed lần đầu khi database còn trống
const seedProducts = [
  { "_id": "aaaaa", "name": "Women Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 100, "category": "Women", "subCategory": "Topwear", "sizes": ["S", "M", "L"], "date": 1716634345448, "bestseller": true },
  { "_id": "aaaab", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 200, "category": "Men", "subCategory": "Topwear", "sizes": ["M", "L", "XL"], "date": 1716621345448, "bestseller": true },
  { "_id": "aaaac", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 220, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "L", "XL"], "date": 1716234545448, "bestseller": true },
  { "_id": "aaaad", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 110, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "XXL"], "date": 1716621345448, "bestseller": true },
  { "_id": "aaaae", "name": "Women Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 130, "category": "Women", "subCategory": "Topwear", "sizes": ["M", "L", "XL"], "date": 1716622345448, "bestseller": true },
  { "_id": "aaaaf", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 140, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "L", "XL"], "date": 1716623423448, "bestseller": true },
  { "_id": "aaaag", "name": "Men Tapered Fit Flat-Front Trousers", "description": "A lightweight, usually knitted, pullover shirt.", "price": 190, "category": "Men", "subCategory": "Bottomwear", "sizes": ["S", "L", "XL"], "date": 1716621542448, "bestseller": false },
  { "_id": "aaaah", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 140, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716622345448, "bestseller": false },
  { "_id": "aaaai", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 100, "category": "Kids", "subCategory": "Topwear", "sizes": ["M", "L", "XL"], "date": 1716621235448, "bestseller": false },
  { "_id": "aaaaj", "name": "Men Tapered Fit Flat-Front Trousers", "description": "A lightweight, usually knitted, pullover shirt.", "price": 110, "category": "Men", "subCategory": "Bottomwear", "sizes": ["S", "L", "XL"], "date": 1716622235448, "bestseller": false },
  { "_id": "aaaak", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 120, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L"], "date": 1716623345448, "bestseller": false },
  { "_id": "aaaal", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 150, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716624445448, "bestseller": false },
  { "_id": "aaaam", "name": "Women Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 130, "category": "Women", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716625545448, "bestseller": false },
  { "_id": "aaaan", "name": "Boy Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 160, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716626645448, "bestseller": false },
  { "_id": "aaaao", "name": "Men Tapered Fit Flat-Front Trousers", "description": "A lightweight, usually knitted, pullover shirt.", "price": 140, "category": "Men", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716627745448, "bestseller": false },
  { "_id": "aaaap", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 170, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716628845448, "bestseller": false },
  { "_id": "aaaaq", "name": "Men Tapered Fit Flat-Front Trousers", "description": "A lightweight, usually knitted, pullover shirt.", "price": 150, "category": "Men", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716629945448, "bestseller": false },
  { "_id": "aaaar", "name": "Boy Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 180, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716631045448, "bestseller": false },
  { "_id": "aaaas", "name": "Boy Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 160, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716632145448, "bestseller": false },
  { "_id": "aaaat", "name": "Women Palazzo Pants with Waist Belt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 190, "category": "Women", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716633245448, "bestseller": false },
  { "_id": "aaaau", "name": "Women Zip-Front Relaxed Fit Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 170, "category": "Women", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716634345448, "bestseller": false },
  { "_id": "aaaav", "name": "Women Palazzo Pants with Waist Belt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 200, "category": "Women", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716635445448, "bestseller": false },
  { "_id": "aaaaw", "name": "Boy Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 180, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716636545448, "bestseller": false },
  { "_id": "aaaax", "name": "Boy Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 210, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716637645448, "bestseller": false },
  { "_id": "aaaay", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 190, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716638745448, "bestseller": false },
  { "_id": "aaaaz", "name": "Women Zip-Front Relaxed Fit Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 220, "category": "Women", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716639845448, "bestseller": false },
  { "_id": "aaaba", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 200, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716640945448, "bestseller": false },
  { "_id": "aaabb", "name": "Men Slim Fit Relaxed Denim Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 230, "category": "Men", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716642045448, "bestseller": false },
  { "_id": "aaabc", "name": "Women Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 210, "category": "Women", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716643145448, "bestseller": false },
  { "_id": "aaabd", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 240, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716644245448, "bestseller": false },
  { "_id": "aaabe", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 220, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716645345448, "bestseller": false },
  { "_id": "aaabf", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 250, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716646445448, "bestseller": false },
  { "_id": "aaabg", "name": "Girls Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 230, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716647545448, "bestseller": false },
  { "_id": "aaabh", "name": "Women Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 260, "category": "Women", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716648645448, "bestseller": false },
  { "_id": "aaabi", "name": "Women Zip-Front Relaxed Fit Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 240, "category": "Women", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716649745448, "bestseller": false },
  { "_id": "aaabj", "name": "Women Zip-Front Relaxed Fit Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 270, "category": "Women", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716650845448, "bestseller": false },
  { "_id": "aaabk", "name": "Women Round Neck Cotton Top", "description": "A lightweight, usually knitted, pullover shirt.", "price": 250, "category": "Women", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716651945448, "bestseller": false },
  { "_id": "aaabl", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 280, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716653045448, "bestseller": false },
  { "_id": "aaabm", "name": "Men Printed Plain Cotton Shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 260, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716654145448, "bestseller": false },
  { "_id": "aaabn", "name": "Men Slim Fit Relaxed Denim Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 290, "category": "Men", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716655245448, "bestseller": false },
  { "_id": "aaabo", "name": "Men Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 270, "category": "Men", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716656345448, "bestseller": false },
  { "_id": "aaabp", "name": "Boy Round Neck Pure Cotton T-shirt", "description": "A lightweight, usually knitted, pullover shirt.", "price": 300, "category": "Kids", "subCategory": "Topwear", "sizes": ["S", "M", "L", "XL"], "date": 1716657445448, "bestseller": false },
  { "_id": "aaabq", "name": "Kid Tapered Slim Fit Trouser", "description": "A lightweight, usually knitted, pullover shirt.", "price": 280, "category": "Kids", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716658545448, "bestseller": false },
  { "_id": "aaabr", "name": "Women Zip-Front Relaxed Fit Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 310, "category": "Women", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716659645448, "bestseller": false },
  { "_id": "aaabs", "name": "Men Slim Fit Relaxed Denim Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 290, "category": "Men", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716660745448, "bestseller": false },
  { "_id": "aaabt", "name": "Men Slim Fit Relaxed Denim Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 320, "category": "Men", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716661845448, "bestseller": false },
  { "_id": "aaabu", "name": "Kid Tapered Slim Fit Trouser", "description": "A lightweight, usually knitted, pullover shirt.", "price": 300, "category": "Kids", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716662945448, "bestseller": false },
  { "_id": "aaabv", "name": "Men Slim Fit Relaxed Denim Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 330, "category": "Men", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716664045448, "bestseller": false },
  { "_id": "aaabw", "name": "Kid Tapered Slim Fit Trouser", "description": "A lightweight, usually knitted, pullover shirt.", "price": 310, "category": "Kids", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716665145448, "bestseller": false },
  { "_id": "aaabx", "name": "Kid Tapered Slim Fit Trouser", "description": "A lightweight, usually knitted, pullover shirt.", "price": 340, "category": "Kids", "subCategory": "Bottomwear", "sizes": ["S", "M", "L", "XL"], "date": 1716666245448, "bestseller": false },
  { "_id": "aaaby", "name": "Women Zip-Front Relaxed Fit Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 320, "category": "Women", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716667345448, "bestseller": false },
  { "_id": "aaabz", "name": "Men Slim Fit Relaxed Denim Jacket", "description": "A lightweight, usually knitted, pullover shirt.", "price": 350, "category": "Men", "subCategory": "Winterwear", "sizes": ["S", "M", "L", "XL"], "date": 1716668445448, "bestseller": false },
];

/* Hàm khởi tạo database
 * Đọc file db.json, seed sản phẩm mẫu nếu chưa có,
 * và hash lại mật khẩu admin nếu đang dùng hash giả */
const initDb = async () => {
  let db;
  try {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    console.error('Database file corrupted, initializing empty database...');
    db = { products: [], users: [], carts: [], orders: [] };
  }

  // Nếu chưa có sản phẩm nào, thêm seedProducts vào database
  if (!db.products || db.products.length === 0) {
    db.products = seedProducts;
    console.log('Products seeded');
  }

  // Thêm stock và hidden cho sản phẩm chưa có
  let productsUpdated = false;
  db.products.forEach(p => {
    if (!p.stock) {
      p.stock = {};
      (p.sizes || ['S', 'M', 'L', 'XL']).forEach(s => { p.stock[s] = 50; });
      productsUpdated = true;
    }
    if (p.hidden === undefined) {
      p.hidden = false;
      productsUpdated = true;
    }
  });
  if (productsUpdated) console.log('Products stock/hidden added');

  const admin = db.users.find(u => u.email === 'admin');
  if (admin && admin.password && admin.password.length < 20) {
    const hashed = await bcrypt.hash('123', 10);
    admin.password = hashed;
  }

  if (!admin) {
    const hashed = await bcrypt.hash('123', 10);
    db.users.push({
      id: '1',
      name: 'Admin',
      email: 'admin',
      password: hashed,
      role: 'admin'
    });
  }

  // Ghi lại database sau khi seed / hash
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

// Khởi tạo database rồi mới lắng nghe kết nối
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
