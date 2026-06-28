// Component SubscriptionForm – form đăng ký nhận tin qua email
// Cho phép người dùng nhập email và gửi đăng ký (hiện tại chỉ log ra console)

import { useState } from "react";

const SubscriptionForm = () => {
	// State lưu giá trị email người dùng nhập vào
	const [emailValue, setEmailValue] = useState('');
	
	// Hàm xử lý khi submit form: ngăn reload, log thông báo, xoá input
	const handleForm = (e) => {
		e.preventDefault();
		console.log('subecibed sucessfully');
		// Xoá giá trị input sau khi submit
		setEmailValue('')
	}

	return (
		<section id="subscription-form" className="sec-padd">
			<div className="container d-flex flex-column gap-3">
				{/* Tiêu đề khuyến mãi */}
				<h3>Subscribe now & get 20% off</h3>

				{/* Mô tả ngắn */}
				<p className="c-gray fs-small">
					Lorem Ipsum is simply dummy text of the printing and typesetting
					industry.
				</p>

				{/* Form nhập email */}
				<form className="form d-flex" onSubmit={handleForm}>
					<input
						type="email"
						className="col-8 col-sm-9 px-3 border-gray outline-0"
						placeholder="enter your email"
						onChange={(e) => setEmailValue(e.target.value)}
						value={emailValue}
						required
					/>
					{/* <button className="btn rounded-0 py-203 bg-black c-white col-4 col-sm-3 fs-tiny" onClick={handleForm}> */}
					<button className="btn rounded-0 py-203 bg-black c-white col-4 col-sm-3 fs-tiny">
						SUBSCRIBE
					</button>
				</form>
			</div>
		</section>
	);
};

export default SubscriptionForm;
