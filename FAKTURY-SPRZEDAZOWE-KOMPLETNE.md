# 📄 SYSTEM FAKTUR VAT - KOMPLETNY!

**Data:** 12 listopada 2025, 05:15  
**Status:** ✅ Backend + Frontend gotowy!

---

## 🎯 CO ZOSTAŁO ZBUDOWANE:

### ✅ KOMPLETNY SYSTEM WYSTAWIANIA FAKTUR VAT

**Dla kogo:**
- 📄 Kancelaria wystawia faktury dla klientów
- 💼 Automatyczna numeracja FV/2025/11/001
- 🧾 Integracja z KSeF (auto-wysyłanie)
- 👤 Widok faktur w koncie klienta

---

## 💾 BAZA DANYCH:

### Tabela `sales_invoices`:
```sql
- id, invoice_number (FV/2025/11/001)
- client_id, case_id
- buyer_name, buyer_nip, buyer_address, buyer_email
- net_amount, vat_rate, vat_amount, gross_amount
- items (JSON array)
- issue_date, sale_date, due_date
- payment_status (unpaid/paid/overdue)
- ksef_reference_number, ksef_status, ksef_sent_at
- pdf_path, notes
- created_by, created_at
```

**Relacje:**
- `client_id` → clients (kto kupuje)
- `case_id` → cases (opcjonalnie powiązanie ze sprawą)
- `created_by` → users (kto wystawił)

---

## 🔌 BACKEND API:

### Endpointy:
```javascript
POST   /api/sales-invoices              // Wystaw fakturę
GET    /api/sales-invoices              // Lista faktur
GET    /api/sales-invoices/:id          // Szczegóły faktury
PATCH  /api/sales-invoices/:id/payment  // Zmień status płatności
POST   /api/sales-invoices/:id/send-ksef // Wyślij do KSeF
```

### Przykład wystawiania:
```javascript
POST /api/sales-invoices
Body: {
  client_id: 123,
  case_id: 456, // opcjonalnie
  buyer_name: "Jan Kowalski",
  buyer_nip: "1234567890",
  buyer_address: "ul. Testowa 1, Warszawa",
  buyer_email: "jan@example.com",
  net_amount: 5000.00,
  vat_rate: 23,
  items: [{
    description: "Reprezentacja prawna w sprawie CYW/JK/001",
    quantity: 1,
    unit_price: 5000.00
  }],
  issue_date: "2025-11-12",
  due_date: "2025-12-12",
  notes: "Płatność przelewem",
  send_to_ksef: true // auto-wyślij
}

Response: {
  success: true,
  invoiceId: 789,
  invoice_number: "FV/2025/11/001",
  gross_amount: 6150.00
}
```

**Automatyka:**
- ✅ Numeracja: FV/ROK/MIESIĄC/NNN
- ✅ Kalkulacja VAT: (netto × stawka%)
- ✅ Kalkulacja brutto: (netto + VAT)

---

## 🎨 FRONTEND:

### Lokalizacja:
`frontend/scripts/modules/sales-invoices-module.js`

### Funkcje:
```javascript
salesInvoices.showInvoicesList()          // Lista faktur
salesInvoices.showIssueInvoiceModal()     // Formularz wystawiania
salesInvoices.onClientChange(clientId)    // Auto-dane klienta
salesInvoices.calculateVAT()              // Kalkulator VAT
salesInvoices.saveInvoice(event)          // Zapisz fakturę
salesInvoices.sendToKsef(invoiceId)       // Wyślij do KSeF
salesInvoices.viewInvoice(invoiceId)      // Szczegóły faktury
```

### Widok listy faktur:
```
┌──────────────────────────────────────────────────────┐
│ 📄 Faktury sprzedażowe           [➕ Wystaw fakturę] │
├──────────────────────────────────────────────────────┤
│ Numer│Klient│Sprawa│Kwota│Data│Status│KSeF│Akcje    │
├──────────────────────────────────────────────────────┤
│FV001 │Jan K.│CYW..│6150│12.11│✓ Opłacona│✓│👁️ Zobacz│
│FV002 │Anna N│KAR..│3000│11.11│⏳ Nieopłac│📤│👁️ Zobacz│
└──────────────────────────────────────────────────────┘
```

