create or alter procedure vw_Suppliers
as begin 
set nocount on ;
	SELECT tax_id, supplier_name FROM Suppliers
end 

go 
create or alter procedure sp_AddSupplier
	@tax char(10) 
	,@name nvarchar(255) 
as begin 
set nocount on ;
INSERT INTO Suppliers (tax_id, supplier_name) VALUES (@tax, @name)
end 

go 
create or alter procedure sp_UpdateSupplier
	@tax char(10) 
	, @name nvarchar(255) 
as begin 
set nocount on ;
	UPDATE Suppliers 
	SET supplier_name = @name 
	WHERE tax_id = @tax;
end

go

CREATE OR ALTER PROCEDURE sp_DeleteSupplier
    @tax CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra ràng buộc trong bảng Inventory_DOCs
    IF EXISTS (SELECT 1 FROM Inventory_DOCs WHERE Suppliers_tax_id = @tax)
    BEGIN
        RAISERROR(N'Không thể xóa nhà cung cấp đã có lịch sử nhập/xuất kho.', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra sự tồn tại của nhà cung cấp
    IF NOT EXISTS (SELECT 1 FROM Suppliers WHERE tax_id = @tax)
    BEGIN
        RAISERROR(N'Nhà cung cấp không tồn tại.', 16, 1);
        RETURN;
    END

    -- 3. Thực hiện xóa
    DELETE FROM Suppliers WHERE tax_id = @tax;
END