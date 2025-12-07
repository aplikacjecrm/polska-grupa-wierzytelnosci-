# 💰 ANALIZA SYSTEMU FINANSOWEGO - KOMPLETNA

**Data:** 12 listopada 2025, 05:27  
**Cel:** Sprawdzenie poprawności i uzupełnienie brakujących funkcji

---

## ✅ CO MAMY OBECNIE:

### 1. **PŁATNOŚCI PODSTAWOWE** (tabela `payments`)
```sql
- payment_code, case_id, client_id
- amount, currency, description
- payment_type, payment_method
- status (pending/paid/failed/overdue)
- due_date, paid_at
- paypal_order_id, blik_code
- add_to_balance (PREPAID)
```

**Obsługuje:**
- ✅ Jednorazowe płatności
- ✅ PayPal, BLIK, Karta, Gotówka
- ✅ Powiązanie ze sprawą
- ✅ System PREPAID (saldo)

### 2. **SALDO KLIENTÓW** (tabela `client_balance`)
```sql
- client_id
- balance (aktualne saldo)
- last_transaction_at
```

**Funkcje:**
- ✅ Doładowanie salda
- ✅ Automatyczne pobieranie za usługi
- ✅ Historia transakcji

### 3. **FAKTURY SPRZEDAŻOWE** (tabela `sales_invoices`)
```sql
- invoice_number (FV/2025/11/001)
- client_id, case_id
- net_amount, vat_amount, gross_amount
- payment_status
- ksef_reference_number
```

**Funkcje:**
- ✅ Wystawianie faktur VAT
- ✅ Powiązanie ze sprawą
- ✅ Integracja z KSeF

### 4. **FAKTURY KOSZTOWE** (tabela `company_invoices`)
```sql
- invoice_number
- vendor, amount
- payment_status
- file_path
```

**Funkcje:**
- ✅ Rejestracja kosztów firmy
- ✅ Upload skanów
- ✅ Statusy płatności

### 5. **WYDATKI FIRMY** (tabela `company_expenses`)
```sql
- expense_code
- category, amount
- payment_status
- vendor, invoice_number
```

**Funkcje:**
- ✅ Kategoryzacja wydatków
- ✅ Statusy płatności

### 6. **PENSJE** (tabela `employee_salaries`)
```sql
- employee_id
- month, year
- gross_amount, net_amount
- payment_status
```

**Funkcje:**
- ✅ Rozliczenia pracowników
- ✅ Brutto/netto

---

## ❌ CZEGO BRAKUJE:

### 1. **PŁATNOŚCI RATALNE** 🔴 KRYTYCZNE
**Problem:** 
- Klient płaci miesięcznie za upadłość (5000 PLN / 12 miesięcy)
- Klient płaci ratami za sprawę (10000 PLN / 5 rat)
- Brak mechanizmu rat

**Potrzeba:**
- Tabela `payment_installments` (raty)
- Auto-generowanie rat
- Kontrola zaległości
- Przypomnienia o racie

### 2. **WSPÓŁPRACA Z KANCELARIAMI** 🔴 KRYTYCZNE
**Problem:**
- Część spraw z innymi kancelariami
- Podział kosztów/zysków
- Brak mechanizmu rozliczenia

**Potrzeba:**
- Tabela `case_partnerships` (współpraca)
- Podział procentowy
- Rozliczenia międzykancelaryjne

### 3. **DASHBOARD KONTROLI PŁATNOŚCI** 🟡 WAŻNE
**Problem:**
- Brak widoku: ile zapłacone, ile do zapłaty
- Brak widoku: kiedy następna rata
- Brak alertów o zaległościach

**Potrzeba:**
- Rozbudowany dashboard
- Karty klientów z zaległościami
- Harmonogram rat
- Prognozy przychodów

### 4. **AUTO PRZYPOMNIENIA** 🟡 WAŻNE
**Problem:**
- Tabela `payment_reminders` istnieje ALE nie jest używana
- Brak auto-wysyłki email
- Brak SMS

**Potrzeba:**
- System CRON (zaplanowane zadania)
- Email reminders
- SMS reminders (opcjonalnie)

### 5. **PLANOWANIE BUDŻETU** 🟡 WAŻNE
**Problem:**
- Brak prognoz przychodów
- Brak analizy trendów
- Brak raportów miesięcznych/rocznych

**Potrzeba:**
- Moduł prognoz
- Wykresy przychodów/kosztów
- Export do Excel/PDF

### 6. **KONTROLA BILANSÓW** 🟢 NICE-TO-HAVE
**Problem:**
- Ręczne sprawdzanie czy się zgadza
- Brak auto-weryfikacji

**Potrzeba:**
- Auto-kontrola: przychody - koszty = zysk
- Alerty przy rozbieżnościach
- Reconciliation report

---

## 🎯 PLAN ROZBUDOWY:

### ETAP 1: PŁATNOŚCI RATALNE (2-3h) 🔥 PRIORYTET
**Co zrobić:**
1. Tabela `payment_installments`
   - payment_id (główna płatność)
   - installment_number (1, 2, 3...)
   - amount (kwota raty)
   - due_date (termin)
   - status (pending/paid/overdue)
   - paid_at

