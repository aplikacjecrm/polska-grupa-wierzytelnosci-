const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// === CLOUD DEPLOYMENT: Copy seed database to Volume ===
// Volume mounts OVER /app/data, so we keep seed DB in /app/db-seed/
const VOLUME_DB_PATH = '/app/data/komunikator.db';
const SEED_DB_PATH = '/app/db-seed/komunikator.db';  // This is NOT covered by Volume mount

const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';

console.log('[DB INIT] isRailway:', isRailway);
console.log('[DB INIT] SEED_DB_PATH:', SEED_DB_PATH);
console.log('[DB INIT] SEED exists:', fs.existsSync(SEED_DB_PATH));
console.log('[DB INIT] VOLUME_DB_PATH:', VOLUME_DB_PATH);
console.log('[DB INIT] VOLUME exists:', fs.existsSync(VOLUME_DB_PATH));

if (fs.existsSync(SEED_DB_PATH)) {
    const seedSize = fs.statSync(SEED_DB_PATH).size;
    console.log('[DB INIT] SEED DB size:', seedSize, 'bytes (', (seedSize/1024/1024).toFixed(2), 'MB)');
}

if (fs.existsSync(VOLUME_DB_PATH)) {
    const volSize = fs.statSync(VOLUME_DB_PATH).size;
    console.log('[DB INIT] VOLUME DB size:', volSize, 'bytes (', (volSize/1024/1024).toFixed(2), 'MB)');
}

// SEED DATABASE: Skopiuj seed DB jeśli volume jest pusty/mały LUB seed jest nowszy
if (isRailway && fs.existsSync(SEED_DB_PATH)) {
    const volumeSize = fs.existsSync(VOLUME_DB_PATH) ? fs.statSync(VOLUME_DB_PATH).size : 0;
    const seedSize = fs.statSync(SEED_DB_PATH).size;
    
    console.log('[DB INIT] Checking: Volume size:', volumeSize, 'Seed size:', seedSize);
    
    // Kopiuj jeśli seed DB ma jakiekolwiek dane (>100KB) i (volume nie istnieje LUB jest pusty <100KB)
    if (seedSize > 100000 && volumeSize < 100000) {
        console.log('[DB INIT] COPYING seed database to Volume...');
        try {
            // Ensure /app/data directory exists
            if (!fs.existsSync('/app/data')) {
                fs.mkdirSync('/app/data', { recursive: true });
            }
            fs.copyFileSync(SEED_DB_PATH, VOLUME_DB_PATH);
            console.log('[DB INIT] SUCCESS! Seed database copied to Volume!');
        } catch (err) {
            console.error('[DB INIT] ERROR copying database:', err.message);
        }
    } else {
        console.log('[DB INIT] No copy needed. Seed:', seedSize, 'Volume:', volumeSize);
    }
}


// GŁÓWNA BAZA DANYCH - ZAWSZE use bazy w głównym katalogu data/ (NIE backend/data/)
// Ścieżka: komunikator-app/data/komunikator.db
const DB_PATH = isRailway ? VOLUME_DB_PATH : path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');
console.log('?? Database path:', DB_PATH);

// Check if to prawidłowa baza (powinna mieć > 5MB)
if (fs.existsSync(DB_PATH)) {
  const stats = fs.statSync(DB_PATH);
  const sizeMB = stats.size / (1024 * 1024);
  console.log(`?? Database size: ${sizeMB.toFixed(2)} MB`);
  if (sizeMB < 1) {
    console.warn('?? UWAGA: Baza danych jest mała! Może to być zła baza.');
  }
}

