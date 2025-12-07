-- ============================================
-- MIGRACJA 006: SYSTEM HR
-- Data: 2025-11-25
-- Moduły: Urlopy, Szkolenia, Doświadczenie, Benefity, Dokumenty, Wynagrodzenia
-- ============================================

-- ============================================
-- 1. URLOPY (VACATIONS)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_vacations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  vacation_type TEXT NOT NULL CHECK(vacation_type IN ('annual', 'sick', 'unpaid', 'parental', 'occasional', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
  request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by INTEGER,
  approved_at DATETIME,
  rejection_reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_vacations_employee ON employee_vacations(employee_id);
CREATE INDEX IF NOT EXISTS idx_vacations_status ON employee_vacations(status);
CREATE INDEX IF NOT EXISTS idx_vacations_dates ON employee_vacations(start_date, end_date);

-- Saldo urlopów na rok
CREATE TABLE IF NOT EXISTS employee_vacation_balance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  annual_days INTEGER DEFAULT 26, -- Dni urlopu wypoczynkowego
  occasional_days INTEGER DEFAULT 4, -- Urlop na żądanie
  used_annual_days INTEGER DEFAULT 0,
  used_occasional_days INTEGER DEFAULT 0,
  carried_over_days INTEGER DEFAULT 0, -- Dni przeniesione z poprzedniego roku
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(employee_id, year)
);

CREATE INDEX IF NOT EXISTS idx_vacation_balance_employee ON employee_vacation_balance(employee_id);

-- ============================================
-- 2. SZKOLENIA/KURSY (TRAINING)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_training (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  training_type TEXT NOT NULL CHECK(training_type IN ('course', 'certification', 'conference', 'workshop', 'webinar', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT, -- Nazwa firmy szkoleniowej
  start_date DATE,
  end_date DATE,
  duration_hours INTEGER,
  cost REAL DEFAULT 0,
  currency TEXT DEFAULT 'PLN',
  status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  certificate_url TEXT, -- Ścieżka do pliku certyfikatu
  certificate_number TEXT,
  issue_date DATE, -- Data wystawienia certyfikatu
  expiry_date DATE, -- Data wygaśnięcia certyfikatu
  grade TEXT, -- Ocena np. "Passed", "Excellent", "90%"
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_training_employee ON employee_training(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON employee_training(status);
CREATE INDEX IF NOT EXISTS idx_training_expiry ON employee_training(expiry_date);

-- ============================================
-- 3. DOŚWIADCZENIE (EXPERIENCE)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  experience_type TEXT NOT NULL CHECK(experience_type IN ('work', 'education', 'project', 'skill')),
  
  -- Dla doświadczenia zawodowego (work)
  company_name TEXT,
  position TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT 0,
  responsibilities TEXT,
  achievements TEXT,
  
  -- Dla edukacji (education)
  institution TEXT,
  degree TEXT, -- 'bachelor', 'master', 'phd', 'certificate', 'diploma'
  field_of_study TEXT,
  
  -- Dla projektów (project)
  project_name TEXT,
  project_role TEXT,
  project_description TEXT,
  technologies TEXT, -- JSON array lub comma-separated
  
  -- Dla umiejętności (skill)
  skill_name TEXT,
  skill_category TEXT, -- 'technical', 'soft', 'language', 'tool'
  skill_level TEXT CHECK(skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_experience_employee ON employee_experience(employee_id);
CREATE INDEX IF NOT EXISTS idx_experience_type ON employee_experience(experience_type);

-- ============================================
-- 4. BENEFITY (BENEFITS)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_benefits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  benefit_type TEXT NOT NULL CHECK(benefit_type IN ('health_insurance', 'life_insurance', 'multisport', 'parking', 'meal_vouchers', 'phone', 'laptop', 'car', 'fuel_card', 'other')),
  benefit_name TEXT NOT NULL,
  provider TEXT, -- Nazwa dostawcy benefitu
  value_monthly REAL DEFAULT 0, -- Wartość miesięczna
  value_yearly REAL DEFAULT 0, -- Wartość roczna (auto-calculowana)
  currency TEXT DEFAULT 'PLN',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT 1,
  policy_number TEXT, -- Numer polisy/umowy
  auto_renewal BOOLEAN DEFAULT 0, -- Czy automatycznie odnawiane
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_benefits_employee ON employee_benefits(employee_id);
CREATE INDEX IF NOT EXISTS idx_benefits_active ON employee_benefits(is_active);
CREATE INDEX IF NOT EXISTS idx_benefits_expiry ON employee_benefits(end_date);

-- ============================================
-- 5. DOKUMENTY PRACOWNICZE (DOCUMENTS)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK(document_type IN ('contract', 'annex', 'certificate', 'diploma', 'id_card', 'medical_exam', 'safety_training', 'nda', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  issue_date DATE,
  expiry_date DATE,
  is_confidential BOOLEAN DEFAULT 0,
  requires_renewal BOOLEAN DEFAULT 0, -- Czy dokument wymaga odnowienia
  uploaded_by INTEGER NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON employee_documents(expiry_date);

-- ============================================
-- 6. WYNAGRODZENIA - Rozbudowa employee_profiles
-- ============================================
-- Kolumny do istniejącej tabeli employee_profiles (pomiń jeśli już istnieją)
-- base_salary, salary_currency, contract_type, employment_type, salary_review_date, performance_bonus_percent
-- SQLite nie wspiera IF NOT EXISTS dla ALTER TABLE, więc pomijamy jeśli tabela już ma te kolumny

-- Historia wynagrodzeń
CREATE TABLE IF NOT EXISTS salary_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  old_salary REAL,
  new_salary REAL,
  currency TEXT DEFAULT 'PLN',
  change_amount REAL, -- Różnica kwotowa
  change_percentage REAL, -- Różnica procentowa
  change_reason TEXT CHECK(change_reason IN ('promotion', 'annual_review', 'performance', 'cost_of_living', 'market_adjustment', 'other')),
  effective_date DATE NOT NULL,
  changed_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_salary_history_employee ON salary_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_history_date ON salary_history(effective_date);

-- ============================================
-- 7. OCENY PRACOWNICZE - Rozbudowa istniejącej tabeli
-- ============================================
-- Sprawdź czy tabela employee_reviews istnieje, jeśli nie - utwórz
CREATE TABLE IF NOT EXISTS employee_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  review_period_start DATE,
  review_period_end DATE,
  review_type TEXT CHECK(review_type IN ('annual', 'quarterly', 'probation', 'project', 'ad_hoc')),
  overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 5),
  performance_score REAL CHECK(performance_score BETWEEN 0 AND 100),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_for_next_period TEXT,
  reviewer_comments TEXT,
  employee_comments TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'completed', 'acknowledged')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_employee ON employee_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON employee_reviews(reviewer_id);

-- ============================================
-- 8. SETTINGS HR - Konfiguracja systemu
-- ============================================
CREATE TABLE IF NOT EXISTS hr_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT CHECK(setting_type IN ('text', 'number', 'boolean', 'json')),
  description TEXT,
  updated_by INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Domyślne ustawienia
INSERT OR IGNORE INTO hr_settings (setting_key, setting_value, setting_type, description) VALUES
  ('annual_vacation_days', '26', 'number', 'Liczba dni urlopu wypoczynkowego rocznie'),
  ('occasional_vacation_days', '4', 'number', 'Liczba dni urlopu na żądanie rocznie'),
  ('sick_leave_paid_days', '33', 'number', 'Liczba dni zwolnienia lekarskiego płatnego przez pracodawcę (80%)'),
  ('vacation_carryover_enabled', 'true', 'boolean', 'Czy urlopy mogą być przenoszone na następny rok'),
  ('vacation_carryover_max_days', '5', 'number', 'Maksymalna liczba dni do przeniesienia'),
  ('training_budget_per_employee', '3000', 'number', 'Roczny budżet szkoleniowy na pracownika (PLN)'),
  ('certificate_expiry_reminder_days', '30,60,90', 'text', 'Przypomnienia przed wygaśnięciem certyfikatu (dni)'),
  ('medical_exam_validity_months', '12', 'number', 'Ważność badań lekarskich (miesiące)'),
  ('probation_period_days', '90', 'number', 'Okres próbny (dni)');

-- ============================================
-- 9. POWIADOMIENIA HR
-- ============================================
CREATE TABLE IF NOT EXISTS hr_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_type TEXT NOT NULL CHECK(notification_type IN ('vacation_request', 'vacation_approved', 'vacation_rejected', 'certificate_expiring', 'medical_exam_due', 'salary_review_due', 'benefit_expiring', 'training_scheduled', 'document_uploaded', 'other')),
  recipient_id INTEGER NOT NULL,
  sender_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT, -- 'vacation', 'training', 'benefit', 'document'
  related_entity_id INTEGER,
  is_read BOOLEAN DEFAULT 0,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON hr_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON hr_notifications(is_read);

-- ============================================
-- KONIEC MIGRACJI 006
-- ============================================
