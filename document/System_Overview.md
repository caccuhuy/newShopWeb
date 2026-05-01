# Tổng Quan Hệ Thống: Hệ Thống Quản Lý Kho và Bán Hàng Trực Tuyến

## 1. Mô Tả Chung Về Hệ Thống
Hệ thống là một giải pháp hợp nhất giữa Bán hàng trực tuyến (E-commerce) và Quản lý kho chi tiết (Inventory Management), được thiết kế chuyên biệt cho các mặt hàng thiết bị điện tử có giá trị cao.

### Mục tiêu cốt lõi
Xây dựng nền tảng quản lý thực thể sản phẩm theo đơn vị vật lý duy nhất thông qua mã Serial/IMEI, tối ưu hóa tốc độ truy vấn và dung lượng lưu trữ (Lean Database).

### Điểm khác biệt và đặc trưng
- **Quản lý chính xác thực thể sản phẩm:** Truy xuất chính xác một chiếc máy cụ thể đã bán cho ai, nhập từ nhà cung cấp nào và lịch sử bảo hành ra sao bằng Serial/IMEI.
- **Tính toàn vẹn dữ liệu (Database-centric):** Vận hành dựa trên trạng thái máy tập trung tại Database. Sử dụng các Trigger tự động để điều khiển trạng thái thiết bị (Sẵn có, Chờ giao, Đã bán, Bảo hành) nhằm ngăn chặn sai sót từ phía ứng dụng (Backend).
- **Tính minh bạch và bất biến:** Mọi biến động kho đều phải đi kèm với chứng từ (Inventory_DOCs) và không thể sửa đổi sau khi đã duyệt, tạo ra một nhật ký giao dịch (Log) đáng tin cậy phục vụ kiểm toán.
- **Tối ưu hóa bằng AI:** Tích hợp mô hình AI để gợi ý sản phẩm bán kèm và dự báo tồn kho, tối ưu quá trình chốt sale của nhân viên.

---

## 2. Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo **Kiến trúc 3 lớp (3-Tier Architecture)** kết hợp với **AI Microservice**:
- **Frontend (Boundary):** Xây dựng bằng React. Giao diện thân thiện, hỗ trợ thao tác nhanh cho nhân viên bán hàng (tích hợp phím tắt, máy quét mã vạch giả lập bàn phím).
- **Backend (Control):** Xây dựng bằng Node.js. Chịu trách nhiệm xử lý logic nghiệp vụ, xác thực thanh toán, giao tiếp với cơ sở dữ liệu và chuyển tiếp yêu cầu tới dịch vụ AI.
- **AI Service:** Xây dựng bằng Flask (Python). Cung cấp API gợi ý sản phẩm dựa trên thuật toán thu thập thói quen mua sắm. Cấu trúc thiết kế xử lý bất đồng bộ (Asynchronous API) để không làm chậm giao diện chính.
- **Database (Entity):** Quản trị bằng **SQL Server**. Tối ưu hóa Lean Database. Sử dụng các ràng buộc (Constraints), Trigger và SQL Agent Jobs để dọn dẹp dữ liệu, đảm bảo tốc độ phản hồi truy vấn dưới 2 giây.

---

## 3. Phân Quyền và Người Dùng (Actors)

Hệ thống phục vụ 3 nhóm người dùng chính:

1. **Khách hàng (Customer):** Người dùng bên ngoài. Thực hiện mua sắm, tìm kiếm sản phẩm, đặt hàng, thanh toán trực tuyến, và theo dõi lịch sử hóa đơn qua giao diện web.
2. **Nhân viên (Staff):** Người dùng nội bộ. Phụ trách quản lý kho bãi (kiểm đếm, lập phiếu nhập/xuất/bảo hành), xử lý đơn hàng từ khách, và cập nhật thông tin vận hành.
3. **Quản trị viên (Manager):** Người điều hành có quyền cao nhất. Kế thừa toàn bộ quyền của Nhân viên, đồng thời quản trị nhân sự, thiết lập các thông số hệ thống, đối tác cung ứng, và theo dõi các báo cáo tổng hợp thống kê.

---

## 4. Mô Hình Dữ Liệu và Thực Thể (Domain Entities)

Hệ thống quản lý thông qua các thực thể cốt lõi sau:

- **Users (`Client`, `Staff`, `Manager`):** Dùng chung một cấu trúc tài khoản cơ bản, được phân quyền qua Role.
- **Product & ProductModel:** Thông tin về các dòng sản phẩm (Thương hiệu, cấu hình kỹ thuật dạng JSON, thời hạn bảo hành).
- **Device (Thiết bị vật lý):** Định danh duy nhất bằng `Serial/IMEI`. Chứa các trạng thái vòng đời.
- **InventoryDoc & InventoryDocDetail:** Chứng từ kho (Nhập/Xuất/Trả hàng/Bảo hành) và chi tiết từng thiết bị trong chứng từ.
- **Order & OrderItem:** Đơn đặt hàng từ phía khách hàng.
- **Invoice & Bill:** Hóa đơn tài chính, sinh ra khi giao dịch đã được thanh toán hoàn tất.
- **Supplier:** Thông tin nhà cung cấp phục vụ bảo hành và nhập hàng.
- **Statistical Entities (`ProductStat`, `ClientStat`, `SalesStat`):** Phục vụ cho báo cáo tổng hợp.

### Quản lý trạng thái (State Management)

