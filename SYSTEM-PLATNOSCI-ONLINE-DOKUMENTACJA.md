# 💳 SYSTEM PŁATNOŚCI ONLINE - PAYPAL & BITCOIN

**Wersja:** 1.0  
**Data:** 16.11.2025  
**Integracja z:** System Finansowy Pro Meritum

---

## 🎯 CEL SYSTEMU

Umożliwienie klientom płatności online za usługi prawne poprzez:
- **PayPal** - płatności kartą, kontem PayPal
- **Bitcoin** - płatności kryptowalutą
- **Automatyczna synchronizacja** z systemem finansowym
- **Portfel Bitcoin** - zarządzanie adresami i transakcjami

---

## 📊 ARCHITEKTURA SYSTEMU

### Przepływ płatności:

```
KLIENT → WYBÓR METODY → PŁATNOŚĆ → WERYFIKACJA → SYSTEM FINANSOWY
   ↓                        ↓            ↓              ↓
Faktura              PayPal/BTC    Webhook      Przychód + Księgowanie
```

---

## 💰 METODY PŁATNOŚCI




**Zalety:**
- ✅ Natychmiastowe płatności (2-3 sekundy!)
- ✅ Kod 6-cyfrowy z aplikacji bankowej
- ✅ Najpopularniejsze w Polsce (80% użytkowników)
- ✅ Bezpieczne (autoryzacja w banku)
- ✅ Bez konieczności rejestracji
- ✅ Działa 24/7

**Prowizja:**
- 1.45% (najniższa ze wszystkich metod!)
- Brak opłaty stałej

**Limity:**
- Min: 1 PLN
- Max: 5,000 PLN (standardowy limit BLIK)
- Max dzienny: 20,000 PLN

**Czas realizacji:**
- Natychmiastowy (2-3 sekundy)

**Operator:**
- Przelewy24 / PayU / Tpay

---



### 2. 💳 PAYPAL

**Zalety:**
- ✅ Płatności kartą (Visa, Mastercard, Amex)
- ✅ Konto PayPal
- ✅ Natychmiastowe potwierdzenie
- ✅ Ochrona kupującego
- ✅ Płatności międzynarodowe

**Prowizja:**



- 3.4% + 1 PLN za transakcję krajową
- 4.1% + 1 PLN za transakcję międzynarodową

**Limity:**
- Min: 1 PLN
- Max: 60,000 PLN (bez weryfikacji)

---

### 3.  REVOLUT PAY

**Zalety:**
- ✅ Natychmiastowe płatności
- ✅ Popularne w Europie (25M użytkowników)
- ✅ Wielowalutowe (PLN, EUR, USD, GBP)
- ✅ Bez dodatkowych opłat dla użytkownika
- ✅ Integracja z aplikacją Revolut
- ✅ Płatności jednym kliknięciem

**Prowizja:**
- 1.2% (najniższa dla płatności międzynarodowych!)
- Brak opłaty stałej

**Limity:**
- Min: 1 PLN
- Max: 10,000 PLN (standardowy)
- Max dzienny: 50,000 PLN

**Czas realizacji:**
- Natychmiastowy (1-2 sekundy)

---

### 4. 🍎 APPLE PAY

**Zalety:**
- ✅ Natychmiastowe płatności
- ✅ Biometria (Face ID / Touch ID)
- ✅ Popularne wśród użytkowników iPhone (40% w PL)
- ✅ Bezpieczne (tokenizacja)
- ✅ Bez udostępniania danych karty
- ✅ Działa w Safari

**Prowizja:**
- 1.9% + 0.30 PLN
- Standardowa dla płatności mobilnych

**Limity:**
- Min: 1 PLN
- Max: 10,000 PLN (zależy od karty)

**Czas realizacji:**
- Natychmiastowy (1-2 sekundy)

**Wymagania:**
- iPhone, iPad, Mac lub Apple Watch
- Przeglądarka Safari
- Karta dodana do Apple Wallet

---

### 5. ₿ BITCOIN (BTC)

**Zalety:**
- ✅ Niskie prowizje (0.0001-0.001 BTC)
- ✅ Brak pośredników
- ✅ Płatności międzynarodowe
- ✅ Prywatność
- ✅ Nieodwracalne transakcje

**Wady:**
- ⚠️ Zmienność kursu
- ⚠️ Czas potwierdzenia (10-60 min)
- ⚠️ Wymaga portfela Bitcoin

**Limity:**
- Min: 0.0001 BTC (~20 PLN)
- Max: Brak limitu

---

## 🗄️ BAZA DANYCH

### Tabela: online_payments

