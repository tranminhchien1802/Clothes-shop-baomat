// --- ROUTE QUẢN LÝ SẢN PHẨM ---
// File: server/routes/products.js
// Mô tả: API CRUD cho sản phẩm - xem danh sách (public), xem chi tiết (public),
//       thêm/sửa/xóa (yêu cầu quyền admin)

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { adminAuth } = require('../middleware/auth'); // Middleware yêu cầu quyền admin

const genShortId = () => crypto.randomUUID().slice(0, 5);

const stripHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
};

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

/* GET /api/products - Lấy danh sách tất cả sản phẩm (public, không cần đăng nhập)
 * Trả về: { success, products } */
router.get('/', (req, res) => {
  const db = readDB();
  res.json({ success: true, products: db.products || [] });
});

/* GET /api/products/:id - Lấy chi tiết một sản phẩm theo _id (public)
 * Params: id - _id của sản phẩm
 * Trả về: { success, product } hoặc 404 nếu không tìm thấy */
router.get('/:id', (req, res) => {
  const db = readDB();
  // Tìm sản phẩm theo _id
  const product = (db.products || []).find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

  /* POST /api/products - Thêm sản phẩm mới (yêu cầu admin)
   * Body: { name, description, price, category, subCategory, sizes, stock, hidden }
   * Trả về: { success, product } */
  router.post('/', adminAuth, (req, res) => {
    const db = readDB();
    let { name, description, price, category, subCategory, sizes, stock, hidden } = req.body;

    // Kiểm tra trường bắt buộc
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    name = stripHtml(name.trim().slice(0, 200));
    description = stripHtml((description || '').trim().slice(0, 2000));
    category = stripHtml((category || 'Men').trim().slice(0, 50));
    subCategory = stripHtml((subCategory || 'Topwear').trim().slice(0, 50));

    const validCategories = ['Men', 'Women', 'Kids'];
    const validSubCategories = ['Topwear', 'Bottomwear', 'Winterwear'];
    if (!validCategories.includes(category)) category = 'Men';
    if (!validSubCategories.includes(subCategory)) subCategory = 'Topwear';

    const finalSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes.filter(s => typeof s === 'string' && s.length <= 5)
      : ['S', 'M', 'L', 'XL'];
    // Tạo stock mặc định nếu không được cung cấp
    const defaultStock = {};
    finalSizes.forEach(s => { defaultStock[s] = 0; });
    const finalStock = (stock && typeof stock === 'object') ? stock : defaultStock;

    // Validate stock values
    for (const [size, qty] of Object.entries(finalStock)) {
      if (typeof qty !== 'number' || qty < 0 || !Number.isInteger(qty)) {
        finalStock[size] = 0;
      }
    }

    const validatedPrice = Math.max(0, Number(price));

    // Tạo đối tượng sản phẩm mới
    const product = {
      _id: genShortId(),
      name,
      description,
      price: validatedPrice,
      image: [],
      category,
      subCategory,
      sizes: finalSizes,
      stock: finalStock,
      hidden: !!hidden,
      date: Date.now(),
      bestseller: false,
    };

  // Thêm sản phẩm vào database
  db.products.push(product);
  writeDB(db);

  res.json({ success: true, product });
});

/* PUT /api/products/:id - Cập nhật sản phẩm (yêu cầu admin)
 * Params: id - _id của sản phẩm
 * Body: các trường cần cập nhật (name, description, price, category, subCategory, sizes, bestseller)
 * Chỉ cập nhật các trường được gửi lên (nếu undefined thì giữ nguyên) */
router.put('/:id', adminAuth, (req, res) => {
  const db = readDB();
  // Tìm index của sản phẩm trong mảng
  const index = (db.products || []).findIndex(p => p._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  let { name, description, price, category, subCategory, sizes, bestseller, stock, hidden } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ success: false, message: 'Invalid name' });
      db.products[index].name = stripHtml(name.trim().slice(0, 200));
    }
    if (description !== undefined) {
      if (typeof description !== 'string') return res.status(400).json({ success: false, message: 'Invalid description' });
      db.products[index].description = stripHtml(description.trim().slice(0, 2000));
    }
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) return res.status(400).json({ success: false, message: 'Invalid price' });
      db.products[index].price = numPrice;
    }
    if (category !== undefined) {
      if (typeof category !== 'string') return res.status(400).json({ success: false, message: 'Invalid category' });
      const validCategories = ['Men', 'Women', 'Kids'];
      if (!validCategories.includes(category)) return res.status(400).json({ success: false, message: 'Invalid category' });
      db.products[index].category = category;
    }
    if (subCategory !== undefined) {
      if (typeof subCategory !== 'string') return res.status(400).json({ success: false, message: 'Invalid subCategory' });
      const validSubCategories = ['Topwear', 'Bottomwear', 'Winterwear'];
      if (!validSubCategories.includes(subCategory)) return res.status(400).json({ success: false, message: 'Invalid subCategory' });
      db.products[index].subCategory = subCategory;
    }
    if (sizes !== undefined) {
      if (!Array.isArray(sizes)) return res.status(400).json({ success: false, message: 'Invalid sizes' });
      db.products[index].sizes = sizes.filter(s => typeof s === 'string' && s.length <= 5);
    }
    if (bestseller !== undefined) db.products[index].bestseller = !!bestseller;
    if (stock !== undefined) {
      if (typeof stock !== 'object' || stock === null) return res.status(400).json({ success: false, message: 'Invalid stock' });
      const validatedStock = {};
      for (const [size, qty] of Object.entries(stock)) {
        validatedStock[size] = (typeof qty === 'number' && qty >= 0 && Number.isInteger(qty)) ? qty : 0;
      }
      db.products[index].stock = validatedStock;
    }
    if (hidden !== undefined) db.products[index].hidden = !!hidden;

  writeDB(db);
  res.json({ success: true, product: db.products[index] });
});

/* DELETE /api/products/:id - Xóa sản phẩm (yêu cầu admin)
 * Params: id - _id của sản phẩm cần xóa
 * Trả về: { success, message } */
router.delete('/:id', adminAuth, (req, res) => {
  const db = readDB();
  // Tìm index của sản phẩm
  const index = (db.products || []).findIndex(p => p._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  // Xóa sản phẩm khỏi mảng
  db.products.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
