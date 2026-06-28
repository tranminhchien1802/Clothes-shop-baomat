// Component SingleFeature – hiển thị một tính năng đơn lẻ
// Props:
//   img – đường dẫn ảnh minh hoạ
//   classLayout – class tuỳ chỉnh layout (cột)
//   head – tiêu đề tính năng
//   text – mô tả tính năng

const SingleFeature = ({ img, classLayout, head, text }) => {
	return (
		<article
			className={`d-flex flex-column gap-2 align-items-center ${classLayout}`}
			data-aos="fade-up"
     data-aos-anchor-placement="center-center"
		>
			{/* Ảnh đại diện tính năng */}
			<img src={img} alt="Easy Exchange" className="col-1 col-lg-2" />

			{/* Tiêu đề tính năng */}
			<h4 className="mt-2 mb-0 fw-bold">{head}</h4>

			{/* Mô tả tính năng */}
			<p className="c-gray">{text}</p>
		</article>
	);
};

export default SingleFeature;
