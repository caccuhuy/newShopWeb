# Phân Tích Chi Tiết UC_S02: Lập chứng từ kho (Create Inventory Document)

## 1. Tổng quan
- **Mô tả:** Chức năng cho phép nhân viên tạo mới các phiếu nghiệp vụ kho như: Nhập kho (từ nhà cung cấp), Xuất kho (bán hàng), Trả hàng (khách trả lại), hoặc Nhận/Trả Bảo hành. Đây là bước đầu tiên trong quy trình kiểm soát thay đổi số lượng và trạng thái vật lý của hàng hóa.
- **Vai trò (Actor):** Nhân viên (Staff).
- **Tiền điều kiện:** 
  - Nhân viên đã đăng nhập và được cấp quyền `Staff`.
- **Hậu điều kiện:** 
  - Một phiếu kho mới (Inventory_DOCs) được tạo ra với trạng thái là **"Chờ duyệt" (Draft/Pending - Status 0)**. 
  - Trạng thái hàng hóa thực tế trong kho (Stock_Units) **chưa bị thay đổi**. Sự thay đổi chỉ diễn ra khi phiếu được duyệt ở `UC_S03`.

---

## 2. Các Bảng Dữ Liệu (Database Tables) Liên Quan
- `Inventory_DOCs`: Chứa thông tin chung của phiếu kho (Mã phiếu, Loại phiếu `doc_type`, Trạng thái, Người lập, Ngày lập, Tham chiếu đến Đơn hàng hoặc Nhà cung cấp).
- `DOC_Details`: Chứa chi tiết từng thiết bị vật lý tham gia vào giao dịch. Bảng này liên kết trực tiếp một Mã phiếu (`doc_id`) với một số Serial cụ thể (`serial_number`) và Sản phẩm (`product_id`).
- `Stock_Units`: Được dùng để đối chiếu trạng thái hiện tại của số Serial nhằm đảm bảo tính hợp lệ trước khi cho phép thêm vào phiếu (VD: Xuất kho thì Serial phải đang rảnh, Nhập kho thì Serial chưa từng tồn tại).
- `Orders` / `Suppliers`: Các bảng tham chiếu cung cấp thông tin nguồn gốc hoặc đích đến của giao dịch.

---

## 3. Luồng Nghiệp Vụ Chi Tiết (Detailed Workflows)

### 3.1. Luồng Chính (Happy Path)
1. **Khởi tạo Phiếu (Initialize Document):**
   - Nhân viên chọn chức năng tạo phiếu kho mới trên giao diện.
   - Chọn **Loại phiếu (Document Type):**
     - `1`: Nhập kho (Goods Receipt)
     - `2`: Xuất kho (Goods Issue)
     - `3`: Trả NCC (Return to Vendor)
     - `4`: Nhận bảo hành (Receive for Warranty)
     - `6`: NCC trả bảo hành (Vendor Returns Warranty)
     - `7`: Trả bảo hành cho khách (Return Warranty to Customer)
   - Hệ thống tự động sinh Mã phiếu (`doc_id`).
2. **Chọn Đối Tượng Tham Chiếu (Select Reference):**
   - Nếu là Nhập kho (`doc_type = 1`), yêu cầu chọn `Suppliers_tax_id` (Nhà cung cấp).
   - Nếu là Xuất bán (`doc_type = 2`), yêu cầu chọn `order_ref` (Mã đơn hàng).
3. **Quét / Nhập mã Serial (Scan Serials):**
   - Đây là bước cốt lõi. Nhân viên sử dụng máy quét mã vạch hoặc nhập tay các số `serial_number`.
   - Mỗi khi một số Serial được nhập, hệ thống sẽ thực hiện Validation (xem phần Rẽ nhánh).
   - Nếu hợp lệ, hệ thống tạm lưu thông tin Serial, `product_id` tương ứng vào danh sách chi tiết của phiếu (UI state).
