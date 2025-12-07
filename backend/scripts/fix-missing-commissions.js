/**
 * Naprawia brakujące prowizje - tworzy prowizje dla płatności, które ich nie mają
 */

const { getDatabase } = require('../database/init');
const { calculateAndCreateCommissions } = require('../utils/commission-calculator');

async function fixMissingCommissions() {
    const db = getDatabase();
    
    console.log('🔧 Szukam płatności bez prowizji...\n');
    
    try {
        // Znajdź płatności z case_id, które nie mają prowizji
        const paymentsWithoutCommissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    p.id,
                    p.case_id,
                    p.amount,
                    p.status,
                    p.created_at,
                    c.case_number,
                    c.assigned_to as lawyer_id,
                    u.name as lawyer_name
                FROM payments p
                LEFT JOIN cases c ON p.case_id = c.id
                LEFT JOIN users u ON c.assigned_to = u.id
                WHERE p.case_id IS NOT NULL
                  AND p.id NOT IN (
                    SELECT DISTINCT payment_id 
                    FROM employee_commissions 
                    WHERE payment_id IS NOT NULL
                  )
                ORDER BY p.created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (paymentsWithoutCommissions.length === 0) {
            console.log('✅ Wszystkie płatności mają prowizje!\n');
            process.exit(0);
        }
        
        console.log(`⚠️ Znaleziono ${paymentsWithoutCommissions.length} płatności bez prowizji:\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const payment of paymentsWithoutCommissions) {
            console.log(`\n📋 Payment ID: ${payment.id} | ${payment.amount} PLN | Status: ${payment.status}`);
            console.log(`   Case: ${payment.case_number} | Mecenas: ${payment.lawyer_name || 'BRAK'}`);
            
            if (!payment.lawyer_id) {
                console.log('   ⚠️ Brak mecenasa - pomijam');
                continue;
            }
            
            try {
                const result = await calculateAndCreateCommissions(
                    payment.id, 
                    payment.case_id, 
                    parseFloat(payment.amount)
                );
                
                if (result.success) {
                    console.log(`   ✅ Utworzono ${result.commissions_created} prowizji (${result.total_commission_amount} PLN)`);
                    successCount++;
                } else {
                    console.log(`   ❌ Nie udało się: ${result.message || 'Unknown error'}`);
                    errorCount++;
                }
            } catch (err) {
                console.log(`   ❌ Błąd: ${err.message}`);
                errorCount++;
            }
        }
        
        console.log(`\n\n📊 PODSUMOWANIE:`);
        console.log(`   ✅ Naprawiono: ${successCount} płatności`);
        console.log(`   ❌ Błędy: ${errorCount}`);
        console.log(`   📋 Razem: ${paymentsWithoutCommissions.length}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        process.exit(1);
    }
}

fixMissingCommissions();
