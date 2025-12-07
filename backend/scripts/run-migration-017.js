/**
 * Skrypt do uruchomienia migracji 017
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'komunikator.db');
console.log('📍 Database path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

async function runMigration() {
    const migration = require('../migrations/017-payment-confirmation-fields.js');
    
    console.log('🚀 Uruchamianie migracji:', migration.name);
    console.log('📋 Wersja:', migration.version);
    
    try {
        await migration.up(db);
        console.log('✅ Migracja zakończona pomyślnie!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd migracji:', error);
        process.exit(1);
    }
}

runMigration();
