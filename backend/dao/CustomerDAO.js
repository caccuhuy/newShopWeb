const { sql, poolPromise } = require('../config/db');

class CustomerDAO {
    static async getProfile(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, userId)
            .execute('sp_GetUserProfile');
        return result.recordset[0];
    }

    static async updateProfile(userId, name, phoneNumber, defaultAddress, passwordHash = null) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('userId', sql.VarChar, userId)
            .input('username', sql.NVarChar, name)
            .input('phone', sql.Char, phoneNumber)
            .input('address', sql.NVarChar, defaultAddress);

        if (passwordHash) {
            request.input('passwordHash', sql.VarChar, passwordHash);
        }

        await request.execute('sp_UpdateUserProfile');
    }
}

module.exports = CustomerDAO;
