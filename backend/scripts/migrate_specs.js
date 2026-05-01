const { sql, poolPromise } = require('../config/db');
const fs = require('fs');
const path = require('path');

const MAPPING = {
    "Vi xử lý (CPU)": ["Công nghệ CPU", "Số nhân", "Số luồng", "Tốc độ CPU", "Loại CPU"],
    "Bộ nhớ (RAM)": ["RAM", "Loại RAM", "Tốc độ Bus RAM", "Hỗ trợ RAM tối đa"],
    "Đồ họa (GPU)": ["Card màn hình", "GPU"],
    "Màn hình": ["Kích thước màn hình", "Độ phân giải", "Tấm nền", "Tần số quét", "Độ phủ màu", "Công nghệ màn hình", "Màn hình cảm ứng"],
    "Lưu trữ": ["Ổ cứng", "Hỗ trợ khe cắm SSD"],
    "Kết nối": ["Cổng giao tiếp", "Kết nối không dây", "LAN", "Bluetooth", "Wi-Fi", "Khe đọc thẻ nhớ"],
    "Tiện ích & Khác": ["Webcam", "Đèn bàn phím", "Bảo mật", "Công nghệ âm thanh", "Tản nhiệt", "Tính năng khác", "Pin", "Trọng lượng", "Kích thước", "Hệ điều hành"]
};

async function migrate() {
    console.log('Starting migration...');
    const pool = await poolPromise;
    
    try {
        // 1. Fetch data
        const result = await pool.request().query('SELECT product_id, specs_json FROM Product');
        const products = result.recordset;
        console.log(`Found ${products.length} products.`);

        // 2. Backup
        const backupPath = path.join(__dirname, 'specs_backup.json');
        fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
        console.log(`Backup saved to ${backupPath}`);

        // 3. Transform and Update
        let updatedCount = 0;
        for (const product of products) {
            let oldSpecs = {};
            try {
                oldSpecs = JSON.parse(product.specs_json || '{}');
            } catch (e) {
                console.warn(`Failed to parse JSON for product ${product.product_id}: ${product.specs_json}`);
                continue;
            }

            // Skip if already nested (contains objects)
            const isAlreadyNested = Object.values(oldSpecs).some(v => typeof v === 'object' && v !== null);
            if (isAlreadyNested) {
                console.log(`Product ${product.product_id} already has nested specs. Skipping.`);
                continue;
            }

            const newSpecs = {};
            const usedKeys = new Set();

            // Map keys to sections
            for (const [section, keys] of Object.entries(MAPPING)) {
                const sectionFields = {};
                for (const key of keys) {
                    if (oldSpecs[key] !== undefined) {
                        sectionFields[key] = String(oldSpecs[key]);
                        usedKeys.add(key);
                    }
                }
                if (Object.keys(sectionFields).length > 0) {
                    newSpecs[section] = sectionFields;
                }
            }

            // Add remaining keys to "Tiện ích & Khác"
            const remainingFields = {};
            for (const [key, value] of Object.entries(oldSpecs)) {
                if (!usedKeys.has(key)) {
                    remainingFields[key] = String(value);
                }
            }
            if (Object.keys(remainingFields).length > 0) {
                if (!newSpecs["Tiện ích & Khác"]) newSpecs["Tiện ích & Khác"] = {};
                Object.assign(newSpecs["Tiện ích & Khác"], remainingFields);
            }

            // Update Database
            const newSpecsJson = JSON.stringify(newSpecs);
            await pool.request()
                .input('id', sql.Int, product.product_id)
                .input('specs', sql.NVarChar, newSpecsJson)
                .query('UPDATE Product SET specs_json = @specs WHERE product_id = @id');
            
            updatedCount++;
            if (updatedCount % 10 === 0) console.log(`Updated ${updatedCount}/${products.length} products...`);
        }

        console.log(`Migration completed. ${updatedCount} products updated.`);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        sql.close();
    }
}

migrate();
