/**
 * Automatyczne wyliczanie i tworzenie prowizji
 */

const { getDatabase } = require('../database/init');

/**
 * Oblicza i tworzy prowizje dla płatności
 * @param {number} paymentId - ID płatności
 * @param {number} caseId - ID sprawy
 * @param {number} amount - Kwota płatności
 */
async function calculateAndCreateCommissions(paymentId, caseId, amount) {
    const db = getDatabase();
    
    try {
        console.log(`💰 Wyliczam prowizje dla płatności ${paymentId}, sprawa ${caseId}, kwota ${amount}`);
        
        // Pobierz informacje o sprawie + klienta (dla opiekuna klienta)
        const caseData = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    c.*,
                    u1.id as lawyer_id, u1.name as lawyer_name,
                    u2.id as case_manager_id, u2.name as case_manager_name,
                    cl.assigned_to as client_manager_id,
                    u3.id as client_manager_user_id, u3.name as client_manager_name
                FROM cases c
                LEFT JOIN users u1 ON c.assigned_to = u1.id
                LEFT JOIN users u2 ON c.case_manager_id = u2.id
                LEFT JOIN clients cl ON c.client_id = cl.id
                LEFT JOIN users u3 ON cl.assigned_to = u3.id
                WHERE c.id = ?
            `, [caseId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!caseData) {
            console.log('⚠️ Sprawa nie znaleziona, pomijam prowizje');
            return { success: false, message: 'Case not found' };
        }
        
        const commissions = [];
        
        // 1. MECENAS (assigned_to) - 15%
        if (caseData.lawyer_id) {
            const rate = await getCommissionRate(db, caseData.lawyer_id, 'lawyer') || 15;
            const commissionAmount = (amount * rate) / 100;
            
            await createCommission(db, {
                employee_id: caseData.lawyer_id,
                case_id: caseId,
                payment_id: paymentId,
                amount: commissionAmount,
                rate: rate,
                status: 'pending',
                description: `Prowizja mecenasa za sprawę ${caseData.case_number} (${rate}%)`
            });
            
            commissions.push({
                employee_id: caseData.lawyer_id,
                employee_name: caseData.lawyer_name,
                role: 'lawyer',
                amount: commissionAmount,
                rate: rate
            });
            
            console.log(`✅ Prowizja mecenasa: ${caseData.lawyer_name} - ${commissionAmount} PLN (${rate}%)`);
        }
        
        // 2. OPIEKUN SPRAWY (case_manager) - 10%
        if (caseData.case_manager_id && caseData.case_manager_id !== caseData.lawyer_id) {
            const rate = await getCommissionRate(db, caseData.case_manager_id, 'case_manager') || 10;
            const commissionAmount = (amount * rate) / 100;
            
            await createCommission(db, {
                employee_id: caseData.case_manager_id,
                case_id: caseId,
                payment_id: paymentId,
                amount: commissionAmount,
                rate: rate,
                status: 'pending',
                description: `Prowizja opiekuna sprawy ${caseData.case_number} (${rate}%)`
            });
            
            commissions.push({
                employee_id: caseData.case_manager_id,
                employee_name: caseData.case_manager_name,
                role: 'case_manager',
                amount: commissionAmount,
                rate: rate
            });
            
            console.log(`✅ Prowizja opiekuna sprawy: ${caseData.case_manager_name} - ${commissionAmount} PLN (${rate}%)`);
        }
        
        // 3. OPIEKUN KLIENTA (client_manager) - 5%
        if (caseData.client_manager_id && 
            caseData.client_manager_id !== caseData.lawyer_id && 
            caseData.client_manager_id !== caseData.case_manager_id) {
            
            const rate = await getCommissionRate(db, caseData.client_manager_id, 'client_manager') || 5;
            const commissionAmount = (amount * rate) / 100;
            
            await createCommission(db, {
                employee_id: caseData.client_manager_id,
                case_id: caseId,
                payment_id: paymentId,
                amount: commissionAmount,
                rate: rate,
                status: 'pending',
                description: `Prowizja opiekuna klienta dla sprawy ${caseData.case_number} (${rate}%)`
            });
            
            commissions.push({
                employee_id: caseData.client_manager_id,
                employee_name: caseData.client_manager_name,
                role: 'client_manager',
                amount: commissionAmount,
                rate: rate
            });
            
            console.log(`✅ Prowizja opiekuna klienta: ${caseData.client_manager_name} - ${commissionAmount} PLN (${rate}%)`);
        }
        
        console.log(`🎉 Utworzono ${commissions.length} prowizji dla płatności ${paymentId}`);
        
        return {
            success: true,
            commissions_created: commissions.length,
            commissions: commissions,
            total_commission_amount: commissions.reduce((sum, c) => sum + c.amount, 0)
        };
        
    } catch (error) {
        console.error('❌ Błąd wyliczania prowizji:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Pobiera stawkę prowizji dla pracownika
 */
async function getCommissionRate(db, employeeId, roleType) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT rate 
            FROM commission_rates 
            WHERE user_id = ? AND role_type = ? AND is_active = 1
            ORDER BY effective_from DESC
            LIMIT 1
        `, [employeeId, roleType], (err, row) => {
            if (err) {
                console.error('Błąd pobierania stawki:', err);
                resolve(null);
            } else {
                resolve(row ? row.rate : null);
            }
        });
    });
}

/**
 * Tworzy prowizję w bazie
 */
async function createCommission(db, commissionData) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO employee_commissions (
                employee_id, case_id, payment_id, amount, rate,
                status, description, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
            commissionData.employee_id,
            commissionData.case_id,
            commissionData.payment_id,
            commissionData.amount,
            commissionData.rate,
            commissionData.status,
            commissionData.description
        ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

module.exports = {
    calculateAndCreateCommissions,
    getCommissionRate,
    createCommission
};