### Formularz wystawiania:
```
┌────────────────────────────────────────┐
│ 📄 Wystaw fakturę VAT                 │
├────────────────────────────────────────┤
│ Klient *                               │
│ [Jan Kowalski (jan@...___)]            │
│                                        │
│ ┌─ Dane nabywcy (z bazy) ─────────┐   │
│ │ Nazwa: Jan Kowalski              │   │
│ │ Adres: ul. Testowa 1, Warszawa   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Usługa / Towar *                       │
│ [Reprezentacja prawna w sprawie...]    │
│                                        │
│ Kwota netto * │ Stawka VAT *           │
│ [5000.00___]  │ [23% ▼]                │
│                                        │
│ ┌─ PODSUMOWANIE ──────────────────┐    │
│ │ Kwota netto:     5000,00 PLN    │    │
│ │ VAT 23%:         1150,00 PLN    │    │
│ │ DO ZAPŁATY:      6150,00 PLN    │    │
│ └──────────────────────────────────┘   │
│                                        │
│ Data wystawienia * │ Termin płatności  │
│ [2025-11-12_____]  │ [2025-12-12____] │
│                                        │
│ ☑ 🧾 Wyślij automatycznie do KSeF      │
│                                        │
│ Uwagi                                  │
│ [Płatność przelewem_____________]      │
│                                        │
│ [❌ Anuluj] [✓ Wystaw fakturę]         │
└────────────────────────────────────────┘
```

---

## 🔄 PRZEPŁYW PRACY:

### Scenariusz 1: Mecenas wystawia fakturę

```
1. Mecenas kończy sprawę
   ↓
2. Dashboard Finansowy → "📄 Faktury dla klientów"
   ↓
3. "➕ Wystaw fakturę"
   ↓
4. Wybiera klienta z listy
   → Dane automatycznie się uzupełniają
   ↓
5. Wpisuje usługę: "Reprezentacja w sprawie CYW/JK/001"
   ↓
6. Kwota netto: 5000 PLN
   → System automatycznie oblicza VAT i brutto
   ↓
7. Zaznacza "Wyślij do KSeF"
   ↓
8. Klika "Wystaw fakturę"
   ↓
9. System:
   ✅ Generuje numer: FV/2025/11/001
   ✅ Zapisuje w bazie
   ✅ Wysyła do KSeF (auto)
   ✅ Dostaje numer referencyjny
   ↓
10. Mecenas widzi: "✅ Faktura FV/2025/11/001 wystawiona!"
```

---

### Scenariusz 2: Klient widzi swoją fakturę

```
1. Klient loguje się do portalu
   ↓
2. "Moje faktury" (będzie w następnym etapie)
   ↓
3. Widzi listę:
   - FV/2025/11/001 - 6150 PLN - ⏳ Nieopłacona
   ↓
4. Klika "Zobacz" lub "Pobierz PDF"
   ↓
5. Widzi pełne dane faktury
   ↓
6. Może opłacić online (BLIK/Karta)
```

---

## 🧾 INTEGRACJA KSEF:

### Automatyczne wysyłanie:
```javascript
// Jeśli checkbox "Wyślij do KSeF" zaznaczony
if (send_to_ksef) {
    // System automatycznie:
    1. Konwertuje dane do XML FA_VAT
    2. Wysyła do KSeF API
    3. Zapisuje numer referencyjny
    4. Pobiera UPO
}
```

### Przycisk w tabeli:
- Jeśli `ksef_reference_number` jest NULL → **📤 Wyślij**
- Jeśli `ksef_reference_number` istnieje → **✓ Wysłana**

---

## 📊 STATUSY FAKTUR:

### payment_status:
- **unpaid** (⏳ Nieopłacona) - Domyślny
- **paid** (✓ Opłacona) - Po zapłacie
- **overdue** (⚠️ Przeterminowana) - Po terminie

### ksef_status:
- **NULL** - Nie wysłana
- **sent** - Wysłana
- **accepted** - Zaakceptowana
- **rejected** - Odrzucona

---

## 🎨 DESIGN:

