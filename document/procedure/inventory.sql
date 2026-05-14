use E_COM;
go
    
create or alter procedure vw_GetAllDoc 
as begin 
    SELECT idoc.*, s.supplier_name, o.order_id as order_ref_id
    FROM Inventory_DOCs idoc
    LEFT JOIN Suppliers s ON idoc.Suppliers_tax_id = s.tax_id
    LEFT JOIN Orders o ON idoc.order_ref = o.order_id
    ORDER BY idoc.created_at DESC
set nocount on;
end ;

go 

CREATE OR ALTER PROCEDURE sp_GetInventoryDocDetail
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
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
END

go 
CREATE TYPE StockItemType AS TABLE (
    product_id INT,
    serial_number VARCHAR(50),
    unit_price DECIMAL(18, 2)
);

GO

create or alter procedure sp_ImportInventory
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

go

CREATE OR ALTER PROCEDURE sp_UpdateInventoryDetails
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
END
go 

CREATE OR ALTER PROCEDURE sp_ApproveOrCancelInventoryDoc
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
END
go 

CREATE OR ALTER PROCEDURE sp_ValidateSerialNumber
    @serial_number VARCHAR(50),
    @doc_type INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @exists BIT = 0;
    DECLARE @status TINYINT;
    DECLARE @productId INT;
    DECLARE @isValid BIT = 0;
    DECLARE @message NVARCHAR(255) = N'';

    -- 1. Kiểm tra sự tồn tại của Serial
    SELECT @exists = 1, @status = status, @productId = product_id 
    FROM Stock_Units 
    WHERE serial_number = @serial_number;

    -- 2. Xử lý logic theo từng loại phiếu kho (doc_type)
    -- 1: Nhập, 2: Xuất, 3: Trả NCC, 4: Nhận BH, 6: NCC Trả BH, 7: Trả BH khách
    IF @doc_type = 1 -- Nhập kho
    BEGIN
        IF @exists = 1 AND @status != 0
        BEGIN
            SET @isValid = 0;
            SET @message = N'Số Serial này đã tồn tại trong hệ thống.';
        END
        ELSE
        BEGIN
            SET @isValid = 1;
            SET @message = N'Serial hợp lệ để nhập mới.';
        END
    END
    ELSE IF @doc_type = 2 -- Xuất kho
    BEGIN
        IF @exists = 0
        BEGIN
            SET @isValid = 0;
            SET @message = N'Số Serial không tồn tại trong kho.';
        END
        ELSE IF @status != 1 -- Giả định 1 là "Trong kho"
        BEGIN
            SET @isValid = 0;
            SET @message = N'Serial không khả dụng (Trạng thái hiện tại: ' + CAST(@status AS VARCHAR) + ').';
        END
        ELSE
        BEGIN
            SET @isValid = 1;
            SET @message = N'Serial hợp lệ để xuất.';
        END
    END
    ELSE -- Các loại phiếu khác
    BEGIN
        SET @isValid = @exists;
        SET @message = CASE WHEN @exists = 1 THEN N'Tìm thấy Serial' ELSE N'Không tìm thấy Serial' END;
    END

    -- 3. Trả về kết quả kèm thông tin sản phẩm
    SELECT 
        @isValid AS isValid, 
        @message AS message,
        p.product_name, 
        p.brand,
        @productId AS product_id
    FROM (SELECT 1 as dummy) d -- Tạo dòng giả để Join
    LEFT JOIN Product p ON p.product_id = @productId;
END