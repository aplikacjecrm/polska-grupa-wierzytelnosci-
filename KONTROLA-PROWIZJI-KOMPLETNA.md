# 💰 KOMPLETNA KONTROLA PROWIZJI - DOKUMENTACJA

## 🎯 ZAIMPLEMENTOWANO:

### ✅ 1. CHECKBOX - Nalicz prowizję?
- ☑️ Zaznaczony (domyślnie) = prowizja TAK
- ☐ Odznaczony = prowizja NIE (opłata bez prowizji)

### ✅ 2. CUSTOM STAWKA - Ile %?
- Puste = Auto (Mecenas 15%, Opiekun sprawy 10%, Opiekun klienta 5%)
- Wpisane (np. 20%) = wszystkie prowizje z tą stawką

### ✅ 3. WYBÓR ODBIORCY - Kto dostaje?
- **Auto** = wszyscy (mecenas + opiekunowie)
- **Tylko mecenas** = prowizja tylko dla mecenasa
- **Tylko opiekun sprawy** = prowizja tylko dla opiekuna sprawy
- **Tylko opiekun klienta** = prowizja tylko dla opiekuna klienta

### ✅ 4. SYSTEM ZATWIERDZANIA
- Każda prowizja → status PENDING
- Admin/Finance → zatwierdza lub odrzuca
- Tylko zatwierdzone → można wypłacić

---

## 📋 FORMULARZ PŁATNOŚCI (FRONTEND)

```html
<!-- KONTROLA PROWIZJI -->
<div class="form-group" style="border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 20px;">
    <label>
        <input type="checkbox" id="enableCommission" name="enable_commission" checked onchange="paymentsModule.toggleCommission()">
        💰 Nalicz prowizję dla tej płatności
    </label>
    <small>Prowizja dla mecenasa/opiekuna (odznacz jeśli to opłata urzędowa, koszty sądowe itp.)</small>
</div>

<!-- Pola prowizji (widoczne gdy checkbox zaznaczony) -->
<div id="commissionFields" style="...">
    <!-- Stawka prowizji -->
    <div class="form-group">
        <label>Stawka prowizji (%) *</label>
        <input type="number" name="commission_rate_override" step="0.01" min="0" max="100" placeholder="Auto (wg. roli)">
        <small>💡 Pozostaw puste dla automatycznej stawki: Mecenas 15%, Opiekun sprawy 10%, Opiekun klienta 5%</small>
    </div>
    
    <!-- Odbiorca prowizji -->
    <div class="form-group">
        <label>Kto dostaje prowizję?</label>
        <select name="commission_recipient_override">
            <option value="">Auto (mecenas + opiekunowie)</option>
            <option value="lawyer_only">Tylko mecenas</option>
            <option value="case_manager_only">Tylko opiekun sprawy</option>
            <option value="client_manager_only">Tylko opiekun klienta</option>
        </select>
        <small>✨ Domyślnie prowizje trafiają do mecenasa oraz wszystkich przypisanych opiekunów</small>
    </div>

    <div style="background: #dbeafe; padding: 10px; border-radius: 4px;">
        <strong>ℹ️ System automatyczny:</strong><br>
        • Mecenas sprawy → 15% prowizji<br>
        • Opiekun sprawy → 10% prowizji<br>
        • Opiekun klienta → 5% prowizji<br>
        <br>
        <strong>⚠️ Zatwierdzenie przez Admin:</strong><br>
        Wszystkie prowizje wymagają zatwierdzenia w Finance Dashboard przed wypłatą.
    </div>
</div>
```

---

## 🔧 BACKEND (payments.js)

### Tworzenie płatności:
```javascript
POST /api/payments

Body:
{
  "amount": 1000,
  "payment_type": "invoice",
  // ... inne pola
  
  // KONTROLA PROWIZJI:
  "enable_commission": 1,                    // 0 = NIE, 1 = TAK
  "commission_rate_override": 20.0,          // null = auto, liczba = custom %
  "commission_recipient_override": null      // null = wszyscy, 'lawyer_only', 'case_manager_only', 'client_manager_only'
}
```

