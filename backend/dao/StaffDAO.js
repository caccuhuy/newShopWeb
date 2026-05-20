const { sql, poolPromise } = require('../config/db');

class StaffDAO {
    static async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_GetAllStaffs');
        return result.recordset;
    }

    static async getPasswordHash(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, userId)
            .query('SELECT pasword_hash FROM Users WHERE user_id = @userId');
        
        if (result.recordset.length === 0) return null;
        return result.recordset[0].pasword_hash;
    }

    static async create(name, email, phoneNumber, role, passwordHash) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, name)
            .input('pasword_hash', sql.VarChar, passwordHash)
            .input('email', sql.VarChar, email)
            .input('phone_number', sql.Char, phoneNumber)
            .input('role_name', sql.VarChar, role)
            .execute('sp_AddStaff');
        return result.recordset[0];
    }

    static async toggleActive(targetId, adminId, isActive) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('targetId', sql.VarChar, targetId)
            .input('adminId', sql.VarChar, adminId)
            .input('isActive', sql.Bit, isActive)
            .execute('sp_ToggleUserActive');
        return result.recordset[0];
    }

    static async resetPassword(userId, passwordHash) {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.VarChar, userId)
            .input('hash', sql.VarChar, passwordHash)
            .execute('sp_ResetPassword');
    }
}

module.exports = StaffDAO;
