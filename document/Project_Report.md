# BÁO CÁO DỰ ÁN HỆ THỐNG QUẢN LÝ BÁN HÀNG

---

## LỜI CẢM ƠN

Trong suốt thời gian thực hiện đồ án/dự án này, chúng em đã nhận được rất nhiều sự hỗ trợ, hướng dẫn và động viên quý báu từ các thầy cô, gia đình và bạn bè.

Trước hết, chúng em xin gửi lời cảm ơn chân thành và sâu sắc nhất đến Giảng viên hướng dẫn, người đã trực tiếp chỉ bảo, định hướng và cung cấp những kiến thức chuyên môn nền tảng vững chắc để chúng em có thể hoàn thành tốt dự án. Những lời góp ý khắt khe nhưng đầy tâm huyết của thầy/cô là kim chỉ nam giúp chúng em vượt qua những khó khăn trong quá trình phân tích và lập trình.

Chúng em cũng xin gửi lời cảm ơn đến các thầy cô trong khoa đã giảng dạy và truyền đạt cho chúng em những kiến thức từ cơ sở đến chuyên ngành trong suốt quá trình học tập. Đó là hành trang vô giá để chúng em tự tin bước vào môi trường thực tế.

Mặc dù đã cố gắng hết sức để hoàn thiện hệ thống và tài liệu báo cáo, nhưng do thời gian và kinh nghiệm thực tiễn còn hạn chế, đồ án chắc chắn không tránh khỏi những thiếu sót. Chúng em rất mong nhận được sự góp ý và đánh giá từ quý thầy cô để dự án được hoàn thiện hơn, đồng thời giúp chúng em rút ra những bài học quý giá cho con đường phát triển nghề nghiệp sau này.

Xin chân thành cảm ơn!

---

## TÓM TẮT DỰ ÁN

Dự án **Hệ thống Quản lý Bán hàng** là một nền tảng phần mềm toàn diện, kết hợp chặt chẽ giữa hệ thống Bán hàng trực tuyến (E-commerce) và Quản lý kho bãi chuyên sâu (Inventory Management). Dự án được thiết kế đặc biệt cho mô hình kinh doanh các thiết bị điện tử có giá trị cao (như điện thoại, máy tính, phụ kiện thông minh), nơi mà việc kiểm soát chính xác từng thực thể sản phẩm là bắt buộc.

Khác với các hệ thống bán hàng thông thường quản lý số lượng tồn kho theo dạng tổng, **Hệ thống** áp dụng mô hình quản lý vật lý duy nhất: mỗi thiết bị được định danh bằng một mã **Serial/IMEI** riêng biệt. Hệ thống sử dụng kiến trúc Cơ sở dữ liệu tinh gọn (Lean Database) kết hợp với các cơ chế tự động (Trigger) trong SQL Server nhằm đảm bảo tính toàn vẹn của dữ liệu và luân chuyển trạng thái thiết bị một cách khép kín (Sẵn có $\rightarrow$ Chờ giao $\rightarrow$ Đã bán). Mọi biến động trong kho đều phải dựa trên các chứng từ bất biến (Phiếu Nhập/Xuất), tạo ra một quy trình kiểm toán minh bạch.

Hệ thống được phát triển theo kiến trúc 3 lớp hiện đại:
*   **Frontend:** Xây dựng bằng thư viện React.js kết hợp Vite, mang lại trải nghiệm người dùng mượt mà, tốc độ phản hồi nhanh cho cả khách hàng mua sắm và nhân viên thao tác nghiệp vụ.
*   **Backend:** Xây dựng bằng Node.js và Express, xử lý logic nghiệp vụ, quản lý phân quyền bảo mật (JWT) và cung cấp hệ thống API RESTful.
*   **Database:** Microsoft SQL Server (MSSQL) đóng vai trò trung tâm xử lý dữ liệu và đảm bảo tính nhất quán của giao dịch (ACID).

