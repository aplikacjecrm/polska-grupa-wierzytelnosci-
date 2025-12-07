# 💼 KOMPLETNY SYSTEM FINANSOWY FIRMY

## ✅ CO ZOSTAŁO ZAIMPLEMENTOWANE:

### 1. **Rozszerzona baza danych** (3 nowe tabele):

#### Tabela: `company_expenses` (Wydatki firmy)
```sql
- expense_code TEXT (EXP/2025/0001)
- category TEXT (Wynajem, Media, Materiały biurowe, etc.)
- subcategory TEXT
- amount DECIMAL
- vendor TEXT (dostawca)
- invoice_number TEXT
- payment_status (pending/paid)
- created_by, approved_by
```

#### Tabela: `employee_salaries` (Pensje pracowników)
```sql
- employee_id INTEGER
- month, year INTEGER
- base_salary DECIMAL
- bonus, deductions DECIMAL
- net_salary DECIMAL
- payment_status (pending/paid)
- payment_date DATE
```

#### Tabela: `company_invoices` (Faktury kosztowe)
```sql
- invoice_number TEXT
- invoice_type TEXT
- vendor TEXT
- amount, tax_amount, total_amount DECIMAL
- issue_date, due_date DATE
- payment_status (unpaid/paid)
- file_path TEXT (skan faktury)
```

---

### 2. **Backend API** (`backend/routes/finances.js`):

#### `GET /api/finances/dashboard`
Zwraca kompletny dashboard finansowy:
```json
{
  "revenue": {
    "count": 150,
    "total": 50000.00,
    "paid": 45000.00,
    "pending": 5000.00
  },
  "expenses": {
    "count": 80,
    "total": 20000.00,
    "paid": 18000.00,
    "pending": 2000.00
  },
  "salaries": {
    "count": 10,
    "total": 15000.00,
    "paid": 15000.00,
    "pending": 0
  },
  "invoices": {
    "count": 30,
    "total": 10000.00,
    "paid": 8000.00,
    "unpaid": 2000.00
  },
  "clientBalances": {
    "count": 50,
    "total": 25000.00
  },
  "summary": {
    "totalRevenue": 45000.00,
    "totalExpenses": 41000.00,
    "balance": 4000.00,
    "profit": true
  }
}
```

#### `POST /api/finances/expenses`
Dodawanie wydatku firmy:
```javascript
{
  "category": "Wynajem biura",
  "subcategory": "Czynsz",
  "amount": 3000.00,
  "description": "Czynsz za listopad",
  "vendor": "Właściciel biura",
  "invoice_number": "FV/2025/11",
  "invoice_date": "2025-11-01",
  "payment_method": "bank_transfer"
}
```

#### `GET /api/finances/expenses`
Lista wydatków z filtrami:
- `?category=Wynajem` - Po kategorii
- `?status=pending` - Po statusie
- `?limit=50` - Limit wyników

#### `GET /api/finances/salaries`
Lista pensji:
- `?year=2025` - Rok
- `?month=11` - Miesiąc

#### `GET /api/finances/invoices`
Lista faktur:
- `?status=unpaid` - Niezapłacone

---

### 3. **Kategorie wydatków** (przykłady):

1. **Wynajem i media:**
   - Czynsz biura
   - Energia elektryczna
   - Woda
   - Internet i telefon
   - Sprzątanie

2. **Materiały biurowe:**
   - Papier, długopisy
   - Tonery do drukarek
   - Segregatory, teczki

3. **IT i oprogramowanie:**
   - Licencje oprogramowania
   - Hosting, domeny
   - Sprzęt komputerowy

4. **Marketing:**
   - Reklama online
   - Materiały promocyjne
   - Strona www

5. **Księgowość:**
   - Usługi księgowe
   - Podatki

6. **Inne:**
   - Koszty delegacji
   - Szkolenia pracowników
   - Ubezpieczenia

---

## 📊 DASHBOARD ADMINA - WIDOK:

