/**
 * Dodaje numer płatności do opisów wypłat prowizji
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

async function addPaymentCodeToDescriptions() {
    console.log('🔧 Dodaję numery płatności do opisów prowizji...\n');
    
    try {
        // Pobierz employee_payments z prowizjami które NIE mają już numeru płatności
        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ep.id,
                    ep.description,
                    ep.commission_id,
                    ec.payment_id,
                    p.payment_code
                FROM employee_payments ep
                LEFT JOIN employee_commissions ec ON ep.commission_id = ec.id
                LEFT JOIN payments p ON ec.payment_id = p.id
                WHERE ep.payment_type = 'commission'
                  AND ep.description NOT LIKE '%Płatność%'
                  AND p.payment_code IS NOT NULL
                ORDER BY ep.id
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (payments.length === 0) {
            console.log('✅ Wszystkie wypłaty mają już numery płatności w opisie!\n');
            db.close();
            process.exit(0);
        }
        
        console.log(`⚠️ Znaleziono ${payments.length} wypłat do aktualizacji:\n`);
        
        let updated = 0;
        
        for (const payment of payments) {
            console.log(`\n📋 Wypłata ID: ${payment.id}`);
            console.log(`   PRZED: ${payment.description}`);
            
            if (!payment.payment_code) {
                console.log(`   ⚠️ Brak numeru płatności (payment_id: ${payment.payment_id}) - pomijam`);
                continue;
            }
            
            // Dodaj " - Płatność XXX" na końcu
            const newDescription = `${payment.description} - Płatność ${payment.payment_code}`;
            
            console.log(`   PO:    ${newDescription}`);
            
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

addPaymentCodeToDescriptions();
