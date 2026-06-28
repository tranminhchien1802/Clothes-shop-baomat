import { motion } from "framer-motion";
import mainImg from "../assets/contact_img.webp";
import DescribedImage from "../components/DescribedImage";
import SubscriptionForm from "../components/SubscriptionForm";
import HeaderDashed from "../components/HeaderDashed";

// Component: Contact (Trang liên hệ)
// Mô tả: Hiển thị thông tin cửa hàng (địa chỉ, điện thoại, email),
// thông tin tuyển dụng và form đăng ký nhận tin.
const Contact = () => {
  return (
    // motion.div: Bao bọc trang với hiệu ứng chuyển cảnh fade-in/out
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="contact-page text-center py-3 pt-5"
    >
      <div className="container">
        {/* HeaderDashed: Tiêu đề "CONTACT US" có gạch ngang trang trí */}
        <HeaderDashed head1="CONTACT" head2="US" classStyle="fw-normal fs-3" />

        {/* DescribedImage: Hình ảnh đại diện (bàn làm việc) kèm thông tin bên cạnh */}
        <DescribedImage
          img={mainImg}
          imgTitle="desk image"
          styleInLarge="justify-content-center column-gap-xl-4"
          styleImg="col-xl-5"
          styleText="col-xl-5"
          sideText={
            <>
              {/* Our Store: Thông tin cửa hàng — địa chỉ, điện thoại, email */}
              <div className="our-store">
                <h3 className="c-d-gray">Our Store</h3>
                <address className="my-4">
                  <span>University of Science</span>
                  <br />
                  <span>Ho Chi Minh City, Viet Nam</span>
                </address>
                <div className="telephone">
                  Tel: 0786160270
                  <br />
                  Email: chien180203
                </div>
              </div>
              {/* Careers: Thông tin tuyển dụng tại Algohary Shop */}
              <div className="careers mt-5">
                <h4 className="c-d-gray">Careers at Algohary Shop</h4>
                <span className="d-block my-4">
                  Learn more about our teams and job openings.
                </span>
                <button className="btn py-3 px-4 border-out-d-gray rounded-0">
                  Explore Jobs
                </button>
              </div>
            </>
          }
        />

        {/* SubscriptionForm: Form đăng ký nhận tin khuyến mãi qua email */}
        <SubscriptionForm />
      </div>
    </motion.div>
  );
};

export default Contact;
