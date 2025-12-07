#!/usr/bin/env node
/**
 * 🧹 CZYSZCZENIE STARYCH BACKUPÓW
 * 
 * Usuwa backupy starsze niż określona liczba dni
 * Domyślnie: zachowuje 30 dni historii
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BACKUP_DIR = path.join(__dirname, 'backups');
const DAYS_TO_KEEP = 30; // Dni do zachowania

if (!fs.existsSync(BACKUP_DIR)) {
  console.log('📁 Brak folderu backups/');
  process.exit(0);
}

// Pobierz wszystkie backupy
const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.endsWith('.db') && !f.startsWith('before_restore_'))
  .map(f => ({
    name: f,
    path: path.join(BACKUP_DIR, f),
    time: fs.statSync(path.join(BACKUP_DIR, f)).mtime,
    size: fs.statSync(path.join(BACKUP_DIR, f)).size
  }))
  .sort((a, b) => b.time - a.time);

console.log(`📦 Łącznie backupów: ${backups.length}`);

if (backups.length === 0) {
  console.log('✅ Brak backupów do usunięcia');
  process.exit(0);
}

// Oblicz datę graniczną
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);

// Znajdź backupy do usunięcia
const toDelete = backups.filter(b => b.time < cutoffDate);
const toKeep = backups.filter(b => b.time >= cutoffDate);

console.log(`✅ Do zachowania: ${toKeep.length} (młodsze niż ${DAYS_TO_KEEP} dni)`);
console.log(`🗑️  Do usunięcia: ${toDelete.length} (starsze niż ${DAYS_TO_KEEP} dni)`);

if (toDelete.length === 0) {
  console.log('\n✅ Wszystkie backupy są świeże, nic do usunięcia!');
  process.exit(0);
}

// Pokaż co zostanie usunięte
console.log('\n📋 Backupy do usunięcia:');
toDelete.forEach((b, i) => {
  const date = b.time.toLocaleString('pl-PL');
  const sizeKB = (b.size / 1024).toFixed(2);
  console.log(`   ${i + 1}. ${b.name} (${date}, ${sizeKB} KB)`);
});

const totalSize = toDelete.reduce((sum, b) => sum + b.size, 0);
const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
console.log(`\n💾 Zwolnisz ${totalSizeMB} MB miejsca`);

// Potwierdź usunięcie
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n❓ Czy chcesz usunąć te backupy? (TAK/nie): ', (answer) => {
  if (answer.toUpperCase() !== 'TAK') {
    console.log('❌ Anulowano czyszczenie.');
    rl.close();
    process.exit(0);
  }
  
  try {
    let deleted = 0;
    toDelete.forEach(b => {
      fs.unlinkSync(b.path);
      deleted++;
      console.log(`🗑️  Usunięto: ${b.name}`);
    });
    
    console.log(`\n✅ Usunięto ${deleted} backupów (${totalSizeMB} MB)`);
    console.log(`📦 Pozostało: ${toKeep.length} backupów`);
    
  } catch (error) {
    console.error('❌ Błąd podczas usuwania:', error.message);
    process.exit(1);
  }
  
  rl.close();
});
