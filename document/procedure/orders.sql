create or alter procedure vw_AllOrders
as begin
set nocount on;
	SELECT o.*
    , u.username as customer_name
    , u.phone_number as customer_phone
    ,(SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
    FROM Orders o
    LEFT JOIN Users u ON o.user_id = u.user_id
    ORDER BY o.created_at DESC
end 
go 

CREATE OR ALTER PROCEDURE sp_GetOrderAdminDetail
    @orderId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        o.order_id AS id,
        o.*,
        -- Đóng gói thông tin khách hàng vào object customer_info
        JSON_QUERY((
            SELECT 
                ISNULL(u.username, N'Khách vãng lai') AS [name],
                ISNULL(u.phone_number, 'N/A') AS [phone]
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        )) AS customer_info,
        -- Đóng gói danh sách sản phẩm lồng nhau
        (
            SELECT 
                od.*,
                p.product_name,
                p.image_url,
                od.unit_price AS price_at_time,
                -- Xử lý mảng serials trực tiếp trong SQL
                JSON_QUERY((
                    SELECT STRING_AGG('"' + dd.serial_number + '"', ',')
                    FROM DOC_Details dd 
                    JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                    WHERE idoc.order_ref = od.order_id AND dd.product_id = od.product_id
                )) AS serials_raw -- Tạm thời lấy chuỗi định dạng mảng
            FROM Order_Details od 
            JOIN Product p ON od.product_id = p.product_id 
            WHERE od.order_id = o.order_id
            FOR JSON PATH
        ) AS items
    FROM Orders o
    LEFT JOIN Users u ON o.user_id = u.user_id
    WHERE o.order_id = @orderId
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
END

go 

CREATE OR ALTER PROCEDURE sp_GetOrderStockReport
    @orderId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        od.product_id,
        od.quantity AS required,
        ISNULL(stock.available_count, 0) AS available,
        -- Đóng gói danh sách Serial Number thành mảng JSON
        JSON_QUERY(ISNULL((
            SELECT su.serial_number
            FROM Stock_Units su
            WHERE su.product_id = od.product_id AND su.status = 1
            FOR JSON PATH
        ), '[]')) AS available_serials_raw
    FROM Order_Details od
    OUTER APPLY (
        -- Đếm số lượng máy còn trong kho (status = 1)
        SELECT COUNT(*) AS available_count
        FROM Stock_Units su
        WHERE su.product_id = od.product_id AND su.status = 1
    ) stock
    WHERE od.order_id = @orderId
    FOR JSON PATH;
END

go

CREATE OR ALTER PROCEDURE sp_ConfirmOrderAndCreateExport
    @doc_id CHAR(10),
    @staffId VARCHAR(20),
    @orderId VARCHAR(20),
    @details StockItemType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Tạo Inventory_DOC (Type 2 = Export, Status 0 = Draft)
        INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, created_at, Doc_description, status, order_ref, inventory_id)
        VALUES (@doc_id, 2, @staffId, GETDATE(), N'Phiếu xuất chờ duyệt cho đơn hàng #' + @orderId, 0, @orderId, 1);

        -- 2. Chèn chi tiết phiếu xuất (DOC_Details) từ biến bảng TVP
        INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
        SELECT @doc_id, serial_number, product_id, unit_price
        FROM @details;

        -- 3. Cập nhật trạng thái đơn hàng sang 'processing'
        UPDATE Orders 
        SET status = 'processing' 
        WHERE order_id = @orderId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END

go 
create or alter procedure sp_ChangeOrderStatus 
    @id varchar(20) 
    ,@status varchar(20) 
as begin 
set nocount on;
    UPDATE Orders 
    SET status = @status 
    WHERE order_id = @id
end 