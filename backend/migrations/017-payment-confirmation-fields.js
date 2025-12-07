/**
 * Migracja 017: Dodanie pól do ręcznego potwierdzania płatności
 * 
 * Dodaje kolumny:
 * - payment_reference (numer referencyjny/ID transakcji)
 * - confirmation_file (ścieżka do pliku potwierdzenia)
 * - confirmed_by (kto potwierdził płatność)
 */

const sqlite3 = require('sqlite3').verbose();

const migration = {
    version: 17,
    name: 'payment-confirmation-fields',
    
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Dodaj kolumnę payment_reference
                db.run(`
                    ALTER TABLE payments 
                    ADD COLUMN payment_reference TEXT
                `, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('❌ Błąd dodawania kolumny payment_reference:', err);
                    } else {
                        console.log('✅ Kolumna payment_reference dodana');
                    }
                });
                
                // Dodaj kolumnę confirmation_file
                db.run(`
                    ALTER TABLE payments 
                    ADD COLUMN confirmation_file TEXT
                `, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('❌ Błąd dodawania kolumny confirmation_file:', err);
                    } else {
                        console.log('✅ Kolumna confirmation_file dodana');
                    }
                });
                
                // Dodaj kolumnę confirmed_by
                db.run(`
                    ALTER TABLE payments 
                    ADD COLUMN confirmed_by INTEGER
                `, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('❌ Błąd dodawania kolumny confirmed_by:', err);
                        reject(err);
                    } else {
                        console.log('✅ Kolumna confirmed_by dodana');
                        
                        // Dodaj indeks
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_payments_confirmed_by 
                            ON payments(confirmed_by)
                        `, (err) => {
                            if (err) {
                                console.error('❌ Błąd tworzenia indeksu:', err);
                            } else {
                                console.log('✅ Indeks idx_payments_confirmed_by utworzony');
                            }
                        });
                        
                        console.log('✅ Migracja 017 zakończona - pola potwierdzania płatności dodane');
                        resolve();
                    }
                });
            });
        });
    },
    
    down: (db) => {
        return new Promise((resolve, reject) => {
            console.log('⚠️ Rollback migracji 017 - usuwanie kolumn nie jest wspierane w SQLite');
            console.log('💡 Aby usunąć kolumny, trzeba:');
            console.log('   1. Utworzyć nową tabelę bez tych kolumn');
            console.log('   2. Skopiować dane');
            console.log('   3. Usunąć starą tabelę');
            console.log('   4. Zmienić nazwę nowej tabeli');
            resolve();
        });
    }
};

module.exports = migration;
