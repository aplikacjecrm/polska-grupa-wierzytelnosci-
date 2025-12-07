/**
 * Skrypt do czyszczenia danych powiązanych z nieistniejącymi sprawami
 * - Dokumenty bez spraw
 * - Wydarzenia bez spraw
 * - Zadania bez spraw
 * - Dowody bez spraw
 * - Notatki bez spraw
 * - itp.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('🗑️ Skrypt czyszczenia osieroconych danych');
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
        console.log('📊 SPRAWDZAM OSIEROCONE DANE...');
        console.log('═'.repeat(60));

        // 1. Sprawdź istniejące sprawy
        const existingCases = await getRows('SELECT id FROM cases');
        const existingCaseIds = existingCases.map(c => c.id);
        
        console.log(`📋 Istniejących spraw w bazie: ${existingCaseIds.length}`);
        if (existingCaseIds.length > 0) {
            console.log(`   IDs: ${existingCaseIds.join(', ')}`);
        }
        console.log('');

        // 2. Znajdź osierocone dane
        const stats = {};

        // Dokumenty
        stats.documents = await getRows(`
            SELECT COUNT(*) as count FROM documents 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Wydarzenia
        stats.events = await getRows(`
            SELECT COUNT(*) as count FROM events 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Zadania
        stats.tasks = await getRows(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Dowody
        stats.evidence = await getRows(`
            SELECT COUNT(*) as count FROM case_evidence 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Świadkowie
        stats.witnesses = await getRows(`
            SELECT COUNT(*) as count FROM case_witnesses 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Notatki
        stats.notes = await getRows(`
            SELECT COUNT(*) as count FROM notes 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Komentarze
        stats.comments = await getRows(`
            SELECT COUNT(*) as count FROM case_comments 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Płatności
        stats.payments = await getRows(`
            SELECT COUNT(*) as count FROM payments 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Przeciwnicy procesowi
        stats.opposingParty = await getRows(`
            SELECT COUNT(*) as count FROM opposing_party 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        // Logi aktywności
        stats.activityLogs = await getRows(`
            SELECT COUNT(*) as count FROM employee_activity_logs 
            WHERE related_case_id IS NOT NULL 
            AND related_case_id NOT IN (SELECT id FROM cases)
        `);

        // Szczegóły spraw (różne typy)
        stats.civilDetails = await getRows(`
            SELECT COUNT(*) as count FROM civil_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        stats.criminalDetails = await getRows(`
            SELECT COUNT(*) as count FROM criminal_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        stats.familyDetails = await getRows(`
            SELECT COUNT(*) as count FROM family_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        stats.commercialDetails = await getRows(`
            SELECT COUNT(*) as count FROM commercial_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        stats.administrativeDetails = await getRows(`
            SELECT COUNT(*) as count FROM administrative_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);

        console.log('🔍 OSIEROCONE DANE (bez powiązanych spraw):');
        console.log(`   • Dokumenty: ${stats.documents[0].count}`);
        console.log(`   • Wydarzenia: ${stats.events[0].count}`);
        console.log(`   • Zadania: ${stats.tasks[0].count}`);
        console.log(`   • Dowody: ${stats.evidence[0].count}`);
        console.log(`   • Świadkowie: ${stats.witnesses[0].count}`);
        console.log(`   • Notatki: ${stats.notes[0].count}`);
        console.log(`   • Komentarze: ${stats.comments[0].count}`);
        console.log(`   • Płatności: ${stats.payments[0].count}`);
        console.log(`   • Przeciwnicy procesowi: ${stats.opposingParty[0].count}`);
        console.log(`   • Logi aktywności: ${stats.activityLogs[0].count}`);
        console.log(`   • Szczegóły spraw cywilnych: ${stats.civilDetails[0].count}`);
        console.log(`   • Szczegóły spraw karnych: ${stats.criminalDetails[0].count}`);
        console.log(`   • Szczegóły spraw rodzinnych: ${stats.familyDetails[0].count}`);
        console.log(`   • Szczegóły spraw gospodarczych: ${stats.commercialDetails[0].count}`);
        console.log(`   • Szczegóły spraw administracyjnych: ${stats.administrativeDetails[0].count}`);
        console.log('');

        // Oblicz sumę
        const totalOrphaned = Object.values(stats).reduce((sum, stat) => sum + stat[0].count, 0);
        
        if (totalOrphaned === 0) {
            console.log('✅ Brak osieroconych danych - baza jest czysta!');
            db.close();
            process.exit(0);
        }

        console.log(`📊 RAZEM: ${totalOrphaned} osieroconych rekordów`);
        console.log('');

        console.log('═'.repeat(60));
        console.log('⚠️  ROZPOCZYNAM CZYSZCZENIE...');
        console.log('═'.repeat(60));
        console.log('');

        // 3. Usuwanie osieroconych danych

        // Dokumenty
        const deletedDocs = await runQuery(`
            DELETE FROM documents 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone dokumenty: ${deletedDocs.changes}`);

        // Wydarzenia
        const deletedEvents = await runQuery(`
            DELETE FROM events 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone wydarzenia: ${deletedEvents.changes}`);

        // Zadania
        const deletedTasks = await runQuery(`
            DELETE FROM tasks 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone zadania: ${deletedTasks.changes}`);

        // Dowody
        const deletedEvidence = await runQuery(`
            DELETE FROM case_evidence 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone dowody: ${deletedEvidence.changes}`);

        // Świadkowie
        const deletedWitnesses = await runQuery(`
            DELETE FROM case_witnesses 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osieroconych świadków: ${deletedWitnesses.changes}`);

        // Notatki
        const deletedNotes = await runQuery(`
            DELETE FROM notes 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone notatki: ${deletedNotes.changes}`);

        // Komentarze
        const deletedComments = await runQuery(`
            DELETE FROM case_comments 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone komentarze: ${deletedComments.changes}`);

        // Płatności (i powiązane)
        await runQuery(`
            DELETE FROM payment_installments 
            WHERE payment_id IN (
                SELECT id FROM payments 
                WHERE case_id IS NOT NULL 
                AND case_id NOT IN (SELECT id FROM cases)
            )
        `);
        
        const deletedPayments = await runQuery(`
            DELETE FROM payments 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone płatności: ${deletedPayments.changes}`);

        // Przeciwnicy procesowi
        const deletedOpposing = await runQuery(`
            DELETE FROM opposing_party 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osieroconych przeciwników: ${deletedOpposing.changes}`);

        // Logi aktywności
        const deletedLogs = await runQuery(`
            DELETE FROM employee_activity_logs 
            WHERE related_case_id IS NOT NULL 
            AND related_case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto osierocone logi: ${deletedLogs.changes}`);

        // Szczegóły spraw
        await runQuery(`
            DELETE FROM civil_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto szczegóły spraw cywilnych`);

        await runQuery(`
            DELETE FROM criminal_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto szczegóły spraw karnych`);

        await runQuery(`
            DELETE FROM family_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto szczegóły spraw rodzinnych`);

        await runQuery(`
            DELETE FROM commercial_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto szczegóły spraw gospodarczych`);

        await runQuery(`
            DELETE FROM administrative_case_details 
            WHERE case_id IS NOT NULL 
            AND case_id NOT IN (SELECT id FROM cases)
        `);
        console.log(`✅ Usunięto szczegóły spraw administracyjnych`);

        console.log('');
        console.log('═'.repeat(60));
        console.log('✅ CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!');
        console.log('═'.repeat(60));
        console.log('');

        // Podsumowanie końcowe
        const remainingCases = await getRows('SELECT COUNT(*) as count FROM cases');
        const remainingDocs = await getRows('SELECT COUNT(*) as count FROM documents');
        const remainingEvents = await getRows('SELECT COUNT(*) as count FROM events');
        
        console.log('📊 PODSUMOWANIE:');
        console.log(`   📋 Spraw w bazie: ${remainingCases[0].count}`);
        console.log(`   📄 Dokumentów: ${remainingDocs[0].count}`);
        console.log(`   📅 Wydarzeń: ${remainingEvents[0].count}`);
        console.log('');
        console.log('✨ Baza danych wyczyszczona z osieroconych danych!');
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
