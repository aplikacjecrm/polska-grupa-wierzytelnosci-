/**
 * Aktualizuje opisy wypłat prowizji - zamienia ID sprawy na numer sprawy
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

async function fixPaymentDescriptions() {
    console.log('🔧 Aktualizuję opisy wypłat prowizji...\n');
    
    try {
        // Pobierz employee_payments z prowizjami które mają (ID: XX) w opisie
        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ep.id,
                    ep.description,
                    ep.commission_id,
                    ec.case_id,
                    c.case_number
                FROM employee_payments ep
                LEFT JOIN employee_commissions ec ON ep.commission_id = ec.id
                LEFT JOIN cases c ON ec.case_id = c.id
                WHERE ep.description LIKE '%ID:%'
                ORDER BY ep.id
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (payments.length === 0) {
            console.log('✅ Wszystkie wypłaty mają już poprawne opisy!\n');
            db.close();
            process.exit(0);
        }
        
        console.log(`⚠️ Znaleziono ${payments.length} wypłat do aktualizacji:\n`);
        
        let updated = 0;
        
        for (const payment of payments) {
            console.log(`\n📋 Wypłata ID: ${payment.id}`);
            console.log(`   PRZED: ${payment.description}`);
            
            if (!payment.case_number) {
                console.log(`   ⚠️ Brak numeru sprawy (case_id: ${payment.case_id}) - pomijam`);
                continue;
            }
            
            // Zamień "Prowizja za sprawę (ID: 27)" na "Prowizja za sprawę ODS/TN01/001"
            const newDescription = payment.description.replace(
                /\(ID:\s*\d+\)/gi,
                payment.case_number
            );
            
            console.log(`   PO:    ${newDescription}`);
            
            if (newDescription !== payment.description) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        UPDATE employee_payments 
                        SET description = ?
                        WHERE id = ?
                    `, [newDescription, payment.id], (err) => {
                        if (err) reject(err);
                        else {
                            console.log(`   ✅ Zaktualizowano`);
                            updated++;
                            resolve();
                        }
                    });
                });
            } else {
                console.log(`   ⚠️ Nie zmieniono (brak dopasowania)`);
            }
        }
        
        console.log(`\n\n📊 PODSUMOWANIE:`);
        console.log(`   ✅ Zaktualizowano: ${updated} wypłat`);
        console.log(`   📋 Sprawdzono: ${payments.length}`);
        
        db.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        db.close();
        process.exit(1);
    }
}

fixPaymentDescriptions();
