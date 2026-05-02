require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function updateTrigger() {
    try {
        const pool = await poolPromise;
        const sqlScript = `
        ALTER TRIGGER trg_HandleInventoryApproval
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
        `;
        
        await pool.request().query(sqlScript);
        console.log('Trigger trg_HandleInventoryApproval updated successfully.');
        
        // Data Cleanup
        console.log('Cleaning up data (mapping status 3 to 2, and shipping orders to completed)...');
        await pool.request().query("UPDATE Stock_Units SET status = 2 WHERE status = 3");
        await pool.request().query("UPDATE Orders SET status = 'completed' WHERE status = 'shipping'");
        console.log('Data cleanup completed.');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateTrigger();
