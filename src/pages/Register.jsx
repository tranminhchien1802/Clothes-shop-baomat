import { useContext, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import HeaderDashed from "../components/HeaderDashed";
import Captcha from "../components/Captcha";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const captchaRef = useRef({});

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await register(values.name, values.email, values.password, captchaRef.current.captcha_id, captchaRef.current.captcha_answer);
      navigate('/');
    } catch (error) {
      setFieldError('email', error.message);
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="Login-Page text-center sec-padd"
    >
      <div className="container">
        <HeaderDashed head1="Sign" head2="UP" />

        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-5 d-flex flex-column gap-4 align-items-center border border-2 p-4">
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="name" className="mb-2 fs-4">Name:</label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  name="name" type="text" id="name" placeholder="Your Name"
                />
                <ErrorMessage name="name" component="div" className="text-danger mt-2" />
              </div>
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="email" className="mb-2 fs-4">Email:</label>
                <Field
                  className="p-3 py-203 outline-0 w-100 border-gray border-05"
                  name="email" type="text" id="email" placeholder="example@gmail.com"
                />
                <ErrorMessage name="email" component="div" className="text-danger mt-2" />
              </div>
              <div className="d-flex flex-column align-items-start w-100">
                <label htmlFor="password" className="mb-2 fs-4 w-100 d-flex justify-content-between">
                  Password:{" "}
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

              <Captcha onCaptchaChange={(c) => { captchaRef.current = c; }} />

              <button className="btn bg-black py-2 px-4 rounded c-white fs-5" type="submit" disabled={isSubmitting}>
                Sign Up
              </button>
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