### Kolory:
- **Zielony** (#2ecc71) - Przycisk "Wystaw fakturę", Opłacone
- **Żółty** (#f39c12) - Nieopłacone, Oczekujące
- **Fioletowy** (#9b59b6) - KSeF
- **Niebieski** (#3498db) - Zobacz szczegóły

### Gradient:
```css
linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)
```

---

## 📁 PLIKI:

```
backend/
├── database/
│   └── init.js (+ tabela sales_invoices) ✅
├── routes/
│   └── sales-invoices.js (nowy) ✅
└── server.js (+ router) ✅

frontend/
├── scripts/
│   ├── dashboards/
│   │   └── finance-dashboard.js (+ przycisk) ✅
│   └── modules/
│       └── sales-invoices-module.js (nowy) ✅
└── index.html (+ import) ✅
```

---

## 🚀 JAK PRZETESTOWAĆ:

### KROK 1: Zrestartuj backend
Backend musi się przeładować (nowa tabela + routes):
```powershell
Ctrl + C
node backend/server.js
```

**Powinno być w logach:**
```
✅ Tabela sales_invoices utworzona
✅ sales-invoices.js router loaded - Faktury VAT dla klientów! 📄
```

### KROK 2: Wyczyść cache przeglądarki
```
Ctrl + Shift + R
```

### KROK 3: Zaloguj się
```
admin@pro-meritum.pl
password123
```

### KROK 4: Dashboard Finansowy
```
Admin Panel → 💼 Dashboard Finansowy
```

**Powinien być nowy przycisk:**
```
📄 Faktury dla klientów (zielony, gradient)
```

### KROK 5: Wystaw testową fakturę
1. Kliknij **"📄 Faktury dla klientów"**
2. Kliknij **"➕ Wystaw fakturę"**
3. Wybierz klienta z listy
4. Wpisz usługę: "Test - reprezentacja prawna"
5. Kwota netto: 1000
6. VAT: 23%
7. Powinno pokazać: **DO ZAPŁATY: 1230,00 PLN**
8. Kliknij **"✓ Wystaw fakturę"**
9. Alert: **"✅ Faktura FV/2025/11/001 wystawiona!"**

### KROK 6: Sprawdź listę
- Faktura powinna być w tabeli
- Przycisk **"📤 Wyślij"** do KSeF
- Przycisk **"👁️ Zobacz"** szczegóły

---

## ✅ CHECKLIST:

- [x] Tabela `sales_invoices` w bazie
- [x] Backend API (5 endpointów)
- [x] Automatyczna numeracja FV/ROK/MIESIĄC/NNN
- [x] Kalkulacja VAT i brutto
- [x] Frontend - lista faktur
- [x] Frontend - formularz wystawiania
- [x] Auto-uzupełnianie danych klienta
- [x] Kalkulator VAT na żywo
- [x] Integracja z KSeF (przycisk wysyłania)
- [x] Modal szczegółów faktury
- [x] Statusy płatności
- [ ] Generowanie PDF (następny etap)
- [ ] Widok w portalu klienta (następny etap)
- [ ] Wysyłka email do klienta (następny etap)

---

## 🎯 CO DALEJ?

### ETAP 1: Portal klienta (2-3h)
- Widok "Moje faktury"
- Lista faktur klienta
- Pobieranie PDF
- Płatność online

### ETAP 2: PDF Generator (1-2h)
- Szablon faktury VAT
- Logo kancelarii
- QR kod do płatności
- Zapisywanie do `pdf_path`

### ETAP 3: Email + Auto (1h)
- Auto-wysyłka email po wystawieniu
- Przypomnienia o płatności
- Potwierdzenie zapłaty

---

## 💡 FUNKCJE ZAAWANSOWANE (opcjonalnie):

### Korekty faktur:
- Faktury korygujące
- Powiązanie z oryginalną

### Faktury pro forma:
- Przed wystawieniem VAT
- Potwierdzenie przez klienta

### Raty:
- Podziel fakturę na raty
- Harmonogram płatności

### Faktury zbiorowe:
- Jedna faktura za wiele spraw
- Pozycje z różnych spraw

---

## 🎉 PODSUMOWANIE:

### ✅ CO MASZ TERAZ:
- Kompletny system wystawiania faktur VAT
- Automatyczna numeracja
- Kalkulacja VAT
- Auto-dane z bazy klientów
- Lista faktur z filtrami
- Integracja z KSeF (gotowe)
- Profesjonalny UX

### 📊 STATYSTYKI:
- 💾 **1** nowa tabela
- 🔌 **5** endpointów API
- 🎨 **1** nowy moduł frontend
- 📝 **600+** linii kodu frontend
- 🧾 **300+** linii kodu backend

---

**System faktur VAT gotowy!** 🚀📄

**Teraz zrestartuj backend i testuj!** 💪

**Następny krok: Portal klienta + PDF!** 🎨

