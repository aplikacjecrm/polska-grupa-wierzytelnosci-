// Dodaj brakujące kolumny do tabeli cases
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 DODAWANIE BRAKUJĄCYCH KOLUMN DO TABELI CASES...\n');

db.serialize(() => {
  // Dodaj case_subtype
  db.run(`ALTER TABLE cases ADD COLUMN case_subtype TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Błąd dodawania case_subtype:', err.message);
    } else {
      console.log('✅ Kolumna case_subtype dodana');
    }
  });
  
  // Dodaj police_case_number
  db.run(`ALTER TABLE cases ADD COLUMN police_case_number TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Błąd dodawania police_case_number:', err.message);
    } else {
      console.log('✅ Kolumna police_case_number dodana');
    }
  });
  
  // Dodaj court_type
  db.run(`ALTER TABLE cases ADD COLUMN court_type TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Błąd dodawania court_type:', err.message);
    } else {
      console.log('✅ Kolumna court_type dodana');
    }
  });
  
  // Dodaj auxiliary_prosecutor
  db.run(`ALTER TABLE cases ADD COLUMN auxiliary_prosecutor TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Błąd dodawania auxiliary_prosecutor:', err.message);
    } else {
      console.log('✅ Kolumna auxiliary_prosecutor dodana');
    }
  });
  
  // Dodaj investigation_authority
  db.run(`ALTER TABLE cases ADD COLUMN investigation_authority TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Błąd dodawania investigation_authority:', err.message);
    } else {
      console.log('✅ Kolumna investigation_authority dodana');
    }
    
    db.close(() => {
      console.log('\n🎉 GOTOWE!');
      process.exit(0);
    });
  });
});
