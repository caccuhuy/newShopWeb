create or alter procedure vw_GetAllStaffs
as begin 
set nocount on;
SELECT user_id
	, username
	, email
	, phone_number
	, role_name
	, is_active 
FROM Users WHERE role_name IN ('Staff', 'Admin')
end 
go

CREATE OR ALTER PROCEDURE sp_AddStaff
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
END

go

CREATE OR ALTER PROCEDURE sp_ToggleUserActive
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
END

go 
create or alter procedure sp_ResetPassword
    @user_id varchar(20) 
    , @hash varchar(255) 
as begin 
set nocount on ;
    UPDATE Users 
    SET pasword_hash = @hash 
    WHERE user_id = @user_id
end 