### Tabela payments:
```sql
enable_commission INTEGER DEFAULT 1
commission_rate_override DECIMAL(5,2)
commission_recipient_override VARCHAR(50)
```

### Logika wyliczania prowizji:
```javascript
async function calculateCommissionsForPayment(db, paymentId, caseId, clientId, amount) {
    // 1. SPRAWDŹ CZY PROWIZJA WŁĄCZONA
    const payment = await db.get('SELECT enable_commission, commission_rate_override, commission_recipient_override FROM payments WHERE id = ?', [paymentId]);
    
    if (payment.enable_commission === 0) {
        console.log('⏭️ Prowizja wyłączona - pomijam');
        return []; // NIE TWORZY PROWIZJI!
    }
    
    const recipientOverride = payment.commission_recipient_override;
    
    // 2. PROWIZJA DLA MECENASA (jeśli nie ma override LUB lawyer_only)
    if (!recipientOverride || recipientOverride === 'lawyer_only') {
        let lawyerRate;
        if (payment.commission_rate_override) {
            lawyerRate = { commission_type: 'percentage', commission_value: payment.commission_rate_override };
        } else {
            lawyerRate = await getCommissionRate(db, lawyerId, 'lawyer', caseId);
        }
        // ... twórz prowizję
    }
    
    // 3. PROWIZJA DLA OPIEKUNA SPRAWY (jeśli nie ma override LUB case_manager_only)
    if (!recipientOverride || recipientOverride === 'case_manager_only') {
        // ... custom stawka lub auto
    }
    
    // 4. PROWIZJA DLA OPIEKUNA KLIENTA (jeśli nie ma override LUB client_manager_only)
    if (!recipientOverride || recipientOverride === 'client_manager_only') {
        // ... custom stawka lub auto
    }
}
```

---

## 📊 PRZYKŁADY UŻYCIA:

### ✅ PRZYKŁAD 1: Opłata urzędowa (BEZ prowizji)
```
✔️ Płatność: 500 PLN
☐ Nalicz prowizję
→ enable_commission = 0
→ BRAK prowizji
```

### ✅ PRZYKŁAD 2: Normalna płatność (AUTO prowizje)
```
✔️ Płatność: 10000 PLN
☑️ Nalicz prowizję
Stawka: [Pusta - Auto]
Odbiorca: [Auto - wszyscy]

→ Mecenas: 10000 * 15% = 1500 PLN (PENDING)
→ Opiekun sprawy: 10000 * 10% = 1000 PLN (PENDING)
→ Opiekun klienta: 10000 * 5% = 500 PLN (PENDING)
```

### ✅ PRZYKŁAD 3: Custom stawka 20% dla wszystkich
```
✔️ Płatność: 10000 PLN
☑️ Nalicz prowizję
Stawka: 20%
Odbiorca: [Auto - wszyscy]

→ Mecenas: 10000 * 20% = 2000 PLN (PENDING)
→ Opiekun sprawy: 10000 * 20% = 2000 PLN (PENDING)
→ Opiekun klienta: 10000 * 20% = 2000 PLN (PENDING)
```

### ✅ PRZYKŁAD 4: Tylko mecenas, 25%
```
✔️ Płatność: 10000 PLN
☑️ Nalicz prowizję
Stawka: 25%
Odbiorca: Tylko mecenas

→ Mecenas: 10000 * 25% = 2500 PLN (PENDING)
→ Opiekun sprawy: BRAK
→ Opiekun klienta: BRAK
```

### ✅ PRZYKŁAD 5: Tylko opiekun sprawy, auto stawka
```
✔️ Płatność: 10000 PLN
☑️ Nalicz prowizję
Stawka: [Pusta - Auto]
Odbiorca: Tylko opiekun sprawy

→ Mecenas: BRAK
→ Opiekun sprawy: 10000 * 10% = 1000 PLN (PENDING)
→ Opiekun klienta: BRAK
```

---

## 🔄 PRZEPŁYW KOMPLETNY:

