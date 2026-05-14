# Database Objects\n\n## Stored Procedures\n\n### vw_GetAllStaffs\n\n```sql\ncreate   procedure vw_GetAllStaffs
as begin 
set nocount on;
SELECT user_id
	, username
	, email
	, phone_number
	, role_name
	, is_active 
FROM Users WHERE role_name IN ('Staff', 'Admin')
end \n```\n\n### sp_AddStaff\n\n```sql\nCREATE   PROCEDURE sp_AddStaff
    @username NVARCHAR(100),
    @email VARCHAR(100),
    @phone_number CHAR(15),
    @pasword_hash VARCHAR(255),
    @role_name VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Kiểm tra Email
    IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
    BEGIN
        RAISERROR(N'Email này đã tồn tại trong hệ thống!', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra Số điện thoại
    IF EXISTS (SELECT 1 FROM Users WHERE phone_number = @phone_number)
    BEGIN
        RAISERROR(N'Số điện thoại này đã tồn tại trong hệ thống!', 16, 1);
        RETURN;
    END

    -- 3. Tự động sinh user_id (Dạng chuỗi 4 ký tự, ví dụ: 0001, 0002)
    DECLARE @newUserId VARCHAR(10);
    DECLARE @maxId INT;

    SELECT @maxId = MAX(CAST(user_id AS INT)) FROM Users;
    SET @maxId = ISNULL(@maxId, 0) + 1;
    SET @newUserId = RIGHT('0000' + CAST(@maxId AS VARCHAR), 4);

    -- 4. Thực hiện chèn dữ liệu
    INSERT INTO Users (user_id, username, pasword_hash, email, phone_number, role_name, is_active)
    VALUES (@newUserId, @username, @pasword_hash, @email, @phone_number, @role_name, 1);

    -- Trả về ID mới để backend biết
    SELECT @newUserId AS newUserId;
END\n```\n\n### sp_ToggleUserActive\n\n```sql\nCREATE   PROCEDURE sp_ToggleUserActive
    @targetId VARCHAR(20),
    @adminId VARCHAR(20),
    @isActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra xem Admin có đang tự khóa chính mình không
    IF @targetId = @adminId
    BEGIN
        RAISERROR(N'Bạn không thể tự khóa tài khoản của chính mình!', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra tài khoản đích có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = @targetId)
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại!', 16, 1);
        RETURN;
    END

    -- 3. Cập nhật trạng thái
    UPDATE Users 
    SET is_active = @isActive 
    WHERE user_id = @targetId;

    -- Trả về thông tin để Backend log lại
    SELECT username, email FROM Users WHERE user_id = @targetId;
END\n```\n\n### sp_ResetPassword\n\n```sql\ncreate   procedure sp_ResetPassword
    @user_id varchar(20) 
    , @hash varchar(255) 
as begin 
set nocount on ;
    UPDATE Users 
    SET pasword_hash = @hash 
    WHERE user_id = @user_id
end \n```\n\n### vw_Suppliers\n\n```sql\ncreate   procedure vw_Suppliers
as begin 
set nocount on ;
	SELECT tax_id, supplier_name FROM Suppliers
end \n```\n\n### sp_AddSupplier\n\n```sql\ncreate   procedure sp_AddSupplier
	@tax char(10) 
	,@name nvarchar(255) 
as begin 
set nocount on ;
INSERT INTO Suppliers (tax_id, supplier_name) VALUES (@tax, @name)
end \n```\n\n### sp_UpdateSupplier\n\n```sql\ncreate   procedure sp_UpdateSupplier
	@tax char(10) 
	, @name nvarchar(255) 
as begin 
set nocount on ;
	UPDATE Suppliers 
	SET supplier_name = @name 
	WHERE tax_id = @tax;
end\n```\n\n### sp_DeleteSupplier\n\n```sql\nCREATE   PROCEDURE sp_DeleteSupplier
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
END\n```\n\n### sp_LoginUser\n\n```sql\nCREATE PROCEDURE sp_LoginUser
    @email VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tài khoản có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Users WHERE email = @email)
    BEGIN
        RAISERROR(N'Tài khoản sai mật khẩu hoặc không tồn tại', 16, 1);
        RETURN;
    END

    -- 2. Lấy thông tin người dùng
    -- Lưu ý: Cột mật khẩu của bạn đang là pasword_hash (thiếu chữ s)
    SELECT user_id, username, email, pasword_hash, role_name, is_active
    FROM Users
    WHERE email = @email;
