CREATE OR ALTER PROCEDURE sp_UpdateUserProfile
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
GO

CREATE OR ALTER PROCEDURE sp_GetUserProfile
    @userId VARCHAR(20) 
AS BEGIN 
SET NOCOUNT ON;
SELECT user_id, username, email, phone_number, default_address, role_name, is_active
    FROM Users
    WHERE user_id = @userId
END;