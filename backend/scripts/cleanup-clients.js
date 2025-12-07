/**
 * Skrypt do czyszczenia bazy danych - usuwa wszystkich klientów OPRÓCZ Tomasz Stefanczyk
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('🗑️ Skrypt czyszczenia klientów');
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
        console.log('📊 SPRAWDZAM BAZĘ DANYCH...');
        console.log('═'.repeat(60));

        // 1. Znajdź Tomasza Stefańczyka (ID: 17)
        const tomasz = await getRows(
            `SELECT id, first_name, last_name, email, company_name 
             FROM clients 
             WHERE id = 17 OR (first_name LIKE '%Tomasz%' AND last_name LIKE '%Stefan%')`
        );

        if (tomasz.length === 0) {
            console.log('⚠️  Nie znaleziono klienta: Tomasz Stefanczyk');
            console.log('❌ Przerwano czyszczenie dla bezpieczeństwa');
            db.close();
            process.exit(0);
        }

        const tomaszId = tomasz[0].id;
        console.log('✅ Znaleziono Tomasza Stefanczyka:');
        console.log(`   ID: ${tomaszId}`);
        console.log(`   Imię i nazwisko: ${tomasz[0].first_name} ${tomasz[0].last_name}`);
        console.log(`   Email: ${tomasz[0].email}`);
        console.log(`   Firma: ${tomasz[0].company_name || 'brak'}`);
        console.log('');

        // 2. Policz wszystkich klientów
        const allClients = await getRows('SELECT COUNT(*) as count FROM clients');
        const totalClients = allClients[0].count;
        console.log(`📊 Wszystkich klientów w bazie: ${totalClients}`);
        console.log(`🗑️  Do usunięcia: ${totalClients - 1}`);
        console.log('');

        // 3. Pokaż klientów do usunięcia
        const clientsToDelete = await getRows(
            'SELECT id, first_name, last_name, email FROM clients WHERE id != ?',
            [tomaszId]
        );

        if (clientsToDelete.length > 0) {
            console.log('📋 KLIENCI DO USUNIĘCIA:');
            console.log('─'.repeat(60));
            clientsToDelete.forEach(client => {
                console.log(`   • ${client.first_name} ${client.last_name} (${client.email}) - ID: ${client.id}`);
            });
            console.log('');
        }

        // 4. Policz powiązane rekordy
        const relatedCases = await getRows(
            'SELECT COUNT(*) as count FROM cases WHERE client_id != ?',
            [tomaszId]
        );
        const relatedFiles = await getRows(
            'SELECT COUNT(*) as count FROM client_files WHERE client_id != ?',
            [tomaszId]
        );
        const relatedBalance = await getRows(
            'SELECT COUNT(*) as count FROM client_balance WHERE client_id != ?',
            [tomaszId]
        );

        console.log('📊 POWIĄZANE REKORDY DO USUNIĘCIA:');
        console.log(`   • Sprawy: ${relatedCases[0].count}`);
        console.log(`   • Pliki: ${relatedFiles[0].count}`);
        console.log(`   • Saldo: ${relatedBalance[0].count}`);
        console.log('');

        console.log('═'.repeat(60));
        console.log('⚠️  ROZPOCZYNAM CZYSZCZENIE...');
        console.log('═'.repeat(60));

        // 5. Usuwanie w kolejności (ze względu na foreign keys)
        
        // Usuwanie sald klientów
        const deletedBalance = await runQuery(
            'DELETE FROM client_balance WHERE client_id != ?',
            [tomaszId]
        );
        console.log(`✅ Usunięto salda klientów: ${deletedBalance.changes}`);

        // Usuwanie transakcji sald
        const deletedBalanceTx = await runQuery(
            `DELETE FROM balance_transactions 
             WHERE client_id != ?`,
            [tomaszId]
        );
        console.log(`✅ Usunięto transakcje sald: ${deletedBalanceTx.changes}`);

        // Usuwanie plików klientów
        const deletedFiles = await runQuery(
            'DELETE FROM client_files WHERE client_id != ?',
            [tomaszId]
        );
        console.log(`✅ Usunięto pliki klientów: ${deletedFiles.changes}`);

        // Usuwanie aktywności związanych ze sprawami innych klientów
        const deletedActivity = await runQuery(
            `DELETE FROM employee_activity_logs 
             WHERE related_case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto logi aktywności: ${deletedActivity.changes}`);

        // Usuwanie dokumentów związanych ze sprawami
        const deletedDocuments = await runQuery(
            `DELETE FROM documents 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto dokumenty: ${deletedDocuments.changes}`);

        // Usuwanie wydarzeń związanych ze sprawami
        const deletedEvents = await runQuery(
            `DELETE FROM events 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto wydarzenia: ${deletedEvents.changes}`);

        // Usuwanie zadań związanych ze sprawami
        const deletedTasks = await runQuery(
            `DELETE FROM tasks 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto zadania: ${deletedTasks.changes}`);

        // Usuwanie dowodów
        const deletedEvidence = await runQuery(
            `DELETE FROM case_evidence 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto dowody: ${deletedEvidence.changes}`);

        // Usuwanie świadków
        const deletedWitnesses = await runQuery(
            `DELETE FROM case_witnesses 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto świadków: ${deletedWitnesses.changes}`);

        // Usuwanie przeciwników procesowych
        const deletedOpposing = await runQuery(
            `DELETE FROM opposing_party 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto przeciwników procesowych: ${deletedOpposing.changes}`);

        // Usuwanie notatek do spraw
        const deletedNotes = await runQuery(
            `DELETE FROM notes 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto notatki: ${deletedNotes.changes}`);

        // Usuwanie komentarzy do spraw
        const deletedComments = await runQuery(
            `DELETE FROM case_comments 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto komentarze: ${deletedComments.changes}`);

        // Usuwanie płatności
        const deletedPayments = await runQuery(
            `DELETE FROM payments 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto płatności: ${deletedPayments.changes}`);

        // Usuwanie faktur
        const deletedInvoices = await runQuery(
            `DELETE FROM invoices 
             WHERE case_id IN (
                SELECT id FROM cases WHERE client_id != ?
             )`,
            [tomaszId]
        );
        console.log(`✅ Usunięto faktury: ${deletedInvoices.changes}`);

        // Usuwanie spraw
        const deletedCases = await runQuery(
            'DELETE FROM cases WHERE client_id != ?',
            [tomaszId]
        );
        console.log(`✅ Usunięto sprawy: ${deletedCases.changes}`);

        // OSTATECZNIE - usuwanie klientów
        const deletedClients = await runQuery(
            'DELETE FROM clients WHERE id != ?',
            [tomaszId]
        );
        console.log(`✅ Usunięto klientów: ${deletedClients.changes}`);

        console.log('');
        console.log('═'.repeat(60));
        console.log('✅ CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!');
        console.log('═'.repeat(60));
        console.log('');

        // Podsumowanie
        const remainingClients = await getRows('SELECT COUNT(*) as count FROM clients');
        console.log(`📊 Pozostało klientów: ${remainingClients[0].count}`);
        console.log(`👤 Zachowany klient: ${tomasz[0].first_name} ${tomasz[0].last_name}`);
        console.log('');

    } catch (error) {
        console.error('❌ BŁĄD CZYSZCZENIA:', error);
    } finally {
        db.close();
        console.log('🔒 Zamknięto połączenie z bazą');
    }
}

// Uruchom czyszczenie
cleanup();
