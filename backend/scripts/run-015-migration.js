/**
 * Uruchomienie migracji 015 - commission-approval
 */

const { getDatabase } = require('../database/init');
const migration = require('../migrations/015-commission-approval');

async function runMigration() {
    console.log('🚀 Uruchamianie migracji 015: commission-approval...');
    console.log('📝 Dodawanie systemu zatwierdzania prowizji');
    
    const db = getDatabase();
    
    try {
        await migration.up(db);
        console.log('✅ Migracja zakończona sukcesem!');
        console.log('');
        console.log('💡 Nowy przepływ prowizji:');
        console.log('   1. Płatność opłacona → prowizja PENDING');
        console.log('   2. Admin widzi w Finance Dashboard');
        console.log('   3. Admin zatwierdza → status APPROVED');
        console.log('   4. Admin wypłaca → status PAID');
        console.log('');
        console.log('✨ Stare prowizje automatycznie zatwierdzone!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd migracji:', error);
        process.exit(1);
    }
}

runMigration();
