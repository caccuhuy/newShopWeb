select * from Orders where order_id ='ORD-734550522' ;

CREATE TYPE OrderItemType AS TABLE (
    product_id INT,
    quantity   INT,
    unit_price Decimal(15, 2)
);
go 

create or alter procedure sp_AddNewOrder
    @orderId varchar(20)
    , @userId varchar(20)
    , @total_amount decimal(18,2) 
    , @status varchar(20)
    , @shipping_address nvarchar(500) 
    , @items OrderItemType READONLY 
as begin 
set nocount on;
    BEGIN TRY
        -- 1. Kiểm tra tồn kho đủ số lượng cho từng product
        IF EXISTS (
            SELECT 1 FROM @items i
            LEFT JOIN (
                SELECT product_id, COUNT(*) AS available
                FROM Stock_Units
                WHERE status = 1
                GROUP BY product_id
            ) stock ON i.product_id = stock.product_id
            WHERE ISNULL(stock.available, 0) < i.quantity
        )
        BEGIN
            RAISERROR(N'Lỗi: Một hoặc nhiều sản phẩm không đủ số lượng tồn kho.', 16, 1);
            RETURN;
        END
        BEGIN TRANSACTION 
            INSERT INTO Orders(order_id, user_id, total_amount, status, shipping_address, created_at) 
                VALUES ( @orderId, @userId, @total_amount, @status, @shipping_address, GETDATE())
            INSERT INTO Order_Details (order_id, product_id, quantity, unit_price)
                SELECT @orderId, i.product_id, i.quantity, p.unit_price
                FROM @items i
                JOIN Product p ON i.product_id = p.product_id;
        COMMIT TRANSACTION;
    END TRY 
    BEGIN CATCH 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
end ;

go 
create or alter procedure sp_ViewUserHistory 
    @id varchar(20)
as begin
set nocount on 
    SELECT o.order_id, o.total_amount, o.status, o.shipping_address, o.created_at,
        (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
    FROM Orders o
    WHERE o.user_id = @id
    ORDER BY o.created_at DESC
end;

go 

create or alter procedure sp_GetOrderDetail
    @orderId varchar(20)
    , @userId varchar(20) 
as begin 
set nocount on 
    -- Lấy thông tin đơn hàng
    SELECT * FROM Orders WHERE order_id = @orderId AND user_id = @userId;
    
    -- Lấy chi tiết sản phẩm
    SELECT od.product_id, od.quantity, od.unit_price, p.product_name, p.image_url
    FROM Order_Details od
    LEFT JOIN Product p ON od.product_id = p.product_id
    WHERE od.order_id = @orderId;
end 