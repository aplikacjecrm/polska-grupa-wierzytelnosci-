const fs = require('fs').promises;
const path = require('path');
const { getDatabase } = require('./database/init');

async function runMigration() {
    try {
        console.log('📦 Ładowanie pliku migracji...');
        
        const sqlFile = path.join(__dirname, 'migrations', 'add_client_files_notes.sql');
        const sql = await fs.readFile(sqlFile, 'utf8');
        
        console.log('🔄 Wykonywanie migracji...');
        
        const db = getDatabase();
        
        // Rozdziel SQL na poszczególne zapytania
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
            console.log(`   Wykonuję: ${statement.substring(0, 50)}...`);
            db.exec(statement);
        }
        
        console.log('✅ Migracja zakończona pomyślnie!');
        console.log('');
        console.log('📊 Utworzono tabele:');
        console.log('   - client_files (pliki klienta)');
        console.log('   - client_notes (notatki o kliencie)');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd podczas migracji:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
