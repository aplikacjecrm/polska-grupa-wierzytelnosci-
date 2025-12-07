const path = require('path');
const dotenv = require('dotenv');
const cron = require('node-cron');

// WAŻNE: Załaduj .env PRZED wszystkim innym! (dla Electron)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// SECURITY CHECK
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ CRITICAL SECURITY ERROR: Missing environment variables!');
  console.error(`❌ Missing: ${missingEnvVars.join(', ')}`);
  console.error('❌ Server will not start until these are set in .env');
  process.exit(1);
}

// Debug - sprawdź czy klucze API są załadowane
console.log('🔑 ANTHROPIC_API_KEY loaded:', process.env.ANTHROPIC_API_KEY ? 'YES ✅' : 'NO ❌');
console.log('🔑 GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');
console.log('🔑 GOOGLE_CLOUD_VISION_API_KEY loaded:', process.env.GOOGLE_CLOUD_VISION_API_KEY ? 'YES ✅' : 'NO ❌');

// Log konfiguracji uploadu plików
const uploadConfig = require('./config/uploads');
uploadConfig.logConfig();

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const authRoutes = require('./routes/auth');
const setupAdminRoutes = require('./routes/setup-admin'); // TYMCZASOWY - usuń po użyciu!
const mailRoutes = require('./routes/mail');
const emailsRoutes = require('./routes/emails');
const chatRoutes = require('./routes/chat');
const clientsRoutes = require('./routes/clients');
const clientFilesRoutes = require('./routes/client-files');
const clientNotesRoutes = require('./routes/client-notes');
const casesRoutes = require('./routes/cases');
const casePermissionsRoutes = require('./routes/case-permissions');
const notesRoutes = require('./routes/notes');
const eventsRoutes = require('./routes/events');
const calendarRoutes = require('./routes/calendar');
const commentsRoutes = require('./routes/comments');
const documentsRoutes = require('./routes/documents');
const attachmentsRoutes = require('./routes/attachments');
const witnessesRoutes = require('./routes/witnesses');
const evidenceRoutes = require('./routes/evidence');
const scenariosRoutes = require('./routes/scenarios');
const opposingPartyRoutes = require('./routes/opposing-party');
const opposingAnalysisRoutes = require('./routes/opposing-analysis');
// const civilDetailsRoutes = require('./routes/civil-details'); // WYŁĄCZONE - używamy ankiet
const caseDetailsRoutes = require('./routes/case-details');
const aiRoutes = require('./routes/ai');
const legalDataRoutes = require('./routes/legal-data');
const searchRoutes = require('./routes/search');
const courtDecisionsRoutes = require('./routes/court-decisions');
const courtsRoutes = require('./routes/courts');
const prosecutorsRoutes = require('./routes/prosecutors');
const policeRoutes = require('./routes/police-routes');
const adminCleanupRoutes = require('./routes/admin-cleanup');
const reportsRoutes = require('./routes/reports');
const questionnairesRoutes = require('./routes/questionnaires');
const companyLookupRoutes = require('./routes/company-lookup');
const ceidgRoutes = require('./routes/ceidg');
const cepikRoutes = require('./routes/cepik');
const krsRoutes = require('./routes/krs');
const ufgRoutes = require('./routes/ufg');
const socialSearchRoutes = require('./routes/social-search');
const paymentsRoutes = require('./routes/payments');
const balanceRoutes = require('./routes/balance');
const financesRoutes = require('./routes/finances'); // SYSTEM FINANSOWY
const ksefRoutes = require('./routes/ksef');
const salesInvoicesRoutes = require('./routes/sales-invoices');
const installmentsRoutes = require('./routes/installments');
const tasksRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
const employeesRoutes = require('./routes/employees'); // Employee Dashboard HR
const employeeFinancesRoutes = require('./routes/employee-finances'); // Finanse pracownika
const commissionsRoutes = require('./routes/commissions'); // System prowizji
const hrCompensationRoutes = require('./routes/hr-compensation'); // HR - Prowizje i Wynagrodzenia
const adminRoutes = require('./routes/admin'); // Admin - Statystyki finansowe
const workScheduleRoutes = require('./routes/work-schedule'); // Grafik pracy
const officeBookingRoutes = require('./routes/office-booking'); // Rezerwacja biura