```sql
CREATE TABLE IF NOT EXISTS online_payments (
    -- Identyfikatory
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_code TEXT UNIQUE NOT NULL,           -- PAY/2025/001
    
    -- Powiązania
    client_id INTEGER NOT NULL,
    case_id INTEGER,
    invoice_id INTEGER,
    
    -- Metoda płatności
    payment_method TEXT NOT NULL,                -- blik/paypal/revolut/applepay/bitcoin
    
    -- Kwoty
    amount DECIMAL(10,2) NOT NULL,               -- Kwota w PLN
    currency TEXT DEFAULT 'PLN',                 -- PLN/USD/EUR/GBP/BTC
    exchange_rate DECIMAL(10,6),                 -- Kurs wymiany (dla BTC)
    
    -- BLIK
    blik_code TEXT,                              -- Kod BLIK (6 cyfr)
    blik_transaction_id TEXT,                    -- ID transakcji BLIK
    blik_alias_value TEXT,                       -- Alias BLIK (dla płatności cyklicznych)
    blik_alias_label TEXT,                       -- Etykieta aliasu
    
    -- PayPal
    paypal_transaction_id TEXT,                  -- ID transakcji PayPal
    paypal_payer_email TEXT,
    paypal_payer_id TEXT,
    
    -- Revolut Pay
    revolut_order_id TEXT,                       -- ID zamówienia Revolut
    revolut_payment_id TEXT,                     -- ID płatności Revolut
    revolut_customer_id TEXT,                    -- ID klienta Revolut
    
    -- Apple Pay
    applepay_transaction_id TEXT,                -- ID transakcji Apple Pay
    applepay_token TEXT,                         -- Token płatności
    applepay_card_last4 TEXT,                    -- Ostatnie 4 cyfry karty
    applepay_card_type TEXT,                     -- Typ karty (Visa/Mastercard)
    
    -- Bitcoin
    bitcoin_address TEXT,                        -- Adres portfela (nasz)
    bitcoin_txid TEXT,                           -- Transaction ID w blockchain
    bitcoin_amount DECIMAL(10,8),                -- Kwota w BTC
    bitcoin_confirmations INTEGER DEFAULT 0,     -- Liczba potwierdzeń
    bitcoin_block_height INTEGER,                -- Wysokość bloku
    
    -- Status
    status TEXT DEFAULT 'pending',               -- pending/processing/completed/failed/refunded
    
    -- Daty
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    
    -- Metadane
    ip_address TEXT,
    user_agent TEXT,
    webhook_data TEXT,                           -- JSON z danymi webhook
    notes TEXT,
    
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id)
);

CREATE INDEX idx_online_payment_code ON online_payments(payment_code);
CREATE INDEX idx_online_payment_client ON online_payments(client_id);
CREATE INDEX idx_online_payment_status ON online_payments(status);
CREATE INDEX idx_online_payment_method ON online_payments(payment_method);
CREATE INDEX idx_online_payment_paypal_txid ON online_payments(paypal_transaction_id);
CREATE INDEX idx_online_payment_bitcoin_txid ON online_payments(bitcoin_txid);
```

### Tabela: bitcoin_wallet

```sql
CREATE TABLE IF NOT EXISTS bitcoin_wallet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,                -- Adres Bitcoin
    label TEXT,                                  -- Etykieta (np. "Klient Jan Kowalski")
    private_key_encrypted TEXT,                  -- Zaszyfrowany klucz prywatny
    public_key TEXT,
    
    -- Statystyki
    total_received DECIMAL(10,8) DEFAULT 0,      -- Suma otrzymanych BTC
    total_sent DECIMAL(10,8) DEFAULT 0,          -- Suma wysłanych BTC
    balance DECIMAL(10,8) DEFAULT 0,             -- Saldo
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    is_watching BOOLEAN DEFAULT 1,               -- Czy monitorować adres
    
    -- Daty
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX idx_bitcoin_address ON bitcoin_wallet(address);
CREATE INDEX idx_bitcoin_active ON bitcoin_wallet(is_active);
```

### Tabela: bitcoin_transactions

```sql
CREATE TABLE IF NOT EXISTS bitcoin_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    txid TEXT UNIQUE NOT NULL,                   -- Transaction ID
    address TEXT NOT NULL,                       -- Nasz adres
    
    -- Typ
    type TEXT NOT NULL,                          -- incoming/outgoing
    
    -- Kwoty
    amount DECIMAL(10,8) NOT NULL,               -- Kwota w BTC
    fee DECIMAL(10,8),                           -- Opłata transakcyjna
    
    -- Status
    confirmations INTEGER DEFAULT 0,
    block_height INTEGER,
    block_time TIMESTAMP,
    
    -- Powiązanie
    payment_id INTEGER,                          -- ID z online_payments
    
    -- Metadane
    raw_data TEXT,                               -- JSON z pełnymi danymi
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (address) REFERENCES bitcoin_wallet(address),
    FOREIGN KEY (payment_id) REFERENCES online_payments(id)
);

CREATE INDEX idx_bitcoin_tx_txid ON bitcoin_transactions(txid);
CREATE INDEX idx_bitcoin_tx_address ON bitcoin_transactions(address);
CREATE INDEX idx_bitcoin_tx_payment ON bitcoin_transactions(payment_id);
```

---

## 🔌 BACKEND API

### Struktura plików:

```
backend/
├── routes/
│   └── payments/
│       ├── blik.js             ✅ BLIK API
│       ├── paypal.js           ✅ PayPal API
│       ├── revolut.js          ✅ Revolut Pay API
│       ├── applepay.js         ✅ Apple Pay API
│       ├── bitcoin.js          ✅ Bitcoin API
│       ├── webhook.js          ✅ Webhooks
│       └── wallet.js           ✅ Portfel Bitcoin
├── utils/
│   ├── blik-helper.js          ✅ BLIK (Przelewy24/PayU)
│   ├── paypal-helper.js        ✅ PayPal SDK
│   ├── revolut-helper.js       ✅ Revolut API
│   ├── applepay-helper.js      ✅ Apple Pay SDK
│   ├── bitcoin-helper.js       ✅ Bitcoin RPC
│   └── exchange-rates.js       ✅ Kursy walut
└── services/
    ├── blik-service.js         ✅ Logika BLIK
    ├── paypal-service.js       ✅ Logika PayPal
    ├── revolut-service.js      ✅ Logika Revolut
    ├── applepay-service.js     ✅ Logika Apple Pay
    └── bitcoin-service.js      ✅ Logika Bitcoin
```

---

## � BLIK - IMPLEMENTACJA

### 1. Konfiguracja BLIK (Przelewy24)

**Wymagane:**
- Konto Przelewy24 (lub PayU/Tpay)
- Merchant ID
- CRC Key
- API Key
- Webhook URL

