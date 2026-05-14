CREATE OR ALTER PROCEDURE sp_LoginUser
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
END

go 

CREATE OR ALTER PROCEDURE sp_RegisterCustomer
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
END