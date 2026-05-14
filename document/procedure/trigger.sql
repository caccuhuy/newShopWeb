USE E_COM;
GO

CREATE OR ALTER TRIGGER trg_HandleInventoryApproval
ON Inventory_DOCs
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- A. TỰ ĐỘNG GHI NHẬT KÝ & CẬP NHẬT NGÀY (Logic Update)
    -- Chạy khi Save nháp (0->0) hoặc Duyệt (0->1)
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

    -- B. TỰ ĐỘNG KIỂM TRA CÁC PHIẾU
    -- Chỉ kích hoạt khi trạng thái thay đổi từ 0 (Lưu tạm) sang 1 (Đã duyệt)
    IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
               WHERE i.status = 1 AND d.status = 0)
    BEGIN
        
        -- 1. KIỂM TRA BẢO MẬT: Nếu là phiếu xuất bán (doc_type = 2), các máy phải ở trạng thái 'Sẵn' (1)
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

            DECLARE @Msg NVARCHAR(MAX) = N'Lỗi: Các sản phẩm sau không sẵn sàng để xuất bán: ' + @InvalidSerials;
            RAISERROR (@Msg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 2. CẬP NHẬT TRẠNG THÁI MÁY (State Machine)
        UPDATE s
        SET s.status = CASE 
            WHEN i.doc_type = 1 THEN 1 -- Nhập kho -> Sẵn
            WHEN i.doc_type = 2 THEN 2 -- Xuất bán -> Chờ giao
            WHEN i.doc_type = 3 THEN 0 -- Trả NCC -> Hàng hỏng
            WHEN i.doc_type = 4 THEN 4 -- Nhận bảo hành khách -> Đang sửa
            WHEN i.doc_type = 6 THEN 5 -- NCC trả hàng bảo hành -> Chờ khách nhận
            WHEN i.doc_type = 7 THEN 3 -- Trả khách bảo hành xong -> Đã bán/Thành công
            ELSE s.status 
        END
        FROM Stock_Units s
        JOIN DOC_Details dd ON s.serial_number = dd.serial_number
        JOIN inserted i ON dd.doc_id = i.doc_id
        JOIN deleted d ON i.doc_id = d.doc_id
        WHERE i.status = 1 AND d.status = 0;
    END
    -- TRƯỜNG HỢP HỦY PHIẾU (Chuyển sang status = 2)
    -- Áp dụng cho mọi loại phiếu khi bị hủy
    IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.doc_id = d.doc_id 
               WHERE i.status = 2 AND d.status = 1)
    BEGIN
        UPDATE s
        SET s.status = CASE 
            -- Nếu hủy phiếu XUẤT (2): Trả về 1 (Sẵn) để bán tiếp 
            WHEN i.doc_type = 2 THEN 1 

            -- Nếu hủy phiếu TRẢ HÀNG NCC (3): Mặc định là do nhầm lẫn,
            -- máy vẫn bình thường nên trả về 1 (Sẵn) 
            WHEN i.doc_type = 3 THEN 1 

            -- Nếu hủy phiếu NHẬP (1): Trả về 0 (Vì chưa vào kho hợp lệ) 
            WHEN i.doc_type = 1 THEN 0 

            -- Nếu hủy phiếu TRẢ KHÁCH (7): Trả về 5 (Sửa xong, chờ khách nhận) 
            WHEN i.doc_type = 7 THEN 5

            ELSE s.status 
        END
        FROM Stock_Units s
        JOIN DOC_Details dd ON s.serial_number = dd.serial_number
        JOIN inserted i ON dd.doc_id = i.doc_id
        WHERE i.status = 2;
    END
END;
GO

CREATE OR ALTER TRIGGER trg_ProtectApprovedHeader
ON Inventory_DOCs
FOR UPDATE, DELETE 
AS
BEGIN
    SET NOCOUNT ON;

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
GO

CREATE OR ALTER TRIGGER trg_ProtectApprovedDetails
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


GO

USE E_COM;
GO

CREATE OR ALTER TRIGGER trg_CleanTrashDocs
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
        -- Điều này ngăn lỗi vòng lặp vô tận khi lệnh DELETE kích hoạt lại trigger
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
GO