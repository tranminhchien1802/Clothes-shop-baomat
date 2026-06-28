// --- ROUTE GIỎ HÀNG ---
// File: server/routes/cart.js
// Mô tả: API quản lý giỏ hàng của người dùng (yêu cầu xác thực)

const express = require('express');
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth'); // Middleware yêu cầu đăng nhập

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

// Hàm đọc/ghi database từ file json
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

/* GET /api/cart - Lấy danh sách sản phẩm trong giỏ hàng của user hiện tại
 * Header: Authorization: Bearer <token>
 * Trả về: { success, cart } - cart là mảng các item trong giỏ */
router.get('/', auth, (req, res) => {
  const db = readDB();
  // Tìm giỏ hàng của user dựa trên id từ token
  const userCart = db.carts.find(c => c.userId === req.user.id);
  // Nếu chưa có giỏ thì trả về mảng rỗng
  res.json({ success: true, cart: userCart ? userCart.items : [] });
});

/* POST /api/cart - Thêm sản phẩm vào giỏ hàng
 * Body: { productId, name, price, image, size, quantity }
 * Nếu sản phẩm đã tồn tại trong giỏ (cùng productId và size) → tăng số lượng
 * Nếu chưa có → thêm item mới */
router.post('/', auth, (req, res) => {
  const db = readDB();
  const { productId, name, price, image, size, quantity } = req.body;

  // Validate input
  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid productId' });
  }
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({ success: false, message: 'Invalid price' });
  }
  const validQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  if (validQuantity > 100) {
    return res.status(400).json({ success: false, message: 'Quantity cannot exceed 100' });
  }

  // Tìm giỏ hàng của user, nếu chưa có thì tạo mới
  let userCart = db.carts.find(c => c.userId === req.user.id);
  if (!userCart) {
    userCart = { userId: req.user.id, items: [] };
    db.carts.push(userCart);
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa (cùng productId và size)
  const existingIndex = userCart.items.findIndex(
    item => item.productId === productId && item.size === size
  );

  if (existingIndex > -1) {
    // Nếu đã có: tăng số lượng (giới hạn tối đa 100)
    userCart.items[existingIndex].quantity = Math.min(100, userCart.items[existingIndex].quantity + validQuantity);
  } else {
    // Nếu chưa có: thêm item mới (name được giới hạn độ dài)
    userCart.items.push({
      productId,
      name: typeof name === 'string' ? name.slice(0, 200) : 'Product',
      price: typeof price === 'number' ? price : 0,
      image: typeof image === 'string' ? image.slice(0, 500) : '',
      size: typeof size === 'string' ? size.slice(0, 10) : '',
      quantity: validQuantity,
    });
  }

  writeDB(db);
  res.json({ success: true, cart: userCart.items });
});

/* PUT /api/cart - Cập nhật số lượng sản phẩm trong giỏ hàng
 * Body: { productId, size, quantity }
 * Tìm item theo productId và size, cập nhật quantity */
router.put('/', auth, (req, res) => {
  const db = readDB();
  let { productId, size, quantity } = req.body;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid productId' });
  }
  const validQuantity = Math.max(1, Math.min(100, Math.floor(Number(quantity) || 1)));

  const userCart = db.carts.find(c => c.userId === req.user.id);
  if (!userCart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  // Tìm item theo productId và size
  const item = userCart.items.find(
    item => item.productId === productId && item.size === size
  );
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found in cart' });
  }

  // Cập nhật số lượng mới (giới hạn 1-100)
  item.quantity = validQuantity;
  writeDB(db);
  res.json({ success: true, cart: userCart.items });
});

/* DELETE /api/cart - Xóa sản phẩm khỏi giỏ hàng
 * Body: { productId, size }
 * Lọc bỏ item có productId và size tương ứng */
router.delete('/', auth, (req, res) => {
  const db = readDB();
  const { productId, size } = req.body;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid productId' });
  }

  const userCart = db.carts.find(c => c.userId === req.user.id);
  if (!userCart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  // Xóa item khỏi mảng items (lọc ra các item không match)
  userCart.items = userCart.items.filter(
    item => !(item.productId === productId && item.size === size)
  );

  writeDB(db);
  res.json({ success: true, cart: userCart.items });
});

/* DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
 * Đặt mảng items của user về rỗng */
router.delete('/clear', auth, (req, res) => {
  const db = readDB();
  const userCart = db.carts.find(c => c.userId === req.user.id);
  if (userCart) {
    userCart.items = [];
    writeDB(db);
  }
  res.json({ success: true, cart: [] });
});

module.exports = router;
