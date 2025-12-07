const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');

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
          client_id INTEGER,
          avatar TEXT,
          status TEXT DEFAULT 'offline',
          last_seen DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id)
        )
      `);

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
      
      // Wszystkie kolumny dla cases są już w CREATE TABLE - nie trzeba ALTER TABLE
      
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
          case_subtype TEXT,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'medium',
          court_name TEXT,
          court_signature TEXT,
          court_type TEXT,
          court_department TEXT,
          judge_name TEXT,
          referent TEXT,
          prosecutor_office TEXT,
          prosecutor_name TEXT,
          auxiliary_prosecutor TEXT,
          investigation_authority TEXT,
          indictment_number TEXT,
          police_case_number TEXT,
          opposing_party TEXT,
          value_amount REAL,
          value_currency TEXT DEFAULT 'PLN',
          assigned_to INTEGER,
          case_manager_id INTEGER,
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

      // Tabela dokumentów - usuń starą i utwórz nową
      db.run(`DROP TABLE IF EXISTS documents`);
      db.run(`
        CREATE TABLE documents (
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

      // Tabela plików klientów - usuń starą i utwórz nową
      db.run(`DROP TABLE IF EXISTS client_files`);
      db.run(`
        CREATE TABLE client_files (
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
          console.log('📝 Dodawanie przykładowych użytkowników...');
          
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
                  console.log(`✅ Dodano: ${user.email} (${user.role})`);
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
      
      console.log('✅ Baza danych zainicjalizowana (z modułem CRM + Legal Acts + Civil Cases)');
      resolve(db);
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = { initDatabase, getDatabase };

