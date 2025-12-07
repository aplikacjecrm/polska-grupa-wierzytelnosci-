# 📊 SYSTEM FINANSOWY PRO MERITUM - DOKUMENTACJA TECHNICZNA

**Wersja:** 1.0  
**Data:** 16.11.2025  
**Autor:** Zespół Pro Meritum

---

## 📋 SPIS TREŚCI

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura systemu](#architektura-systemu)
3. [Baza danych](#baza-danych)
4. [Backend API](#backend-api)
5. [Frontend - Moduły](#frontend-moduły)
6. [Integracje](#integracje)
7. [Workflow](#workflow)
8. [Plan implementacji](#plan-implementacji)

---

## 🎯 WPROWADZENIE

### Cel systemu
Kompleksowy system finansowo-księgowy dla kancelarii prawnej Pro Meritum, umożliwiający:
- Zarządzanie przychodami i wydatkami
- Automatyczne księgowanie operacji
- Generowanie raportów finansowych
- Kontrolę budżetu
- Integrację z systemem CRM

### Zakres funkcjonalny
1. **Przychody** - rejestracja wszystkich wpływów
2. **Wydatki** - zarządzanie kosztami z workflow zatwierdzania
3. **Pensje** - automatyzacja wynagrodzeń
4. **Faktury zakupowe** - ewidencja faktur od dostawców
5. **Księgowość** - automatyczne księgowanie operacji
6. **Budżety** - planowanie i kontrola wydatków
7. **Raporty** - bilans, rachunek zysków i strat, VAT

---

## 🏗️ ARCHITEKTURA SYSTEMU

### Warstwa 1: Baza danych (SQLite)
- 10 głównych tabel finansowych
- Powiązania z istniejącymi tabelami (clients, cases, users)
- Indeksy dla wydajności

### Warstwa 2: Backend API (Node.js + Express)
- RESTful API
- Endpointy CRUD dla wszystkich modułów
- Automatyczne generowanie kodów
- Walidacja danych
- Obsługa błędów

### Warstwa 3: Frontend (JavaScript)
- Moduły dla każdej funkcjonalności
- Dashboard z wykresami (Chart.js)
- Formularze z walidacją
- Tabele z filtrowaniem i sortowaniem

### Warstwa 4: Integracje
- CRM → Finanse
- Płatności → Przychody
- Faktury → Księgowość
- Wydarzenia → Koszty

---

## 💾 BAZA DANYCH

### Tabele główne

#### 1. revenue (Przychody)
```sql
CREATE TABLE revenue (
    id INTEGER PRIMARY KEY,
    revenue_code TEXT UNIQUE,        -- PRZ/2025/001
    type TEXT,                        -- invoice/payment/advance/installment
    client_id INTEGER,
    case_id INTEGER,
    invoice_id INTEGER,
    amount DECIMAL(10,2),
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(10,2),
    gross_amount DECIMAL(10,2),
    revenue_date DATE,
    payment_date DATE,
    payment_method TEXT,
    status TEXT,                      -- pending/paid/overdue
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

#### 2. expenses (Wydatki)
```sql
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    expense_code TEXT UNIQUE,        -- WYD/2025/001
    category TEXT,                    -- rent/utilities/office/it/marketing
    vendor TEXT,
    invoice_number TEXT,
    amount DECIMAL(10,2),
    status TEXT,                      -- pending/approved/paid
    approval_status TEXT,             -- waiting/approved/rejected
    approved_by INTEGER,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

#### 3. salaries (Pensje)
```sql
CREATE TABLE salaries (
    id INTEGER PRIMARY KEY,
    salary_code TEXT UNIQUE,         -- PEN/2025/001
    employee_id INTEGER,
    period TEXT,                      -- 2025-01
    contract_type TEXT,               -- employment/contract/b2b
    gross_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    zus_employee DECIMAL(10,2),
    zus_employer DECIMAL(10,2),
    status TEXT,                      -- calculated/approved/paid
    FOREIGN KEY (employee_id) REFERENCES users(id)
);
```

#### 4. accounts (Konta księgowe)
```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY,
    account_number TEXT UNIQUE,      -- 100, 130, 201, 400, 700
    account_name TEXT,
    account_type TEXT,                -- asset/liability/equity/revenue/expense
    balance DECIMAL(10,2)
);
```

#### 5. journal_entries (Dziennik księgowy)
```sql
CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY,
    entry_code TEXT UNIQUE,          -- DZ/2025/001
    entry_date DATE,
    reference_type TEXT,              -- invoice/payment/salary
    reference_id INTEGER,
    total_amount DECIMAL(10,2)
);
```

### Powiązania między tabelami

```
clients → cases → revenue
clients → sales_invoices → revenue
expenses → purchase_invoices
users → salaries
revenue/expenses/salaries → journal_entries → accounts
```

---

## 🔌 BACKEND API

### Struktura katalogów
```
backend/
├── routes/
│   └── finances/
│       ├── revenue.js
│       ├── expenses.js
│       ├── salaries.js
│       ├── accounts.js
│       ├── journal.js
│       ├── reports.js
│       └── dashboard.js
├── utils/
│   ├── code-generator.js
│   └── accounting-helper.js
└── database/
    └── finances-init.sql
```

### Endpointy API

#### PRZYCHODY
```
GET    /api/finances/revenue              - Lista przychodów
POST   /api/finances/revenue              - Dodaj przychód
GET    /api/finances/revenue/:id          - Szczegóły
PUT    /api/finances/revenue/:id          - Edytuj
DELETE /api/finances/revenue/:id          - Usuń
GET    /api/finances/revenue/generate-code - Generuj kod
```

#### WYDATKI
```
GET    /api/finances/expenses             - Lista wydatków
POST   /api/finances/expenses             - Dodaj wydatek
POST   /api/finances/expenses/:id/approve - Zatwierdź
POST   /api/finances/expenses/:id/reject  - Odrzuć
GET    /api/finances/expenses/generate-code - Generuj kod
```

#### PENSJE
```
GET    /api/finances/salaries             - Lista pensji
POST   /api/finances/salaries/calculate   - Oblicz pensję
POST   /api/finances/salaries/:id/approve - Zatwierdź
```

#### KSIĘGOWOŚĆ
```
GET    /api/finances/accounts             - Plan kont
POST   /api/finances/journal              - Dodaj zapis księgowy
POST   /api/finances/journal/auto-post    - Auto-księgowanie
```

#### RAPORTY
```
GET    /api/finances/reports/balance-sheet     - Bilans
GET    /api/finances/reports/income-statement  - Rachunek zysków i strat
GET    /api/finances/reports/vat               - Raport VAT
```

### Generowanie kodów

```javascript
// Przykład: PRZ/2025/001
function generateCode(prefix, year) {
    const lastCode = await getLastCode(prefix, year);
    const number = (lastCode ? parseInt(lastCode) + 1 : 1)
        .toString().padStart(3, '0');
    return `${prefix}/${year}/${number}`;
}
```

---

## 🎨 FRONTEND - MODUŁY

### Struktura katalogów
```
frontend/scripts/
├── dashboards/
│   └── finance-dashboard.js
└── modules/
    └── finances/
        ├── revenue-module.js
        ├── expenses-module.js
        ├── salaries-module.js
        ├── accounting-module.js
        └── reports-module.js
```

### Dashboard Finansowy

**Widgety:**
- 💰 Przychody (miesiąc/rok)
- 💸 Wydatki (miesiąc/rok)
- 📊 Bilans (zysk/strata)
- 👥 Koszty pensji
- 📈 Wykres przychodów vs wydatków
- 🥧 Wykres wydatków według kategorii

**Przyciski akcji:**
- [➕ Dodaj przychód]
- [➕ Dodaj wydatek]
- [👥 Pensje]
- [📊 Księgowość]
- [📄 Raporty]

### Moduł wydatków

**Funkcje:**
1. Lista wydatków z filtrowaniem
2. Dodawanie wydatku z kategorią
3. Załączanie faktury (PDF)
4. Workflow zatwierdzania
5. Status płatności

**Kategorie:**
- 🏢 Wynajem i media
- 📎 Materiały biurowe
- 💻 IT i oprogramowanie
- 📢 Marketing
- 📊 Księgowość
- 🚗 Transport
- 👥 Pensje
- ⚖️ Opłaty sądowe

---

## 🔗 INTEGRACJE

### 1. CRM → Finanse
```javascript
// Klient płaci za sprawę
Client pays → Create Payment → Create Revenue → Auto-post Journal Entry
```

### 2. Faktury → Finanse
```javascript
// Wystawienie faktury sprzedażowej
Sales Invoice → Create Revenue → Journal Entry (Dt 130 / Ct 700)
```

### 3. Płatności → Finanse
```javascript
// Płatność od klienta
Payment received → Update Revenue → Journal Entry (Dt 100 / Ct 130)
```

### 4. Wydatki → Księgowość
```javascript
// Zatwierdzenie wydatku
Expense approved → Create Purchase Invoice → Journal Entry (Dt 401 / Ct 201)
```

### 5. 💳 Płatności Online → Finanse
```javascript
// PayPal
Client → PayPal Payment → Webhook → Revenue → Journal Entry

// Bitcoin
Client → BTC Transfer → Blockchain Monitor → Revenue → Journal Entry
```

**Metody płatności online:**
- **PayPal** - karty, konto PayPal
- **Bitcoin** - kryptowaluty

**Zobacz:** `SYSTEM-PLATNOSCI-ONLINE-DOKUMENTACJA.md`

---

## 📊 WORKFLOW

### Workflow wydatków
```
1. Pracownik dodaje wydatek
   ↓
2. Księgowy weryfikuje i zatwierdza/odrzuca
   ↓
3. Admin dokonuje płatności
   ↓
4. System automatycznie księguje
   ↓
5. Aktualizacja budżetu
```

### Workflow pensji
```
1. Księgowy generuje listę płac za okres
   ↓
2. System oblicza brutto/netto/ZUS/podatek
   ↓
3. Admin zatwierdza
   ↓
4. System księguje i generuje przelewy
   ↓
5. Eksport do JPK
```

---

## 📅 PLAN IMPLEMENTACJI

### ETAP 1: Fundament (2-3 dni)
- ✅ Utworzenie tabel w bazie danych
- ✅ Backend routes dla wszystkich modułów
- ✅ Podstawowe endpointy CRUD
- ✅ Generowanie kodów
- ✅ Testy API

### ETAP 2: Moduł przychodów (1 dzień)
- ✅ Lista przychodów
- ✅ Dodawanie przychodu
- ✅ Powiązanie z fakturami/płatnościami
- ✅ Eksport do Excel

### ETAP 3: Moduł wydatków (1-2 dni)
- ✅ Lista wydatków
- ✅ Dodawanie wydatku z kategorią
- ✅ Workflow zatwierdzania
- ✅ Załączanie faktur PDF

### ETAP 4: Moduł pensji (1-2 dni)
- ✅ Kalkulator pensji
- ✅ Generowanie list płac
- ✅ Historia wypłat
- ✅ Eksport JPK

### ETAP 5: Moduł księgowości (2-3 dni)
- ✅ Plan kont
- ✅ Automatyczne księgowanie
- ✅ Dziennik księgowy
- ✅ Bilans i rachunek zysków

### ETAP 6: Moduł raportów (1-2 dni)
- ✅ Bilans
- ✅ Rachunek zysków i strat
- ✅ Raport VAT
- ✅ Eksport PDF/Excel

### ETAP 7: Dashboard + Integracje (1 dzień)
- ✅ Dashboard z wykresami
- ✅ Integracje z CRM
- ✅ Testy końcowe

**Łączny czas:** 12-15 dni roboczych

---

## 🔐 BEZPIECZEŃSTWO

### Uprawnienia
- **Admin** - pełny dostęp
- **Księgowy** - przychody, wydatki, pensje, księgowość, raporty
- **Pracownik** - dodawanie wydatków (własne)
- **Klient** - brak dostępu

### Audyt
- Wszystkie operacje logowane
- Historia zmian
- Kto i kiedy zatwierdził/odrzucił

---

## 📊 RAPORTY

### 1. Bilans
```
AKTYWA                    PASYWA
Kasa: 50,000 zł          Kapitał: 200,000 zł
Należności: 100,000 zł   Zobowiązania: 50,000 zł
Razem: 150,000 zł        Razem: 250,000 zł
```

### 2. Rachunek zysków i strat
```
PRZYCHODY:               500,000 zł
KOSZTY:                  300,000 zł
ZYSK NETTO:              200,000 zł
```

### 3. Raport VAT
```
VAT należny:             115,000 zł
VAT naliczony:            69,000 zł
VAT do zapłaty:           46,000 zł
```

---

## 🎯 METRYKI SUKCESU

1. ✅ Wszystkie przychody i wydatki zarejestrowane
2. ✅ Automatyczne księgowanie działa poprawnie
3. ✅ Raporty generowane w <5 sekund
4. ✅ Workflow zatwierdzeń sprawny
5. ✅ Integracja z CRM bezproblemowa
6. ✅ Eksport do Excel/PDF działa
7. ✅ Użytkownicy zadowoleni z UX

---

## 📞 KONTAKT

**Zespół Pro Meritum**  
Email: dev@pro-meritum.pl  
Dokumentacja: v1.0 (16.11.2025)

---

**KONIEC DOKUMENTACJI**
