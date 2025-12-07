/**
 * Skrypt do tworzenia testowej przeterminowanej płatności
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
console.log('📍 Database path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

async function createOverduePayment() {
    try {
        // Pobierz pierwszą sprawę
        const caseData = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM cases LIMIT 1', (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!caseData) {
            console.error('❌ Brak spraw w bazie danych');
            process.exit(1);
        }

        console.log('✅ Znaleziono sprawę:', caseData.case_number);

        // Pobierz klienta sprawy
        const client = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM clients WHERE id = ?', [caseData.client_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        console.log('✅ Klient:', client.first_name, client.last_name);

        // Pobierz mecenasa sprawy
        const lawyer = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [caseData.assigned_lawyer_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Wygeneruj kod płatności
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        
        const lastPayment = await new Promise((resolve, reject) => {
            db.get(`
                SELECT payment_code FROM payments 
                WHERE payment_code LIKE 'PAY/ODS/${caseData.case_number}/${year}/${month}/%'
                ORDER BY id DESC LIMIT 1
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        let number = 1;
        if (lastPayment) {
            const parts = lastPayment.payment_code.split('/');
            number = parseInt(parts[parts.length - 1]) + 1;
        }

        const paymentCode = `PAY/ODS/${caseData.case_number}/${year}/${month}/${String(number).padStart(3, '0')}`;
        console.log('💰 Kod płatności:', paymentCode);

        // Data przeterminowana (15 dni temu)
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - 15);
        const dueDateStr = overdueDate.toISOString().split('T')[0];

        console.log('📅 Termin płatności (przeterminowany):', dueDateStr);

        // Utwórz płatność
        const paymentId = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payments (
                    case_id,
                    client_id,
                    lawyer_id,
                    payment_code,
                    amount,
                    currency,
                    payment_type,
                    payment_method,
                    description,
                    status,
                    due_date,
                    created_by,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [
                caseData.id,
                caseData.client_id,
                caseData.assigned_lawyer_id,
                paymentCode,
                1500.00,
                'PLN',
                'invoice',
                'bank_transfer',
                'TESTOWA PRZETERMINOWANA PŁATNOŚĆ - Opłata za reprezentację',
                'pending',
                dueDateStr,
                lawyer ? lawyer.id : 1
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        console.log('✅ Utworzono płatność #' + paymentId);
        console.log('💡 Kod:', paymentCode);
        console.log('💰 Kwota: 1500.00 PLN');
        console.log('📅 Termin (przeterminowany): ' + dueDateStr);
        console.log('⚠️ Status: PENDING - PRZETERMINOWANA');
        console.log('');
        console.log('🔴 Odśwież stronę aby zobaczyć płatność na czerwono!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd:', error);
        process.exit(1);
    }
}

createOverduePayment();
