// Component FetchWaitingMsg – hiển thị thông báo đang tải dữ liệu
// Dùng trong lúc chờ API trả về kết quả

const FetchWaitingMsg = () => {
	return (
		<div className="fetch-waiting mt-5 pt-5 text-center p-1">
			{/* Tiêu đề yêu cầu người dùng chờ */}
			<h1>Be Patient, please! 😊</h1>
			{/* Thông báo dữ liệu đang được tải */}
			<p>The data is being fetched, right now</p>
		</div>
	);
};

export default FetchWaitingMsg;
