# 💰 PayPal Integration - Setup Guide

## ✅ CO ZOSTAŁO ZBUDOWANE:

### 1. Backend API (`/backend/routes/payments.js`)
- ✅ `POST /api/payments/generate-code` - Generowanie kodu
- ✅ `POST /api/payments` - Tworzenie płatności
- ✅ `GET /api/payments/case/:id` - Płatności sprawy
- ✅ `GET /api/payments/client/:id` - Płatności klienta
- ✅ `GET /api/payments/all` - Wszystkie (admin)
- ✅ `PUT /api/payments/:id/status` - Aktualizacja statusu
- ✅ `GET /api/payments/:id/history` - Historia zmian
- ✅ `GET /api/payments/stats/summary` - Statystyki

### 2. Baza danych (3 tabele)
- ✅ `payments` - Główna tabela płatności
- ✅ `payment_history` - Historia zmian statusu
- ✅ `payment_reminders` - Przypomnienia

### 3. Frontend (`/frontend/scripts/modules/payments-module.js`)
- ✅ Zakładka płatności w sprawie
- ✅ Statystyki (wszystkie/oczekujące/opłacone)
- ✅ Lista płatności z filtrami
- ✅ Formularz dodawania płatności
- ✅ Szczegóły płatności
- ✅ Historia zmian
- ✅ Event Bus integration

---

## 🔑 KONFIGURACJA PAYPAL (WYMAGANE):

### KROK 1: Zarejestruj się w PayPal Developer
1. Idź na: https://developer.paypal.com/
2. Zaloguj się lub załóż konto
3. Przejdź do **Dashboard** → **Apps & Credentials**

### KROK 2: Utwórz aplikację SANDBOX (testową)
1. Kliknij **"Create App"**
2. Nazwa: `Pro Meritum Test`
3. Typ: **Merchant**
4. Sandbox Business Account: wybierz lub utwórz nowe
5. Zapisz

### KROK 3: Skopiuj Client ID
Po utworzeniu aplikacji zobaczysz:
- **Client ID** (dostępny publicznie) - SKOPIUJ TO
- **Secret** (tajny) - będzie potrzebny później

### KROK 4: Dodaj Client ID do aplikacji
Otwórz: `frontend/index.html` (linia ~18)

Zamień:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=PLN&locale=pl_PL"></script>
```

Na:
```html
<script src="https://www.paypal.com/sdk/js?client-id=TWOJ_CLIENT_ID&currency=PLN&locale=pl_PL"></script>
```

**Przykład:**
```html
<script src="https://www.paypal.com/sdk/js?client-id=AZ12345abc...&currency=PLN&locale=pl_PL"></script>
```

---

## 📋 FORMAT KODU PŁATNOŚCI:

```
PAY/TYP_SPRAWY/INICJAŁY/NUMER_SPRAWY/NUMER_PŁATNOŚCI
```

**Przykłady:**
- `PAY/CYW/JK/001/001` - Pierwsza płatność w sprawie cywilnej
- `PAY/KAR/AN/002/003` - Trzecia płatność w sprawie karnej

---

## 🎨 TYPY PŁATNOŚCI:

1. **invoice** - Faktura VAT
2. **advance** - Zaliczka
3. **final** - Płatność końcowa
4. **consultation** - Konsultacja
5. **representation** - Reprezentacja sądowa
6. **documents** - Opłata za dokumenty
7. **other** - Inne

---

## 🔄 STATUSY PŁATNOŚCI:

- **pending** ⏳ - Oczekująca (domyślny)
- **completed** ✅ - Opłacona
- **failed** ❌ - Nieudana
- **refunded** ↩️ - Zwrócona

---

## 🚀 JAK UŻYWAĆ:

### 1. Dodanie płatności:
1. Otwórz sprawę w CRM
2. Znajdź zakładkę **"💰 Płatności"**
3. Kliknij **"➕ Dodaj płatność"**
4. Wypełnij formularz:
   - Kwota (np. 1500.00)
   - Typ płatności (np. Faktura VAT)
   - Opis
   - Termin płatności
5. Kliknij **"💾 Utwórz płatność"**

### 2. Zobacz listę płatności:
- Wszystkie płatności sprawy wyświetlą się jako karty
- Kliknij na kartę aby zobaczyć szczegóły
- Statusy kolorowe:
  - 🟡 Żółty - Oczekująca
  - 🟢 Zielony - Opłacona
  - 🔴 Czerwony - Nieudana

### 3. Płatność PayPal (gdy gotowe):
1. Kliknij na płatność
2. Przycisk **"💳 Zapłać PayPal"**
3. Redirect do PayPal lub modal
4. Po płatności → status zmieni się na "completed"

---

## 📊 INTEGRACJA W DASHBOARDACH:

### Admin Dashboard:
```javascript
// Dodaj w renderKPICards():
{
    title: 'Płatności',
    value: stats.totalPayments,
    icon: '💰',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    action: 'window.paymentsModule.showAllPayments()'
}
```

### Lawyer Dashboard:
```javascript
// W placeholder "Monitor płatności" zastąp:
await api.request('/payments/stats/summary')
```

---

## 🔧 WEBHOOKS PAYPAL (Opcjonalne):

### Po opłaceniu przez PayPal, musisz zaktualizować status:

#### Endpoint webhook:
```javascript
// backend/routes/payments.js
router.post('/webhook/paypal', async (req, res) => {
    const { event_type, resource } = req.body;
    
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const paymentId = resource.supplementary_data.related_ids.payment_id;
        
        await updatePaymentStatus(paymentId, {
            status: 'completed',
            paypal_order_id: resource.id,
            paypal_payment_id: resource.supplementary_data.related_ids.order_id,
            paypal_payer_email: resource.payer.email_address
        });
    }
    
    res.sendStatus(200);
});
```

#### Konfiguracja w PayPal:
1. Dashboard → Apps → Twoja aplikacja
2. **Webhooks** → **Add Webhook**
3. URL: `https://twoja-domena.pl/api/payments/webhook/paypal`
4. Wybierz eventy:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
5. Zapisz

