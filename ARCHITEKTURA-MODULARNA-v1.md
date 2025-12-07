# 🏗️ ARCHITEKTURA MODULARNA - PROFESJONALNA SPECYFIKACJA

## 🎯 CELE ARCHITEKTURY

### Zasady projektowania:
1. **Modułowość** - każdy moduł niezależny
2. **Rozszerzalność** - łatwe dodawanie funkcji
3. **Nie blokuj rozwoju** - architektura otwarta
4. **Event-driven** - komunikacja przez event bus
5. **API-first** - wszystko przez API
6. **Single Responsibility** - jeden moduł = jedna odpowiedzialność

---

## 📊 MAPA MODUŁÓW

```
┌─────────────────────────────────────────────────────────┐ 
│                    FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │   │
│  │   Admina    │  │  Mecenasa   │  │  Opiekuna   │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                           │                             │
│         ┌─────────────────▼─────────────────┐          │
│         │      EVENT BUS (window.eventBus)  │          │
│         └─────────────────┬─────────────────┘          │
│                           │                             │
│    ┌──────────────────────┼──────────────────────┐    │
│    │                      │                      │    │
│  ┌─▼─────────┐  ┌────────▼─────┐  ┌────────────▼─┐  │
│  │  Moduł    │  │   Moduł      │  │    Moduł     │  │
│  │ Płatności │  │   Kosztów    │  │    Czatu     │  │
│  └─────┬─────┘  └──────┬───────┘  └──────┬───────┘  │
│        │                │                  │          │
│        └────────────────┴──────────────────┘          │
│                         │                              │
│         ┌───────────────▼───────────────┐             │
│         │   API CLIENT (window.api)    │             │
│         └───────────────┬───────────────┘             │
└─────────────────────────┼─────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────┐
│                    BACKEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  /auth   │  │  /cases  │  │  /events │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │             │              │                  │
│       └─────────────┴──────────────┘                  │
│                     │                                  │
│       ┌─────────────▼─────────────┐                  │
│       │   MIDDLEWARE (auth, etc)  │                  │
│       └─────────────┬─────────────┘                  │
│                     │                                  │
│       ┌─────────────▼─────────────┐                  │
│       │   DATABASE (SQLite/PG)    │                  │
│       └───────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 MODUŁ CZATU - INTEGRACJA KOMPLETNA

### Obecny stan czatu:
✅ `scripts/chat.js` - istniejący moduł
✅ Tabela `chat_messages` w bazie
✅ WebSocket dla real-time (opcjonalnie)

### Integracje czatu z nowymi modułami:

#### 1. Czat + Dashboard Admina
```javascript
// Admin widzi statystyki czatu
stats.totalMessages: liczba wiadomości
stats.unreadMessages: nieprzeczytane
stats.activeConversations: aktywne rozmowy

// Event bus
eventBus.on('chat:newMessage', (data) => {
  adminPanel.incrementMessageCount();
  adminPanel.showNotification('Nowa wiadomość');
});
```

#### 2. Czat + Dashboard Mecenasa
`
// Mecenas widzi czaty ze swoimi klientami
async loadMyChats() {
  const chats = await api.request('/chat/my-conversations');
  // Tylko klienci przypisani do tego mecenasa
}

// Quick reply z dashboardu
quickReply(clientId, message) {
  eventBus.emit('chat:sendMessage', { to: clientId, text: message });
}
```

#### 3. Czat + Dashboard Klienta
```javascript
// Klient widzi czat z mecenasem
async loadLawyerChat() {
  const messages = await api.request('/chat/with-lawyer');
}

// Powiadomienia
eventBus.on('chat:lawyerReplied', (data) => {
  clientDashboard.showNotification('Mecenas odpowiedział');
});
```

#### 4. Czat + Moduł Płatności
```javascript
// Auto-wiadomość po płatności
eventBus.on('payment:completed', (data) => {
  chatModule.sendAutoMessage({
    to: data.clientId,
    text: `✅ Płatność ${data.amount} PLN potwierdzona. Dziękujemy!`
  });
});
```

#### 5. Czat + Moduł Spraw
```javascript
// Czat powiązany ze sprawą
eventBus.on('case:messageAdded', (data) => {
  chatModule.linkMessageToCase(data.messageId, data.caseId);
});

// Szybki dostęp do czatu ze sprawy
viewCaseChat(caseId) {
  chatModule.openConversationForCase(caseId);
}
```

---

## 🔄 EVENT BUS - CENTRALNA KOMUNIKACJA

### Istniejący event bus:
```javascript
// frontend/scripts/event-bus.js (już istnieje!)
window.eventBus = {
  emit(event, data) { ... },
  on(event, callback) { ... },
  off(event, callback) { ... }
};
```

### Nowe eventy dla dashboardów:

```javascript
// DASHBOARD EVENTS
'dashboard:refresh' - odśwież dane
'dashboard:statsUpdated' - statystyki zaktualizowane
'dashboard:alertShow' - pokaż alert