2. Formularz "Wystaw fakturę z ratami"
   - Kwota: 5000 PLN
   - Liczba rat: 10
   - Częstotliwość: miesięcznie
   - Data pierwszej raty: 2025-12-01
   → System auto-generuje 10 rat po 500 PLN

3. Widok harmonogramu rat (dla mecenasa)
   - Tabela: Rata 1/10 - 500 PLN - 01.12.2025 - ⏳ Oczekuje
   - Przycisk "Oznacz jako opłaconą"

4. Widok harmonogramu rat (dla klienta)
   - Portal klienta: "Moje raty"
   - Rata 1: 500 PLN - 01.12.2025 - Opłać teraz

**Czas:** 2-3 godziny

---

### ETAP 2: WSPÓŁPRACA Z KANCELARIAMI (1-2h)
**Co zrobić:**
1. Tabela `case_partnerships`
   - case_id
   - partner_name (nazwa kancelarii)
   - partner_nip
   - revenue_split_percent (% przychodów)
   - cost_split_percent (% kosztów)
   - settlement_status

2. Pole w sprawie: "☑ Współpraca z inną kancelarią"
   - Nazwa: Kancelaria XYZ
   - Podział: 60% my / 40% oni
   - Status rozliczenia: Nierozliczone

3. Raport rozliczeń:
   - Sprawa: CYW/JK/001
   - Przychód: 10000 PLN
   - Nasza część: 6000 PLN
   - Ich część: 4000 PLN
   - Do wypłaty: 4000 PLN

**Czas:** 1-2 godziny

---

### ETAP 3: DASHBOARD KONTROLI (2h)
**Co zrobić:**
1. Karta "Zaległości klientów"
   ```
   ┌────────────────────────────────┐
   │ ⚠️ ZALEGŁOŚCI                  │
   ├────────────────────────────────┤
   │ Jan Kowalski                   │
   │ Zaległość: 1500 PLN            │
   │ Dni opóźnienia: 15             │
   │ [💌 Wyślij przypomnienie]      │
   ├────────────────────────────────┤
   │ Anna Nowak                     │
   │ Zaległość: 500 PLN             │
   │ Dni opóźnienia: 3              │
   └────────────────────────────────┘
   ```

2. Harmonogram rat (wszystkie):
   ```
   ┌────────────────────────────────┐
   │ 📅 NADCHODZĄCE RATY            │
   ├────────────────────────────────┤
   │ 01.12.2025 - Jan K. - 500 PLN  │
   │ 05.12.2025 - Anna N. - 300 PLN │
   │ 10.12.2025 - Piotr L. - 1000PLN│
   └────────────────────────────────┘
   ```

3. Prognoza przychodów:
   ```
   ┌────────────────────────────────┐
   │ 📊 PROGNOZA GRUDZIEŃ 2025      │
   ├────────────────────────────────┤
   │ Raty: 15000 PLN                │
   │ Nowe sprawy: ~20000 PLN        │
   │ Razem: ~35000 PLN              │
   └────────────────────────────────┘
   ```

**Czas:** 2 godziny

---

### ETAP 4: AUTO PRZYPOMNIENIA (1-2h)
**Co zrobić:**
1. Skrypt CRON (backend/cron/payment-reminders.js)
   - Sprawdza co dzień o 9:00
   - Znajduje raty z terminem jutro
   - Wysyła email: "Przypomnienie: rata 500 PLN jutro"

2. Skrypt dla zaległości:
   - Sprawdza co dzień
   - Znajdzie zaległości > 3 dni
   - Wysyła email: "Zaległość: 500 PLN - proszę o wpłatę"

3. Ustawienia przypominań (admin):
   - ☑ Wyślij 3 dni przed terminem
   - ☑ Wyślij w dniu terminu
   - ☑ Wyślij 3 dni po terminie

**Czas:** 1-2 godziny

---

### ETAP 5: PLANOWANIE BUDŻETU (1-2h)
**Co zrobić:**
1. Moduł prognoz:
   - Miesięczny przychód średni (ostatnie 3 miesiące)
   - Prognozy na 3/6/12 miesięcy
   - Wykres trendu

2. Raporty:
   - Raport miesięczny (PDF)
   - Przychody vs koszty
   - Top klienci
   - Export do Excel

**Czas:** 1-2 godziny

---

## 💡 PRZYKŁADOWY PRZEPŁYW:

### Scenariusz 1: UPADŁOŚĆ KONSUMENCKA (RATALNA)
```
1. Mecenas tworzy sprawę: Upadłość Jan Kowalski
   ↓
2. Wystaw fakturę:
   - Kwota: 6000 PLN
   - Typ: Ratalna
   - Liczba rat: 12
   - Częstotliwość: miesięcznie
   - Data pierwszej raty: 01.12.2025
   ↓
3. System generuje:
   - 12 rat po 500 PLN
   - Terminy: 01.12, 01.01, 01.02...
   ↓
4. Klient widzi w portalu:
   - Harmonogram 12 rat
   - Następna rata: 01.12.2025 - 500 PLN
   - [Opłać teraz] BLIK/Karta
   ↓
5. System automatycznie:
   - 28.11.2025: Email "Przypomnienie - rata za 3 dni"
   - 01.12.2025: Email "Dzisiaj termin raty"
   - 04.12.2025: Email "Zaległość - proszę o wpłatę"
   ↓
6. Dashboard mecenasa:
   - ✓ Rata 1/12 opłacona 01.12.2025
   - ⏳ Rata 2/12 oczekuje 01.01.2026
   - Łącznie zapłacone: 500/6000 PLN (8%)
```

