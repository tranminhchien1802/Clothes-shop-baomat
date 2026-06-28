import { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import HeaderDashed from "../components/HeaderDashed";
import { AuthContext } from "../context/AuthContext";

// Trang đăng ký – form nhập name, email, password, validation, gọi API register
const Register = () => {
  // State bật/tắt hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  // Lấy hàm register từ AuthContext
  const { register } = useContext(AuthContext);
  // Hook điều hướng – về trang chủ sau khi đăng ký thành công
  const navigate = useNavigate();

  // Schema validation: name bắt buộc, email phải đúng định dạng, password tối thiểu 6 ký tự
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  // Xử lý submit form: gọi API register, thành công thì về trang chủ
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Gọi hàm register từ AuthContext (bên trong gọi API /auth/register)
      await register(values.name, values.email, values.password);
      navigate('/'); // Điều hướng về trang chủ
    } catch (error) {
      // Hiển thị lỗi ở field email nếu server trả về lỗi
      setFieldError('email', error.message);
    }
    setSubmitting(false);
  };

  return (
    // Hiệu ứng chuyển trang với framer-motion
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="Login-Page text-center sec-padd"
    >
      <div className="container">
        {/* Tiêu đề "Sign UP" */}
        <HeaderDashed head1="Sign" head2="UP" />

        {/* Formik form – validation schema và submit handler */}
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-5 d-flex flex-column gap-4 align-items-center border border-2 p-4">
              {/* Trường nhập tên */}
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="name" className="mb-2 fs-4">Name:</label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  name="name" type="text" id="name" placeholder="Your Name"
                />
                <ErrorMessage name="name" component="div" className="text-danger mt-2" />
              </div>
              {/* Trường nhập email */}
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="email" className="mb-2 fs-4">Email:</label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  name="email" type="text" id="email" placeholder="example@gmail.com"
                />
                <ErrorMessage name="email" component="div" className="text-danger mt-2" />
              </div>
              {/* Trường nhập password với nút show/hide */}
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="password" className="mb-2 fs-4 w-100 d-flex justify-content-between">
                  Password:{" "}
                  {/* Nút bật/tắt hiển thị mật khẩu */}
                  <span className={`cursor c-gray ${showPassword && "active"}`}
                    onClick={() => setShowPassword((prev) => !prev)}>show</span>
                </label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  name="password" type={`${showPassword ? "text" : "password"}`}
                  id="password" placeholder="Enter Your Password"
                />
                <ErrorMessage name="password" component="div" className="text-danger mt-2" />
              </div>
              {/* Nút submit – disabled khi form đang submit */}
              <button className="btn bg-black py-2 px-4 rounded c-white fs-5" type="submit" disabled={isSubmitting}>
                Sign Up
              </button>
              {/* Link về trang đăng nhập */}
              <p className="mt-2">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  );
};

export default Register;
