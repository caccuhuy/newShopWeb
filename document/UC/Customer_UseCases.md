# Phân tích Chi tiết Use Case: Khách hàng (Customer)

Tài liệu này đi sâu vào việc phân tích các Use Case (ca sử dụng) dành cho đối tượng người dùng bên ngoài hệ thống là **Khách hàng (Customer)**, dựa trên kiến trúc tổng quan của dự án.

---

## 1. Vai trò Khách hàng (Customer)
Khách hàng là người tiêu dùng cuối cùng truy cập vào nền tảng E-commerce để tìm kiếm, lựa chọn sản phẩm và thực hiện giao dịch mua sắm.

### UC_C01: Quản lý Tài khoản (Account Management)
- **Mô tả chi tiết:** Use case này cho phép khách hàng tạo tài khoản mới, đăng nhập vào hệ thống, cập nhật thông tin cá nhân và quản lý bảo mật tài khoản. Bao gồm các chức năng đăng ký, đăng nhập, quên mật khẩu, và chỉnh sửa hồ sơ.
- **Người dùng chính:** Khách hàng (Customer)
- **Người dùng phụ:** Hệ thống (System)
- **Tiền điều kiện:** Khách hàng truy cập vào trang web với tư cách khách (Guest) hoặc đã có tài khoản.
- **Điều kiện hậu:** Tài khoản được tạo hoặc cập nhật thành công, khách hàng có thể truy cập các chức năng khác.
- **Luồng sự kiện chính:**
  1. Khách hàng chọn "Đăng ký" hoặc "Đăng nhập" từ menu chính.
  2. Nếu đăng ký: Nhập thông tin cá nhân (email, mật khẩu, tên, số điện thoại), hệ thống kiểm tra tính hợp lệ và tạo tài khoản.
  3. Nếu đăng nhập: Nhập email và mật khẩu, hệ thống xác thực và cấp quyền truy cập.
  4. Sau đăng nhập, khách hàng có thể truy cập "Hồ sơ cá nhân" để xem/chỉnh sửa thông tin.
  5. Khách hàng cập nhật địa chỉ giao hàng, số điện thoại, đổi mật khẩu.
  6. Hệ thống lưu thay đổi và xác nhận.
- **Luồng thay thế:**
  - Nếu quên mật khẩu: Khách hàng chọn "Quên mật khẩu", nhập email, hệ thống gửi link reset.
- **Luồng ngoại lệ:**
  - Email đã tồn tại: Hiển thị lỗi và yêu cầu nhập email khác.
  - Mật khẩu sai: Hiển thị lỗi và cho phép thử lại (tối đa 3 lần trước khi khóa tạm thời).

### UC_C02: Tìm kiếm và Lọc Sản phẩm (Search & Filter Products)
- **Mô tả chi tiết:** Use case này cho phép khách hàng tìm kiếm sản phẩm bằng từ khóa, danh mục, hoặc bộ lọc nâng cao. Hệ thống sử dụng AI để gợi ý sản phẩm liên quan dựa trên lịch sử mua sắm.
- **Người dùng chính:** Khách hàng (Customer)
- **Người dùng phụ:** Hệ thống (System), AI Engine
- **Tiền điều kiện:** Khách hàng truy cập vào giao diện mua sắm (trang chủ hoặc trang sản phẩm).
- **Điều kiện hậu:** Danh sách sản phẩm phù hợp được hiển thị, khách hàng có thể tiếp tục xem chi tiết.
- **Luồng sự kiện chính:**
  1. Khách hàng nhập từ khóa vào ô tìm kiếm hoặc chọn danh mục/thương hiệu từ menu.
  2. Hệ thống truy vấn cơ sở dữ liệu và trả về danh sách sản phẩm.
  3. Khách hàng áp dụng bộ lọc: giá, đánh giá, tính năng kỹ thuật.
  4. Hệ thống lọc và sắp xếp kết quả (theo độ liên quan, giá, mới nhất).
  5. AI gợi ý sản phẩm bán kèm hoặc dựa trên thói quen.
- **Luồng thay thế:**
  - Nếu không có kết quả: Hiển thị gợi ý sản phẩm phổ biến hoặc liên quan.
- **Luồng ngoại lệ:**
  - Từ khóa không hợp lệ: Hiển thị thông báo và gợi ý từ khóa khác.

### UC_C03: Xem Chi tiết Sản phẩm và Thêm vào Giỏ (View Product & Add to Cart)
- **Mô tả chi tiết:** Use case này cho phép khách hàng xem thông tin chi tiết của sản phẩm, bao gồm cấu hình kỹ thuật, hình ảnh, đánh giá, và thêm sản phẩm vào giỏ hàng với số lượng mong muốn.
- **Người dùng chính:** Khách hàng (Customer)
- **Người dùng phụ:** Hệ thống (System)
- **Tiền điều kiện:** Có sản phẩm hiển thị trên màn hình từ kết quả tìm kiếm hoặc danh mục.
- **Điều kiện hậu:** Sản phẩm được thêm vào giỏ hàng, số lượng cập nhật.
- **Luồng sự kiện chính:**
  1. Khách hàng nhấp vào sản phẩm cụ thể từ danh sách.
  2. Hệ thống tải trang chi tiết: hình ảnh, mô tả, cấu hình JSON, giá, tồn kho.
  3. Khách hàng xem đánh giá và bình luận từ người dùng khác.
  4. Chọn số lượng (kiểm tra tồn kho) và nhấn "Thêm vào giỏ".
  5. Hệ thống cập nhật giỏ hàng trong session hoặc database.
