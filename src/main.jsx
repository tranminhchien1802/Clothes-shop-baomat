import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext.jsx";
import AuthContextProvider from "./context/AuthContext.jsx";

// Điểm vào (entry point) của ứng dụng React
// createRoot gắn ứng dụng vào phần tử #root trong DOM
createRoot(document.getElementById("root")).render(
  // BrowserRouter: cung cấp khả năng định tuyến (routing) cho toàn bộ ứng dụng
  <BrowserRouter>
    {/* AuthContextProvider: cung cấp trạng thái xác thực (user, login, register, logout) cho toàn bộ app */}
    <AuthContextProvider>
      {/* ShopContextProvider: cung cấp trạng thái shop (giỏ hàng, tìm kiếm, sản phẩm) cho toàn bộ app */}
      <ShopContextProvider>
        {/* App: component gốc chứa Navbar, Routes và Footer */}
        <App />
      </ShopContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
);
