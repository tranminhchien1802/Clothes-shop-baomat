import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import HeaderDashed from "../components/HeaderDashed";
import { AuthContext } from "../context/AuthContext";
import { ordersAPI, usersAPI, productsAPI, statsAPI, invoiceAPI } from "../api/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminPanel = () => {
  const { user, login } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});

  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Men', subCategory: 'Topwear', stockS: '', stockM: '', stockL: '', stockXL: '' });

  const [reportView, setReportView] = useState('daily');

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        setIsLogin(true);
      } else {
        setIsLogin(false);
        fetchDashboardData();
        fetchOrders();
        fetchUsers();
        fetchProducts();
      }
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overview, rev, best, statusMap] = await Promise.all([
        statsAPI.getOverview(),
        statsAPI.getRevenue(),
        statsAPI.getBestsellers(),
        statsAPI.getOrdersByStatus(),
      ]);
      setOverviewData(overview);
      setRevenueData(rev.daily || []);
      setBestsellers(best.bestsellers || []);
      setOrdersByStatus(statusMap.statusMap || {});
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data.orders || []);
    } catch (err) { setError(err.message); }
  };

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data.users || []);
    } catch (err) { setError(err.message); }
  };

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data.products || []);
    } catch (err) { setError(err.message); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role !== 'admin') {
        setError('This account is not admin');
        return;
      }
    } catch (err) {
      setError(err.message);
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(userId);
      fetchUsers();
    } catch (err) { setError(err.message); }
  };

  const handleToggleHidden = async (id, currentHidden) => {
    try {
      await productsAPI.update(id, { hidden: !currentHidden });
      fetchProducts();
    } catch (err) { setError(err.message); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'Men', subCategory: 'Topwear', stockS: '', stockM: '', stockL: '', stockXL: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEdit = (product) => {
    const stockMap = {};
    (product.sizes || []).forEach(s => { stockMap[s.size] = s.quantity; });
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      category: product.category,
      subCategory: product.subCategory,
      stockS: stockMap['S'] ?? '',
      stockM: stockMap['M'] ?? '',
      stockL: stockMap['L'] ?? '',
      stockXL: stockMap['XL'] ?? '',
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.price) { setError('Name and price required'); return; }
    const sizes = [];
    if (form.stockS) sizes.push({ size: 'S', quantity: Number(form.stockS) });
    if (form.stockM) sizes.push({ size: 'M', quantity: Number(form.stockM) });
    if (form.stockL) sizes.push({ size: 'L', quantity: Number(form.stockL) });
    if (form.stockXL) sizes.push({ size: 'XL', quantity: Number(form.stockXL) });
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      subCategory: form.subCategory,
      sizes,
    };
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, data);
      } else {
        await productsAPI.create(data);
      }
      resetForm();
      fetchProducts();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      fetchProducts();
    } catch (err) { setError(err.message); }
  };

  const getStockDisplay = (sizes, stock) => {
    if (sizes && sizes.length > 0 && typeof sizes[0] === 'object') {
      return sizes.map(s => `${s.size}:${s.quantity}`).join(' ');
    }
    if (stock && typeof stock === 'object') {
      return Object.entries(stock).map(([size, qty]) => `${size}:${qty}`).join(' ');
    }
    return '-';
  };

  const getOrderStatusColor = (status) => {
    const map = { pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' };
    return map[status] || 'secondary';
  };

  const safeTotal = (overview) => {
    if (!overview) return { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 };
    return overview;
  };

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    return (o.id && o.id.toLowerCase().includes(q)) ||
           (o.userName && o.userName.toLowerCase().includes(q));
  });

  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    return p.name && p.name.toLowerCase().includes(q);
  });

  const pieData = Object.entries(ordersByStatus).map(([name, value]) => ({ name, value }));

  if (isLogin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="admin-panel text-center sec-padd">
        <div className="container" style={{ maxWidth: '500px' }}>
          <HeaderDashed head1="ADMIN" head2="PANEL" />
          <form onSubmit={handleLogin} className="mt-5 d-flex flex-column gap-4 align-items-center border border-2 p-4">
            {error && <div className="text-danger">{error}</div>}
            <div className="d-flex flex-column align-items-start w-100">
              <label className="mb-2 fs-4">Admin Email:</label>
              <input className="p-3 outline-0 w-100 border-gray border-05" type="text"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="Tài khoản" />
            </div>
            <div className="d-flex flex-column align-items-start w-100">
              <label className="mb-2 fs-4">Password:</label>
              <input className="p-3 outline-0 w-100 border-gray border-05" type="password"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" />
            </div>
            <button className="btn bg-black py-2 px-5 rounded c-white fs-5" type="submit" disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  const ov = safeTotal(overviewData);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sec-padd">
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="d-flex justify-content-between align-items-center">
          <HeaderDashed head1="Admin" head2="Dashboard" />
          <button className="btn btn-outline-dark" onClick={handleLogout}>Logout</button>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <ul className="nav nav-tabs mt-4">
          {['dashboard', 'orders', 'products', 'users', 'reports'].map(tab => (
            <li key={tab} className="nav-item">
              <button className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setError(''); }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          {activeTab === 'dashboard' && (
            loading ? <h3 className="text-center c-gray">Loading...</h3> : (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm bg-dark text-white h-100">
                      <div className="card-body text-center">
                        <h6 className="card-subtitle mb-2 text-white-50">Total Revenue</h6>
                        <h2 className="card-title mb-0">${ov.totalRevenue?.toLocaleString() || '0'}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm bg-primary text-white h-100">
                      <div className="card-body text-center">
                        <h6 className="card-subtitle mb-2 text-white-50">Total Orders</h6>
                        <h2 className="card-title mb-0">{ov.totalOrders || 0}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm bg-success text-white h-100">
                      <div className="card-body text-center">
                        <h6 className="card-subtitle mb-2 text-white-50">Total Products</h6>
                        <h2 className="card-title mb-0">{ov.totalProducts || 0}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm bg-warning text-white h-100">
                      <div className="card-body text-center">
                        <h6 className="card-subtitle mb-2 text-white-50">Total Users</h6>
                        <h2 className="card-title mb-0">{ov.totalUsers || 0}</h2>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-8">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title">Revenue (Last 30 Days)</h5>
                        {revenueData.length === 0 ? <p className="text-muted text-center">No revenue data</p> : (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title">Orders by Status</h5>
                        {pieData.length === 0 ? <p className="text-muted text-center">No data</p> : (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Best Sellers</h5>
                    {bestsellers.length === 0 ? <p className="text-muted text-center">No bestseller data</p> : (
                      <table className="table table-hover mb-0">
                        <thead><tr><th>Product</th><th>Total Quantity</th><th>Total Revenue</th></tr></thead>
                        <tbody>
                          {bestsellers.map((b, i) => (
                            <tr key={i}>
                              <td>{b.name}</td>
                              <td>{b.totalQuantity}</td>
                              <td>${b.totalRevenue?.toLocaleString() || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'orders' && (
            <div>
              <input className="form-control mb-3" style={{ maxWidth: 400 }} placeholder="Search by Order ID or Customer..."
                value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
              {orders.length === 0 ? <h3 className="text-center c-gray">No orders</h3> :
                filteredOrders.length === 0 ? <h3 className="text-center c-gray">No orders match</h3> :
                filteredOrders.map(order => (
                  <div key={order.id} className="border mb-3 p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <div>
                        <strong>Order #{order.id ? order.id.slice(0, 8) : 'N/A'}</strong>
                        <small className="ms-3 c-gray">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</small>
                        <small className="ms-3">Customer: {order.userName || order.userId || 'N/A'}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge bg-${getOrderStatusColor(order.status)}`}>{order.status}</span>
                        <select className="form-select form-select-sm w-auto"
                          value={order.status}
                          onChange={e => handleUpdateStatus(order.id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="btn btn-sm btn-outline-info" onClick={() => window.open(invoiceAPI.getInvoiceUrl(order.id), '_blank')}>Invoice</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => window.open(invoiceAPI.getDeliveryNoteUrl(order.id), '_blank')}>Delivery Note</button>
                      </div>
                    </div>
                    <table className="table table-sm table-borderless mb-0">
                      <thead>
                        <tr><th>Product</th><th>Price</th><th>Size</th><th>Qty</th><th>Total</th></tr>
                      </thead>
                      <tbody>
                        {order.items && order.items.map((item, i) => (
                          <tr key={i}>
                            <td>{item.name || 'N/A'}</td>
                            <td>${item.price ?? 0}</td>
                            <td>{item.size || '-'}</td>
                            <td>{item.quantity ?? 0}</td>
                            <td>${(item.price || 0) * (item.quantity || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="d-flex justify-content-between mt-2">
                      <small className="c-gray">
                        {order.shippingAddress && `Ship to: ${order.shippingAddress.fullName || ''}, ${order.shippingAddress.city || ''}`}
                      </small>
                      <strong>Total: ${order.totalAmount || 0}</strong>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <input className="form-control" style={{ maxWidth: 400 }} placeholder="Search by name..."
                  value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                <button className="btn bg-black c-white"
                  onClick={() => { resetForm(); setShowProductForm(true); }}>
                  + Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="border p-3 mb-3">
                  <h5>{editingProduct ? 'Edit Product' : 'New Product'}</h5>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <input className="form-control" placeholder="Name" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" placeholder="Price" type="number" value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <select className="form-select" value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option>Men</option><option>Women</option><option>Kids</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select className="form-select" value={form.subCategory}
                        onChange={e => setForm({ ...form, subCategory: e.target.value })}>
                        <option>Topwear</option><option>Bottomwear</option><option>Winterwear</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" placeholder="Sizes (S,M,L,XL)" value={`${form.stockS ? 'S:'+form.stockS : ''} ${form.stockM ? 'M:'+form.stockM : ''} ${form.stockL ? 'L:'+form.stockL : ''} ${form.stockXL ? 'XL:'+form.stockXL : ''}`.trim()} disabled />
                    </div>
                    <div className="col-md-3">
                      <input className="form-control" placeholder="Stock S" type="number" value={form.stockS}
                        onChange={e => setForm({ ...form, stockS: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input className="form-control" placeholder="Stock M" type="number" value={form.stockM}
                        onChange={e => setForm({ ...form, stockM: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input className="form-control" placeholder="Stock L" type="number" value={form.stockL}
                        onChange={e => setForm({ ...form, stockL: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input className="form-control" placeholder="Stock XL" type="number" value={form.stockXL}
                        onChange={e => setForm({ ...form, stockXL: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <input className="form-control" placeholder="Description" value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button className="btn bg-black c-white" onClick={handleSaveProduct}>Save</button>
                      <button className="btn btn-outline-dark" onClick={resetForm}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? <h3 className="text-center c-gray">No products</h3> : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Hidden</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p._id}>
                          <td style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p._id}</td>
                          <td>{p.name}</td>
                          <td>${p.price}</td>
                          <td>{p.category}</td>
                          <td style={{ fontSize: '0.85rem' }}>{getStockDisplay(p.sizes, p.stock)}</td>
                          <td>
                            <input type="checkbox" checked={!!p.hidden}
                              onChange={() => handleToggleHidden(p._id, p.hidden)} />
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              {users.length === 0 ? <h3 className="text-center c-gray">No users</h3> : (
                <table className="table table-bordered">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.role}</span></td>
                        <td>
                          {u.role !== 'admin' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            loading ? <h3 className="text-center c-gray">Loading...</h3> : (
              <div>
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">Revenue</h5>
                      <div className="btn-group">
                        <button className={`btn btn-sm ${reportView === 'daily' ? 'bg-black c-white' : 'btn-outline-dark'}`}
                          onClick={() => setReportView('daily')}>Daily</button>
                        <button className={`btn btn-sm ${reportView === 'monthly' ? 'bg-black c-white' : 'btn-outline-dark'}`}
                          onClick={() => setReportView('monthly')}>Monthly</button>
                      </div>
                    </div>
                    {revenueData.length === 0 ? <p className="text-muted text-center">No revenue data</p> : (
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Best Sellers</h5>
                    {bestsellers.length === 0 ? <p className="text-muted text-center">No bestseller data</p> : (
                      <table className="table table-hover mb-0">
                        <thead><tr><th>#</th><th>Product</th><th>Total Quantity</th><th>Total Revenue</th></tr></thead>
                        <tbody>
                          {bestsellers.map((b, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{b.name}</td>
                              <td>{b.totalQuantity}</td>
                              <td>${b.totalRevenue?.toLocaleString() || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="text-end">
                  <button className="btn btn-outline-dark" disabled>Export CSV (Coming Soon)</button>
                  <small className="ms-2 c-gray">Export functionality will be available soon</small>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
