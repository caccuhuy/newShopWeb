# Phân tích Chi tiết Use Case: Duyệt / Hủy Phiếu Kho (UC_S03)

## 1. Tổng quan
- **Mục tiêu:** Cho phép nhân viên (Staff) kiểm tra lại và đưa ra quyết định cuối cùng đối với các phiếu kho (nhập/xuất/trả) đang ở trạng thái nháp ("Chờ duyệt"). Thao tác "Duyệt" sẽ chính thức làm thay đổi tồn kho thực tế của hệ thống.
- **Tác nhân (Actor):** Nhân viên (Staff).
- **Tiền điều kiện:** Phiếu kho (Inventory_DOCs) phải tồn tại trong cơ sở dữ liệu và đang ở trạng thái `status = 0` (Chờ duyệt).

---

## 2. Phân tích Luồng Xử lý Dữ liệu (Data Flow)

Sự thay đổi tồn kho không được xử lý hoàn toàn trong Node.js Backend mà được **ủy quyền một phần lớn cho SQL Server Trigger** (`trg_HandleInventoryApproval`). Điều này đảm bảo tính toàn vẹn (ACID) của dữ liệu kế toán và tồn kho.

### 2.1. Thao tác Duyệt phiếu (Approve - Status chuyển từ 0 -> 1)
Khi Backend gửi lệnh `UPDATE Inventory_DOCs SET status = 1`, Trigger trong DB sẽ tự động thực thi các nghiệp vụ sau:

*   **Đối với Phiếu Nhập kho (`doc_type = 1`):**
    *   *Hành động:* Hệ thống quét các `serial_number` trong `DOC_Details`. Nếu Serial này chưa từng tồn tại trong kho, nó sẽ tự động được `INSERT` vào bảng `Stock_Units` với `status = 1` (Sẵn có).
*   **Đối với Phiếu Xuất kho (`doc_type = 2`):**
    *   *Kiểm tra bảo mật:* Đảm bảo 100% các Serial xuất đi đang ở trạng thái hợp lệ (`status = 1`). Nếu có bất kỳ Serial nào lỗi, toàn bộ Transaction bị Rollback và báo lỗi.
    *   *Hành động:* Cập nhật bảng `Stock_Units` cho các Serial tương ứng thành `status = 2` (Đã bán).
*   **Các loại phiếu khác:**
    *   Phiếu trả NCC (`doc_type = 3`): Serial chuyển về `0` (Hàng lỗi/Trục xuất).
    *   Phiếu nhận bảo hành (`doc_type = 4`): Serial chuyển về `4` (Đang sửa).

### 2.2. Thao tác Hủy phiếu (Cancel - Status chuyển từ 0 -> 2)
*   Do phiếu đang ở bản Nháp (status = 0), nó chưa từng gây ra bất kỳ thay đổi nào trong bảng `Stock_Units`.
*   Khi nhân viên bấm Hủy, hệ thống chỉ đơn giản cập nhật bảng `Inventory_DOCs` thành `status = 2`. Không có sự dịch chuyển tồn kho nào xảy ra.

---

## 3. Quy trình Thực hiện (Luồng giao diện - UI Flow)

1. **Truy cập Danh sách:** Nhân viên vào màn hình "Quản lý Kho", lọc danh sách các phiếu có trạng thái "Chờ duyệt".
2. **Xem chi tiết:** Nhấn vào biểu tượng "Con mắt" (View) để mở Modal xem chi tiết phiếu kho.
3. **Kiểm tra thông tin:** Màn hình Modal hiển thị:
   - Thông tin chung: Mã phiếu, Loại phiếu, Người lập, Ngày lập.
   - Danh sách chi tiết: Tên sản phẩm, Mã Serial/IMEI, Đơn giá.
4. **Ra quyết định:**
   - **Nhấn "Duyệt Phiếu":**
     - Hệ thống bật hộp thoại xác nhận (Confirm): *"Bạn có chắc chắn muốn DUYỆT phiếu này? Thao tác này sẽ cập nhật tồn kho."*
     - Nếu đồng ý, gọi API PUT, đóng Modal, hiển thị thông báo thành công và load lại danh sách.
   - **Nhấn "Hủy Phiếu":**
     - Hệ thống bật hộp thoại xác nhận.
     - Nếu đồng ý, gọi API PUT để đổi trạng thái thành Hủy. Đóng Modal và load lại danh sách.
5. **Ghi chú giao diện:** Các nút "Duyệt" và "Hủy" chỉ được hiển thị (render) khi `selectedDoc.status === 0`. Đối với các phiếu đã duyệt hoặc đã hủy, các nút này tự động bị ẩn.

---

## 4. Thiết kế API Backend

**Endpoint:** `PUT /api/inventory/docs/:id/status`

- **Yêu cầu xác thực:** Bearer Token (Role: Staff).
- **Body Data:**
  ```json
  {
    "status": 1  // 1 để Duyệt, 2 để Hủy
  }
  ```
- **Xử lý Logic (Controller):**
  1. Kiểm tra sự tồn tại của phiếu.
  2. Truy vấn lấy trạng thái hiện tại của phiếu.
  3. **Validation Rules:** Nếu trạng thái hiện tại khác `0`, trả về lỗi HTTP 400 *"Chỉ có thể Duyệt/Hủy phiếu đang ở trạng thái Chờ duyệt"*.
  4. Thực hiện Update câu lệnh SQL đơn giản: `UPDATE Inventory_DOCs SET status = @status WHERE doc_id = @id`.
  5. Trả về Response thành công. (Mọi logic phức tạp về tồn kho đã được Trigger DB lo).

---

## 5. Rủi ro & Lưu ý thiết kế

- **Lỗi Validation từ Database Trigger:** Khi Duyệt Phiếu Xuất, nếu Trigger phát hiện Serial không đủ điều kiện (ví dụ: máy đã bị xuất cho một đơn khác trước đó), Trigger sẽ tung ra lỗi `RAISERROR` và Rollback. Backend NodeJS cần phải `catch` được lỗi này từ SQL Server và hiển thị cảnh báo thân thiện lên màn hình UI cho nhân viên biết chính xác mã Serial nào đang gặp vấn đề.
- **Race Condition (Tranh chấp đồng thời):** Tránh trường hợp 2 nhân viên cùng lúc mở 1 phiếu và cùng nhấn "Duyệt". Việc check `currentStatus === 0` trước khi thực hiện UPDATE ở phía Backend đã giải quyết được một phần rủi ro này.
- **Không cho phép sửa đổi:** Một phiếu đã "Chờ duyệt" thì nhân viên không thể thêm bớt mã Serial. Nếu phát hiện nhập sai, họ bắt buộc phải **"Hủy Phiếu"** và tạo một phiếu mới hoàn toàn. Điều này tuân thủ tính nghiêm ngặt của quy trình kế toán kho.