- **Luồng thay thế:**
  - Nếu sản phẩm hết hàng: Hiển thị thông báo và gợi ý sản phẩm thay thế.
- **Luồng ngoại lệ:**
  - Số lượng vượt quá tồn kho: Hiển thị lỗi và giới hạn số lượng tối đa.

### UC_C04: Đặt hàng (Checkout/Place Order)
- **Mô tả chi tiết:** Use case này xử lý quá trình đặt hàng từ giỏ hàng, bao gồm xác nhận thông tin giao hàng, phương thức thanh toán, và tạo đơn hàng mới trong hệ thống.
- **Người dùng chính:** Khách hàng (Customer)
- **Người dùng phụ:** Hệ thống (System), Nhân viên (Staff)
- **Tiền điều kiện:** Có ít nhất một sản phẩm trong giỏ hàng, khách hàng đã đăng nhập.
- **Điều kiện hậu:** Đơn hàng được tạo với trạng thái "Chờ xử lý", khách hàng nhận xác nhận.
- **Luồng sự kiện chính:**
  1. Khách hàng truy cập giỏ hàng và nhấn "Thanh toán".
  2. Hệ thống hiển thị tóm tắt đơn hàng: danh sách sản phẩm, tổng tiền.
  3. Khách hàng nhập/xác nhận địa chỉ giao hàng, thông tin liên hệ.
  4. Chọn phương thức giao hàng và thanh toán.
  5. Xác nhận đặt hàng.
  6. Hệ thống tạo đơn hàng trong database, gửi email xác nhận, và thông báo cho nhân viên xử lý.
- **Luồng thay thế:**
  - Nếu chưa đăng nhập: Yêu cầu đăng nhập trước khi checkout.
- **Luồng ngoại lệ:**
  - Sản phẩm hết hàng trong lúc checkout: Hủy đơn và thông báo lỗi.

### UC_C05: Thanh toán Trực tuyến (Online Payment)
- **Mô tả chi tiết:** Use case này xử lý thanh toán trực tuyến thông qua cổng thanh toán bên thứ ba, cập nhật trạng thái đơn hàng và quản lý mã serial của sản phẩm.
- **Người dùng chính:** Khách hàng (Customer)
- **Người dùng phụ:** Hệ thống (System), Cổng Thanh toán (Payment Gateway)
- **Tiền điều kiện:** Đơn hàng đã được tạo với phương thức thanh toán trực tuyến.
- **Điều kiện hậu:** Thanh toán thành công, đơn hàng cập nhật trạng thái, hóa đơn được tạo.
- **Luồng sự kiện chính:**
  1. Sau đặt hàng, hệ thống chuyển hướng đến cổng thanh toán.
  2. Khách hàng nhập thông tin thanh toán hoặc quét QR.
  3. Cổng thanh toán xử lý và gửi callback về hệ thống.
  4. Hệ thống xác nhận thanh toán, cập nhật trạng thái đơn hàng thành "Đã thanh toán".
  5. Gán mã serial cho sản phẩm và tạo hóa đơn.
- **Luồng thay thế:**
  - Thanh toán bằng ví điện tử hoặc thẻ.
- **Luồng ngoại lệ:**
  - Thanh toán thất bại: Quay lại trang thanh toán, đơn hàng giữ nguyên.

### UC_C06: Tra cứu Lịch sử Đơn hàng & Hóa đơn (Order History & Traceability)
- **Mô tả chi tiết:** Use case này cho phép khách hàng xem lịch sử đơn hàng, theo dõi trạng thái giao hàng, và truy cập chi tiết hóa đơn cùng mã serial của sản phẩm.
- **Người dùng chính:** Khách hàng (Customer)
- **Người dùng phụ:** Hệ thống (System)
- **Tiền điều kiện:** Khách hàng đã đăng nhập và có đơn hàng trước đó.
- **Điều kiện hậu:** Khách hàng nhận thông tin chi tiết về đơn hàng.
- **Luồng sự kiện chính:**
  1. Khách hàng truy cập "Lịch sử đơn hàng" từ hồ sơ cá nhân.
  2. Hệ thống liệt kê tất cả đơn hàng với trạng thái, ngày đặt, tổng tiền.
  3. Khách hàng chọn một đơn hàng để xem chi tiết: sản phẩm, trạng thái, địa chỉ giao hàng.
  4. Nếu đã hoàn tất, hiển thị mã serial của từng sản phẩm.
  5. Khách hàng có thể tải hóa đơn PDF.
- **Luồng thay thế:**
  - Nếu đơn hàng đang giao: Hiển thị thông tin tracking từ bên vận chuyển.
- **Luồng ngoại lệ:**
  - Không có đơn hàng: Hiển thị thông báo "Chưa có đơn hàng nào".
