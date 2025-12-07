# 🏢 ARCHITEKTURA SYSTEMU PERSONELU - KOMPLETNA SPECYFIKACJA

## 📊 TYPY PRACOWNIKÓW

### 1. 👑 Administrator (admin)
- **Rola:** Pełny dostęp do systemu
- **Uprawnienia:** 
  - Zarządzanie użytkownikami
  - Dostęp do wszystkich modułów
  - Konfiguracja systemu
- **Konto pracownika:** TAK
- **Widoczny w:** Panel admin, statystyki

### 2. 👔 Mecenas (lawyer)
- **Rola:** Prowadzenie spraw sądowych
- **Uprawnienia:**
  - Dostęp do przypisanych spraw
  - Zarządzanie dokumentami sprawy
  - Kontakt z klientami
  - Kalendarz terminów
- **Przypisywany do:** SPRAWY (cases.assigned_to)
- **Konto pracownika:** TAK - z danymi:
  - Specjalizacja (np. prawo karne, cywilne)
  - Nr licencji adwokackiej
  - Telefon służbowy
  - Email
  - Zdjęcie/avatar
- **Widoczny w:** 
  - Formularz tworzenia sprawy (dropdown "Mecenas prowadzący")
  - Szczegóły sprawy
  - Statystyki

### 3. 👤 Opiekun Klienta (client_manager)
- **Rola:** Obsługa i kontakt z klientami
- **Uprawnienia:**
  - Dostęp do przypisanych klientów
  - Zarządzanie dokumentami klienta
  - Pierwsza linia kontaktu
  - Historia komunikacji
- **Przypisywany do:** KLIENCI (clients.case_manager_id)
- **Konto pracownika:** TAK - z danymi:
  - Telefon służbowy
  - Email
  - Godziny dyżuru
  - Języki obce
  - Zdjęcie/avatar
- **Widoczny w:**
  - Formularz tworzenia klienta (dropdown "Opiekun klienta")
  - Szczegóły klienta
  - Szczegóły sprawy (przez powiązanie z klientem)

### 4. 📋 Opiekun Sprawy (case_manager)
- **Rola:** Wsparcie operacyjne dla spraw
- **Uprawnienia:**
  - Dostęp do przypisanych spraw
  - Zarządzanie terminami
  - Przygotowanie dokumentów
  - Kontakt z sądami/prokuraturą
- **Przypisywany do:** SPRAWY (cases.case_manager_id)
- **Konto pracownika:** TAK - z danymi:
  - Telefon służbowy
  - Email
  - Obszar odpowiedzialności
  - Zdjęcie/avatar
- **Widoczny w:**
  - Formularz tworzenia sprawy (dropdown "Opiekun sprawy")
  - Szczegóły sprawy
  - Statystyki

### 5. 📞 Recepcja (reception)
- **Rola:** Pierwszy kontakt, rejestracja
- **Uprawnienia:**
  - Rejestracja nowych klientów
  - Zarządzanie kalendarzem wizyt
  - Podstawowy dostęp do CRM
- **Przypisywany do:** Brak bezpośredniego przypisania
- **Konto pracownika:** TAK - z danymi:
  - Telefon wewnętrzny
  - Email
  - Godziny pracy
  - Zdjęcie/avatar
- **Widoczny w:** 
  - Lista pracowników
  - Statystyki

---

## 🗂️ STRUKTURA BAZY DANYCH

### ✅ ISTNIEJĄCE (już działa):

```sql
-- Tabela users
users (
  id INTEGER,
  user_role TEXT,  -- 'admin', 'lawyer', 'client_manager', 'case_manager', 'reception', 'client'
  name TEXT,
  email TEXT,
  initials TEXT
)

-- Tabela clients
clients (
  id INTEGER,
  case_manager_id INTEGER,  -- FK -> users(id) WHERE user_role='client_manager'
  assigned_to INTEGER       -- FK -> users(id) WHERE user_role='lawyer' (opcjonalne)
)

-- Tabela cases
cases (
  id INTEGER,
  client_id INTEGER,        -- FK -> clients(id)
  assigned_to INTEGER,      -- FK -> users(id) WHERE user_role='lawyer'
  case_manager_id INTEGER   -- FK -> users(id) WHERE user_role='case_manager'
)
```

### 🆕 DO DODANIA:

```sql
-- Nowa tabela: employee_profiles
CREATE TABLE employee_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,      -- FK -> users(id)
  phone TEXT,                             -- Telefon służbowy
  position TEXT,                          -- Stanowisko
  department TEXT,                        -- Wydział/Dział
  specialization TEXT,                    -- Specjalizacja (dla mecenasów)
  license_number TEXT,                    -- Nr licencji (dla mecenasów)
  languages TEXT,                         -- Języki obce (JSON array)
  work_hours TEXT,                        -- Godziny pracy (JSON)
  bio TEXT,                               -- Opis/Bio
  avatar_url TEXT,                        -- Link do zdjęcia
  hire_date DATE,                         -- Data zatrudnienia
  office_location TEXT,                   -- Lokalizacja biura
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indeksy dla wydajności
CREATE INDEX idx_employee_profiles_user_id ON employee_profiles(user_id);
```

---

## 🔄 PRZEPŁYW DANYCH

### 1️⃣ Dodawanie Pracownika (Panel Admin)

