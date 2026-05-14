

CREATE OR ALTER PROCEDURE sp_GetCustomerOrders
    @userId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT o.*, 
           (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
    FROM Orders o 
    WHERE o.user_id = @userId 
    ORDER BY o.created_at DESC
END
GO
