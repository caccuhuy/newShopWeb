const { sql, poolPromise } = require('../config/db');

async function seed() {
    try {
        const pool = await poolPromise;
        console.log('Starting seed process...');

        // 1. Fetch reference data
        const customers = (await pool.request().query("SELECT user_id FROM Users WHERE role_name = 'Customer'")).recordset;
        const products = (await pool.request().query("SELECT product_id, unit_price FROM Product")).recordset;
        const staff = (await pool.request().query("SELECT user_id FROM Users WHERE role_name IN ('Admin', 'Staff')")).recordset;
        const inventory = (await pool.request().query("SELECT inventory_id FROM Inventory_address")).recordset;
        const suppliers = (await pool.request().query("SELECT tax_id FROM Suppliers")).recordset;

        if (customers.length === 0 || products.length === 0 || staff.length === 0 || inventory.length === 0 || suppliers.length === 0) {
            console.error('Missing base data (Users, Products, Inventory, or Suppliers). Please ensure they exist.');
            return;
        }

        console.log(`Found ${customers.length} customers, ${products.length} products, ${staff.length} staff.`);

        // Disable triggers
        console.log('Disabling triggers for seeding...');
        await pool.request().query('DISABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs');
        await pool.request().query('DISABLE TRIGGER trg_ProtectApprovedDetails ON DOC_Details');
        await pool.request().query('DISABLE TRIGGER trg_HandleInventoryApproval ON Inventory_DOCs');

        // 3. Generate 100 Orders
        for (let i = 0; i < 100; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
            const orderId = `ORD-${suffix}`;
            const statusRoll = Math.random();
            const status = statusRoll < 0.7 ? 'completed' : (statusRoll < 0.9 ? 'pending' : 'cancelled');
            
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));
            
            const itemCount = Math.floor(Math.random() * 3) + 1;
            let totalAmount = 0;
            const orderItems = [];
            const addedProducts = new Set();

            while (orderItems.length < itemCount) {
                const product = products[Math.floor(Math.random() * products.length)];
                if (addedProducts.has(product.product_id)) continue;
                addedProducts.add(product.product_id);
                const quantity = Math.floor(Math.random() * 2) + 1;
                totalAmount += product.unit_price * quantity;
                orderItems.push({
                    product_id: product.product_id,
                    quantity: quantity,
                    unit_price: product.unit_price
                });
            }

            await pool.request()
                .input('order_id', sql.VarChar, orderId)
                .input('user_id', sql.VarChar, customer.user_id)
                .input('total_amount', sql.Decimal(18, 2), totalAmount)
                .input('status', sql.VarChar, status)
                .input('address', sql.NVarChar, 'Hà Nội, Việt Nam')
                .input('created_at', sql.DateTime, date)
                .query(`INSERT INTO Orders (order_id, user_id, total_amount, status, shipping_address, created_at) 
                        VALUES (@order_id, @user_id, @total_amount, @status, @address, @created_at)`);

            for (const item of orderItems) {
                await pool.request()
                    .input('order_id', sql.VarChar, orderId)
                    .input('product_id', sql.Int, item.product_id)
                    .input('quantity', sql.Int, item.quantity)
                    .input('unit_price', sql.Decimal(18, 2), item.unit_price)
                    .query(`INSERT INTO Order_Details (order_id, product_id, quantity, unit_price) 
                            VALUES (@order_id, @product_id, @quantity, @unit_price)`);
            }

            if (status === 'completed') {
                const docId = `EX-${suffix}`;
                const creator = staff[Math.floor(Math.random() * staff.length)];
                const inv = inventory[Math.floor(Math.random() * inventory.length)];

                await pool.request()
                    .input('doc_id', sql.Char(15), docId)
                    .input('doc_type', sql.TinyInt, 2)
                    .input('created_by', sql.VarChar, creator.user_id)
                    .input('created_at', sql.DateTime, date)
                    .input('desc', sql.NVarChar, `Xuất kho cho đơn hàng ${orderId}`)
                    .input('status', sql.TinyInt, 1) 
                    .input('inv_id', sql.TinyInt, inv.inventory_id)
                    .input('order_ref', sql.VarChar, orderId)
                    .query(`INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, created_at, Doc_description, status, inventory_id, order_ref)
                            VALUES (@doc_id, @doc_type, @created_by, @created_at, @desc, @status, @inv_id, @order_ref)`);

                for (const item of orderItems) {
                    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
                    const sn = `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                    await pool.request()
                        .input('sn', sql.VarChar, sn)
                        .input('pid', sql.Int, item.product_id)
                        .input('status', sql.TinyInt, 2) 
                        .query(`INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, @status)`);

                    await pool.request()
                        .input('doc_id', sql.Char(15), docId)
                        .input('sn', sql.VarChar, sn)
                        .input('pid', sql.Int, item.product_id)
                        .input('price', sql.Decimal(18, 2), item.unit_price)
                        .query(`INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
                                VALUES (@doc_id, @sn, @pid, @price)`);
                }
            }
        }

        // 4. Generate 20 Import Docs
        console.log('Generating import docs...');
        for (let i = 0; i < 20; i++) {
            const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
            const docId = `IM-${suffix}`;
            const creator = staff[Math.floor(Math.random() * staff.length)];
            const inv = inventory[Math.floor(Math.random() * inventory.length)];
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));

            await pool.request()
                .input('doc_id', sql.Char(15), docId)
                .input('doc_type', sql.TinyInt, 1)
                .input('created_by', sql.VarChar, creator.user_id)
                .input('created_at', sql.DateTime, date)
                .input('desc', sql.NVarChar, 'Nhập hàng định kỳ từ nhà cung cấp')
                .input('status', sql.TinyInt, 1)
                .input('inv_id', sql.TinyInt, inv.inventory_id)
                .input('tax_id', sql.Char(10), supplier.tax_id)
                .query(`INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, created_at, Doc_description, status, inventory_id, Suppliers_tax_id)
                        VALUES (@doc_id, @doc_type, @created_by, @created_at, @desc, @status, @inv_id, @tax_id)`);

            const product = products[Math.floor(Math.random() * products.length)];
            const sn = `SN-IN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

            await pool.request()
                .input('sn', sql.VarChar, sn)
                .input('pid', sql.Int, product.product_id)
                .input('status', sql.TinyInt, 1) 
                .query(`INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, @status)`);

            await pool.request()
                .input('doc_id', sql.Char(15), docId)
                .input('sn', sql.VarChar, sn)
                .input('pid', sql.Int, product.product_id)
                .input('price', sql.Decimal(18, 2), product.unit_price * 0.8)
                .query(`INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
                                VALUES (@doc_id, @sn, @pid, @price)`);
        }

        // Enable triggers
        console.log('Enabling triggers...');
        await pool.request().query('ENABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs');
        await pool.request().query('ENABLE TRIGGER trg_ProtectApprovedDetails ON DOC_Details');
        await pool.request().query('ENABLE TRIGGER trg_HandleInventoryApproval ON Inventory_DOCs');

        console.log('Seed completed successfully!');
    } catch (err) {
        console.error('Seed error:', err);
        // Try to re-enable triggers in case of error
        try {
            const pool = await poolPromise;
            await pool.request().query('ENABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs');
            await pool.request().query('ENABLE TRIGGER trg_ProtectApprovedDetails ON DOC_Details');
            await pool.request().query('ENABLE TRIGGER trg_HandleInventoryApproval ON Inventory_DOCs');
        } catch (e) {}
    } finally {
        sql.close();
    }
}

seed();