```
┌─────────────────────────────────────────────────┐
│ 1. UŻYTKOWNIK TWORZY PŁATNOŚĆ                  │
│    - Kwota: 10000 PLN                          │
│    - ☑️ Nalicz prowizję                        │
│    - Stawka: 20% (custom)                      │
│    - Odbiorca: Auto                            │
│    ↓                                            │
│ 2. BACKEND TWORZY PŁATNOŚĆ                     │
│    - enable_commission = 1                     │
│    - commission_rate_override = 20.0           │
│    - commission_recipient_override = null      │
│    ↓                                            │
│ 3. PŁATNOŚĆ OPŁACONA                           │
│    - Automatyczne wywołanie:                   │
│      calculateCommissionsForPayment()          │
│    ↓                                            │
│ 4. BACKEND SPRAWDZA USTAWIENIA                 │
│    - enable_commission = 1 ✅ (włączona)       │
│    - commission_rate_override = 20% ✅ (custom)│
│    - recipient_override = null ✅ (wszyscy)    │
│    ↓                                            │
│ 5. TWORZY PROWIZJE (status=PENDING)            │
│    - Mecenas: 2000 PLN (20%) PENDING 🟡        │
│    - Opiekun sprawy: 2000 PLN (20%) PENDING 🟡 │
│    - Opiekun klienta: 2000 PLN (20%) PENDING 🟡│
│    ↓                                            │
│ 6. ADMIN OTWIERA FINANCE DASHBOARD             │
│    - Zakładka "🟡 Oczekujące"                  │
│    - Widzi 3 prowizje do zatwierdzenia         │
│    ↓                                            │
│ 7. ADMIN ZATWIERDZA                            │
│    - Klik [✅ Zatwierdź] na każdej prowizji    │
│    - Status: PENDING → APPROVED ✅             │
│    ↓                                            │
│ 8. ADMIN WYPŁACA                               │
│    - Zakładka "✅ Zatwierdzone"                │
│    - Klik [💰 Wypłać]                          │
│    - Status: APPROVED → PAID 💰                │
└─────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST FUNKCJONALNOŚCI:

### FRONTEND:
- [x] Checkbox "Nalicz prowizję"
- [x] Input custom stawki (%)
- [x] Select wyboru odbiorcy
- [x] Metoda `toggleCommission()` do pokazywania/ukrywania pól
- [x] Wysyłanie danych do backendu

### BACKEND:
- [x] Kolumny w tabeli `payments`: `enable_commission`, `commission_rate_override`, `commission_recipient_override`
- [x] Przyjmowanie parametrów w `POST /api/payments`
- [x] Sprawdzanie `enable_commission` przed tworzeniem prowizji
- [x] Obsługa custom stawki `commission_rate_override`
- [x] Obsługa wyboru odbiorcy `commission_recipient_override`
- [x] Logika filtrowania odbiorców (lawyer_only, case_manager_only, client_manager_only)

### SYSTEM ZATWIERDZANIA:
- [x] Prowizje tworzone jako PENDING
- [x] Endpoint `/api/commissions/:id/approve`
- [x] Endpoint `/api/commissions/:id/reject`
- [x] Endpoint `/api/commissions/:id/pay` (tylko approved)
- [x] Frontend z zakładkami statusów
- [x] Dynamiczne przyciski według statusu

---

## 🎉 PODSUMOWANIE:

**KOMPLETNY SYSTEM KONTROLI PROWIZJI:**

1. ✅ **Włącz/Wyłącz** - checkbox (opłaty bez prowizji)
2. ✅ **Custom stawka** - dowolny % (promocje, specjalne umowy)
3. ✅ **Wybór odbiorcy** - tylko mecenas / tylko opiekun / wszyscy
4. ✅ **Auto stawki** - domyślne: Mecenas 15%, Opiekun sprawy 10%, Opiekun klienta 5%
5. ✅ **System zatwierdzania** - wszystkie prowizje pending → admin zatwierdza → wypłaca

**ELASTYCZNOŚĆ:**
- Opłaty urzędowe → checkbox OFF → brak prowizji
- Normalne płatności → auto stawki
- Specjalne umowy → custom stawka + wybór odbiorcy
- Pełna kontrola Admin/Finance

---

**Data:** 24.11.2025, 19:10
**Status:** ✅ PRODUCTION READY - KOMPLETNY SYSTEM!
