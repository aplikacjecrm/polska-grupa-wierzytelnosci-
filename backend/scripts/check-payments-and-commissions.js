const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Sprawdzanie płatności i prowizji...\n');

// 1. Ostatnie płatności
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
    ORDER BY p.created_at DESC
    LIMIT 10
`, (err, payments) => {
    if (err) {
        console.error('❌ Błąd:', err);
        process.exit(1);
    }
    
    console.log(`📋 OSTATNIE 10 PŁATNOŚCI:\n`);
    payments.forEach((p, i) => {
        console.log(`${i+1}. Payment ID: ${p.id} | Status: ${p.status.padEnd(10)} | ${p.amount} PLN`);
        console.log(`   Case: ${p.case_id || 'BRAK'} (${p.case_number || 'N/A'}) | Mecenas: ${p.lawyer_name || 'BRAK PRZYPISANIA'} (ID: ${p.lawyer_id || 'N/A'})`);
        console.log(`   Data: ${p.created_at}`);
        console.log('');
    });
    
    // 2. Prowizje dla tych płatności
    const paymentIds = payments.map(p => p.id).join(',');
    
    db.all(`
        SELECT 
            ec.*,
            u.name as employee_name
        FROM employee_commissions ec
        LEFT JOIN users u ON ec.employee_id = u.id
        WHERE ec.payment_id IN (${paymentIds})
        ORDER BY ec.created_at DESC
    `, (err, commissions) => {
        if (err) {
            console.error('❌ Błąd:', err);
            db.close();
            process.exit(1);
        }
        
        console.log(`\n💰 PROWIZJE DLA TYCH PŁATNOŚCI:\n`);
        
        if (commissions.length === 0) {
            console.log('⚠️ BRAK PROWIZJI! To może oznaczać:');
            console.log('   1. Płatności nie mają przypisanej sprawy (case_id = NULL)');
            console.log('   2. Sprawy nie mają przypisanego mecenasa (assigned_to = NULL)');
            console.log('   3. Funkcja calculateAndCreateCommissions nie zadziałała\n');
        } else {
            commissions.forEach((c, i) => {
                console.log(`${i+1}. Commission ID: ${c.id} | Payment: ${c.payment_id} | ${c.status.padEnd(10)} | ${c.amount} PLN`);
                console.log(`   Employee: ${c.employee_name} (ID: ${c.employee_id}) | Rate: ${c.rate}%`);
                console.log(`   ${c.description}`);
                console.log('');
            });
        }
        
        // 3. Wszystkie prowizje
        db.all(`
            SELECT status, COUNT(*) as count, SUM(amount) as total
            FROM employee_commissions
            GROUP BY status
        `, (err, summary) => {
            if (err) {
                console.error('❌ Błąd:', err);
            } else {
                console.log('\n📊 PODSUMOWANIE WSZYSTKICH PROWIZJI:\n');
                summary.forEach(s => {
                    console.log(`   ${s.status.padEnd(10)}: ${s.count} prowizji, ${s.total} PLN`);
                });
            }
            
            db.close();
            process.exit(0);
        });
    });
});