**Plik:** `backend/config/blik.js`
```javascript
module.exports = {
    provider: 'przelewy24', // przelewy24/payu/tpay
    merchant_id: process.env.P24_MERCHANT_ID,
    pos_id: process.env.P24_POS_ID,
    crc_key: process.env.P24_CRC_KEY,
    api_key: process.env.P24_API_KEY,
    mode: process.env.P24_MODE || 'sandbox', // sandbox/live
    api_url: process.env.P24_MODE === 'live' 
        ? 'https://secure.przelewy24.pl/api/v1'
        : 'https://sandbox.przelewy24.pl/api/v1',
    return_url: 'https://pro-meritum.pl/payment/success',
    status_url: 'https://pro-meritum.pl/api/payments/blik/webhook'
};
```

---

### 2. API Endpointy BLIK

```javascript
// POST /api/payments/blik/create
// Utworzenie płatności BLIK
router.post('/blik/create', async (req, res) => {
    const { client_id, invoice_id, amount, description } = req.body;
    
    // Generuj kod płatności
    const payment_code = await generatePaymentCode();
    
    // Zapisz w bazie (status: pending)
    await db.run(`
        INSERT INTO online_payments (
            payment_code, client_id, invoice_id,
            payment_method, amount, currency, status
        ) VALUES (?, ?, ?, 'blik', ?, 'PLN', 'pending')
    `, [payment_code, client_id, invoice_id, amount]);
    
    res.json({
        success: true,
        payment_code,
        amount,
        session_id: payment_code // Używamy jako session ID
    });
});

// POST /api/payments/blik/pay
// Autoryzacja płatności kodem BLIK
router.post('/blik/pay', async (req, res) => {
    const { payment_code, blik_code } = req.body;
    
    // Walidacja kodu BLIK (6 cyfr)
    if (!/^\d{6}$/.test(blik_code)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nieprawidłowy kod BLIK (wymagane 6 cyfr)' 
        });
    }
    
    // Pobierz płatność
    const payment = await db.get(
        'SELECT * FROM online_payments WHERE payment_code = ?',
        [payment_code]
    );
    
    if (!payment) {
        return res.status(404).json({ error: 'Płatność nie znaleziona' });
    }
    
    try {
        // Wywołaj API Przelewy24
        const p24Response = await blikService.registerTransaction({
            merchant_id: config.merchant_id,
            pos_id: config.pos_id,
            session_id: payment_code,
            amount: Math.round(payment.amount * 100), // Grosze
            currency: 'PLN',
            description: `Faktura ${payment.invoice_id}`,
            email: await getClientEmail(payment.client_id),
            country: 'PL',
            language: 'pl',
            method: 181, // BLIK
            blik_code: blik_code,
            url_return: config.return_url,
            url_status: config.status_url
        });
        
        if (p24Response.data.token) {
            // Aktualizuj status
            await db.run(`
                UPDATE online_payments 
                SET blik_code = ?,
                    blik_transaction_id = ?,
                    status = 'processing'
                WHERE payment_code = ?
            `, [blik_code, p24Response.data.token, payment_code]);
            
            // Sprawdź status transakcji
            const status = await blikService.checkTransactionStatus(p24Response.data.token);
            
            if (status.status === 'success') {
                // Płatność udana!
                await handleBlikSuccess(payment_code, p24Response.data.token);
                
                res.json({
                    success: true,
                    status: 'completed',
                    transaction_id: p24Response.data.token
                });
            } else {
                res.json({
                    success: true,
                    status: 'processing',
                    transaction_id: p24Response.data.token
                });
            }
        } else {
            throw new Error('Brak tokenu transakcji');
        }
    } catch (error) {
        console.error('Błąd płatności BLIK:', error);
        
        await db.run(`
            UPDATE online_payments 
            SET status = 'failed'
            WHERE payment_code = ?
        `, [payment_code]);
        
        res.status(400).json({ 
            success: false, 
            error: error.message || 'Błąd płatności BLIK'
        });
    }
});

// POST /api/payments/blik/webhook
// Webhook od Przelewy24
router.post('/blik/webhook', async (req, res) => {
    const notification = req.body;
    
    // Weryfikuj webhook (CRC)
    const isValid = blikService.verifyNotification(notification);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const { sessionId, orderId, amount, currency } = notification;
    
    // Znajdź płatność
    const payment = await db.get(
        'SELECT * FROM online_payments WHERE payment_code = ?',
        [sessionId]
    );
    
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Weryfikuj transakcję w P24
    const verification = await blikService.verifyTransaction({
        merchant_id: config.merchant_id,
        pos_id: config.pos_id,
        session_id: sessionId,
        amount: amount,
        currency: currency,
        order_id: orderId
    });
    
    if (verification.status === 'success') {
        // Aktualizuj status
        await db.run(`
            UPDATE online_payments 
            SET status = 'completed',
                paid_at = CURRENT_TIMESTAMP,
                blik_transaction_id = ?,
                webhook_data = ?
            WHERE payment_code = ?
        `, [orderId, JSON.stringify(notification), sessionId]);
        
        // Utwórz przychód w systemie finansowym
        await createRevenue({
            type: 'payment',
            source: 'blik',
            client_id: payment.client_id,
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            payment_method: 'blik',
            payment_date: new Date(),
            status: 'paid'
        });
        
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Verification failed' });
    }
});

// GET /api/payments/blik/status/:paymentCode
// Sprawdź status płatności BLIK
router.get('/blik/status/:paymentCode', async (req, res) => {
    const { paymentCode } = req.params;
    
    const payment = await db.get(
        'SELECT * FROM online_payments WHERE payment_code = ?',
        [paymentCode]
    );
    
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({
        success: true,
        status: payment.status,
        transaction_id: payment.blik_transaction_id,
        paid_at: payment.paid_at
    });
});
```

---

### 3. BLIK Service (Przelewy24)

**Plik:** `backend/services/blik-service.js`

