const { sql, poolPromise } = require('../config/db');

class SupplierDAO {
    static async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_Suppliers');
        return result.recordset;
    }

    static async create(taxId, name) {
        const pool = await poolPromise;
        await pool.request()
            .input('tax', sql.Char(10), taxId)
            .input('name', sql.NVarChar, name)
            .execute('sp_AddSupplier');
    }

    static async update(taxId, name) {
        const pool = await poolPromise;
        await pool.request()
            .input('tax', sql.Char(10), taxId)
            .input('name', sql.NVarChar, name)
            .execute('sp_UpdateSupplier');
    }

    static async delete(taxId) {
        const pool = await poolPromise;
        await pool.request()
            .input('tax', sql.Char(10), taxId)
            .execute('sp_DeleteSupplier');
    }
}

module.exports = SupplierDAO;
