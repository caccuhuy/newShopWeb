const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';", [], (err, tables) => {
        if (err) return console.error(err);
        let promises = tables.map(table => {
            return new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, row) => {
                    if (err) reject(err);
                    else resolve({ name: table.name, count: row.count });
                });
            });
        });
        
        Promise.all(promises).then(results => {
            results.forEach(r => console.log(`${r.name}: ${r.count} rows`));
            db.close();
        }).catch(err => {
            console.error(err);
            db.close();
        });
    });
});
