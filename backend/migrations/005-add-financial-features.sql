-- ============================================
-- MIGRACJA 005: ROZBUDOWA FINANSOWA I HR
-- Data: 24.11.2025
-- ============================================

-- ============================================
-- FINANSE
-- ============================================

-- Miesięczne raporty
CREATE TABLE IF NOT EXISTS monthly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL UNIQUE,
    total_revenue REAL DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    overdue_count INTEGER DEFAULT 0,
    average_payment_amount REAL DEFAULT 0,
    report_data TEXT,
    pdf_path TEXT,
    generated_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Faktury
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    payment_id INTEGER REFERENCES payments(id),
    client_id INTEGER REFERENCES clients(id),
    case_id INTEGER REFERENCES cases(id),
    seller_name TEXT DEFAULT 'ProMeritum Kancelaria Prawna',
    seller_address TEXT,
    seller_nip TEXT,
    seller_bank_account TEXT,
    buyer_name TEXT NOT NULL,
    buyer_address TEXT,
    buyer_nip TEXT,
    items TEXT,
    net_amount REAL NOT NULL,
    vat_rate REAL DEFAULT 23,
    vat_amount REAL NOT NULL,
    gross_amount REAL NOT NULL,
    issue_date DATE NOT NULL,
    sale_date DATE,
    due_date DATE,
    paid_date DATE,
    status TEXT DEFAULT 'issued',
    pdf_path TEXT,
    sent_to_accounting BOOLEAN DEFAULT 0,
    accounting_sent_at DATETIME,
    accounting_confirmed BOOLEAN DEFAULT 0,
    sent_to_client BOOLEAN DEFAULT 0,
    client_sent_at DATETIME,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Koszty firmy
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_number TEXT UNIQUE,
    expense_type TEXT NOT NULL,
    category TEXT,
    description TEXT NOT NULL,
    supplier_name TEXT,
    supplier_nip TEXT,
    net_amount REAL NOT NULL,
    vat_rate REAL DEFAULT 0,
    vat_amount REAL DEFAULT 0,
    gross_amount REAL NOT NULL,
    currency TEXT DEFAULT 'PLN',
    payment_method TEXT,
    payment_date DATE,
    payment_reference TEXT,
    invoice_file TEXT,
    receipt_file TEXT,
    status TEXT DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    added_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HR - PRACOWNICY
-- ============================================

-- Wykształcenie
CREATE TABLE IF NOT EXISTS employee_education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education_type TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    field_of_study TEXT,
    specialization TEXT,
    degree TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT 0,
    final_grade TEXT,
    honors TEXT,
    diploma_file TEXT,
    certificate_file TEXT,
    transcript_file TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Szkolenia i kursy
CREATE TABLE IF NOT EXISTS employee_trainings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_name TEXT NOT NULL,
    training_provider TEXT,
    category TEXT,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    duration_hours INTEGER,
    location TEXT,
    training_format TEXT DEFAULT 'in-person',
    cost REAL DEFAULT 0,
    currency TEXT DEFAULT 'PLN',
    paid_by TEXT DEFAULT 'company',
    certificate_obtained BOOLEAN DEFAULT 0,
    certificate_number TEXT,
    certificate_file TEXT,
    expiry_date DATE,
    renewal_required BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'planned',
    completion_percentage INTEGER DEFAULT 0,
    employee_rating INTEGER,
    employee_feedback TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wnioski urlopowe
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    rejection_reason TEXT,
    replacement_employee_id INTEGER REFERENCES users(id),
    replacement_notes TEXT,
    attachment_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saldo urlopów
CREATE TABLE IF NOT EXISTS employee_leave_balance (
    employee_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL DEFAULT 2025,
    vacation_days_total INTEGER DEFAULT 26,
    vacation_days_used INTEGER DEFAULT 0,
    vacation_days_remaining INTEGER DEFAULT 26,
    vacation_days_from_previous_year INTEGER DEFAULT 0,
    on_demand_days_total INTEGER DEFAULT 4,
    on_demand_days_used INTEGER DEFAULT 0,
    occasional_days_used INTEGER DEFAULT 0,
    unpaid_days_used INTEGER DEFAULT 0,
    sick_days_used INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, year)
);

-- Czas pracy - dziennik
CREATE TABLE IF NOT EXISTS employee_work_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time DATETIME NOT NULL,
    logout_time DATETIME,
    work_duration_minutes INTEGER,
    break_duration_minutes INTEGER DEFAULT 0,
    login_ip TEXT,
    logout_ip TEXT,
    login_location TEXT,
    work_date DATE NOT NULL,
    work_type TEXT DEFAULT 'regular',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Czas pracy - podsumowanie miesięczne
CREATE TABLE IF NOT EXISTS employee_work_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    total_work_days INTEGER DEFAULT 0,
    total_work_hours REAL DEFAULT 0,
    average_daily_hours REAL DEFAULT 0,
    overtime_hours REAL DEFAULT 0,
    weekend_hours REAL DEFAULT 0,
    holiday_hours REAL DEFAULT 0,
    sick_days INTEGER DEFAULT 0,
    vacation_days INTEGER DEFAULT 0,
    other_absence_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month)
);

-- Koszty pracowników
CREATE TABLE IF NOT EXISTS employee_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expense_category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'PLN',
    expense_date DATE NOT NULL,
    related_case_id INTEGER REFERENCES cases(id),
    receipt_file TEXT,
    invoice_file TEXT,
    status TEXT DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    rejection_reason TEXT,
    paid_at DATETIME,
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEKSY
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

CREATE INDEX IF NOT EXISTS idx_education_employee ON employee_education(employee_id);
CREATE INDEX IF NOT EXISTS idx_trainings_employee ON employee_trainings(employee_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON employee_trainings(status);
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_work_time_employee ON employee_work_time(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_time_date ON employee_work_time(work_date);
CREATE INDEX IF NOT EXISTS idx_employee_expenses_employee ON employee_expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_expenses_status ON employee_expenses(status);
