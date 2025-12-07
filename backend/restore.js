#!/usr/bin/env node
/**
 * ⚡ PRZYWRACANIE BACKUPU BAZY DANYCH
 * 
 * Przywraca bazę danych z wybranego backupu
 * UWAGA: Aktualną bazę najpierw backupuje jako "before_restore_..."
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Ścieżki
const DB_PATH = path.join(__dirname, 'database', 'kancelaria.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Argument - nazwa backupu
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Podaj nazwę backupu do przywrócenia!');
  console.log('\n📋 Użycie:');
  console.log('   node restore.js backup_2025-11-07_01-28-00.db');
  console.log('\n📦 Dostępne backupy:');
  
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);
  
  backups.forEach((b, i) => {
    const date = b.time.toLocaleString('pl-PL');
    const size = (fs.statSync(path.join(BACKUP_DIR, b.name)).size / 1024).toFixed(2);
    console.log(`   ${i + 1}. ${b.name} (${date}, ${size} KB)`);
  });
  
  process.exit(1);
}

const backupPath = path.join(BACKUP_DIR, backupFile);

// Sprawdź czy backup istnieje
if (!fs.existsSync(backupPath)) {
  console.error(`❌ Backup nie istnieje: ${backupFile}`);
  process.exit(1);
}

// Potwierdź przywrócenie
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n⚠️  UWAGA! Ta operacja:');
console.log('   1. Utworzy backup AKTUALNEJ bazy');
console.log('   2. Zastąpi aktualną bazę wybranym backupem');
console.log(`   3. Przywróci stan z: ${backupFile}`);
console.log('\n🔴 WSZYSTKIE NIEZAPISANE ZMIANY ZOSTANĄ UTRACONE!');

rl.question('\n❓ Czy na pewno chcesz kontynuować? (TAK/nie): ', (answer) => {
  if (answer.toUpperCase() !== 'TAK') {
    console.log('❌ Anulowano przywracanie.');
    rl.close();
    process.exit(0);
  }
  
  try {
    // 1. Backup aktualnej bazy (na wszelki wypadek)
    if (fs.existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
      
      const safetyBackupName = `before_restore_${timestamp}.db`;
      const safetyBackupPath = path.join(BACKUP_DIR, safetyBackupName);
      
      console.log('\n💾 Tworzę backup aktualnej bazy...');
      fs.copyFileSync(DB_PATH, safetyBackupPath);
      console.log(`✅ Backup zabezpieczający: ${safetyBackupName}`);
    }
    
    // 2. Przywróć wybrany backup
    console.log('\n⚡ Przywracam backup...');
    fs.copyFileSync(backupPath, DB_PATH);
    
    const dbSize = fs.statSync(DB_PATH).size;
    const sizeKB = (dbSize / 1024).toFixed(2);
    
    console.log('✅ Backup przywrócony pomyślnie!');
    console.log(`📊 Rozmiar przywróconej bazy: ${sizeKB} KB`);
    console.log('\n🔄 Zrestartuj serwer aby zmiany zadziałały!');
    console.log('   Ctrl+C na serwerze → node server.js');
    
  } catch (error) {
    console.error('❌ Błąd podczas przywracania:', error.message);
    process.exit(1);
  }
  
  rl.close();
});
