# Phân Tích Chi Tiết UC_S01: Xử lý đơn hàng (Order Processing)

## 1. Tổng quan
- **Mô tả:** Tiếp nhận, xác nhận và chuẩn bị hàng hóa cho các đơn đặt hàng trực tuyến từ Khách hàng. Quy trình này là cầu nối giữa việc khách hàng đặt mua online và nhân viên kho xuất hàng vật lý.
- **Vai trò (Actor):** Nhân viên (Staff).
- **Tiền điều kiện:** 
  - Nhân viên đã đăng nhập và được cấp quyền `Staff`.
  - Có đơn hàng mới ở trạng thái `pending` trong hệ thống.

---

## 2. Các Bảng Dữ Liệu (Database Tables) Liên Quan
- `Orders`: Chứa thông tin tổng quan của đơn hàng (Mã đơn, tổng tiền, trạng thái, địa chỉ, người đặt).
- `Order_Details`: Chứa thông tin số lượng từng loại sản phẩm (`product_id`) cần thiết cho đơn hàng.
- `Stock_Units`: Dùng để kiểm tra xem còn đủ thiết bị vật lý (Serial) ở trạng thái khả dụng (`status = 1`) hay không.
- `Inventory_DOCs` & `DOC_Details`: Hệ thống sẽ tự động chuyển sang luồng tạo Phiếu Xuất Kho sau khi Staff xác nhận đủ hàng.

---

## 3. Luồng Nghiệp Vụ Chi Tiết (Detailed Workflows)

### 3.1. Luồng Chính (Happy Path) - Xử lý thành công
1. **Hiển thị danh sách chờ (Fetch Pending Orders):**
   - Hệ thống (Backend) query danh sách các đơn hàng có trạng thái `pending`.
   - Lệnh SQL mô phỏng: 
     ```sql
     SELECT order_id, total_amount, created_at, shipping_address 
     FROM Orders WHERE status = 'pending' ORDER BY created_at ASC;
     ```
2. **Xem chi tiết đơn hàng:**
   - Nhân viên click vào một đơn hàng. 
   - Hệ thống hiển thị các sản phẩm (`Order_Details`) và số lượng yêu cầu.
3. **Kiểm tra Tồn kho vật lý (Inventory Check):**
   - Trước khi Staff có thể "Duyệt" đơn, hệ thống tự động kiểm tra xem `Stock_Units` có đủ máy cho yêu cầu không.
   - Lệnh SQL mô phỏng (cho từng `product_id`):
     ```sql
     SELECT COUNT(*) as AvailableStock 
     FROM Stock_Units 
     WHERE product_id = @pid AND status = 1;
     ```
   - *Logic:* So sánh `AvailableStock` với `Order_Details.quantity`. Nếu `AvailableStock >= quantity` ở mọi mặt hàng, hệ thống cho phép tạo Phiếu xuất kho.
4. **Tạo Phiếu Xuất Kho (Trigger UC_S02):**
   - Nhân viên bấm nút "Tạo phiếu xuất". Hệ thống khởi tạo một `Inventory_DOCs` mới:
     - `doc_type = 2` (Xuất bán).
     - `order_ref = order_id` (Để lưu vết Phiếu này xuất cho Đơn nào).
   - Ở bước này, nhân viên sẽ dùng máy quét mã vạch quét mã Serial của từng thiết bị vật lý để đẩy vào `DOC_Details`.
5. **Cập nhật trạng thái (Update Status):**
   - Khi Phiếu Xuất được **Duyệt** (chuyển sang UC_S03), trạng thái của Đơn hàng tự động cập nhật từ `pending` sang `completed` (hoặc `shipping`).
   - Lệnh SQL: `UPDATE Orders SET status = 'completed' WHERE order_id = @order_id`

### 3.2. Luồng Rẽ Nhánh (Edge Cases & Exceptions)
- **Hết hàng (Out of Stock):** 
  - Tại bước 3, nếu số lượng `status = 1` của sản phẩm thấp hơn số lượng khách đặt, nút "Tạo phiếu xuất" bị vô hiệu hóa (disabled) hoặc hiện cảnh báo. Nhân viên phải chờ đợt nhập hàng tiếp theo hoặc liên hệ khách hủy đơn.
- **Hủy Đơn (Cancel Order):**
  - Khách hàng gọi điện yêu cầu hủy, hoặc kho không thể đáp ứng. Nhân viên bấm "Hủy đơn".
  - Yêu cầu nhập lý do hủy. Trạng thái cập nhật thành `cancelled`.

---

## 4. Yêu cầu API (Backend Endpoints)
Để hỗ trợ UC này, Backend cần cung cấp các API sau:
- `GET /api/orders?status=pending`: Lấy danh sách chờ.
- `GET /api/orders/:id`: Lấy chi tiết đơn hàng bao gồm `Order_Details`.
- `GET /api/products/:id/check-stock`: Trả về số lượng `Stock_Units` khả dụng của sản phẩm để UI đối chiếu.
- `PUT /api/orders/:id/status`: API dùng để đổi status sang `cancelled` hoặc `processing`.

---

## 5. Rủi ro & Lưu ý thiết kế
- **Race Condition (Tranh chấp dữ liệu):** Sẽ ra sao nếu có 2 nhân viên cùng lúc cố gắng "Tạo phiếu xuất" cho cùng 1 đơn hàng?
  - *Giải pháp:* Ngay khi một Nhân viên click "Bắt đầu xử lý", Backend nên update một flag `is_locked_by_user = @user_id` trên Đơn hàng hoặc áp dụng cơ chế optimistic khóa đơn.
- **Kiểm soát Serial (Hard Constraints):** Việc xuất kho cho Đơn hàng BẮT BUỘC phải tạo Phiếu Xuất (`Inventory_DOCs`). Không bao giờ được phép dùng lệnh Update trừ thẳng tồn kho ảo (stock_quantity) mà bỏ qua bước ghi nhận mã Serial. Điều này giúp tránh thất thoát và nhầm lẫn thiết bị.