```javascript
const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/blik');

class BlikService {
    async registerTransaction(data) {
        const sign = this.generateSign(data);
        
        const response = await axios.post(
            `${config.api_url}/transaction/register`,
            { ...data, sign },
            {
                auth: {
                    username: config.pos_id,
                    password: config.api_key
                }
            }
        );
        
        return response.data;
    }
    
    async checkTransactionStatus(token) {
        const response = await axios.get(
            `${config.api_url}/transaction/by/sessionId/${token}`,
            {
                auth: {
                    username: config.pos_id,
                    password: config.api_key
                }
            }
        );
        
        return response.data;
    }
    
    async verifyTransaction(data) {
        const sign = this.generateSign(data);
        
        const response = await axios.put(
            `${config.api_url}/transaction/verify`,
            { ...data, sign },
            {
                auth: {
                    username: config.pos_id,
                    password: config.api_key
                }
            }
        );
        
        return response.data;
    }
    
    generateSign(data) {
        const signString = JSON.stringify({
            sessionId: data.session_id,
            orderId: data.order_id || 0,
            amount: data.amount,
            currency: data.currency,
            crc: config.crc_key
        });
        
        return crypto
            .createHash('sha384')
            .update(signString)
            .digest('hex');
    }
    
    verifyNotification(notification) {
        const receivedSign = notification.sign;
        const calculatedSign = this.generateSign(notification);
        
        return receivedSign === calculatedSign;
    }
}

module.exports = new BlikService();
```

---

## � PAYPAL - IMPLEMENTACJA

### 1. Konfiguracja PayPal

**Wymagane:**
- Konto PayPal Business
- Client ID
- Secret Key
- Webhook URL

**Plik:** `backend/config/paypal.js`
```javascript
module.exports = {
    mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox/live
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    return_url: 'https://pro-meritum.pl/payment/success',
    cancel_url: 'https://pro-meritum.pl/payment/cancel'
};
```

---

### 2. API Endpointy PayPal

```javascript
// POST /api/payments/paypal/create
// Utworzenie płatności PayPal
router.post('/paypal/create', async (req, res) => {
    const { client_id, invoice_id, amount, description } = req.body;
    
    // Generuj kod płatności
    const payment_code = await generatePaymentCode();
    
    // Utwórz zamówienie w PayPal
    const order = await paypalService.createOrder({
        amount: amount,
        currency: 'PLN',
        description: description,
        invoice_id: payment_code
    });
    
    // Zapisz w bazie
    await db.run(`
        INSERT INTO online_payments (
            payment_code, client_id, invoice_id,
            payment_method, amount, currency,
            paypal_transaction_id, status
        ) VALUES (?, ?, ?, 'paypal', ?, 'PLN', ?, 'pending')
    `, [payment_code, client_id, invoice_id, amount, order.id]);
    
    res.json({
        success: true,
        payment_code,
        order_id: order.id,
        approval_url: order.links.find(l => l.rel === 'approve').href
    });
});

// POST /api/payments/paypal/capture/:orderId
// Przechwycenie płatności po zatwierdzeniu
router.post('/paypal/capture/:orderId', async (req, res) => {
    const { orderId } = req.params;
    
    // Przechwyt płatności
    const capture = await paypalService.captureOrder(orderId);
    
    if (capture.status === 'COMPLETED') {
        // Aktualizuj status w bazie
        await db.run(`
            UPDATE online_payments 
            SET status = 'completed',
                paid_at = CURRENT_TIMESTAMP,
                paypal_payer_email = ?,
                paypal_payer_id = ?,
                webhook_data = ?
            WHERE paypal_transaction_id = ?
        `, [
            capture.payer.email_address,
            capture.payer.payer_id,
            JSON.stringify(capture),
            orderId
        ]);
        
        // Utwórz przychód w systemie finansowym
        const payment = await db.get(
            'SELECT * FROM online_payments WHERE paypal_transaction_id = ?',
            [orderId]
        );
        
        await createRevenue({
            type: 'payment',
            source: 'paypal',
            client_id: payment.client_id,
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            payment_method: 'paypal',
            payment_date: new Date(),
            status: 'paid'
        });
        
        res.json({ success: true, capture });
    } else {
        res.status(400).json({ success: false, error: 'Payment not completed' });
    }
});

// POST /api/payments/paypal/webhook
// Webhook od PayPal
router.post('/paypal/webhook', async (req, res) => {
    const event = req.body;
    
    // Weryfikuj webhook
    const isValid = await paypalService.verifyWebhook(event);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid webhook' });
    }
    
    // Obsłuż różne typy eventów
    switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
            await handlePaymentCompleted(event.resource);
            break;
        case 'PAYMENT.CAPTURE.REFUNDED':
            await handlePaymentRefunded(event.resource);
            break;
    }
    
    res.json({ success: true });
});
```

---

## ₿ BITCOIN - IMPLEMENTACJA

### 1. Konfiguracja Bitcoin

**Wymagane:**
- Bitcoin Core Node (lub Electrum)
- RPC credentials
- Blockchain API (Blockstream/Blockchain.info)

**Plik:** `backend/config/bitcoin.js`
```javascript
module.exports = {
    network: process.env.BTC_NETWORK || 'testnet', // mainnet/testnet
    rpc: {
        host: process.env.BTC_RPC_HOST || 'localhost',
        port: process.env.BTC_RPC_PORT || 18332,
        user: process.env.BTC_RPC_USER,
        pass: process.env.BTC_RPC_PASS
    },
    api: {
        blockstream: 'https://blockstream.info/api',
        blockchain: 'https://blockchain.info'
    },
    confirmations_required: 3, // Minimalna liczba potwierdzeń
    exchange_api: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=pln'
};
```

---

### 2. API Endpointy Bitcoin