Dự án đáp ứng đầy đủ nghiệp vụ cho 3 nhóm đối tượng: Khách hàng (Customer), Nhân viên kho/bán hàng (Staff) và Quản lý (Manager), hứa hẹn mang lại một giải pháp vận hành tối ưu, giảm thiểu sai sót nhân chuẩn và gia tăng hiệu quả kinh doanh.

---

## DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Thuật ngữ đầy đủ | Giải nghĩa |
| :--- | :--- | :--- |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **BCE** | Boundary - Control - Entity | Mô hình kiến trúc phân lớp (Giao diện - Điều khiển - Thực thể) |
| **DB** | Database | Cơ sở dữ liệu |
| **ERD** | Entity-Relationship Diagram | Biểu đồ Thực thể - Mối liên kết |
| **HTTP** | Hypertext Transfer Protocol | Giao thức truyền tải siêu văn bản |
| **IMEI** | International Mobile Equipment Identity | Mã số nhận dạng thiết bị di động quốc tế |
| **JSON** | JavaScript Object Notation | Định dạng trao đổi dữ liệu nhẹ |
| **JWT** | JSON Web Token | Tiêu chuẩn mở dùng để xác thực và trao đổi thông tin an toàn |
| **MSSQL** | Microsoft SQL Server | Hệ quản trị cơ sở dữ liệu quan hệ của Microsoft |
| **REST** | Representational State Transfer | Kiểu kiến trúc phần mềm cho các hệ thống phân tán |
| **UI/UX** | User Interface / User Experience | Giao diện người dùng / Trải nghiệm người dùng |

---

## DANH MỤC HÌNH ẢNH, BIỂU ĐỒ

*Ghi chú: Danh sách này sẽ được cập nhật số trang và liên kết sau khi chèn hình ảnh thực tế vào các chương sau.*

*   **Hình 2.1:** Biểu đồ Use Case tổng quát của hệ thống
*   **Hình 2.2:** Biểu đồ Use Case phân hệ Khách hàng (Customer)
*   **Hình 2.3:** Biểu đồ Use Case phân hệ Nhân viên (Staff) & Quản trị viên (Manager)
*   **Hình 3.1:** Sơ đồ Kiến trúc hệ thống 3 lớp
*   **Hình 3.2:** Biểu đồ Thực thể - Mối liên kết (ERD) của Cơ sở dữ liệu
*   **Hình 3.3:** Sơ đồ trạng thái của thiết bị (Device Status Lifecycle)
*   **Hình 3.4:** Sơ đồ trạng thái của chứng từ kho (Inventory Doc Lifecycle)
*   **Hình 4.1:** Giao diện Trang chủ và Danh sách sản phẩm
*   **Hình 4.2:** Giao diện Giỏ hàng và Thanh toán
*   **Hình 4.3:** Giao diện Bảng điều khiển Quản trị viên (Admin Dashboard)
*   **Hình 4.4:** Giao diện Lập phiếu Xuất/Nhập kho với tính năng quét mã vạch
*   **Hình 4.5:** Quy trình xử lý Luồng Đặt hàng (Sequence Diagram)

---

## DANH MỤC BẢNG BIỂU

*Ghi chú: Danh sách này sẽ được cập nhật số trang và liên kết sau khi hoàn thành các chương sau.*

*   **Bảng 2.1:** Danh sách tác nhân (Actors) và quyền hạn
*   **Bảng 2.2:** Đặc tả Use Case Đặt hàng trực tuyến
*   **Bảng 2.3:** Đặc tả Use Case Lập phiếu xuất/nhập kho
*   **Bảng 2.4:** Bảng phân tích yêu cầu phi chức năng (Hiệu năng, Bảo mật)
*   **Bảng 3.1:** Cấu trúc thiết kế bảng Users và phân quyền
*   **Bảng 3.2:** Cấu trúc thiết kế bảng lưu trữ trạng thái thiết bị (Device)
*   **Bảng 5.1:** Kịch bản kiểm thử (Test Case) chức năng Thanh toán đơn hàng
*   **Bảng 5.2:** Kịch bản kiểm thử (Test Case) chức năng Đối soát tồn kho Serial

