create or alter procedure vw_GetAllProducts
as begin 
set nocount on;
SELECT p.*
    , c.cat_name as category_name
    ,(SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) as stock
FROM Product p 
LEFT JOIN Categories c ON p.cat_id = c.cat_id
end  

go
create or alter procedure sp_GetProductDetails
    @id int 
as begin 
set nocount on;
    SELECT p.*
        , c.cat_name as category_name
        ,(SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) as stock
    FROM Product p
    LEFT JOIN Categories c ON p.cat_id = c.cat_id
    WHERE p.product_id = @id
end  

go
create or alter procedure sp_AddProducts
    @name nvarchar(500) 
    , @cat int 
    , @specs nvarchar(max)
    , @price Decimal(15, 2)
    , @brand varchar(30) 
    , @warranty tinyint 
    , @img varchar(500) 
as begin 
set nocount on;
    INSERT INTO Product (product_name, cat_id, specs_json, unit_price, brand, warranty_period, image_url) 
    VALUES (@name, @cat, @specs, @price, @brand, @warranty, @img)
end 



go
create or alter procedure sp_AlterProducts
    @id int 
    ,@name nvarchar(500) 
    , @cat int 
    , @specs nvarchar(max)
    , @price Decimal(15, 2)
    , @brand varchar(30) 
    , @warranty tinyint 
    , @img varchar(500) 
as begin 
set nocount on;
    UPDATE Product 
    SET product_name = @name, 
        cat_id = @cat, 
        specs_json = @specs, 
        unit_price = @price, 
        brand = @brand, 
        warranty_period = @warranty, 
        image_url = @img 
    WHERE product_id = @id
end  

go 
CREATE OR ALTER PROCEDURE sp_DeleteProductWithCheck
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Khai báo các biến đếm
    DECLARE @orderCount INT, @docCount INT, @stockCount INT;

    SELECT @orderCount = COUNT(*) FROM Order_Details WHERE product_id = @id;
    SELECT @docCount = COUNT(*) FROM DOC_Details WHERE product_id = @id;
    SELECT @stockCount = COUNT(*) FROM Stock_Units WHERE product_id = @id;

    -- 2. Nếu có dữ liệu liên quan, trả về kết quả để Backend báo lỗi và dừng lại
    IF (@orderCount > 0 OR @docCount > 0 OR @stockCount > 0)
    BEGIN
        SELECT 
            @orderCount AS orderCount, 
            @docCount AS docCount, 
            @stockCount AS stockCount,
            0 AS isDeleted; -- Trạng thái chưa xóa
        RETURN;
    END

    -- 3. Nếu không có ràng buộc, thực hiện xóa
    DELETE FROM Product WHERE product_id = @id;

    -- Trả về kết quả xác nhận đã xóa
    SELECT 0 AS orderCount, 0 AS docCount, 0 AS stockCount, 1 AS isDeleted;
END