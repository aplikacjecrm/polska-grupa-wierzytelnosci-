# 🎯 HR DASHBOARD - KOMPLETNY PLAN ROZBUDOWY

## 📋 OBECNY STAN (CO MAMY):

### **Employee Dashboard** ✅
```
✅ Aktywność (activity logs)
✅ Logowania (login history)  
✅ Zadania (tasks)
✅ Tickety (tickets)
✅ Oceny (reviews)
✅ Raporty miesięczne (monthly_reports)
✅ Finanse (prowizje, wypłaty)
✅ Statystyki
```

### **Backend Routes** ✅
```
✅ /api/employees - lista pracowników
✅ /api/employees/:id/profile - profil
✅ /api/employees/:id/activity - aktywność
✅ /api/employees/:id/tasks - zadania
✅ /api/employees/:id/reviews - oceny
✅ /api/employees/:id/monthly-reports - raporty
✅ /api/employees/:id/finances/summary - finanse
✅ /api/hr-compensation - prowizje HR
```

---

## 🚀 CO DODAJEMY (NOWE):

### **1. 🏖️ URLOPY (VACATIONS)**

#### **Tabela: `employee_vacations`**
```sql
CREATE TABLE employee_vacations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  vacation_type TEXT NOT NULL, -- 'annual', 'sick', 'unpaid', 'parental', 'occasional'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by INTEGER, -- user_id
  approved_at DATETIME,
  rejection_reason TEXT,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### **Funkcjonalności:**
- ✅ Pula urlopów rocznych (26 dni)
- ✅ Urlop na żądanie (4 dni)
- ✅ Zwolnienia lekarskie
- ✅ Urlop bezpłatny
- ✅ System wniosków i zatwierdzeń
- ✅ Kalendarz urlopów zespołu
- ✅ Historia urlopów

#### **API Endpoints:**
```
POST   /api/employees/:id/vacations/request
GET    /api/employees/:id/vacations
GET    /api/employees/:id/vacations/balance
POST   /api/hr/vacations/:id/approve
POST   /api/hr/vacations/:id/reject
GET    /api/hr/vacations/pending
GET    /api/hr/vacations/calendar
```

---

### **2. 🎓 SZKOLENIA/KURSY (TRAINING)**

#### **Tabela: `employee_training`**
```sql
CREATE TABLE employee_training (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  training_type TEXT NOT NULL, -- 'course', 'certification', 'conference', 'workshop'
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT, -- Nazwa firmy szkoleniowej
  start_date DATE,
  end_date DATE,
  duration_hours INTEGER,
  cost REAL,
  currency TEXT DEFAULT 'PLN',
  status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
  certificate_url TEXT, -- Link do certyfikatu
  certificate_number TEXT,
  expiry_date DATE, -- Data wygaśnięcia certyfikatu
  grade TEXT, -- Ocena np. "Passed", "Excellent"
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);
```

#### **Funkcjonalności:**
- ✅ Rejestr szkoleń
- ✅ Certyfikaty z datami ważności
- ✅ Przypomnienia o wygasających certyfikatach
- ✅ Budżet szkoleniowy na pracownika
- ✅ Plan szkoleń roczny
- ✅ Historia ukończonych szkoleń

#### **API Endpoints:**
```
POST   /api/employees/:id/training
GET    /api/employees/:id/training
GET    /api/employees/:id/training/:trainingId
PUT    /api/employees/:id/training/:trainingId
DELETE /api/employees/:id/training/:trainingId
GET    /api/hr/training/expiring
GET    /api/hr/training/budget
```

---

### **3. 💼 DOŚWIADCZENIE (EXPERIENCE)**

#### **Tabela: `employee_experience`**
```sql
CREATE TABLE employee_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  experience_type TEXT NOT NULL, -- 'work', 'education', 'project', 'skill'
  
  -- Dla doświadczenia zawodowego
  company_name TEXT,
  position TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT 0,
  responsibilities TEXT,
  achievements TEXT,
  
  -- Dla edukacji
  institution TEXT,
  degree TEXT, -- 'bachelor', 'master', 'phd', 'certificate'
  field_of_study TEXT,
  
  -- Dla projektów
  project_name TEXT,
  project_role TEXT,
  project_description TEXT,
  
  -- Dla umiejętności
  skill_name TEXT,
  skill_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_of_experience INTEGER,
  
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);
```

#### **Funkcjonalności:**
- ✅ CV elektroniczne
- ✅ Historia zatrudnienia
- ✅ Wykształcenie
- ✅ Certyfikaty zawodowe
- ✅ Projekty i osiągnięcia
- ✅ Umiejętności i kompetencje
- ✅ Export do PDF (CV)

#### **API Endpoints:**
```
POST   /api/employees/:id/experience
GET    /api/employees/:id/experience
GET    /api/employees/:id/cv/generate
PUT    /api/employees/:id/experience/:expId
DELETE /api/employees/:id/experience/:expId
```

---

### **4. 🎁 BENEFITY (BENEFITS)**

#### **Tabela: `employee_benefits`**
```sql
CREATE TABLE employee_benefits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  benefit_type TEXT NOT NULL, -- 'health_insurance', 'multisport', 'parking', 'meal_vouchers', 'phone', 'car', 'other'
  benefit_name TEXT NOT NULL,
  provider TEXT, -- Nazwa dostawcy benefitu
  value_monthly REAL, -- Wartość miesięczna
  currency TEXT DEFAULT 'PLN',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT 1,
  policy_number TEXT, -- Numer polisy/umowy
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);
```

#### **Funkcjonalności:**
- ✅ Ubezpieczenie zdrowotne
- ✅ Karta sportowa (Multisport)
- ✅ Parking
- ✅ Bony żywieniowe
- ✅ Telefon służbowy
- ✅ Samochód służbowy
- ✅ Programy motywacyjne
- ✅ Wartość benefitów (kwota brutto)

#### **API Endpoints:**
```
POST   /api/employees/:id/benefits
GET    /api/employees/:id/benefits
GET    /api/employees/:id/benefits/value
PUT    /api/employees/:id/benefits/:benefitId
DELETE /api/employees/:id/benefits/:benefitId
GET    /api/hr/benefits/summary
```

---

### **5. 📝 DOKUMENTY PRACOWNICZE (DOCUMENTS)**

#### **Tabela: `employee_documents`**
```sql
CREATE TABLE employee_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  document_type TEXT NOT NULL, -- 'contract', 'annex', 'certificate', 'diploma', 'id', 'medical', 'other'
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  issue_date DATE,
  expiry_date DATE,
  is_confidential BOOLEAN DEFAULT 0,
  uploaded_by INTEGER NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### **Funkcjonalności:**
