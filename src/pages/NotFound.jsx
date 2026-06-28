import { motion } from "framer-motion";

// Component: NotFound (Trang 404)
// Mô tả: Hiển thị khi người dùng truy cập đường dẫn không tồn tại.
// Gồm thông báo lỗi và biểu tượng cảm xúc.
const NotFound = () => {
	return (
		// motion.div: Bao bọc trang với hiệu ứng fade-in/out khi chuyển cảnh
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="notfound-page d-flex justify-content-center align-items-center"
			style={{ height: "100vh" }}
		>
			{/* Tiêu đề thông báo lỗi: "OOPs 😥😥! This Page is not found" */}
			<h1 className="text-center mb-0 lh-base">
				OOPs 😥😥! <br /> This Page is not found
			</h1>
		</motion.div>
	);
};

export default NotFound;