**Trạng thái thiết bị (Device Status):**
- *Sẵn có:* Thiết bị đang trong kho, sẵn sàng bán (Kích hoạt khi duyệt Phiếu Nhập/Trả hàng).
- *Chờ giao:* Thiết bị đã gán cho một đơn hàng (Kích hoạt khi duyệt Phiếu Xuất).
- *Đã bán:* Đã giao và thanh toán thành công (Kích hoạt khi xác nhận thanh toán).
- *Bảo hành:* Đang được gửi đi bảo hành chính hãng (Kích hoạt khi duyệt Phiếu Bảo hành).

**Trạng thái Chứng từ kho (Inventory Doc Status):**
- *Chờ duyệt:* Phiếu vừa tạo, chưa làm thay đổi trạng thái trong kho.
- *Đã duyệt:* Phiếu được quản lý/nhân viên xác nhận, trạng thái thiết bị trong kho đã cập nhật (Không thể hoàn tác trạng thái thiết bị).
- *Đã hủy:* Phiếu bị hủy. Dữ liệu phiếu vẫn được lưu trữ để phục vụ đối soát, nhưng không tác động đến tồn kho.

---

## 5. Các Chức Năng Cốt Lõi (Core Use Cases)

### Nhóm chức năng của Khách hàng (Customer)
| Tên chức năng | Mô tả |
|---|---|
| **Đặt hàng** | Thêm sản phẩm vào giỏ, nhập thông tin giao hàng và xác nhận đặt mua. |
| **Thanh toán** | Thực hiện thanh toán điện tử (Ví điện tử, Thẻ ngân hàng, QR Code) để hoàn tất. |
| **Tra cứu hóa đơn** | Xem lại lịch sử mua sắm và chi tiết các đơn hàng cũ. |
| **Cập nhật hồ sơ** | Thay đổi địa chỉ, số điện thoại, mật khẩu cá nhân. |

### Nhóm chức năng của Nhân viên (Staff)
| Tên chức năng | Mô tả |
|---|---|
| **Xử lý đơn hàng** | Tiếp nhận đơn đặt hàng từ khách, tạo phiếu xuất kho tương ứng để giữ hàng. Hủy đơn nếu có vấn đề (hết hàng, sai thông tin). |
| **Lập phiếu kho** | Tạo các chứng từ Nhập, Xuất, Trả hàng, Bảo hành. Lựa chọn các mã Serial cụ thể vào phiếu. |
| **Duyệt / Hủy phiếu kho** | Xác nhận phiếu để hệ thống tự động cập nhật trạng thái kho. Có thể hủy các giao dịch lỗi để lưu vết. |
| **Truy xuất thông tin** | Tìm kiếm, lọc và tra cứu lịch sử thay đổi của từng phiếu kho hoặc số Serial cụ thể. |

### Nhóm chức năng của Quản trị viên (Manager)
| Tên chức năng | Mô tả |
|---|---|
| **Quản lý nhân sự** | Thêm, sửa, xóa, khóa tài khoản nhân viên. Thiết lập mật khẩu mặc định cho người mới. |
| **Theo dõi báo cáo** | Xem bảng thống kê doanh thu, tồn kho(kết xuất JSON sang biểu đồ). |
| **Cấu hình hệ thống** | Quản lý nhà cung cấp, loại sản phẩm, thương hiệu (kèm chức năng tự kiểm tra ràng buộc trước khi xóa). |

---

## 6. Quy Trình Nghiệp Vụ Điển Hình (Workflows)

### 6.1. Quy trình Mua hàng & Xử lý đơn hàng
1. **Khách hàng đặt hàng:** Truy cập web -> Tìm kiếm sản phẩm -> Đặt hàng -> Hệ thống xếp đơn vào hàng đợi, báo nhân viên.
2. **Nhân viên tiếp nhận:** Nhân viên xác nhận đơn -> Lập **Phiếu Xuất** kèm các mã Serial cụ thể -> Hệ thống giữ hàng (trạng thái *Chờ giao*).
3. **Thanh toán:** Khách hàng thanh toán qua cổng điện tử hoặc tiền mặt khi nhận hàng.
4. **Hoàn tất:** Xác nhận thanh toán thành công -> Đơn chuyển thành **Hóa đơn (Bill)** -> Mã Serial chuyển thành *Đã bán*.

### 6.2. Quy trình Quản lý Chứng từ kho (Bất biến)
1. **Tạo mới:** Nhân viên lập phiếu (Nhập/Xuất/Trả/Bảo hành) -> Lưu ở trạng thái *Chờ duyệt*.
2. **Xác nhận:** Nhân viên/Quản lý kiểm tra tính hợp lệ -> Nhấn *Duyệt*.
3. **Thực thi:** Hệ thống (thông qua SQL Server Trigger) tự động đối chiếu các quy tắc logic -> Chuyển đổi trạng thái mã Serial trong kho (vd: *Bảo hành*, *Sẵn có*).
4. **Hủy phiếu (Ngoại lệ):** Nếu phát hiện sai sót, người dùng chọn *Hủy*. Nếu phiếu đang *Chờ duyệt*, nó bị hủy ngay. Nếu *Đã duyệt*, trạng thái phiếu là *Đã hủy* (ghi rõ lý do) nhưng trạng thái Serial trong Database sẽ không bị đảo ngược tự động, yêu cầu nhân viên phải tạo một chứng từ điều chỉnh tương ứng.