```javascript
// POST /api/payments/bitcoin/create
// Utworzenie płatności Bitcoin
router.post('/bitcoin/create', async (req, res) => {
    const { client_id, invoice_id, amount_pln, description } = req.body;
    
    // Pobierz aktualny kurs BTC/PLN
    const btcRate = await getExchangeRate('BTC', 'PLN');
    const amount_btc = (amount_pln / btcRate).toFixed(8);
    
    // Generuj nowy adres Bitcoin
    const address = await bitcoinService.generateAddress({
        label: `Klient ${client_id} - Faktura ${invoice_id}`
    });
    
    // Generuj kod płatności
    const payment_code = await generatePaymentCode();
    
    // Zapisz w bazie
    await db.run(`
        INSERT INTO online_payments (
            payment_code, client_id, invoice_id,
            payment_method, amount, currency,
            bitcoin_address, bitcoin_amount,
            exchange_rate, status
        ) VALUES (?, ?, ?, 'bitcoin', ?, 'PLN', ?, ?, ?, 'pending')
    `, [
        payment_code, client_id, invoice_id,
        amount_pln, address, amount_btc, btcRate
    ]);
    
    // Rozpocznij monitorowanie adresu
    bitcoinService.watchAddress(address, payment_code);
    
    res.json({
        success: true,
        payment_code,
        bitcoin_address: address,
        amount_btc: amount_btc,
        amount_pln: amount_pln,
        exchange_rate: btcRate,
        qr_code: `bitcoin:${address}?amount=${amount_btc}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minut
    });
});

// GET /api/payments/bitcoin/status/:paymentCode
// Sprawdź status płatności Bitcoin
router.get('/bitcoin/status/:paymentCode', async (req, res) => {
    const { paymentCode } = req.params;
    
    const payment = await db.get(
        'SELECT * FROM online_payments WHERE payment_code = ?',
        [paymentCode]
    );
    
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Sprawdź transakcje na adresie
    const txs = await bitcoinService.getAddressTransactions(payment.bitcoin_address);
    
    res.json({
        success: true,
        status: payment.status,
        confirmations: payment.bitcoin_confirmations,
        transactions: txs
    });
});

// POST /api/payments/bitcoin/webhook
// Webhook od Blockchain API (lub własny monitor)
router.post('/bitcoin/webhook', async (req, res) => {
    const { address, txid, amount, confirmations } = req.body;
    
    // Znajdź płatność
    const payment = await db.get(
        'SELECT * FROM online_payments WHERE bitcoin_address = ?',
        [address]
    );
    
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Aktualizuj status
    await db.run(`
        UPDATE online_payments 
        SET bitcoin_txid = ?,
            bitcoin_confirmations = ?,
            status = CASE 
                WHEN ? >= 3 THEN 'completed'
                WHEN ? >= 1 THEN 'processing'
                ELSE 'pending'
            END,
            paid_at = CASE WHEN ? >= 1 THEN CURRENT_TIMESTAMP ELSE paid_at END
        WHERE id = ?
    `, [txid, confirmations, confirmations, confirmations, confirmations, payment.id]);
    
    // Jeśli potwierdzone - utwórz przychód
    if (confirmations >= 3) {
        await createRevenue({
            type: 'payment',
            source: 'bitcoin',
            client_id: payment.client_id,
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            payment_method: 'bitcoin',
            payment_date: new Date(),
            status: 'paid'
        });
    }
    
    res.json({ success: true });
});
```

---

## 💳 REVOLUT PAY - IMPLEMENTACJA

### 1. Konfiguracja Revolut

**Wymagane:**
- Konto Revolut Business
- API Key
- Merchant Account ID
- Webhook URL

**Plik:** `backend/config/revolut.js`
```javascript
module.exports = {
    mode: process.env.REVOLUT_MODE || 'sandbox', // sandbox/live
    api_key: process.env.REVOLUT_API_KEY,
    merchant_account_id: process.env.REVOLUT_MERCHANT_ID,
    api_url: process.env.REVOLUT_MODE === 'live'
        ? 'https://merchant.revolut.com/api/1.0'
        : 'https://sandbox-merchant.revolut.com/api/1.0',
    webhook_url: 'https://pro-meritum.pl/api/payments/revolut/webhook'
};
```

### 2. API Endpointy Revolut

```javascript
// POST /api/payments/revolut/create
router.post('/revolut/create', async (req, res) => {
    const { client_id, invoice_id, amount, currency = 'PLN' } = req.body;
    
    const payment_code = await generatePaymentCode();
    
    // Utwórz zamówienie w Revolut
    const order = await revolutService.createOrder({
        amount: Math.round(amount * 100), // Grosze
        currency: currency,
        merchant_order_ext_ref: payment_code,
        description: `Faktura ${invoice_id}`,
        customer_email: await getClientEmail(client_id)
    });
    
    // Zapisz w bazie
    await db.run(`
        INSERT INTO online_payments (
            payment_code, client_id, invoice_id,
            payment_method, amount, currency,
            revolut_order_id, status
        ) VALUES (?, ?, ?, 'revolut', ?, ?, ?, 'pending')
    `, [payment_code, client_id, invoice_id, amount, currency, order.id]);
    
    res.json({
        success: true,
        payment_code,
        order_id: order.id,
        payment_url: order.checkout_url
    });
});