// Upewnij się że katalog data istnieje
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela użytkowników
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'client',
          user_role TEXT DEFAULT 'client',
          client_id INTEGER,
          initials TEXT,
          avatar TEXT,
          status TEXT DEFAULT 'offline',
          last_seen DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id)
        )
      `);

      // ========== EMPLOYEE HR TABLES ==========
      // Tabela profili pracowników
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          phone TEXT,
          position TEXT,
          department TEXT,
          hire_date DATE,
          bio TEXT,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabela zadań pracowników (HR tasks)
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assigned_to INTEGER NOT NULL,
          assigned_by INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'pending',
          priority TEXT DEFAULT 'medium',
          due_date DATETIME,
          case_id INTEGER,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id),
          FOREIGN KEY (assigned_by) REFERENCES users(id),
          FOREIGN KEY (case_id) REFERENCES cases(id)
        )
      `);

      // Tabela aktywności pracowników
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action_type TEXT NOT NULL,
          action_description TEXT,
          related_entity_type TEXT,
          related_entity_id INTEGER,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabela ocen pracowników
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id INTEGER NOT NULL,
          reviewer_id INTEGER,
          rating INTEGER CHECK (rating BETWEEN 1 AND 5),
          review_text TEXT,
          review_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES users(id),
          FOREIGN KEY (reviewer_id) REFERENCES users(id)
        )
      `);

      // Tabela ticketów pracowników
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'medium',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          FOREIGN KEY (employee_id) REFERENCES users(id)
        )
      `);

      // Tabela załączników zadań
      db.run(`
        CREATE TABLE IF NOT EXISTS task_attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          uploaded_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES employee_tasks(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);

      // Tabela komentarzy zadań
      db.run(`
        CREATE TABLE IF NOT EXISTS task_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          author_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES employee_tasks(id),
          FOREIGN KEY (author_id) REFERENCES users(id)
        )
      `);
      // ========================================

      // Tabela wiadomości czatu
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          attachments TEXT,
          read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id),
          FOREIGN KEY (receiver_id) REFERENCES users(id)
        )
      `);

      // Tabela konfiguracji kont email
      db.run(`
        CREATE TABLE IF NOT EXISTS email_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          email TEXT NOT NULL,
          imap_host TEXT NOT NULL,
          imap_port INTEGER NOT NULL,
          imap_secure BOOLEAN DEFAULT 1,
          smtp_host TEXT NOT NULL,
          smtp_port INTEGER NOT NULL,
          smtp_secure BOOLEAN DEFAULT 0,
          password TEXT NOT NULL,
          is_default BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabela sesji
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // ===== MODUŁ CRM =====

      // Tabela klientów
      db.run(`
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          company_name TEXT,
          email TEXT,
          phone TEXT,
          pesel TEXT,
          nip TEXT,
          address_street TEXT,
          address_city TEXT,
          address_postal TEXT,
          address_country TEXT DEFAULT 'Polska',
          notes TEXT,
          status TEXT DEFAULT 'active',
          assigned_to INTEGER,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);
      
      // Dodaj kolumnę assigned_to jeśli nie istnieje
      db.run(`
        ALTER TABLE clients ADD COLUMN assigned_to INTEGER
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny assigned_to do clients:', err);
        }
      });
      
      // Dodaj kolumnę updated_by dla śledzenia kto ostatnio edytował klienta
      db.run(`
        ALTER TABLE clients ADD COLUMN updated_by INTEGER
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny updated_by do clients:', err);
        } else {
          console.log('? Dodano kolumnę updated_by do tabeli clients (śledzenie edycji)');
        }
      });
      
      // Dodaj kolumnę additional_caretaker dla sprawy
      db.run(`
        ALTER TABLE cases ADD COLUMN additional_caretaker INTEGER
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny additional_caretaker do cases:', err);
        } else {
          console.log('? Dodano kolumnę additional_caretaker (dodatkowy opiekun sprawy)');
        }
      });
      
      // Dodaj kolumny sędzia i referent do spraw
      db.run(`ALTER TABLE cases ADD COLUMN judge_name TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny judge_name:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN referent TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny referent:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_department TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_department:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_office TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_office:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_id TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_id:', err);
        } else {
          console.log('? Dodano kolumnę prosecutor_id (ID prokuratury z bazy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_name TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_name:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN indictment_number TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny indictment_number:', err);
        }
      });
      
      // Dodaj kolumnę case_manager_id do spraw
      db.run(`ALTER TABLE cases ADD COLUMN case_manager_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny case_manager_id:', err);
        }
      });
      
      // Nowe pola - rodzaj sądu i organy ścigania
      db.run(`ALTER TABLE cases ADD COLUMN court_type TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_type:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN auxiliary_prosecutor TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny auxiliary_prosecutor:', err);
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN investigation_authority TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny investigation_authority:', err);
        }
      });
      
      // Dodaj kolumnę case_subtype (podtyp sprawy dla wewnętrznego rozróżnienia)
      db.run(`ALTER TABLE cases ADD COLUMN case_subtype TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny case_subtype:', err);
        } else {
          console.log('? Dodano kolumnę case_subtype dla podtypów spraw');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN police_case_number TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny police_case_number:', err);
        }
      });
      
      // === NOWE KOLUMNY DLA INTEGRACJI Z BAZĄ SĄDÓW ===
      
      db.run(`ALTER TABLE cases ADD COLUMN court_id TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_id:', err);
        } else {
          console.log('? Dodano kolumnę court_id (ID sądu z bazy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_signature TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_signature:', err);
        } else {
          console.log('? Dodano kolumnę court_signature (sygnatura akt w sądzie)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_address TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_address:', err);
        } else {
          console.log('? Dodano kolumnę court_address (pełny adres sądu)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_phone TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_phone:', err);
        } else {
          console.log('? Dodano kolumnę court_phone (telefon do sądu)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_email TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_email:', err);
        } else {
          console.log('? Dodano kolumnę court_email (email sądu)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_coordinates TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_coordinates:', err);
        } else {
          console.log('? Dodano kolumnę court_coordinates (JSON: {lat, lng} dla mapy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN court_website TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny court_website:', err);
        } else {
          console.log('? Dodano kolumnę court_website (strona internetowa sądu)');
        }
      });
      
      // === NOWE KOLUMNY DLA PROKURATURY Z BAZY ===
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_address TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_address:', err);
        } else {
          console.log('? Dodano kolumnę prosecutor_address (adres prokuratury)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_phone TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_phone:', err);
        } else {
          console.log('? Dodano kolumnę prosecutor_phone (telefon prokuratury)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_email TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_email:', err);
        } else {
          console.log('? Dodano kolumnę prosecutor_email (email prokuratury)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN prosecutor_website TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny prosecutor_website:', err);
        } else {
          console.log('? Dodano kolumnę prosecutor_website (strona www prokuratury)');
        }
      });
      
      // === NOWE KOLUMNY DLA KOMENDY POLICJI Z BAZY ===
      
      db.run(`ALTER TABLE cases ADD COLUMN police_id TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny police_id:', err);
        } else {
          console.log('? Dodano kolumnę police_id (ID komendy z bazy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN police_address TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny police_address:', err);
        } else {
          console.log('? Dodano kolumnę police_address (adres komendy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN police_phone TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny police_phone:', err);
        } else {
          console.log('? Dodano kolumnę police_phone (telefon komendy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN police_email TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny police_email:', err);
        } else {
          console.log('? Dodano kolumnę police_email (email komendy)');
        }
      });
      
      db.run(`ALTER TABLE cases ADD COLUMN police_website TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny police_website:', err);
        } else {
          console.log('? Dodano kolumnę police_website (strona www komendy)');
        }
      });
      
      // === HASŁO DOSTĘPU DO SPRAWY ===
      db.run(`ALTER TABLE cases ADD COLUMN access_password TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny access_password:', err);
        } else {
          console.log('? Dodano kolumnę access_password (hasło dostępu do szczegółów sprawy)');
        }
      });
      
      // Dodaj kolumny user_role i initials do users
      db.run(`ALTER TABLE users ADD COLUMN user_role TEXT DEFAULT 'client'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny user_role:', err);
        }
      });
      
      db.run(`ALTER TABLE users ADD COLUMN initials TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny initials:', err);
        }
      });

      // Tabela spraw
      db.run(`
        CREATE TABLE IF NOT EXISTS cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          case_number TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          case_type TEXT NOT NULL,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'medium',
          court_name TEXT,
          court_signature TEXT,
          opposing_party TEXT,
          value_amount REAL,
          value_currency TEXT DEFAULT 'PLN',
          assigned_to INTEGER,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          closed_at DATETIME,
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Tabela dokumentów
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          client_id INTEGER,
          document_code TEXT,
          title TEXT NOT NULL,
          description TEXT,
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          file_type TEXT,
          category TEXT,
          uploaded_by INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);
      
      // Dodaj kolumnę document_code jeśli nie istnieje
      db.run(`
        ALTER TABLE documents ADD COLUMN document_code TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny document_code:', err);
        }
      });
      
      // Dodaj kolumny plików jeśli nie istnieją (dla starych baz)
      db.run(`ALTER TABLE documents ADD COLUMN file_name TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny file_name:', err);
        }
      });
      
      db.run(`ALTER TABLE documents ADD COLUMN file_path TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny file_path:', err);
        }
      });
      
      db.run(`ALTER TABLE documents ADD COLUMN file_size INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny file_size:', err);
        }
      });
      
      db.run(`ALTER TABLE documents ADD COLUMN file_type TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny file_type:', err);
        }
      });

      // Tabela załączników uniwersalnych
      db.run(`
        CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER,
          attachment_code TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          file_type TEXT,
          category TEXT,
          uploaded_by INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);

      // Tabela notatek
      db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER,
          client_id INTEGER,
          title TEXT,
          content TEXT NOT NULL,
          note_type TEXT DEFAULT 'general',
          is_important BOOLEAN DEFAULT 0,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Tabela terminów/wydarzeń
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER,
          client_id INTEGER,
          event_code TEXT,
          title TEXT NOT NULL,
          description TEXT,
          event_type TEXT NOT NULL,
          location TEXT,
          start_date DATETIME NOT NULL,
          end_date DATETIME,
          reminder_minutes INTEGER DEFAULT 60,
          is_all_day BOOLEAN DEFAULT 0,
          status TEXT DEFAULT 'scheduled',
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);
      
      // Dodaj kolumnę event_code jeśli nie istnieje
      db.run(`ALTER TABLE events ADD COLUMN event_code TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny event_code:', err);
        }
      });
      
      // Dodaj kolumnę extra_fields dla dodatkowych pól (JSON)
      db.run(`ALTER TABLE events ADD COLUMN extra_fields TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny extra_fields:', err);
        }
      });
      
      // === TABELA WPISÓW KALENDARZA ===
      // Łączy wydarzenia z kalendarzami użytkowników/klientów
      db.run(`
        CREATE TABLE IF NOT EXISTS calendar_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          calendar_type TEXT DEFAULT 'personal',
          visibility TEXT DEFAULT 'private',
          reminder_enabled BOOLEAN DEFAULT 1,
          reminder_minutes INTEGER DEFAULT 1440,
          color TEXT,
          is_synced BOOLEAN DEFAULT 0,
          synced_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli calendar_entries:', err);
        } else {
          console.log('? Tabela calendar_entries utworzona');
        }
      });
      
      // Indeksy dla szybszego wyszukiwania
      db.run(`CREATE INDEX IF NOT EXISTS idx_calendar_event ON calendar_entries(event_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_entries(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_calendar_type ON calendar_entries(calendar_type)`);
      
      // === ELASTYCZNA ARCHITEKTURA: CUSTOM FIELDS ===
      
      // Dodaj custom_fields do spraw
      db.run(`ALTER TABLE cases ADD COLUMN custom_fields TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny cases.custom_fields:', err);
        }
      });
      
      // Dodaj custom_fields do klientów
      db.run(`ALTER TABLE clients ADD COLUMN custom_fields TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny clients.custom_fields:', err);
        }
      });
      
      // Dodaj metadata do dokumentów
      db.run(`ALTER TABLE documents ADD COLUMN metadata TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny documents.metadata:', err);
        }
      });
      
      // Dodaj event_id dla załączników wydarzeń
      db.run(`ALTER TABLE documents ADD COLUMN event_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny documents.event_id:', err);
        }
      });
      
      // Dodaj is_collective dla spraw zbiorowych
      db.run(`ALTER TABLE cases ADD COLUMN is_collective BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny is_collective:', err);
        }
      });
      
      // === MODUŁ ŚWIADKÓW ===
      
      // Tabela świadków
      db.run(`
        CREATE TABLE IF NOT EXISTS case_witnesses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          witness_code TEXT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          side TEXT DEFAULT 'neutral',
          relation_to_case TEXT DEFAULT 'neutral',
          contact_phone TEXT,
          contact_email TEXT,
          address TEXT,
          status TEXT DEFAULT 'confirmed',
          withdrawal_date DATETIME,
          withdrawal_reason TEXT,
          reliability_score INTEGER DEFAULT 5,
          notes TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);
      
      // Dodaj kolumnę 'side' jeśli nie istnieje (our_side/opposing_side/neutral)
      db.run(`ALTER TABLE case_witnesses ADD COLUMN side TEXT DEFAULT 'neutral'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny side:', err);
        }
      });
      
      // Tabela zeznań świadków
      db.run(`
        CREATE TABLE IF NOT EXISTS witness_testimonies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          witness_id INTEGER NOT NULL,
          testimony_date DATETIME NOT NULL,
          testimony_type TEXT DEFAULT 'written',
          testimony_content TEXT NOT NULL,
          version_number INTEGER DEFAULT 1,
          is_retracted BOOLEAN DEFAULT 0,
          retraction_date DATETIME,
          retraction_reason TEXT,
          credibility_assessment TEXT,
          recorded_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (witness_id) REFERENCES case_witnesses(id),
          FOREIGN KEY (recorded_by) REFERENCES users(id)
        )
      `);
      
      // === MODUŁ SCENARIUSZY ===
      
      // Tabela scenariuszy sprawy
      db.run(`
        CREATE TABLE IF NOT EXISTS case_scenarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          scenario_name TEXT NOT NULL,
          scenario_type TEXT DEFAULT 'primary',
          description TEXT,
          probability INTEGER DEFAULT 50,
          estimated_outcome TEXT,
          estimated_costs DECIMAL(10,2),
          estimated_duration_days INTEGER,
          risks TEXT,
          advantages TEXT,
          requirements TEXT,
          status TEXT DEFAULT 'draft',
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          activated_at DATETIME,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);
      
      // Tabela kroków scenariusza
      db.run(`
        CREATE TABLE IF NOT EXISTS scenario_steps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          scenario_id INTEGER NOT NULL,
          step_number INTEGER NOT NULL,
          step_title TEXT NOT NULL,
          step_description TEXT,
          responsible_person TEXT,
          deadline DATE,
          status TEXT DEFAULT 'pending',
          completed_date DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (scenario_id) REFERENCES case_scenarios(id)
        )
      `);
      
      // === MODUŁ STRONY PRZECIWNEJ ===
      
      // Tabela informacji o stronie przeciwnej
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          party_name TEXT NOT NULL,
          party_type TEXT DEFAULT 'individual',
          legal_representative TEXT,
          representative_contact TEXT,
          financial_situation TEXT,
          credibility_assessment TEXT,
          known_tactics TEXT,
          weaknesses TEXT,
          strengths TEXT,
          previous_cases TEXT,
          settlement_willingness TEXT,
          additional_info TEXT,
          ai_analysis TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Tabela powiązań email ze sprawami
      db.run(`
        CREATE TABLE IF NOT EXISTS case_emails (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          email_message_id TEXT NOT NULL,
          email_subject TEXT,
          email_from TEXT,
          email_to TEXT,
          email_date DATETIME,
          linked_by INTEGER NOT NULL,
          linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (linked_by) REFERENCES users(id)
        )
      `);

      // Tabela powiązań czatu ze sprawami
      db.run(`
        CREATE TABLE IF NOT EXISTS case_chats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          chat_message_id INTEGER NOT NULL,
          linked_by INTEGER NOT NULL,
          linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id),
          FOREIGN KEY (linked_by) REFERENCES users(id)
        )
      `);

      // Tabela zadań
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER,
          client_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT DEFAULT 'medium',
          status TEXT DEFAULT 'todo',
          due_date DATETIME,
          assigned_to INTEGER,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Tabela komentarzy do spraw (dla klientów i pracowników)
      db.run(`
        CREATE TABLE IF NOT EXISTS case_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          parent_comment_id INTEGER,
          comment TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (parent_comment_id) REFERENCES case_comments(id)
        )
      `);
      
      // Dodaj kolumnę parent_comment_id jeśli nie istnieje
      db.run(`ALTER TABLE case_comments ADD COLUMN parent_comment_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny parent_comment_id:', err);
        }
      });

      // Tabela komentarzy do notatek
      db.run(`
        CREATE TABLE IF NOT EXISTS note_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabela powiadomień
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          related_id INTEGER,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabela dokumentów - NIE usuwaj! Dane są trwałe
      // db.run(`DROP TABLE IF EXISTS documents`);  // WYŁĄCZONE - chroni dane
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_number TEXT UNIQUE NOT NULL,
          case_id INTEGER,
          client_id INTEGER,
          comment_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          filename TEXT NOT NULL,
          filepath TEXT NOT NULL,
          file_size INTEGER,
          file_type TEXT,
          category TEXT DEFAULT 'general',
          uploaded_by INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (comment_id) REFERENCES case_comments(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);

      // Tabela plików klientów - NIE usuwaj! Dane są trwałe
      // db.run(`DROP TABLE IF EXISTS client_files`);  // WYŁĄCZONE - chroni dane
      db.run(`
        CREATE TABLE IF NOT EXISTS client_files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_number TEXT UNIQUE NOT NULL,
          client_id INTEGER NOT NULL,
          case_id INTEGER,
          title TEXT,
          description TEXT,
          category TEXT DEFAULT 'document',
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          file_type TEXT,
          uploaded_by INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);

      // Dodaj przykładowych użytkowników jeśli baza jest pusta
      db.get('SELECT COUNT(*) as count FROM users', [], async (err, row) => {
        if (err) {
          console.error('Błąd sprawdzania użytkowników:', err);
          return;
        }

        if (row.count === 0) {
          console.log('?? Dodawanie przykładowych użytkowników...');
          
          const bcrypt = require('bcrypt');
          
          const users = [
            { name: 'Admin', email: 'admin@pro-meritum.pl', password: 'admin123', role: 'admin' },
            { name: 'Mecenas Jan Kowalski', email: 'lawyer@pro-meritum.pl', password: 'lawyer123', role: 'lawyer' },
            { name: 'Recepcja', email: 'reception@pro-meritum.pl', password: 'reception123', role: 'reception' },
            { name: 'Klient Testowy', email: 'client@pro-meritum.pl', password: 'client123', role: 'client' }
          ];

          for (const user of users) {
            try {
              // KLUCZOWE: Hashuj hasło!
              const hashedPassword = await bcrypt.hash(user.password, 10);
              
              db.run(`
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)
              `, [user.name, user.email, hashedPassword, user.role], (err) => {
                if (err) {
                  console.error('Błąd dodawania użytkownika:', err);
                } else {
                  console.log(`? Dodano: ${user.email} (${user.role})`);
                }
              });
            } catch (error) {
              console.error('Błąd hashowania hasła:', error);
            }
          }
        }
      });

      // Zakończenie inicjalizacji bazy danych
      // Tabela aktualnych przepisów prawnych
      db.run(`
        CREATE TABLE IF NOT EXISTS legal_acts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          date TEXT,
          url TEXT,
          content TEXT,
          source TEXT DEFAULT 'isap',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Indeks dla wyszukiwania
      db.run(`CREATE INDEX IF NOT EXISTS idx_legal_acts_title ON legal_acts(title)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_legal_acts_date ON legal_acts(date DESC)`);
      
      // ========== SZCZEGÓŁOWE DANE DLA SPRAW CYWILNYCH ==========
      db.run(`
        CREATE TABLE IF NOT EXISTS case_civil_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          
          -- KATEGORIA SPRAWY CYWILNEJ
          civil_category TEXT, -- 'contract', 'monetary', 'compensation', 'property', 'other'
          
          -- UMOWY CYWILNOPRAWNE
          contract_type TEXT, -- 'sale', 'rent', 'commission', 'work', 'loan', 'other'
          contract_parties TEXT,
          contract_date DATE,
          contract_terms TEXT,
          contract_executed BOOLEAN,
          unmet_obligations TEXT,
          penalties_provided BOOLEAN,
          penalty_amount DECIMAL(10,2),
          penalty_terms TEXT,
          
          -- ROSZCZENIA PIENIĘŻNE
          claim_basis TEXT, -- 'contract', 'invoice', 'promissory_note', 'credit'
          principal_amount DECIMAL(10,2),
          interest_amount DECIMAL(10,2),
          payment_demands_sent BOOLEAN,
          debtor_objections TEXT,
          limitation_period_check TEXT,
          
          -- ROSZCZENIA ODSZKODOWAWCZE (POZAKOMUNIKACYJNE)
          incident_description TEXT,
          incident_date DATE,
          incident_location TEXT,
          witnesses_present TEXT,
          police_report BOOLEAN,
          
          -- Szkoda majątkowa
          property_damaged TEXT,
          property_value DECIMAL(10,2),
          repair_receipts TEXT,
          expert_valuation TEXT,
          
          -- Szkoda osobowa
          injuries_description TEXT,
          medical_documentation TEXT,
          treatment_costs DECIMAL(10,2),
          lost_income DECIMAL(10,2),
          disability_period TEXT,
          
          -- SPORY NIERUCHOMOŚCIOWE
          property_dispute_type TEXT, -- 'co_ownership', 'eviction', 'easement', 'possession'
          legal_title TEXT,
          land_register_number TEXT,
          notarial_acts TEXT,
          joint_use_details TEXT,
          previous_court_cases TEXT,
          
          -- POZOSTAŁE
          warranty_guarantee_details TEXT,
          consumer_claims TEXT,
          
          -- DOKUMENTY I NOTATKI
          additional_notes TEXT,
          documents_checklist TEXT, -- JSON array
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `);
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_civil_case_id ON case_civil_details(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_civil_category ON case_civil_details(civil_category)`);
      
      // === MODUŁ DOWODÓW ===
      
      // Tabela dowodów w sprawie
      db.run(`
        CREATE TABLE IF NOT EXISTS case_evidence (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          evidence_code TEXT UNIQUE NOT NULL,
          
          evidence_type TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          
          obtained_date DATE,
          obtained_from TEXT,
          obtained_method TEXT,
          
          presented_by TEXT,
          against_party TEXT,
          
          significance TEXT DEFAULT 'supporting',
          credibility_score INTEGER DEFAULT 5,
          admissibility TEXT DEFAULT 'pending',
          
          status TEXT DEFAULT 'secured',
          presented_date DATE,
          court_decision TEXT,
          
          document_id INTEGER,
          witness_id INTEGER,
          related_evidence_ids TEXT,
          
          storage_location TEXT,
          physical_condition TEXT,
          chain_of_custody TEXT,
          
          expert_analysis TEXT,
          technical_data TEXT,
          
          strengths TEXT,
          weaknesses TEXT,
          usage_strategy TEXT,
          notes TEXT,
          
          -- Rozszerzone pola dla różnych typów dowodów
          source_url TEXT,
          social_profile TEXT,
          social_platform TEXT,
          related_emails TEXT,
          related_phones TEXT,
          circumstantial_type TEXT,
          circumstantial_strength TEXT,
          circumstantial_connections TEXT,
          alternative_explanations TEXT,
          testimony_id INTEGER,
          
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (document_id) REFERENCES case_documents(id),
          FOREIGN KEY (witness_id) REFERENCES case_witnesses(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli case_evidence:', err);
        } else {
          console.log('? Tabela case_evidence utworzona');
        }
      });
      
      // Indeksy dla dowodów
      db.run(`CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON case_evidence(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_evidence_type ON case_evidence(evidence_type)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_evidence_status ON case_evidence(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_evidence_significance ON case_evidence(significance)`);
      
      // Tabela historii zmian dowodu
      db.run(`
        CREATE TABLE IF NOT EXISTS evidence_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          evidence_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          field_changed TEXT,
          old_value TEXT,
          new_value TEXT,
          changed_by INTEGER NOT NULL,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          
          FOREIGN KEY (evidence_id) REFERENCES case_evidence(id) ON DELETE CASCADE,
          FOREIGN KEY (changed_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli evidence_history:', err);
        } else {
          console.log('? Tabela evidence_history utworzona');
        }
      });
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_evidence_history_evidence_id ON evidence_history(evidence_id)`);
      
      // Tabela logów wysłanych emaili
      db.run(`
        CREATE TABLE IF NOT EXISTS email_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER,
          event_id INTEGER,
          event_code TEXT,
          recipient TEXT NOT NULL,
          subject TEXT NOT NULL,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          message_id TEXT,
          status TEXT DEFAULT 'sent',
          error_message TEXT,
          
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli email_logs:', err);
        } else {
          console.log('? Tabela email_logs utworzona');
        }
      });
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_email_logs_client_id ON email_logs(client_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_email_logs_event_id ON email_logs(event_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at)`);
      
      // Tabela raportów wydarzeń (z kodami QR)
      db.run(`
        CREATE TABLE IF NOT EXISTS event_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_code TEXT UNIQUE NOT NULL,
          event_id INTEGER NOT NULL,
          case_id INTEGER,
          event_type TEXT,
          generated_by INTEGER NOT NULL,
          generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          report_data TEXT,
          ai_recommendations TEXT,
          access_token TEXT UNIQUE NOT NULL,
          access_password TEXT DEFAULT 'Promeritum21',
          expires_at DATETIME NOT NULL,
          view_count INTEGER DEFAULT 0,
          last_viewed_at DATETIME,
          FOREIGN KEY (event_id) REFERENCES events(id),
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (generated_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli event_reports:', err);
        } else {
          console.log('? Tabela event_reports utworzona');
        }
      });
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_reports_code ON event_reports(report_code)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_reports_token ON event_reports(access_token)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_reports_event ON event_reports(event_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_reports_expires ON event_reports(expires_at)`);
      
      // Tabela ankiet dla spraw (np. upadłość)
      db.run(`
        CREATE TABLE IF NOT EXISTS case_questionnaires (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          questionnaire_type TEXT NOT NULL,
          answers TEXT,
          completed BOOLEAN DEFAULT 0,
          completion_percentage INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli case_questionnaires:', err);
        } else {
          console.log('? Tabela case_questionnaires utworzona');
        }
      });
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_questionnaires_case ON case_questionnaires(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_questionnaires_type ON case_questionnaires(questionnaire_type)`);
      
      // ==========================================
      // MODUŁ ANALIZY STRONY PRZECIWNEJ
      // ==========================================
      
      // Tabela główna - dane przeciwnika
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          party_type TEXT DEFAULT 'individual',
          name TEXT NOT NULL,
          nip TEXT,
          regon TEXT,
          krs TEXT,
          pesel TEXT,
          address TEXT,
          phone TEXT,
          email TEXT,
          financial_status TEXT,
          debt_amount REAL,
          risk_level TEXT DEFAULT 'unknown',
          litigation_style TEXT,
          win_rate INTEGER DEFAULT 0,
          analysis_status TEXT DEFAULT 'new',
          workflow_step INTEGER DEFAULT 0,
          workflow_completed BOOLEAN DEFAULT 0,
          notes TEXT,
          swot_weaknesses TEXT,
          swot_strengths TEXT,
          chance_of_winning INTEGER DEFAULT 50,
          lawyer_name TEXT,
          lawyer_firm TEXT,
          lawyer_experience INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli opposing_party:', err);
        } else {
          console.log('? Tabela opposing_party utworzona');
        }
      });
      
      // Poprzednie sprawy przeciwnika
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party_cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opposing_party_id INTEGER NOT NULL,
          case_number TEXT,
          case_type TEXT,
          outcome TEXT,
          court TEXT,
          date DATE,
          tactics TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (opposing_party_id) REFERENCES opposing_party(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli opposing_party_cases:', err);
        } else {
          console.log('? Tabela opposing_party_cases utworzona');
        }
      });
      
      // Świadkowie strony przeciwnej
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party_witnesses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opposing_party_id INTEGER NOT NULL,
          witness_name TEXT NOT NULL,
          role TEXT,
          credibility INTEGER DEFAULT 3,
          relationship TEXT,
          notes TEXT,
          red_flags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (opposing_party_id) REFERENCES opposing_party(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli opposing_party_witnesses:', err);
        } else {
          console.log('? Tabela opposing_party_witnesses utworzona');
        }
      });
      
      // Bank dowodów (evidence bank)
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party_evidence (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opposing_party_id INTEGER NOT NULL,
          evidence_type TEXT,
          title TEXT,
          description TEXT,
          file_path TEXT,
          file_type TEXT,
          ocr_text TEXT,
          ai_analysis TEXT,
          red_flags TEXT,
          sentiment TEXT,
          tags TEXT,
          source_url TEXT,
          captured_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (opposing_party_id) REFERENCES opposing_party(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli opposing_party_evidence:', err);
        } else {
          console.log('? Tabela opposing_party_evidence utworzona');
        }
      });
      
      // Checklist dla guided workflow
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party_checklist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opposing_party_id INTEGER NOT NULL,
          step_number INTEGER NOT NULL,
          step_name TEXT NOT NULL,
          checked BOOLEAN DEFAULT 0,
          notes TEXT,
          checked_at DATETIME,
          FOREIGN KEY (opposing_party_id) REFERENCES opposing_party(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli opposing_party_checklist:', err);
        } else {
          console.log('? Tabela opposing_party_checklist utworzona');
        }
      });
      
      // Social media profiles
      db.run(`
        CREATE TABLE IF NOT EXISTS opposing_party_social (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opposing_party_id INTEGER NOT NULL,
          platform TEXT NOT NULL,
          profile_url TEXT,
          username TEXT,
          is_active BOOLEAN DEFAULT 1,
          last_checked DATETIME,
          notes TEXT,
          FOREIGN KEY (opposing_party_id) REFERENCES opposing_party(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli opposing_party_social:', err);
        } else {
          console.log('? Tabela opposing_party_social utworzona');
        }
      });
      
      // Indeksy
      db.run(`CREATE INDEX IF NOT EXISTS idx_opposing_case ON opposing_party(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_opposing_status ON opposing_party(analysis_status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_opposing_evidence_party ON opposing_party_evidence(opposing_party_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_opposing_checklist_party ON opposing_party_checklist(opposing_party_id)`);
      
      // ====================================
      // MODUŁ PŁATNOŚCI - PAYPAL INTEGRATION
      // ====================================
      
      // Tabela płatności
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_code TEXT UNIQUE NOT NULL,
          case_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          lawyer_id INTEGER,
          amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'PLN',
          description TEXT,
          payment_type TEXT NOT NULL,
          payment_method TEXT DEFAULT 'paypal',
          status TEXT DEFAULT 'pending',
          blik_code TEXT,
          paypal_order_id TEXT,
          paypal_payment_id TEXT,
          paypal_payer_email TEXT,
          crypto_wallet_address TEXT,
          crypto_transaction_hash TEXT,
          crypto_currency TEXT,
          crypto_amount DECIMAL(18, 8),
          cash_receipt_number TEXT,
          cash_received_by INTEGER,
          add_to_balance BOOLEAN DEFAULT 0,
          invoice_number TEXT,
          invoice_url TEXT,
          due_date DATETIME,
          paid_at DATETIME,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (lawyer_id) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (cash_received_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli payments:', err);
        } else {
          console.log('? Tabela payments utworzona');
        }
      });
      
      // Dodaj kolumnę blik_code jeśli nie istnieje (dla istniejących baz)
      db.run(`ALTER TABLE payments ADD COLUMN blik_code TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny blik_code:', err);
        }
      });
      
      // Tabela historii statusów płatności
      db.run(`
        CREATE TABLE IF NOT EXISTS payment_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id INTEGER NOT NULL,
          old_status TEXT,
          new_status TEXT NOT NULL,
          note TEXT,
          changed_by INTEGER,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
          FOREIGN KEY (changed_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli payment_history:', err);
        } else {
          console.log('? Tabela payment_history utworzona');
        }
      });
      
      // Tabela przypomnień o płatnościach
      db.run(`
        CREATE TABLE IF NOT EXISTS payment_reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id INTEGER NOT NULL,
          reminder_type TEXT NOT NULL,
          sent_at DATETIME,
          is_sent BOOLEAN DEFAULT 0,
          next_reminder_at DATETIME,
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli payment_reminders:', err);
        } else {
          console.log('? Tabela payment_reminders utworzona');
        }
      });
      
      // ========================================
      // SYSTEM PŁATNOŚCI RATALNYCH
      // ========================================
      
      // Tabela rat płatności
      db.run(`
        CREATE TABLE IF NOT EXISTS payment_installments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id INTEGER,
          invoice_id INTEGER,
          case_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          installment_number INTEGER NOT NULL,
          total_installments INTEGER NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'PLN',
          due_date DATE NOT NULL,
          status TEXT DEFAULT 'pending',
          paid_at DATETIME,
          payment_method TEXT,
          payment_reference TEXT,
          late_days INTEGER DEFAULT 0,
          late_fee DECIMAL(10, 2) DEFAULT 0,
          notes TEXT,
          reminder_sent BOOLEAN DEFAULT 0,
          reminder_sent_at DATETIME,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
          FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE SET NULL,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli payment_installments:', err);
        } else {
          console.log('? Tabela payment_installments utworzona');
        }
      });
      
      // Indeksy dla rat
      db.run(`CREATE INDEX IF NOT EXISTS idx_installments_payment ON payment_installments(payment_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_installments_invoice ON payment_installments(invoice_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_installments_case ON payment_installments(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_installments_client ON payment_installments(client_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_installments_status ON payment_installments(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_installments_due_date ON payment_installments(due_date)`);
      
      // Tabela salda klientów
      db.run(`
        CREATE TABLE IF NOT EXISTS client_balance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL UNIQUE,
          balance DECIMAL(10, 2) DEFAULT 0,
          currency TEXT DEFAULT 'PLN',
          last_transaction_at DATETIME,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli client_balance:', err);
        } else {
          console.log('? Tabela client_balance utworzona');
        }
      });
      
      // Tabela transakcji salda
      db.run(`
        CREATE TABLE IF NOT EXISTS balance_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          payment_id INTEGER,
          amount DECIMAL(10, 2) NOT NULL,
          transaction_type TEXT NOT NULL,
          description TEXT,
          balance_before DECIMAL(10, 2),
          balance_after DECIMAL(10, 2),
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
          FOREIGN KEY (payment_id) REFERENCES payments(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli balance_transactions:', err);
        } else {
          console.log('? Tabela balance_transactions utworzona');
        }
      });
      
      // Tabela płatności ratalnych
      db.run(`
        CREATE TABLE IF NOT EXISTS installment_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id INTEGER NOT NULL,
          invoice_id INTEGER,
          installment_number INTEGER NOT NULL,
          total_installments INTEGER NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          due_date DATE NOT NULL,
          status TEXT DEFAULT 'pending',
          paid_at DATETIME,
          payment_method TEXT,
          transaction_id TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
          FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE SET NULL
        )
      `, (err) => {
        if (err) {
          console.error('? Błąd tworzenia tabeli installment_payments:', err);
        } else {
          console.log('? Tabela installment_payments utworzona');
        }
      });
      
      // Indeksy płatności
      db.run(`CREATE INDEX IF NOT EXISTS idx_payment_case ON payments(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_payment_client ON payments(client_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_payment_code ON payments(payment_code)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_payment_method ON payments(payment_method)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_balance_client ON balance_transactions(client_id)`);
      
      // ========================================
      // SYSTEM FINANSOWY FIRMY
      // ========================================
      
      // Tabela wydatków firmy
      db.run(`
        CREATE TABLE IF NOT EXISTS company_expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          expense_code TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          subcategory TEXT,
          amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'PLN',
          description TEXT,
          vendor TEXT,
          invoice_number TEXT,
          invoice_date DATE,
          payment_method TEXT,
          payment_status TEXT DEFAULT 'pending',
          paid_at DATETIME,
          created_by INTEGER NOT NULL,
          approved_by INTEGER,
          approval_status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (approved_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli company_expenses:', err);
        else console.log('? Tabela company_expenses utworzona');
      });
      
      // Tabela pensji pracowników
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_salaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id INTEGER NOT NULL,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          base_salary DECIMAL(10, 2) NOT NULL,
          bonus DECIMAL(10, 2) DEFAULT 0,
          deductions DECIMAL(10, 2) DEFAULT 0,
          net_salary DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'PLN',
          payment_status TEXT DEFAULT 'pending',
          payment_date DATE,
          created_by INTEGER NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id),
          UNIQUE(employee_id, month, year)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli employee_salaries:', err);
        else console.log('? Tabela employee_salaries utworzona');
      });
      
      // Tabela faktur kosztowych
      db.run(`
        CREATE TABLE IF NOT EXISTS company_invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          invoice_type TEXT NOT NULL,
          vendor TEXT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          tax_amount DECIMAL(10, 2) DEFAULT 0,
          total_amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'PLN',
          issue_date DATE NOT NULL,
          due_date DATE,
          payment_status TEXT DEFAULT 'unpaid',
          paid_at DATETIME,
          category TEXT,
          description TEXT,
          file_path TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli company_invoices:', err);
        else console.log('? Tabela company_invoices utworzona');
      });
      
      // Indeksy dla wydatków firmy
      db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_category ON company_expenses(category)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_status ON company_expenses(payment_status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON company_expenses(created_by)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_salaries_employee ON employee_salaries(employee_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_salaries_date ON employee_salaries(year, month)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON company_invoices(payment_status)`);
      
      // ========================================
      // FAKTURY SPRZEDAŻOWE (dla klientów)
      // ========================================
      
      // Tabela faktur VAT wystawianych klientom
      db.run(`
        CREATE TABLE IF NOT EXISTS sales_invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          invoice_type TEXT DEFAULT 'VAT',
          
          -- Klient
          client_id INTEGER NOT NULL,
          case_id INTEGER,
          
          -- Dane nabywcy
          buyer_name TEXT NOT NULL,
          buyer_nip TEXT,
          buyer_address TEXT,
          buyer_email TEXT,
          
          -- Kwoty
          net_amount DECIMAL(10, 2) NOT NULL,
          vat_rate INTEGER NOT NULL,
          vat_amount DECIMAL(10, 2) NOT NULL,
          gross_amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'PLN',
          
          -- Pozycje faktury
          items TEXT NOT NULL,
          
          -- Daty
          issue_date DATE NOT NULL,
          sale_date DATE,
          due_date DATE,
          
          -- Status
          payment_status TEXT DEFAULT 'unpaid',
          paid_at DATETIME,
          
          -- KSeF
          ksef_reference_number TEXT,
          ksef_status TEXT,
          ksef_sent_at DATETIME,
          ksef_upo_received BOOLEAN DEFAULT 0,
          
          -- Pliki
          pdf_path TEXT,
          
          -- Uwagi
          notes TEXT,
          
          -- Audyt
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli sales_invoices:', err);
        else console.log('? Tabela sales_invoices utworzona');
      });
      
      // Indeksy dla faktur sprzedażowych
      db.run(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_client ON sales_invoices(client_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_case ON sales_invoices(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(payment_status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_ksef ON sales_invoices(ksef_reference_number)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(issue_date)`);
      
      // =====================================
      // TABELA ZEZNAŃ ŚWIADKÓW
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS witness_testimonies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          witness_id INTEGER NOT NULL,
          testimony_date DATETIME NOT NULL,
          testimony_type TEXT DEFAULT 'written',
          testimony_content TEXT NOT NULL,
          version_number INTEGER DEFAULT 1,
          is_retracted BOOLEAN DEFAULT 0,
          retraction_date DATETIME,
          retraction_reason TEXT,
          credibility_assessment TEXT,
          recorded_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (witness_id) REFERENCES case_witnesses(id) ON DELETE CASCADE,
          FOREIGN KEY (recorded_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli witness_testimonies:', err);
        else console.log('? Tabela witness_testimonies utworzona');
      });
      
      // Indeksy dla zeznań
      db.run(`CREATE INDEX IF NOT EXISTS idx_testimonies_witness ON witness_testimonies(witness_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_testimonies_date ON witness_testimonies(testimony_date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_testimonies_retracted ON witness_testimonies(is_retracted)`);
      
      // =====================================
      // TABELA ZADAŃ DO SPRAW
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS case_tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'todo',
          priority VARCHAR(20) DEFAULT 'medium',
          assigned_to INTEGER,
          due_date DATE,
          completed_at DATETIME,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli case_tasks:', err);
        else console.log('? Tabela case_tasks utworzona');
      });
      
      // Indeksy dla zadań
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_tasks_case ON case_tasks(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_tasks_assigned ON case_tasks(assigned_to)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_tasks_status ON case_tasks(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_tasks_due_date ON case_tasks(due_date)`);
      
      // =====================================
      // TABELA TICKETÓW HR/IT
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_number VARCHAR(50) UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          ticket_type VARCHAR(50) NOT NULL,
          title TEXT NOT NULL,
          department VARCHAR(100) NOT NULL,
          details TEXT,
          priority VARCHAR(20) DEFAULT 'normal',
          status VARCHAR(50) DEFAULT 'Nowy',
          admin_note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli tickets:', err);
        else console.log('? Tabela tickets utworzona');
      });
      
      // Indeksy dla ticketów
      db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(ticket_type)`);
      
      // =====================================
      // TABELA LOGÓW AKTYWNOŚCI
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action VARCHAR(50) NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli activity_logs:', err);
        else console.log('? Tabela activity_logs utworzona');
      });
      
      // Indeksy dla logów
      db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at)`);
      
      // =====================================
      // TABELA AKTYWNOŚCI PRACOWNIKÓW HR
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action_type VARCHAR(50) NOT NULL,
          action_category VARCHAR(50),
          description TEXT,
          related_case_id INTEGER,
          related_client_id INTEGER,
          related_document_id INTEGER,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (related_case_id) REFERENCES cases(id),
          FOREIGN KEY (related_client_id) REFERENCES clients(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli employee_activity_logs:', err);
        else console.log('? Tabela employee_activity_logs utworzona');
      });
      
      // Dodaj brakujące kolumny do employee_activity_logs
      db.run(`ALTER TABLE employee_activity_logs ADD COLUMN related_task_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny related_task_id:', err);
        } else {
          console.log('? Dodano kolumnę related_task_id do employee_activity_logs');
        }
      });
      
      db.run(`ALTER TABLE employee_activity_logs ADD COLUMN related_event_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny related_event_id:', err);
        } else {
          console.log('? Dodano kolumnę related_event_id do employee_activity_logs');
        }
      });
      
      db.run(`ALTER TABLE employee_activity_logs ADD COLUMN related_payment_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Błąd dodawania kolumny related_payment_id:', err);
        } else {
          console.log('? Dodano kolumnę related_payment_id do employee_activity_logs');
        }
      });
      
      // Indeksy dla employee_activity_logs
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_user ON employee_activity_logs(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_type ON employee_activity_logs(action_type)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_category ON employee_activity_logs(action_category)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_date ON employee_activity_logs(created_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_case ON employee_activity_logs(related_case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_task ON employee_activity_logs(related_task_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_event ON employee_activity_logs(related_event_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_payment ON employee_activity_logs(related_payment_id)`);
      
      // =====================================
      // TABELA LOGÓW DOSTĘPU DO SPRAW PRZEZ HASŁO
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS case_access_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          access_method VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli case_access_log:', err);
        else console.log('? Tabela case_access_log utworzona (audit dostępu przez hasło)');
      });
      
      // Indeksy dla case_access_log
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_access_case ON case_access_log(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_access_user ON case_access_log(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_case_access_date ON case_access_log(created_at)`);
      
      // =====================================
      // TABELA UPRAWNIEŃ DO SPRAW (czasowych i stałych)
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS case_permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          permission_type TEXT NOT NULL CHECK(permission_type IN ('temporary', 'permanent')),
          granted_by INTEGER NOT NULL,
          granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          revoked_at DATETIME,
          revoked_by INTEGER,
          notes TEXT,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (granted_by) REFERENCES users(id),
          FOREIGN KEY (revoked_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli case_permissions:', err);
        else console.log('? Tabela case_permissions utworzona (uprawnienia czasowe i stałe)');
      });
      
      // Indeksy dla case_permissions
      db.run(`CREATE INDEX IF NOT EXISTS idx_permissions_case ON case_permissions(case_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_permissions_user ON case_permissions(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_permissions_expires ON case_permissions(expires_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_permissions_active ON case_permissions(case_id, user_id, revoked_at)`);
      
      // =====================================
      // TABELA SESJI LOGOWANIA (dla Employee Dashboard)
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS login_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          logout_time DATETIME,
          duration_seconds INTEGER,
          ip_address VARCHAR(45),
          user_agent TEXT,
          device_info TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli login_sessions:', err);
        else console.log('? Tabela login_sessions utworzona');
      });
      
      // Indeksy dla login_sessions
      db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON login_sessions(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_login_time ON login_sessions(login_time)`);
      
      // =====================================
      // TABELA ZAPYTAŃ ZE STRONY WWW
      // =====================================
      db.run(`
        CREATE TABLE IF NOT EXISTS website_inquiries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'resolved', 'closed')),
          priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
          assigned_to INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          resolved_by INTEGER,
          response TEXT,
          notes TEXT,
          source TEXT DEFAULT 'website',
          ip_address TEXT,
          user_agent TEXT,
          FOREIGN KEY (assigned_to) REFERENCES users(id),
          FOREIGN KEY (resolved_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('? Błąd tworzenia tabeli website_inquiries:', err);
        else console.log('? Tabela website_inquiries utworzona (zapytania ze strony WWW)');
      });
      
      // Indeksy dla website_inquiries
      db.run(`CREATE INDEX IF NOT EXISTS idx_inquiries_status ON website_inquiries(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_inquiries_created ON website_inquiries(created_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON website_inquiries(assigned_to)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON website_inquiries(priority)`);
      
      console.log('? Baza danych zainicjalizowana (+ System Finansowy + Faktury + Zadania + Tickety + Logi + HR + Hasła Spraw + Uprawnienia + Zapytania WWW)');
      resolve(db);
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = { initDatabase, getDatabase };




