require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function migrateSupplierTaxId() {
    try {
        const pool = await poolPromise;
        console.log('Starting migration of Suppliers_tax_id...');

        // 1. Add Suppliers_tax_id to Inventory_DOCs
        console.log('1. Adding Suppliers_tax_id to Inventory_DOCs... (Skipped, already exists)');
        /*
        try {
            await pool.request().query('ALTER TABLE Inventory_DOCs ADD Suppliers_tax_id CHAR(10) NULL');
        } catch (e) {
            console.log('Column already exists:', e.message);
        }
        */

        // 2. Migrate existing data from DOC_Details to Inventory_DOCs
        console.log('2. Migrating data from DOC_Details to Inventory_DOCs...');
        console.log('Disabling trigger trg_ProtectApprovedHeader...');
        await pool.request().query('DISABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs');
        
        await pool.request().query(`
            UPDATE Inventory_DOCs
            SET Suppliers_tax_id = (
                SELECT TOP 1 Suppliers_tax_id 
                FROM DOC_Details 
                WHERE DOC_Details.doc_id = Inventory_DOCs.doc_id
                AND DOC_Details.Suppliers_tax_id IS NOT NULL
            )
            WHERE doc_type IN (1, 3, 4) -- Import, Return, Warranty
        `);
        console.log('Enabling trigger trg_ProtectApprovedHeader...');
        await pool.request().query('ENABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs');

        // 3. Drop FK on DOC_Details
        console.log('3. Dropping FK_Detail_Supplier on DOC_Details... (Skipped, already dropped)');
        /*
        try {
            await pool.request().query('ALTER TABLE DOC_Details DROP CONSTRAINT FK_Detail_Supplier');
        } catch (e) {
            console.log('Constraint does not exist:', e.message);
        }
        */

        // 4. Drop column Suppliers_tax_id on DOC_Details
        console.log('4. Dropping Suppliers_tax_id on DOC_Details...');
        try {
            await pool.request().query('DROP INDEX IX_DocDetail_Pro_Doc_Ser_Sup ON DOC_Details');
            console.log('Dropped dependent index IX_DocDetail_Pro_Doc_Ser_Sup');
        } catch (e) {
            console.log('Index drop issue:', e.message);
        }
        
        try {
            await pool.request().query('ALTER TABLE DOC_Details DROP COLUMN Suppliers_tax_id');
        } catch (e) {
            if (!e.message.includes('does not exist')) throw e;
            console.log('Column does not exist.');
        }

        // 5. Add FK on Inventory_DOCs
        console.log('5. Adding FK_Doc_Supplier on Inventory_DOCs...');
        try {
            await pool.request().query(`
                ALTER TABLE Inventory_DOCs 
                ADD CONSTRAINT FK_Doc_Supplier 
                FOREIGN KEY (Suppliers_tax_id) REFERENCES Suppliers(tax_id)
            `);
        } catch (e) {
            if (!e.message.includes('already exists')) throw e;
            console.log('Constraint already exists.');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateSupplierTaxId();
