# UC_M03: Cấu hình hệ thống (System Configuration)

## 1. Thông tin chung
- **Tác nhân chính:** Quản trị viên (Admin).
- **Mô tả tóm tắt:** Cho phép Quản trị viên thiết lập và quản lý các dữ liệu cốt lõi của hệ thống bao gồm: Nhà cung cấp (Suppliers), Sản phẩm (Products), và Loại sản phẩm (Categories). Đây là các dữ liệu nền tảng (Master Data) bắt buộc phải có để vận hành quy trình bán hàng và quản lý kho.
- **Tiền điều kiện:** Người dùng đã đăng nhập thành công vào hệ thống quản trị với vai trò `Admin`.
- **Hậu điều kiện:** Dữ liệu danh mục trong CSDL được cập nhật (Thêm, Sửa, hoặc Xóa). Các thay đổi này sẽ ngay lập tức phản ánh lên giao diện bán hàng (đối với Sản phẩm) và các biểu mẫu nhập/xuất kho.

## 2. Phân tích Dữ liệu
### Dữ liệu đầu vào (Input từ thao tác người dùng)
- **Thông tin Nhà cung cấp:** Tên nhà cung cấp, Mã số thuế (Tax ID - Khóa chính).
- **Thông tin Loại sản phẩm:** Mã loại (Category ID), Tên danh mục (Category Name).
- **Thông tin Sản phẩm:** Tên sản phẩm, Danh mục (Category), Đơn giá (Unit Price), Thương hiệu (Brand), Thời gian bảo hành (Warranty Period), Hình ảnh (Image URL), Thông số kỹ thuật (Specs JSON).
- **Hành động:** Thêm mới (Create), Cập nhật (Update), Xóa (Delete).

### Dữ liệu đầu ra (Output hiển thị trên màn hình)
- **Danh sách quản lý:** Các Data Table hiển thị chi tiết danh sách Nhà cung cấp, Sản phẩm, Loại sản phẩm với tính năng phân trang (Pagination), lọc (Filter) và tìm kiếm (Search).
- **Thông báo (Toast/Modal):** Phản hồi trạng thái thao tác (Thêm thành công, Lỗi trùng lặp, Cảnh báo ràng buộc xóa).

## 3. Luồng sự kiện chính (Main Success Scenario)
1. Quản trị viên chọn mục **"Quản lý sản phẩm"** (bao gồm Sản phẩm & Loại SP) hoặc **"Quản lý nhà cung cấp"** trên thanh Sidebar.
2. Hệ thống tải dữ liệu danh sách hiện tại từ Backend thông qua API và hiển thị lên các Data Table tương ứng.
3. Admin thực hiện thao tác (Ví dụ: Thêm mới Sản phẩm):
   - Admin click nút **"Thêm mới"**.
   - Hệ thống hiển thị Modal/Form nhập liệu (với Dropdown chọn Loại sản phẩm được fetch từ API Category).
   - Admin điền thông tin và bấm **"Lưu"**.
4. Frontend validate dữ liệu đầu vào (kiểm tra rỗng, đúng định dạng số cho giá tiền).
5. Gửi API request (POST) chứa payload dữ liệu lên Backend.
6. Backend kiểm tra tính hợp lệ (VD: không trùng lặp tên), lưu dữ liệu vào Database và trả về kết quả thành công (HTTP 201/200).
7. Frontend đóng Modal, hiển thị thông báo thành công (Toast success) và tự động gọi lại API lấy danh sách để làm mới giao diện.

## 4. Luồng rẽ nhánh & Ngoại lệ (Alternative Flows)
- **Ngoại lệ 1 (Trùng lặp dữ liệu):** Khi Thêm hoặc Sửa, nếu Admin nhập Mã số thuế (NCC) đã tồn tại, Backend sẽ báo lỗi `409 Conflict`. Frontend bắt lỗi và hiển thị thông báo: *"Mã số thuế này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại."*
- **Ngoại lệ 2 (Lỗi ràng buộc khóa ngoại - Foreign Key Exception khi Xóa Loại Sản phẩm):**
  - **Sự kiện:** Admin bấm "Xóa" một Loại sản phẩm (VD: Laptop).
  - **Xử lý:** Backend tự động kiểm tra bảng `Product`. Nếu phát hiện có sản phẩm nào đang thuộc Loại này, Backend chặn thao tác xóa và trả về lỗi `422 Unprocessable Entity`.
  - **Hiển thị:** Frontend hiện cảnh báo: *"Không thể xóa! Hiện đang có sản phẩm thuộc danh mục này. Vui lòng chuyển đổi hoặc xóa các sản phẩm đó trước."*
