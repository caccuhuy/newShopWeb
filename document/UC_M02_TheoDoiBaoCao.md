# UC_M02: Theo dõi báo cáo (Dashboard & Analytics)

## 1. Thông tin chung
- **Tác nhân chính:** Quản trị viên (Admin).
- **Mô tả tóm tắt:** Cho phép Quản trị viên theo dõi các chỉ số kinh doanh quan trọng của hệ thống (doanh thu, đơn hàng, tồn kho) thông qua các biểu đồ trực quan, từ đó đưa ra các quyết định kinh doanh hoặc nhập xuất kho.
- **Tiền điều kiện:** Người dùng đã đăng nhập thành công vào hệ thống quản trị với vai trò `Admin`.
- **Hậu điều kiện:** Không có (đây là thao tác đọc, không làm thay đổi trạng thái dữ liệu hệ thống).

## 2. Phân tích Dữ liệu
### Dữ liệu đầu vào (Input từ thao tác người dùng)
- **Bộ lọc thời gian (Time range filter):** Tiêu chí lọc khoảng thời gian để xem thống kê (Ví dụ: 7 ngày qua, 30 ngày qua, Tháng này, Năm nay, hoặc Tùy chọn khoảng ngày cụ thể từ ngày - đến ngày).
- **Loại báo cáo:** Người dùng có thể tương tác (click) vào các vùng trên biểu đồ hoặc menu để chuyển đổi góc nhìn (VD: xem chi tiết theo Hãng hay theo Danh mục).

### Dữ liệu đầu ra (Output hiển thị trên màn hình)
- **Tổng quan chỉ số (KPI Cards):** 
  - Tổng doanh thu (VNĐ).
  - Tổng số đơn hàng (đã bán).
  - Tổng số khách hàng mới đăng ký.
  - Số lượng đầu sản phẩm đang cạn kho.
  *(Các chỉ số này có thể kèm theo % tăng/giảm so với kỳ trước để dễ so sánh).*
- **Biểu đồ Doanh thu (Revenue Chart):** Dữ liệu chuỗi thời gian (Time-series data) thể hiện dưới dạng Line Chart (Biểu đồ đường) hoặc Bar Chart (Biểu đồ cột) hiển thị xu hướng theo thời gian (Ngày/Tuần/Tháng).
- **Danh sách cảnh báo (Low Stock Alerts):** Bảng danh sách các sản phẩm có số lượng tồn kho thấp dưới mức an toàn cần nhập thêm.

## 3. Luồng sự kiện chính (Main Success Scenario)
1. Quản trị viên chọn mục **"Dashboard"** (hoặc **"Báo cáo tổng quan"**) trên thanh điều hướng (Sidebar).
2. Frontend gửi các API Request đồng thời (Promise.all) yêu cầu dữ liệu thống kê từ Backend (mặc định mốc thời gian là 30 ngày gần nhất).
3. Backend tiếp nhận request, tiến hành truy vấn các bảng: `Orders`, `Products`, `Users`.
4. Backend tổng hợp, tính toán số liệu và trả về kết quả dưới dạng cấu trúc JSON định dạng chuẩn.
5. Frontend nhận dữ liệu, sử dụng các thư viện vẽ biểu đồ (như Recharts, Chart.js) để render các thành phần UI.
6. Hệ thống hiển thị đầy đủ giao diện Dashboard bao gồm:
   - Các thẻ KPI tổng quan.
   - Biểu đồ biến động doanh thu.
   - Danh sách sản phẩm cần nhập thêm hàng.

## 4. Luồng rẽ nhánh & Ngoại lệ (Alternative Flows)
- **Ngoại lệ 1 (Không có dữ liệu trong khoảng thời gian lọc):** Nếu Admin chọn một khoảng thời gian chưa có giao dịch nào, hệ thống trả về mảng rỗng cho phần doanh thu. Biểu đồ hiển thị trạng thái "Empty State" (Ví dụ: "Chưa có dữ liệu thống kê cho thời gian này") thay vì hiển thị lỗi hoặc biểu đồ rỗng gây hiểu nhầm.
- **Ngoại lệ 2 (Lỗi kết nối hoặc Backend lỗi truy vấn):** Nếu quá trình truy xuất CSDL thất bại, Frontend bắt lỗi và hiển thị Modal/Toast thông báo: "Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.", đồng thời giữ nguyên giao diện Skeleton loading hoặc hiện biểu tượng cảnh báo lỗi kết nối tại vị trí biểu đồ.
- **Rẽ nhánh 1 (Thay đổi bộ lọc thời gian):** Khi Admin thao tác thay đổi mốc thời gian trên bộ lọc (Date Picker), hệ thống sẽ kích hoạt lại bước 2 để fetch dữ liệu mới, hiển thị trạng thái Loading nhẹ trên các component biểu đồ, sau đó cập nhật dữ liệu với hiệu ứng transition mượt mà.