---

## 💡 SANDBOX TESTING:

### Testowe konto PayPal:
1. Dashboard → **Sandbox** → **Accounts**
2. Zobacz **Personal (buyer)** konto
3. Email i hasło do logowania w PayPal podczas testów

### Testowa płatność:
1. Dodaj płatność w systemie
2. Kliknij "Zapłać PayPal"
3. Zaloguj się testowym kontem
4. Zatwierdź płatność
5. Sprawdź czy status zmienił się na "completed"

---

## 📁 STRUKTURA PLIKÓW:

```
backend/
├── database/
│   └── init.js               ✅ 3 tabele płatności
├── routes/
│   └── payments.js           ✅ API płatności
└── server.js                 ✅ Router dodany

frontend/
├── index.html                ✅ PayPal SDK
└── scripts/
    └── modules/
        └── payments-module.js ✅ Moduł płatności
```

---

## ✅ CHECKLIST INTEGRACJI:

- [ ] PayPal Developer Account utworzone
- [ ] Aplikacja Sandbox utworzona
- [ ] Client ID skopiowane
- [ ] Client ID dodane do index.html
- [ ] Backend uruchomiony (npm start)
- [ ] Frontend odświeżony (Ctrl + Shift + R)
- [ ] Zakładka "Płatności" widoczna w sprawie
- [ ] Płatność testowa utworzona
- [ ] PayPal button testowany

---

## 🚨 WAŻNE - PRODUKCJA:

### Przejście na LIVE (prawdziwe płatności):

1. **Zmień SDK URL w index.html:**
```html
<!-- PRZED (sandbox): -->
<script src="https://www.paypal.com/sdk/js?client-id=SANDBOX_CLIENT_ID..."></script>

<!-- PO (live): -->
<script src="https://www.paypal.com/sdk/js?client-id=LIVE_CLIENT_ID..."></script>
```

2. **Uzyskaj LIVE Client ID:**
- Dashboard → Switch to Live
- Create App (LIVE)
- Skopiuj nowy Client ID

3. **Konfiguracja LIVE webhooks:**
- URL musi być HTTPS (nie HTTP!)
- Certyfikat SSL wymagany
- Publiczny adres (nie localhost!)

---

## 💰 KOSZTY PAYPAL:

### PayPal Fees (Polska):
- **Standardowa** transakcja: **3.4% + 1.35 zł**
- **Mikropłatność** (<50 zł): **10% + 0.35 zł**
- **Międzynarodowa**: **4.1% + 1.35 zł**

### Przykład:
Płatność **1000 zł**:
- Prowizja: **3.4% + 1.35 zł = 35.35 zł**
- Otrzymasz: **964.65 zł**

---

## 📞 WSPARCIE:

### PayPal Support:
- Developer Forum: https://www.paypal-community.com/
- Documentation: https://developer.paypal.com/docs/
- Support: https://www.paypal.com/us/smarthelp/contact-us

### Pro Meritum Support:
- Sprawdź logi w konsoli (F12)
- Backend logi: Terminal gdzie uruchomiony `npm start`
- Eventy: `eventBus.on('payment:created', ...)`

---

**Status:** ✅ Moduł płatności gotowy - wymaga tylko PayPal Client ID!
