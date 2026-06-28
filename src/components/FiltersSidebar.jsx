// Component FiltersSidebar – thanh bên chứa bộ lọc danh mục (category) và loại (type)
// Nhận props: filterByData – hàm callback được gọi khi bộ lọc thay đổi
// Kết hợp với context search để lọc sản phẩm

import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const  FiltersSidebar = ({ filterByData }) => {
	// State hiển thị/ẩn bộ lọc category (dành cho màn hình nhỏ)
	const [showCategory, setShowCategory] = useState(false);       
	// State mảng chứa các category đang được chọn (Men, Women, Kids)
	const [activeCategories, setActiveCategories] = useState([]);
	// State mảng chứa các type đang được chọn (Topwear, Bottomwear, Winterwear)
	const [activeTypes, setActiveTypes] = useState([]);
	const {search} = useContext(ShopContext) // Lấy giá trị tìm kiếm từ context

	// Mỗi khi activeCategories, activeTypes hoặc search thay đổi => gọi filterByData
	useEffect(() => {
		filterByData({categories: activeCategories, types: activeTypes});
	}, [activeCategories, activeTypes, search])

	// Thêm/xoá category khỏi danh sách active khi checkbox được click
	const manageActiveCategories = (e) => {
		const value = e.target.value;
		setActiveCategories(prev => prev.includes(value)? prev.filter(el => el !== value) : [...prev, value]);
	}

	// Thêm/xoá type khỏi danh sách active khi checkbox được click
	const manageActiveTypes = (e) => {
		const value = e.target.value;
		setActiveTypes(prev => prev.includes(value)? prev.filter(el => el !== value) : [...prev, value]);
	}

	return (
		<aside className="filters-sidebar col-12 col-md-4 col-lg-3 col-xxl-2">
			{/* Nút toggle bộ lọc (chỉ hiển thị trên màn hình nhỏ) */}
			<h3
				className="small-screen fw-normal fs-4 d-flex align-items-center gap-2 fit-content p-2 trans-3 rounded"
				role="button"
				aria-expanded={showCategory}
				onClick={() => setShowCategory((prev) => !prev)}
			>
				FILTERS
				<i
					className={`fs-2 mt-1 c-gray bx bxs-chevron-right ${
						showCategory && "active"
					}`}
				></i>
			</h3>

			{/* Nhãn FILTERS (chỉ hiển thị trên màn hình lớn) */}
			<h3 className="large-screen fw-normal fs-4 d-none mt-2">FILTERS</h3>
			
			{/* Bộ lọc theo danh mục: Men / Women / Kids */}
			<div
				className={`category border rounded p-3 mt-405 ${
					showCategory ? "d-block" : "d-none"
				}`}
			>
				<h4 className="fs-6 mb-205">CATEGORIES</h4>
				<ul className="list-unstyled mb-0">
					<li>
						<input type="checkbox" name="category" id="men" value="Men" onClick={manageActiveCategories} aria-label="Men category" />
						<label className="ps-2 mt-1 fw-light" htmlFor="men">
							Men
						</label>
					</li>
					<li>
						<input type="checkbox" name="category" id="women" value="Women" onClick={manageActiveCategories} aria-label="Women category" />
						<label className="ps-2 mt-1 fw-light" htmlFor="women">
							Women
						</label>
					</li>
					<li>
						<input type="checkbox" name="category" id="kids" value="Kids" onClick={manageActiveCategories} aria-label="Kids category" />
						<label className="ps-2 mt-1 fw-light" htmlFor="kids">
							Kids
						</label>
					</li>
				</ul>
			</div>

			{/* Bộ lọc theo loại: Topwear / Bottomwear / Winterwear */}
			<div
				className={`type border rounded p-3 mt-4 ${
					showCategory ? "d-block" : "d-none"
				}`}
			>
				<h4 className="fs-6 mb-205">TYPE</h4>
				<ul className="list-unstyled mb-0">
					<li>
						<input type="checkbox" name="type" id="topwear" value="Topwear" onClick={manageActiveTypes} aria-label="Topwear type" />
						<label className="ps-2 mt-1 fw-light" htmlFor="topwear">
							Topwear
						</label>
					</li>
					<li>
						<input type="checkbox" name="type" id="bottomwear" value="Bottomwear" onClick={manageActiveTypes} aria-label="Bottomwear type" />
						<label className="ps-2 mt-1 fw-light" htmlFor="bottomwear">
							Bottomwear
						</label>
					</li>
					<li>
						<input type="checkbox" name="type" id="winterwear" value="Winterwear" onClick={manageActiveTypes} aria-label="Winterwear type" />
						<label className="ps-2 mt-1 fw-light" htmlFor="winterwear">
							Winterwear
						</label>
					</li>
				</ul>
			</div>
		</aside>
	);
};

export default FiltersSidebar;
