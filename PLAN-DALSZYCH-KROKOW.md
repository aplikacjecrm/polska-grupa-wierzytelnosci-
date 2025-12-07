# 📋 PLAN DALSZYCH KROKÓW - CRM PRO MERITUM

## ✅ **ZROBIONE (TERAZ):**

1. ✅ **Zadania - filtr użytkowników**
   - Tylko Mecenas prowadzący
   - Dodatkowy opiekun (jeśli jest)
   - Recepcja
   - Bez niepotrzebnych osób

2. ✅ **Banner "Przejmij sprawę"**
   - Pokazuje się TYLKO gdy `!assigned_to` (brak mecenasa)
   - Gdy sprawa MA mecenasa - banner nie pojawia się

3. ✅ **Formularz "Nowa sprawa"**
   - Opiekun klienta (readonly, z danych klienta)
   - Mecenas prowadzący (wymagany)
   - Dodatkowy opiekun sprawy (opcjonalny)

---

## 🔨 **DO ZROBIENIA W NAJBLIŻSZYM CZASIE:**

### 1. **Przycisk "Oddaj sprawę"** (priorytet: WYSOKI)
**Lokalizacja:** W "Szybkich akcjach" na dole szczegółów sprawy
**Warunek:** Pokazać TYLKO jeśli zalogowany użytkownik jest mecenasem prowadzącym
**Akcja:** Zmiana `assigned_to` na NULL, zmiana statusu na "open"

**Plik:** `frontend/scripts/crm-case-tabs.js` lub `crm-clean.js`
**Co zrobić:**
```javascript
// W sekcji "Szybkie akcje" dodać:
${currentUser.id === caseData.assigned_to ? `
    <button onclick="window.crmManager.releaseCase(${caseId})" style="...">
        🔄 Oddaj sprawę
    </button>
` : ''}

// Dodać funkcję:
window.crmManager.releaseCase = async function(caseId) {
    await window.api.request(`/cases/${caseId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            assigned_to: null,
            status: 'open'
        })
    });
    // Odśwież widok
    location.reload();
}
```

---

### 2. **Generowanie unikalnych numerów** (priorytet: WYSOKI)
**Problem:** Numer sprawy nie jest generowany unikalnie
**Wymagania:**
- Format: `[PREFIX]/[INICJAŁY_KLIENTA]/[NUMER_SEKWENCYJNY]`
- Przykład: `SPA/JK/001`, `UMO/TN/003`
- Prefix według typu sprawy (z `case-type-config.js`)
- Inicjały z imienia+nazwiska klienta (2-3 litery)
- Numer sekwencyjny (3 cyfry, reset co rok lub ciągły)

**Co sprawdzić:**
1. Backend: `backend/routes/cases.js` - endpoint `/generate-number`
2. Czy frontend wysyła `client_id` i `case_type`?
3. Czy backend pobiera dane klienta i generuje numer?

---

### 3. **System płatności** (priorytet: ŚREDNI)
**Cel:** Integracja z systemem finansowym
**Funkcje:**
- Generowanie faktur dla klientów
- Śledzenie płatności (zapłacone/niezapłacone)
- Płatności online (PayPal/Stripe/Przelewy24)
- Historia transakcji klienta

**Komponenty:**
- `backend/routes/payments.js` - API płatności
- `frontend/modules/payments-module.js` - interfejs
- Integracja z Stripe/PayPal SDK
- Webhook'i do automatycznej aktualizacji statusu

---

### 4. **Raporty i statystyki** (priorytet: ŚREDNI)
**Rodzaje raportów:**
- **Raport klienta:**
  - Lista spraw klienta
  - Status każdej sprawy
  - Sumaryczne koszty
  - Dokumenty
  - Historia płatności
  
- **Raport mecenasa:**
  - Liczba prowadzonych spraw
  - Sprawy wg statusu
  - Najbliższe terminy
  - Zadania do wykonania
  
- **Raport opiekuna:**
  - Klienci pod opieką
  - Sprawy klientów
  - Zadania przypisane

**Technologia:**
- Backend: endpoint `/api/reports/:type`
- Frontend: `reports-module.js`
- Eksport do PDF (jsPDF/pdfmake)
- Eksport do Excel (SheetJS)

---

### 5. **Portal klienta** (priorytet: NISKI, długoterminowy)
**Cel:** Dostęp klienta do swoich spraw
**Funkcje:**
- Logowanie klienta (osobny login)
- Podgląd swoich spraw
- Dokumenty do pobrania
- Historia płatności
- Wiadomości z kancelarią
- Śledzenie statusu sprawy

**Bezpieczeństwo:**
- Osobna autentykacja dla klientów
- Ograniczony dostęp (tylko swoje sprawy)
- 2FA (opcjonalnie)

---

## 🎯 **PRIORYTET NA DZIŚ:**

1. ⏳ **Przycisk "Oddaj sprawę"** (15-30 min)
2. ⏳ **Sprawdzenie generowania numeru sprawy** (30-60 min)
3. ⏳ **Testy end-to-end** (dodanie klienta → sprawy → zadania → mecenas)

---

## 💡 **SUGESTIE TECHNICZNE:**

### A. **Backend - struktura API**
```
/api/payments
  GET  /client/:clientId - lista płatności klienta
  POST / - dodaj płatność
  PATCH /:id - aktualizuj status

/api/reports
  GET  /client/:clientId - raport klienta
  GET  /lawyer/:lawyerId - raport mecenasa
  GET  /caretaker/:caretakerId - raport opiekuna
  
/api/cases
  PATCH /:id/release - oddaj sprawę (assigned_to = NULL)
```

### B. **Frontend - moduły**
```
frontend/modules/
  payments-module.js - obsługa płatności
  reports-module.js - generowanie raportów
  client-portal.js - portal dla klientów
```

### C. **Baza danych - nowe tabele**
```sql
-- Płatności
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  client_id INTEGER,
  case_id INTEGER,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'PLN',
  status VARCHAR(20), -- 'pending', 'paid', 'overdue'
  payment_method VARCHAR(50),
  invoice_number VARCHAR(50),
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP
);

-- Faktury
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  payment_id INTEGER,
  invoice_number VARCHAR(50) UNIQUE,
  pdf_path VARCHAR(500),
  created_at TIMESTAMP
);
```

---

## 📊 **METRYKI SUKCESU:**

- [ ] Użytkownik może oddać sprawę jednym kliknięciem
- [ ] Każda sprawa ma unikalny numer
- [ ] Klient widzi swoje płatności
- [ ] Mecenas widzi raport swoich spraw
- [ ] System generuje faktury automatycznie

---

**Ostatnia aktualizacja:** 2025-11-12 17:55
**Wersja:** 1.0
