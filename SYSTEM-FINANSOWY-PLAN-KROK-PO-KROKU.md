# 📅 SYSTEM FINANSOWY - PLAN IMPLEMENTACJI KROK PO KROKU

**Harmonogram:** 12-15 dni roboczych  
**Start:** Do ustalenia  
**Wersja:** 1.0

---

## 🎯 DZIEŃ 1-3: FUNDAMENT

### ✅ ZADANIE 1.1: Baza danych (4h)
**Plik:** `backend/database/finances-init.sql`

**Co zrobić:**
1. Utworzyć plik SQL z wszystkimi tabelami
2. Dodać indeksy
3. Dodać klucze obce
4. Uruchomić migrację

**Tabele do utworzenia:**
- revenue (przychody)
- expenses (wydatki)
- salaries (pensje)
- purchase_invoices (faktury zakupowe)
- accounts (konta księgowe)
- journal_entries (dziennik księgowy)
- journal_entry_lines (pozycje dziennika)
- budgets (budżety)
- financial_reports (raporty)
- case_costs (koszty spraw)

**Komenda:**
```bash
cd backend
node database/migrate-finances.js
```

---

### ✅ ZADANIE 1.2: Backend routes - Revenue (3h)
**Plik:** `backend/routes/finances/revenue.js`

**Endpointy:**
```javascript
GET    /api/finances/revenue              // Lista
POST   /api/finances/revenue              // Dodaj
GET    /api/finances/revenue/:id          // Szczegóły
PUT    /api/finances/revenue/:id          // Edytuj
DELETE /api/finances/revenue/:id          // Usuń
GET    /api/finances/revenue/generate-code // Generuj kod
```

**Funkcje:**
- Filtrowanie (client_id, case_id, status, daty)
- Paginacja
- Podsumowanie (total_paid, total_pending)
- Generowanie kodu PRZ/RRRR/NNN
- Walidacja danych

---

### ✅ ZADANIE 1.3: Backend routes - Expenses (3h)
**Plik:** `backend/routes/finances/expenses.js`

**Endpointy:**
```javascript
GET    /api/finances/expenses             // Lista
POST   /api/finances/expenses             // Dodaj
GET    /api/finances/expenses/:id         // Szczegóły
PUT    /api/finances/expenses/:id         // Edytuj
DELETE /api/finances/expenses/:id         // Usuń
POST   /api/finances/expenses/:id/approve // Zatwierdź
POST   /api/finances/expenses/:id/reject  // Odrzuć
GET    /api/finances/expenses/generate-code // Generuj kod
```

**Funkcje:**
- Workflow zatwierdzania
- Załączniki (upload PDF)
- Kategorie wydatków
- Wydatki cykliczne

---

### ✅ ZADANIE 1.4: Backend routes - Salaries (3h)
**Plik:** `backend/routes/finances/salaries.js`

**Endpointy:**
```javascript
GET    /api/finances/salaries             // Lista
POST   /api/finances/salaries             // Dodaj
POST   /api/finances/salaries/calculate   // Oblicz
POST   /api/finances/salaries/:id/approve // Zatwierdź
GET    /api/finances/salaries/generate-code // Generuj kod
```

**Funkcje:**
- Kalkulator pensji (brutto → netto)
- Typy umów (UoP, UZ, B2B)
- Obliczanie ZUS i podatku

---

### ✅ ZADANIE 1.5: Testy API (2h)
**Narzędzie:** Postman

**Co przetestować:**
- Dodawanie przychodu
- Dodawanie wydatku
- Obliczanie pensji
- Generowanie kodów
- Walidacja danych
- Obsługa błędów

---

## 🎯 DZIEŃ 4: MODUŁ PRZYCHODÓW

### ✅ ZADANIE 2.1: Frontend - Revenue Module (4h)
**Plik:** `frontend/scripts/modules/finances/revenue-module.js`

**Funkcje:**
- Lista przychodów z tabelą
- Filtry (status, daty, klient)
- Podsumowanie (karty z kwotami)
- Dodawanie przychodu (formularz)
- Edycja przychodu
- Szczegóły przychodu

