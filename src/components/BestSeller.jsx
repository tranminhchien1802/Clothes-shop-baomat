// Component BestSeller – hiển thị sản phẩm bán chạy nhất (bestseller = true)
// Sử dụng Iterator Pattern (where + first/last) để lọc bestseller

import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import HeaderDashed from "./HeaderDashed";
import CollectionCard from "./CollectionCard";

const BestSeller = () => {
	// Lấy danh sách tất cả sản phẩm từ context
	const { createProductIterator } = useContext(ShopContext);
	// State chứa danh sách sản phẩm bestseller
	const [bestSeller, setBestSeller] = useState([]);

	// Effect sử dụng Iterator Pattern để lọc bestseller
	useEffect(() => {
		const iterator = createProductIterator();
		iterator.where(product => product.bestseller === true);
		setBestSeller(iterator.collect().slice(0, 5));
	}, [createProductIterator]);

	return (
		<div className="best-seller py-5">
			<HeaderDashed
				head1="BEST"
				head2="SELLERS"
				paragraph="Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio"
			/>
			<section>
                <div className="row justify-content-center">
				{bestSeller.map((product) => (
                    <div key={product._id} className="col-6 col-md-4 col-lg-3 col-xl mt-3" style={{maxWidth: '350px'}}>
                        <CollectionCard data={product} classPadding="px-0" />
                    </div>
				))}
                </div>
			</section>
		</div>
	);
};

export default BestSeller;
