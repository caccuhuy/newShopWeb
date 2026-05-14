# Danh sách API newShopWeb

Dưới đây là danh sách đầy đủ 41 API được phân loại theo từng module, đã được tài liệu hóa bằng Swagger.

## 1. Sản phẩm (Products)
- `GET /api/products`: Lấy danh sách tất cả sản phẩm (Admin/Staff view).
- `GET /api/products/:id`: Lấy thông tin chi tiết một sản phẩm.
- `POST /api/products`: Thêm sản phẩm mới (Admin - hỗ trợ upload ảnh).
- `PUT /api/products/:id`: Cập nhật sản phẩm (Admin - hỗ trợ upload ảnh).
- `DELETE /api/products/:id`: Xóa sản phẩm (Admin).

## 2. Sản phẩm Khách hàng (Customer Products)
- `GET /api/customer-products`: Lấy danh sách sản phẩm hiển thị cho khách hàng (có trạng thái tồn kho).
- `GET /api/customer-products/search`: Tìm kiếm và lọc sản phẩm theo từ khóa, danh mục, giá.

## 3. Xác thực (Authentication)
- `POST /api/auth/login`: Đăng nhập hệ thống (Email & Password).
- `POST /api/auth/register`: Đăng ký tài khoản khách hàng mới.

## 4. Hồ sơ Khách hàng (Customer Profile)
- `GET /api/customers/profile`: Lấy thông tin hồ sơ của khách hàng hiện tại.
- `PUT /api/customers/profile`: Cập nhật thông tin cá nhân và mật khẩu.

## 5. Đơn hàng (Orders) - Dành cho Nhân viên
- `GET /api/orders`: Lấy danh sách toàn bộ đơn hàng.
- `GET /api/orders/:id`: Chi tiết đơn hàng và thông tin khách hàng.
- `GET /api/orders/:id/check-stock`: Kiểm tra tồn kho và lấy số Serial khả dụng.
- `POST /api/orders/:id/export`: Xử lý xuất kho cho đơn hàng (Tạo phiếu xuất nháp).
- `PUT /api/orders/:id/status`: Cập nhật trạng thái đơn hàng (pending, processing, shipped, completed, cancelled).

## 6. Đơn hàng Khách hàng (Customer Orders)
- `POST /api/customer-orders`: Đặt hàng mới từ giỏ hàng.
- `GET /api/orders/my-orders`: Lấy danh sách lịch sử mua hàng cá nhân (Endpoint mới có tích hợp View/SP chuẩn hóa).
- `GET /api/orders/my-orders/:id`: Lấy chi tiết đơn hàng cá nhân an toàn (Endpoint mới).

## 7. Danh mục (Categories)
- `GET /api/categories`: Lấy danh sách danh mục sản phẩm.
- `POST /api/categories`: Thêm danh mục mới (Admin).
- `PUT /api/categories/:id`: Cập nhật tên danh mục (Admin).
- `DELETE /api/categories/:id`: Xóa danh mục (Admin - kiểm tra ràng buộc sản phẩm).

## 8. Nhà cung cấp (Suppliers)
- `GET /api/suppliers`: Danh sách nhà cung cấp.
- `POST /api/suppliers`: Thêm nhà cung cấp mới (Admin).
- `PUT /api/suppliers/:tax_id`: Cập nhật thông tin nhà cung cấp (Admin).
- `DELETE /api/suppliers/:tax_id`: Xóa nhà cung cấp (Admin - kiểm tra ràng buộc phiếu kho).

## 9. Quản lý kho (Inventory)
- `GET /api/inventory/docs`: Danh sách các phiếu nhập/xuất kho.
- `GET /api/inventory/docs/:id`: Chi tiết phiếu kho và danh sách Serial.
- `POST /api/inventory/validate-serial`: Kiểm tra Serial hợp lệ để nhập/xuất.
- `POST /api/inventory/docs`: Lập phiếu kho mới (Nhập/Xuất/Trả hàng...).
- `PUT /api/inventory/docs/:id/details`: Cập nhật chi tiết cho phiếu nháp.
- `PUT /api/inventory/docs/:id/status`: Duyệt (Approve) hoặc Hủy (Cancel) phiếu kho.

## 10. Nhân viên (Staff)
- `GET /api/staff`: Danh sách nhân viên và quản trị viên (Admin).
- `POST /api/staff`: Thêm nhân viên mới với mật khẩu mặc định (Admin).
- `PUT /api/staff/:id/status`: Khóa hoặc mở khóa tài khoản nhân viên (Admin).
- `PUT /api/staff/:id/reset-password`: Reset mật khẩu cho nhân viên (Admin).

## 11. Phân tích & Nhật ký (Analytics & Logs)
- `GET /api/analytics/dashboard`: Thống kê KPI, biểu đồ doanh thu và hàng sắp hết.
- `GET /api/analytics/low-stock`: Danh sách toàn bộ sản phẩm có tồn kho thấp (<= 10).
- `GET /api/logs`: Lấy nhật ký hoạt động của toàn hệ thống (Admin).
- `POST /api/logs`: Ghi nhận hoạt động mới vào hệ thống.

---
*Tất cả API đã được tích hợp Swagger UI tại: `http://localhost:5000/api-docs`*
