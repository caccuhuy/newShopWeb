
--ADD
create OR ALTER procedure sp_AddCategories
	@name NVARCHAR(50) 
As
BEGIN 
SET NOCOUNT ON 
	IF EXISTS ( SELECT 1 FROM Categories WHERE cat_name LIKE @name ) 
	BEGIN
        RAISERROR (N'Tên đã tồn tại! Vui lòng nhập tên khác', 16, 1);
        ROLLBACK TRANSACTION;
	END
	ELSE 
	BEGIN 
		INSERT INTO Categories VALUES (@name) ;
	END 
END 

GO
--ALTER
create OR ALTER procedure sp_AlterCategories
	@id INT
	,@name NVARCHAR(50) 
As
BEGIN 
SET NOCOUNT ON 
	IF EXISTS ( SELECT 1 FROM Categories WHERE cat_name LIKE @name ) 
	BEGIN
        UPDATE Categories 
		SET cat_name = @name 
		WHERE cat_id = @id
	END
	ELSE 
	BEGIN 
		RAISERROR (N'Tên không tồn tại! Vui lòng kiểm tra lại hoặc tạo mới', 16, 1);
        ROLLBACK TRANSACTION;
	END 
END 

go

--delete
create OR ALTER procedure sp_DeleteCategories
	@id INT
As
BEGIN 
SET NOCOUNT ON 
	IF EXISTS ( SELECT 1 FROM Categories WHERE cat_id LIKE @id ) 
	BEGIN
        DELETE FROM Categories WHERE cat_id = @id
	END
	ELSE 
	BEGIN 
		RAISERROR (N'ID không tồn tại! Vui lòng kiểm tra lại hoặc tạo mới', 16, 1);
        ROLLBACK TRANSACTION;
	END 
END 
		