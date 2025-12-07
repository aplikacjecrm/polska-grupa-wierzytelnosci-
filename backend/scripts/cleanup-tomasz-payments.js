/**
 * Skrypt do usunięcia płatności związanych ze sprawami Tomasza Stefańczyka
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('🗑️ Skrypt czyszczenia płatności Tomasza Stefańczyka');
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
        console.log('📊 SPRAWDZAM PŁATNOŚCI...');
        console.log('═'.repeat(60));

        // 1. Znajdź Tomasza Stefańczyka
        const tomasz = await getRows(
            `SELECT id, first_name, last_name, email 
             FROM clients 
             WHERE id = 17`
        );

        if (tomasz.length === 0) {
            console.log('⚠️  Nie znaleziono Tomasza Stefańczyka');
            db.close();
            process.exit(0);
        }

        const tomaszId = tomasz[0].id;
        console.log('✅ Znaleziono:');
        console.log(`   ID: ${tomaszId}`);
        console.log(`   Imię i nazwisko: ${tomasz[0].first_name} ${tomasz[0].last_name}`);
        console.log(`   Email: ${tomasz[0].email}`);
        console.log('');

        // 2. Znajdź sprawy Tomasza
        const cases = await getRows(
            'SELECT id, case_number, title FROM cases WHERE client_id = ?',
            [tomaszId]
        );

        console.log(`📋 Sprawy Tomasza: ${cases.length}`);
        cases.forEach(c => {
            console.log(`   • ${c.case_number} - ${c.title} (ID: ${c.id})`);
        });
        console.log('');

        if (cases.length === 0) {
            console.log('⚠️  Brak spraw - nic do usunięcia');
            db.close();
            process.exit(0);
        }

        const caseIds = cases.map(c => c.id);

        // 3. Policz płatności
        const paymentsCount = await getRows(
            `SELECT COUNT(*) as count FROM payments 
             WHERE case_id IN (${caseIds.join(',')})` 
        );

        const installmentsCount = await getRows(
            `SELECT COUNT(*) as count FROM payment_installments 
             WHERE payment_id IN (
                SELECT id FROM payments WHERE case_id IN (${caseIds.join(',')})
             )`
        );

        const receiptsCount = await getRows(
            `SELECT COUNT(*) as count FROM payment_receipts 
             WHERE payment_id IN (
                SELECT id FROM payments WHERE case_id IN (${caseIds.join(',')})
             )`
        );

        const remindersCount = await getRows(
            `SELECT COUNT(*) as count FROM payment_reminders 
             WHERE payment_id IN (
                SELECT id FROM payments WHERE case_id IN (${caseIds.join(',')})
             )`
        );

        const historyCount = await getRows(
            `SELECT COUNT(*) as count FROM payment_history 
             WHERE payment_id IN (
                SELECT id FROM payments WHERE case_id IN (${caseIds.join(',')})
             )`
        );

        console.log('💰 PŁATNOŚCI DO USUNIĘCIA:');
        console.log(`   • Płatności główne: ${paymentsCount[0].count}`);
        console.log(`   • Raty: ${installmentsCount[0].count}`);
        console.log(`   • Potwierdzenia: ${receiptsCount[0].count}`);
        console.log(`   • Przypomnienia: ${remindersCount[0].count}`);
        console.log(`   • Historia: ${historyCount[0].count}`);
        console.log('');

        console.log('═'.repeat(60));
        console.log('⚠️  ROZPOCZYNAM USUWANIE...');
        console.log('═'.repeat(60));
        console.log('');

        // 4. Usuwanie w kolejności (ze względu na foreign keys)
        
        // Najpierw zbierz ID płatności
        const paymentIds = await getRows(
            `SELECT id FROM payments WHERE case_id IN (${caseIds.join(',')})`
        );
        const paymentIdList = paymentIds.map(p => p.id);
        
        if (paymentIdList.length === 0) {
            console.log('⚠️  Brak płatności do usunięcia');
        } else {
            console.log(`📋 Znaleziono płatności: ${paymentIdList.join(', ')}`);
            console.log('');

            // Usuń wpłaty rat (jeśli tabela istnieje i ma odpowiednią strukturę)
            try {
                const deletedInstallmentPayments = await runQuery(
                    `DELETE FROM installment_payments 
                     WHERE payment_id IN (${paymentIdList.join(',')})`
                );
                console.log(`✅ Usunięto wpłaty rat: ${deletedInstallmentPayments.changes}`);
            } catch (err) {
                console.log(`⚠️  Pominięto wpłaty rat (tabela/kolumna nie istnieje)`);
            }

            // Usuń harmonogram rat
            try {
                const deletedInstallments = await runQuery(
                    `DELETE FROM payment_installments 
                     WHERE payment_id IN (${paymentIdList.join(',')})`
                );
                console.log(`✅ Usunięto raty: ${deletedInstallments.changes}`);
            } catch (err) {
                console.log(`⚠️  Pominięto raty (${err.message})`);
            }

            // Usuń potwierdzenia płatności
            try {
                const deletedReceipts = await runQuery(
                    `DELETE FROM payment_receipts 
                     WHERE payment_id IN (${paymentIdList.join(',')})`
                );
                console.log(`✅ Usunięto potwierdzenia: ${deletedReceipts.changes}`);
            } catch (err) {
                console.log(`⚠️  Pominięto potwierdzenia (${err.message})`);
            }

            // Usuń przypomnienia o płatnościach
            try {
                const deletedReminders = await runQuery(
                    `DELETE FROM payment_reminders 
                     WHERE payment_id IN (${paymentIdList.join(',')})`
                );
                console.log(`✅ Usunięto przypomnienia: ${deletedReminders.changes}`);
            } catch (err) {
                console.log(`⚠️  Pominięto przypomnienia (${err.message})`);
            }

            // Usuń historię płatności
            try {
                const deletedHistory = await runQuery(
                    `DELETE FROM payment_history 
                     WHERE payment_id IN (${paymentIdList.join(',')})`
                );
                console.log(`✅ Usunięto historię: ${deletedHistory.changes}`);
            } catch (err) {
                console.log(`⚠️  Pominięto historię (${err.message})`);
            }

            // OSTATECZNIE - usuń płatności główne
            const deletedPayments = await runQuery(
                `DELETE FROM payments WHERE case_id IN (${caseIds.join(',')})`
            );
            console.log(`✅ Usunięto płatności główne: ${deletedPayments.changes}`);
        }

        console.log('');
        console.log('═'.repeat(60));
        console.log('✅ CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!');
        console.log('═'.repeat(60));
        console.log('');

        // Podsumowanie
        const remainingPayments = await getRows(
            `SELECT COUNT(*) as count FROM payments 
             WHERE case_id IN (${caseIds.join(',')})`
        );
        
        console.log('📊 PODSUMOWANIE:');
        console.log(`   💰 Pozostało płatności dla Tomasza: ${remainingPayments[0].count}`);
        console.log(`   👤 Klient Tomasz Stefańczyk i jego sprawy: ZACHOWANE`);
        console.log(`   🗑️  Płatności: USUNIĘTE`);
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