---

# CHƯƠNG 1: TỔNG QUAN DỰ ÁN

## 1.1. Bối cảnh và lý do chọn đề tài

### 1.1.1. Nhu cầu quản lý bán hàng thiết bị điện tử hiện nay
Trong kỷ nguyên số hóa, sự bùng nổ của các thiết bị điện tử thông minh (điện thoại, máy tính bảng, phụ kiện công nghệ) đã thúc đẩy mạnh mẽ ngành thương mại điện tử. Người tiêu dùng ngày càng ưu tiên việc tra cứu thông tin chi tiết và đặt hàng trực tuyến do tính tiện lợi và minh bạch về giá cả. Đối với các doanh nghiệp bán lẻ, việc sở hữu một nền tảng trực tuyến (E-commerce) kết hợp quản lý kho bãi không chỉ là một lợi thế cạnh tranh mà đã trở thành yêu cầu bắt buộc để duy trì và mở rộng thị phần. 

Tuy nhiên, đặc thù của ngành hàng thiết bị điện tử là sản phẩm thường có giá trị cao, thời gian bảo hành dài hạn và yêu cầu khắt khe về nguồn gốc xuất xứ. Việc quản lý bằng các hệ thống sổ sách truyền thống hoặc phần mềm bán hàng cơ bản (chỉ đếm số lượng tổng) đã bộc lộ nhiều hạn chế, gây ra tình trạng thất thoát tài sản, khó khăn trong quá trình đối soát và giảm chất lượng dịch vụ hậu mãi.

### 1.1.2. Thách thức trong quản lý kho vật lý và truy xuất nguồn gốc (Serial/IMEI)
Điểm yếu lớn nhất của các hệ thống quản lý bán hàng phổ thông hiện nay là việc đồng nhất thông tin tồn kho giữa cửa hàng vật lý và gian hàng trực tuyến. Khi có hàng trăm, hàng ngàn sản phẩm có cùng tên gọi và mẫu mã (ví dụ: iPhone 15 Pro Max 256GB), việc quản lý số lượng tổng đơn thuần là không đủ. Doanh nghiệp cần phải biết chính xác "chiếc máy cụ thể nào" đã được nhập từ nhà cung cấp nào, tình trạng hiện tại ra sao, đã bán cho khách hàng nào và có đang trong thời gian bảo hành hay không.

Để giải quyết vấn đề này, mỗi thiết bị cần được định danh độc nhất thông qua mã Serial hoặc IMEI (International Mobile Equipment Identity). Tuy nhiên, việc áp dụng quản lý theo cấp độ thực thể vật lý (Serial/IMEI) tạo ra một thách thức lớn về mặt kỹ thuật:
*   **Độ phức tạp của Dữ liệu:** Thay vì lưu trữ một dòng duy nhất đại diện cho số lượng của một mặt hàng, cơ sở dữ liệu phải lưu trữ hàng ngàn bản ghi (records) độc lập cho từng thiết bị vật lý, đòi hỏi khả năng thiết kế hệ quản trị CSDL tinh gọn (Lean Database) và tốc độ truy xuất dữ liệu nhanh.
*   **Tính nhất quán của Giao dịch:** Khi khách hàng đặt mua trên web, hệ thống phải gán đúng một mã Serial duy nhất và cập nhật trạng thái ngay lập tức trên toàn hệ thống để tránh tình trạng "bán trùng" (Overselling) một chiếc máy cho hai người khác nhau.
*   **Minh bạch trong kiểm toán:** Mọi thay đổi trạng thái của thiết bị (nhập, xuất, hoàn trả) đều phải được gắn liền với các chứng từ kho bất biến (Immutable Documents) để tạo ra một lịch sử giao dịch rõ ràng.

