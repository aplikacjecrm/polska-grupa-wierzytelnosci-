/**
 * Migracja 015: System zatwierdzania prowizji
 * 
 * Dodaje kolumny do lawyer_commissions:
 * - status (pending/approved/rejected/paid)
 * - approved_by (kto zatwierdził)
 * - approved_at (kiedy zatwierdził)
 * - rejection_reason (powód odrzucenia)
 */

const sqlite3 = require('sqlite3').verbose();

const migration = {
    version: 15,
    name: 'commission-approval',
    
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                console.log('🔧 Dodawanie systemu zatwierdzania prowizji...');
                
                // Dodaj kolumny
                db.run(`
                    ALTER TABLE lawyer_commissions 
                    ADD COLUMN status VARCHAR(20) DEFAULT 'pending'
                `, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('❌ Błąd dodawania status:', err);
                        reject(err);
                    } else {
                        console.log('✅ Kolumna status dodana (pending/approved/rejected/paid)');
                        
                        db.run(`
                            ALTER TABLE lawyer_commissions 
                            ADD COLUMN approved_by INTEGER
                        `, (err) => {
                            if (err && !err.message.includes('duplicate column')) {
                                console.error('❌ Błąd dodawania approved_by:', err);
                                reject(err);
                            } else {
                                console.log('✅ Kolumna approved_by dodana');
                                
                                db.run(`
                                    ALTER TABLE lawyer_commissions 
                                    ADD COLUMN approved_at DATETIME
                                `, (err) => {
                                    if (err && !err.message.includes('duplicate column')) {
                                        console.error('❌ Błąd dodawania approved_at:', err);
                                        reject(err);
                                    } else {
                                        console.log('✅ Kolumna approved_at dodana');
                                        
                                        db.run(`
                                            ALTER TABLE lawyer_commissions 
                                            ADD COLUMN rejection_reason TEXT
                                        `, (err) => {
                                            if (err && !err.message.includes('duplicate column')) {
                                                console.error('❌ Błąd dodawania rejection_reason:', err);
                                                reject(err);
                                            } else {
                                                console.log('✅ Kolumna rejection_reason dodana');
                                                
                                                // Ustaw status dla starych prowizji na 'approved'
                                                db.run(`
                                                    UPDATE lawyer_commissions 
                                                    SET status = 'approved' 
                                                    WHERE status IS NULL OR status = 'pending'
                                                `, (err) => {
                                                    if (err) {
                                                        console.error('⚠️ Błąd aktualizacji starych prowizji:', err);
                                                    } else {
                                                        console.log('✅ Stare prowizje oznaczone jako zatwierdzone');
                                                    }
                                                    
                                                    console.log('✅ Migracja zakończona - system zatwierdzania gotowy!');
                                                    resolve();
                                                });
                                            }
                                        });
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
            console.log('⚠️ Rollback nie jest wspierany dla SQLite');
            resolve();
        });
    }
};

module.exports = migration;
