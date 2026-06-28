// Component CollectionCard – hiển thị một thẻ sản phẩm trong danh sách
// Nhận props: data (chứa _id, image, name, price) và classPadding (tuỳ chỉnh padding)
// Khi click vào thẻ, điều hướng đến trang chi tiết sản phẩm (/products/:id)

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";


const CollectionCard = ({data: { _id, image, name, price }, classPadding}) => {
	const navigate = useNavigate();   // Hook điều hướng đến trang chi tiết sản phẩm
	const {currency} = useContext(ShopContext) // Lấy ký tự tiền tệ từ context
	

	return (
		<div
			className={`collection-card trans-3 p-2 border-0 card box-shadow-gray cursor ${classPadding}`}
			onClick={() => navigate(`/products/${_id}`)}                  // Click vào thẻ => chuyển trang chi tiết
			data-aos={"fade-up"}
		>
			<figure className="overflow-hidden rounded">
				<img
					src={image[0]}    // Hiển thị ảnh đầu tiên trong mảng ảnh sản phẩm
					alt={name}
					className="card-img rounded mx-h-300 trans-3 img-scall"
				/>
			</figure>
			<article className="card-body text-start p-0">
				{/* Tên sản phẩm */}
				<h4 className="card-title fs-6 c-gray fw-normal">{name}</h4>
				{/* Giá sản phẩm kèm ký tự tiền tệ */}
				<div className="price fw-bold fs-small c-d-gray">{price}{currency}</div>
			</article>
		</div>
	);
};

export default CollectionCard;