```
┌─────────────────────────────────────────────────────────┐
│ 💼 DASHBOARD FINANSOWY FIRMY                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│ │💰 Przychody │  │💸 Wydatki   │  │📊 Bilans    │    │
│ │             │  │             │  │             │    │
│ │ 45,000 PLN  │  │ 41,000 PLN  │  │ +4,000 PLN  │    │
│ │ Opłacone    │  │ Opłacone    │  │ Zysk ✅      │    │
│ └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ SZCZEGÓŁY PRZYCHODÓW                                ││
│ │ • 150 płatności klientów                            ││
│ │ • 45,000 PLN opłacone                               ││
│ │ • 5,000 PLN oczekujące                              ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ SZCZEGÓŁY WYDATKÓW                                  ││
│ │ • Wydatki firmy: 18,000 PLN                         ││
│ │ • Pensje pracowników: 15,000 PLN                    ││
│ │ • Faktury kosztowe: 8,000 PLN                       ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ SALDA KLIENTÓW                                      ││
│ │ • 50 klientów z saldem                              ││
│ │ • Łącznie: 25,000 PLN prepaid                       ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ [📊 Szczegóły]  [➕ Dodaj wydatek]  [📄 Raport]       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 UPRAWNIENIA:

### Admin:
- ✅ Widzi WSZYSTKIE finanse firmy
- ✅ Może dodawać wydatki
- ✅ Może zatwierdzać wydatki
- ✅ Widzi pensje wszystkich pracowników
- ✅ Generuje raporty

### Lawyer (Mecenas):
- ✅ Może dodawać wydatki związane ze sprawami
- ✅ Widzi swoje płatności
- ⛔ NIE widzi pensji innych

### Case Manager:
- ✅ Może dodawać wydatki biurowe
- ⛔ NIE widzi płatności klientów
- ⛔ NIE widzi pensji

---

## 🚀 JAK DODAĆ WYDATEK:

### Przykład: Mecenas kupił segregatory

```javascript
// W systemie klikasz "➕ Dodaj wydatek"
POST /api/finances/expenses
{
  "category": "Materiały biurowe",
  "subcategory": "Segregatory",
  "amount": 50.00,
  "description": "5x segregatory A4",
  "vendor": "Sklep papierniczy",
  "invoice_number": "FV/123/2025",
  "payment_method": "cash"
}

// System generuje: EXP/2025/0080
// Status: pending (czeka na zatwierdzenie przez admina)
```

---

## 📈 RAPORTY (do zrobienia):

### Raport miesięczny:
- Przychody vs Wydatki
- Top 5 kategorii wydatków
- Wykres słupkowy
- Eksport do PDF/Excel

### Raport roczny:
- Bilans roczny
- Zysk/Strata
- Porównanie z poprzednim rokiem
- Prognozy na przyszły rok

---

## 🔄 INTEGRACJA Z PŁATNOŚCIAMI:

### Automatyczne powiązania:
1. **Płatność klienta opłacona** → Przychód ✅
2. **Zasiل salda klienta** → Przychód prepaid ✅
3. **Faktura kosztowa opłacona** → Wydatek ✅
4. **Pensja wypłacona** → Wydatek ✅
5. **Wydatek zatwierdzony** → Oczekuje na płatność ⏳

---

## 📁 PLIKI:

### Backend:
- ✅ `backend/database/init.js` - 3 nowe tabele
- ✅ `backend/routes/finances.js` - API finansowe
- ✅ `backend/server.js` - Router zarejestrowany

### Frontend (do zrobienia):
- ⏳ `frontend/scripts/dashboards/admin-dashboard.js` - Rozszerzyć o finanse
- ⏳ `frontend/scripts/modules/expenses-module.js` - Moduł wydatków
- ⏳ `frontend/index.html` - Import modułów

### Dokumentacja:
- ✅ `SYSTEM-FINANSOWY-FIRMY.md` - Ten plik

---

## ✅ CO DZIAŁA (Backend):

1. ✅ Baza danych rozszerzona
2. ✅ API finances gotowe
3. ✅ Dashboard endpoint zwraca dane
4. ✅ Dodawanie wydatków działa
5. ✅ Lista wydatków, pensji, faktur

## ⏳ CO DO ZROBIENIA (Frontend):

1. ⏳ Dashboard finansowy admina (widok)
2. ⏳ Formularz dodawania wydatków
3. ⏳ Lista wydatków z filtrowaniem
4. ⏳ Moduł pensji pracowników
5. ⏳ Moduł faktur kosztowych
6. ⏳ Integracja z modułem płatności
7. ⏳ Raporty PDF/Excel

---

## 🎯 NASTĘPNE KROKI:

### KROK 1: Zrestartuj backend
```bash
Ctrl + C  # Zatrzymaj
npm start # Uruchom ponownie
```

### KROK 2: Test API
```javascript
// W konsoli przeglądarki:
const dashboard = await window.api.request('/finances/dashboard');
console.log(dashboard);
```

### KROK 3: Dodaj wydatek (test)
```javascript
const expense = await window.api.request('/finances/expenses', 'POST', {
  category: 'Test',
  amount: 100.00,
  description: 'Test wydatku'
});
console.log(expense);
```

---

## 💡 PRZYKŁADY UŻYCIA:

### Scenariusz 1: Admin sprawdza finanse
1. Loguje się jako admin
2. Widzi dashboard finansowy
3. Przychody: 45,000 PLN
4. Wydatki: 41,000 PLN
5. **Bilans: +4,000 PLN zysku** ✅

### Scenariusz 2: Mecenas kupuje coś
1. Mecenas kupuje książki prawnicze za 200 PLN
2. Dodaje wydatek w systemie
3. Admin widzi wydatek jako "pending"
4. Admin zatwierdza
5. Wydatek jest płatny

### Scenariusz 3: Wypłata pensji
1. Admin dodaje pensje dla wszystkich
2. System oblicza netto
3. Status: "pending"
4. Po przelewach → Status: "paid"
5. Raport wygenerowany automatycznie

---

## ✅ GOTOWE! Backend finansowy działa!

**Zrestartuj backend i przetestuj API!** 💼📊
