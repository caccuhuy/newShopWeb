# NewShopWeb - Hệ thống Quản lý Bán hàng Hiện đại

Dự án web bán hàng tích hợp hệ thống quản lý (Admin Dashboard) mạnh mẽ, được xây dựng với React, Node.js và Microsoft SQL Server.

## 🚀 Công nghệ sử dụng

- **Frontend**: React.js, Vite, Lucide Icons, Recharts (Biểu đồ).
- **Backend**: Node.js, Express, JWT Authentication, Multer (Quản lý file).
- **Database**: Microsoft SQL Server (MSSQL).
- **Styling**: CSS Modules (Vanilla CSS).

## 📂 Cấu trúc dự án

```text
newShopWeb/
├── frontend/          # Giao diện người dùng và trang quản trị (React)
├── backend/           # API server và kết nối cơ sở dữ liệu (Node.js)
│   ├── config/        # Cấu hình DB
│   ├── routes/        # Định nghĩa các API endpoints
│   ├── public/        # Chứa ảnh sản phẩm tải lên
│   └── scripts/       # Các script hỗ trợ (di cư dữ liệu, backup...)
└── document/          # Tài liệu đặc tả hệ thống
```

## 🛠 Hướng dẫn cài đặt và chạy dự án

### 1. Chuẩn bị Cơ sở dữ liệu
- Cài đặt **Microsoft SQL Server**.
- Sử dụng tính năng **Restore Database** trong SQL Server Management Studio (SSMS).
- Chọn file backup tại: `document/Database_backup/E_COM.bak`.
- Đảm bảo cơ sở dữ liệu được khôi phục thành công với tên `E_COM`.

### 2. Cấu hình Backend
- Di chuyển vào thư mục backend: `cd backend`
- Cài đặt dependencies: `npm install`
- Tạo hoặc chỉnh sửa file `.env` trong thư mục `backend/`:
  ```env
  DB_USER=sa
  DB_PASSWORD=123456
  DB_SERVER=localhost
  DB_PORT=1433
  DB_NAME=E_COM
  JWT_SECRET=super_secret_key_for_jwt_token_123456
  PORT=5000
  ```
- Chạy server: `npm start` hoặc `node index.js`

### 3. Cấu hình Frontend
- Mở một terminal mới và di chuyển vào thư mục frontend: `cd frontend`
- Cài đặt dependencies: `npm install`
- Chạy ứng dụng: `npm run dev`
- Truy cập tại: `http://localhost:5173`
- Trang đăng nhập Admin/Staff: `http://localhost:5173/admin/login`

## 🔑 Tài khoản thử nghiệm

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@admin.com` | `123456` |
| **Staff** | `staff@staff.com` | `123456` |
| **User** | `cust1@gmail.com` | `123456` |

## ✨ Các tính năng chính của Admin Dashboard

1. **Báo cáo & Phân tích**: Theo dõi doanh thu, đơn hàng, khách hàng qua biểu đồ trực quan (Line/Bar chart).
2. **Quản lý Sản phẩm**:
   - Thêm/Sửa/Xóa sản phẩm với giao diện hiện đại.
   - Nhập thông số kỹ thuật (Specs) theo cấu hình nhóm (Nested JSON).
   - Tự động quản lý hình ảnh local server.
3. **Quản lý Kho hàng**: Theo dõi tồn kho thời gian thực với chỉ báo màu sắc (Xanh/Cam/Đỏ).
4. **Lọc & Tìm kiếm**: Bộ lọc nâng cao theo Danh mục và Thương hiệu.

---
*Dự án đang trong quá trình phát triển và hoàn thiện các tính năng nâng cao.*