Từ những nhu cầu thực tiễn và thách thức kỹ thuật nêu trên, việc nghiên cứu và xây dựng dự án **Hệ thống Quản lý Bán hàng** – một nền tảng Bán hàng và Quản lý kho dựa trên định danh thực thể vật lý (Serial/IMEI) – là một đề tài mang tính cấp thiết và có tính ứng dụng cao, giúp giải quyết triệt để bài toán vận hành của các cửa hàng điện tử hiện đại.

## 1.2. Mục tiêu dự án

### 1.2.1. Mục tiêu cốt lõi (Quản lý thực thể vật lý, tính toàn vẹn dữ liệu)
Mục tiêu cốt lõi của dự án là xây dựng một nền tảng bán hàng và quản trị kho bãi hoàn chỉnh, trong đó lấy **thực thể vật lý (Device)** làm trung tâm của mọi luồng xử lý nghiệp vụ. Hệ thống hướng đến các mục tiêu cụ thể sau:
*   **Quản lý chính xác ở cấp độ Serial/IMEI:** Đảm bảo mọi thiết bị nhập vào, lưu kho và xuất bán đều được theo dõi bằng một định danh duy nhất. Người quản lý có thể truy xuất ngược toàn bộ vòng đời của một thiết bị từ lúc nhập từ nhà cung cấp cho đến khi giao tận tay người dùng cuối.
*   **Bảo đảm tính toàn vẹn của dữ liệu (Data Integrity):** Loại bỏ hoàn toàn các sai sót do thao tác thủ công hoặc do lỗi đồng bộ phần mềm bằng cách áp dụng các ràng buộc (Constraints) chặt chẽ ở cấp độ Cơ sở dữ liệu.
*   **Số hóa quy trình vận hành:** Chuyển đổi các nghiệp vụ kho bãi và xử lý đơn hàng truyền thống (ghi chép sổ sách, sử dụng excel) sang nền tảng web trực tuyến tập trung, giúp tăng tốc độ xử lý đơn hàng và giảm thiểu độ trễ giao tiếp giữa các bộ phận (Sales - Kho).

### 1.2.2. Điểm khác biệt của hệ thống (Lean Database, Tính minh bạch chứng từ)
So với các hệ thống E-commerce thông thường chỉ quản lý tồn kho theo số lượng tổng, **Hệ thống** mang đến những điểm khác biệt mang tính ứng dụng thực tiễn cao:
*   **Kiến trúc Database-centric (Tập trung vào CSDL):** Hệ thống không phó mặc hoàn toàn việc kiểm soát logic cho Backend (Node.js) mà sử dụng trực tiếp các Trigger (Bộ kích hoạt) trong SQL Server để tự động điều phối trạng thái thiết bị. Khi một chứng từ kho được duyệt, trạng thái của hàng loạt mã Serial sẽ tự động luân chuyển một cách khép kín (ví dụ: từ *Sẵn có* sang *Chờ giao*). Cách tiếp cận này giúp cơ sở dữ liệu chủ động bảo vệ tính nhất quán thông tin tồn kho trong trường hợp có hàng ngàn truy vấn đặt hàng song song.
*   **Tính minh bạch và bất biến của chứng từ (Immutable Documents):** Trong hệ thống, mọi sự thay đổi về trạng thái kho đều không thể tự ý sửa đổi trong CSDL. Thay vào đó, người dùng phải lập các chứng từ kho (Inventory Docs) tương ứng (Nhập, Xuất). Khi chứng từ đã được cấp quản lý "Duyệt" (Approve), dữ liệu trở thành "Bất biến". Nếu có sai sót, người dùng buộc phải tạo phiếu hủy và lập chứng từ mới. Điều này thiết lập một cơ chế nhật ký (Log/Audit) cực kỳ minh bạch, đáp ứng tiêu chuẩn khắt khe của các hệ thống quản trị doanh nghiệp (ERP).
*   **Trải nghiệm thao tác (UX) hướng nghiệp vụ:** Giao diện quản lý (Admin Dashboard) được tối ưu hóa cho tốc độ thao tác của nhân viên kho, nổi bật với tính năng cho phép giả lập máy quét mã vạch (Barcode Scanner) để nhập nhanh hàng loạt mã Serial khi lập phiếu kho, giúp tiết kiệm đáng kể thời gian so với việc nhập liệu thủ công.

