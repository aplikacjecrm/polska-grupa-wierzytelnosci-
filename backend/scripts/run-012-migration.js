/**
 * Uruchomienie migracji 012 - payment_receipts
 */

const { getDatabase } = require('../database/init');
const migration = require('../migrations/012-payment-receipts');

async function runMigration() {
    console.log('🚀 Uruchamianie migracji 012: payment-receipts...');
    
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