**UI:**
```
┌─────────────────────────────────────┐
│ 💰 Przychody          [➕ Dodaj]   │
├─────────────────────────────────────┤
│ ✅ Zapłacone: 500,000 zł           │
│ ⏳ Oczekujące: 100,000 zł          │
│ ⚠️ Przeterminowane: 50,000 zł      │
├─────────────────────────────────────┤
│ [Filtry: Status | Daty | Klient]   │
├─────────────────────────────────────┤
│ Tabela z przychodami...            │
└─────────────────────────────────────┘
```

---

### ✅ ZADANIE 2.2: Integracja z płatnościami (2h)
**Plik:** `frontend/scripts/modules/payments-module.js`

**Co zrobić:**
1. Po zapisaniu płatności → automatycznie utwórz przychód
2. Powiąż płatność z przychodem (payment_id)
3. Aktualizuj status przychodu

**Kod:**
```javascript
// W payments-module.js po zapisaniu płatności
const revenueData = {
    type: 'payment',
    client_id: payment.client_id,
    case_id: payment.case_id,
    amount: payment.amount,
    revenue_date: payment.payment_date,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
    status: 'paid'
};

await window.api.request('/finances/revenue', 'POST', revenueData);
```

---

### ✅ ZADANIE 2.3: Eksport do Excel (2h)
**Biblioteka:** xlsx.js

**Funkcja:**
```javascript
function exportRevenuesToExcel() {
    const data = revenues.map(r => ({
        'Kod': r.revenue_code,
        'Data': r.revenue_date,
        'Klient': r.client_name,
        'Kwota netto': r.net_amount,
        'VAT': r.vat_amount,
        'Kwota brutto': r.gross_amount,
        'Status': r.status
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Przychody');
    XLSX.writeFile(wb, `przychody_${new Date().toISOString()}.xlsx`);
}
```

---

## 🎯 DZIEŃ 5-6: MODUŁ WYDATKÓW

### ✅ ZADANIE 3.1: Frontend - Expenses Module (4h)
**Plik:** `frontend/scripts/modules/finances/expenses-module.js`

**Funkcje:**
- Lista wydatków z tabelą
- Dodawanie wydatku z kategorią
- Załączanie faktury PDF
- Workflow zatwierdzania
- Edycja wydatku

**Kategorie:**
```javascript
const categories = [
    { value: 'rent', label: '🏢 Wynajem i media' },
    { value: 'office', label: '📎 Materiały biurowe' },
    { value: 'it', label: '💻 IT i oprogramowanie' },
    { value: 'marketing', label: '📢 Marketing' },
    { value: 'accounting', label: '📊 Księgowość' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'salaries', label: '👥 Pensje' },
    { value: 'legal', label: '⚖️ Opłaty sądowe' },
    { value: 'other', label: '📝 Inne' }
];
```

---

### ✅ ZADANIE 3.2: Workflow zatwierdzania (3h)

**Stany:**
1. **waiting** - Czeka na zatwierdzenie
2. **approved** - Zatwierdzony
3. **rejected** - Odrzucony

**Uprawnienia:**
- Pracownik: dodaje wydatek (waiting)
- Księgowy: zatwierdza/odrzuca (approved/rejected)
- Admin: płaci (paid)

**UI:**
```
┌─────────────────────────────────────┐
│ Wydatek WYD/2025/001               │
├─────────────────────────────────────┤
│ Status: ⏳ Czeka na zatwierdzenie  │
│                                     │
│ [✅ Zatwierdź] [❌ Odrzuć]         │
└─────────────────────────────────────┘
```

---

### ✅ ZADANIE 3.3: Upload załączników (3h)
**Biblioteka:** Multer (backend)

**Backend:**
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/expenses/' });

