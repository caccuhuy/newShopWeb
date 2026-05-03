const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all activity logs (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT l.*, u.username as [user], u.email
            FROM ActivityLogs l
            LEFT JOIN Users u ON TRIM(l.user_id) = TRIM(u.user_id)
            ORDER BY l.timestamp DESC
        `);
        console.log(`Fetched ${result.recordset.length} logs from DB`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching logs:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Add a new activity log
router.post('/', verifyToken, async (req, res) => {
    const { action, type } = req.body;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.VarChar, userId)
            .input('action', sql.NVarChar, action)
            .input('type', sql.VarChar, type || 'info')
            .query('INSERT INTO ActivityLogs (user_id, action, type) VALUES (@user_id, @action, @type)');
        res.status(201).json({ message: 'Log added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
