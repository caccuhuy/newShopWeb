const { sql, poolPromise } = require('../config/db');

class AuthDAO {
    static async loginUser(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .execute('sp_LoginUser');
        return result.recordset[0];
    }

    static async registerCustomer(name, email, phone, address, passwordHash) {
        const pool = await poolPromise;
        const result = await pool.request()
            .output('user_id', sql.VarChar(10))
            .input('username', sql.NVarChar, name)
            .input('email', sql.VarChar, email)
            .input('phone_number', sql.Char, phone)
            .input('default_address', sql.NVarChar, address)
            .input('pasword_hash', sql.VarChar, passwordHash)
            .execute('sp_RegisterCustomer');
        return result.recordset[0];
    }
}

module.exports = AuthDAO;