- **Ngoại lệ 3 (Lỗi ràng buộc khi Xóa Sản phẩm / Nhà cung cấp):** Tương tự, nếu cố gắng xóa một `Nhà cung cấp` hoặc `Sản phẩm` đã từng có lịch sử giao dịch (đã nằm trong đơn hàng `Order_Details` hoặc chi tiết phiếu kho `DOC_Details`), hệ thống phải chặn lại để bảo vệ tính toàn vẹn dữ liệu kế toán và đối soát kho bãi.

## 5. Quy tắc nghiệp vụ & Ràng buộc (Business Rules)
1. **Bảo toàn dữ liệu lịch sử:** Tuyệt đối không cho phép xóa cứng (Hard Delete) Sản phẩm hoặc Nhà cung cấp nếu chúng đã phát sinh giao dịch. Các sản phẩm ngừng kinh doanh nên được xử lý bằng cách ẩn hiển thị thay vì xóa khỏi CSDL để không làm hỏng dữ liệu các đơn hàng cũ.
2. **Quyền truy cập (RBAC):** Chỉ `Admin` mới được phép truy cập và gọi các API thao tác (Thêm/Sửa/Xóa). Tài khoản `Staff` (Nhân viên) chỉ có quyền Đọc (Read-only) khi lên đơn hàng hoặc phiếu kho.
3. **Định danh duy nhất:** Mã số thuế (`tax_id`) là định danh pháp lý duy nhất của bảng `Suppliers`, bắt buộc phải có để xuất hóa đơn và làm phiếu nhập kho.

## 6. Yêu cầu giao diện (UI / UX)
- **Giao diện quản lý phân tách (Separate Pages):** Dữ liệu được tách ra làm 2 trang riêng biệt trên thanh điều hướng (Sidebar) để tối ưu không gian hiển thị cho các bảng dữ liệu lớn:
  - **Trang Quản lý Sản phẩm:** Gồm 2 Tabs (hoặc Sub-menu) là "Danh sách Sản phẩm" và "Loại sản phẩm". Form thêm sản phẩm cần hỗ trợ upload hình ảnh và nhập thông số kỹ thuật (Specs).
  - **Trang Quản lý Nhà cung cấp:** Quản lý thông tin đối tác, nhà cung cấp (Suppliers).
- **Thao tác linh hoạt:** Sử dụng Modal gọn gàng để Thêm/Sửa Loại sản phẩm và Nhà cung cấp. Đối với Sản phẩm (do có nhiều trường dữ liệu phức tạp), có thể dùng một trang riêng hoặc Drawer mở rộng từ cạnh màn hình.
- **Thiết kế an toàn (Danger Zone):** Nút "Xóa" cần được thiết kế nổi bật với cảnh báo (Màu đỏ/Outline đỏ). Bắt buộc hiển thị Dialog xác nhận (Confirmation Modal): *"Bạn có chắc chắn muốn xóa? Thao tác này không thể hoàn tác."* trước khi gọi API xóa.

## 7. Yêu cầu Cấu trúc DB & Truy vấn (Backend Implementation Notes)
- **Bảng `Suppliers`**: `tax_id` (PK, CHAR/VARCHAR), `supplier_name`.
- **Bảng `Category`**: `cat_id` (PK, INT), `cat_name`.
- **Bảng `Product`**: `product_id` (PK, INT), `product_name`, `cat_id` (FK), `specs_json` (NVARCHAR), `unit_price` (DECIMAL), `brand` (VARCHAR), `waraty_period` (INT), `image_url` (VARCHAR).
- **Xử lý ràng buộc Xóa (Validation Logic) tại Backend (VD với Category):**
  ```sql
  -- Trước khi thực hiện lệnh DELETE Category
  IF EXISTS (SELECT 1 FROM Product WHERE cat_id = @categoryId)
  BEGIN
      -- Ném lỗi để chặn xóa
      RAISERROR(N'Cảnh báo: Có sản phẩm đang sử dụng danh mục này, không thể xóa.', 16, 1);
      RETURN;
  END
  DELETE FROM Category WHERE cat_id = @categoryId;
  ```
