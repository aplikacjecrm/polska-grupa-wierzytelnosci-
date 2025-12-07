# 🗄️ NOWE TABELE BAZY DANYCH

**Plik do wykonania:** `backend/migrations/add-new-features.sql`

---

## 📊 FINANSE

### 1. Miesięczne Raporty
```sql
CREATE TABLE IF NOT EXISTS monthly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL, -- '2025-11'
    
    -- Statystyki
    total_revenue REAL DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    overdue_count INTEGER DEFAULT 0,
    average_payment_amount REAL DEFAULT 0,
    
    -- Dane JSON
    report_data TEXT, -- Szczegółowy JSON z danymi
    
    -- Plik PDF
    pdf_path TEXT,
    
    -- Metadata
    generated_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(month)
);
```

### 2. Faktury
```sql
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL, -- FV/2025/11/001
    
    -- Relacje
    payment_id INTEGER REFERENCES payments(id),
    client_id INTEGER REFERENCES clients(id),
    case_id INTEGER REFERENCES cases(id),
    
    -- Sprzedawca (firma)
    seller_name TEXT DEFAULT 'ProMeritum Kancelaria Prawna',
    seller_address TEXT,
    seller_nip TEXT,
    seller_bank_account TEXT,
    
    -- Nabywca (klient)
    buyer_name TEXT NOT NULL,
    buyer_address TEXT,
    buyer_nip TEXT, -- Opcjonalnie dla firm
    
    -- Pozycje (JSON)
    items TEXT, -- [{"name": "...", "quantity": 1, "net_price": 1000}]
    
    -- Kwoty
    net_amount REAL NOT NULL,
    vat_rate REAL DEFAULT 23,
    vat_amount REAL NOT NULL,
    gross_amount REAL NOT NULL,
    
    -- Daty
    issue_date DATE NOT NULL,
    sale_date DATE,
    due_date DATE,
    paid_date DATE,
    
    -- Status
    status TEXT DEFAULT 'issued', -- issued, sent, paid, overdue, cancelled
    
    -- Pliki
    pdf_path TEXT,
    
    -- Księgowość
    sent_to_accounting BOOLEAN DEFAULT 0,
    accounting_sent_at DATETIME,
    accounting_confirmed BOOLEAN DEFAULT 0,
    
    -- Wysyłka do klienta
    sent_to_client BOOLEAN DEFAULT 0,
    client_sent_at DATETIME,
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Koszty Firmy
```sql
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_number TEXT UNIQUE, -- KO/2025/11/001
    
    -- Typ i kategoria
    expense_type TEXT NOT NULL, -- invoice, salary, rent, utilities, supplies, marketing, other
    category TEXT, -- office, employee, legal, it, marketing
    
    -- Opis
    description TEXT NOT NULL,
    supplier_name TEXT,
    supplier_nip TEXT,
    
    -- Kwoty
    net_amount REAL NOT NULL,
    vat_rate REAL DEFAULT 0,
    vat_amount REAL DEFAULT 0,
    gross_amount REAL NOT NULL,
    currency TEXT DEFAULT 'PLN',
    
    -- Płatność
    payment_method TEXT,
    payment_date DATE,
    payment_reference TEXT,
    
    -- Dokumenty
    invoice_file TEXT,
    receipt_file TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, approved, paid
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    
    -- Metadata
    added_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 👥 HR - PRACOWNICY