## 1.3. Phạm vi hệ thống

### 1.3.1. Đối tượng sử dụng (Customer, Staff, Manager)
**Hệ thống** được phân quyền chặt chẽ để phục vụ 3 nhóm đối tượng chính, mỗi nhóm có một phân hệ giao diện và đặc quyền riêng biệt:

1.  **Khách hàng (Customer):** 
    *   Sử dụng giao diện Storefront (Trang chủ mua sắm).
    *   Có thể duyệt, tìm kiếm, lọc sản phẩm theo các tiêu chí (giá, danh mục).
    *   Quản lý giỏ hàng, đặt hàng trực tuyến, cập nhật hồ sơ cá nhân và theo dõi lịch sử đơn hàng.
    *   Giao diện hiển thị trạng thái tồn kho real-time dựa trên số lượng Serial thực tế đang *Sẵn có*.

2.  **Nhân viên (Staff):**
    *   Sử dụng giao diện Admin Dashboard với các quyền hạn thao tác (Operation) giới hạn.
    *   Tiếp nhận đơn đặt hàng trực tuyến từ khách hàng và thực hiện thao tác xử lý đơn.
    *   Trực tiếp thực hiện các nghiệp vụ kho bãi như: Lập phiếu nhập kho từ nhà cung cấp và lập phiếu xuất kho.
    *   Thao tác và tìm kiếm trực tiếp với các định danh Serial/IMEI thực tế.

3.  **Quản trị viên (Manager):**
    *   Kế thừa toàn bộ quyền hạn thao tác của Nhân viên.
    *   Nắm giữ đặc quyền "Duyệt" (Approve) hoặc "Hủy" (Cancel) đối với mọi chứng từ kho. Các phiếu chỉ có hiệu lực làm thay đổi trạng thái tồn kho CSDL sau khi Manager xét duyệt.
    *   Quản trị dữ liệu cốt lõi: Quản lý tài khoản nhân sự, Thiết lập danh mục sản phẩm, và Quản lý đối tác nhà cung cấp.
    *   Theo dõi các báo cáo phân tích thống kê (Analytics) về hoạt động kinh doanh và cảnh báo tồn kho.

### 1.3.2. Giới hạn tính năng
Để đảm bảo tính khả thi trong thời gian phát triển và tập trung giải quyết triệt để bài toán quản lý kho vật lý lõi, dự án hiện tại có một số giới hạn sau:
*   **Thanh toán điện tử:** Hệ thống hiện tại ưu tiên quy trình xác nhận thanh toán nội bộ (Nhân viên xác nhận nhận tiền mặt hoặc chuyển khoản thủ công), chưa tích hợp trực tiếp các cổng thanh toán trực tuyến (như VNPAY, Momo) bằng API thực tế.
*   **Mô hình đa kho (Multi-warehouse):** Cơ sở dữ liệu và luồng nghiệp vụ hiện được thiết kế để vận hành tối ưu cho mô hình Một kho hàng trung tâm (Single-warehouse). Tính năng luân chuyển hàng hóa giữa nhiều kho chi nhánh khác nhau chưa được áp dụng.
*   **Tích hợp Giao vận (Logistics):** Việc theo dõi trạng thái vận chuyển chi tiết trên đường đi (thông qua API của các bên như GHTK, GHN) nằm ngoài phạm vi hiện tại. Trạng thái giao hàng được quản lý theo dạng Cập nhật thủ công bởi Staff.

## 1.4. Công nghệ sử dụng
Để đáp ứng các yêu cầu về nghiệp vụ và tính toàn vẹn dữ liệu, **Hệ thống** được xây dựng dựa trên các công nghệ và nền tảng hiện đại như sau:

