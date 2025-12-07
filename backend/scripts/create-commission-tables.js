/**
 * Tworzy tabele employee_commissions i employee_payments
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('📍 Database path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

const sql = `
-- Tabela prowizji pracowników
CREATE TABLE IF NOT EXISTS employee_commissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    amount REAL NOT NULL,
    rate REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'paid', 'rejected')),
    description TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    paid_at DATETIME,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela wypłat pracowników
CREATE TABLE IF NOT EXISTS employee_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'salary' CHECK(payment_type IN ('salary', 'bonus', 'commission', 'expense_reimbursement', 'other')),
    payment_date DATE NOT NULL,
    payment_method TEXT DEFAULT 'bank_transfer',
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    commission_id INTEGER REFERENCES employee_commissions(id) ON DELETE SET NULL,
    reference_number TEXT,
    notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_employee_commissions_employee ON employee_commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_commissions_case ON employee_commissions(case_id);
CREATE INDEX IF NOT EXISTS idx_employee_commissions_status ON employee_commissions(status);
CREATE INDEX IF NOT EXISTS idx_employee_commissions_created ON employee_commissions(created_at);

CREATE INDEX IF NOT EXISTS idx_employee_payments_employee ON employee_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_payments_date ON employee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_employee_payments_status ON employee_payments(status);
CREATE INDEX IF NOT EXISTS idx_employee_payments_commission ON employee_payments(commission_id);
`;

db.exec(sql, (err) => {
    if (err) {
        console.error('❌ Błąd tworzenia tabel:', err);
        process.exit(1);
    }
    
    console.log('✅ Tabele utworzone pomyślnie!');
    
    // Weryfikacja
    db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('employee_commissions', 'employee_payments')
    `, (err, rows) => {
        if (err) {
            console.error('❌ Błąd weryfikacji:', err);
        } else {
            console.log('\n📊 Utworzone tabele:');
            rows.forEach(r => console.log(`   ✅ ${r.name}`));
        }
        
        db.close();
        console.log('\n🎉 Gotowe! Teraz możesz utworzyć testowe dane.');
        process.exit(0);
    });
});
