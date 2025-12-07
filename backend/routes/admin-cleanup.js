// EMERGENCY ADMIN ENDPOINT - Czyści wszystkie dane użytkownika
// TYLKO DLA SUPER ADMINA!

const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 🗑️ CLEANUP ALL DATA - TYLKO ADMIN
router.post('/cleanup-all-data', verifyToken, async (req, res) => {
    const db = getDatabase();
    const { userId, userRole, email } = req.user;
    
    // TYLKO ADMIN!
    if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
    }
    
    console.log(`🗑️ CLEANUP ALL DATA requested by: ${email} (${userId})`);
    
    const tablesToClean = [
        // Sprawy & Dokumenty
        'documents', 'attachments', 'cases',
        'case_evidence', 'case_questionnaires', 'case_scenarios', 'case_tasks',
        'case_witnesses', 'case_access_log', 'case_comments', 'case_emails',
        'case_chats', 'case_civil_details', 'case_permissions',
        'evidence_document_links', 'evidence_history', 'witness_testimonies',
        'opposing_party', 'opposing_party_cases', 'opposing_party_checklist',
        'opposing_party_evidence', 'opposing_party_info', 'opposing_party_social',
        'opposing_party_witnesses',
        
        // Klienci
        'clients', 'client_files', 'client_balance', 'website_inquiries',
        
        // Terminy & Wydarzenia
        'calendar_entries', 'events', 'event_reports',
        
        // Notatki & Chat
        'notes', 'note_comments', 'chat_messages',
        
        // HR (tylko logi, nie profile)
        'employee_activity', 'employee_activity_logs', 'employee_documents',
        'employee_vacations', 'employee_vacation_balance', 'employee_training',
        'employee_commissions', 'work_schedule', 'leave_requests',
        'employee_work_time', 'employee_work_summary', 'hr_notifications',
        
        // Biuro
        'office_bookings', 'office_resources', 'tickets',
        
        // Płatności (WSZYSTKIE)
        'payments', 'payment_history', 'payment_installments', 'payment_receipts',
        'installment_payments',
        
        // Zadania ogólne
        'tasks', 'task_attachments', 'task_comments',
        
        // Inne
        'notifications', 'email_logs', 'api_cache', 'scenario_steps', 'sessions'
    ];
    
    // ZACHOWUJEMY (nie czyścimy):
    // - users, login_sessions, employee_profiles
    // - employee_tasks (zadania pracowników) ✅
    // - employee_reviews (oceny) ✅
    // - legal_acts (akty prawne - struktura) ✅
    // - hr_settings (ustawienia - struktura) ✅
    // - wszystkie tabele finansowe struktury (invoices, company_*, salary_* etc.) ✅
    
    try {
        let cleaned = [];
        let errors = [];
        
        // Czyść każdą tabelę
        for (const table of tablesToClean) {
            try {
                await new Promise((resolve, reject) => {
                    db.run(`DELETE FROM ${table}`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                cleaned.push(table);
                console.log(`✅ Cleaned: ${table}`);
            } catch (err) {
                errors.push({ table, error: err.message });
                console.log(`⚠️  ${table}: ${err.message}`);
            }
        }
        
        // Reset sequences
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name IN (' + 
                       tablesToClean.map(t => `'${t}'`).join(',') + ')', 
                       (err) => {
                           if (err) reject(err);
                           else resolve();
                       });
            });
            console.log('✅ Sequences reset');
        } catch (err) {
            console.log('⚠️  Sequences: ', err.message);
        }
        
        console.log(`🎉 CLEANUP COMPLETE! Cleaned ${cleaned.length} tables`);
        
        res.json({
            success: true,
            message: 'All user data cleaned successfully',
            cleaned: cleaned,
            errors: errors.length > 0 ? errors : null
        });
        
    } catch (error) {
        console.error('❌ CLEANUP ERROR:', error);
        res.status(500).json({ 
            error: 'Cleanup failed', 
            details: error.message 
        });
    }
});

module.exports = router;
