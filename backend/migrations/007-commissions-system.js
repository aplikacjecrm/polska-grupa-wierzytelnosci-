/**
 * MIGRACJA 007: System Prowizji
 * 
 * Cel: Dodanie systemu prowizji dla mecenasów i opiekunów spraw/klientów
 * 
 * Tabele:
 * - lawyer_commissions: Prowizje dla mecenasów i opiekunów
 * - commission_rates: Stawki prowizji (% lub kwota stała)
 * 
 * Połączenia:
 * - Płatności (payments) → Prowizje
 * - Sprawy (cases) → Przypisani pracownicy
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');

console.log('🔧 [MIGRATION 007] Uruchamianie migracji systemu prowizji...');
console.log('📍 Baza danych:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z bazą danych');
});

async function runMigration() {
  try {
    // ============================================
    // TABELA STAWEK PROWIZJI (KONFIGURACJA)
    // ============================================
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS commission_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          commission_type TEXT DEFAULT 'percentage',
          commission_value REAL NOT NULL,
          applies_to TEXT DEFAULT 'all',
          min_amount REAL,
          max_amount REAL,
          is_active BOOLEAN DEFAULT 1,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Utworzono tabelę: commission_rates');
          resolve();
        }
      });
    });

    // ============================================
    // TABELA PROWIZJI (WYLICZONE)
    // ============================================
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS lawyer_commissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id INTEGER NOT NULL,
          case_id INTEGER,
          client_id INTEGER,
          user_id INTEGER NOT NULL,
          user_role TEXT NOT NULL,
          payment_amount REAL NOT NULL,
          commission_rate REAL NOT NULL,
          commission_amount REAL NOT NULL,
          commission_type TEXT DEFAULT 'percentage',
          status TEXT DEFAULT 'pending',
          paid_at DATETIME,
          paid_by INTEGER,
          payment_method TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (payment_id) REFERENCES payments(id),
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (paid_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Utworzono tabelę: lawyer_commissions');
          resolve();
        }
      });
    });

    // ============================================
    // INDEKSY DLA WYDAJNOŚCI
    // ============================================
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_lawyer_commissions_user 
        ON lawyer_commissions(user_id)
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Utworzono indeks: idx_lawyer_commissions_user');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_lawyer_commissions_payment 
        ON lawyer_commissions(payment_id)
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Utworzono indeks: idx_lawyer_commissions_payment');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_lawyer_commissions_status 
        ON lawyer_commissions(status)
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Utworzono indeks: idx_lawyer_commissions_status');
          resolve();
        }
      });
    });

    // ============================================
    // DODAJ DOMYŚLNE STAWKI PROWIZJI
    // ============================================
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR IGNORE INTO commission_rates 
        (id, user_id, role, commission_type, commission_value, applies_to, notes)
        VALUES 
        (1, 0, 'lawyer', 'percentage', 15.0, 'all', 'Domyślna stawka dla mecenasów - 15%'),
        (2, 0, 'case_manager', 'percentage', 10.0, 'all', 'Domyślna stawka dla opiekunów spraw - 10%'),
        (3, 0, 'client_manager', 'percentage', 5.0, 'all', 'Domyślna stawka dla opiekunów klientów - 5%')
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Dodano domyślne stawki prowizji');
          resolve();
        }
      });
    });

    console.log('\n✅ Migracja 007 zakończona pomyślnie!');
    console.log('\n📊 SYSTEM PROWIZJI:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Tabela commission_rates - stawki prowizji');
    console.log('✅ Tabela lawyer_commissions - wyliczone prowizje');
    console.log('✅ Indeksy wydajności');
    console.log('✅ Domyślne stawki:');
    console.log('   - Mecenas (lawyer): 15%');
    console.log('   - Opiekun sprawy (case_manager): 10%');
    console.log('   - Opiekun klienta (client_manager): 5%');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Błąd migracji:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Uruchom migrację
runMigration()
  .then(() => {
    console.log('✅ Migracja zakończona');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migracja nie powiodła się:', error);
    process.exit(1);
  });