// PAYMENT EVENTS
'payment:initiated' - rozpoczęto płatność
'payment:completed' - płatność zakończona
'payment:failed' - płatność nieudana
'payment:reminder' - przypomnienie o płatności

// CHAT EVENTS
'chat:newMessage' - nowa wiadomość
'chat:messageRead' - wiadomość przeczytana
'chat:typing' - ktoś pisze
'chat:conversationOpened' - otwarto rozmowę

// USER EVENTS
'user:created' - nowy użytkownik
'user:updated' - zaktualizowano użytkownika
'user:deleted' - usunięto użytkownika
'user:login' - logowanie
'user:logout' - wylogowanie

// CASE EVENTS
'case:created' - nowa sprawa
'case:updated' - zaktualizowano sprawę
'case:assigned' - przypisano sprawę
'case:statusChanged' - zmiana statusu

// COST EVENTS
'cost:added' - dodano koszt
'cost:paid' - opłacono koszt
'cost:overdue' - koszt przeterminowany

// GOOGLE EVENTS
'google:folderCreated' - folder utworzony
'google:fileUploaded' - plik wgrany
'google:emailSent' - email wysłany
```

---

## 📁 STRUKTURA PLIKÓW - MODULARNA

```
komunikator-app/
├── backend/
│   ├── routes/
│   │   ├── auth.js              ✅ Istniejące
│   │   ├── cases.js             ✅
│   │   ├── clients.js           ✅
│   │   ├── events.js            ✅
│   │   ├── chat.js              ✅
│   │   ├── payments.js          🆕 NOWE - płatności
│   │   ├── costs.js             🆕 NOWE - koszty
│   │   ├── wallets.js           🆕 NOWE - portfele
│   │   ├── invoices.js          🆕 NOWE - faktury
│   │   ├── google-drive.js      🆕 NOWE - Drive API
│   │   ├── gmail.js             🆕 NOWE - Gmail API
│   │   └── leads.js             🆕 NOWE - formularze/leady
│   │
│   ├── services/
│   │   ├── payment-processor.js 🆕 NOWE - logika płatności
│   │   ├── invoice-generator.js 🆕 NOWE - generowanie faktur
│   │   ├── google-oauth.js      🆕 NOWE - OAuth Google
│   │   ├── email-sender.js      🆕 NOWE - wysyłka emaili
│   │   └── notification.js      🆕 NOWE - powiadomienia
│   │
│   ├── middleware/
│   │   ├── auth.js              ✅ Istniejące
│   │   ├── rbac.js              🆕 NOWE - uprawnienia
│   │   └── rate-limit.js        🆕 NOWE - limity API
│   │
│   └── database/
│       ├── init.js              ✅ Istniejące
│       └── migrations/          🆕 NOWE - migracje
│           ├── 001-payments.js
│           ├── 002-wallets.js
│           └── 003-google.js
│
├── frontend/
│   ├── scripts/
│   │   ├── app.js               ✅ Główna aplikacja
│   │   ├── api.js               ✅ API client
│   │   ├── event-bus.js         ✅ Event bus
│   │   ├── chat.js              ✅ Czat
│   │   │
│   │   ├── dashboards/          🆕 NOWE FOLDERY
│   │   │   ├── admin-dashboard.js
│   │   │   ├── lawyer-dashboard.js
│   │   │   ├── manager-dashboard.js
│   │   │   └── client-dashboard.js
│   │   │
│   │   ├── modules/
│   │   │   ├── payments-module.js    🆕 NOWE
│   │   │   ├── costs-module.js       🆕 NOWE
│   │   │   ├── invoices-module.js    🆕 NOWE
│   │   │   ├── wallet-module.js      🆕 NOWE
│   │   │   ├── email-dashboard.js    🆕 NOWE
│   │   │   ├── leads-module.js       🆕 NOWE
│   │   │   ├── witnesses-module.js   ✅ Istniejące
│   │   │   ├── evidence-module.js    ✅
│   │   │   └── scenarios-module.js   ✅
│   │   │
│   │   └── components/
│   │       ├── chart-wrapper.js      🆕 Wrapper Chart.js
│   │       ├── notification.js       🆕 System notyfikacji
│   │       └── modal.js              🆕 Uniwersalne modale
│   │
│   └── styles/
│       ├── main.css             ✅
│       ├── dashboards.css       🆕 Style dashboardów
│       └── modules.css          🆕 Style modułów
│
└── docs/
    ├── API.md                   🆕 Dokumentacja API
    ├── EVENTS.md                🆕 Lista eventów
    └── MODULES.md               🆕 Dokumentacja modułów
