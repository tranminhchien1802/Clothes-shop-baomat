// --- ROUTE THỐNG KÊ ---
// File: server/routes/stats.js
// Mô tả: API thống kê doanh thu, sản phẩm bán chạy, tổng quan cho admin dashboard

const express = require('express');
const fs = require('fs');
const path = require('path');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

/* GET /api/stats/overview - Thống kê tổng quan
 * Trả về: { totalRevenue, totalOrders, totalProducts, totalUsers } */
router.get('/overview', adminAuth, (req, res) => {
  const db = readDB();
  const orders = db.orders || [];
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  res.json({
    success: true,
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: (db.products || []).length,
    totalUsers: (db.users || []).filter(u => u.role !== 'admin').length,
  });
});

/* GET /api/stats/revenue - Doanh thu theo ngày
 * Query: ?days=30 - số ngày gần đây (mặc định 30)
 * Trả về: { daily: [{date, revenue}], monthly: [{month, revenue}] } */
router.get('/revenue', adminAuth, (req, res) => {
  const db = readDB();
  const orders = db.orders || [];
  const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));

  // Nhóm doanh thu theo ngày
  const dailyMap = {};
  const monthlyMap = {};
  const now = new Date();

  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const dateKey = d.toISOString().slice(0, 10);
    const monthKey = d.toISOString().slice(0, 7);

    if (!dailyMap[dateKey]) dailyMap[dateKey] = 0;
    dailyMap[dateKey] += o.totalAmount || 0;

    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
    monthlyMap[monthKey] += o.totalAmount || 0;
  });

  // Tạo mảng daily cho N ngày gần đây
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    daily.push({ date: key, revenue: dailyMap[key] || 0 });
  }

  // Tạo mảng monthly cho năm nay
  const monthly = [];
  const currentYear = now.getFullYear();
  for (let m = 0; m < 12; m++) {
    const key = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    monthly.push({ month: key, revenue: monthlyMap[key] || 0 });
  }

  res.json({ success: true, daily, monthly });
});

/* GET /api/stats/bestsellers - Sản phẩm bán chạy
 * Query: ?limit=10 - số lượng sản phẩm (mặc định 10)
 * Trả về: [{ productId, name, totalQuantity, totalRevenue }] */
router.get('/bestsellers', adminAuth, (req, res) => {
  const db = readDB();
  const orders = db.orders || [];
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  // Tổng hợp số lượng và doanh thu từng sản phẩm trong tất cả đơn hàng
  const productMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const id = item.productId || item.name;
      if (!productMap[id]) {
        productMap[id] = {
          productId: item.productId || '',
          name: item.name,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productMap[id].totalQuantity += item.quantity || 0;
      productMap[id].totalRevenue += (item.price || 0) * (item.quantity || 0);
    });
  });

  // Sắp xếp theo số lượng giảm dần và lấy top N
  const bestsellers = Object.values(productMap)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);

  res.json({ success: true, bestsellers });
});

/* GET /api/stats/orders-by-status - Thống kê đơn hàng theo trạng thái */
router.get('/orders-by-status', adminAuth, (req, res) => {
  const db = readDB();
  const orders = db.orders || [];
  const statusMap = {};
  orders.forEach(o => {
    const s = o.status || 'unknown';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  res.json({ success: true, statusMap });
});

module.exports = router;
