/**
 * HR COMPENSATION ROUTES
 * System zarządzania stawkami prowizji i wynagrodzeń
 * 
 * Funkcje:
 * - HR ustala stawki i wynagrodzenia
 * - Admin zatwierdza zmiany
 * - Finance wypłaca na podstawie zatwierdzonych stawek
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

console.log('💰 [HR-COMPENSATION] Moduł hr-compensation.js załadowany!');

// =====================================
// LISTA PRACOWNIKÓW Z STAWKAMI
// =====================================
router.get('/employees', verifyToken, async (req, res) => {
    try {
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        
        // Tylko Admin, HR, Finance mogą przeglądać
        if (!['admin', 'hr', 'finance'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        console.log(`👥 [HR-COMPENSATION] Pobieranie listy pracowników z stawkami (rola: ${userRole})`);
        
        const employees = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.role as user_role,
                    ec.base_salary,
                    ec.currency,
                    ec.employment_type,
                    ec.contract_type,
                    ec.commission_enabled,
                    ec.default_commission_rate,
                    ec.bonus_eligible,
                    ec.last_review_date,
                    ec.next_review_date,
                    ec.hr_notes,
                    ec.updated_at
                FROM users u
                LEFT JOIN employee_compensation ec ON u.id = ec.user_id
                WHERE u.role IN ('lawyer', 'case_manager', 'client_manager', 'admin', 'hr', 'finance')
                ORDER BY u.name ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            employees,
            count: employees.length
        });
        
    } catch (error) {
        console.error('❌ [HR-COMPENSATION] Błąd pobierania pracowników:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// SZCZEGÓŁY PRACOWNIKA Z HISTORIĄ ZMIAN
// =====================================
router.get('/employees/:userId', verifyToken, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;
        const userRole = req.user.user_role || req.user.role;
        
        if (!['admin', 'hr', 'finance'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        console.log(`📋 [HR-COMPENSATION] Pobieranie szczegółów pracownika ${userId}`);
        
        // Pobierz dane pracownika
        const employee = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.role as user_role,
                    ec.*
                FROM users u
                LEFT JOIN employee_compensation ec ON u.id = ec.user_id
                WHERE u.id = ?
            `, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!employee) {
            return res.status(404).json({ error: 'Pracownik nie znaleziony' });
        }
        
        // Historia zmian stawek prowizji
        const commissionHistory = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    crc.*,
                    changed.name as changed_by_name,
                    approved.name as approved_by_name
                FROM commission_rate_changes crc
                LEFT JOIN users changed ON crc.changed_by = changed.id
                LEFT JOIN users approved ON crc.approved_by = approved.id
                WHERE crc.user_id = ?
                ORDER BY crc.created_at DESC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Historia zmian wynagrodzeń
        const salaryHistory = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    sc.*,
                    changed.name as changed_by_name,
                    approved.name as approved_by_name
                FROM salary_changes sc
                LEFT JOIN users changed ON sc.changed_by = changed.id
                LEFT JOIN users approved ON sc.approved_by = approved.id
                WHERE sc.user_id = ?
                ORDER BY sc.created_at DESC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            employee,
            commissionHistory,
            salaryHistory
        });
        
    } catch (error) {
        console.error('❌ [HR-COMPENSATION] Błąd pobierania szczegółów:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// ZMIANA STAWKI PROWIZJI (HR/Admin)
// =====================================
router.post('/employees/:userId/commission-rate', verifyToken, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;
        const { new_rate, change_reason, comment, effective_date } = req.body;
        const userRole = req.user.user_role || req.user.role;
        const changedById = req.user.id || req.user.userId;
        
        console.log(`📝 [HR-COMPENSATION] Zmiana stawki prowizji dla użytkownika ${userId}`, {
            new_rate,
            change_reason,
            changed_by: changedById,
            department: userRole
        });
        
        // Tylko Admin i HR mogą zmieniać stawki
        if (!['admin', 'hr'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień - tylko Admin i HR mogą zmieniać stawki' });
        }
        
        // Pobierz obecną stawkę
        const currentData = await new Promise((resolve, reject) => {
            db.get(`
                SELECT default_commission_rate, user_id
                FROM employee_compensation
                WHERE user_id = ?
            `, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!currentData) {
            return res.status(404).json({ error: 'Pracownik nie znaleziony w systemie wynagrodzeń' });
        }
        
        const old_rate = currentData.default_commission_rate;
        
        // Pobierz rolę pracownika
        const userInfo = await new Promise((resolve, reject) => {
            db.get('SELECT role FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Utwórz wpis w historii zmian (status: pending jeśli HR, approved jeśli Admin)
        const status = userRole === 'admin' ? 'approved' : 'pending';
        const approved_by = userRole === 'admin' ? changedById : null;
        const approved_at = userRole === 'admin' ? new Date().toISOString() : null;
        
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO commission_rate_changes (
                    user_id, user_role, old_rate, new_rate,
                    change_reason, comment, changed_by, changed_by_department,
                    approved_by, approved_at, status, effective_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId,
                userInfo.role,
                old_rate,
                new_rate,
                change_reason,
                comment,
                changedById,
                userRole,
                approved_by,
                approved_at,
                status,
                effective_date || new Date().toISOString().split('T')[0]
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        // Jeśli Admin zatwierdza od razu - zaktualizuj stawkę
        if (status === 'approved') {
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE employee_compensation
                    SET default_commission_rate = ?,
                        updated_at = CURRENT_TIMESTAMP,
                        updated_by = ?
                    WHERE user_id = ?
                `, [new_rate, changedById, userId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log(`✅ [HR-COMPENSATION] Stawka zmieniona i zatwierdzona przez Admina: ${old_rate}% → ${new_rate}%`);
        } else {
            console.log(`🟡 [HR-COMPENSATION] Wniosek o zmianę stawki utworzony (oczekuje na zatwierdzenie): ${old_rate}% → ${new_rate}%`);
        }
        
        res.json({
            success: true,
            message: status === 'approved' 
                ? 'Stawka prowizji zmieniona pomyślnie'
                : 'Wniosek o zmianę stawki został wysłany do zatwierdzenia',
            change_id: result.id,
            status,
            old_rate,
            new_rate
        });
        
    } catch (error) {
        console.error('❌ [HR-COMPENSATION] Błąd zmiany stawki prowizji:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// ZATWIERDZANIE ZMIANY STAWKI (Admin)
// =====================================
router.post('/rate-changes/:changeId/approve', verifyToken, async (req, res) => {
    try {
        const db = getDatabase();
        const { changeId } = req.params;
        const userRole = req.user.user_role || req.user.role;
        const approvedById = req.user.id || req.user.userId;
        
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Tylko Admin może zatwierdzać zmiany' });
        }
        
        console.log(`✅ [HR-COMPENSATION] Zatwierdzanie zmiany stawki ID: ${changeId}`);
        
        // Pobierz szczegóły zmiany
        const change = await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM commission_rate_changes WHERE id = ?
            `, [changeId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!change) {
            return res.status(404).json({ error: 'Zmiana nie znaleziona' });
        }
        
        if (change.status === 'approved') {
            return res.status(400).json({ error: 'Zmiana już zatwierdzona' });
        }
        
        // Zatwierdź zmianę
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE commission_rate_changes
                SET status = 'approved',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [approvedById, changeId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Zaktualizuj stawkę w employee_compensation
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE employee_compensation
                SET default_commission_rate = ?,
                    updated_at = CURRENT_TIMESTAMP,
                    updated_by = ?
                WHERE user_id = ?
            `, [change.new_rate, approvedById, change.user_id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✅ [HR-COMPENSATION] Zmiana stawki zatwierdzona: ${change.old_rate}% → ${change.new_rate}%`);
        
        res.json({
            success: true,
            message: 'Zmiana stawki prowizji zatwierdzona',
            old_rate: change.old_rate,
            new_rate: change.new_rate
        });
        
    } catch (error) {
        console.error('❌ [HR-COMPENSATION] Błąd zatwierdzania zmiany:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// ODRZUCENIE ZMIANY STAWKI (Admin)
// =====================================
router.post('/rate-changes/:changeId/reject', verifyToken, async (req, res) => {
    try {
        const db = getDatabase();
        const { changeId } = req.params;
        const { rejection_reason } = req.body;
        const userRole = req.user.user_role || req.user.role;
        const rejectedById = req.user.id || req.user.userId;
        
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Tylko Admin może odrzucać zmiany' });
        }
        
        console.log(`❌ [HR-COMPENSATION] Odrzucanie zmiany stawki ID: ${changeId}`);
        
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE commission_rate_changes
                SET status = 'rejected',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP,
                    comment = CASE 
                        WHEN comment IS NULL THEN ?
                        ELSE comment || '\n\nOdrzucono: ' || ?
                    END
                WHERE id = ?
            `, [rejectedById, rejection_reason, rejection_reason, changeId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        res.json({
            success: true,
            message: 'Zmiana stawki odrzucona'
        });
        
    } catch (error) {
        console.error('❌ [HR-COMPENSATION] Błąd odrzucania zmiany:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// OCZEKUJĄCE ZMIANY (Admin)
// =====================================
router.get('/rate-changes/pending', verifyToken, async (req, res) => {
    try {
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Tylko Admin może przeglądać oczekujące zmiany' });
        }
        
        console.log(`📋 [HR-COMPENSATION] Pobieranie oczekujących zmian stawek`);
        
        const pendingChanges = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    crc.*,
                    u.name as user_name,
                    u.email as user_email,
                    changed.name as changed_by_name
                FROM commission_rate_changes crc
                LEFT JOIN users u ON crc.user_id = u.id
                LEFT JOIN users changed ON crc.changed_by = changed.id
                WHERE crc.status = 'pending'
                ORDER BY crc.created_at DESC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            pendingChanges,
            count: pendingChanges.length
        });
        
    } catch (error) {
        console.error('❌ [HR-COMPENSATION] Błąd pobierania oczekujących zmian:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
