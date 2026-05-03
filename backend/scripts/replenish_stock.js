const { sql, poolPromise } = require('../config/db');

async function addStock() {
    console.log('Adding stock to products...');
    const pool = await poolPromise;
    
    try {
        // 1. Get products with their current stock
        const result = await pool.request().query(`
            SELECT p.product_id, p.product_name,
            (SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) as current_stock
            FROM Product p
        `);
        const products = result.recordset;
        
        let totalAdded = 0;
        for (const product of products) {
            if (product.current_stock < 5) {
                const toAdd = Math.floor(Math.random() * 11) + 10; // Add 10-20 units
                console.log(`Adding ${toAdd} units to ${product.product_name} (Current: ${product.current_stock})`);
                
                for (let i = 0; i < toAdd; i++) {
                    const sn = 'SN-' + Math.random().toString(36).substring(2, 11).toUpperCase();
                    await pool.request()
                        .input('pid', sql.Int, product.product_id)
                        .input('sn', sql.VarChar, sn)
                        .query('INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, 1)');
                }
                totalAdded += toAdd;
            }
        }

        console.log(`Successfully added ${totalAdded} total stock units to the database.`);

    } catch (err) {
        console.error('Failed to add stock:', err);
    } finally {
        sql.close();
    }
}

addStock();
