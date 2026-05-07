# MỤC LỤC BÁO CÁO DỰ ÁN HỆ THỐNG QUẢN LÝ BÁN HÀNG

**LỜI CẢM ƠN**
**TÓM TẮT DỰ ÁN**
**DANH MỤC TỪ VIẾT TẮT**
**DANH MỤC HÌNH ẢNH, BIỂU ĐỒ**
**DANH MỤC BẢNG BIỂU**

### CHƯƠNG 1: TỔNG QUAN DỰ ÁN
**1.1. Bối cảnh và lý do chọn đề tài**
*   1.1.1. Nhu cầu quản lý bán hàng thiết bị điện tử hiện nay
*   1.1.2. Thách thức trong quản lý kho vật lý và truy xuất nguồn gốc (Serial/IMEI)
**1.2. Mục tiêu dự án**
*   1.2.1. Mục tiêu cốt lõi (Quản lý thực thể vật lý, tính toàn vẹn dữ liệu)
*   1.2.2. Điểm khác biệt của hệ thống (Lean Database, Tính minh bạch chứng từ)
**1.3. Phạm vi hệ thống**
*   1.3.1. Đối tượng sử dụng (Customer, Staff, Manager)
*   1.3.2. Giới hạn tính năng
**1.4. Công nghệ sử dụng**
*   1.4.1. Frontend (React.js, Vite, Recharts)
*   1.4.2. Backend (Node.js, Express, JWT, Multer)
*   1.4.3. Cơ sở dữ liệu (Microsoft SQL Server - MSSQL)

### CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG
**2.1. Phân tích người dùng (Actors)**
*   2.1.1. Khách hàng (Customer)
*   2.1.2. Nhân viên (Staff)
*   2.1.3. Quản trị viên (Manager)
**2.2. Yêu cầu chức năng (Functional Requirements)**
*   2.2.1. Nhóm chức năng Khách hàng (Mua sắm, Giỏ hàng, Đặt hàng, Tra cứu)
*   2.2.2. Nhóm chức năng Nhân viên (Xử lý đơn hàng, Lập/Duyệt phiếu kho)
*   2.2.3. Nhóm chức năng Quản trị (Quản lý nhân sự, Báo cáo thống kê, Cấu hình)
**2.3. Yêu cầu phi chức năng (Non-functional Requirements)**
*   2.3.1. Hiệu năng (Thời gian phản hồi truy vấn)
*   2.3.2. Bảo mật (JWT Authentication, Phân quyền Role-based)
*   2.3.3. Tính khả dụng và trải nghiệm người dùng (UX/UI)
**2.4. Biểu đồ Use Case (Use Case Diagrams)**
*   2.4.1. Use Case tổng quát
*   2.4.2. Use Case chi tiết phân hệ Khách hàng
*   2.4.3. Use Case chi tiết phân hệ Quản trị & Kho bãi

### CHƯƠNG 3: THIẾT KẾ HỆ THỐNG
**3.1. Kiến trúc hệ thống**
*   3.1.1. Mô hình 3 lớp (3-Tier Architecture)
**3.2. Thiết kế Cơ sở dữ liệu (Database Design)**
*   3.2.1. Mô hình Thực thể - Mối liên kết (ERD)
*   3.2.2. Thiết kế các bảng cốt lõi (Users, Product, Device, InventoryDoc, Order)
*   3.2.3. Tối ưu hóa Database (Constraints, Triggers cập nhật trạng thái kho)
**3.3. Thiết kế Quản lý Trạng thái (State Management)**
*   3.3.1. Vòng đời trạng thái thiết bị (Sẵn có, Chờ giao, Đã bán)
*   3.3.2. Vòng đời chứng từ kho (Chờ duyệt, Đã duyệt, Đã hủy)
**3.4. Thiết kế API (RESTful API Design)**
*   3.4.1. Chuẩn hóa Endpoint và HTTP Methods
*   3.4.2. Cấu trúc Request/Response và Error Handling
**3.5. Thiết kế Giao diện (UI/UX Design)**
*   3.5.1. Sơ đồ trang (Sitemap)
*   3.5.2. Giao diện trang khách hàng (Storefront)
*   3.5.3. Giao diện trang quản trị (Admin Dashboard)

### CHƯƠNG 4: HIỆN THỰC HỆ THỐNG
**4.1. Hiện thực Backend (Node.js)**
*   4.1.1. Cấu trúc thư mục Backend
*   4.1.2. Triển khai Authentication & Authorization (Middleware bảo mật)
*   4.1.3. Logic xử lý kho và đơn hàng (Giao dịch ACID trong SQL Server)
**4.2. Hiện thực Frontend (React.js)**
*   4.2.1. Cấu trúc Component và Routing
*   4.2.2. Quản lý State với Context API / Hooks
*   4.2.3. Tích hợp đồ thị thống kê (Recharts)
**4.3. Các luồng nghiệp vụ điển hình (Workflows)**
*   4.3.1. Quy trình Đặt hàng và Xử lý thanh toán
*   4.3.2. Quy trình Lập và Duyệt phiếu Xuất/Nhập kho

### CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ
**5.1. Chiến lược kiểm thử**
*   5.1.1. Unit Test (Kiểm thử logic)
*   5.1.2. Integration Test (Kiểm thử luồng nghiệp vụ)
**5.2. Các kịch bản kiểm thử (Test Cases)**
*   5.2.1. Kịch bản mua hàng và trừ tồn kho
*   5.2.2. Kịch bản phân quyền User/Staff/Admin
**5.3. Đánh giá hiệu năng và tính toàn vẹn**
*   5.3.1. Đánh giá thời gian truy vấn DB với Trigger
*   5.3.2. Đánh giá tính toàn vẹn của mã Serial khi thao tác song song

### CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
**6.1. Kết quả đạt được**
*   6.1.1. Các chức năng đã hoàn thiện
*   6.1.2. Những ưu điểm của hệ thống
**6.2. Hạn chế còn tồn tại**
**6.3. Hướng phát triển trong tương lai**
*   6.3.1. Tích hợp cổng thanh toán thực tế (VNPAY, Momo)
*   6.3.2. Tối ưu hoá quy trình giao vận (Logistics)

### TÀI LIỆU THAM KHẢO
### PHỤ LỤC
*   **Phụ lục A:** Hướng dẫn cài đặt và triển khai hệ thống
*   **Phụ lục B:** Danh sách API hệ thống
