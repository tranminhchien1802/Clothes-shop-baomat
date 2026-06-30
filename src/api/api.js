const API_URL = '/api';

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

let refreshPromise = null;

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  let res = await fetch(`${API_URL}${endpoint}`, config);

  const noRefreshEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
  if (res.status === 401 && !noRefreshEndpoints.includes(endpoint)) {
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const rt = getRefreshToken();
          if (!rt) throw new Error('No refresh token');
          const r = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.message || 'Refresh failed');
          localStorage.setItem('token', d.accessToken);
          localStorage.setItem('refreshToken', d.refreshToken);
          return d.accessToken;
        })().finally(() => { refreshPromise = null; });
      }
      const newToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${endpoint}`, config);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      refreshPromise = null;
      throw new Error('Session expired. Please login again.');
    }
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error: Backend không phản hồi (${res.status}). Hãy chạy "npm run server" ở terminal khác.`);
  }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const authAPI = {
  login: (email, password, captcha_id, captcha_answer) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captcha_id, captcha_answer }),
    }),
  register: (name, email, password, captcha_id, captcha_answer) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, captcha_id, captcha_answer }),
    }),
  getMe: () => request('/auth/me'),
  getCaptcha: () => request('/auth/captcha'),
  refreshToken: (refreshToken) =>
    request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken) =>
    request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

export const cartAPI = {
  get: () => request('/cart'),
  add: (item) =>
    request('/cart', { method: 'POST', body: JSON.stringify(item) }),
  update: (productId, size, quantity) =>
    request('/cart', { method: 'PUT', body: JSON.stringify({ productId, size, quantity }) }),
  remove: (productId, size) =>
    request('/cart', { method: 'DELETE', body: JSON.stringify({ productId, size }) }),
  clear: () => request('/cart/clear', { method: 'DELETE' }),
};

export const ordersAPI = {
  create: (orderData) =>
    request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: () => request('/orders'),
  getAll: () => request('/orders/all'),
  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const usersAPI = {
  getAll: () => request('/users/all'),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const productsAPI = {
  getAll: () => request('/products'),
  getById: (id) => request(`/products/${id}`),
  create: (data) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),
};

export const statsAPI = {
  getOverview: () => request('/stats/overview'),
  getRevenue: (days = 30) => request(`/stats/revenue?days=${days}`),
  getBestsellers: (limit = 10) => request(`/stats/bestsellers?limit=${limit}`),
  getOrdersByStatus: () => request('/stats/orders-by-status'),
};

export const invoiceAPI = {
  getInvoiceUrl: (orderId) => `/api/orders/${orderId}/invoice`,
  getDeliveryNoteUrl: (orderId) => `/api/orders/${orderId}/delivery-note`,
};
