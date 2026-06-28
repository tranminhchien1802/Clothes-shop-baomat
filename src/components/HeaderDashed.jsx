// Component HeaderDashed – tiêu đề section dạng hai phần (head1 + head2) kèm gạch ngang trang trí
// Props:
//   head1 – phần đầu tiêu đề (màu xám nhạt)
//   head2 – phần thứ hai của tiêu đề (màu xám đậm)
//   paragraph – (tuỳ chọn) đoạn mô tả bên dưới tiêu đề
//   classStyle – class tuỳ chỉnh thêm

const HeaderDashed = ({ head1, head2, paragraph, classStyle }) => {
	return (
		<header id="section-header" className="text-capitalize">
			<h2 className={`d-flex gap-1 gap-sm-2 align-items-center justify-content-center ${classStyle}`}>
				<span className="c-light-gray">{head1}</span>{" "}
				<span className="c-d-gray">{head2}</span>{" "}
				<span className="line-span wd-40 ms-1"></span>
			</h2>
			{paragraph && <p className="c-gray px-3 fs-small">{paragraph}</p>}
			
		</header>
	);
};

export default HeaderDashed;