### 1.4.1. Frontend (Giao diện người dùng)
*   **React.js & Vite:** React.js được chọn làm thư viện lõi để xây dựng giao diện Single Page Application (SPA), mang lại trải nghiệm mượt mà, không cần tải lại trang. Công cụ build Vite được sử dụng thay thế cho CRA (Create React App) truyền thống nhờ tốc độ khởi động dev server cực nhanh và tối ưu hóa file build tốt hơn.
*   **CSS Modules (Vanilla CSS):** Sử dụng kỹ thuật CSS Modules giúp đóng gói CSS theo từng Component, ngăn chặn tình trạng xung đột (conflict) tên class giữa các trang khác nhau mà không cần phụ thuộc vào thư viện CSS bên thứ 3 cồng kềnh.
*   **Lucide React:** Cung cấp bộ icon SVG nhẹ, nhất quán và hiện đại cho toàn bộ hệ thống (đặc biệt là thanh điều hướng Admin Dashboard).
*   **Recharts:** Thư viện vẽ biểu đồ mạnh mẽ dựa trên React và D3.js, được dùng để kết xuất trực quan các dữ liệu thống kê, báo cáo doanh thu trên màn hình của Quản trị viên.

### 1.4.2. Backend (Máy chủ xử lý API)
*   **Node.js & Express.js:** Node.js với cơ chế xử lý bất đồng bộ (Event-driven, Non-blocking I/O) cực kỳ phù hợp để xử lý hàng loạt truy vấn API. Express.js cung cấp bộ khung định tuyến (Routing) gọn nhẹ giúp thiết kế hệ thống RESTful API một cách chuẩn mực.
*   **JSON Web Token (JWT):** Đóng vai trò làm cơ chế xác thực chính. Khi người dùng đăng nhập thành công, hệ thống cấp phát một Token mã hóa (mang thông tin ID và Quyền hạn Role). Token này được đính kèm ở Header để kiểm soát truy cập (Authorization) vào các API nhạy cảm.
*   **Multer:** Middleware xử lý `multipart/form-data`, chuyên dụng cho việc upload và quản lý lưu trữ hình ảnh sản phẩm lên server nội bộ.

### 1.4.3. Cơ sở dữ liệu (Database)
*   **Microsoft SQL Server (MSSQL):** Đây là "trái tim" của toàn bộ kiến trúc hệ thống. MSSQL được lựa chọn nhờ khả năng quản lý dữ liệu quan hệ mạnh mẽ và hỗ trợ Transaction (Giao dịch) chuẩn ACID, đảm bảo không có bất kỳ sai lệch nào xảy ra khi hàng ngàn mã Serial cùng được truy xuất hoặc thay đổi trạng thái đồng thời.
*   **Tích hợp Logic CSDL (Triggers & Constraints):** Khác biệt so với các dự án thông thường, hệ thống tận dụng tối đa sức mạnh của MSSQL thông qua việc cài đặt các ràng buộc (Check Constraints, Foreign Key) và các Trigger. Trigger sẽ tự động chuyển đổi trạng thái của hàng loạt thiết bị vật lý ngay khi một chứng từ kho được duyệt, giúp giảm tải độ phức tạp và ngăn lỗi cho tầng Backend Node.js.

---

# CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG

## 2.1. Phân tích người dùng (Actors)

Để hệ thống hoạt động trơn tru và đáp ứng đúng bài toán nghiệp vụ, người dùng được phân loại thành các Actor với những mục đích và giới hạn thao tác khác nhau. Việc xác định rõ Actor giúp định hình các Use Case và thiết kế luồng UI/UX phù hợp. Dưới đây là phân tích chi tiết về 3 nhóm Actor chính:

