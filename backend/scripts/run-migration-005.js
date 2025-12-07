/**
 * Skrypt do wykonania migracji 005 - Rozbudowa finansowa i HR
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const MIGRATION_FILE = path.join(__dirname, '..', 'migrations', '005-add-financial-features.sql');

console.log('📍 Database path:', DB_PATH);
console.log('📄 Migration file:', MIGRATION_FILE);

const db = new sqlite3.Database(DB_PATH);

async function runMigration() {
    try {
        // Wczytaj plik SQL
        const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
        console.log('✅ Plik migracji wczytany');
        
        // Wykonaj migrację
        await new Promise((resolve, reject) => {
            db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ Migracja wykonana pomyślnie!');
        
        // Weryfikuj tabele
        const tables = await new Promise((resolve, reject) => {
            db.all(`
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND name IN (
                    'monthly_reports',
                    'invoices',
                    'expenses',
                    'employee_education',
                    'employee_trainings',
                    'leave_requests',
                    'employee_leave_balance',
                    'employee_work_time',
                    'employee_work_summary',
                    'employee_expenses'
                )
                ORDER BY name
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log('\n✅ Utworzone tabele:');
        tables.forEach(t => console.log(`   • ${t.name}`));
        console.log(`\n📊 Łącznie: ${tables.length}/10 tabel`);
        
        if (tables.length === 10) {
            console.log('\n🎉 SUKCES! Wszystkie tabele zostały utworzone!');
        } else {
            console.log('\n⚠️ UWAGA: Nie wszystkie tabele zostały utworzone!');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Błąd migracji:', error);
        process.exit(1);
    }
}

runMigration();
