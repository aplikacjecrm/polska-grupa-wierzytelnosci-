/**
 * Skrypt do tworzenia testowych prowizji
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('📍 Database path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

async function createTestCommissions() {
    try {
        console.log('🔧 Tworzenie testowych prowizji...');
        
        // Sprawdź czy tabela istnieje
        const tableExists = await new Promise((resolve, reject) => {
            db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='employee_commissions'
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!tableExists) {
            console.log('❌ Tabela employee_commissions nie istnieje!');
            console.log('💡 Uruchom najpierw migrację 005-add-financial-features.sql');
            process.exit(1);
        }
        
        console.log('✅ Tabela employee_commissions istnieje');
        
        // Pobierz pierwszego użytkownika
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE user_role IN (?, ?, ?) LIMIT 1', 
                ['lawyer', 'case_manager', 'admin'], 
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
        
        if (!user) {
            console.log('❌ Nie znaleziono użytkownika!');
            process.exit(1);
        }
        
        console.log(`✅ Znaleziono użytkownika ID: ${user.id}`);
        
        // Pobierz pierwszą sprawę
        const caseData = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM cases LIMIT 1', (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Usuń stare testowe prowizje
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM employee_commissions WHERE amount IN (1500, 2000, 2500)', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('🗑️ Usunięto stare testowe prowizje');
        
        // Utwórz 5 testowych prowizji
        const commissions = [
            { employee_id: user.id, case_id: caseData?.id, amount: 1500, rate: 15, status: 'pending', description: 'Prowizja za sprawę testową #1' },
            { employee_id: user.id, case_id: caseData?.id, amount: 2000, rate: 15, status: 'approved', description: 'Prowizja za sprawę testową #2 (do wypłaty)' },
            { employee_id: user.id, case_id: caseData?.id, amount: 2500, rate: 15, status: 'paid', description: 'Prowizja za sprawę testową #3 (wypłacona)' },
            { employee_id: user.id, case_id: caseData?.id, amount: 1500, rate: 15, status: 'approved', description: 'Prowizja za sprawę testową #4 (do wypłaty)' },
            { employee_id: user.id, case_id: caseData?.id, amount: 2000, rate: 15, status: 'pending', description: 'Prowizja za sprawę testową #5 (oczekuje)' }
        ];
        
        for (const comm of commissions) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO employee_commissions (
                        employee_id, case_id, amount, rate, status, description, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                `, [comm.employee_id, comm.case_id, comm.amount, comm.rate, comm.status, comm.description], 
                function(err) {
                    if (err) {
                        console.error('❌ Błąd tworzenia prowizji:', err);
                        reject(err);
                    } else {
                        console.log(`✅ Utworzono prowizję ID: ${this.lastID} - ${comm.description} (${comm.status})`);
                        resolve();
                    }
                });
            });
        }
        
        // Podsumowanie
        const summary = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(amount) as total_amount,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
                FROM employee_commissions
                WHERE employee_id = ?
            `, [user.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        console.log('\n📊 PODSUMOWANIE:');
        console.log(`   Łącznie prowizji: ${summary.total}`);
        console.log(`   Oczekujące: ${summary.pending_amount} PLN`);
        console.log(`   Do wypłaty: ${summary.approved_amount} PLN`);
        console.log(`   Wypłacone: ${summary.paid_amount} PLN`);
        console.log(`   Razem: ${summary.total_amount} PLN`);
        
        console.log('\n🎉 Testowe prowizje utworzone!');
        console.log(`\n💡 Testuj API:`);
        console.log(`   GET /api/employees/${user.id}/finances/summary`);
        console.log(`   GET /api/commissions/v2/stats`);
        console.log(`   GET /api/commissions/v2/pending`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        process.exit(1);
    }
}

createTestCommissions();
