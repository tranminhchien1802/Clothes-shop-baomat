import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "boxicons/css/boxicons.min.css";
import "./App.css";

// Import các trang (pages) của ứng dụng
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";

import { useContext, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchBar from "./components/SearchBar";
import { ShopContext } from "./context/ShopContext";

// Component App – gốc của ứng dụng, chứa Navbar, SearchBar, Routes (các trang), Footer
function App() {
  // Lấy location hiện tại để đồng bộ key cho AnimatePresence và scroll to top
  const location = useLocation();
  const { pathname } = location;
  // Lấy state activeSearch từ ShopContext – điều khiển hiển thị SearchBar overlay
  const {activeSearch} = useContext(ShopContext);

  // Mỗi khi đường dẫn (pathname) thay đổi, tự động cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="App">
      {/* Thanh điều hướng – hiển thị trên mọi trang */}
      <Navbar />
      {/* Overlay tìm kiếm – chỉ hiển thị khi activeSearch = true */}
      {activeSearch && <SearchBar />}

      {/* AnimatePresence: hiệu ứng chuyển trang khi route thay đổi */}
      <AnimatePresence>
        {/* Routes với key = pathname để AnimatePresence nhận biết sự thay đổi */}
        <Routes location={location} key={location.pathname}>
          {/* Trang chủ */}
          <Route path="/" element={<Home />} />
          {/* Trang danh sách sản phẩm */}
          <Route path="/collection" element={<Collection />} />
          {/* Trang giới thiệu */}
          <Route path="/about" element={<About />} />
          {/* Trang liên hệ */}
          <Route path="/contact" element={<Contact />} />
          {/* Trang quản trị admin */}
          <Route path="/admin-panel" element={<AdminPanel />} />
          {/* Trang đăng nhập */}
          <Route path="/login" element={<Login />} />
          {/* Trang đăng ký */}
          <Route path="/register" element={<Register />} />
          {/* Trang giỏ hàng */}
          <Route path="/cart" element={<ShoppingCart />} />
          {/* Trang chi tiết sản phẩm – nhận productId từ URL params */}
          <Route path="/products/:productId" element={<ProductDetails />} />
          {/* Trang đặt hàng (checkout) */}
          <Route path="/place-order" element={<PlaceOrder />} />
          {/* Trang danh sách đơn hàng của user */}
          <Route path="/orders" element={<Orders />} />
          {/* Fallback – trang 404 cho tất cả đường dẫn không xác định */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {/* Footer – hiển thị trên mọi trang */}
      <Footer />
    </div>
  );
}

export default App;