---

### Scenariusz 2: SPRAWA Z INNĄ KANCELARIĄ
```
1. Mecenas tworzy sprawę: Sprawa X z Kancelarią ABC
   ↓
2. Zaznacza: ☑ Współpraca z kancelarią
   - Nazwa: Kancelaria ABC
   - Podział: 70% my / 30% oni
   ↓
3. Wystaw fakturę: 10000 PLN
   ↓
4. System automatycznie dzieli:
   - Nasz przychód: 7000 PLN
   - Ich przychód: 3000 PLN
   ↓
5. Raport rozliczeń:
   - Sprawa X: Do wypłaty dla ABC: 3000 PLN
   - Status: Nierozliczone
   - [Oznacz jako rozliczone]
```

---

## 🔢 WERYFIKACJA BILANSU:

### Auto-kontrola codziennie:
```javascript
// Przychody
const revenues = 
  + suma płatności (status=paid)
  + suma faktur sprzedażowych (payment_status=paid)
  + saldo PREPAID (doładowania)

// Koszty
const costs = 
  + suma wydatków (payment_status=paid)
  + suma faktur kosztowych (payment_status=paid)
  + suma pensji (payment_status=paid)

// Bilans
const balance = revenues - costs

// Weryfikacja
if (balance !== expected_balance) {
  ALERT: "Rozbieżność w bilansie! Sprawdź transakcje."
}
```

---

## 📊 DASHBOARD - NOWY WIDOK:

```
┌──────────────────────────────────────────────────────┐
│ 💰 DASHBOARD FINANSOWY PRO                           │
├──────────────────────────────────────────────────────┤
│                                                       │
│ [PRZYCHODY: 85000 PLN] [KOSZTY: 45000 PLN]          │
│ [ZYSK: 40000 PLN] [MARŻA: 47%]                      │
│                                                       │
├──────────────────────────────────────────────────────┤
│ ⚠️ ZALEGŁOŚCI (3 klientów)         [Pokaż wszystkie]│
│ Jan Kowalski - 1500 PLN (15 dni)  [Wyślij email]   │
│ Anna Nowak - 500 PLN (3 dni)      [Wyślij email]   │
├──────────────────────────────────────────────────────┤
│ 📅 NADCHODZĄCE RATY (10 sztuk)    [Harmonogram]     │
│ 01.12 - 3 raty - 1500 PLN                           │
│ 05.12 - 2 raty - 800 PLN                            │
│ 10.12 - 5 rat - 3500 PLN                            │
├──────────────────────────────────────────────────────┤
│ 📊 PROGNOZA GRUDZIEŃ 2025                            │
│ Raty oczekiwane: 15000 PLN                           │
│ Nowe faktury: ~20000 PLN                             │
│ Razem: ~35000 PLN                                    │
├──────────────────────────────────────────────────────┤
│ 🤝 ROZLICZENIA Z KANCELARIAMI                        │
│ Kancelaria ABC - Do wypłaty: 3000 PLN [Rozlicz]    │
│ Kancelaria XYZ - Do otrzymania: 5000 PLN            │
└──────────────────────────────────────────────────────┘
```

---

## ✅ PODSUMOWANIE:

### Co mamy (działa):
- ✅ Płatności jednorazowe
- ✅ System PREPAID
- ✅ Faktury VAT
- ✅ Rejestracja kosztów
- ✅ Pensje
- ✅ Integracja KSeF

### Co dodać (MUST-HAVE):
- 🔴 Płatności ratalne (KRYTYCZNE)
- 🔴 Współpraca z kancelariami (KRYTYCZNE)
- 🟡 Dashboard kontroli płatności
- 🟡 Auto przypomnienia
- 🟡 Planowanie budżetu
- 🟢 Weryfikacja bilansu

### Czas realizacji:
- **ETAP 1 (Raty):** 2-3h 🔥
- **ETAP 2 (Kancelarie):** 1-2h
- **ETAP 3 (Dashboard):** 2h
- **ETAP 4 (Przypomnienia):** 1-2h
- **ETAP 5 (Budżet):** 1-2h
- **RAZEM:** 7-10 godzin

---

## 🚀 REKOMENDACJA:

**Zacznij od ETAPU 1 - PŁATNOŚCI RATALNE**

To najbardziej krytyczna funkcja bo:
- ✅ Sprawy trwają latami (upadłości)
- ✅ Klienci płacą miesięcznie
- ✅ Musisz kontrolować zaległości
- ✅ Musisz planować przychody

**Jak tylko zatwierdzisz - zaczynam implementację!** 💪

