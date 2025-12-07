/**
 * Uruchomienie migracji 013 - employee_payments
 */

const { getDatabase } = require('../database/init');
const migration = require('../migrations/013-employee-payments');

async function runMigration() {
    console.log('🚀 Uruchamianie migracji 013: employee-payments...');
    
    const db = getDatabase();
    
    try {
        await migration.up(db);
        console.log('✅ Migracja zakończona sukcesem!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd migracji:', error);
        process.exit(1);
    }
}

runMigration();