```

---

## 🔐 ZASADY NIE BLOKOWANIA ROZWOJU

### 1. **Każdy moduł jest niezależny**
```javascript
// ❌ ŹLE - bezpośrednie wywołanie
function paymentCompleted() {
  chatModule.sendMessage(); // Zależność!
  dashboardAdmin.refresh(); // Zależność!
}

// ✅ DOBRZE - event bus
function paymentCompleted() {
  eventBus.emit('payment:completed', { amount, clientId });
  // Inne moduły same nasłuchują
}
```

### 2. **API endpoints są atomowe**
```javascript
// ❌ ŹLE - endpoint robi za dużo
POST /api/payments/process
  - zapisz płatność
  - wyślij email
  - zaktualizuj dashboard
  - wyślij SMS

// ✅ DOBRZE - atomowe endpointy
POST /api/payments           - tylko zapis
POST /api/emails/send        - tylko email
POST /api/notifications      - tylko notyfikacje
```

### 3. **Baza danych jest rozszerzalna**
```sql
-- ✅ DOBRZE - kolumny JSON dla rozszerzeń
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  amount DECIMAL(10,2),
  metadata TEXT,  -- JSON z dowolnymi danymi
  extra_data TEXT -- JSON dla przyszłych pól
);
```

### 4. **Frontend nie zakłada struktury backendu**
```javascript
// ❌ ŹLE - założenie o strukturze
const userName = response.data.user.profile.name;

// ✅ DOBRZE - bezpieczne pobieranie
const userName = response.data?.user?.profile?.name || 'Nieznany';
```

### 5. **Każdy moduł ma własny namespace**
```javascript
// ✅ DOBRZE - namespace'y
window.adminDashboard = new AdminDashboard();
window.lawyerDashboard = new LawyerDashboard();
window.paymentsModule = new PaymentsModule();
window.costsModule = new CostsModule();
window.chatModule = new ChatModule();

// Nie kolidują ze sobą!
```

---

## 🎯 PLAN IMPLEMENTACJI - PRZEMYŚLANY

### FAZA 1: Fundament (Tydzień 1)
1. ✅ Rozbudowa admin-panel.js (statystyki + wykresy)
2. 🆕 Stworzenie `dashboards/` folder
3. 🆕 Przeniesienie admin-panel → admin-dashboard.js
4. 🆕 Event bus - nowe eventy
5. 🆕 API client - rozszerzenie

### FAZA 2: Dashboardy (Tydzień 1-2)
1. 🆕 lawyer-dashboard.js (niezależny moduł)
2. 🆕 manager-dashboard.js (niezależny moduł)
3. 🆕 client-dashboard.js (rozbudowa istniejącego)
4. 🆕 Integracja z czatem (event bus)

### FAZA 3: System płatności (Tydzień 3-4)
1. 🆕 Migracja bazy - tabele płatności
2. 🆕 Backend API - payments, wallets, installments
3. 🆕 Frontend moduł - payments-module.js
4. 🆕 Integracje PayPal, BLIK, Stripe
5. 🆕 Event bus integration

### FAZA 4: Moduł kosztów (Tydzień 5-6)
1. 🆕 Migracja bazy - tabele kosztów
2. 🆕 Backend API - costs, invoices
3. 🆕 Frontend moduł - costs-module.js
4. 🆕 Generator faktur PDF
5. 🆕 Event bus integration

### FAZA 5: Google Workspace (Tydzień 7-8)
1. 🆕 Google OAuth setup
2. 🆕 Backend services - Drive, Gmail
3. 🆕 Frontend moduł - email-dashboard.js
4. 🆕 Formularz kontaktowy + leads
5. 🆕 Auto-lead processing

---

## ✅ CHECKLIST PRZED KAŻDYM KROKIEM

Przed dodaniem nowego modułu sprawdź:

- [ ] Czy moduł jest niezależny?
- [ ] Czy komunikacja przez event bus?
- [ ] Czy API endpoint jest atomowy?
- [ ] Czy baza danych jest rozszerzalna?
- [ ] Czy nie blokuję innych modułów?
- [ ] Czy namespace jest unikalny?
- [ ] Czy czat jest zintegrowany?
- [ ] Czy dashboard widzi ten moduł?
- [ ] Czy dokumentacja jest aktualna?
- [ ] Czy testy przechodzą?

---

## 🚀 GOTOWOŚĆ DO KONTYNUACJI

**Status:** ✅ Architektura przemyślana
**Bezpieczeństwo:** ✅ Nie blokujemy rozwoju
**Modułowość:** ✅ Każdy moduł niezależny
**Czat:** ✅ Zintegrowany we wszystkim
**Event Bus:** ✅ Centralna komunikacja

---

**Czy mogę kontynuować implementację zgodnie z tą architekturą?**
