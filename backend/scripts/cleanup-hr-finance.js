/**
 * Skrypt do czyszczenia:
 * - Danych HR (pensje, urlopy, szkolenia, benefity, dokumenty pracownicze)
 * - Danych finansowych (wydatki, faktury, prowizje)
 * - Starych dokumentów nieistniejących klientów
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('🗑️ Skrypt czyszczenia danych HR, finansowych i starych dokumentów');
console.log('📍 Baza danych:', DB_PATH);
console.log('');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        process.exit(1);
    }
    console.log('✅ Połączono z bazą danych');
});

// Funkcja do wykonania zapytania
function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Funkcja do pobrania danych
function getRows(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function cleanup() {
    try {
        console.log('');
        console.log('📊 SPRAWDZAM CO ZOSTANIE USUNIĘTE...');
        console.log('═'.repeat(60));

        // 1. Sprawdź dane HR
        const hrStats = {
            salaries: await getRows('SELECT COUNT(*) as count FROM employee_salaries'),
            reviews: await getRows('SELECT COUNT(*) as count FROM employee_reviews'),
            training: await getRows('SELECT COUNT(*) as count FROM employee_training'),
            benefits: await getRows('SELECT COUNT(*) as count FROM employee_benefits'),
            documents: await getRows('SELECT COUNT(*) as count FROM employee_documents'),
            workTime: await getRows('SELECT COUNT(*) as count FROM employee_work_time'),
            vacations: await getRows('SELECT COUNT(*) as count FROM employee_vacations'),
            leave: await getRows('SELECT COUNT(*) as count FROM leave_requests'),
            expenses: await getRows('SELECT COUNT(*) as count FROM employee_expenses'),
            tickets: await getRows('SELECT COUNT(*) as count FROM employee_tickets'),
            monthlyReports: await getRows('SELECT COUNT(*) as count FROM monthly_reports'),
            education: await getRows('SELECT COUNT(*) as count FROM employee_education'),
            experience: await getRows('SELECT COUNT(*) as count FROM employee_experience'),
        };

        console.log('📋 DANE HR DO USUNIĘCIA:');
        console.log(`   • Wynagrodzenia: ${hrStats.salaries[0].count}`);
        console.log(`   • Oceny pracownicze: ${hrStats.reviews[0].count}`);
        console.log(`   • Szkolenia: ${hrStats.training[0].count}`);
        console.log(`   • Benefity: ${hrStats.benefits[0].count}`);
        console.log(`   • Dokumenty pracownicze: ${hrStats.documents[0].count}`);
        console.log(`   • Czas pracy: ${hrStats.workTime[0].count}`);
        console.log(`   • Urlopy: ${hrStats.vacations[0].count}`);
        console.log(`   • Wnioski urlopowe: ${hrStats.leave[0].count}`);
        console.log(`   • Wydatki pracownicze: ${hrStats.expenses[0].count}`);
        console.log(`   • Zgłoszenia: ${hrStats.tickets[0].count}`);
        console.log(`   • Raporty miesięczne: ${hrStats.monthlyReports[0].count}`);
        console.log(`   • Wykształcenie: ${hrStats.education[0].count}`);
        console.log(`   • Doświadczenie: ${hrStats.experience[0].count}`);
        console.log('');

        // 2. Sprawdź dane finansowe
        const financeStats = {
            expenses: await getRows('SELECT COUNT(*) as count FROM company_expenses'),
            invoices: await getRows('SELECT COUNT(*) as count FROM company_invoices'),
            salesInvoices: await getRows('SELECT COUNT(*) as count FROM sales_invoices'),
            commissions: await getRows('SELECT COUNT(*) as count FROM lawyer_commissions'),
            employeeCommissions: await getRows('SELECT COUNT(*) as count FROM employee_commissions'),
            commissionRates: await getRows('SELECT COUNT(*) as count FROM commission_rates'),
        };

        console.log('💰 DANE FINANSOWE DO USUNIĘCIA:');
        console.log(`   • Wydatki firmowe: ${financeStats.expenses[0].count}`);
        console.log(`   • Faktury kosztowe: ${financeStats.invoices[0].count}`);
        console.log(`   • Faktury sprzedażowe: ${financeStats.salesInvoices[0].count}`);
        console.log(`   • Prowizje prawników: ${financeStats.commissions[0].count}`);
        console.log(`   • Prowizje pracowników: ${financeStats.employeeCommissions[0].count}`);
        console.log(`   • Stawki prowizyjne: ${financeStats.commissionRates[0].count}`);
        console.log('');

        // 3. Sprawdź dokumenty bez klientów
        const orphanedDocs = await getRows(`
            SELECT d.id, d.title, d.file_name, d.uploaded_at, d.case_id
            FROM documents d
            LEFT JOIN cases c ON d.case_id = c.id
            LEFT JOIN clients cl ON c.client_id = cl.id
            WHERE cl.id IS NULL
        `);

        console.log('📄 DOKUMENTY BEZ KLIENTÓW (OSIEROCONE):');
        console.log(`   Znaleziono: ${orphanedDocs.length} dokumentów`);
        if (orphanedDocs.length > 0) {
            console.log('   Przykłady:');
            orphanedDocs.slice(0, 5).forEach(doc => {
                console.log(`   - ${doc.title || doc.file_name} (case_id: ${doc.case_id}, uploaded: ${doc.uploaded_at})`);
            });
            if (orphanedDocs.length > 5) {
                console.log(`   ... i ${orphanedDocs.length - 5} więcej`);
            }
        }
        console.log('');

        console.log('═'.repeat(60));
        console.log('⚠️  ROZPOCZYNAM CZYSZCZENIE...');
        console.log('═'.repeat(60));
        console.log('');

        // ====== CZYSZCZENIE DANYCH HR ======
        console.log('🧹 Czyszczenie danych HR...');
        
        await runQuery('DELETE FROM employee_salaries');
        console.log('✅ Wyczyszczono wynagrodzenia');
        
        await runQuery('DELETE FROM salary_changes');
        console.log('✅ Wyczyszczono zmiany wynagrodzeń');
        
        await runQuery('DELETE FROM salary_history');
        console.log('✅ Wyczyszczono historię wynagrodzeń');
        
        await runQuery('DELETE FROM employee_reviews');
        console.log('✅ Wyczyszczono oceny pracownicze');
        
        await runQuery('DELETE FROM employee_training');
        console.log('✅ Wyczyszczono szkolenia');
        
        await runQuery('DELETE FROM employee_trainings');
        console.log('✅ Wyczyszczono rejestr szkoleń');
        
        await runQuery('DELETE FROM employee_benefits');
        console.log('✅ Wyczyszczono benefity');
        
        await runQuery('DELETE FROM employee_documents');
        console.log('✅ Wyczyszczono dokumenty pracownicze');
        
        await runQuery('DELETE FROM employee_work_time');
        console.log('✅ Wyczyszczono czas pracy');
        
        await runQuery('DELETE FROM employee_work_summary');
        console.log('✅ Wyczyszczono podsumowania czasu pracy');
        
        await runQuery('DELETE FROM employee_vacations');
        console.log('✅ Wyczyszczono urlopy');
        
        await runQuery('DELETE FROM employee_vacation_balance');
        console.log('✅ Wyczyszczono saldo urlopów');
        
        await runQuery('DELETE FROM leave_requests');
        console.log('✅ Wyczyszczono wnioski urlopowe');
        
        await runQuery('DELETE FROM employee_leave_balance');
        console.log('✅ Wyczyszczono bilans urlopów');
        
        await runQuery('DELETE FROM employee_expenses');
        console.log('✅ Wyczyszczono wydatki pracownicze');
        
        await runQuery('DELETE FROM employee_tickets');
        console.log('✅ Wyczyszczono zgłoszenia pracownicze');
        
        await runQuery('DELETE FROM monthly_reports');
        console.log('✅ Wyczyszczono raporty miesięczne');
        
        await runQuery('DELETE FROM employee_education');
        console.log('✅ Wyczyszczono wykształcenie');
        
        await runQuery('DELETE FROM employee_experience');
        console.log('✅ Wyczyszczono doświadczenie');
        
        await runQuery('DELETE FROM hr_notifications');
        console.log('✅ Wyczyszczono powiadomienia HR');

        console.log('');

        // ====== CZYSZCZENIE DANYCH FINANSOWYCH ======
        console.log('💰 Czyszczenie danych finansowych...');
        
        await runQuery('DELETE FROM company_expenses');
        console.log('✅ Wyczyszczono wydatki firmowe');
        
        await runQuery('DELETE FROM company_invoices');
        console.log('✅ Wyczyszczono faktury kosztowe');
        
        await runQuery('DELETE FROM sales_invoices');
        console.log('✅ Wyczyszczono faktury sprzedażowe');
        
        await runQuery('DELETE FROM lawyer_commissions');
        console.log('✅ Wyczyszczono prowizje prawników');
        
        await runQuery('DELETE FROM employee_commissions');
        console.log('✅ Wyczyszczono prowizje pracowników');
        
        await runQuery('DELETE FROM employee_compensation');
        console.log('✅ Wyczyszczono rekompensaty pracowników');
        
        await runQuery('DELETE FROM commission_rates');
        console.log('✅ Wyczyszczono stawki prowizyjne');
        
        await runQuery('DELETE FROM commission_rate_changes');
        console.log('✅ Wyczyszczono zmiany stawek prowizyjnych');
        
        await runQuery('DELETE FROM employee_payments');
        console.log('✅ Wyczyszczono płatności pracownicze');
        
        await runQuery('DELETE FROM payment_history');
        console.log('✅ Wyczyszczono historię płatności');

        console.log('');

        // ====== CZYSZCZENIE OSIEROCONYCH DOKUMENTÓW ======
        console.log('📄 Czyszczenie osieroconych dokumentów...');
        
        const deletedOrphanedDocs = await runQuery(`
            DELETE FROM documents 
            WHERE case_id IN (
                SELECT d.case_id 
                FROM documents d
                LEFT JOIN cases c ON d.case_id = c.id
                LEFT JOIN clients cl ON c.client_id = cl.id
                WHERE cl.id IS NULL
            )
        `);
        console.log(`✅ Wyczyszczono ${orphanedDocs.length} osieroconych dokumentów`);

        // Usuń również stare logi aktywności bez powiązań
        const deletedOrphanedActivity = await runQuery(`
            DELETE FROM employee_activity_logs 
            WHERE related_case_id NOT IN (SELECT id FROM cases)
            OR related_client_id NOT IN (SELECT id FROM clients)
        `);
        console.log(`✅ Wyczyszczono ${deletedOrphanedActivity.changes} osieroconych logów aktywności`);

        console.log('');
        console.log('═'.repeat(60));
        console.log('✅ CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!');
        console.log('═'.repeat(60));
        console.log('');

        // Podsumowanie
        const remainingClients = await getRows('SELECT COUNT(*) as count FROM clients');
        const remainingUsers = await getRows('SELECT COUNT(*) as count FROM users');
        const remainingCases = await getRows('SELECT COUNT(*) as count FROM cases');
        
        console.log('📊 PODSUMOWANIE:');
        console.log(`   👥 Użytkowników: ${remainingUsers[0].count}`);
        console.log(`   🤝 Klientów: ${remainingClients[0].count}`);
        console.log(`   📋 Spraw: ${remainingCases[0].count}`);
        console.log('');
        console.log('✨ Baza danych wyczyszczona z danych HR i finansowych!');
        console.log('');

    } catch (error) {
        console.error('❌ BŁĄD CZYSZCZENIA:', error);
        console.error('Stack:', error.stack);
    } finally {
        db.close();
        console.log('🔒 Zamknięto połączenie z bazą');
    }
}

// Uruchom czyszczenie
cleanup();
