import { useContext } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeaderDashed from "../components/HeaderDashed";
import { ShopContext } from "../context/ShopContext";

// Trang giỏ hàng – hiển thị danh sách sản phẩm, cho phép thay đổi số lượng và xoá
// Sử dụng CartIterator (Iterator Pattern) để tính toán giỏ hàng
const ShoppingCart = () => {
  // Lấy các giá trị và hàm từ ShopContext
  const { cartItems, currency, delivery_fee, updateCartItem, removeFromCart, productsData, createCartIterator } = useContext(ShopContext);

  // Lấy ảnh sản phẩm từ productsData (fixed data) dựa trên productId
  const getProductImage = (productId) => {
    const product = productsData.find(p => p._id === productId);
    return product?.image[0] || '';
  };

  // Sử dụng CartIterator để tính subtotal và total quantity
  const cartIterator = createCartIterator();
  const subtotal = cartIterator.getTotal();
  const totalQuantity = cartIterator.getTotalQuantity();
  // Tổng cộng = subtotal + phí giao hàng
  const total = subtotal + delivery_fee;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="shopping-cart sec-padd">
      <div className="container">
        {/* Tiêu đề "Shopping Cart" */}
        <HeaderDashed head1="Shopping" head2="Cart" />

        {/* Nếu giỏ hàng rỗng – hiển thị thông báo và nút "Shop Now" */}
        {cartItems.length === 0 ? (
          <div className="text-center mt-5">
            <h3 className="c-gray">Your cart is empty</h3>
            <Link to="/collection" className="btn bg-black c-white mt-3 px-4 py-2">Shop Now</Link>
          </div>
        ) : (
          <div className="mt-5">
            {/* Dùng CartIterator.getTotalQuantity() hiển thị tổng số lượng */}
            <p className="c-gray mb-3 fs-small">
              <i className='bx bx-shopping-bag me-1'></i>
              {totalQuantity} {totalQuantity > 1 ? 'items' : 'item'} in your cart
            </p>
            {/* Header cột (chỉ hiện trên màn hình md trở lên) */}
            <div className="d-none d-md-grid" style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 0.5fr', gap: '1rem', fontWeight: 'bold' }}>
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>
            <hr />

            {/* Duyệt từng item trong giỏ hàng và render thành hàng */}
            {cartItems.map((item, index) => (
              <div key={index}>
                <div className="d-grid align-items-center" style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 0.5fr', gap: '1rem' }}>
                  {/* Cột sản phẩm: ảnh, tên, size */}
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.image || getProductImage(item.productId)}
                      alt={item.name}
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div>
                      <p className="mb-1 fw-bold">{item.name}</p>
                      <small className="c-gray">Size: {item.size}</small>
                    </div>
                  </div>
                  {/* Cột đơn giá */}
                  <span>{currency}{item.price}</span>
                  {/* Cột số lượng: nút -, hiển thị số, nút + */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-dark btn-sm"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateCartItem(item.productId, item.size, item.quantity - 1);
                        }
                      }}
                    >-</button>
                    <span>{item.quantity}</span>
                    <button
                      className="btn btn-outline-dark btn-sm"
                      onClick={() => updateCartItem(item.productId, item.size, item.quantity + 1)}
                    >+</button>
                  </div>
                  {/* Cột tổng tiền cho item đó */}
                  <span>{currency}{item.price * item.quantity}</span>
                  {/* Nút xoá sản phẩm khỏi giỏ */}
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeFromCart(item.productId, item.size)}
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
                <hr />
              </div>
            ))}

            {/* Phần tổng kết giỏ hàng: subtotal, phí ship, total */}
            <div className="d-flex flex-column align-items-end mt-4">
              <div className="border p-4" style={{ minWidth: '300px' }}>
                <h5 className="fw-bold mb-3">Cart Total</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{currency}{subtotal}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee</span>
                  <span>{currency}{delivery_fee}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>{currency}{total}</span>
                </div>
              </div>
              {/* Nút chuyển sang trang thanh toán */}
              <Link to="/place-order" className="btn bg-black c-white mt-3 px-4 py-2">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShoppingCart;
