const { poolPromise } = require('../config/db');

async function createTable() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLogs' AND xtype='U')
            BEGIN
                CREATE TABLE ActivityLogs (
                    log_id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id VARCHAR(20),
                    action NVARCHAR(MAX) NOT NULL,
                    type VARCHAR(50) DEFAULT 'info',
                    timestamp DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES Users(user_id)
                )
            END
        `);
        console.log('ActivityLogs table created or already exists.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        process.exit();
    }
}

createTable();
