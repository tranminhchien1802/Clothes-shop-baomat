import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import FiltersSidebar from "../components/FiltersSidebar";
import AllCollections from "../components/AllCollections";
import { ShopContext } from "../context/ShopContext";

// Component: Collection (Trang danh mục sản phẩm)
// Sử dụng Iterator Pattern để lọc sản phẩm thay vì filter thủ công
const Collection = () => {
	// productsData: toàn bộ sản phẩm từ context
	// search: từ khoá tìm kiếm từ context (dùng chung với header)
	// createProductIterator: factory tạo iterator để duyệt/lọc sản phẩm
	const {productsData, search, createProductIterator} = useContext(ShopContext)

	// State filteredData: dữ liệu đã được lọc dựa trên lựa chọn của người dùng
	const [filteredData, setFilteredData] = useState([]);

	// Hàm filterByData: Sử dụng Iterator Pattern để lọc sản phẩm
	const filterByData = ({categories, types}) => {
		// Tạo iterator từ danh sách sản phẩm gốc
		const iterator = createProductIterator();

		// Thêm bộ lọc tìm kiếm nếu có
		if (search !== '') {
			iterator.where(el => el.name.toLowerCase().includes(search.toLowerCase()));
		}

		// Thêm bộ lọc danh mục nếu có
		if (categories.length) {
			iterator.where(el => categories.includes(el.category));
		}

		// Thêm bộ lọc loại sản phẩm nếu có
		if (types.length) {
			iterator.where(el => types.includes(el.subCategory));
		}

		// Dùng collect() để lấy kết quả sau tất cả bộ lọc
		const result = iterator.collect();
		setFilteredData(result);
	}

	// useEffect: (Đã bị comment) Dùng để fetch dữ liệu từ API khi component mount
	useEffect(() => {}, []);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="collection-page py-3 pt-405"
		>
			<div className="container">
				<div className="row row-gap-4">
					<FiltersSidebar filterByData={filterByData} />

					<div className="col-12 col-md-8 col-lg-9 col-xxl-10 position-relative">
					{
						filteredData.length?
						<AllCollections data={filteredData} />
						:
						<p className="nomatch-msg position-absolute top-50 start-50 fs-3 text-center">There are no data match your choice 🙄</p>
					}
						
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default Collection;
