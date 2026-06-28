// --- ROUTE ĐƠN HÀNG ---
// File: server/routes/orders.js
// Mô tả: API tạo đơn hàng, lấy danh sách đơn hàng (user), xem tất cả đơn (admin), cập nhật trạng thái (admin)

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { auth, adminAuth } = require('../middleware/auth');

const genId = () => crypto.randomUUID();

// Hàm escape HTML entities để chống XSS
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
};

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

/* POST /api/orders - Tạo đơn hàng mới (yêu cầu đăng nhập)
 * Body: { items, totalAmount, shippingAddress, paymentMethod }
 * Sau khi tạo đơn, xóa giỏ hàng của user
 * Trả về: { success, order } */
router.post('/', auth, (req, res) => {
  const db = readDB();
  const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

  // Kiểm tra giỏ hàng không được rỗng
  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Validate từng item trong đơn hàng
  for (const item of items) {
    if (!item.productId || typeof item.productId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid productId in cart item' });
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return res.status(400).json({ success: false, message: 'Invalid price in cart item' });
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity in cart item' });
    }
  }

  // Validate shippingAddress
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return res.status(400).json({ success: false, message: 'Shipping address required' });
  }
  if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
    return res.status(400).json({ success: false, message: 'Missing required shipping fields (fullName, street, city)' });
  }
  if (typeof totalAmount !== 'number' || totalAmount < 0) {
    return res.status(400).json({ success: false, message: 'Invalid total amount' });
  }

  // Xóa giỏ hàng của user sau khi đặt hàng thành công
  const userCart = db.carts.find(c => c.userId === req.user.id);
  if (userCart) {
    userCart.items = [];
  }

  const userData = db.users.find(u => u.id === req.user.id);
  const order = {
    id: genId(),
    userId: req.user.id,
    userName: userData ? userData.name : 'Unknown',
    items,
    totalAmount,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Thêm đơn hàng vào database
  db.orders.push(order);
  writeDB(db);

  res.json({ success: true, order });
});

/* GET /api/orders - Lấy danh sách đơn hàng của user hiện tại (yêu cầu đăng nhập)
 * Trả về: { success, orders } */
router.get('/', auth, (req, res) => {
  const db = readDB();
  // Lọc đơn hàng theo userId
  const userOrders = db.orders.filter(o => o.userId === req.user.id);
  res.json({ success: true, orders: userOrders });
});

/* GET /api/orders/all - Lấy tất cả đơn hàng (yêu cầu quyền admin)
 * Trả về: { success, orders } - sắp xếp mới nhất trước */
router.get('/all', adminAuth, (req, res) => {
  const db = readDB();
  const sorted = [...(db.orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, orders: sorted });
});

/* PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (yêu cầu quyền admin)
 * Params: id - ID của đơn hàng
 * Body: { status } - Trạng thái mới (vd: 'shipping', 'delivered', 'cancelled')
 * Trả về: { success, order } */
router.put('/:id/status', adminAuth, (req, res) => {
  const db = readDB();
  const { status } = req.body;
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }
  // Tìm đơn hàng theo id
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  // Cập nhật trạng thái
  order.status = status;
  writeDB(db);
  res.json({ success: true, order });
});

/* GET /api/orders/:id/invoice - Xuất hóa đơn HTML cho đơn hàng (admin)
 * Trả về: HTML trang hóa đơn có thể in */
router.get('/:id/invoice', adminAuth, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const itemsHtml = order.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.size) || '-'}</td>
      <td>${Number(item.quantity) || 0}</td>
      <td>$${(Number(item.price) || 0).toFixed(2)}</td>
      <td>$${((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const addr = order.shippingAddress || {};

  const safeId = escapeHtml(order.id);
  const safeUserName = escapeHtml(order.userName || order.userId);
  const safePayment = escapeHtml(order.paymentMethod || 'COD');
  const safeStatus = escapeHtml(order.status);
  const safeFullName = escapeHtml(addr.fullName || '');
  const safeStreet = escapeHtml(addr.street || '');
  const safeCity = escapeHtml(addr.city || '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice - ${safeId.slice(0, 8)}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
  h1 { text-align: center; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
  .info { margin: 20px 0; }
  .info div { margin: 5px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
  .footer { text-align: center; margin-top: 40px; color: #888; font-size: 0.9em; }
  @media print { body { margin: 20px; } .no-print { display: none; } }
</style></head>
<body>
  <h1>INVOICE</h1>
  <div class="info">
    <div><strong>Order ID:</strong> ${safeId}</div>
    <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
    <div><strong>Customer:</strong> ${safeUserName}</div>
    <div><strong>Payment:</strong> ${safePayment}</div>
    <div><strong>Status:</strong> ${safeStatus}</div>
    <div><strong>Ship to:</strong> ${safeFullName}, ${safeStreet}, ${safeCity}</div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="total">Total Amount: $${(Number(order.totalAmount) || 0).toFixed(2)}</div>
  <div class="footer">Thank you for your purchase!</div>
  <div class="no-print" style="text-align:center;margin-top:20px">
    <button onclick="window.print()" style="padding:10px 30px;font-size:16px">Print Invoice</button>
  </div>
</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/* GET /api/orders/:id/delivery-note - Xuất phiếu giao hàng HTML (admin)
 * Trả về: HTML phiếu giao hàng có thể in */
router.get('/:id/delivery-note', adminAuth, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const itemsHtml = order.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.size) || '-'}</td>
      <td>${Number(item.quantity) || 0}</td>
    </tr>
  `).join('');

  const addr = order.shippingAddress || {};

  const safeId = escapeHtml(order.id);
  const safeUserName = escapeHtml(addr.fullName || order.userName || order.userId);
  const safePhone = escapeHtml(addr.phone || '-');
  const safeStreet = escapeHtml(addr.street || '');
  const safeCity = escapeHtml(addr.city || '');
  const safeState = escapeHtml(addr.state || '');
  const safeZip = escapeHtml(addr.zip || '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Delivery Note - ${safeId.slice(0, 8)}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
  h1 { text-align: center; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
  .info { margin: 20px 0; }
  .info div { margin: 5px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
  .signatures div { text-align: center; }
  .signatures .line { width: 200px; border-top: 1px solid #333; margin-top: 40px; }
  @media print { body { margin: 20px; } }
</style></head>
<body>
  <h1>DELIVERY NOTE</h1>
  <div class="info">
    <div><strong>Order ID:</strong> ${safeId}</div>
    <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
    <div><strong>Customer:</strong> ${safeUserName}</div>
    <div><strong>Phone:</strong> ${safePhone}</div>
    <div><strong>Address:</strong> ${safeStreet}, ${safeCity} ${safeState} ${safeZip}</div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Product</th><th>Size</th><th>Qty</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="signatures">
    <div><div class="line"></div>Shipper Signature</div>
    <div><div class="line"></div>Customer Signature</div>
  </div>
</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
