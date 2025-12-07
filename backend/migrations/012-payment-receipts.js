/**
 * Migracja 012: Tabela faktur i paragonów
 * 
 * Automatyczne generowanie dokumentów po opłaceniu płatności
 */

const sqlite3 = require('sqlite3').verbose();

const migration = {
    version: 12,
    name: 'payment-receipts',
    
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Tabela faktur i paragonów
                db.run(`
                    CREATE TABLE IF NOT EXISTS payment_receipts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        payment_id INTEGER NOT NULL,
                        receipt_type VARCHAR(20) NOT NULL, -- 'invoice' lub 'receipt'
                        receipt_number VARCHAR(50) UNIQUE NOT NULL,
                        issue_date DATE NOT NULL,
                        client_id INTEGER,
                        case_id INTEGER,
                        amount DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(3) DEFAULT 'PLN',
                        tax_rate DECIMAL(5,2) DEFAULT 23, -- 23%, 8%, 0%
                        net_amount DECIMAL(10,2),
                        tax_amount DECIMAL(10,2),
                        gross_amount DECIMAL(10,2),
                        description TEXT,
                        payment_method VARCHAR(50),
                        pdf_path TEXT,
                        sent_to_client BOOLEAN DEFAULT 0,
                        sent_at DATETIME,
                        created_by INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (payment_id) REFERENCES payments(id),
                        FOREIGN KEY (client_id) REFERENCES clients(id),
                        FOREIGN KEY (case_id) REFERENCES cases(id),
                        FOREIGN KEY (created_by) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Błąd tworzenia tabeli payment_receipts:', err);
                        reject(err);
                    } else {
                        console.log('✅ Tabela payment_receipts utworzona');
                        
                        // Indeksy dla szybszego wyszukiwania
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_receipts_payment 
                            ON payment_receipts(payment_id)
                        `);
                        
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_receipts_client 
                            ON payment_receipts(client_id)
                        `);
                        
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_receipts_date 
                            ON payment_receipts(issue_date)
                        `);
                        
                        console.log('✅ Indeksy utworzone');
                        resolve();
                    }
                });
            });
        });
    },
    
    down: (db) => {
        return new Promise((resolve, reject) => {
            db.run('DROP TABLE IF EXISTS payment_receipts', (err) => {
                if (err) {
                    console.error('❌ Błąd usuwania tabeli payment_receipts:', err);
                    reject(err);
                } else {
                    console.log('✅ Tabela payment_receipts usunięta');
                    resolve();
                }
            });
        });
    }
};

module.exports = migration;
