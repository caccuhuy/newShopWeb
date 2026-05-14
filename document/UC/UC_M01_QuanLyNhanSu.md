# Đặc tả Chi tiết Use Case: UC_M01 - Quản lý Nhân sự (Staff Management)

## 1. Thông tin chung
- **Tên Use Case:** Quản lý tài khoản nhân sự (Thêm, Sửa, Trạng thái hoạt động).
- **Mã Use Case:** UC_M01
- **Tác nhân (Actor):** Quản trị viên (Manager / Admin).
- **Mục đích:** Giúp quản trị viên kiểm soát quyền truy cập vào hệ thống nội bộ của nhân viên, thiết lập tài khoản mới cho nhân viên gia nhập, và thu hồi quyền (khóa tài khoản) khi nhân viên nghỉ việc.

## 2. Các điều kiện
- **Tiền điều kiện (Pre-conditions):**
  - Tác nhân đã đăng nhập vào hệ thống (Portal).
  - Tác nhân có vai trò (Role) là `Admin`.
- **Hậu điều kiện (Post-conditions):**
  - Trạng thái của tài khoản nhân viên (được thêm mới, cập nhật thông tin, hoặc bị khóa) được lưu trữ vào cơ sở dữ liệu (Bảng `Users`).
  - Nếu tài khoản bị khóa, nhân viên đó lập tức không thể đăng nhập vào hệ thống nội bộ.

## 3. Luồng sự kiện chính (Main Success Scenario)

**Luồng 1: Xem danh sách nhân sự**
1. Quản trị viên chọn chức năng **"Quản lý nhân sự"** trên thanh điều hướng (Sidebar).
2. Hệ thống truy xuất dữ liệu từ bảng `Users` (lọc theo role `Staff` hoặc `Admin`).
3. Hệ thống hiển thị danh sách dạng bảng (Table) gồm các cột: ID, Họ tên, Email, Số điện thoại, Vai trò, Trạng thái (Hoạt động / Đã khóa).

**Luồng 2: Thêm mới tài khoản nhân viên**
1. Từ màn hình Danh sách, Quản trị viên nhấn nút **"Thêm mới nhân viên"**.
2. Hệ thống hiển thị form nhập liệu bao gồm: Họ và tên, Email, Số điện thoại, Chọn vai trò (Staff/Admin).
3. Quản trị viên điền các thông tin hợp lệ và nhấn **"Lưu"**.
4. Hệ thống tự động:
   - Sinh `user_id` mới (tịnh tiến từ ID lớn nhất).
   - Thiết lập Mật khẩu mặc định (ví dụ: `123456`) và tự động băm (hash) bằng SHA-256.
   - Lưu thông tin vào DB.
5. Hệ thống hiển thị thông báo "Thêm tài khoản thành công" và làm mới lại danh sách.

**Luồng 3: Khóa tài khoản (Vô hiệu hóa)**
1. Tại danh sách nhân sự, Quản trị viên tìm đến tài khoản của nhân viên đã nghỉ việc.
2. Nhấn nút **"Khóa tài khoản"** (hoặc gạt Toggle Button).
3. Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này không? Người này sẽ không thể đăng nhập hệ thống nội bộ nữa."
4. Quản trị viên nhấn **"Xác nhận"**.
5. Hệ thống cập nhật trường `status` (hoặc `is_active`) của user đó trong Database thành `false`/`0`.
6. Hệ thống hiển thị thông báo thành công và cập nhật trạng thái hiển thị trên lưới.

## 4. Luồng rẽ nhánh & Ngoại lệ (Alternative Flows)
- **Ngoại lệ 1 (Trùng Email):** Ở bước lưu tài khoản mới, nếu Email Quản trị viên nhập vào đã tồn tại trong hệ thống (của Khách hàng hoặc Nhân viên khác), hệ thống chặn lại và báo lỗi "Email này đã tồn tại trong hệ thống!".
- **Ngoại lệ 2 (Khóa chính mình):** Quản trị viên không được phép tự Khóa (Deactivate) tài khoản mà mình đang đăng nhập. Nút Khóa sẽ bị ẩn đối với dòng dữ liệu của chính họ.
- **Ngoại lệ 3 (Lỗi kết nối CSDL):** Hệ thống thông báo lỗi "Không thể kết nối đến máy chủ. Vui lòng thử lại sau" và giữ nguyên trạng thái cũ của màn hình.

## 5. Quy tắc nghiệp vụ & Ràng buộc (Business Rules)
1. **Bảo toàn dữ liệu (No Hard Deletion):** 
   - Tuyệt đối **không được xóa cứng (Delete)** tài khoản nhân viên khỏi Database. 
   - Lý do: Một nhân viên dù nghỉ việc nhưng trong quá khứ đã tạo các phiếu Xuất/Nhập kho, Xử lý đơn hàng. Nếu xóa tài khoản, các phiếu kho này sẽ bị mất Foreign Key (`user_id`), gây lỗi toàn vẹn dữ liệu và mất dấu vết kiểm toán (Audit Trail).
   - Giải pháp: Sử dụng cơ chế "Xóa mềm" (Soft Delete) - Cập nhật trạng thái `is_active = 0` hoặc `status = 'locked'`.
2. **Vai trò (Role Hierarchy):**
   - Chỉ tài khoản `Admin` mới nhìn thấy màn hình "Quản lý nhân sự".
   - Tài khoản `Staff` bị chặn hoàn toàn (Redirect) nếu cố tình truy cập vào URL này.
3. **Mật khẩu mặc định:** Nhân viên mới sau khi được tạo tài khoản bằng pass mặc định sẽ phải dùng tính năng "Đổi mật khẩu" của riêng họ để bảo mật thông tin (Tùy chọn nâng cấp sau).

## 6. Yêu cầu giao diện (UI / UX)
- Sử dụng Data Table (có phân trang - pagination) để hiển thị danh sách nếu số lượng nhân sự lớn.
- Khung tìm kiếm: Cho phép tìm kiếm nhân viên theo Tên hoặc Email.
- Thẻ trạng thái (Badge): 
  - Hoạt động: Màu xanh lá (Green).
  - Đã khóa: Màu xám (Gray) hoặc đỏ nhạt.
- Form nhập liệu có thể làm dưới dạng Modal (Popup)

## 7. Cấu trúc DB liên quan
- Cần đảm bảo bảng `Users` có thêm cột `status` (hoặc `is_active`) kiểu `BIT` hoặc `VARCHAR` để phục vụ chức năng Khóa tài khoản. (Nếu hiện tại DB chưa có cột này, cần xem xét thêm bằng lệnh ALTER TABLE). Comment: SQL Server chưa có có cột is_active
