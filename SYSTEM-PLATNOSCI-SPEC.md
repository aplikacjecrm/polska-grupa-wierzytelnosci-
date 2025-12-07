# 💳 SYSTEM PŁATNOŚCI RATALNYCH + DASHBOARDY - SPECYFIKACJA

## 📊 MODUŁ 1: SYSTEM PŁATNOŚCI RATALNYCH

### Baza danych - Płatności

```sql
-- SUBKONTA KLIENTÓW (PORTFELE)
CREATE TABLE client_wallets (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'PLN',
  overdraft_limit DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- PLANY RATALNYCH PŁATNOŚCI
CREATE TABLE payment_plans (
  id INTEGER PRIMARY KEY,
  case_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2),
  installment_amount DECIMAL(10,2),
  installment_count INTEGER,
  paid_installments INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  start_date DATE,
  next_payment_date DATE,
  status TEXT DEFAULT 'active',
  auto_payment BOOLEAN DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- HARMONOGRAM RAT
CREATE TABLE installments (
  id INTEGER PRIMARY KEY,
  payment_plan_id INTEGER NOT NULL,
  installment_number INTEGER,
  amount DECIMAL(10,2),
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  is_overdue BOOLEAN DEFAULT 0,
  days_overdue INTEGER DEFAULT 0,
  late_fee DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(id)
);

-- TRANSAKCJE PŁATNOŚCI
CREATE TABLE payment_transactions (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  case_id INTEGER,
  installment_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  provider TEXT,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  paid_at DATETIME,
  description TEXT,
  metadata TEXT,
  created_at DATETIME,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (installment_id) REFERENCES installments(id)
);

-- METODY PŁATNOŚCI KLIENTA
CREATE TABLE client_payment_methods (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  method_type TEXT,
  provider TEXT,
  provider_customer_id TEXT,
  is_default BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  last_used DATETIME,
  created_at DATETIME,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- PRZYPOMNIENIA O PŁATNOŚCIACH
CREATE TABLE payment_reminders (
  id INTEGER PRIMARY KEY,
  installment_id INTEGER NOT NULL,
  reminder_type TEXT,
  sent_at DATETIME,
  status TEXT,
  FOREIGN KEY (installment_id) REFERENCES installments(id)
);
```

### Backend API

```javascript
// PORTFEL KLIENTA
GET    /api/wallet/client/:id              // Saldo i historia
POST   /api/wallet/client/:id/topup        // Doładuj portfel
GET    /api/wallet/client/:id/transactions // Historia transakcji

// PLANY RATALNE
POST   /api/payment-plans                  // Utwórz plan
GET    /api/payment-plans/case/:id         // Plany dla sprawy
GET    /api/payment-plans/client/:id       // Plany klienta
PUT    /api/payment-plans/:id              // Edytuj plan
DELETE /api/payment-plans/:id              // Anuluj plan
GET    /api/payment-plans/:id/schedule     // Harmonogram rat

// RATY
GET    /api/installments/upcoming          // Nadchodzące raty
GET    /api/installments/overdue           // Zaległe raty
POST   /api/installments/:id/pay           // Opłać ratę
POST   /api/installments/:id/postpone      // Przełóż termin

// PŁATNOŚCI ONLINE
POST   /api/payments/paypal/create         // Inicjuj PayPal
POST   /api/payments/paypal/capture        // Potwierdź PayPal
POST   /api/payments/blik/initiate         // Inicjuj BLIK
GET    /api/payments/blik/status/:id       // Status BLIK
POST   /api/payments/card                  // Płatność kartą
GET    /api/payments/methods               // Zapisane metody

// PRZYPOMNIENIA
GET    /api/reminders/pending              // Do wysłania
POST   /api/reminders/send                 // Wyślij przypomnienie
GET    /api/reminders/client/:id           // Historia przypomnień
```

### Dashboard Klienta - Moduł Płatności

