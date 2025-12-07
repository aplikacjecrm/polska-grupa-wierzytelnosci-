#!/usr/bin/env node
/**
 * 💾 SYSTEM BACKUPÓW BAZY DANYCH
 * 
 * Tworzy kopię zapasową całej bazy SQLite z timestampem
 */

const fs = require('fs');
const path = require('path');

// Ścieżki
const DB_PATH = path.join(__dirname, 'database', 'kancelaria.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Utwórz folder backups jeśli nie istnieje
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Utworzono folder backups/');
}

// Timestamp dla nazwy pliku
const timestamp = new Date().toISOString()
  .replace(/:/g, '-')
  .replace(/\..+/, '')
  .replace('T', '_');

// Nazwa backupu
const backupName = `backup_${timestamp}.db`;
const backupPath = path.join(BACKUP_DIR, backupName);

try {
  // Sprawdź czy baza istnieje
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Baza danych nie istnieje:', DB_PATH);
    process.exit(1);
  }

  // Kopiuj bazę danych
  console.log('💾 Tworzę backup bazy danych...');
  fs.copyFileSync(DB_PATH, backupPath);
  
  const dbSize = fs.statSync(backupPath).size;
  const sizeKB = (dbSize / 1024).toFixed(2);
  
  console.log('✅ Backup utworzony pomyślnie!');
  console.log(`📁 Plik: ${backupName}`);
  console.log(`📊 Rozmiar: ${sizeKB} KB`);
  console.log(`📂 Lokalizacja: ${backupPath}`);
  
  // Statystyki - ile backupów mamy
  const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.db'));
  console.log(`\n📦 Łącznie backupów: ${backups.length}`);
  
  // Lista ostatnich 5 backupów
  const recentBackups = backups
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);
  
  console.log('\n📋 Ostatnie backupy:');
  recentBackups.forEach((b, i) => {
    const date = b.time.toLocaleString('pl-PL');
    console.log(`   ${i + 1}. ${b.name} (${date})`);
  });
  
  // Ostrzeżenie o starych backupach
  if (backups.length > 30) {
    console.log(`\n⚠️  Masz ${backups.length} backupów. Rozważ usunięcie starych!`);
    console.log('   Uruchom: node cleanup-old-backups.js');
  }
  
  console.log('\n💡 Aby przywrócić backup, uruchom:');
  console.log(`   node restore.js ${backupName}`);
  
} catch (error) {
  console.error('❌ Błąd podczas tworzenia backupu:', error.message);
  process.exit(1);
}