4. **Lưu Phiếu (Save Document):**
   - Nhân viên bấm "Lưu Phiếu".
   - Hệ thống (Backend) bắt đầu Transaction:
     - `INSERT INTO Inventory_DOCs ... status = 0`
     - `INSERT INTO DOC_Details ...` cho toàn bộ danh sách Serial.
   - Phiếu được lưu thành công và chuyển sang trạng thái "Chờ duyệt".

### 3.2. Luồng Rẽ Nhánh (Edge Cases & Validation Exceptions)
Hệ thống cần kiểm tra chặt chẽ tính hợp lệ của số Serial tại Bước 3 dựa trên `doc_type`:
- **Trường hợp Nhập kho mới (`doc_type = 1`):**
  - *Validation:* Mã Serial **không được phép tồn tại** trong hệ thống (hoặc nếu tồn tại phải ở trạng thái lỗi/trả).
  - *Lỗi:* "Số Serial này đã có trong kho, không thể nhập mới."
- **Trường hợp Xuất kho bán (`doc_type = 2`):**
  - *Validation:* Mã Serial phải có sẵn trong `Stock_Units` và `status = 1` (Sẵn sàng).
  - *Lỗi:* "Số Serial này không khả dụng để xuất bán."
- **Trường hợp Nhận bảo hành (`doc_type = 4`):**
  - *Validation:* Máy phải là máy do cửa hàng bán ra (đã từng xuất kho thành công, `status = 3` - Đã bán).
  - *Lỗi:* "Máy này không phải do hệ thống bán ra hoặc chưa được kích hoạt."
- **Trùng lặp Serial trong cùng một phiếu:**
  - *Validation:* Không cho phép nhập hai lần cùng một mã Serial trong một phiếu.
  - *Lỗi:* "Mã Serial này đã được quét trong danh sách."

---

## 4. Yêu cầu API (Backend Endpoints)
- `POST /api/inventory/docs`: API để lưu phiếu mới. Body nhận vào:
  ```json
  {
    "doc_type": 2,
    "order_ref": "ORD-12345",
    "description": "Xuất bán cho khách hàng X",
    "details": [
      { "product_id": 10, "serial_number": "SN-1111", "unit_price": 5000000 },
      { "product_id": 15, "serial_number": "SN-2222", "unit_price": 3000000 }
    ]
  }
  ```
- `GET /api/inventory/validate-serial`: API phụ trợ gọi mỗi khi quét mã vạch để UI báo lỗi ngay lập tức nếu Serial không đúng quy chuẩn hoặc sai trạng thái kho.

---

## 5. Rủi ro & Lưu ý thiết kế
- **Toàn vẹn Dữ liệu (Data Integrity):** Việc ghi nhận dữ liệu vào `Inventory_DOCs` và `DOC_Details` phải được thực hiện trong một Transaction (`BEGIN TRAN ... COMMIT`). Nếu có lỗi xảy ra ở bất kỳ bản ghi chi tiết nào, toàn bộ quá trình tạo phiếu phải được rollback.
- **Trạng thái "Chờ Duyệt" (Status 0):** Phiếu kho ở trạng thái chờ duyệt **không** được làm thay đổi số lượng tồn kho `quantity` trên bảng `Product` hay `status` trên bảng `Stock_Units`. Điều này đảm bảo rằng nếu phiếu bị hủy bỏ, kho hàng không bị ảnh hưởng.
- **Xung đột khi lập phiếu đồng thời:** Cần đề phòng trường hợp 2 nhân viên cùng lúc quét cùng một số Serial cho 2 Phiếu xuất kho khác nhau. 
  - *Giải pháp:* Tại thời điểm Submit lưu phiếu (`POST`), Backend cần kiểm tra lại một lần nữa trạng thái của toàn bộ Serial (Ví dụ: kiểm tra xem Serial đó có đang nằm trong một phiếu Xuất chờ duyệt nào khác không). Hoặc có thể sử dụng cơ chế tạm khóa Serial ngay khi nó được đưa vào Phiếu nháp.
