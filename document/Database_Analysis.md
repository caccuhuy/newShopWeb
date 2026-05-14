# Phân Tích Cơ Sở Dữ Liệu Hiện Tại (Database Analysis)

Tài liệu này trình bày kết quả đối chiếu giữa **Cấu trúc Cơ sở dữ liệu (Database Schema)** hiện tại đang triển khai trên SQL Server và **Đặc tả yêu cầu hệ thống** được định nghĩa trong các file tài liệu (`System_Overview.md`, `UC_M01`, `UC_M02`, `UC_M03`, `Admin_Staff_UseCases.md`).

## 1. UC_M01: Quản lý nhân sự (Staff Management)
- **Yêu cầu (Tài liệu):** Cần một cột `status` hoặc `is_active` trong bảng `Users` để phục vụ chức năng "Xóa mềm" (Soft Delete) / Khóa tài khoản nhân viên. Tài liệu có ghi chú "SQL Server chưa có có cột is_active".
- **Thực tế (Database):** Qua kiểm tra thực tế, bảng `Users` **ĐÃ CÓ SẴN** cột `is_active` với kiểu dữ liệu `bit`.
- **Kết luận:** DB đã đáp ứng đúng và đủ yêu cầu phân quyền và vô hiệu hóa tài khoản. Không cần thay đổi DB.

## 2. UC_M02: Theo dõi báo cáo (Dashboard & Analytics)
- **Yêu cầu (Tài liệu):** Truy vấn danh sách "Sản phẩm cảnh báo tồn kho thấp" bằng câu lệnh `SELECT ... stock_quantity FROM Product`. Điều này ngụ ý bảng `Product` có sẵn cột `stock_quantity`.
- **Thực tế (Database):** Bảng `Product` **KHÔNG** có cột `stock_quantity`. Tuy nhiên, điều này lại hoàn toàn phù hợp với triết lý thiết kế ở phần *Tổng quan hệ thống* (Quản lý thiết bị qua Serial/IMEI). Số lượng tồn kho thực tế được hệ thống tự động tổng hợp đếm (COUNT) từ bảng `Stock_Units` (với các thiết bị đang có `status = 1` - Sẵn có).
- **Kết luận:** Thiết kế DB hiện tại (Lean Database) là đúng đắn và chặt chẽ hơn so với câu SQL minh họa trong file tài liệu. Hệ thống backend hiện cũng đang dùng subquery/join với `Stock_Units` để lấy số lượng tồn kho. Không cần thêm cột `stock_quantity` vào `Product` để tránh dư thừa và sai lệch dữ liệu.

## 3. UC_M03: Cấu hình hệ thống (System Configuration)
- **Yêu cầu (Tài liệu):** Bảng `Product` có các trường: `product_id`, `product_name`, `cat_id`, `specs_json`, `unit_price`, `brand`, `warranty_period`, `image_url`.
- **Thực tế (Database):** Hầu hết các trường đều khớp hoàn toàn. Tuy nhiên, có một lỗi chính tả (typo) ở trường thời gian bảo hành: Tên cột hiện tại đang là `waraty_period` (thiếu chữ 'r' và 'n') thay vì `warranty_period`.
- **Yêu cầu (Tài liệu về Ràng buộc - Foreign Keys):** Chặn xóa cứng (Hard delete) các danh mục nếu chúng đã có dữ liệu liên kết.
- **Thực tế (Database):** Các ràng buộc khóa ngoại (Foreign Keys) đã được thiết lập rất đầy đủ và an toàn:
  - `FK_Product_Category`: Chặn xóa Category nếu đang có Product.
  - `FK_Detail_Supplier`: Chặn xóa Supplier nếu đã có hóa đơn/phiếu nhập (`DOC_Details`).
  - `FK__Order_Det__produ__...`: Chặn xóa Product nếu đã có Order.
- **Kết luận:** Các ràng buộc toàn vẹn dữ liệu được thực thi rất tốt. Chỉ cần sửa lỗi chính tả tên cột trong bảng `Product`.

## 4. UC_S01 & UC_S02: Xử lý kho và Serial (Staff Use Cases)
- **Yêu cầu (Tài liệu):** Nhân viên thao tác xuất/nhập kho dựa trên việc quét mã Serial cụ thể thay vì chỉ trừ số lượng ảo.
- **Thực tế (Database):** Bảng `Inventory_DOCs` (Phiếu kho) và `DOC_Details` lưu chi tiết mã `serial_number`. Trạng thái thực tế từng máy nằm ở bảng `Stock_Units`. 
- **Kết luận:** Mô hình dữ liệu được thiết kế rất tối ưu và đáp ứng hoàn hảo các quy trình nghiệp vụ phức tạp của nhân viên kho.

---

> [!WARNING]
> ## Các thay đổi cần thực hiện (Proposed Changes)
> Dựa trên phân tích, CSDL hiện tại cực kỳ chuẩn xác và bám sát tài liệu đặc tả, ngoại trừ một lỗi nhỏ về tên cột.
>
> 1. **Đổi tên cột bảng Product**: Chạy lệnh SQL để đổi tên cột `waraty_period` thành `warranty_period` trong bảng `Product` để code backend/frontend sau này được tường minh và nhất quán với tài liệu.
> 
> ```sql
> EXEC sp_rename 'Product.waraty_period', 'warranty_period', 'COLUMN';
> ```
> 
> 2. Cần phải kiểm tra lại Backend (các file trong `routes/products.js`) xem có đang sử dụng tên `waraty_period` hay không. Nếu có, cần sửa lại code Backend sau khi đã đổi tên cột Database.
