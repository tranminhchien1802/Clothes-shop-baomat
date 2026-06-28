// Component LatestCollections – hiển thị 10 sản phẩm mới nhất dựa trên trường date
// Sử dụng Iterator Pattern (orderBy + first) thay vì sort thủ công

import HeaderDashed from "./HeaderDashed";
import CollectionCard from "./CollectionCard";
import { ShopContext } from "../context/ShopContext";
import { memo, useContext } from "react";

const LatestCollections = () => {
	const { createProductIterator } = useContext(ShopContext);

	// Dùng Iterator: sắp xếp giảm dần theo date, lấy 10 sản phẩm đầu
	const latest = createProductIterator()
		.orderBy((a, b) => b.date - a.date)
		.collect()
		.slice(0, 10);

	return (
		<section className="latest-collections mt-6">
			<HeaderDashed
				head1="LATEST"
				head2="COLLECTIONS"
				paragraph="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the."
			/>
			<main className="d-flex row-gap-3 flex-wrap mt-5">
				{latest.map((product) => (
					<CollectionCard key={product._id} data={product} />
				))}
			</main>
		</section>
	);
};

export default memo(LatestCollections);
