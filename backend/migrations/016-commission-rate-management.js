/**
 * Migracja 016 - System zarządzania stawkami prowizji (HR + Finance)
 * 
 * Funkcjonalność:
 * - Historia zmian stawek prowizji
 * - Komentarze do zmian
 * - Powiązanie HR (ustalanie) z Finance (wypłaty)
 * - Zatwierdzanie zmian przez Admin
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do bazy danych
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');

console.log('📍 Migration 016: Ścieżka do bazy:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        process.exit(1);
    }
    console.log('✅ Połączono z bazą danych');
});

db.serialize(() => {
    console.log('🔄 [016] Rozpoczynam migrację systemu zarządzania stawkami prowizji...');

    // 1. Tabela historii zmian stawek prowizji
    db.run(`
        CREATE TABLE IF NOT EXISTS commission_rate_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            user_role VARCHAR(50) NOT NULL,
            old_rate DECIMAL(5,2),
            new_rate DECIMAL(5,2) NOT NULL,
            change_reason TEXT,
            comment TEXT,
            changed_by INTEGER NOT NULL,
            changed_by_department VARCHAR(50),
            approved_by INTEGER,
            approved_at DATETIME,
            status VARCHAR(20) DEFAULT 'pending',
            effective_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (changed_by) REFERENCES users(id),
            FOREIGN KEY (approved_by) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Błąd tworzenia tabeli commission_rate_changes:', err);
        } else {
            console.log('✅ Tabela commission_rate_changes utworzona');
        }
    });

    // 2. Tabela konfiguracji wynagrodzeń (HR)
    db.run(`
        CREATE TABLE IF NOT EXISTS employee_compensation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            base_salary DECIMAL(10,2),
            currency VARCHAR(10) DEFAULT 'PLN',
            employment_type VARCHAR(50),
            contract_type VARCHAR(50),
            commission_enabled INTEGER DEFAULT 1,
            default_commission_rate DECIMAL(5,2),
            bonus_eligible INTEGER DEFAULT 1,
            hr_notes TEXT,
            last_review_date DATE,
            next_review_date DATE,
            created_by INTEGER,
            updated_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Błąd tworzenia tabeli employee_compensation:', err);
        } else {
            console.log('✅ Tabela employee_compensation utworzona');
        }
    });

    // 3. Tabela zmian wynagrodzeń (historia)
    db.run(`
        CREATE TABLE IF NOT EXISTS salary_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            old_salary DECIMAL(10,2),
            new_salary DECIMAL(10,2) NOT NULL,
            change_reason TEXT,
            comment TEXT,
            changed_by INTEGER NOT NULL,
            changed_by_department VARCHAR(50),
            approved_by INTEGER,
            approved_at DATETIME,
            status VARCHAR(20) DEFAULT 'pending',
            effective_date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (changed_by) REFERENCES users(id),
            FOREIGN KEY (approved_by) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Błąd tworzenia tabeli salary_changes:', err);
        } else {
            console.log('✅ Tabela salary_changes utworzona');
        }
    });

    // 4. Dodaj indeksy
    db.run('CREATE INDEX IF NOT EXISTS idx_commission_rate_changes_user ON commission_rate_changes(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_commission_rate_changes_status ON commission_rate_changes(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_employee_compensation_user ON employee_compensation(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_salary_changes_user ON salary_changes(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_salary_changes_status ON salary_changes(status)');

    console.log('✅ Indeksy utworzone');

    // 5. Wstaw domyślne dane dla istniejących pracowników
    db.run(`
        INSERT INTO employee_compensation (user_id, commission_enabled, default_commission_rate, employment_type, contract_type)
        SELECT 
            u.id,
            1 as commission_enabled,
            CASE 
                WHEN u.role = 'lawyer' THEN 15.00
                WHEN u.role = 'case_manager' THEN 10.00
                WHEN u.role = 'client_manager' THEN 5.00
                ELSE 0.00
            END as default_commission_rate,
            'full_time' as employment_type,
            'employment' as contract_type
        FROM users u
        WHERE u.id NOT IN (SELECT user_id FROM employee_compensation)
        AND u.role IN ('lawyer', 'case_manager', 'client_manager', 'admin', 'hr', 'finance')
    `, (err) => {
        if (err) {
            console.error('❌ Błąd wstawiania domyślnych danych:', err);
        } else {
            console.log('✅ Domyślne dane dla pracowników wstawione');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('❌ Błąd zamykania bazy:', err);
        process.exit(1);
    }
    console.log('✅ [016] Migracja zakończona pomyślnie!');
    console.log('');
    console.log('📋 UTWORZONO:');
    console.log('  ✓ Tabela commission_rate_changes (historia zmian stawek prowizji)');
    console.log('  ✓ Tabela employee_compensation (konfiguracja wynagrodzeń)');
    console.log('  ✓ Tabela salary_changes (historia zmian wynagrodzeń)');
    console.log('  ✓ Indeksy dla wydajności');
    console.log('');
    console.log('🎯 SYSTEM:');
    console.log('  • HR → ustala stawki i wynagrodzenia');
    console.log('  • Admin → zatwierdza zmiany');
    console.log('  • Finance → wypłaca na podstawie zatwierdzonych stawek');
    process.exit(0);
});
