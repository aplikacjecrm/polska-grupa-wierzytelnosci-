/**
 * Uruchomienie migracji 014 - flexible-commissions
 */

const { getDatabase } = require('../database/init');
const migration = require('../migrations/014-flexible-commissions');

async function runMigration() {
    console.log('🚀 Uruchamianie migracji 014: flexible-commissions...');
    console.log('📝 Dodawanie kontroli prowizji do płatności');
    
    const db = getDatabase();
    
    try {
        await migration.up(db);
        console.log('✅ Migracja zakończona sukcesem!');
        console.log('');
        console.log('💡 Teraz płatności mają:');
        console.log('   - enable_commission (checkbox - domyślnie TAK)');
        console.log('   - commission_rate_override (nadpisanie %)');
        console.log('   - commission_recipient_override (inny odbiorca)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd migracji:', error);
        process.exit(1);
    }
}

runMigration();
