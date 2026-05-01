# Phân tích Chi tiết Use Case: Admin (Manager) & Staff

Tài liệu này đi sâu vào việc phân tích các Use Case (ca sử dụng) dành cho nội bộ hệ thống, bao gồm hai vai trò (Actor) chính là **Nhân viên (Staff)** và **Quản trị viên (Manager/Admin)**, dựa trên kiến trúc tổng quan của dự án.

---

## 1. Vai trò Nhân viên (Staff)
Nhân viên chịu trách nhiệm vận hành kho bãi, xử lý đơn hàng và điều phối hàng hóa vật lý thông qua số Serial/IMEI.

### UC_S01: Xử lý đơn hàng (Order Processing)
- **Mô tả:** Tiếp nhận, xác nhận và chuẩn bị hàng hóa cho các đơn đặt hàng trực tuyến từ Khách hàng.
- **Tiền điều kiện:** Đăng nhập với quyền `Staff`.
- **Luồng sự kiện chính:**
  1. Hệ thống hiển thị danh sách các Đơn hàng mới (Pending).
  2. Nhân viên chọn một đơn hàng để xem chi tiết (sản phẩm, số lượng, địa chỉ giao).
  3. Nhân viên kiểm tra tồn kho vật lý.
  4. Nếu đủ hàng, nhân viên tạo **Phiếu xuất kho** tương ứng cho đơn hàng đó (chuyển sang `UC_S02`).
  5. Hệ thống chuyển trạng thái đơn hàng sang "Đang xử lý" hoặc "Đang giao".
- **Luồng rẽ nhánh:**
  - Nếu hết hàng hoặc khách yêu cầu hủy, nhân viên nhấn "Hủy đơn" và nhập lý do. Hệ thống thông báo cho khách hàng và đóng đơn.

### UC_S02: Lập chứng từ kho (Create Inventory Document)
- **Mô tả:** Tạo mới các phiếu nghiệp vụ kho: Nhập (từ nhà cung cấp), Xuất (bán hàng), Trả (khách trả lại), hoặc Bảo hành.
- **Tiền điều kiện:** Đăng nhập với quyền `Staff`.
- **Luồng sự kiện chính:**
  1. Chọn loại phiếu (Nhập / Xuất / Trả / Bảo hành).
  2. Chọn Nhà cung cấp (nếu Nhập) hoặc Đơn hàng (nếu Xuất/Trả).
  3. Chọn Sản phẩm và **chỉ định cụ thể các mã Serial/IMEI** tham gia vào giao dịch.
  4. Lưu phiếu.
- **Hậu điều kiện:** Phiếu được tạo thành công với trạng thái **"Chờ duyệt"**. Trạng thái hàng hóa trong kho chưa bị thay đổi.

### UC_S03: Duyệt / Hủy phiếu kho (Approve/Cancel Document)
- **Mô tả:** Xác nhận tính hợp lệ của phiếu kho để hệ thống tự động cập nhật số lượng tồn và trạng thái Serial, hoặc hủy phiếu nếu phát hiện sai sót.
- **Tiền điều kiện:** Có một phiếu kho đang ở trạng thái "Chờ duyệt".
- **Luồng sự kiện chính:**
  1. Nhân viên xem lại danh sách Serial trên phiếu.
  2. Nhấn nút **"Duyệt"**.
  3. Hệ thống tự động quét các Serial trong phiếu và đổi trạng thái (ví dụ: `IN_STOCK` -> `SOLD` đối với Phiếu xuất). Trạng thái phiếu chuyển thành **"Đã duyệt"**.
- **Luồng rẽ nhánh (Hủy):**
  - Nhân viên nhấn **"Hủy"**. Trạng thái phiếu thành **"Đã hủy"**. Các Serial không bị thay đổi trạng thái. (Lưu ý: Chỉ hủy được phiếu "Chờ duyệt").

### UC_S04: Truy xuất & Tra cứu (Search & Trace)
- **Mô tả:** Tìm kiếm thông tin về lịch sử của một sản phẩm bất kỳ thông qua mã Serial.
- **Tiền điều kiện:** Đăng nhập với quyền `Staff`.
- **Luồng sự kiện chính:**
  1. Nhập mã Serial/IMEI vào ô tìm kiếm.
  2. Hệ thống liệt kê toàn bộ vòng đời của Serial đó: Ngày nhập (thuộc phiếu nào), ngày xuất (bán cho ai, phiếu nào), lịch sử bảo hành (nếu có).

---

## 2. Vai trò Quản trị viên (Manager / Admin)
Quản trị viên có toàn quyền của Staff, kèm theo các quyền quản trị hệ thống, nhân sự và theo dõi số liệu kinh doanh.

### UC_M01: Quản lý nhân sự (Staff Management)
- **Mô tả:** Kiểm soát quyền truy cập nội bộ, tạo và khóa tài khoản nhân viên.
- **Tiền điều kiện:** Đăng nhập với quyền `Admin`.
- **Luồng sự kiện chính:**
  1. Hệ thống hiển thị danh sách tài khoản Staff.
  2. Quản lý có thể chọn **Thêm mới**: Nhập email, tên, và cấp một mật khẩu mặc định (ví dụ: `123456`).
  3. Quản lý có thể chọn **Chỉnh sửa** để đổi thông tin, hoặc **Khóa (Deactivate)** tài khoản nếu nhân viên nghỉ việc.
- **Quy tắc nghiệp vụ:** Không được phép xóa cứng (Hard delete) tài khoản nhân viên để đảm bảo toàn vẹn dữ liệu lịch sử (các phiếu kho do nhân viên đó lập vẫn phải giữ nguyên tên).

### UC_M02: Theo dõi báo cáo (Dashboard & Analytics)
- **Mô tả:** Xem các thống kê kinh doanh quan trọng để ra quyết định.
- **Tiền điều kiện:** Đăng nhập với quyền `Admin`.
- **Luồng sự kiện chính:**
  1. Truy cập trang Dashboard.
  2. Hệ thống truy xuất dữ liệu DB và kết xuất dưới dạng cấu trúc JSON, sau đó Frontend render thành các biểu đồ (Charts).
  3. Các loại báo cáo hiển thị:
     - **Doanh thu:** Biểu đồ đường (Line chart) theo ngày/tháng/năm.
     - **Tồn kho:** Danh sách các sản phẩm sắp hết hàng, hoặc tỷ trọng tồn kho các hãng (Pie chart).

### UC_M03: Cấu hình hệ thống (System Configuration)
- **Mô tả:** Quản lý danh mục cốt lõi làm nền tảng cho sản phẩm và kho bãi.
- **Tiền điều kiện:** Đăng nhập với quyền `Admin`.
- **Luồng sự kiện chính:**
  1. Quản lý các danh mục: **Nhà cung cấp (Suppliers)**, **Thương hiệu (Brands)**, **Loại sản phẩm (Categories)**.
  2. Quản lý có thể Thêm / Sửa / Xóa.
- **Ràng buộc an toàn:**
  - Nếu Quản lý muốn Xóa một `Brand` (ví dụ: Apple), hệ thống phải tự động kiểm tra xem có `Product` nào đang thuộc `Brand` này không. Nếu có, chặn việc xóa và báo lỗi để tránh sập dữ liệu (Foreign Key constraint validation).
