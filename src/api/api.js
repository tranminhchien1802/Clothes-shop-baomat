// URL gốc của API backend (tất cả request đều gửi đến /api)
const API_URL = '/api';

// Lấy token JWT từ localStorage để xác thực người dùng
const getToken = () => localStorage.getItem('token');

// Hàm request cơ bản – dùng fetch để gọi API, tự động đính kèm token nếu có
const request = async (endpoint, options = {}) => {
  // Lấy token từ localStorage
  const token = getToken();
  // Cấu hình headers mặc định: Content-Type là JSON, nếu có token thì thêm Authorization Bearer
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  // Gửi request tới API_URL + endpoint (ví dụ: /api/auth/login)
  const res = await fetch(`${API_URL}${endpoint}`, config);
  // Parse response thành JSON
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error: Backend không phản hồi (${res.status}). Hãy chạy "npm run server" ở terminal khác.`);
  }
  // Nếu HTTP response không OK (status >= 400) thì throw lỗi với message từ server
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  // Trả về dữ liệu JSON nếu thành công
  return data;
};

// API nhóm xác thực (Authentication): login, register, lấy thông tin user hiện tại
export const authAPI = {
  // POST /auth/login – đăng nhập với email và password
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  // POST /auth/register – đăng ký tài khoản mới (name, email, password)
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  // GET /auth/me – lấy thông tin user từ token hiện tại
  getMe: () => request('/auth/me'),
};

// API nhóm giỏ hàng (Cart): lấy, thêm, cập nhật, xoá sản phẩm, xoá toàn bộ giỏ
export const cartAPI = {
  // GET /cart – lấy danh sách sản phẩm trong giỏ hàng
  get: () => request('/cart'),
  // POST /cart – thêm sản phẩm vào giỏ (item chứa productId, name, price, image, size, quantity)
  add: (item) =>
    request('/cart', { method: 'POST', body: JSON.stringify(item) }),
  // PUT /cart – cập nhật số lượng sản phẩm (productId, size, quantity)
  update: (productId, size, quantity) =>
    request('/cart', { method: 'PUT', body: JSON.stringify({ productId, size, quantity }) }),
  // DELETE /cart – xoá một sản phẩm khỏi giỏ (theo productId và size)
  remove: (productId, size) =>
    request('/cart', { method: 'DELETE', body: JSON.stringify({ productId, size }) }),
  // DELETE /cart/clear – xoá toàn bộ giỏ hàng
  clear: () => request('/cart/clear', { method: 'DELETE' }),
};

// API nhóm đơn hàng (Orders): tạo đơn, lấy danh sách, lấy tất cả (admin), cập nhật trạng thái
export const ordersAPI = {
  // POST /orders – tạo đơn hàng mới với orderData (items, totalAmount, shippingAddress, paymentMethod)
  create: (orderData) =>
    request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  // GET /orders – lấy danh sách đơn hàng của user hiện tại
  getMyOrders: () => request('/orders'),
  // GET /orders/all – lấy tất cả đơn hàng (chỉ admin)
  getAll: () => request('/orders/all'),
  // PUT /orders/:id/status – cập nhật trạng thái đơn hàng (admin)
  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// API nhóm người dùng (Users): lấy danh sách và xoá người dùng (chỉ admin)
export const usersAPI = {
  // GET /users/all – lấy tất cả người dùng
  getAll: () => request('/users/all'),
  // DELETE /users/:id – xoá người dùng theo ID
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

// API nhóm sản phẩm (Products): lấy tất cả, lấy theo ID, tạo, cập nhật, xoá
export const productsAPI = {
  // GET /products – lấy danh sách tất cả sản phẩm
  getAll: () => request('/products'),
  // GET /products/:id – lấy chi tiết một sản phẩm
  getById: (id) => request(`/products/${id}`),
  // POST /products – tạo sản phẩm mới (admin)
  create: (data) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  // PUT /products/:id – cập nhật sản phẩm (admin)
  update: (id, data) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  // DELETE /products/:id – xoá sản phẩm (admin)
  delete: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),
};

// API nhóm thống kê (Stats): tổng quan, doanh thu, bán chạy (admin)
export const statsAPI = {
  // GET /stats/overview – thông tin tổng quan
  getOverview: () => request('/stats/overview'),
  // GET /stats/revenue?days=30 – doanh thu theo ngày
  getRevenue: (days = 30) => request(`/stats/revenue?days=${days}`),
  // GET /stats/bestsellers?limit=10 – sản phẩm bán chạy
  getBestsellers: (limit = 10) => request(`/stats/bestsellers?limit=${limit}`),
  // GET /stats/orders-by-status – thống kê đơn hàng theo trạng thái
  getOrdersByStatus: () => request('/stats/orders-by-status'),
};

// API nhóm hóa đơn / phiếu giao hàng
export const invoiceAPI = {
  getInvoiceUrl: (orderId) => `/api/orders/${orderId}/invoice`,
  getDeliveryNoteUrl: (orderId) => `/api/orders/${orderId}/delivery-note`,
};
