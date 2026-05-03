const { sql, poolPromise } = require('../config/db');

/**
 * Log an activity to the database
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - Description of the action
 * @param {string} type - Type of log (info, success, warning, danger)
 */
async function logActivity(userId, action, type = 'info') {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.VarChar, userId)
            .input('action', sql.NVarChar, action)
            .input('type', sql.VarChar, type)
            .query('INSERT INTO ActivityLogs (user_id, action, type) VALUES (@user_id, @action, @type)');
        console.log(`Log recorded: ${action}`);
    } catch (err) {
        console.error('Error recording activity log:', err);
    }
}

module.exports = { logActivity };