```
┌─────────────────────────────────────────────────────┐
│ 💳 MOJE PŁATNOŚCI                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 💰 PORTFEL KLIENTA                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Stan konta:  2,500.00 PLN                       │ │
│ │ Do zapłaty:  1,200.00 PLN                       │ │
│ │ Zaległości:    300.00 PLN ⚠️                    │ │
│ │                                                 │ │
│ │ [💵 Doładuj portfel] [📊 Historia]              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 📅 NADCHODZĄCE RATY                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Sprawa: CYW/JK/001                              │ │
│ │ Rata 3/12: 500.00 PLN                           │ │
│ │ Termin: 15.11.2025 (za 3 dni)                   │ │
│ │ [💳 Zapłać teraz] [📅 Przełóż]                  │ │
│ │                                                 │ │
│ │ Sprawa: CYW/JK/002                              │ │
│ │ Rata 1/6: 200.00 PLN                            │ │
│ │ Termin: 20.11.2025                              │ │
│ │ [💳 Zapłać teraz]                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ⚠️ ZALEGŁOŚCI                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Sprawa: CYW/JK/003                              │ │
│ │ Rata 2/10: 300.00 PLN                           │ │
│ │ Przeterminowanie: 5 dni                         │ │
│ │ Opłata karna: 15.00 PLN                         │ │
│ │ [💳 Zapłać 315.00 PLN]                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 💳 METODY PŁATNOŚCI                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [PayPal] [BLIK] [Karta] [Przelew]              │ │
│ │                                                 │ │
│ │ Wybierz metodę płatności:                       │ │
│ │ ○ PayPal (*****@gmail.com)                      │ │
│ │ ○ BLIK (kod z aplikacji banku)                  │ │
│ │ ○ Karta **** 1234 💳 (domyślna)                 │ │
│ │ ○ Przelew tradycyjny                            │ │
│ │                                                 │ │
│ │ [➕ Dodaj nową metodę]                           │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 📊 MODUŁ 2: DASHBOARD MECENASA

```
┌─────────────────────────────────────────────────────┐
│ ⚖️ DASHBOARD MECENASA - Jan Kowalski (JK)          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 MOJE STATYSTYKI                                  │
│ ┌────────┬────────┬────────┬────────┐              │
│ │   25   │   18   │    7   │   3    │              │
│ │ Sprawy │ Aktywn.│ Wygrał.│ Klienc.│              │
│ └────────┴────────┴────────┴────────┘              │
│                                                     │
│ 🔥 PILNE DZISIAJ                                    │
│ • 10:00 - Rozprawa CYW/JK/003                       │
│ • 14:00 - Konsultacja z klientem                    │
│ • 16:00 - Termin złożenia dokumentów ⚠️             │
│                                                     │
│ 📅 NAJBLIŻSZE WYDARZENIA (7 DNI)                    │
│ 15.11 - Rozprawa CYW/JK/005                         │
│ 16.11 - Mediacja CYW/JK/007                         │
│ 18.11 - Deadline dokumenty ⚠️                       │
│                                                     │
│ 💰 PŁATNOŚCI - WYMAGANA UWAGA                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ⚠️ 3 klientów z zaległościami                    │ │
│ │ • Jan Kowalski - 300 PLN (5 dni)                │ │
│ │ • Anna Nowak - 500 PLN (12 dni)                 │ │
│ │ • Piotr Lewandowski - 200 PLN (3 dni)           │ │
│ │ [📧 Wyślij przypomnienia]                        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 📋 MOJE SPRAWY (SZYBKI DOSTĘP)                      │
│ • CYW/JK/001 - Odszkodowanie (W toku)               │
│ • CYW/JK/003 - Rozwód (Rozprawa dziś!)              │
│ • KAR/JK/005 - Kradzież (Nowa)                      │
│                                                     │
│ 📊 WYKRES WYDAJNOŚCI (30 DNI)                       │
│ [Wykres liniowy - sprawy zamknięte/miesiąc]        │
│                                                     │
│ [➕ Nowa sprawa] [📅 Kalendarz] [📊 Raporty]        │
└─────────────────────────────────────────────────────┘
```

## 📊 MODUŁ 3: DASHBOARD OPIEKUNA SPRAWY

```
┌─────────────────────────────────────────────────────┐
│ 📋 DASHBOARD OPIEKUNA - Maria Kowalczyk (MK)       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 MOJE ZADANIA                                     │
│ ┌────────┬────────┬────────┬────────┐              │
│ │   42   │   15   │   27   │   8    │              │
│ │ Sprawy │ Pilne  │Dokumen.│ Termin.│              │
│ └────────┴────────┴────────┴────────┘              │
│                                                     │
│ ✅ DO ZROBIENIA DZISIAJ                             │
│ • Przygotuj dokumenty CYW/JK/003                    │
│ • Umów spotkanie z klientem CYW/AN/005              │
│ • Wyślij fakturę CYW/TW/007                         │
│ • Zadzwoń do sądu CYW/JK/001                        │
│                                                     │
│ 📧 KOMUNIKACJA Z KLIENTAMI                          │
│ • 3 nowe wiadomości                                 │
│ • 2 dokumenty do sprawdzenia                        │
│ • 1 prośba o informację                             │
│                                                     │
│ 📄 DOKUMENTY DO WYSŁANIA                            │
│ • Pozew - CYW/JK/003 (dziś!)                        │
│ • Odpowiedź - CYW/AN/005 (jutro)                    │
│                                                     │
│ 💰 PŁATNOŚCI - MONITOROWANIE                        │
│ • 5 przypomnień do wysłania                         │
│ • 2 faktury do wystawienia                          │
│ • 3 płatności oczekujące                            │
│                                                     │
│ [📅 Harmonogram] [📊 Raporty] [📧 Wiadomości]       │
└─────────────────────────────────────────────────────┘
```

## 💳 INTEGRACJE PŁATNOŚCI

### PayPal Integration
```javascript
// Config
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx
PAYPAL_MODE=sandbox  // lub live