### 4. Wykształcenie
```sql
CREATE TABLE IF NOT EXISTS employee_education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Typ
    education_type TEXT NOT NULL, -- university, postgraduate, course, certification
    
    -- Dane uczelni/instytucji
    institution_name TEXT NOT NULL,
    field_of_study TEXT, -- Kierunek studiów
    specialization TEXT, -- Specjalizacja
    degree TEXT, -- Licencjat, Magister, Doktor, etc.
    
    -- Daty
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT 0,
    
    -- Wyniki
    final_grade TEXT, -- Np. "5.0", "Bardzo dobry"
    honors TEXT, -- "Cum laude", etc.
    
    -- Dokumenty
    diploma_file TEXT,
    certificate_file TEXT,
    transcript_file TEXT, -- Karta ocen
    
    -- Notatki
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Szkolenia i Kursy
```sql
CREATE TABLE IF NOT EXISTS employee_trainings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dane szkolenia
    training_name TEXT NOT NULL,
    training_provider TEXT,
    category TEXT, -- legal, soft_skills, technical, language, management
    description TEXT,
    
    -- Daty
    start_date DATE NOT NULL,
    end_date DATE,
    duration_hours INTEGER, -- Liczba godzin
    
    -- Lokalizacja
    location TEXT, -- Warszawa, Online, etc.
    training_format TEXT DEFAULT 'in-person', -- in-person, online, hybrid
    
    -- Koszt
    cost REAL DEFAULT 0,
    currency TEXT DEFAULT 'PLN',
    paid_by TEXT DEFAULT 'company', -- company, employee, shared
    
    -- Certyfikat
    certificate_obtained BOOLEAN DEFAULT 0,
    certificate_number TEXT,
    certificate_file TEXT,
    expiry_date DATE, -- Ważność certyfikatu
    renewal_required BOOLEAN DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'planned', -- planned, in_progress, completed, cancelled
    completion_percentage INTEGER DEFAULT 0,
    
    -- Ocena
    employee_rating INTEGER, -- 1-5
    employee_feedback TEXT,
    
    -- Notatki
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Wnioski Urlopowe
```sql
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Typ urlopu
    leave_type TEXT NOT NULL, -- vacation, sick, parental, unpaid, on_demand, occasional
    
    -- Daty
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL, -- Liczba dni roboczych
    
    -- Powód
    reason TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled
    
    -- Zatwierdzenie
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    rejection_reason TEXT,
    
    -- Zastępstwo
    replacement_employee_id INTEGER REFERENCES users(id),
    replacement_notes TEXT,
    
    -- Dokumenty (np. L4 dla chorobowego)
    attachment_file TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Saldo Urlopów
```sql
CREATE TABLE IF NOT EXISTS employee_leave_balance (
    employee_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL DEFAULT 2025,
    
    -- Urlop wypoczynkowy
    vacation_days_total INTEGER DEFAULT 26,
    vacation_days_used INTEGER DEFAULT 0,
    vacation_days_remaining INTEGER DEFAULT 26,
    vacation_days_from_previous_year INTEGER DEFAULT 0,
    
    -- Urlop na żądanie
    on_demand_days_total INTEGER DEFAULT 4,
    on_demand_days_used INTEGER DEFAULT 0,
    
    -- Urlop okolicznościowy
    occasional_days_used INTEGER DEFAULT 0,
    
    -- Urlop bezpłatny
    unpaid_days_used INTEGER DEFAULT 0,
    
    -- Zwolnienie chorobowe
    sick_days_used INTEGER DEFAULT 0,
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, year)
);
```

### 8. Czas Pracy - Dziennik
```sql
CREATE TABLE IF NOT EXISTS employee_work_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Czas
    login_time DATETIME NOT NULL,
    logout_time DATETIME,
    work_duration_minutes INTEGER,
    
    -- Przerwy
    break_duration_minutes INTEGER DEFAULT 0,
    
    -- Lokalizacja (opcjonalnie)
    login_ip TEXT,
    logout_ip TEXT,
    login_location TEXT,
    
    -- Dzień
    work_date DATE NOT NULL,
    
    -- Typ dnia
    work_type TEXT DEFAULT 'regular', -- regular, overtime, weekend, holiday
    
    -- Notatki
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Czas Pracy - Podsumowanie Miesięczne
```sql
CREATE TABLE IF NOT EXISTS employee_work_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- '2025-11'
    
    -- Statystyki
    total_work_days INTEGER DEFAULT 0,
    total_work_hours REAL DEFAULT 0,
    average_daily_hours REAL DEFAULT 0,
    
    -- Nadgodziny
    overtime_hours REAL DEFAULT 0,
    weekend_hours REAL DEFAULT 0,
    holiday_hours REAL DEFAULT 0,
    
    -- Nieobecności
    sick_days INTEGER DEFAULT 0,
    vacation_days INTEGER DEFAULT 0,
    other_absence_days INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, month)
);
```

---

## 💸 KOSZTY PRACOWNIKÓW

### 10. Rozliczenia Pracowników
```sql
CREATE TABLE IF NOT EXISTS employee_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Kategoria
    expense_category TEXT NOT NULL, -- travel, materials, representation, phone, equipment, other
    
    -- Opis
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'PLN',
    expense_date DATE NOT NULL,
    
    -- Sprawa (jeśli dotyczy)
    related_case_id INTEGER REFERENCES cases(id),
    
    -- Dokumenty
    receipt_file TEXT,
    invoice_file TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
    
    -- Zatwierdzenie
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    rejection_reason TEXT,
    
    -- Wypłata
    paid_at DATETIME,
    payment_method TEXT,
    payment_reference TEXT,
    
    -- Notatki
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 INDEKSY DLA WYDAJNOŚCI

```sql
-- Faktury
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Koszty
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- HR
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
```

---

## 🚀 WYKONANIE MIGRACJI

```bash
# Windows PowerShell
$env:DB_PATH='c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\data\komunikator.db'
sqlite3 $env:DB_PATH < backend/migrations/add-new-features.sql
```

---

## ✅ WERYFIKACJA

```sql
-- Sprawdź czy tabele zostały utworzone
SELECT name FROM sqlite_master 
WHERE type='table' 
AND name IN (
    'monthly_reports',
    'invoices',
    'expenses',
    'employee_education',
    'employee_trainings',
    'leave_requests',
    'employee_leave_balance',
    'employee_work_time',
    'employee_work_summary',
    'employee_expenses'
);

-- Powinno zwrócić 10 wierszy
```
