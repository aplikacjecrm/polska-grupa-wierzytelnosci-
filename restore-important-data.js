// PRZYWRÓĆ płatności, zadania i terminy z backupu

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const currentDbPath = path.join(__dirname, 'data', 'komunikator.db');
const backupPath = path.join(__dirname, 'data', 'backup_before_cleanup_1765138688188.db');

console.log('🔧 PRZYWRACAM ważne dane z backupu...\n');

if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup nie istnieje:', backupPath);
    process.exit(1);
}

const backupDb = new sqlite3.Database(backupPath, sqlite3.OPEN_READONLY);
const currentDb = new sqlite3.Database(currentDbPath);

// Tabele do przywrócenia
const tablesToRestore = [
    'payments',
    'employee_tasks',
    'employee_reviews',
    'activity_logs'  // Mogą zawierać ważne terminy
];

async function restoreTable(tableName) {
    return new Promise((resolve, reject) => {
        // Sprawdź czy tabela istnieje w backup
        backupDb.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) {
                console.log(`⚠️  ${tableName}: Nie istnieje w backup - ${err.message}`);
                resolve();
                return;
            }
            
            if (rows.length === 0) {
                console.log(`✅ ${tableName}: Pusta w backup (nic do przywrócenia)`);
                resolve();
                return;
            }
            
            console.log(`🔄 ${tableName}: Przywracam ${rows.length} rekordów...`);
            
            // Pobierz kolumny
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(',');
            const columnNames = columns.join(',');
            
            // Wstaw każdy rekord
            let inserted = 0;
            let errors = 0;
            
            rows.forEach((row, index) => {
                const values = columns.map(col => row[col]);
                
                currentDb.run(
                    `INSERT OR REPLACE INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
                    values,
                    (err) => {
                        if (err) {
                            errors++;
                            if (errors === 1) console.error(`   ❌ Błąd:`, err.message);
                        } else {
                            inserted++;
                        }
                        
                        // Ostatni rekord
                        if (index === rows.length - 1) {
                            console.log(`✅ ${tableName}: Przywrócono ${inserted}/${rows.length} rekordów`);
                            if (errors > 0) console.log(`   ⚠️  Błędów: ${errors}`);
                            resolve();
                        }
                    }
                );
            });
        });
    });
}

async function restore() {
    try {
        for (const table of tablesToRestore) {
            await restoreTable(table);
        }
        
        console.log('\n🎉 GOTOWE! Ważne dane przywrócone!');
        console.log('\n📊 PRZYWRÓCONO:');
        
        for (const table of tablesToRestore) {
            await new Promise((resolve) => {
                currentDb.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
                    if (!err && row) {
                        console.log(`   ✅ ${table}: ${row.count} rekordów`);
                    }
                    resolve();
                });
            });
        }
        
        backupDb.close();
        currentDb.close();
        
        console.log('\n✅ Baza zaktualizowana - płatności, zadania i terminy ZACHOWANE!');
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        backupDb.close();
        currentDb.close();
    }
}

restore();