### 2.1.1. Khách hàng (Customer)
*   **Mô tả:** Là người tiêu dùng cuối cùng (End-user) có nhu cầu tìm hiểu thông tin và mua sắm các thiết bị điện tử do cửa hàng cung cấp.
*   **Đặc điểm tương tác:** Tương tác trực tiếp với phân hệ Storefront (Giao diện mua sắm). Yêu cầu giao diện phải trực quan, thân thiện, dễ tìm kiếm sản phẩm và tốc độ tải trang nhanh để giữ chân người dùng.
*   **Mục tiêu khi sử dụng hệ thống:**
    *   Xem danh mục, tìm kiếm và so sánh chi tiết các mẫu mã sản phẩm.
    *   Thêm sản phẩm vào giỏ hàng và thực hiện quy trình đặt hàng trực tuyến một cách dễ dàng.
    *   Tra cứu lại lịch sử các đơn hàng đã đặt và theo dõi trạng thái đơn hàng (Đang xử lý, Đang giao, Đã hoàn thành).
*   **Giới hạn quyền hạn:** Chỉ được phép xem các sản phẩm đang hiển thị công khai (Public) và có tồn kho. Không có bất kỳ quyền truy cập nào vào các thông tin vận hành nội bộ hoặc dữ liệu của người dùng khác.

### 2.1.2. Nhân viên (Staff)
*   **Mô tả:** Là đội ngũ nhân sự nội bộ của doanh nghiệp, trực tiếp thực hiện các thao tác bán hàng và quản lý kho bãi hằng ngày.
*   **Đặc điểm tương tác:** Tương tác chủ yếu qua phân hệ Admin Dashboard. Cần giao diện tối ưu cho việc nhập liệu nhanh (hỗ trợ phím tắt, máy quét mã vạch), hiển thị bảng biểu rõ ràng để xử lý khối lượng công việc lớn.
*   **Mục tiêu khi sử dụng hệ thống:**
    *   Theo dõi và tiếp nhận các đơn hàng mới do Customer đặt.
    *   Thực hiện thao tác xuất kho để đáp ứng đơn hàng (gán các mã Serial cụ thể cho đơn).
    *   Lập các chứng từ kho nội bộ như: Phiếu nhập hàng từ nhà cung cấp, Phiếu xuất trả hàng.
    *   Tra cứu nhanh thông tin cấu hình sản phẩm và tình trạng của một mã Serial/IMEI bất kỳ khi khách hàng yêu cầu kiểm tra.
*   **Giới hạn quyền hạn:** Staff chỉ có quyền **tạo lập** (Create) và **chỉnh sửa bản nháp** (Update draft) của các chứng từ kho. Staff **không có quyền duyệt** (Approve) để chứng từ chính thức làm thay đổi số liệu Database.

### 2.1.3. Quản trị viên (Manager)
*   **Mô tả:** Là cấp quản lý của cửa hàng (Cửa hàng trưởng, Kế toán trưởng hoặc Chủ doanh nghiệp). Người chịu trách nhiệm cuối cùng về số liệu hàng hóa và nhân sự.
*   **Đặc điểm tương tác:** Sử dụng Admin Dashboard tương tự như Staff nhưng được mở khóa toàn bộ các menu tính năng nâng cao và bảng điều khiển thống kê (Analytics).
*   **Mục tiêu khi sử dụng hệ thống:**
    *   Kiểm soát số liệu kho bãi bằng cách kiểm tra và **Duyệt/Hủy** các chứng từ kho do Staff lập.
    *   Thiết lập và duy trì các dữ liệu nền tảng (Master Data): Thêm/sửa danh mục sản phẩm, quản lý nhà cung cấp.
    *   Quản trị nhân sự: Cấp phát tài khoản mới cho Staff, khóa tài khoản nếu nhân viên nghỉ việc.
    *   Theo dõi bức tranh toàn cảnh về hoạt động kinh doanh thông qua các báo cáo biểu đồ doanh thu, số lượng bán ra và danh sách hàng sắp hết để có kế hoạch nhập hàng kịp thời.
*   **Giới hạn quyền hạn:** Là tài khoản có đặc quyền cao nhất trong hệ thống phần mềm (Super User). Tuy nhiên, Manager cũng bị ràng buộc bởi các quy tắc của CSDL (ví dụ: không thể xóa một Nhà cung cấp nếu nhà cung cấp đó đã có giao dịch nhập hàng).