// Ładowanie nowych routes z error handlingiem
let ticketsRoutes, activityLogsRoutes, websiteInquiriesRoutes;
try {
    ticketsRoutes = require('./routes/tickets');
    console.log('✅ tickets.js załadowany!');
} catch (err) {
    console.error('❌ Błąd ładowania tickets.js:', err.message);
    ticketsRoutes = null;
}

try {
    websiteInquiriesRoutes = require('./routes/website-inquiries');
    console.log('✅ website-inquiries.js załadowany!');
} catch (err) {
    console.error('❌ Błąd ładowania website-inquiries.js:', err.message);
    websiteInquiriesRoutes = null;
}

try {
    activityLogsRoutes = require('./routes/activity-logs');
    console.log('✅ activity-logs.js załadowany!');
} catch (err) {
    console.error('❌ Błąd ładowania activity-logs.js:', err.message);
    activityLogsRoutes = null;
}

// WAŻNE: Wymuszam wczytanie Apify Service aby załadować grupy FB z config
// DODANO: 2025-11-09 23:40 - Force reload
delete require.cache[require.resolve('./services/api-integrations/apify-service')];
const apifyService = require('./services/api-integrations/apify-service');
console.log('🔥 APIFY SERVICE ZAŁADOWANY W SERVER.JS!');

const { initDatabase } = require('./database/init');
const { setupSocketHandlers } = require('./socket/handlers');

