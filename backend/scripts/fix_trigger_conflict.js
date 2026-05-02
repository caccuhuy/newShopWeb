require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function fixTrigger() {
    try {
        const pool = await poolPromise;
        console.log('Updating trigger trg_ProtectApprovedHeader...');
        
        await pool.request().query(`
            ALTER TRIGGER trg_ProtectApprovedHeader
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
        `);
        
        console.log('Trigger updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating trigger:', err);
        process.exit(1);
    }
}

fixTrigger();