- ✅ Umowy o pracę
- ✅ Aneksy
- ✅ Świadectwa pracy
- ✅ Dyplomy
- ✅ Certyfikaty
- ✅ Badania lekarskie (z przypomnieniami)
- ✅ Bezpieczne przechowywanie (dostęp tylko HR + właściciel)

#### **API Endpoints:**
```
POST   /api/employees/:id/documents/upload
GET    /api/employees/:id/documents
GET    /api/employees/:id/documents/:docId/download
DELETE /api/employees/:id/documents/:docId
GET    /api/hr/documents/expiring
```

---

### **6. 💰 WYNAGRODZENIA (COMPENSATION)**

#### **Rozbudowa `employee_profiles`:**
```sql
ALTER TABLE employee_profiles ADD COLUMN base_salary REAL;
ALTER TABLE employee_profiles ADD COLUMN salary_currency TEXT DEFAULT 'PLN';
ALTER TABLE employee_profiles ADD COLUMN contract_type TEXT; -- 'employment', 'b2b', 'mandate', 'internship'
ALTER TABLE employee_profiles ADD COLUMN employment_type TEXT; -- 'full_time', 'part_time'
ALTER TABLE employee_profiles ADD COLUMN salary_review_date DATE; -- Następna podwyżka
```

#### **Tabela: `salary_history`**
```sql
CREATE TABLE salary_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  old_salary REAL,
  new_salary REAL,
  currency TEXT DEFAULT 'PLN',
  change_reason TEXT, -- 'promotion', 'annual_review', 'performance', 'adjustment'
  change_percentage REAL,
  effective_date DATE NOT NULL,
  changed_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

---

## 🎨 HR DASHBOARD - NOWE ZAKŁADKI:

### **Struktura:**
```javascript
HR Dashboard (dla roli: admin, hr)
├─ 👥 Pracownicy (Lista + Szybki widok)
│  ├─ Lista pracowników z filtrowaniem
│  ├─ Karty pracowników (mini-profile)
│  └─ Przycisk: "Pełny Dashboard Pracownika"
│
├─ 🏖️ Urlopy
│  ├─ Wnioski do zatwierdzenia
│  ├─ Kalendarz urlopów
│  ├─ Statystyki wykorzystania
│  └─ Saldo urlopów pracowników
│
├─ 🎓 Szkolenia
│  ├─ Plan szkoleń
│  ├─ Wygasające certyfikaty
│  ├─ Budżet szkoleniowy
│  └─ Historia szkoleń
│
├─ 💼 Baza Talentów
│  ├─ Umiejętności pracowników
│  ├─ Macierz kompetencji
│  ├─ Luki kompetencyjne
│  └─ Plan rozwoju
│
├─ 🎁 Benefity
│  ├─ Aktywne benefity
│  ├─ Koszty benefitów
│  ├─ Wygasające polisy
│  └─ Programy motywacyjne
│
├─ 💰 Wynagrodzenia
│  ├─ Tabela wynagrodzeń
│  ├─ Planowane podwyżki
│  ├─ Historia zmian
│  └─ Struktura kosztów
│
├─ 📊 Raporty HR
│  ├─ Raport miesięczny
│  ├─ Wskaźniki rotacji
│  ├─ Efektywność zespołu
│  └─ Export do Excel/PDF
│
└─ ⚙️ Ustawienia HR
   ├─ Dni wolne (święta)
   ├─ Typy urlopów
   ├─ Rodzaje benefitów
   └─ Szablony dokumentów