END\n```\n\n### sp_RegisterCustomer\n\n```sql\nCREATE PROCEDURE sp_RegisterCustomer
    @user_id VARCHAR(10) OUTPUT,
    @username NVARCHAR(100),
    @email VARCHAR(100),
    @phone_number CHAR(15),
    @default_address NVARCHAR(MAX),
    @pasword_hash VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Email đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
    BEGIN
        RAISERROR(N'Email này đã được đăng ký!', 16, 1);
        RETURN;
    END

    -- 2. Tự động sinh user_id (0001, 0002...)
    DECLARE @newUserId VARCHAR(10);
    DECLARE @maxId INT;

    SELECT @maxId = MAX(CAST(user_id AS INT)) FROM Users;
    SET @maxId = ISNULL(@maxId, 0) + 1;
    SET @newUserId = RIGHT('0000' + CAST(@maxId AS VARCHAR), 4);

    -- 3. Chèn dữ liệu (Mặc định role là Customer)
    INSERT INTO Users (user_id, username, pasword_hash, email, phone_number, default_address, role_name, is_active)
    VALUES (@newUserId, @username, @pasword_hash, @email, @phone_number, @default_address, 'Customer', 1);

    -- Trả về ID mới
    SELECT @newUserId AS newUserId;
END\n```\n\n### sp_upgraddiagrams\n\n```sql\n
	CREATE PROCEDURE dbo.sp_upgraddiagrams
	AS
	BEGIN
		IF OBJECT_ID(N'dbo.sysdiagrams') IS NOT NULL
			return 0;
	
		CREATE TABLE dbo.sysdiagrams
		(
			name sysname NOT NULL,
			principal_id int NOT NULL,	-- we may change it to varbinary(85)
			diagram_id int PRIMARY KEY IDENTITY,
			version int,
	
			definition varbinary(max)
			CONSTRAINT UK_principal_name UNIQUE
			(
				principal_id,
				name
			)
		);


		/* Add this if we need to have some form of extended properties for diagrams */
		/*
		IF OBJECT_ID(N'dbo.sysdiagram_properties') IS NULL
		BEGIN
			CREATE TABLE dbo.sysdiagram_properties
			(
				diagram_id int,
				name sysname,
				value varbinary(max) NOT NULL
			)
		END
		*/

		IF OBJECT_ID(N'dbo.dtproperties') IS NOT NULL
		begin
			insert into dbo.sysdiagrams
			(
				[name],
				[principal_id],
				[version],
				[definition]
			)
			select	 
				convert(sysname, dgnm.[uvalue]),
				DATABASE_PRINCIPAL_ID(N'dbo'),			-- will change to the sid of sa
				0,							-- zero for old format, dgdef.[version],
				dgdef.[lvalue]
			from dbo.[dtproperties] dgnm
				inner join dbo.[dtproperties] dggd on dggd.[property] = 'DtgSchemaGUID' and dggd.[objectid] = dgnm.[objectid]	
				inner join dbo.[dtproperties] dgdef on dgdef.[property] = 'DtgSchemaDATA' and dgdef.[objectid] = dgnm.[objectid]
				
			where dgnm.[property] = 'DtgSchemaNAME' and dggd.[uvalue] like N'_EA3E6268-D998-11CE-9454-00AA00A3F36E_' 
			return 2;
		end
		return 1;
	END
	\n```\n\n### sp_helpdiagrams\n\n```sql\n
	CREATE PROCEDURE dbo.sp_helpdiagrams
	(
		@diagramname sysname = NULL,
		@owner_id int = NULL
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		DECLARE @user sysname
		DECLARE @dboLogin bit
		EXECUTE AS CALLER;
			SET @user = USER_NAME();
			SET @dboLogin = CONVERT(bit,IS_MEMBER('db_owner'));
		REVERT;
		SELECT
			[Database] = DB_NAME(),
			[Name] = name,
			[ID] = diagram_id,
			[Owner] = USER_NAME(principal_id),
			[OwnerID] = principal_id
		FROM
			sysdiagrams
		WHERE
			(@dboLogin = 1 OR USER_NAME(principal_id) = @user) AND
			(@diagramname IS NULL OR name = @diagramname) AND
			(@owner_id IS NULL OR principal_id = @owner_id)
		ORDER BY
			4, 5, 1
	END
	\n```\n\n### sp_helpdiagramdefinition\n\n```sql\n
	CREATE PROCEDURE dbo.sp_helpdiagramdefinition
	(
		@diagramname 	sysname,
		@owner_id	int	= null 		
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		set nocount on

		declare @theId 		int
		declare @IsDbo 		int
		declare @DiagId		int
		declare @UIDFound	int
	
		if(@diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner');
		if(@owner_id is null)
			select @owner_id = @theId;
		revert; 
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname;
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId ))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end

		select version, definition FROM dbo.sysdiagrams where diagram_id = @DiagId ; 
		return 0
	END
	\n```\n\n### sp_creatediagram\n\n```sql\n
	CREATE PROCEDURE dbo.sp_creatediagram
	(
		@diagramname 	sysname,
		@owner_id		int	= null, 	
		@version 		int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId int
		declare @retval int
		declare @IsDbo	int
		declare @userName sysname
		if(@version is null or @diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID(); 
		select @IsDbo = IS_MEMBER(N'db_owner');
		revert; 
		
		if @owner_id is null
		begin
			select @owner_id = @theId;
		end
		else
		begin
			if @theId <> @owner_id
			begin
				if @IsDbo = 0
				begin
					RAISERROR (N'E_INVALIDARG', 16, 1);
					return -1
				end
				select @theId = @owner_id
			end
		end
		-- next 2 line only for test, will be removed after define name unique
		if EXISTS(select diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @diagramname)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end
	
		insert into dbo.sysdiagrams(name, principal_id , version, definition)
				VALUES(@diagramname, @theId, @version, @definition) ;
		
		select @retval = @@IDENTITY 
		return @retval
	END
	\n```\n\n### sp_renamediagram\n\n```sql\n
	CREATE PROCEDURE dbo.sp_renamediagram
	(
		@diagramname 		sysname,
		@owner_id		int	= null,
		@new_diagramname	sysname
	
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @DiagIdTarg		int
		declare @u_name			sysname
		if((@diagramname is null) or (@new_diagramname is null))
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT;
	
		select @u_name = USER_NAME(@owner_id)
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		-- if((@u_name is not null) and (@new_diagramname = @diagramname))	-- nothing will change
		--	return 0;
	
		if(@u_name is null)
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @new_diagramname
		else
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @owner_id and name = @new_diagramname
	
		if((@DiagIdTarg is not null) and  @DiagId <> @DiagIdTarg)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end		
	
		if(@u_name is null)
			update dbo.sysdiagrams set [name] = @new_diagramname, principal_id = @theId where diagram_id = @DiagId
		else
			update dbo.sysdiagrams set [name] = @new_diagramname where diagram_id = @DiagId
		return 0
	END
	\n```\n\n### sp_alterdiagram\n\n```sql\n
	CREATE PROCEDURE dbo.sp_alterdiagram
	(
		@diagramname 	sysname,
		@owner_id	int	= null,
		@version 	int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId 			int
		declare @retval 		int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @ShouldChangeUID	int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid ARG', 16, 1)
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();	 
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		revert;
	
		select @ShouldChangeUID = 0
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		
		if(@DiagId IS NULL or (@IsDbo = 0 and @theId <> @UIDFound))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end
	
		if(@IsDbo <> 0)
		begin
			if(@UIDFound is null or USER_NAME(@UIDFound) is null) -- invalid principal_id
			begin
				select @ShouldChangeUID = 1 ;
			end
		end

		-- update dds data			
		update dbo.sysdiagrams set definition = @definition where diagram_id = @DiagId ;

		-- change owner
		if(@ShouldChangeUID = 1)
			update dbo.sysdiagrams set principal_id = @theId where diagram_id = @DiagId ;

		-- update dds version
		if(@version is not null)
			update dbo.sysdiagrams set version = @version where diagram_id = @DiagId ;

		return 0
	END
	\n```\n\n### sp_dropdiagram\n\n```sql\n
	CREATE PROCEDURE dbo.sp_dropdiagram
	(
		@diagramname 	sysname,
		@owner_id	int	= null
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT; 
		
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		delete from dbo.sysdiagrams where diagram_id = @DiagId;
	
		return 0;
	END
	\n```\n\n### sp_AddCategories\n\n```sql\ncreate   procedure sp_AddCategories
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
END \n```\n\n### sp_AlterCategories\n\n```sql\ncreate   procedure sp_AlterCategories
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
		\n```\n\n### sp_DeleteCategories\n\n```sql\ncreate   procedure sp_DeleteCategories
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
END \n```\n\n### sp_AddNewOrder\n\n```sql\nCREATE procedure sp_AddNewOrder
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
end ;\n```\n\n### sp_ViewUserHistory\n\n```sql\ncreate   procedure sp_ViewUserHistory 
    @id varchar(20)
as begin
set nocount on 
    SELECT o.order_id, o.total_amount, o.status, o.shipping_address, o.created_at,
        (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
    FROM Orders o
    WHERE o.user_id = @id
    ORDER BY o.created_at DESC
end;\n```\n\n### sp_GetOrderDetail\n\n```sql\ncreate   procedure sp_GetOrderDetail
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
end \n```\n\n### vw_CustomerProducts\n\n```sql\ncreate   procedure vw_CustomerProducts 
as begin 
SELECT p.product_id
        , p.product_name
        , p.brand
        , p.unit_price
        , p.image_url
        , p.specs_json
        ,c.cat_name AS category_name
        ,(SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) AS stock
FROM Product p      
LEFT JOIN Categories c ON p.cat_id = c.cat_id
ORDER BY p.product_name
end;\n```\n\n### sp_SearchProducts\n\n```sql\ncreate   procedure sp_SearchProducts
    @query NVARCHAR(255) = NULL
    ,@category NVARCHAR(100) = NULL
    ,@brand NVARCHAR(100) = NULL
    ,@minPrice DECIMAL(18, 2) = NULL
    ,@maxPrice DECIMAL(18, 2) = NULL
as begin 
set nocount on ;
    SELECT p.product_id, p.product_name, p.brand, p.unit_price, p.image_url, p.specs_json,
           c.cat_name AS category_name,
           (SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) AS stock
    FROM Product p 
    LEFT JOIN Categories c ON p.cat_id = c.cat_id
    WHERE 
        (@query IS NULL OR (p.product_name LIKE '%' + @query + '%' OR p.brand LIKE '%' + @query + '%' OR c.cat_name LIKE '%' + @query + '%'))
        AND (@category IS NULL OR c.cat_name = @category)
        AND (@brand IS NULL OR p.brand = @brand)
        AND (@minPrice IS NULL OR p.unit_price >= @minPrice)
        AND (@maxPrice IS NULL OR p.unit_price <= @maxPrice)
    ORDER BY p.product_name;
end ;
\n```\n\n### sp_UpdateUserProfile\n\n```sql\nCREATE   PROCEDURE sp_UpdateUserProfile
    @userId VARCHAR(50),
    @username NVARCHAR(100),
    @phone CHAR(15),
    @address NVARCHAR(MAX),
    @passwordHash VARCHAR(255) = NULL -- Mặc định là NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET username = @username,
        phone_number = @phone,
        default_address = @address,
        -- Nếu @passwordHash không NULL thì cập nhật, ngược lại giữ nguyên cột cũ
        pasword_hash = ISNULL(@passwordHash, pasword_hash) 
    WHERE user_id = @userId;
END
\n```\n\n### sp_GetUserProfile\n\n```sql\nCREATE   PROCEDURE sp_GetUserProfile
    @userId VARCHAR(20) 
AS BEGIN 
SET NOCOUNT ON;
SELECT user_id, username, email, phone_number, default_address, role_name, is_active
    FROM Users
    WHERE user_id = @userId
END;\n```\n\n### sp_ImportInventory\n\n```sql\nCREATE procedure sp_ImportInventory
    @doc_id CHAR(10)
    ,@doc_type TINYINT
    ,@created_by VARCHAR(20)
    ,@tax_id VARCHAR(50) = NULL
    ,@desc NVARCHAR(MAX) = ''
    ,@status TINYINT = 0 --Draft
    ,@inv_id TINYINT = 1 --Default inventory
    ,@order_ref VARCHAR(50) = NULL
    ,@details StockItemType READONLY
as begin 
set nocount on ;
    BEGIN TRANSACTION;
    begin try
        -- 1. Chèn Header đơn nhập/xuất kho
        INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, Suppliers_tax_id, Doc_description, status, inventory_id, order_ref)
        VALUES (@doc_id, @doc_type, @created_by, @tax_id, @desc, @status, @inv_id, @order_ref);

        -- 2. Xử lý Stock_Units (Chỉ dành cho doc_type = 1 - Nhập kho)
        -- Sử dụng NOT EXISTS để chỉ chèn những Serial chưa tồn tại
        IF @doc_type = 1
        BEGIN
            INSERT INTO Stock_Units (serial_number, product_id, status)
            SELECT d.serial_number, d.product_id, 0
            FROM @details d
            WHERE NOT EXISTS (
                SELECT 1 FROM Stock_Units su WHERE su.serial_number = d.serial_number
            );
        END

        -- 3. Chèn vào DOC_Details
        INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
        SELECT @doc_id, serial_number, product_id, unit_price
        FROM @details;

        COMMIT TRANSACTION;
    end try 
    begin catch 
        ROLLBACK TRANSACTION;
        THROW;
    end catch 
end
\n```\n\n### sp_UpdateInventoryDetails\n\n```sql\nCREATE   PROCEDURE sp_UpdateInventoryDetails
    @docId CHAR(10),
    @details StockItemType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Kiểm tra trạng thái phiếu kho
        DECLARE @currentStatus TINYINT
                , @docType TINYINT;
        SELECT @currentStatus = status, @docType = doc_type 
        FROM Inventory_DOCs WHERE doc_id = @docId;

        IF @currentStatus IS NULL
        BEGIN
            ROLLBACK;
            RAISERROR('Không tìm thấy phiếu kho', 16, 1);
            RETURN;
        END

        IF @currentStatus != 0
        BEGIN
            ROLLBACK;
            RAISERROR('Chỉ có thể cập nhật phiếu ở trạng thái Chờ duyệt', 16, 1);
            RETURN;
        END

        -- 2. Xóa chi tiết cũ
        DELETE FROM DOC_Details WHERE doc_id = @docId;

        -- 3. Xử lý Stock_Units nếu là phiếu Nhập (doc_type = 1)
        IF @docType = 1
        BEGIN
            INSERT INTO Stock_Units (serial_number, product_id, status)
            SELECT d.serial_number, d.product_id, 0
            FROM @details d
            WHERE NOT EXISTS (
                SELECT 1 FROM Stock_Units su WHERE su.serial_number = d.serial_number
            );
        END

        -- 4. Chèn chi tiết mới
        INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
        SELECT @docId, serial_number, product_id, unit_price
        FROM @details;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END\n```\n\n### sp_ApproveOrCancelInventoryDoc\n\n```sql\nCREATE   PROCEDURE sp_ApproveOrCancelInventoryDoc
    @docId CHAR(10),
    @targetStatus TINYINT -- 1: Approved, 2: Cancelled
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Lấy thông tin hiện tại và kiểm tra tồn tại
        DECLARE @currentStatus TINYINT, @docType TINYINT, @orderRef VARCHAR(50);
        
        SELECT @currentStatus = status, @docType = doc_type, @orderRef = order_ref
        FROM Inventory_DOCs WHERE doc_id = @docId;

        IF @currentStatus IS NULL
        BEGIN
            ROLLBACK;
            RAISERROR('Không tìm thấy phiếu kho.', 16, 1);
            RETURN;
        END

        -- 2. Chỉ cho phép Duyệt/Hủy nếu đang ở trạng thái Chờ duyệt (0)
        IF @currentStatus != 0
        BEGIN
            ROLLBACK;
            RAISERROR('Chỉ có thể Duyệt hoặc Hủy phiếu đang ở trạng thái Chờ duyệt.', 16, 1);
            RETURN;
        END

        -- 3. Cập nhật trạng thái phiếu kho (Bước này sẽ kích hoạt Trigger xử lý tồn kho)
        UPDATE Inventory_DOCs 
        SET status = @targetStatus 
        WHERE doc_id = @docId;

        -- 4. Cập nhật trạng thái đơn hàng liên quan (Orders) nếu có order_ref
        IF @orderRef IS NOT NULL
        BEGIN
            -- Nếu Duyệt (1) và là phiếu Xuất (2) -> Đơn hàng hoàn thành
            IF @targetStatus = 1 AND @docType = 2
            BEGIN
                UPDATE Orders SET status = 'completed' WHERE order_id = @orderRef;
            END
            -- Nếu Hủy (2) -> Chuyển đơn hàng về trạng thái 'pending' để xử lý lại
            ELSE IF @targetStatus = 2
            BEGIN
                UPDATE Orders SET status = 'pending' WHERE order_id = @orderRef;
            END
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END\n```\n\n### vw_GetAllDoc\n\n```sql\ncreate   procedure vw_GetAllDoc 
as begin 
    SELECT idoc.*, s.supplier_name, o.order_id as order_ref_id
    FROM Inventory_DOCs idoc
    LEFT JOIN Suppliers s ON idoc.Suppliers_tax_id = s.tax_id
    LEFT JOIN Orders o ON idoc.order_ref = o.order_id
    ORDER BY idoc.created_at DESC
set nocount on;
end ;\n```\n\n### sp_GetInventoryDocDetail\n\n```sql\nCREATE PROCEDURE sp_GetInventoryDocDetail
    @docId CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT idoc.*, s.supplier_name,
        (
            SELECT dd.*, p.product_name, p.brand
            FROM DOC_Details dd
            JOIN Product p ON dd.product_id = p.product_id
            WHERE dd.doc_id = idoc.doc_id
            FOR JSON PATH
        ) AS details
    FROM Inventory_DOCs idoc
    LEFT JOIN Suppliers s ON idoc.Suppliers_tax_id = s.tax_id
    WHERE idoc.doc_id = @docId
    FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER
END\n```\n\n### sp_HandleAllSystemAlerts\n\n```sql\n
CREATE   PROCEDURE sp_HandleAllSystemAlerts
AS
BEGIN
    SET NOCOUNT ON;

    -- NHIỆM VỤ 1: Kiểm tra phiếu bảo hành bị "ngâm" (Nhập khách nhưng chưa xuất NCC)
    INSERT INTO System_Alerts (doc_id, message)
    SELECT 
        dd.doc_id, 
        N'Quy trình bảo hành lỗi: Serial [' + dd.serial_number + N'] đã nhập kho bảo hành (Phiếu #' + CAST(dd.doc_id AS NVARCHAR(10)) + N') nhưng chưa có phiếu xuất gửi NCC.'
    FROM DOC_Details dd
    JOIN Inventory_DOCs id ON dd.doc_id = id.doc_id
    WHERE id.doc_type = 4 -- Giả sử 4 là war_cus_in
      AND id.status = 1   -- Đã duyệt
      AND DATEDIFF(HOUR, id.created_at, GETDATE()) > 12 
      AND NOT EXISTS (
          SELECT 1 FROM DOC_Details dd2
          JOIN Inventory_DOCs id2 ON dd2.doc_id = id2.doc_id
          WHERE dd2.serial_number = dd.serial_number AND id2.doc_type = 5 AND id2.status != 2
      )
      AND NOT EXISTS (SELECT 1 FROM System_Alerts WHERE doc_id = dd.doc_id AND is_read = 0);

    -- NHIỆM VỤ 2: Kiểm tra phiếu lưu quá lâu mà không Duyệt/Hủy (Áp dụng cho mọi doc_type)
    INSERT INTO System_Alerts (doc_id, message)
    SELECT 
        doc_id, 
        N'Cảnh báo tồn đọng: Phiếu #' + CAST(doc_id AS NVARCHAR(10)) + N' (Loại ' + CAST(doc_type AS NVARCHAR(5)) + N') đã được lưu quá 24h nhưng vẫn ở trạng thái Chờ.'
    FROM Inventory_DOCs
    WHERE status = 0 -- Trạng thái Chờ/Lưu tạm
      AND DATEDIFF(HOUR, created_at, GETDATE()) > 24
      AND NOT EXISTS (SELECT 1 FROM System_Alerts WHERE doc_id = Inventory_DOCs.doc_id AND is_read = 0);
END;
\n```\n\n### sp_Log\n\n```sql\ncreate   procedure sp_Log 
	@user_id varchar(20) 
	,@action nvarchar(500) 
	,@type varchar(10)
as begin 
set nocount on;
	INSERT INTO ActivityLogs (user_id, action, type) 
	VALUES (@user_id, @action, @type);
end \n```\n\n### vw_ActivityLog\n\n```sql\ncreate   procedure vw_ActivityLog 
as begin
set nocount on;
	SELECT l.*, u.username as [user], u.email
	FROM ActivityLogs l
	LEFT JOIN Users u ON TRIM(l.user_id) = TRIM(u.user_id)
	ORDER BY l.timestamp DESC
end \n```\n\n### vw_AllOrders\n\n```sql\ncreate   procedure vw_AllOrders
as begin
set nocount on;
	SELECT o.*
    , u.username as customer_name
    , u.phone_number as customer_phone
    ,(SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
    FROM Orders o
    LEFT JOIN Users u ON o.user_id = u.user_id
    ORDER BY o.created_at DESC
end \n```\n\n### sp_GetOrderAdminDetail\n\n```sql\nCREATE   PROCEDURE sp_GetOrderAdminDetail
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
END\n```\n\n### sp_GetOrderStockReport\n\n```sql\nCREATE   PROCEDURE sp_GetOrderStockReport
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
END\n```\n\n### sp_ConfirmOrderAndCreateExport\n\n```sql\nCREATE   PROCEDURE sp_ConfirmOrderAndCreateExport
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
END\n```\n\n### sp_ChangeOrderStatus\n\n```sql\ncreate   procedure sp_ChangeOrderStatus 
    @id varchar(20) 
    ,@status varchar(20) 
as begin 
set nocount on;
    UPDATE Orders 
    SET status = @status 
    WHERE order_id = @id
end \n```\n\n### vw_GetAllProducts\n\n```sql\ncreate   procedure vw_GetAllProducts
as begin 
set nocount on;
SELECT p.*
    , c.cat_name as category_name
    ,(SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) as stock
FROM Product p 
LEFT JOIN Categories c ON p.cat_id = c.cat_id
end  \n```\n\n### sp_GetProductDetails\n\n```sql\ncreate   procedure sp_GetProductDetails
    @id int 
as begin 
set nocount on;
    SELECT p.*
        , c.cat_name as category_name
        ,(SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) as stock
    FROM Product p
    LEFT JOIN Categories c ON p.cat_id = c.cat_id
    WHERE p.product_id = @id
end  \n```\n\n### sp_AddProducts\n\n```sql\ncreate   procedure sp_AddProducts
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
end  \n```\n\n### sp_AlterProducts\n\n```sql\ncreate   procedure sp_AlterProducts
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
end  \n```\n\n### sp_DeleteProductWithCheck\n\n```sql\nCREATE   PROCEDURE sp_DeleteProductWithCheck
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
END\n```\n\n## Triggers\n\n### trg_HandleInventoryApproval\n\n```sql\n
        CREATE TRIGGER trg_HandleInventoryApproval
        ON Inventory_DOCs
        AFTER UPDATE
        AS
        BEGIN
            SET NOCOUNT ON;

            -- A. TỰ ĐỘNG GHI NHẬT KÝ & CẬP NHẬT NGÀY
            IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
                       WHERE (i.status = 0 AND d.status = 0) OR (i.status = 1 AND d.status = 0))
            BEGIN
                UPDATE d
                SET 
                    d.Doc_description = ISNULL(d.Doc_description, N'') + 
                                       N' [History: ' + CONVERT(NVARCHAR(20), del.created_at, 120) + N']',
                    d.created_at = GETDATE()
                FROM Inventory_DOCs d
                JOIN inserted i ON d.doc_id = i.doc_id
                JOIN deleted del ON d.doc_id = del.doc_id
                WHERE i.doc_id = del.doc_id AND del.status = 0;
            END

            -- B. TỰ ĐỘNG KIỂM TRA & CẬP NHẬT TỒN KHO
            IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
                       WHERE i.status = 1 AND d.status = 0)
            BEGIN
                -- 1. INSERT MỚI (Cho phiếu Nhập doc_type = 1)
                INSERT INTO Stock_Units (serial_number, product_id, status)
                SELECT dd.serial_number, dd.product_id, 1
                FROM DOC_Details dd
                JOIN inserted i ON dd.doc_id = i.doc_id
                JOIN deleted d ON i.doc_id = d.doc_id
                WHERE i.status = 1 AND d.status = 0 AND i.doc_type = 1
                  AND NOT EXISTS (SELECT 1 FROM Stock_Units s WHERE s.serial_number = dd.serial_number);

                -- 2. KIỂM TRA BẢO MẬT (Phiếu xuất doc_type = 2)
                IF EXISTS (
                    SELECT 1 
                    FROM inserted i
                    JOIN DOC_Details dd ON i.doc_id = dd.doc_id
                    JOIN Stock_Units s ON dd.serial_number = s.serial_number
                    WHERE i.doc_type = 2 AND s.status != 1
                )
                BEGIN
                    DECLARE @InvalidSerials NVARCHAR(MAX);
                    SELECT @InvalidSerials = STRING_AGG(s.serial_number, ', ')
                    FROM inserted i
                    JOIN DOC_Details dd ON i.doc_id = dd.doc_id
                    JOIN Stock_Units s ON dd.serial_number = s.serial_number
                    WHERE i.doc_type = 2 AND s.status != 1;

                    DECLARE @Msg NVARCHAR(MAX) = N'Lỗi: Các Serial sau không sẵn sàng để xuất: ' + @InvalidSerials;
                    RAISERROR (@Msg, 16, 1);
                    ROLLBACK TRANSACTION;
                    RETURN;
                END

                -- 3. CẬP NHẬT TRẠNG THÁI (State Machine)
                UPDATE s
                SET s.status = CASE 
                    WHEN i.doc_type = 1 THEN 1 -- Nhập kho -> Sẵn có
                    WHEN i.doc_type = 2 THEN 2 -- Xuất kho -> Đã bán
                    WHEN i.doc_type = 3 THEN 0 -- Trả NCC -> Hàng lỗi/Hủy
                    WHEN i.doc_type = 4 THEN 4 -- Nhận bảo hành khách -> Đang sửa
                    WHEN i.doc_type = 6 THEN 5 -- NCC trả bảo hành -> Chờ khách nhận
                    WHEN i.doc_type = 7 THEN 2 -- Trả khách bảo hành xong -> Đã bán
                    ELSE s.status 
                END
                FROM Stock_Units s
                JOIN DOC_Details dd ON s.serial_number = dd.serial_number
                JOIN inserted i ON dd.doc_id = i.doc_id
                JOIN deleted d ON i.doc_id = d.doc_id
                WHERE i.status = 1 AND d.status = 0;
            END

            -- C. TRƯỜNG HỢP HỦY PHIẾU (Chuyển sang status = 2)
            IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
                       WHERE i.status = 2 AND d.status = 0) -- Hủy từ bản nháp
            BEGIN
                -- Không cần làm gì với Stock_Units nếu hủy từ bản nháp
                PRINT 'Cancelled draft';
            END
            
            IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
                       WHERE i.status = 2 AND d.status = 1) -- Hủy từ bản đã duyệt
            BEGIN
                UPDATE s
                SET s.status = CASE 
                    WHEN i.doc_type = 2 THEN 1 -- Hủy phiếu xuất -> Sẵn có
                    WHEN i.doc_type = 3 THEN 1 -- Hủy phiếu trả NCC -> Sẵn có
                    WHEN i.doc_type = 1 THEN 0 -- Hủy phiếu nhập -> Hỏng/Vô hiệu
                    WHEN i.doc_type = 7 THEN 5 -- Hủy phiếu trả khách -> Chờ khách nhận
                    ELSE s.status 
                END
                FROM Stock_Units s
                JOIN DOC_Details dd ON s.serial_number = dd.serial_number
                JOIN inserted i ON dd.doc_id = i.doc_id
                WHERE i.status = 2;
            END
        END;
        \n```\n\n### trg_ProtectApprovedDetails\n\n```sql\n
CREATE   TRIGGER trg_ProtectApprovedDetails
ON DOC_Details
FOR INSERT, UPDATE, DELETE 
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu doc_id liên quan đã ở trạng thái Duyệt (1) hoặc Hủy (2)
    IF EXISTS (
        SELECT 1 FROM Inventory_DOCs d
        JOIN (
            SELECT doc_id FROM inserted 
            UNION 
            SELECT doc_id FROM deleted
        ) AS modified ON d.doc_id = modified.doc_id
        WHERE d.status IN (1, 2)
    )
    BEGIN
        RAISERROR (N'Vi phạm nguyên tắc nhật ký: Không thể thêm/sửa/xóa chi tiết của chứng từ đã duyệt hoặc đã hủy.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;


\n```\n\n### trg_HandleInvoiceCompletion\n\n```sql\n CREATE TRIGGER trg_HandleInvoiceCompletion
ON Invoice
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Khi created_at chuyển từ NULL sang có giá trị (Thanh toán hoàn tất)
    IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.invoice_id = d.invoice_id 
               WHERE i.created_at IS NOT NULL AND d.created_at IS NULL)
    BEGIN
        UPDATE s
        SET s.status = 3 -- Đã bán
        FROM Stock_Units s
        JOIN DOC_Details dd ON s.serial_number = dd.serial_number
        JOIN Inventory_DOCs doc ON dd.doc_id = doc.doc_id
        JOIN inserted i ON doc.order_ref= i.order_id
        JOIN deleted d ON i.invoice_id = d.invoice_id
        WHERE i.created_at IS NOT NULL AND d.created_at IS NULL
        AND doc.doc_type = 2 -- Chỉ phiếu xuất bán
        AND s.status = 2;    -- Đang ở trạng thái chờ giao
    END
END;
\n```\n\n### trg_CleanTrashDocs\n\n```sql\n
CREATE   TRIGGER trg_CleanTrashDocs
ON Inventory_DOCs
AFTER UPDATE -- Dùng AFTER để không phải liệt kê tay từng cột
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra: Có phiếu chuyển từ 0 (Nháp) sang 2 (Hủy)
    IF EXISTS (
        SELECT 1 
        FROM inserted i 
        JOIN deleted d ON i.doc_id = d.doc_id 
        WHERE i.status = 2 AND d.status = 0
    )
    BEGIN
        -- QUAN TRỌNG: Chỉ chạy lệnh xóa nếu đây là vòng lặp đầu tiên của Trigger
        -- Điều này ngăn lỗi "vòng lặp vô tận" khi lệnh DELETE kích hoạt lại trigger
        IF TRIGGER_NESTLEVEL() < 2
        BEGIN
            DELETE FROM Inventory_DOCs 
            WHERE doc_id IN (
                SELECT i.doc_id 
                FROM inserted i 
                JOIN deleted d ON i.doc_id = d.doc_id 
                WHERE i.status = 2 AND d.status = 0
            );
        END
    END
END;
\n```\n\n### trg_ProtectApprovedHeader\n\n```sql\n
            CREATE TRIGGER trg_ProtectApprovedHeader
            ON Inventory_DOCs
            FOR UPDATE, DELETE 
            AS
            BEGIN
                SET NOCOUNT ON;

                -- Cho phép các trigger nội bộ thực hiện cập nhật (ví dụ: trg_HandleInventoryApproval cập nhật nhật ký)
                IF TRIGGER_NESTLEVEL() > 1 RETURN;

                -- A. CHỐNG SỬA NGÀY TẠO THỦ CÔNG
                IF UPDATE(created_at)
                BEGIN
                    IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id WHERE i.created_at <> d.created_at)
                    BEGIN
                        -- Chỉ cho phép hệ thống tự update khi Save nháp (0->0) hoặc Duyệt (0->1)
                        IF NOT EXISTS (
                            SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
                            WHERE (i.status = 0 AND d.status = 0) 
                               OR (i.status = 1 AND d.status = 0)
                               OR (i.status = 1 AND d.status = 1 AND ABS(DATEDIFF(SECOND, i.created_at, GETDATE())) <= 5)
                        )
                        BEGIN
                            RAISERROR (N'Bảo mật: Cột ngày tạo do hệ thống quản lý, không được sửa thủ công!', 16, 1);
                            ROLLBACK TRANSACTION; RETURN;
                        END
                    END
                END

                -- B. CHỐNG SỬA/XÓA HEADER KHI ĐÃ CHỐT (Status 1, 2)
                IF EXISTS (SELECT 1 FROM deleted WHERE status IN (1, 2))
                BEGIN
                    -- Ngoại lệ duy nhất: Cho phép đổi status từ Duyệt (1) sang Hủy (2)
                    IF NOT EXISTS (
                        SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
                        WHERE i.status = 2 AND d.status = 1
                    )
                    BEGIN
                        RAISERROR (N'Bảo mật: Chứng từ đã Duyệt/Hủy không thể sửa thông tin hoặc xóa!', 16, 1);
                        ROLLBACK TRANSACTION; RETURN;
                    END
                END
            END;
        \n```\n\n## Views\n\n