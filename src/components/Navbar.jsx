// Component Navbar – thanh điều hướng chính của ứng dụng
// Hiển thị logo, menu (HOME, COLLECTION, ABOUT, CONTACT, ADMIN), icon tìm kiếm,
// icon user (dropdown đăng nhập/đăng xuất/thông tin), badge giỏ hàng và nút toggle menu mobile
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "bootstrap";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  // State bật/tắt menu mobile (sidebar)
  const [showMenu, setShowMenu] = useState(false);
  // State hiển thị border dưới navbar (chỉ ẩn ở trang home)
  const [showBorder, setShowBorder] = useState(true);
  // State hiển thị icon tìm kiếm (chỉ hiện ở trang /collection)
  const [showSearchIcon, setSearchIcon] = useState(false);
  // State bật/tắt dropdown menu của user
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Lấy hàm setActiveSearch (mở search bar) và cartCount (số lượng giỏ hàng) từ ShopContext
  const { setActiveSearch, cartCount } = useContext(ShopContext);
  // Lấy user và hàm logout từ AuthContext
  const { user, logout } = useContext(AuthContext);
  // Hook điều hướng
  const navigate = useNavigate();

  // Lấy path hiện tại từ URL
  const path = window.location.pathname;

  // Effect đóng dropdown user khi click ra ngoài vùng .user-dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Effect cập nhật border và icon search dựa trên path hiện tại
  useEffect(() => {
    setShowBorder(path !== "/");          // Ẩn border ở trang chủ
    setSearchIcon(path === "/collection"); // Chỉ hiện icon search ở /collection
  }, [path]);

  // Effect khởi tạo Bootstrap Tooltip cho các phần tử có data-bs-toggle="tooltip"
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
    );
    return () => {
      // Cleanup: huỷ tooltip khi component unmount
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, []);

  // Xử lý logout: gọi hàm logout từ context, điều hướng về trang chủ
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="py-3">
      <div className={`container position-relative d-flex justify-content-between align-items-center flex-column ${showBorder ? "showLine" : ""}`}>
        <main className="col-12 d-flex justify-content-between align-items-center">
          {/* Logo – link về trang chủ */}
          <Link to="/" className="logo text-decoration-none text-dark">
            <h3 className="fs-5 mb-0">
              Algohary <span className="fw-medium c-pink">Shop</span>
            </h3>
          </Link>

          {/* Menu mobile (sidebar) – hiển thị khi showMenu = true */}
          <ul className={`position-fixed p-0 top-0 end-0 z-1 d-flex flex-column ${showMenu ? "show" : ""}`}>
            {/* Nút Back để đóng menu */}
            <li onClick={() => setShowMenu((prev) => !prev)}
              className="backMenu p-1 py-2 d-flex fs-5 fw-bold c-light-gray align-items-center border-bottom cursor">
              <i className="bx bx-chevron-left fs-big c-light-gray"></i> Back
            </li>
            {/* Các link điều hướng */}
            <li>
              <NavLink onClick={() => setShowMenu((prev) => !prev)}
                className="text-decoration-none c-gray fw-bold p-4 py-2 d-block border-bottom" to="/">HOME</NavLink>
            </li>
            <li>
              <NavLink onClick={() => setShowMenu((prev) => !prev)}
                className="text-decoration-none c-gray fw-bold p-4 py-2 d-block border-bottom" to="/collection">COLLECTION</NavLink>
            </li>
            <li>
              <NavLink onClick={() => setShowMenu((prev) => !prev)}
                className="text-decoration-none c-gray fw-bold p-4 py-2 d-block border-bottom" to="/about">ABOUT</NavLink>
            </li>
            <li>
              <NavLink onClick={() => setShowMenu((prev) => !prev)}
                className="text-decoration-none c-gray fw-bold p-4 py-2 d-block border-bottom" to="/contact">CONTACT</NavLink>
            </li>
            {/* Chỉ hiển thị link ADMIN nếu user có role admin */}
            {user?.role === 'admin' && (
              <li>
                <NavLink onClick={() => setShowMenu((prev) => !prev)}
                  className="text-decoration-none c-gray fw-bold p-4 py-2 d-block border-bottom" to="/admin-panel">ADMIN</NavLink>
              </li>
            )}
          </ul>

          {/* Nhóm icon bên phải: search, user, giỏ hàng, toggle menu */}
          <div className="right d-flex align-items-center gap-1 gap-sm-3">
            <div className="icons d-flex gap-1 gap-sm-3">
              {/* Icon tìm kiếm – chỉ hiển thị ở trang /collection */}
              {showSearchIcon && (
                <i className="bx bx-search-alt-2 fs-little-big c-gray cursor"
                  onClick={() => setActiveSearch(true)}></i>
              )}
              {/* Icon user – nếu đã đăng nhập thì hiển thị dropdown, nếu chưa thì link login */}
              {user ? (
                <div className="position-relative user-dropdown">
                  {/* Nút mở dropdown user */}
                  <button className="bg-transparent border-0"
                    onClick={() => setShowUserMenu(prev => !prev)}>
                    <i className="bx bx-user fs-little-big c-gray cursor"></i>
                  </button>
                  {/* Dropdown user: tên, My Orders, Admin Panel (nếu là admin), Logout */}
                  {showUserMenu && (
                    <ul className="position-absolute end-0 mt-2 bg-white border shadow-sm p-0 list-unstyled"
                      style={{ minWidth: '160px', zIndex: 1050, borderRadius: '4px' }}>
                      <li className="px-3 py-2 c-gray fw-bold border-bottom">{user.name}</li>
                      <li><Link className="d-block px-3 py-2 text-decoration-none c-gray" to="/orders"
                        onClick={() => setShowUserMenu(false)}>My Orders</Link></li>
                      {user.role === 'admin' && (
                        <li><Link className="d-block px-3 py-2 text-decoration-none c-gray" to="/admin-panel"
                          onClick={() => setShowUserMenu(false)}>Admin Panel</Link></li>
                      )}
                      <li><hr className="my-1" /></li>
                      <li><button className="d-block w-100 px-3 py-2 text-start border-0 bg-transparent c-gray"
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}>Logout</button></li>
                    </ul>
                  )}
                </div>
              ) : (
                // Nút login (chưa đăng nhập) – có tooltip
                <NavLink className="login-link text-deoration-none" to="/login"
                  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Login">
                  <i className="bx bx-user fs-little-big c-gray cursor"></i>
                </NavLink>
              )}
              {/* Icon giỏ hàng với badge hiển thị số lượng */}
              <Link to="/cart" className="bg-transparent border-0 position-relative text-decoration-none">
                <i className="bx bx-shopping-bag fs-little-big c-gray cursor"></i>
                {/* Badge – chỉ hiển thị khi cartCount > 0 */}
                {cartCount > 0 && (
                  <span className="bg-black d-block rounded-circle cart-icon c-white">{cartCount}</span>
                )}
              </Link>
            </div>
            {/* Nút hamburger mở/đóng menu mobile */}
            <button onClick={() => setShowMenu((prev) => !prev)}
              className="px-0 toggleBtn bg-transparent border-0" role="button">
              <i className="bx bx-menu-alt-right fs-big c-gray"></i>
            </button>
          </div>
        </main>
      </div>
    </nav>
  );
};

export default Navbar;
