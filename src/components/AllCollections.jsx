// Component AllCollections – hiển thị tất cả sản phẩm kèm chức năng sắp xếp theo giá
// Sử dụng Iterator Pattern (orderBy) để sắp xếp thay vì sort thủ công

import { useEffect, useState } from "react";
import CollectionCard from "./CollectionCard";
import FetchWaitingMsg from "./FetchWaitingMsg";
import HeaderDashed from "./HeaderDashed";
import { ProductIterator } from "../patterns";

const AllCollections = ({ data }) => {
	// State chứa dữ liệu đã được sắp xếp
	const [sortedData, setSortedData] = useState([]);
	// State lưu tiêu chí sắp xếp hiện tại ('low-high', 'high-low', 'default')
	const [sortBy, setSortBy] = useState(null);

	// Hàm sắp xếp dữ liệu sử dụng Iterator Pattern
	const sortData = (price) => {
		setSortBy(price);
		const iterator = new ProductIterator(data);

		if (price === 'low-high') {
			iterator.orderBy((a, b) => a.price - b.price);
		} else if (price === 'high-low') {
			iterator.orderBy((a, b) => b.price - a.price);
		}
		// 'default' – không gọi orderBy, giữ nguyên thứ tự gốc

		setSortedData(iterator.collect());
	}

	// Effect: mỗi khi data thay đổi, cập nhật sortedData và áp dụng lại bộ lọc nếu có
    useEffect(() => {
        if (sortBy) {
			sortData(sortBy);
		} else {
			setSortedData(data);
		}
    }, [data]);

	return (
		<section id="all-collections">
			<header className="d-flex justify-content-between align-items-center">
				<HeaderDashed head1="ALL" head2="COLLECTIONS" />
				
				<select
					className="text-center border-2 border-l-gray outline-0 py-2 fs-small cursor"
					onChange={(e) => sortData(e.target.value)}
				>
					<option value="default">Sort by: Relevant</option>
					<option value="low-high">Sort by: Low to High</option>
					<option value="high-low">Sort by: High to Low</option>
				</select>
			</header>

			<section className="mt-3">
				<div className="row row-gap-4">
					{!sortedData.length ? (
						<FetchWaitingMsg />
					)                 
					: (
						sortedData.map((product, i) => (
							<div className="col-6 col-lg-4 col-xl-3" key={i}>
								<CollectionCard data={product} />
							</div>
						))
					)}
				</div>
			</section>
		</section>
	);
};

export default AllCollections;
