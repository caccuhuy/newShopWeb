const { sql, poolPromise } = require('../config/db');

class CategoryDAO {
    static async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Categories");
        return result.recordset;
    }

    static async create(name) {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .execute('sp_AddCategories');
    }

    static async update(id, name) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .execute('sp_AlterCategories');
    }

    static async delete(id) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_DeleteCategories');
    }
}

module.exports = CategoryDAO;
