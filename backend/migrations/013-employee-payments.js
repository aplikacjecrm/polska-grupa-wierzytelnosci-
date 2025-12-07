/**
 * Migracja 013: Tabela wypłat dla pracowników
 * 
 * System pensji, premii i bonusów
 */

const sqlite3 = require('sqlite3').verbose();

const migration = {
    version: 13,
    name: 'employee-payments',
    
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Tabela wypłat pracowników
                db.run(`
                    CREATE TABLE IF NOT EXISTS employee_payments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        employee_id INTEGER NOT NULL,
                        payment_type VARCHAR(50) NOT NULL, -- 'salary', 'bonus', 'commission_payout'
                        amount DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(3) DEFAULT 'PLN',
                        period_month INTEGER, -- 1-12
                        period_year INTEGER,
                        description TEXT,
                        payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'check'
                        payment_date DATE,
                        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
                        transaction_reference VARCHAR(100),
                        notes TEXT,
                        created_by INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        paid_at DATETIME,
                        paid_by INTEGER,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (employee_id) REFERENCES users(id),
                        FOREIGN KEY (created_by) REFERENCES users(id),
                        FOREIGN KEY (paid_by) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Błąd tworzenia tabeli employee_payments:', err);
                        reject(err);
                    } else {
                        console.log('✅ Tabela employee_payments utworzona');
                        
                        // Indeksy
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_employee_payments_employee 
                            ON employee_payments(employee_id)
                        `);
                        
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_employee_payments_status 
                            ON employee_payments(status)
                        `);
                        
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_employee_payments_period 
                            ON employee_payments(period_year, period_month)
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
            db.run('DROP TABLE IF EXISTS employee_payments', (err) => {
                if (err) {
                    console.error('❌ Błąd usuwania tabeli employee_payments:', err);
                    reject(err);
                } else {
                    console.log('✅ Tabela employee_payments usunięta');
                    resolve();
                }
            });
        });
    }
};

module.exports = migration;