router.post('/expenses/:id/upload', upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    
    // Zapisz ścieżkę do bazy
    await db.run(`
        UPDATE expenses 
        SET attachments = json_insert(
            COALESCE(attachments, '[]'),
            '$[#]',
            json_object(
                'name', ?,
                'path', ?,
                'size', ?,
                'type', ?
            )
        )
        WHERE id = ?
    `, [file.originalname, file.path, file.size, file.mimetype, id]);
    
    res.json({ success: true });
});
```

---

## 🎯 DZIEŃ 7-8: MODUŁ PENSJI

### ✅ ZADANIE 4.1: Kalkulator pensji (4h)
**Plik:** `backend/utils/salary-calculator.js`

**Funkcja:**
```javascript
function calculateSalary(grossAmount, contractType) {
    if (contractType === 'employment') {
        // Umowa o pracę
        const zusEmployee = grossAmount * 0.1371;  // 13.71%
        const taxBase = grossAmount - zusEmployee;
        const tax = taxBase * 0.12;                // 12%
        const healthInsurance = taxBase * 0.09;    // 9%
        const netAmount = taxBase - tax - healthInsurance;
        const zusEmployer = grossAmount * 0.1948;  // 19.48%
        
        return {
            gross: grossAmount,
            zus_employee: zusEmployee,
            tax: tax,
            health_insurance: healthInsurance,
            net: netAmount,
            zus_employer: zusEmployer,
            total_cost: grossAmount + zusEmployer
        };
    }
    // ... inne typy umów
}
```

---

### ✅ ZADANIE 4.2: Frontend - Salaries Module (4h)
**Plik:** `frontend/scripts/modules/finances/salaries-module.js`

**Funkcje:**
- Lista pensji za okres
- Generowanie listy płac
- Kalkulator (formularz)
- Historia wypłat
- Eksport do Excel

**UI kalkulatora:**
```
┌─────────────────────────────────────┐
│ 💰 Kalkulator pensji               │
├─────────────────────────────────────┤
│ Pracownik: [Select]                │
│ Typ umowy: [UoP ▼]                 │
│ Kwota brutto: [5000 zł]            │
│                                     │
│ [Oblicz]                           │
│                                     │
│ Wynik:                             │
│ - ZUS pracownik: -685.50 zł        │
│ - Podatek: -517.74 zł              │
│ - Składka zdrowotna: -387.09 zł    │
│ = Netto: 3,409.67 zł               │
│                                     │
│ Koszt pracodawcy: 5,974 zł         │
└─────────────────────────────────────┘
```

---

## 🎯 DZIEŃ 9-11: MODUŁ KSIĘGOWOŚCI

### ✅ ZADANIE 5.1: Plan kont (3h)
**Plik:** `backend/database/chart-of-accounts.sql`

**Konta:**
```sql
INSERT INTO accounts (account_number, account_name, account_type) VALUES
-- AKTYWA
('100', 'Kasa', 'asset'),
('130', 'Należności od klientów', 'asset'),
('140', 'Rozliczenia międzyokresowe', 'asset'),

-- PASYWA
('200', 'Kapitał własny', 'equity'),
('201', 'Zobowiązania wobec dostawców', 'liability'),
('225', 'Podatek dochodowy', 'liability'),
('231', 'ZUS', 'liability'),

-- PRZYCHODY
('700', 'Przychody z usług prawnych', 'revenue'),
('760', 'Pozostałe przychody', 'revenue'),

