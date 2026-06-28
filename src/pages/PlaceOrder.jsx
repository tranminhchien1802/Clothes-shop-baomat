import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeaderDashed from "../components/HeaderDashed";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/AuthContext";
import { ordersAPI } from "../api/api";

// Trang đặt hàng (checkout) – nhập thông tin giao hàng, chọn phương thức thanh toán, xác nhận đơn
const PlaceOrder = () => {
  // Lấy giỏ hàng, tiền tệ, phí giao hàng và hàm clearCart từ ShopContext
  const { cartItems, currency, delivery_fee, clearCart } = useContext(ShopContext);
  // Lấy thông tin user hiện tại từ AuthContext để điền sẵn họ tên
  const { user } = useContext(AuthContext);
  // Hook điều hướng – chuyển đến trang đơn hàng sau khi đặt thành công
  const navigate = useNavigate();

  // State lưu thông tin địa chỉ giao hàng (khởi tạo với tên user nếu có)
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  // State lưu phương thức thanh toán (mặc định là COD – Cash on Delivery)
  const [paymentMethod, setPaymentMethod] = useState('COD');
  // State loading khi đang xử lý đặt hàng
  const [placing, setPlacing] = useState(false);

  // Tính tạm tính và tổng cộng từ giỏ hàng
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + delivery_fee;

  // Hàm xử lý khi người dùng nhập vào các input địa chỉ
  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Hàm xử lý đặt hàng (Place Order) – gọi API tạo đơn, clear giỏ, điều hướng
  const handlePlaceOrder = async () => {
    // Kiểm tra các trường bắt buộc: fullName, phone, street, city
    if (!address.fullName || !address.phone || !address.street || !address.city) {
      alert('Please fill in all required fields');
      return;
    }

    setPlacing(true);
    try {
      // Gọi API tạo đơn hàng với items, tổng tiền, địa chỉ và phương thức thanh toán
      const data = await ordersAPI.create({
        items: cartItems,
        totalAmount: total,
        shippingAddress: address,
        paymentMethod,
      });
      // Xoá giỏ hàng sau khi đặt thành công
      await clearCart();
      // Điều hướng đến trang "My Orders" để xem đơn vừa tạo
      navigate('/orders');
    } catch (error) {
      alert(error.message);
    }
    setPlacing(false);
  };

  // Nếu giỏ hàng rỗng – hiển thị thông báo
  if (cartItems.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sec-padd text-center">
        <div className="container">
          <HeaderDashed head1="Place" head2="Order" />
          <h3 className="c-gray mt-5">Your cart is empty</h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sec-padd">
      <div className="container">
        <HeaderDashed head1="Place" head2="Order" />

        <div className="row mt-5">
          {/* Cột bên trái: form thông tin giao hàng và phương thức thanh toán */}
          <div className="col-lg-7">
            {/* Thông tin giao hàng */}
            <h4 className="fw-bold mb-4">Shipping Information</h4>
            <div className="row g-3">
              <div className="col-sm-6">
                <input type="text" name="fullName" className="form-control" placeholder="Full Name"
                  value={address.fullName} onChange={handleChange} required />
              </div>
              <div className="col-sm-6">
                <input type="tel" name="phone" className="form-control" placeholder="Phone Number"
                  value={address.phone} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <input type="text" name="street" className="form-control" placeholder="Street Address"
                  value={address.street} onChange={handleChange} required />
              </div>
              <div className="col-sm-4">
                <input type="text" name="city" className="form-control" placeholder="City"
                  value={address.city} onChange={handleChange} required />
              </div>
              <div className="col-sm-4">
                <input type="text" name="state" className="form-control" placeholder="State"
                  value={address.state} onChange={handleChange} />
              </div>
              <div className="col-sm-4">
                <input type="text" name="zip" className="form-control" placeholder="Zip Code"
                  value={address.zip} onChange={handleChange} />
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <h4 className="fw-bold mt-5 mb-3">Payment Method</h4>
            <div className="form-check mb-2">
              <input className="form-check-input" type="radio" name="payment" id="cod"
                checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
              <label className="form-check-label" htmlFor="cod">Cash on Delivery</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="radio" name="payment" id="bank"
                checked={paymentMethod === 'Bank'} onChange={() => setPaymentMethod('Bank')} />
              <label className="form-check-label" htmlFor="bank">Bank Transfer</label>
            </div>
          </div>

          {/* Cột bên phải: tóm tắt đơn hàng và nút Place Order */}
          <div className="col-lg-5 mt-4 mt-lg-0">
            <div className="border p-4">
              <h5 className="fw-bold mb-3">Order Summary</h5>
              {/* Danh sách sản phẩm kèm số lượng và tổng */}
              {cartItems.map((item, i) => (
                <div key={i} className="d-flex justify-content-between mb-2">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>{currency}{item.price * item.quantity}</span>
                </div>
              ))}
              <hr />
              {/* Subtal và phí giao hàng */}
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span><span>{currency}{subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee</span><span>{currency}{delivery_fee}</span>
              </div>
              <hr />
              {/* Tổng cộng */}
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span><span>{currency}{total}</span>
              </div>
              {/* Nút Place Order – disabled khi đang xử lý */}
              <button className="btn bg-black c-white w-100 mt-4 py-2"
                onClick={handlePlaceOrder} disabled={placing}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaceOrder;
