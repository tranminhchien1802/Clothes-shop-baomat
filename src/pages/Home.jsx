import MixedAutoSlider from "../components/MixedAutoSlider";
import SubscriptionForm from "../components/SubscriptionForm";
import Features from "../components/Features";
import LatestCollections from "../components/LatestCollections";
import { motion } from "framer-motion";
import BestSeller from "../components/BestSeller";



// Dummy Fixed Data:
// import productsData from "../components/FixedData";

// Component: Home (Trang chủ)
// Mô tả: Landing page chính của ứng dụng, hiển thị slider quảng cáo,
// bộ sưu tập mới nhất, sản phẩm bán chạy, các tính năng nổi bật và form đăng ký.
const Home = () => {
	
	// State loading, error, data — hiện đang bị comment vì dùng fixed data
	// const [loading, setLoading] = useState(true);
	// const [errorInFetch, setErrorInFetch] = useState(null);
	// const [data, setData] = useState([]);



	// useEffect: Gọi API để lấy dữ liệu sản phẩm khi component mount
	// useEffect(() => {
	// 	// fetch("https://ahmed-maher77.github.io/Forever__Modern-E-Commerce-Web-Application-with-ReactJS-and-Bootstrap/db.json/products")      // http://localhost:3000/products
	// 	// 	.then((res) => res.json())
	// 	// 	.then((json) => {
	// 	// 		console.log('from github server', json);
				
	// 	// 		setData(json);
	// 	// 		setLoading(false);
	// 	// 	})
	// 	// 	.catch((error) => {
	// 	// 		setErrorInFetch(error);
	// 	// 		setLoading(false);
	// 	// 	});
	// 	setData(productsData);
	// 	setLoading(false);
	// }, []);

	return (
		// motion.section: Bao bọc trang bằng hiệu ứng fade-in/out của framer-motion
		<motion.section
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="home-page text-center"
		>
			<div className="container">
				{/* MixedAutoSlider: Slider hiển thị banner quảng cáo hoặc hình ảnh nổi bật */}
				<MixedAutoSlider  />

				{/* LatestCollections: Hiển thị danh sách bộ sưu tập mới nhất */}
				<LatestCollections/>
				
				{/* BestSeller: Hiển thị các sản phẩm bán chạy nhất */}
				<BestSeller />
				
				{/* Features: Giới thiệu các tính năng nổi bật của shop (giao hàng, đổi trả, hỗ trợ) */}
				<Features />

				{/* SubscriptionForm: Form đăng ký nhận tin qua email */}
				<SubscriptionForm />
			</div>
		</motion.section>
	);
};

export default Home;