```

---

## 🎯 EMPLOYEE DASHBOARD - ROZBUDOWA:

### **Nowe zakładki dla pracownika:**
```javascript
Employee Dashboard
├─ 🏖️ Moje Urlopy
│  ├─ Saldo (dostępne dni)
│  ├─ Złóż wniosek
│  ├─ Historia wniosków
│  └─ Kalendarz zespołu
│
├─ 🎓 Moje Szkolenia
│  ├─ Ukończone kursy
│  ├─ Certyfikaty
│  ├─ Planowane szkolenia
│  └─ Wnioskuj o szkolenie
│
├─ 💼 Moje CV
│  ├─ Doświadczenie zawodowe
│  ├─ Wykształcenie
│  ├─ Umiejętności
│  ├─ Projekty
│  └─ Export do PDF
│
├─ 🎁 Moje Benefity
│  ├─ Aktywne benefity
│  ├─ Wartość pakietu
│  └─ Dostępne programy
│
├─ 💰 Finanse (ROZBUDOWA)
│  ├─ Prowizje (ISTNIEJĄCE)
│  ├─ Wypłaty (ISTNIEJĄCE)
│  ├─ Wynagrodzenie bazowe (NOWE)
│  ├─ Historia podwyżek (NOWE)
│  └─ Prognoza roczna (NOWE)
│
└─ 📄 Moje Dokumenty
   ├─ Umowy
   ├─ Świadectwa
   ├─ Certyfikaty
   └─ Badania lekarskie
```

---

## 📦 KOLEJNOŚĆ WDROŻENIA:

### **FAZA 1: Fundament (1-2 dni)**
1. ✅ Migracja bazy danych (nowe tabele)
2. ✅ Backend API endpoints
3. ✅ Testy połączeń

### **FAZA 2: Urlopy (2-3 dni)**
1. ✅ System wniosków urlopowych
2. ✅ Zatwierdzanie przez HR
3. ✅ Kalendarz urlopów
4. ✅ Powiadomienia

### **FAZA 3: Szkolenia (2 dni)**
1. ✅ Rejestr szkoleń
2. ✅ Certyfikaty z przypomnieniami
3. ✅ Plan budżetowy

### **FAZA 4: Doświadczenie (2 dni)**
1. ✅ CV Builder
2. ✅ Umiejętności
3. ✅ Export PDF

### **FAZA 5: Benefity (1-2 dni)**
1. ✅ Rejestr benefitów
2. ✅ Wycena pakietu
3. ✅ Przypomnienia o wygaśnięciach

### **FAZA 6: Dokumenty (1 dzień)**
1. ✅ Upload dokumentów
2. ✅ Bezpieczny dostęp
3. ✅ Przypomnienia

### **FAZA 7: Wynagrodzenia (1 dzień)**
1. ✅ Historia wynagrodzeń
2. ✅ Planowane podwyżki
3. ✅ Statystyki

### **FAZA 8: Frontend HR Dashboard (3-4 dni)**
1. ✅ Layout i nawigacja
2. ✅ Wszystkie zakładki
3. ✅ Integracja z Employee Dashboard
4. ✅ Eksport raportów

---

## 🎯 KLUCZOWE FUNKCJE:

### **1. Integracja Dashboardów:**
```
HR Dashboard → Lista pracowników → [Pełny Dashboard] → Employee Dashboard
```

### **2. Powiadomienia:**
- 🔔 Nowe wnioski urlopowe
- 🔔 Wygasające certyfikaty (30/60/90 dni)
- 🔔 Badania lekarskie do odnowienia
- 🔔 Nadchodzące urlopy zespołu
- 🔔 Planowane podwyżki

### **3. Raporty:**
- 📊 Raport urlopowy (wykorzystanie, saldo)
- 📊 Raport szkoleniowy (koszty, certyfikaty)
- 📊 Raport wynagrodzeń (struktura, zmiany)
- 📊 Raport benefitów (koszty, ROI)
- 📊 Export do Excel/PDF

---

## 🔐 UPRAWNIENIA:

### **Admin / HR:**
- ✅ Pełny dostęp do wszystkich danych
- ✅ Zatwierdzanie wniosków
- ✅ Edycja wynagrodzeń
- ✅ Dodawanie szkoleń/benefitów
- ✅ Eksport raportów

### **Employee:**
- ✅ Widok własnych danych
- ✅ Składanie wniosków
- ✅ Aktualizacja CV
- ✅ Widok benefitów
- ❌ Brak dostępu do innych pracowników

---

## 🚀 START?

**Zacznijmy od FAZY 1:**
1. Stworzę migrację z nowymi tabelami
2. Utworzę podstawowe API endpoints
3. Przygotujemy szkielet HR Dashboard

**ZGODA?** 🎯