// POST /api/payments/revolut/webhook
router.post('/revolut/webhook', async (req, res) => {
    const event = req.body;
    
    // Weryfikuj webhook
    const isValid = revolutService.verifyWebhook(req);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    if (event.event === 'ORDER_COMPLETED') {
        const payment = await db.get(
            'SELECT * FROM online_payments WHERE revolut_order_id = ?',
            [event.order_id]
        );
        
        await db.run(`
            UPDATE online_payments 
            SET status = 'completed',
                paid_at = CURRENT_TIMESTAMP,
                revolut_payment_id = ?
            WHERE revolut_order_id = ?
        `, [event.payment_id, event.order_id]);
        
        await createRevenue({
            type: 'payment',
            source: 'revolut',
            client_id: payment.client_id,
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            payment_method: 'revolut',
            payment_date: new Date(),
            status: 'paid'
        });
    }
    
    res.json({ success: true });
});
```

---

## 🍎 APPLE PAY - IMPLEMENTACJA

### 1. Konfiguracja Apple Pay

**Wymagane:**
- Apple Developer Account
- Merchant ID
- Payment Processing Certificate
- Domain verification
- Stripe/Adyen/inny procesor

**Plik:** `backend/config/applepay.js`
```javascript
module.exports = {
    merchant_id: process.env.APPLEPAY_MERCHANT_ID,
    merchant_name: 'Pro Meritum',
    country_code: 'PL',
    currency_code: 'PLN',
    supported_networks: ['visa', 'mastercard', 'amex'],
    merchant_capabilities: ['supports3DS'],
    // Używamy Stripe jako procesora
    stripe_key: process.env.STRIPE_SECRET_KEY
};
```

### 2. API Endpointy Apple Pay

```javascript
// POST /api/payments/applepay/create-session
// Utworzenie sesji Apple Pay
router.post('/applepay/create-session', async (req, res) => {
    const { validation_url } = req.body;
    
    // Walidacja domeny Apple Pay
    const session = await applePayService.createSession(validation_url);
    
    res.json(session);
});

