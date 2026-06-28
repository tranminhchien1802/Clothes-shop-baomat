// Component DescribedImage – hiển thị một ảnh kèm mô tả bên cạnh (layout 2 cột)
// Props:
//   img – đường dẫn ảnh
//   imgTitle – alt text cho ảnh
//   sideText – nội dung text hiển thị bên cạnh ảnh
//   styleImg – class tuỳ chỉnh cho thẻ ảnh
//   styleText – class tuỳ chỉnh cho thẻ text
//   styleInLarge – class tuỳ chỉnh cho container (áp dụng trên màn hình lớn)

const DescribedImage = ({img, imgTitle, sideText, styleImg, styleText, styleInLarge}) => {
	return (
		<section className="described-img mt-405 mb-4 mt-lg-5">
			<div className={`row align-items-lg-center row-gap-4 ${styleInLarge}`}>
				
				{/* Hiển thị ảnh với class động */}
				<img
					className={`col-12 col-md-6 ${styleImg}`}
					src={img}
					alt={imgTitle}
				/>
				{/* Hiển thị text mô tả bên cạnh ảnh */}
				<article className={`col-12 col-md-6 text-start c-mm-gray ${styleText}`}>
                    {sideText}
				</article>
			</div>
		</section>
	);
};

export default DescribedImage;
