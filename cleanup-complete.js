// KOMPLETNE CZYSZCZENIE - wszystkie dane użytkownika
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');

console.log('🧹 KOMPLETNE CZYSZCZENIE WSZYSTKICH DANYCH...\n');

// Backup
const backupPath = path.join(__dirname, 'data', `backup_complete_cleanup_${Date.now()}.db`);
console.log('📦 Tworzę backup:', backupPath);
fs.copyFileSync(dbPath, backupPath);
console.log('✅ Backup utworzony!\n');

const db = new sqlite3.Database(dbPath);

// WSZYSTKIE tabele do wyczyszczenia
const tablesToClean = [
    // Sprawy & Dokumenty
    'documents',
    'attachments',
    'cases',
    'case_evidence',
    'case_questionnaires',
    'case_scenarios',
    'case_tasks',
    'case_witnesses',
    'case_access_log',
    'case_comments',
    'case_emails',
    'case_chats',
    'case_civil_details',
    'case_permissions',
    'evidence_document_links',
    'evidence_history',
    'witness_testimonies',
    'opposing_party',
    'opposing_party_cases',
    'opposing_party_checklist',
    'opposing_party_evidence',
    'opposing_party_info',
    'opposing_party_social',
    'opposing_party_witnesses',
    
    // Klienci
    'clients',
    'client_files',
    'client_balance',
    'website_inquiries',
    
    // Terminy & Wydarzenia
    'calendar_entries',
    'events',
    'event_reports',
    
    // Notatki & Chat
    'notes',
    'note_comments',
    'chat_messages',
    
    // HR (tylko logi, nie profile)
    'employee_activity',
    'employee_activity_logs',
    'employee_documents',
    'employee_vacations',
    'employee_vacation_balance',
    'employee_training',
    'employee_commissions',
    'work_schedule',
    'leave_requests',
    'employee_work_time',
    'employee_work_summary',
    'hr_notifications',
    
    // Biuro
    'office_bookings',
    'office_resources',
    'tickets',
    
    // Płatności (WSZYSTKIE)
    'payments',
    'payment_history',
    'payment_installments',
    'payment_receipts',
    'installment_payments',
    
    // Zadania (ogólne)
    'tasks',
    'task_attachments',
    'task_comments',
    
    // Inne
    'notifications',
    'email_logs',
    'api_cache',
    'scenario_steps',
    'sessions'
];

// ZACHOWUJEMY (NIE CZYŚCIMY):
const preserved = [
    'users',                    // Konta użytkowników ✅
    'login_sessions',           // Sesje logowania ✅
    'employee_profiles',        // Profile pracowników ✅
    'employee_tasks',           // Zadania pracowników ✅
    'employee_reviews',         // Oceny pracowników ✅
    'legal_acts',               // Akty prawne (struktura) ✅
    'hr_settings',              // Ustawienia HR (struktura) ✅
    'email_accounts',           // Konta email (konfiguracja) ✅
    
    // Finansowe (struktura firmy)
    'company_expenses',
    'company_invoices',
    'invoices',
    'sales_invoices',
    'expenses',
    'monthly_reports',
    'salary_history',
    'salary_changes',
    'employee_salaries',
    'employee_compensation',
    'employee_benefits',
    'employee_payments',
    'commission_rates',
    'commission_rate_changes',
    'lawyer_commissions',
    'balance_transactions',
    
    // Struktura spraw (typy, detale)
    'administrative_case_details',
    'civil_case_details',
    'commercial_case_details',
    'criminal_case_details',
    'family_case_details'
];

console.log(`🗑️ Czyszczę ${tablesToClean.length} tabel z danymi użytkownika...\n`);

let cleaned = 0;
let errors = 0;
let index = 0;

function cleanNextTable() {
    if (index >= tablesToClean.length) {
        // Koniec - reset sequences
        db.run('DELETE FROM sqlite_sequence WHERE name NOT IN (' + 
               preserved.map(t => `'${t}'`).join(',') + ')', 
               (err) => {
                   if (err) console.log('⚠️  sqlite_sequence:', err.message);
                   else console.log('✅ sqlite_sequence: Zresetowana');
                   
                   console.log(`\n🎉 GOTOWE! Wyczyszczono ${cleaned}/${tablesToClean.length} tabel`);
                   if (errors > 0) console.log(`⚠️  Błędów: ${errors}`);
                   
                   console.log('\n📊 ZACHOWANO:');
                   preserved.forEach(t => console.log(`   ✅ ${t}`));
                   
                   db.close();
                   console.log('\n✅ CZYSTA BAZA! Tylko dane aplikacji i konta zachowane!');
               });
        return;
    }
    
    const table = tablesToClean[index];
    index++;
    
    db.run(`DELETE FROM ${table}`, (err) => {
        if (err) {
            console.log(`⚠️  ${table}: ${err.message}`);
            errors++;
        } else {
            console.log(`✅ ${table}: Wyczyszczona`);
            cleaned++;
        }
        cleanNextTable();
    });
}

cleanNextTable();
