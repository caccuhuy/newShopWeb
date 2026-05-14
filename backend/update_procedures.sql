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
                (
                    SELECT STRING_AGG('"' + dd.serial_number + '"', ',')
                    FROM DOC_Details dd 
                    JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                    WHERE idoc.order_ref = od.order_id AND dd.product_id = od.product_id
                ) AS serials_raw -- Tạm thời lấy chuỗi định dạng mảng
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
GO

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
GO
