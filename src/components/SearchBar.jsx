// Component SearchBar – thanh tìm kiếm sản phẩm
// Lấy setActiveSearch (đóng/mở search bar), search và setSearch (giá trị tìm kiếm) từ ShopContext
// Khi click vào icon X, đóng search bar và xoá giá trị tìm kiếm

import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';

const SearchBar = () => {
    // Lấy các hàm và state từ context
    const {setActiveSearch, search, setSearch} = useContext(ShopContext);

    // Đóng search bar và xoá nội dung tìm kiếm
    const manageCloseBar = () => {
        setActiveSearch(false);
        setSearch('')
    }

  return (
        <div className="container search-field border-bottom border-c-gray col-12 d-flex justify-content-center align-items-center py-3 bg-body-tertiary">
            {/* Input tìm kiếm – cập nhật search trong context khi nhập */}
            <input type="text" className="rounded-pill border-ml-gray outline-0 p-2 px-3" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value.trim())}/>
            {/* Icon X đóng thanh tìm kiếm */}
            <i className='bx bx-x fs-2 p-2 cursor c-gray' onClick={manageCloseBar}></i>
        </div>
        
  )
}

export default SearchBar
