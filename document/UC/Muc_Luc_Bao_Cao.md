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
*   2.2.2. Nhóm chức năng Nhân viên (Xử lý đơn hàng, Lập phiếu kho)
*   2.2.3. Nhóm chức năng Quản trị (Duyệt chứng từ, Quản lý nhân sự, Báo cáo, Cấu hình)
**2.3. Yêu cầu phi chức năng (Non-functional Requirements)**
*   2.3.1. Hiệu năng (Thời gian phản hồi truy vấn)
*   2.3.2. Bảo mật (JWT Authentication, Phân quyền Role-based)
*   2.3.3. Tính toàn vẹn dữ liệu (ACID, Constraints, Triggers bảo vệ)
**2.4. Biểu đồ Use Case (Use Case Diagrams)**
*   2.4.1. Use Case tổng quát
*   2.4.2. Use Case chi tiết phân hệ Khách hàng
*   2.4.3. Use Case chi tiết phân hệ Quản trị & Kho bãi

### CHƯƠNG 3: THIẾT KẾ HỆ THỐNG
**3.1. Kiến trúc hệ thống**
*   3.1.1. Mô hình 3 lớp (3-Tier Architecture) và phân bổ trách nhiệm
*   3.1.2. Chiến lược Database-centric: Logic nghiệp vụ tại tầng CSDL
**3.2. Thiết kế Cơ sở dữ liệu (Database Design)**
*   3.2.1. Mô hình Thực thể - Mối liên kết (ERD)
*   3.2.2. Thiết kế các bảng cốt lõi (Users, Product, Stock_Units, Inventory_DOCs, Orders)
*   3.2.3. Các ràng buộc toàn vẹn (Constraints, Foreign Keys)
**3.3. Thiết kế Stored Procedures (Thủ tục lưu trữ)**
*   3.3.1. Nhóm SP Xác thực & Tài khoản (sp_LoginUser, sp_RegisterCustomer, sp_GetUserProfile)
*   3.3.2. Nhóm SP Sản phẩm & Danh mục (sp_AddProducts, sp_AlterProducts, sp_SearchProducts, ...)
*   3.3.3. Nhóm SP Đơn hàng (sp_AddNewOrder, sp_ConfirmOrderAndCreateExport, sp_ChangeOrderStatus, ...)
*   3.3.4. Nhóm SP Quản lý kho (sp_ImportInventory, sp_UpdateInventoryDetails, sp_ApproveOrCancelInventoryDoc, ...)
*   3.3.5. Nhóm SP Quản trị hệ thống (sp_AddStaff, sp_ToggleUserActive, sp_Log, ...)
**3.4. Thiết kế Triggers (Bộ kích hoạt tự động)**
*   3.4.1. trg_HandleInventoryApproval - Tự động cập nhật trạng thái Stock_Units khi duyệt chứng từ
*   3.4.2. trg_ProtectApprovedDetails - Bảo vệ chi tiết phiếu đã duyệt (nguyên tắc Bất biến)
*   3.4.3. trg_ProtectApprovedHeader - Bảo vệ header chứng từ đã chốt khỏi sửa đổi ngoài luồng
*   3.4.4. trg_CleanTrashDocs - Tự động xóa phiếu nháp khi bị hủy
**3.5. Thiết kế API (RESTful API Design)**
*   3.5.1. Chuẩn hóa Endpoint và HTTP Methods
*   3.5.2. Cơ chế gọi Stored Procedure từ Backend Node.js (mssql pool + TVP)
**3.6. Thiết kế Giao diện (UI/UX Design)**
*   3.6.1. Sơ đồ trang (Sitemap)
*   3.6.2. Giao diện trang khách hàng (Storefront)
*   3.6.3. Giao diện trang quản trị (Admin Dashboard)

### CHƯƠNG 4: HIỆN THỰC HỆ THỐNG
**4.1. Hiện thực Cơ sở dữ liệu (SQL Server)**
*   4.1.1. Triển khai các bảng và ràng buộc
*   4.1.2. Triển khai Stored Procedures theo nhóm nghiệp vụ
*   4.1.3. Triển khai Triggers và kiểm tra cơ chế State Machine tự động
**4.2. Hiện thực Backend (Node.js - Lớp kết nối và bảo mật)**
*   4.2.1. Cấu trúc thư mục Backend
*   4.2.2. Triển khai Authentication & Authorization (Middleware JWT)
*   4.2.3. Pattern gọi Stored Procedure (mssql pool, Table-Valued Parameters)
**4.3. Hiện thực Frontend (React.js)**
*   4.3.1. Cấu trúc Component và Routing
*   4.3.2. Quản lý State với Context API / Hooks
*   4.3.3. Tích hợp đồ thị thống kê (Recharts)
**4.4. Các luồng nghiệp vụ điển hình (Workflows)**
*   4.4.1. Luồng Đặt hàng: Customer → sp_AddNewOrder → Kiểm tra tồn kho trong SP
*   4.4.2. Luồng Xử lý đơn: Staff → sp_ConfirmOrderAndCreateExport → Manager Duyệt → trg_HandleInventoryApproval
*   4.4.3. Luồng Nhập kho: Staff → sp_ImportInventory → Manager → sp_ApproveOrCancelInventoryDoc → Trigger cập nhật Stock_Units

### CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ
**5.1. Chiến lược kiểm thử**
*   5.1.1. Kiểm thử Stored Procedure trực tiếp trên SQL Server Management Studio
*   5.1.2. Kiểm thử Integration qua API (Swagger UI tại /api-docs)
**5.2. Các kịch bản kiểm thử (Test Cases)**
*   5.2.1. Kịch bản đặt hàng và kiểm tra tồn kho tự động
*   5.2.2. Kịch bản phân quyền Customer/Staff/Admin
*   5.2.3. Kịch bản bảo vệ tính bất biến của chứng từ đã duyệt (Trigger)
**5.3. Đánh giá hiệu năng và tính toàn vẹn**
*   5.3.1. Đánh giá hiệu năng truy vấn Stored Procedure
*   5.3.2. Đánh giá tính toàn vẹn của mã Serial khi thao tác đồng thời

### CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
**6.1. Kết quả đạt được**
*   6.1.1. Các chức năng đã hoàn thiện
*   6.1.2. Những ưu điểm của hệ thống (Database-centric, Stored Procedures, Bất biến chứng từ)
**6.2. Hạn chế còn tồn tại**
**6.3. Hướng phát triển trong tương lai**
*   6.3.1. Tích hợp cổng thanh toán thực tế (VNPAY, Momo)
*   6.3.2. Tối ưu hoá quy trình giao vận (Logistics)

### TÀI LIỆU THAM KHẢO
### PHỤ LỤC
*   **Phụ lục A:** Hướng dẫn cài đặt và triển khai hệ thống
*   **Phụ lục B:** Danh sách API hệ thống (41 endpoints)
*   **Phụ lục C:** Danh sách Database Objects (Stored Procedures & Triggers)
