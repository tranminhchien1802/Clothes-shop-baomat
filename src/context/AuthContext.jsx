import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, cartAPI } from '../api/api';
import { ShopContext } from './ShopContext';

// Tạo AuthContext để chia sẻ trạng thái người dùng cho toàn bộ ứng dụng
export const AuthContext = createContext();

// AuthContextProvider – component bọc (wrapper) cung cấp dữ liệu xác thực cho các component con
const AuthContextProvider = ({ children }) => {
  // State lưu thông tin user hiện tại (null nếu chưa đăng nhập)
  const [user, setUser] = useState(null);
  // State loading – true khi đang kiểm tra token/session
  const [loading, setLoading] = useState(true);

  // Khi component mount, kiểm tra token trong localStorage
  // Nếu có token thì gọi API /auth/me để lấy thông tin user
  // Nếu không có hoặc token hết hạn thì set user = null
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Gọi API lấy thông tin user từ token
      authAPI.getMe()
        .then(data => setUser(data.user))
        // Nếu lỗi (token không hợp lệ) thì xoá token khỏi localStorage
        .catch(() => localStorage.removeItem('token'))
        // Kết thúc loading dù thành công hay thất bại
        .finally(() => setLoading(false));
    } else {
      // Không có token – không cần kiểm tra, kết thúc loading ngay
      setLoading(false);
    }
  }, []);

  // Hàm đăng nhập: gọi API login, lưu token, set user state
  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  // Hàm đăng ký: gọi API register, lưu token, set user state
  const register = async (name, email, password) => {
    const data = await authAPI.register(name, email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  // Hàm đăng xuất: xoá token khỏi localStorage và set user về null
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    // Cung cấp user, loading và các hàm login/register/logout cho toàn bộ component con
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
