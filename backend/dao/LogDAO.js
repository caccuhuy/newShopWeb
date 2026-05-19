const { sql, poolPromise } = require('../config/db');

class LogDAO {
    static async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_ActivityLog');
        return result.recordset;
    }

    static async create(userId, action, type) {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.VarChar, userId)
            .input('action', sql.NVarChar, action)
            .input('type', sql.VarChar, type || 'info')
            .execute('sp_Log');
    }
}

module.exports = LogDAO;