-- KOSZTY
('400', 'Wynagrodzenia', 'expense'),
('401', 'Materiały biurowe', 'expense'),
('402', 'Wynajem', 'expense'),
('403', 'Media', 'expense'),
('404', 'IT i oprogramowanie', 'expense');
```

---

### ✅ ZADANIE 5.2: Automatyczne księgowanie (4h)
**Plik:** `backend/utils/auto-posting.js`

**Funkcje:**
- autoPostRevenue(revenueId)
- autoPostExpense(expenseId)
- autoPostSalary(salaryId)
- updateAccountBalances()

**Przykład:**
```javascript
async function autoPostRevenue(revenueId) {
    const revenue = await db.get('SELECT * FROM revenue WHERE id = ?', [revenueId]);
    
    // Utwórz zapis księgowy
    const entryCode = await generateJournalCode();
    const entryId = await db.run(`
        INSERT INTO journal_entries (
            entry_code, entry_date, description, 
            reference_type, reference_id, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?)
    `, [entryCode, revenue.payment_date, `Przychód ${revenue.revenue_code}`, 
        'revenue', revenueId, revenue.gross_amount]);
    
    // Dt 100 (Kasa)
    await db.run(`
        INSERT INTO journal_entry_lines (
            journal_entry_id, account_id, debit
        ) VALUES (?, 100, ?)
    `, [entryId.lastID, revenue.gross_amount]);
    
    // Ct 700 (Przychody)
    await db.run(`
        INSERT INTO journal_entry_lines (
            journal_entry_id, account_id, credit
        ) VALUES (?, 700, ?)
    `, [entryId.lastID, revenue.net_amount]);
    
    // Ct 225 (VAT)
    await db.run(`
        INSERT INTO journal_entry_lines (
            journal_entry_id, account_id, credit
        ) VALUES (?, 225, ?)
    `, [entryId.lastID, revenue.vat_amount]);
    
    // Aktualizuj salda
    await updateAccountBalances(entryId.lastID);
}
```

---

### ✅ ZADANIE 5.3: Frontend - Accounting Module (3h)
**Plik:** `frontend/scripts/modules/finances/accounting-module.js`

**Funkcje:**
- Wyświetlanie planu kont
- Dziennik księgowy (tabela)
- Salda kont
- Bilans (aktywa vs pasywa)

---

## 🎯 DZIEŃ 12: MODUŁ BUDŻETÓW

### ✅ ZADANIE 6.1: Backend - Budgets (2h)
**Plik:** `backend/routes/finances/budgets.js`

**Endpointy:**
```javascript
GET    /api/finances/budgets             // Lista
POST   /api/finances/budgets             // Dodaj
GET    /api/finances/budgets/:id/status  // Status realizacji
```

---

### ✅ ZADANIE 6.2: Frontend - Budgets Module (3h)
**Plik:** `frontend/scripts/modules/finances/budgets-module.js`

**UI:**
```
┌─────────────────────────────────────┐
│ 📈 Budżet Q1 2025                  │
├─────────────────────────────────────┤
│ Marketing:                         │
│ Plan: 50,000 zł                    │
│ Realizacja: 35,000 zł (70%)        │
│ [████████░░] 70%                   │
└─────────────────────────────────────┘
```

---

## 🎯 DZIEŃ 13-14: MODUŁ RAPORTÓW

### ✅ ZADANIE 7.1: Backend - Reports (4h)
**Plik:** `backend/routes/finances/reports.js`

**Raporty:**
1. Bilans
2. Rachunek zysków i strat
3. Przepływy pieniężne
4. Raport VAT

---

### ✅ ZADANIE 7.2: Frontend - Reports Module (4h)
**Plik:** `frontend/scripts/modules/finances/reports-module.js`

**Funkcje:**
- Wybór typu raportu
- Wybór okresu
- Generowanie raportu
- Eksport PDF/Excel

---

## 🎯 DZIEŃ 15: FINALIZACJA

### ✅ ZADANIE 8.1: Dashboard finansowy (3h)
**Plik:** `frontend/scripts/dashboards/finance-dashboard.js`

**Widgety:**
- Przychody vs wydatki (wykres)
- Wydatki według kategorii (wykres kołowy)
- Nadchodzące płatności
- Faktury przeterminowane

---

### ✅ ZADANIE 8.2: Testy integracyjne (3h)

**Scenariusze:**
1. Klient płaci → przychód → księgowanie
2. Dodanie wydatku → zatwierdzenie → płatność → księgowanie
3. Generowanie pensji → zatwierdzenie → księgowanie
4. Generowanie raportów

---

### ✅ ZADANIE 8.3: Dokumentacja użytkownika (2h)
**Plik:** `SYSTEM-FINANSOWY-INSTRUKCJA.md`

**Zawartość:**
- Jak dodać przychód
- Jak dodać wydatek
- Jak obliczyć pensję
- Jak wygenerować raport

---

## ✅ CHECKLIST KOŃCOWY

### Backend
- [ ] Wszystkie tabele utworzone
- [ ] Wszystkie endpointy działają
- [ ] Generowanie kodów działa
- [ ] Automatyczne księgowanie działa
- [ ] Walidacja danych działa
- [ ] Obsługa błędów działa

### Frontend
- [ ] Wszystkie moduły działają
- [ ] Formularze z walidacją
- [ ] Tabele z filtrowaniem
- [ ] Eksport do Excel działa
- [ ] Dashboard z wykresami
- [ ] Integracje z CRM działają

### Testy
- [ ] Testy API (Postman)
- [ ] Testy UI (manualne)
- [ ] Testy integracyjne
- [ ] Testy wydajnościowe

### Dokumentacja
- [ ] Dokumentacja techniczna
- [ ] Dokumentacja użytkownika
- [ ] Komentarze w kodzie
- [ ] README zaktualizowany

---

## 🎯 GOTOWE DO STARTU!

**Czy zaczynamy implementację od Dnia 1?** 🚀
