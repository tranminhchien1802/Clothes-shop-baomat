import { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import HeaderDashed from "../components/HeaderDashed";
import { AuthContext } from "../context/AuthContext";

// Trang đăng nhập – hiển thị form email/password, validation với Formik + Yup
const Login = () => {
  // State bật/tắt hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  // Lấy hàm login từ AuthContext
  const { login } = useContext(AuthContext);
  // Hook điều hướng – dùng để chuyển về trang chủ sau khi login thành công
  const navigate = useNavigate();

  // Schema validation với Yup: email và password là bắt buộc
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // Xử lý submit form: gọi API login, nếu thành công thì về trang chủ
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Gọi hàm login từ AuthContext (bên trong gọi API /auth/login)
      await login(values.email, values.password);
      navigate('/'); // Điều hướng về trang chủ
    } catch (error) {
      // Nếu lỗi từ server, hiển thị lỗi ở field email
      setFieldError('email', error.message);
    }
    setSubmitting(false);
  };

  return (
    // Hiệu ứng chuyển trang fade-in/fade-out với framer-motion
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="Login-Page text-center sec-padd"
    >
      <div className="container">
        {/* Tiêu đề "Log IN" */}
        <HeaderDashed head1="Log" head2="IN" />

        {/* Formik form với initialValues, validationSchema và onSubmit */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {/* isSubmitting: true khi form đang submit (disable nút) */}
          {({ isSubmitting }) => (
            <Form className="mt-5 d-flex flex-column gap-5 align-items-center border border-2 p-4">
              {/* Trường email */}
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="email" className="mb-2 fs-4">Email:</label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  name="email" type="text" id="email" placeholder="example@gmail.com"
                />
                {/* Hiển thị lỗi validation cho email */}
                <ErrorMessage name="email" component="div" className="text-danger mt-2" />
              </div>
              {/* Trường password */}
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="password" className="mb-2 fs-4 w-100 d-flex justify-content-between">
                  Password:{" "}
                  {/* Nút bật/tắt hiển thị mật khẩu */}
                  <span className={`cursor c-gray ${showPassword && "active"}`}
                    onClick={() => setShowPassword((prev) => !prev)}>show</span>
                </label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  // Chuyển type giữa "password" và "text" dựa trên state showPassword
                  name="password" type={`${showPassword ? "text" : "password"}`}
                  id="password" placeholder="Enter Your Password"
                />
                {/* Hiển thị lỗi validation cho password */}
                <ErrorMessage name="password" component="div" className="text-danger mt-2" />
              </div>
              {/* Nút submit – disabled khi đang submit */}
              <button className="btn bg-black py-2 px-4 rounded c-white fs-5" type="submit" disabled={isSubmitting}>
                Sign In
              </button>
              {/* Link điều hướng đến trang đăng ký */}
              <p className="mt-2">
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  );
};

export default Login;