```
Admin → "➕ Nowe konto" → Custom Prompt:
  ↓
Wybór roli:
  - admin
  - lawyer (Mecenas)
  - client_manager (Opiekun klienta)
  - case_manager (Opiekun sprawy)
  - reception (Recepcja)
  ↓
Wypełnienie danych:
  - Imię i nazwisko
  - Email (login)
  - Hasło (auto-generowane lub własne)
  ↓
Zapis do `users`:
  INSERT INTO users (email, password, name, user_role, initials)
  ↓
Auto-tworzenie profilu:
  INSERT INTO employee_profiles (user_id, ...)
  ↓
Przekierowanie:
  "✅ Konto utworzone! Przejdź do profilu pracownika aby uzupełnić dane"
```

### 2️⃣ Dodawanie Klienta

```
CRM → "➕ Nowy klient" → Formularz:
  ↓
Pola podstawowe:
  - Imię, Nazwisko
  - Email, Telefon
  - Adres, NIP/PESEL
  - Notatki
  ↓
SELECT "👤 Opiekun klienta":
  Ładowanie z: GET /api/cases/staff/list
    ↓
  Filtr: user_role = 'client_manager'
    ↓
  Wyświetlenie: name + initials
  ↓
Zapis do `clients`:
  INSERT INTO clients (..., case_manager_id)
```

### 3️⃣ Dodawanie Sprawy

```
CRM → "📋 Nowa sprawa" → Formularz:
  ↓
Pola podstawowe:
  - Klient (wybór z listy)
  - Numer sprawy (auto-generowany)
  - Typ sprawy
  - Opis
  ↓
SELECT "👔 Mecenas prowadzący":
  Ładowanie z: GET /api/cases/staff/list
    ↓
  Filtr: user_role = 'lawyer'
    ↓
  Wyświetlenie: name + specialization
  ↓
SELECT "📋 Opiekun sprawy":
  Ładowanie z: GET /api/cases/staff/list
    ↓
  Filtr: user_role = 'case_manager'
    ↓
  Wyświetlenie: name + initials
  ↓
AUTO-FILL "👤 Opiekun klienta":
  Z: clients.case_manager_id (readonly)
  ↓
Zapis do `cases`:
  INSERT INTO cases (..., assigned_to, case_manager_id)
```

### 4️⃣ Szczegóły Sprawy

```
Widok szczegółów sprawy:
  ↓
SEKCJA: "👥 Zespół sprawy"
  ↓
┌─────────────────────────────────────┐
│ 👔 Mecenas prowadzący               │
│    Jan Kowalski (JK)                │
│    📧 jan.k@pro-meritum.pl          │
│    📞 +48 123 456 789               │
│    💼 Prawo karne                   │
├─────────────────────────────────────┤
│ 📋 Opiekun sprawy                   │
│    Anna Nowak (AN)                  │
│    📧 anna.n@pro-meritum.pl         │
│    📞 +48 987 654 321               │
├─────────────────────────────────────┤
│ 👤 Opiekun klienta                  │
│    Maria Lewandowska (ML)           │
│    📧 maria.l@pro-meritum.pl        │
│    📞 +48 555 444 333               │
│    🗣️ PL, EN, DE                    │
└─────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACJA KROK PO KROKU

### ETAP 1: Baza danych ✅ (GOTOWE)
- [x] Kolumna `clients.case_manager_id`
- [x] Kolumna `cases.assigned_to`
- [x] Kolumna `cases.case_manager_id`

### ETAP 2: Backend API ✅ (GOTOWE)
- [x] `/api/cases/staff/list` - zwraca lawyers, client_managers, case_managers
- [x] `/api/clients` POST - zapisuje case_manager_id
- [x] `/api/cases` POST - zapisuje assigned_to i case_manager_id

### ETAP 3: Frontend Formularze ✅ (W TRAKCIE)
- [x] Custom prompt dla dodawania użytkownika
- [x] Loader dla formularza klienta (client_managers)
- [x] Loader dla formularza sprawy (lawyers + case_managers)
- [ ] Naprawić backup timer - ładowanie list

### ETAP 4: Szczegóły sprawy ❌ (TODO)
- [ ] Sekcja "Zespół sprawy"
- [ ] Wyświetlanie mecenasa z danymi
- [ ] Wyświetlanie opiekuna sprawy
- [ ] Wyświetlanie opiekuna klienta (przez relację)
- [ ] Linki do profili pracowników

### ETAP 5: Profile pracowników ❌ (TODO)
- [ ] Tabela `employee_profiles`
- [ ] API `/api/employees`
- [ ] Formularz edycji profilu
- [ ] Widok profilu pracownika
- [ ] Upload avatara

### ETAP 6: Statystyki i raporty ❌ (TODO)
- [ ] Dashboard admin - liczba pracowników wg typu
- [ ] Obciążenie pracowników (ile spraw/klientów)
- [ ] Wykres aktywności
- [ ] Export do Excel

---

## 📝 NASTĘPNE KROKI (PRIORYTET)

1. **NAJPIERW:** Naprawić ładowanie list (client_manager i case_manager) ✅
2. **POTEM:** Dodać sekcję "Zespół sprawy" w szczegółach
3. **NASTĘPNIE:** Stworzyć tabelę employee_profiles
4. **NA KONIEC:** Profile pracowników i statystyki

---

## 💡 REKOMENDACJE

### Separacja ról:
✅ **2 OSOBNE ROLE:**
- `client_manager` → tylko dla klientów
- `case_manager` → tylko dla spraw

### Korzyści:
- ✅ Jasny podział obowiązków
- ✅ Łatwiejsze filtrowanie
- ✅ Lepsze raporty (kto ile ma)
- ✅ Możliwość różnych uprawnień

### Przyszłe rozszerzenia:
- [ ] System uprawnień (permissions)
- [ ] Historia zmian przypisań
- [ ] Notyfikacje o nowych przypisaniach
- [ ] Kalendarz dostępności pracowników
- [ ] Oceny pracowników