// Flow
1. Klient wybiera PayPal
2. Backend tworzy Order (/api/payments/paypal/create)
3. Redirect do PayPal
4. Callback → Capture (/api/payments/paypal/capture)
5. Update status w bazie
6. Email potwierdzenia
```

### BLIK Integration
```javascript
// Config  
BLIK_MERCHANT_ID=xxx
BLIK_API_KEY=xxx
BLIK_API_URL=https://api.blik.pl

// Flow
1. Klient podaje kod BLIK (6 cyfr)
2. Backend inicjuje transakcję
3. Polling status co 2s (max 2 min)
4. Akceptacja w aplikacji bankowej
5. Potwierdzenie → Update bazy
6. Email potwierdzenia
```

### Karta (Stripe/PayU)
```javascript
// Stripe recommended
STRIPE_PUBLIC_KEY=xxx
STRIPE_SECRET_KEY=xxx

// Flow standardowy Stripe
```

## 🔔 SYSTEM PRZYPOMNIEŃ

### Auto-przypomnienia
- **7 dni przed** - email + SMS
- **3 dni przed** - email  
- **1 dzień przed** - email + SMS
- **W dniu płatności** - email
- **1 dzień po** - email ostrzeżenie
- **3 dni po** - email + SMS + opłata karna
- **7 dni po** - telefon od opiekuna

### Szablon email
```
Temat: Przypomnienie o płatności - Sprawa CYW/JK/001

Szanowny Kliencie,

Przypominamy o zbliżającym się terminie płatności:

Sprawa: CYW/JK/001 - Odszkodowanie za wypadek
Rata: 3/12
Kwota: 500.00 PLN
Termin: 15.11.2025

Zapłać online: [LINK DO PŁATNOŚCI]

Pozdrawiamy,
Kancelaria Pro Meritum
```

## 📊 FUNKCJE ZAAWANSOWANE

### 1. Elastyczne raty
- Klient wybiera wysokość raty
- Minimalna rata: 10% całości
- Auto-split na równe raty
- Możliwość wcześniejszej spłaty

### 2. Portfel cyfrowy
- Doładowanie salda
- Automatyczne pobieranie rat
- Bonus za terminowość
- Cashback za polecenia

### 3. Analityka płatności
- Wskaźnik terminowości klienta
- Scoring kredytowy wewnętrzny
- Predykcja zaległości (ML)
- Rekomendacja planu ratalnego

### 4. Faktury automatyczne
- Auto-generowanie po płatności
- Wysyłka email
- Integracja z KSeF
- Archiwizacja

---

**Status:** ✅ Gotowe do implementacji  
**Priorytet:** 🔥 KRYTYCZNY  
**Czas:** 3-4 tygodnie
