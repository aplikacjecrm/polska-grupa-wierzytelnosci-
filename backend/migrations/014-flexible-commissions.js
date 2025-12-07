/**
 * Migracja 014: Elastyczny system prowizji
 * 
 * Dodaje kolumny do payments pozwalające na kontrolę prowizji:
 * - enable_commission - czy naliczać prowizję (checkbox)
 * - commission_rate_override - nadpisanie stawki prowizji
 * - commission_recipient_override - nadpisanie odbiorcy prowizji
 */

const sqlite3 = require('sqlite3').verbose();

const migration = {
    version: 14,
    name: 'flexible-commissions',
    
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                console.log('🔧 Dodawanie kolumn kontroli prowizji do tabeli payments...');
                
                // Dodaj kolumny
                db.run(`
                    ALTER TABLE payments 
                    ADD COLUMN enable_commission INTEGER DEFAULT 1
                `, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('❌ Błąd dodawania enable_commission:', err);
                        reject(err);
                    } else {
                        console.log('✅ Kolumna enable_commission dodana (domyślnie: TAK)');
                        
                        db.run(`
                            ALTER TABLE payments 
                            ADD COLUMN commission_rate_override DECIMAL(5,2)
                        `, (err) => {
                            if (err && !err.message.includes('duplicate column')) {
                                console.error('❌ Błąd dodawania commission_rate_override:', err);
                                reject(err);
                            } else {
                                console.log('✅ Kolumna commission_rate_override dodana');
                                
                                db.run(`
                                    ALTER TABLE payments 
                                    ADD COLUMN commission_recipient_override INTEGER
                                `, (err) => {
                                    if (err && !err.message.includes('duplicate column')) {
                                        console.error('❌ Błąd dodawania commission_recipient_override:', err);
                                        reject(err);
                                    } else {
                                        console.log('✅ Kolumna commission_recipient_override dodana');
                                        console.log('✅ Migracja zakończona - prowizje są teraz elastyczne!');
                                        resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    },
    
    down: (db) => {
        return new Promise((resolve, reject) => {
            console.log('⚠️ Usuwanie kolumn prowizji...');
            // SQLite nie wspiera ALTER TABLE DROP COLUMN w starszych wersjach
            // W produkcji użyj migracji forward-only
            console.log('⚠️ Rollback wymaga ręcznej migracji (SQLite limitation)');
            resolve();
        });
    }
};

module.exports = migration;
