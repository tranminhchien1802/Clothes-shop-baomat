import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Cấu hình Vite cho dự án React
export default defineConfig({
  // Plugin hỗ trợ React với SWC (tăng tốc biên dịch so với Babel)
  plugins: [react()],
  server: {
    proxy: {
      // Proxy: tất cả request đến /api sẽ được chuyển tiếp đến backend ở http://localhost:5000
      // Giúp tránh CORS khi phát triển frontend và backend trên cùng máy
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,  // Thay đổi origin của request thành target
      }
    }
  },
  // Tắt màn hình clear screen khi chạy lệnh dev (không xoá output terminal)
  clearScreen: false,
})
