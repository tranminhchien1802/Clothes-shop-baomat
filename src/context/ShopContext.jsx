import { createContext, useState, useEffect, useContext } from "react";
// Import dữ liệu sản phẩm mẫu (fixed data) – fallback khi không fetch từ API
import productsData from "../components/FixedData";
// Import API giỏ hàng để đồng bộ giỏ hàng với backend
import { cartAPI } from "../api/api";
// Import AuthContext để lấy thông tin user hiện tại
import { AuthContext } from "./AuthContext";
// Import Model classes (OOP)
import { Product, CartItem } from "../models";
import { ProductAdapter, ProductIterator, CartIterator } from "../patterns";

// Tạo ShopContext để chia sẻ dữ liệu shop (giỏ hàng, tìm kiếm, sản phẩm)
export const ShopContext = createContext();

// ShopContextProvider – component bọc cung cấp toàn bộ state liên quan đến shop
const ShopContextProvider = (props) => {
  // Đơn vị tiền tệ hiển thị trên toàn ứng dụng
  const currency = "$";
  // Phí giao hàng cố định
  const delivery_fee = 10;
  // State bật/tắt thanh tìm kiếm (SearchBar)
  const [activeSearch, setActiveSearch] = useState(false);
  // State lưu từ khoá tìm kiếm hiện tại
  const [search, setSearch] = useState('');
  // State lưu danh sách sản phẩm trong giỏ hàng (array các item)
  const [cartItems, setCartItems] = useState([]);
  // State lưu tổng số lượng sản phẩm trong giỏ (dùng cho badge trên navbar)
  const [cartCount, setCartCount] = useState(0);
  // Lấy user từ AuthContext để kiểm tra trạng thái đăng nhập
  const { user } = useContext(AuthContext);

  // Khi user thay đổi (đăng nhập/đăng xuất), fetch lại giỏ hàng từ backend
  // Nếu user null (chưa đăng nhập) thì xoá giỏ hàng local
  useEffect(() => {
    if (user) {
      // User đã đăng nhập – gọi API lấy giỏ hàng từ server
      cartAPI.get()
        .then(data => {
          setCartItems(data.cart);
          // Tính tổng số lượng sản phẩm (cộng dồn quantity của từng item)
          setCartCount(data.cart.reduce((sum, item) => sum + item.quantity, 0));
        })
        .catch(() => {});
    } else {
      // Chưa đăng nhập – giỏ hàng rỗng
      setCartItems([]);
      setCartCount(0);
    }
  }, [user]);

  // Thêm sản phẩm vào giỏ hàng (kiểm tra đăng nhập trước)
  const addToCart = async (product, size, quantity = 1) => {
    // Nếu chưa đăng nhập, thông báo và không thêm
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      // Gọi API thêm item vào giỏ (gửi productId, name, price, image, size, quantity)
      const data = await cartAPI.add({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image[0] || '',
        size,
        quantity
      });
      // Cập nhật state giỏ hàng và tổng số lượng từ response
      setCartItems(data.cart);
      setCartCount(data.cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      alert(error.message);
    }
  };

  // Cập nhật số lượng một sản phẩm trong giỏ hàng
  const updateCartItem = async (productId, size, quantity) => {
    try {
      // Gọi API PUT /cart với productId, size, quantity mới
      const data = await cartAPI.update(productId, size, quantity);
      // Cập nhật lại state từ response
      setCartItems(data.cart);
      setCartCount(data.cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      alert(error.message);
    }
  };

  // Xoá một sản phẩm khỏi giỏ hàng (theo productId và size)
  const removeFromCart = async (productId, size) => {
    try {
      // Gọi API DELETE /cart với productId và size
      const data = await cartAPI.remove(productId, size);
      // Cập nhật lại state từ response
      setCartItems(data.cart);
      setCartCount(data.cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      alert(error.message);
    }
  };

  // Xoá toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      // Gọi API DELETE /cart/clear
      const data = await cartAPI.clear();
      // Cập nhật state: giỏ hàng rỗng, tổng số lượng = 0
      setCartItems(data.cart);
      setCartCount(0);
    } catch (error) {
      alert(error.message);
    }
  };

  // Dữ liệu đã chuẩn hoá qua Adapter Pattern
  const normalizedProducts = ProductAdapter.adaptAll(productsData);

  // Sản phẩm dưới dạng Product model (OOP)
  const productModels = productsData.map(p => new Product(p));

  // Factory: tạo ProductIterator từ danh sách gốc
  const createProductIterator = () => new ProductIterator(productsData);

  // Factory: tạo CartIterator từ danh sách cart items hiện tại
  const createCartIterator = () => new CartIterator(cartItems);

  // Chuyển cart items thành CartItem model instances
  const cartItemModels = cartItems.map(item => new CartItem(item));

  // Tổng hợp các giá trị và hàm sẽ được cung cấp qua context
  const value = {
    productsData, normalizedProducts, productModels,
    createProductIterator, createCartIterator,
    cartItems, cartItemModels, cartCount,
    currency, delivery_fee,
    search, setSearch, activeSearch, setActiveSearch,
    addToCart, updateCartItem, removeFromCart, clearCart
  };

  return (
    // Cung cấp toàn bộ state và hàm cho component con
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
