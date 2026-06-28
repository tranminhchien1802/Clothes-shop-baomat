// Component FetchErrorMsg – hiển thị thông báo lỗi khi không thể tải dữ liệu từ server
// Gợi ý người dùng kiểm tra kết nối Internet

const FetchErrorMsg = () => {
	return (
		<div className="fetchError mt-5 pt-5 text-center p-1">
			{/* Tiêu đề thông báo lỗi */}
			<h1>OOPS 😥! Failed to fetch Data</h1>
			{/* Gợi ý kiểm tra kết nối mạng */}
			<span>Please, check your Internet Connection</span>
		</div>
	);
};

export default FetchErrorMsg;