## 5. Quy tắc nghiệp vụ & Ràng buộc (Business Rules)
1. **Phân quyền (RBAC):** Chỉ tài khoản có `role = Admin` mới được phép gọi các API lấy dữ liệu thống kê doanh thu và khách hàng. Nếu `Staff` gọi API này, Backend phải trả về lỗi `403 Forbidden`. *(Lưu ý: Staff có thể được cấp quyền xem riêng báo cáo Tồn kho nếu nghiệp vụ yêu cầu)*.
2. **Tiêu chí tính doanh thu (Theo luồng Phiếu Xuất):** 
   - Một Đơn hàng (Order) chỉ được tính vào doanh thu khi Nhân viên đã tạo **Phiếu xuất kho** (`Inventory_DOCs` với `doc_type = 'XUAT'`) cho đơn hàng đó và phiếu xuất này được duyệt/hoàn thành.
   - Tuyệt đối không cộng gộp các đơn hàng đang chờ xử lý (`pending`) hoặc đã hủy (`cancelled`) vào biểu đồ doanh thu.
3. **Tiêu chí định nghĩa tồn kho thấp:** Một sản phẩm được xếp vào danh sách cảnh báo "sắp hết hàng" nếu `stock_quantity <= 10` (có thể đặt biến cấu hình `LOW_STOCK_THRESHOLD` trên hệ thống).

## 6. Yêu cầu giao diện (UI / UX)
- **Hiệu năng (Performance):** Trang tổng quan phải được tải nhanh chóng. Các truy vấn CSDL phức tạp cần được tối ưu hóa index hoặc áp dụng Redis cache nếu lượng dữ liệu lớn.
- **Trải nghiệm chờ (Loading UX):** Sử dụng hiệu ứng Skeleton Loading cho các khối KPI và Biểu đồ trong lúc chờ API trả về dữ liệu, tránh màn hình trắng hoặc giật lag.
- **Tính tương tác (Interactivity):** Các biểu đồ cần có Tooltip. Khi người dùng hover chuột vào một điểm trên Line chart, hệ thống phải hiển thị box thông tin chi tiết (Ví dụ: Ngày 15/05 - Doanh thu: 15.000.000đ - Số đơn: 5).
- **Bố cục (Layout):** Sử dụng thiết kế dạng lưới (CSS Grid) mạch lạc:
  - Row 1: Khối bộ lọc thời gian (góc phải).
  - Row 2: Khối các thẻ KPI (4 thẻ dàn ngang).
  - Row 3: Khối biểu đồ Doanh thu (chiếm toàn bộ chiều ngang hoặc kết hợp với KPI).
  - Row 4: Khối danh sách Data Table cảnh báo tồn kho.

## 7. Yêu cầu Cấu trúc DB & Truy vấn (Backend Implementation Notes)
Để phục vụ use case này, luồng dữ liệu yêu cầu phải có bảng `Orders` để lưu đơn hàng gốc, liên kết với `Inventory_DOCs` (Phiếu kho).
- **Doanh thu & Số đơn:** Được tính từ bảng `Orders` với điều kiện `status = 'completed'` (hoặc có liên kết với `Inventory_DOCs` loại Xuất đã duyệt).
  `SELECT CAST(created_at AS DATE), SUM(total_amount), COUNT(order_id) FROM Orders WHERE status = 'completed' AND created_at BETWEEN @startDate AND @endDate GROUP BY CAST(created_at AS DATE)`
- **Khách hàng mới:** `SELECT COUNT(*) FROM Users WHERE role_name = 'Customer' AND created_at >= @startDate`
- **Sản phẩm cảnh báo:** `SELECT product_id, product_name, stock_quantity FROM Product WHERE stock_quantity <= @threshold ORDER BY stock_quantity ASC` (Lấy từ bảng `Product` trong ERD).
