# 👥 FAZA 2: ROZBUDOWA HR
**Priorytet:** ⚡ WYSOKI  
**Czas:** 5-7 dni  

---

## 📋 ZADANIA DO WYKONANIA

### 2.1 Wykształcenie i Kwalifikacje

**Tabela:**
```sql
CREATE TABLE employee_education (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER REFERENCES users(id),
    education_type TEXT,
    institution_name TEXT,
    field_of_study TEXT,
    degree TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN,
    diploma_file TEXT,
    created_at DATETIME
);
```

**Funkcje:**
- Dodawanie wykształcenia
- Upload dyplomu
- Lista kwalifikacji w profilu

---

### 2.2 Kursy i Szkolenia

**Tabela:**
```sql
CREATE TABLE employee_trainings (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    training_name TEXT,
    training_provider TEXT,
    category TEXT,
    start_date DATE,
    end_date DATE,
    duration_hours INTEGER,
    cost REAL,
    paid_by TEXT,
    certificate_obtained BOOLEAN,
    certificate_file TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'planned',
    created_at DATETIME
);
```

**Dashboard szkoleń:**
- Ukończone (lista)
- W trakcie (postęp)
- Zaplanowane
- Statystyki (godziny, certyfikaty)
- Zgłaszanie nowych szkoleń

---

### 2.3 System Urlopowy

**Tabele:**
```sql
CREATE TABLE leave_requests (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    leave_type TEXT,
    start_date DATE,
    end_date DATE,
    days_count INTEGER,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by INTEGER,
    approved_at DATETIME,
    replacement_employee_id INTEGER,
    created_at DATETIME
);

CREATE TABLE employee_leave_balance (
    employee_id INTEGER PRIMARY KEY,
    vacation_days_total INTEGER DEFAULT 26,
    vacation_days_used INTEGER DEFAULT 0,
    vacation_days_remaining INTEGER,
    on_demand_days_total INTEGER DEFAULT 4,
    on_demand_days_used INTEGER DEFAULT 0,
    year INTEGER DEFAULT 2025,
    updated_at DATETIME
);
```

**Funkcje:**
- Składanie wniosków urlopowych
- Zatwierdzanie przez przełożonego
- Automatyczne zliczanie dni
- Kalendarz urlopów zespołu
- Powiadomienia

**Typy urlopów:**
- Wypoczynkowy
- Na żądanie
- Okolicznościowy
- Chorobowy
- Bezpłatny

---

### 2.4 Monitorowanie Czasu Pracy

**Tabele:**
```sql
CREATE TABLE employee_work_time (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    login_time DATETIME,
    logout_time DATETIME,
    work_duration_minutes INTEGER,
    login_ip TEXT,
    work_date DATE,
    created_at DATETIME
);

CREATE TABLE employee_work_summary (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    month TEXT,
    total_work_days INTEGER,
    total_work_hours REAL,
    average_daily_hours REAL,
    overtime_hours REAL,
    created_at DATETIME
);
```

**Automatyzacja:**
- Auto-logowanie przy logowaniu do systemu
- Auto-wylogowanie przy wylogowaniu
- Cron o 23:59 zamyka dzień pracy
- Miesięczne podsumowania

**Raport:**
- Dzienny (godziny pracy)
- Tygodniowy
- Miesięczny (nadgodziny)
- Roczny

---

## 🚀 KOLEJNOŚĆ IMPLEMENTACJI

1. **Dzień 1:** Wykształcenie + API
2. **Dzień 2:** Szkolenia + dashboard
3. **Dzień 3-4:** System urlopowy + zatwierdzanie
4. **Dzień 5-6:** Czas pracy + automatyzacja
5. **Dzień 7:** Integracja + testy