async function startBackendServer() {
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Password');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serwuj pliki statyczne z folderu frontend BEZ CACHE!
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend'), {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }));
  
  // KLUCZOWE: Serwuj folder uploads jako pliki statyczne
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  console.log('✅ Folder uploads serwowany jako statyczny:', path.join(__dirname, '..', 'uploads'));
  
  // Dedykowany routing dla report-view
  app.get('/report-view', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/report-view.html'));
  });

  // Inicjalizacja bazy danych
  await initDatabase();

  // LOG ALL REQUESTS
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    next();
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/setup', setupAdminRoutes); // TYMCZASOWY - usuń po utworzeniu admina!
  console.log('⚠️  SETUP ENDPOINT ACTIVE: POST /api/setup/create-admin');
  app.use('/api/mail', mailRoutes);
  app.use('/api/emails', emailsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/clients', clientFilesRoutes);
  app.use('/api/clients', clientNotesRoutes);
  app.use('/api/cases', casesRoutes);
  app.use('/api/case-permissions', casePermissionsRoutes);
  app.use('/api/notes', notesRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/calendar', calendarRoutes);
  console.log('✅ calendar.js router loaded');
  app.use('/api/comments', commentsRoutes);
  app.use('/api/documents', documentsRoutes);
  app.use('/api/attachments', attachmentsRoutes);
  app.use('/api/witnesses', witnessesRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/scenarios', scenariosRoutes);
  app.use('/api/opposing-party', opposingPartyRoutes);
  app.use('/api/opposing-analysis', opposingAnalysisRoutes);
  console.log('✅ opposing-analysis.js router loaded - Guided Workflow MVP');
  // app.use('/api/civil-details', civilDetailsRoutes); // WYŁĄCZONE - używamy ankiet
  app.use('/api/case-details', caseDetailsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/legal-data', legalDataRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/court-decisions', courtDecisionsRoutes);
  app.use('/api/courts', courtsRoutes);
  console.log('✅ courts.js router loaded');
  app.use('/api/prosecutors', prosecutorsRoutes);
  console.log('✅ prosecutors.js router loaded');
  app.use('/api/police', policeRoutes);
  console.log('✅ police-routes.js router loaded');
  app.use('/api/admin', adminCleanupRoutes);
  console.log('✅ admin-cleanup.js router loaded - Emergency cleanup endpoint');
  app.use('/api/reports', reportsRoutes);
  console.log('✅ reports.js router loaded');
  app.use('/api', questionnairesRoutes);
  console.log('✅ questionnaires.js router loaded');
  app.use(companyLookupRoutes);
  console.log('✅ company-lookup.js router loaded - Social Searcher API ready!');
  app.use('/api/company/ceidg', ceidgRoutes);
  console.log('✅ ceidg.js router loaded - CEIDG API ready!');
  app.use('/api/vehicle/cepik', cepikRoutes);
  console.log('✅ cepik.js router loaded - CEPiK API ready!');
  app.use('/api/company/krs', krsRoutes);
  console.log('✅ krs.js router loaded - KRS API ready!');
  app.use('/api/vehicle/ufg', ufgRoutes);
  console.log('✅ ufg.js router loaded - UFG API ready!');
  app.use('/api/company/social-search', socialSearchRoutes);
  console.log('✅ social-search.js router loaded - Social Searcher API ready!');
  app.use('/api/payments', paymentsRoutes);
  console.log('✅ payments.js router loaded - PayPal Integration ready! 💰');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/payments');
  console.log('   - POST /api/payments/generate-code');
  console.log('   - POST /api/payments');
  console.log('   - GET /api/payments/case/:caseId');
  console.log('   - GET /api/payments/client/:clientId');
  
  app.use('/api/balance', balanceRoutes);
  console.log('✅ balance.js router loaded - Client Balance System ready! 💰');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/balance');
  console.log('   - GET /api/balance/client/:clientId');
  console.log('   - POST /api/balance/top-up');
  console.log('   - POST /api/balance/pay-from-balance');
  
  app.use('/api/finances', financesRoutes);
  console.log('✅ finances/index.js router loaded - NOWY SYSTEM FINANSOWY! 💼💰');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/finances');
  console.log('   📊 PRZYCHODY:');
  console.log('      - GET /api/finances/revenue (Lista)');
  console.log('      - POST /api/finances/revenue (Dodaj)');
  console.log('      - GET /api/finances/revenue/:id (Szczegóły)');
  console.log('      - PUT /api/finances/revenue/:id (Edytuj)');
  console.log('      - DELETE /api/finances/revenue/:id (Usuń)');
  console.log('   💸 WYDATKI:');
  console.log('      - GET /api/finances/expenses (Lista)');
  console.log('      - POST /api/finances/expenses (Dodaj)');
  console.log('      - POST /api/finances/expenses/:id/approve (Zatwierdź)');
  console.log('      - POST /api/finances/expenses/:id/reject (Odrzuć)');
  console.log('   👥 PENSJE:');
  console.log('      - GET /api/finances/salaries (Lista)');
  console.log('      - POST /api/finances/salaries/calculate (Kalkulator)');
  console.log('      - POST /api/finances/salaries (Dodaj)');
  console.log('      - POST /api/finances/salaries/:id/approve (Zatwierdź)');
  console.log('   🏥 HEALTH CHECK:');
  console.log('      - GET /api/finances/health');
  
  app.use('/api/ksef', ksefRoutes);
  console.log('✅ ksef.js router loaded - KSeF API v2 Integration ready! 🧾');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/ksef (API v2)');
  console.log('   - POST /api/ksef/session/init (Token)');
  console.log('   - POST /api/ksef/session/init-xades (XAdES)');
  console.log('   - POST /api/ksef/invoice/send');
  console.log('   - POST /api/ksef/invoice/get');
  console.log('   - POST /api/ksef/invoice/search');
  console.log('   - POST /api/ksef/invoice/upo');
  console.log('   - GET /api/ksef/info');
  console.log('   - GET /api/ksef/health (Health Check)');
  console.log('📍 Środowisko: https://ksef-demo.mf.gov.pl/api/v2');
  
  app.use('/api/sales-invoices', salesInvoicesRoutes);
  console.log('✅ sales-invoices.js router loaded - Faktury VAT dla klientów! 📄');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/sales-invoices');
  console.log('   - POST /api/sales-invoices (Wystaw fakturę)');
  console.log('   - GET /api/sales-invoices (Lista)');
  console.log('   - GET /api/sales-invoices/:id (Szczegóły)');
  console.log('   - PATCH /api/sales-invoices/:id/payment (Status płatności)');
  console.log('   - POST /api/sales-invoices/:id/send-ksef (Wyślij do KSeF)');
  
  app.use('/api/installments', installmentsRoutes);
  console.log('✅ installments.js router loaded - System płatności ratalnych! 💳');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/installments');
  console.log('   - GET /api/installments (Lista rat)');
  console.log('   - GET /api/installments/client/:clientId (Raty klienta)');
  console.log('   - POST /api/installments (Dodaj ratę)');
  console.log('   - PUT /api/installments/:id (Aktualizuj ratę)');
  console.log('   - DELETE /api/installments/:id (Usuń ratę)');
  console.log('   - POST /api/installments/:id/pay (Oznacz jako zapłaconą)');
  console.log('   - GET /api/installments/stats/upcoming (Nadchodzące)');
  console.log('   - POST /api/installments/:id/send-reminder (Przypomnienie)');

  const receiptsRoutes = require('./routes/receipts');
  app.use('/api/receipts', receiptsRoutes);
  console.log('✅ receipts.js router loaded - Faktury i paragony! 📄');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/receipts');
  console.log('   - POST /api/receipts/generate (Generuj dokument)');
  console.log('   - GET /api/receipts (Lista dokumentów)');
  console.log('   - GET /api/receipts/payment/:paymentId (Dokumenty płatności)');
  console.log('   - GET /api/receipts/client/:clientId (Dokumenty klienta)');

  const employeePaymentsRoutes = require('./routes/employee-payments');
  app.use('/api/employee-payments', employeePaymentsRoutes);
  console.log('✅ employee-payments.js router loaded - Wypłaty pracowników! 💼');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/employee-payments');
  console.log('   - GET /api/employee-payments (Lista wypłat)');
  console.log('   - GET /api/employee-payments/pending (Oczekujące)');
  console.log('   - GET /api/employee-payments/stats (Statystyki)');
  console.log('   - POST /api/employee-payments (Dodaj wypłatę)');
  console.log('   - POST /api/employee-payments/:id/pay (Oznacz jako wypłaconą)');

  app.use('/api/tasks', tasksRoutes);
  console.log('✅ tasks.js router loaded - Tasks System ready! ✅');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/tasks');
  console.log('   - GET /api/tasks (Lista zadań z filtrami)');
  console.log('   - GET /api/tasks/case/:caseId (Zadania sprawy)');
  console.log('   - GET /api/tasks/:id (Szczegóły zadania)');
  console.log('   - POST /api/tasks (Nowe zadanie)');
  console.log('   - PUT /api/tasks/:id (Aktualizuj zadanie)');
  console.log('   - PATCH /api/tasks/:id/status (Zmień status)');
  console.log('   - DELETE /api/tasks/:id (Usuń zadanie)');
  console.log('   - GET /api/tasks/stats/overview (Statystyki)');

  app.use('/api/users', usersRoutes);
  console.log('✅ users.js router loaded - Users API ready! 👥');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/users');
  console.log('   - GET /api/users (Lista użytkowników)');
  console.log('   - GET /api/users/:id (Szczegóły użytkownika)');

  app.use('/api/admin', adminRoutes);
  console.log('✅ admin.js router loaded - Admin Financial Stats ready! 📊💰');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/admin');
  console.log('   - GET /api/admin/financial-stats (Statystyki finansowe)');
  console.log('   - GET /api/admin/expenses-stats (Statystyki kosztów)');
  console.log('   - GET /api/admin/balance (Bilans: przychody vs koszty)');

  app.use('/api/employees', employeesRoutes);
  console.log('✅ employees.js router loaded - Employee Dashboard HR ready! 👥📊');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/employees');
  console.log('   - GET /api/employees (Lista pracowników)');
  console.log('   - GET /api/employees/:userId/profile (Profil + statystyki)');
  console.log('   - PUT /api/employees/:userId/profile (Aktualizuj profil - admin)');
  console.log('   - GET /api/employees/:userId/activity (Historia aktywności)');
  console.log('   - GET /api/employees/:userId/login-history (Logowania)');
  console.log('   - GET /api/employees/:userId/tasks (Zadania pracownika)');
  console.log('   - GET /api/employees/:userId/monthly-reports (Raporty miesięczne)');
  console.log('   - GET /api/employees/:userId/monthly-reports/:year/:month (Szczegóły raportu)');
  console.log('   - POST /api/employees/:userId/tasks (Przypisz zadanie)');
  console.log('   - PUT /api/employees/tasks/:taskId (Aktualizuj status zadania)');
  console.log('   - GET /api/employees/:userId/reviews (Oceny)');
  console.log('   - POST /api/employees/:userId/reviews (Dodaj ocenę - admin)');
  console.log('   - GET /api/employees/:userId/tickets (🆕 Tickety HR/IT pracownika)');
  console.log('   - GET /api/employees/stats/all (Statystyki wszystkich)');

  app.use('/api/employees', employeeFinancesRoutes);
  console.log('✅ employee-finances.js router loaded - Finanse Pracownika ready! 💰💼');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/employees (finanse)');
  console.log('   - GET /api/employees/:userId/finances/summary (Podsumowanie finansów)');
  console.log('   - GET /api/employees/:userId/commissions/history (Historia prowizji)');
  console.log('   - GET /api/employees/:userId/payments/history (Historia wypłat)');

  if (ticketsRoutes) {
    app.use('/api/tickets', ticketsRoutes);
    console.log('✅ tickets.js router loaded - HR/IT Tickets System ready! 🎫');
    console.log('🔍 [DEBUG] Router zarejestrowany: /api/tickets');
    console.log('   - GET /api/tickets (Wszystkie tickety)');
    console.log('   - GET /api/tickets/user/:userId (Tickety użytkownika)');
    console.log('   - POST /api/tickets (Nowy ticket)');
    console.log('   - PUT /api/tickets/:id/status (Zmień status)');
    console.log('   - GET /api/tickets/stats (Statystyki)');
  } else {
    console.log('⚠️ tickets.js NIE ZAŁADOWANY - routes niedostępne!');
  }

  if (activityLogsRoutes) {
    app.use('/api/activity-logs', activityLogsRoutes);
    console.log('✅ activity-logs.js router loaded - Activity Monitoring ready! 📊');
    console.log('🔍 [DEBUG] Router zarejestrowany: /api/activity-logs');
    console.log('   - POST /api/activity-logs (Zapisz log)');
    console.log('   - GET /api/activity-logs/user/:userId (Logi użytkownika)');
    console.log('   - GET /api/activity-logs/all (Wszystkie logi - admin)');
    console.log('   - GET /api/activity-logs/stats (Statystyki)');
    console.log('   - GET /api/activity-logs/work-hours/:userId (Godziny pracy)');
  } else {
    console.log('⚠️ activity-logs.js NIE ZAŁADOWANY - routes niedostępne!');
  }

  if (websiteInquiriesRoutes) {
    app.use('/api/website-inquiries', websiteInquiriesRoutes);
    console.log('✅ website-inquiries.js router loaded - Website Contact Forms ready! 📩🌐');
    console.log('🔍 [DEBUG] Router zarejestrowany: /api/website-inquiries');
    console.log('   - POST /api/website-inquiries (Nowe zapytanie ze strony)');
    console.log('   - GET /api/website-inquiries (Lista zapytań)');
    console.log('   - GET /api/website-inquiries/:id (Szczegóły zapytania)');
    console.log('   - PUT /api/website-inquiries/:id (Aktualizuj status/odpowiedź)');
    console.log('   - DELETE /api/website-inquiries/:id (Usuń zapytanie)');
  } else {
    console.log('⚠️ website-inquiries.js NIE ZAŁADOWANY - routes niedostępne!');
  }

  app.use('/api/commissions', commissionsRoutes);
  console.log('✅ commissions.js router loaded - System Prowizji ready! 💰💼');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/commissions');
  console.log('   📊 V1 (lawyer_commissions):');
  console.log('      - GET /api/commissions/stats (Statystyki prowizji)');
  console.log('      - GET /api/commissions/pending (Prowizje do wypłaty)');
  console.log('      - GET /api/commissions/user/:userId (Prowizje użytkownika)');
  console.log('      - POST /api/commissions/calculate (Przelicz prowizje)');
  console.log('      - POST /api/commissions/:id/pay (Wypłać prowizję)');
  console.log('   💰 V2 (employee_commissions - NOWE!):');
  console.log('      - GET /api/commissions/v2/stats (Statystyki employee_commissions)');
  console.log('      - GET /api/commissions/v2/pending (Lista do wypłaty)');
  console.log('      - GET /api/commissions/v2/top-earners (Top 5 zarabiających)');
  console.log('      - POST /api/commissions/v2/:id/pay (Wypłać prowizję → employee_payments)');
  console.log('   💡 Automatyczne wyliczanie prowizji:');
  console.log('      - Mecenas (lawyer): 15%');
  console.log('      - Opiekun sprawy (case_manager): 10%');
  console.log('      - Opiekun klienta (client_manager): 5%');

  app.use('/api/hr-compensation', hrCompensationRoutes);
  console.log('✅ hr-compensation.js router loaded - HR Zarządzanie Wynagrodzen iami i Prowizjami! 💰👥');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-compensation');
  console.log('   👥 PRACOWNICY:');
  console.log('      - GET /api/hr-compensation/employees (Lista z stawkami)');
  console.log('      - GET /api/hr-compensation/employees/:userId (Szczegóły + historia)');
  console.log('   📝 ZMIANY STAWEK:');
  console.log('      - POST /api/hr-compensation/employees/:userId/commission-rate (Zmień stawkę prowizji)');
  console.log('      - GET /api/hr-compensation/rate-changes/pending (Oczekujące zmiany)');
  console.log('      - POST /api/hr-compensation/rate-changes/:changeId/approve (Zatwierdź zmianę)');
  console.log('      - POST /api/hr-compensation/rate-changes/:changeId/reject (Odrzuć zmianę)');
  console.log('   🔐 UPRAWNIENIA:');
  console.log('      - HR → tworzy wnioski o zmianę');
  console.log('      - Admin → zatwierdza lub odrzuca zmiany');
  console.log('      - Finance → wypłaca na podstawie zatwierdzonych stawek');

  // ============================================
  // NOWE: HR SYSTEM ROUTES
  // ============================================
  const hrVacationsRoutes = require('./routes/hr-vacations');
  app.use('/api/hr-vacations', hrVacationsRoutes);
  console.log('✅ hr-vacations.js router loaded - Urlopy i Wnioski! 🏖️');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-vacations');
  console.log('   - GET /api/hr-vacations/:userId/balance (Saldo urlopów)');
  console.log('   - POST /api/hr-vacations/:userId/request (Złóż wniosek)');
  console.log('   - GET /api/hr-vacations/:userId/list (Lista wniosków)');
  console.log('   - GET /api/hr-vacations/pending (Do zatwierdzenia - HR)');
  console.log('   - POST /api/hr-vacations/:id/approve (Zatwierdź - HR)');
  console.log('   - POST /api/hr-vacations/:id/reject (Odrzuć - HR)');
  console.log('   - GET /api/hr-vacations/calendar (Kalendarz - HR)');

  const hrTrainingRoutes = require('./routes/hr-training');
  app.use('/api/hr-training', hrTrainingRoutes);
  console.log('✅ hr-training.js router loaded - Szkolenia i Certyfikaty! 🎓');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-training');
  console.log('   - GET /api/hr-training/:userId/list (Lista szkoleń)');
  console.log('   - POST /api/hr-training/:userId/add (Dodaj szkolenie)');
  console.log('   - PUT /api/hr-training/:trainingId (Aktualizuj)');
  console.log('   - GET /api/hr-training/expiring (Wygasające certyfikaty - HR)');

  const hrExperienceRoutes = require('./routes/hr-experience');
  app.use('/api/hr-experience', hrExperienceRoutes);
  console.log('✅ hr-experience.js router loaded - CV i Doświadczenie! 💼');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-experience');
  console.log('   - GET /api/hr-experience/:userId/cv (Pobierz CV)');
  console.log('   - POST /api/hr-experience/:userId/add (Dodaj doświadczenie)');
  console.log('   - DELETE /api/hr-experience/:expId (Usuń doświadczenie)');

  const hrBenefitsRoutes = require('./routes/hr-benefits');
  app.use('/api/hr-benefits', hrBenefitsRoutes);
  console.log('✅ hr-benefits.js router loaded - Benefity Pracownicze! 🎁');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-benefits');
  console.log('   - GET /api/hr-benefits/:userId/list (Lista benefitów)');
  console.log('   - POST /api/hr-benefits/:userId/add (Dodaj benefit)');
  console.log('   - GET /api/hr-benefits/expiring (Wygasające - HR)');

  const hrDocumentsRoutes = require('./routes/hr-documents');
  app.use('/api/hr-documents', hrDocumentsRoutes);
  console.log('✅ hr-documents.js router loaded - Dokumenty Pracownicze! 📄');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-documents');
  console.log('   - GET /api/hr-documents/:userId/list (Lista dokumentów)');
  console.log('   - POST /api/hr-documents/:userId/upload (Upload)');
  console.log('   - GET /api/hr-documents/:docId/download (Pobierz)');
  console.log('   - GET /api/hr-documents/expiring (Wygasające - HR)');

  const hrSalariesRoutes = require('./routes/hr-salaries');
  app.use('/api/hr-salaries', hrSalariesRoutes);
  console.log('✅ hr-salaries.js router loaded - Wynagrodzenia i Historia! 💰');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/hr-salaries');
  console.log('   - GET /api/hr-salaries/:userId/history (Historia wynagrodzeń)');
  console.log('   - POST /api/hr-salaries/:userId/change (Zmiana wynagrodzenia - HR)');
  console.log('   - GET /api/hr-salaries/reviews-due (Nadchodzące podwyżki - HR)');

  app.use('/api/work-schedule', workScheduleRoutes);
  console.log('✅ work-schedule.js router loaded - Grafik pracy! 📅');
  console.log('   - GET /api/work-schedule/month/:year/:month (Grafik miesiąca)');
  console.log('   - GET /api/work-schedule/day/:date (Grafik dnia)');
  console.log('   - PUT /api/work-schedule/entry (Aktualizuj wpis)');

  app.use('/api/office-booking', officeBookingRoutes);
  console.log('✅ office-booking.js router loaded - Rezerwacja biura! 🏢');
  console.log('🔍 [DEBUG] Router zarejestrowany: /api/office-booking');
  console.log('   📍 Lokalizacja: Gwiazdzista 6/5, Wrocław');
  console.log('   🪑 Zasoby: 3 biurka + 1 sala konferencyjna (6 osób)');
  console.log('   - GET /api/office-booking/resources (Lista zasobów)');
  console.log('   - GET /api/office-booking/bookings/:date (Rezerwacje na dzień)');
  console.log('   - GET /api/office-booking/my-bookings/:userId (Moje rezerwacje)');
  console.log('   - GET /api/office-booking/availability/:resourceId/:date (Dostępność)');
  console.log('   - POST /api/office-booking/book (Zarezerwuj)');
  console.log('   - DELETE /api/office-booking/cancel/:bookingId (Anuluj)');
  console.log('   - GET /api/office-booking/summary/:date (Podsumowanie dnia)');

  console.log('\n🎉 SYSTEM HR ZAŁADOWANY! Wszystkie moduły gotowe!\n');

  // Global error handler for multer and other errors
  app.use((err, req, res, next) => {
    console.error('❌ Global error handler:', err.message);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Request URL:', req.url);
    console.error('❌ Request method:', req.method);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Plik jest za duży (max 10MB)' });
    }
    
    if (err.message && err.message.includes('Niedozwolony')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    
    res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Błąd serwera' 
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Socket.IO handlers
  setupSocketHandlers(io);

  // Zapisz instancję io globalnie
  app.set('io', io);

  // ===================================
  // SCHEDULER: Automatyczne raporty miesięczne
  // ===================================
  const { generateMonthlyReports } = require('./cron/generate-monthly-reports');
  
  // Uruchom ostatniego dnia każdego miesiąca o 23:55
  // Format: minute hour day month day-of-week
  // '55 23 28-31 * *' = 23:55, dni 28-31 każdego miesiąca
  cron.schedule('55 23 28-31 * *', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Sprawdź czy jutro to nowy miesiąc
    if (tomorrow.getMonth() !== today.getMonth()) {
      console.log('📅 CRON: Ostatni dzień miesiąca - generuję raporty...');
      
      const targetYear = today.getFullYear();
      const targetMonth = today.getMonth() + 1;
      
      generateMonthlyReports(targetYear, targetMonth)
        .then(() => {
          console.log(`✅ CRON: Raporty za ${targetYear}-${String(targetMonth).padStart(2, '0')} wygenerowane!`);
        })
        .catch((err) => {
          console.error('❌ CRON: Błąd generowania raportów:', err);
        });
    }
  }, {
    timezone: "Europe/Warsaw"
  });
  
  console.log('⏰ Scheduler raportów miesięcznych uruchomiony (ostatni dzień miesiąca o 23:55)');

  const PORT = process.env.PORT || 3500;

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🚀 Backend uruchomiony na porcie ${PORT}`);
      resolve(server);
    });
  });
}

module.exports = { startBackendServer };

// Uruchom serwer jeśli plik jest uruchomiony bezpośrednio
if (require.main === module) {
  startBackendServer().catch(err => {
    console.error('❌ Błąd uruchamiania serwera:', err);
    process.exit(1);
  });
}
