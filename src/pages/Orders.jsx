import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeaderDashed from "../components/HeaderDashed";
import { ordersAPI } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { OrderIterator } from "../patterns";

const stepOrder = ['pending', 'confirmed', 'shipped', 'delivered'];

// Trang "My Orders" – hiển thị danh sách đơn hàng của người dùng hiện tại
// Sử dụng OrderIterator (Iterator Pattern) để duyệt và thống kê đơn hàng
const Orders = () => {
  // State lưu danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  // State loading khi đang fetch dữ liệu
  const [loading, setLoading] = useState(true);
  // Lấy thông tin user từ AuthContext để kiểm tra đăng nhập
  const { user } = useContext(AuthContext);
  // Hook điều hướng
  const navigate = useNavigate();

  // Khi component mount, kiểm tra đăng nhập và fetch danh sách đơn hàng
  useEffect(() => {
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    if (!user) {
      navigate('/login');
      return;
    }
    // Gọi API lấy đơn hàng của user hiện tại
    ordersAPI.getMyOrders()
      .then(data => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false)); // Kết thúc loading
  }, [user, navigate]);

  // Sử dụng OrderIterator để thống kê đơn hàng
  const orderIterator = new OrderIterator(orders);
  const totalRevenue = orderIterator.getTotalRevenue();
  const statusStats = orderIterator.countByStatus();

  // Hàm trả về class màu Bootstrap dựa trên trạng thái đơn hàng
  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-warning',
      confirmed: 'bg-info',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger',
    };
    return colors[status] || 'bg-secondary';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sec-padd">
      <div className="container">
        {/* Tiêu đề "My Orders" */}
        <HeaderDashed head1="My" head2="Orders" />

        {/* Đang loading */}
        {loading ? (
          <h3 className="text-center mt-5 c-gray">Loading...</h3>
        ) : orders.length === 0 ? (
          <div className="text-center mt-5">
            <h3 className="c-gray">No orders yet</h3>
          </div>
        ) : (
          <>
          <style>{`
            @keyframes pulse-step {
              0% { box-shadow: 0 0 0 0 rgba(0, 136, 254, 0.4); }
              70% { box-shadow: 0 0 0 10px rgba(0, 136, 254, 0); }
              100% { box-shadow: 0 0 0 0 rgba(0, 136, 254, 0); }
            }
          `}</style>
          <div className="mt-4 row g-3 text-center">
            <div className="col-6 col-md-3">
              <div className="border p-3 rounded">
                <h5 className="fw-bold mb-1">{orders.length}</h5>
                <small className="c-gray">Total Orders</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="border p-3 rounded">
                <h5 className="fw-bold mb-1">${totalRevenue}</h5>
                <small className="c-gray">Total Revenue</small>
              </div>
            </div>
            {Object.entries(statusStats).map(([status, count]) => (
              <div className="col-6 col-md-3" key={status}>
                <div className="border p-3 rounded">
                  <h5 className={`fw-bold mb-1 text-${status === 'cancelled' ? 'danger' : 'success'}`}>{count}</h5>
                  <small className="c-gray text-capitalize">{status}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            {orders.map((order) => {
              const currentStepIndex = stepOrder.indexOf(order.status);
              const isCancelled = order.status === 'cancelled';
              const stepsToRender = isCancelled ? [...stepOrder, 'cancelled'] : stepOrder;

              return (
              <div key={order.id} className="border mb-4 p-4">
                {/* Header đơn hàng: ID rút gọn, ngày tạo, trạng thái */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <strong>Order #{order.id.slice(0, 8)}</strong>
                    <small className="ms-3 c-gray">{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  {/* Badge hiển thị trạng thái với màu tương ứng */}
                  <span className={`badge ${getStatusBadge(order.status)} text-white px-3 py-2`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Order Tracking Timeline */}
                <div className="order-timeline mb-4" style={{ padding: '16px 0' }}>
                  <div className="d-flex justify-content-between align-items-center" style={{ position: 'relative' }}>
                    {/* Background line */}
                    <div style={{ position: 'absolute', top: '12px', left: '5%', right: '5%', height: '2px', background: '#e0e0e0', zIndex: 0 }} />

                    {/* Green progress line (hidden for cancelled) */}
                    {!isCancelled && currentStepIndex >= 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '5%',
                        width: `${(currentStepIndex / (stepOrder.length - 1)) * 90}%`,
                        height: '2px',
                        background: '#00C49F',
                        zIndex: 1,
                        transition: 'width 0.5s ease'
                      }} />
                    )}

                    {stepsToRender.map((step, idx) => {
                      const stepIdx = stepOrder.indexOf(step);
                      const isStepCompleted = !isCancelled && stepIdx >= 0 && stepIdx < currentStepIndex;
                      const isStepCurrent = !isCancelled && step === order.status;
                      const isStepCancelled = isCancelled && step === 'cancelled';

                      let circleBg = 'transparent';
                      let circleBorder = '2px solid #ccc';
                      let circleBoxShadow = 'none';
                      let labelColor = '#999';
                      let labelWeight = 400;

                      if (isStepCancelled) {
                        circleBg = '#ff4d4f';
                        circleBorder = 'none';
                        labelColor = '#ff4d4f';
                        labelWeight = 600;
                      } else if (isStepCompleted) {
                        circleBg = '#00C49F';
                        circleBorder = 'none';
                        labelColor = '#00C49F';
                      } else if (isStepCurrent) {
                        circleBg = '#0088FE';
                        circleBorder = 'none';
                        circleBoxShadow = '0 0 0 4px rgba(0,136,254,0.25)';
                        labelColor = '#0088FE';
                        labelWeight = 600;
                      }

                      return (
                        <div key={step} className="d-flex flex-column align-items-center" style={{ zIndex: 2, flex: 1 }}>
                          {isStepCurrent ? (
                            <motion.div
                              className="step-current"
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              style={{ width: 24, height: 24, borderRadius: '50%', background: circleBg, boxShadow: circleBoxShadow }}
                            />
                          ) : (
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: circleBg, border: circleBorder, boxShadow: circleBoxShadow }} />
                          )}
                          <small className="mt-1" style={{ fontSize: '0.7rem', fontWeight: labelWeight, color: labelColor, textTransform: 'capitalize' }}>
                            {step}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bảng danh sách sản phẩm trong đơn hàng */}
                <table className="table table-borderless mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>${item.price}</td>
                        <td>{item.size}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Tổng tiền đơn hàng */}
                <div className="d-flex justify-content-end mt-3">
                  <strong>Total: ${order.totalAmount}</strong>
                </div>
                {/* Địa chỉ giao hàng (nếu có) */}
                {order.shippingAddress && (
                  <small className="c-gray d-block mt-2">
                    Ship to: {order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}
                  </small>
                )}
              </div>
            );
            })}
          </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;