// POST /api/payments/applepay/process
// Przetworzenie płatności Apple Pay
router.post('/applepay/process', async (req, res) => {
    const { 
        client_id, 
        invoice_id, 
        amount, 
        payment_token 
    } = req.body;
    
    const payment_code = await generatePaymentCode();
    
    try {
        // Przetwórz token przez Stripe
        const charge = await stripe.charges.create({
            amount: Math.round(amount * 100), // Grosze
            currency: 'pln',
            source: payment_token.id,
            description: `Faktura ${invoice_id}`
        });
        
        // Zapisz w bazie
        await db.run(`
            INSERT INTO online_payments (
                payment_code, client_id, invoice_id,
                payment_method, amount, currency,
                applepay_transaction_id, applepay_card_last4,
                applepay_card_type, status
            ) VALUES (?, ?, ?, 'applepay', ?, 'PLN', ?, ?, ?, 'completed')
        `, [
            payment_code, client_id, invoice_id, amount,
            charge.id, charge.payment_method_details.card.last4,
            charge.payment_method_details.card.brand
        ]);
        
        // Utwórz przychód
        await createRevenue({
            type: 'payment',
            source: 'applepay',
            client_id,
            invoice_id,
            amount,
            payment_method: 'applepay',
            payment_date: new Date(),
            status: 'paid'
        });
        
        res.json({
            success: true,
            payment_code,
            transaction_id: charge.id
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
```

---

## 🎨 FRONTEND - INTERFEJS PŁATNOŚCI

### Strona płatności dla klienta

**Plik:** `frontend/payment.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Płatność - Pro Meritum</title>
    <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=PLN"></script>
</head>
<body>
    <div class="payment-container">
        <h1>💳 Płatność za usługi prawne</h1>
        
        <!-- Szczegóły faktury -->
        <div class="invoice-details">
            <p>Faktura: <strong id="invoiceNumber"></strong></p>
            <p>Kwota: <strong id="amount"></strong> PLN</p>
            <p>Opis: <span id="description"></span></p>
        </div>
        
        <!-- Wybór metody płatności -->
        <div class="payment-methods">
            <button onclick="selectMethod('blik')" class="method-btn blik-btn">
                📱 BLIK
                <span class="recommended">POLECANE</span>
            </button>
            <button onclick="selectMethod('revolut')" class="method-btn revolut-btn">
                💳 Revolut Pay
            </button>
            <button onclick="selectMethod('applepay')" class="method-btn applepay-btn">
                🍎 Apple Pay
            </button>
            <button onclick="selectMethod('paypal')" class="method-btn">
                💳 PayPal / Karta
            </button>
            <button onclick="selectMethod('bitcoin')" class="method-btn">
                ₿ Bitcoin
            </button>
        </div>
        
        <!-- BLIK -->
        <div id="blik-container" style="display: none;">
            <div class="blik-payment">
                <div class="blik-steps">
                    <h3>📱 Jak zapłacić BLIK?</h3>
                    <ol>
                        <li>Otwórz aplikację bankową</li>
                        <li>Wygeneruj kod BLIK (6 cyfr)</li>
                        <li>Wpisz kod poniżej</li>
                        <li>Potwierdź płatność w aplikacji</li>
                    </ol>
                </div>
                
                <div class="blik-form">
                    <label>Kod BLIK (6 cyfr):</label>
                    <input 
                        type="text" 
                        id="blikCode" 
                        maxlength="6" 
                        pattern="[0-9]{6}"
                        placeholder="000000"
                        style="font-size: 24px; text-align: center; letter-spacing: 5px;"
                    >
                    <button onclick="paymentPage.payWithBlik()" class="btn-pay-blik">
                        ✓ Zapłać BLIK
                    </button>
                </div>
                
                <div id="blikStatus" class="payment-status"></div>
                
                <p class="blik-info">
                    ⏱️ Kod BLIK ważny przez 2 minuty<br>
                    🔒 Płatność bezpieczna i natychmiastowa<br>
                    💰 Prowizja: tylko 1.45%
                </p>
            </div>
        </div>
        
        <!-- PayPal -->
        <div id="paypal-container" style="display: none;">
            <div id="paypal-button-container"></div>
        </div>
        
        <!-- Bitcoin -->
        <div id="bitcoin-container" style="display: none;">
            <div class="bitcoin-payment">
                <p>Wyślij <strong id="btcAmount"></strong> BTC na adres:</p>
                <div class="bitcoin-address">
                    <input type="text" id="btcAddress" readonly>
                    <button onclick="copyAddress()">📋 Kopiuj</button>
                </div>
                <div id="qrCode"></div>
                <p class="bitcoin-note">
                    ⏱️ Płatność wygasa za: <span id="countdown"></span><br>
                    ℹ️ Wymagane 3 potwierdzenia w sieci Bitcoin
                </p>
                <div id="btcStatus"></div>
            </div>
        </div>
    </div>
    
    <script src="scripts/payment.js"></script>
</body>
</html>
```

**Plik:** `frontend/scripts/payment.js`

```javascript
class PaymentPage {
    constructor() {
        this.invoiceId = new URLSearchParams(window.location.search).get('invoice');
        this.paymentCode = null;
        this.method = null;
    }
    
    async init() {
        await this.loadInvoice();
    }
    
    async loadInvoice() {
        const invoice = await api.request(`/sales-invoices/${this.invoiceId}`);
        document.getElementById('invoiceNumber').textContent = invoice.invoice_number;
        document.getElementById('amount').textContent = invoice.gross_amount;
        document.getElementById('description').textContent = invoice.description;
    }
    
    async selectMethod(method) {
        this.method = method;
        
        // Ukryj wszystkie kontenery
        document.getElementById('blik-container').style.display = 'none';
        document.getElementById('paypal-container').style.display = 'none';
        document.getElementById('bitcoin-container').style.display = 'none';
        
        if (method === 'blik') {
            await this.initBlik();
        } else if (method === 'paypal') {
            await this.initPayPal();
        } else if (method === 'bitcoin') {
            await this.initBitcoin();
        }
    }
    
    async initBlik() {
        document.getElementById('blik-container').style.display = 'block';
        
        const amount = document.getElementById('amount').textContent;
        
        // Utwórz sesję płatności
        const response = await api.request('/payments/blik/create', 'POST', {
            client_id: window.currentUser.client_id,
            invoice_id: this.invoiceId,
            amount: parseFloat(amount),
            description: `Faktura ${document.getElementById('invoiceNumber').textContent}`
        });
        
        this.paymentCode = response.payment_code;
        
        // Focus na input kodu BLIK
        document.getElementById('blikCode').focus();
    }
    
    async payWithBlik() {
        const blikCode = document.getElementById('blikCode').value;
        const statusDiv = document.getElementById('blikStatus');
        
        // Walidacja
        if (!/^\d{6}$/.test(blikCode)) {
            statusDiv.innerHTML = '<p class="error">❌ Kod BLIK musi mieć 6 cyfr</p>';
            return;
        }
        
        statusDiv.innerHTML = '<p class="processing">⏳ Przetwarzanie płatności...</p>';
        
        try {
            const response = await api.request('/payments/blik/pay', 'POST', {
                payment_code: this.paymentCode,
                blik_code: blikCode
            });
            
            if (response.success) {
                if (response.status === 'completed') {
                    statusDiv.innerHTML = '<p class="success">✅ Płatność zakończona!</p>';
                    setTimeout(() => {
                        window.location.href = '/payment/success?code=' + this.paymentCode;
                    }, 1500);
                } else if (response.status === 'processing') {
                    statusDiv.innerHTML = '<p class="info">⏳ Potwierdź płatność w aplikacji bankowej...</p>';
                    // Monitoruj status
                    this.monitorBlikPayment();
                }
            } else {
                statusDiv.innerHTML = `<p class="error">❌ ${response.error}</p>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<p class="error">❌ Błąd: ${error.message}</p>`;
        }
    }
    
    async monitorBlikPayment() {
        const statusDiv = document.getElementById('blikStatus');
        
        const checkStatus = async () => {
            const status = await api.request(
                `/payments/blik/status/${this.paymentCode}`
            );
            
            if (status.status === 'completed') {
                statusDiv.innerHTML = '<p class="success">✅ Płatność potwierdzona!</p>';
                setTimeout(() => {
                    window.location.href = '/payment/success?code=' + this.paymentCode;
                }, 1500);
            } else if (status.status === 'failed') {
                statusDiv.innerHTML = '<p class="error">❌ Płatność odrzucona. Spróbuj ponownie.</p>';
            } else {
                // Sprawdź ponownie za 2 sekundy
                setTimeout(checkStatus, 2000);
            }
        };
        
        checkStatus();
    }
    
    async initPayPal() {
        document.getElementById('paypal-container').style.display = 'block';
        document.getElementById('bitcoin-container').style.display = 'none';
        
        const amount = document.getElementById('amount').textContent;
        
        paypal.Buttons({
            createOrder: async () => {
                const response = await api.request('/payments/paypal/create', 'POST', {
                    client_id: window.currentUser.client_id,
                    invoice_id: this.invoiceId,
                    amount: parseFloat(amount),
                    description: `Faktura ${document.getElementById('invoiceNumber').textContent}`
                });
                
                this.paymentCode = response.payment_code;
                return response.order_id;
            },
            onApprove: async (data) => {
                const response = await api.request(
                    `/payments/paypal/capture/${data.orderID}`,
                    'POST'
                );
                
                if (response.success) {
                    window.location.href = '/payment/success?code=' + this.paymentCode;
                }
            },
            onError: (err) => {
                alert('Błąd płatności: ' + err.message);
            }
        }).render('#paypal-button-container');
    }
    
    async initBitcoin() {
        document.getElementById('paypal-container').style.display = 'none';
        document.getElementById('bitcoin-container').style.display = 'block';
        
        const amount = document.getElementById('amount').textContent;
        
        const response = await api.request('/payments/bitcoin/create', 'POST', {
            client_id: window.currentUser.client_id,
            invoice_id: this.invoiceId,
            amount_pln: parseFloat(amount),
            description: `Faktura ${document.getElementById('invoiceNumber').textContent}`
        });
        
        this.paymentCode = response.payment_code;
        
        // Wyświetl dane Bitcoin
        document.getElementById('btcAmount').textContent = response.amount_btc;
        document.getElementById('btcAddress').value = response.bitcoin_address;
        
        // Generuj QR code
        new QRCode(document.getElementById('qrCode'), {
            text: response.qr_code,
            width: 256,
            height: 256
        });
        
        // Rozpocznij countdown
        this.startCountdown(response.expires_at);
        
        // Monitoruj status
        this.monitorBitcoinPayment();
    }
    
    async monitorBitcoinPayment() {
        const checkStatus = async () => {
            const status = await api.request(
                `/payments/bitcoin/status/${this.paymentCode}`
            );
            
            const statusDiv = document.getElementById('btcStatus');
            
            if (status.status === 'completed') {
                statusDiv.innerHTML = '✅ Płatność potwierdzona!';
                setTimeout(() => {
                    window.location.href = '/payment/success?code=' + this.paymentCode;
                }, 2000);
            } else if (status.status === 'processing') {
                statusDiv.innerHTML = `⏳ Oczekiwanie na potwierdzenia (${status.confirmations}/3)`;
                setTimeout(checkStatus, 30000); // Sprawdź za 30s
            } else {
                statusDiv.innerHTML = '⏳ Oczekiwanie na płatność...';
                setTimeout(checkStatus, 10000); // Sprawdź za 10s
            }
        };
        
        checkStatus();
    }
    
    copyAddress() {
        const address = document.getElementById('btcAddress');
        address.select();
        document.execCommand('copy');
        alert('Adres skopiowany!');
    }
    
    startCountdown(expiresAt) {
        const countdownEl = document.getElementById('countdown');
        
        const update = () => {
            const now = new Date();
            const diff = new Date(expiresAt) - now;
            
            if (diff <= 0) {
                countdownEl.textContent = 'WYGASŁO';
                return;
            }
            
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            setTimeout(update, 1000);
        };
        
        update();
    }
}

const paymentPage = new PaymentPage();
paymentPage.init();
```

---

## 🔄 INTEGRACJA Z SYSTEMEM FINANSOWYM

### Automatyczne tworzenie przychodu

```javascript
async function createRevenue(paymentData) {
    const { client_id, invoice_id, amount, payment_method, payment_date } = paymentData;
    
    // Generuj kod przychodu
    const year = new Date().getFullYear();
    const revenue_code = await generateRevenueCode(year);
    
    // Oblicz kwoty
    const vat_rate = 23;
    const net_amount = (amount / 1.23).toFixed(2);
    const vat_amount = (amount - net_amount).toFixed(2);
    
    // Zapisz przychód
    await db.run(`
        INSERT INTO revenue (
            revenue_code, type, source, client_id, invoice_id,
            amount, vat_rate, vat_amount, gross_amount, net_amount,
            revenue_date, payment_date, payment_method, status
        ) VALUES (?, 'payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
    `, [
        revenue_code, payment_method, client_id, invoice_id,
        net_amount, vat_rate, vat_amount, amount, net_amount,
        payment_date, payment_date, payment_method
    ]);
    
    // Automatyczne księgowanie
    await autoPostJournalEntry('revenue', revenue_code);
    
    // Aktualizuj fakturę
    if (invoice_id) {
        await db.run(`
            UPDATE sales_invoices 
            SET status = 'paid', payment_date = ?
            WHERE id = ?
        `, [payment_date, invoice_id]);
    }
    
    // Wyślij email do klienta
    await sendPaymentConfirmationEmail(client_id, {
        revenue_code,
        amount,
        payment_method,
        payment_date
    });
}
```

---

## 📊 DASHBOARD PŁATNOŚCI ONLINE

**Widgety:**
- 💳 Płatności PayPal (dziś/miesiąc)
- ₿ Płatności Bitcoin (dziś/miesiąc)
- 📊 Wykres płatności według metody
- ⏳ Oczekujące płatności Bitcoin
- 💰 Saldo portfela Bitcoin

---

## 🔐 BEZPIECZEŃSTWO

### PayPal:
- ✅ Webhook verification
- ✅ HTTPS only
- ✅ Client ID + Secret
- ✅ Sandbox dla testów

### Bitcoin:
- ✅ Unikalne adresy dla każdej płatności
- ✅ Zaszyfrowane klucze prywatne
- ✅ Minimalna liczba potwierdzeń (3)
- ✅ Monitoring blockchain

---

## 📋 CHECKLIST IMPLEMENTACJI

### PayPal:
- [ ] Konto PayPal Business
- [ ] Konfiguracja API credentials
- [ ] Webhook URL
- [ ] Testy w sandbox
- [ ] Przejście na live

### Bitcoin:
- [ ] Bitcoin Core Node (lub API)
- [ ] Generowanie adresów
- [ ] Monitoring blockchain
- [ ] Portfel Bitcoin
- [ ] Testy na testnet

### Integracja:
- [ ] Tabele w bazie danych
- [ ] Backend API
- [ ] Frontend płatności
- [ ] Automatyczne przychody
- [ ] Email notifications
- [ ] Dashboard

---

## 🚀 NASTĘPNE KROKI

1. **Dzień 1-2:** Backend PayPal + Bitcoin
2. **Dzień 3:** Frontend strony płatności
3. **Dzień 4:** Integracja z systemem finansowym
4. **Dzień 5:** Testy i deployment

---

**KONIEC DOKUMENTACJI PŁATNOŚCI ONLINE**
