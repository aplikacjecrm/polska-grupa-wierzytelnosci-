#!/usr/bin/env node
/**
 * 💾 PEŁNY BACKUP: BAZA + ZAŁĄCZNIKI
 * 
 * Tworzy kompletny backup:
 * - Bazy danych (kancelaria.db)
 * - Wszystkich załączników (uploads/)
 */

const fs = require('fs');
const path = require('path');

// Ścieżki
const DB_PATH = path.join(__dirname, 'database', 'kancelaria.db');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Timestamp
const timestamp = new Date().toISOString()
  .replace(/:/g, '-')
  .replace(/\..+/, '')
  .replace('T', '_');

// Utwórz folder backups jeśli nie istnieje
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Utworzono folder backups/');
}

// Funkcja kopiowania katalogu rekursywnie
function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    console.log(`⚠️  Folder ${source} nie istnieje, pomijam...`);
    return 0;
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  let totalSize = 0;
  let fileCount = 0;

  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      const size = copyDirectory(sourcePath, destPath);
      totalSize += size;
    } else {
      fs.copyFileSync(sourcePath, destPath);
      totalSize += stat.size;
      fileCount++;
    }
  }

  return totalSize;
}

console.log('💾 PEŁNY BACKUP - BAZA + ZAŁĄCZNIKI\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  const startTime = Date.now();
  
  // 1. BACKUP BAZY DANYCH
  console.log('📊 [1/2] Backup bazy danych...');
  
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Baza danych nie istnieje:', DB_PATH);
    process.exit(1);
  }

  const backupDbName = `backup_${timestamp}.db`;
  const backupDbPath = path.join(BACKUP_DIR, backupDbName);
  
  fs.copyFileSync(DB_PATH, backupDbPath);
  const dbSize = fs.statSync(backupDbPath).size;
  const dbSizeKB = (dbSize / 1024).toFixed(2);
  
  console.log(`   ✅ Baza: ${dbSizeKB} KB`);
  
  // 2. BACKUP ZAŁĄCZNIKÓW
  console.log('\n📁 [2/2] Backup załączników...');
  
  const backupUploadsDir = path.join(BACKUP_DIR, `uploads_${timestamp}`);
  const uploadsSize = copyDirectory(UPLOADS_DIR, backupUploadsDir);
  const uploadsSizeMB = (uploadsSize / 1024 / 1024).toFixed(2);
  
  console.log(`   ✅ Załączniki: ${uploadsSizeMB} MB`);
  
  // 3. PODSUMOWANIE
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const totalSizeMB = ((dbSize + uploadsSize) / 1024 / 1024).toFixed(2);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ BACKUP UKOŃCZONY POMYŚLNIE!\n');
  console.log(`📦 Łączny rozmiar: ${totalSizeMB} MB`);
  console.log(`⏱️  Czas: ${duration}s`);
  console.log(`📂 Lokalizacja:`);
  console.log(`   - Baza: ${backupDbPath}`);
  console.log(`   - Załączniki: ${backupUploadsDir}`);
  
  // 4. STATYSTYKI
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.db'));
  
  console.log(`\n📊 Łącznie backupów: ${backups.length}`);
  
  // 5. OSTRZEŻENIE
  if (backups.length > 30) {
    console.log(`\n⚠️  Masz ${backups.length} backupów!`);
    console.log('   Rozważ czyszczenie: node cleanup-old-backups.js');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
} catch (error) {
  console.error('\n❌ BŁĄD PODCZAS BACKUPU:', error.message);
  process.exit(1);
}
