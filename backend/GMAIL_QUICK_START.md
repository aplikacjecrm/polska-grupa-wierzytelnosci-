# 📧 Gmail API - Quick Start Guide

## ✅ Gmail już działa dla domen:
- **info@polska-grupa-wierzytelnosci.pl** ✓
- **info@kancelaria-pro-meritum.pl** (alias) ✓

---

## 🚀 Szybki Start

### KROK 1: Zainstaluj zależności
```bash
cd backend
npm install googleapis
```

### KROK 2: Konfiguracja Google Cloud Console
Przejdź do pełnej instrukcji: `GMAIL_API_SETUP.md`

**Szybka ścieżka:**
1. https://console.cloud.google.com
2. Nowy projekt: "Promeritum Gmail Integration"
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Pobierz `credentials.json` → zapisz jako `backend/config/gmail-credentials.json`

### KROK 3: Dodaj do .env
```env
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:3500/api/gmail/callback
```

### KROK 4: Uruchom backend
```bash
cd backend
node server.js
```

### KROK 5: Połącz Gmail (PIERWSZE URUCHOMIENIE)
1. Otwórz aplikację Promeritum: http://localhost:3500
2. Zaloguj się
3. Kliknij **"Poczta"** w menu
4. Kliknij **"Połącz z Gmail"**
5. Zaloguj się na: **info@polska-grupa-wierzytelnosci.pl**
6. Zaakceptuj uprawnienia

**Token zostanie zapisany automatycznie!**

---

## 📧 Jak używać w aplikacji

### API Endpoints (dla frontendu):

#### 1. Sprawdź status
```javascript
GET /api/gmail/status
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "authorized": true,
  "profile": {
    "email": "info@polska-grupa-wierzytelnosci.pl",
    "messagesTotal": 1234,
    "threadsTotal": 456
  }
}
```

#### 2. Pobierz wiadomości
```javascript
GET /api/gmail/messages?maxResults=20
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "messages": [
    {
      "id": "abc123",
      "from": "klient@example.com",
      "subject": "Zapytanie",
      "snippet": "Witam, mam pytanie...",
      "date": "2024-12-16T01:30:00Z"
    }
  ]
}
```

#### 3. Wyślij wiadomość
```javascript
POST /api/gmail/send
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "to": "klient@example.com",
  "subject": "Odpowiedź",
  "body": "<p>Dzień dobry,</p><p>Odpowiadając na Pana pytanie...</p>",
  "from": "info@polska-grupa-wierzytelnosci.pl"
}

Response:
{
  "success": true,
  "message": "Wiadomość wysłana",
  "messageId": "xyz789"
}
```

#### 4. Odpowiedz na wiadomość
```javascript
POST /api/gmail/reply/abc123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "body": "<p>Dziękujemy za wiadomość...</p>",
  "from": "info@kancelaria-pro-meritum.pl"
}
```

---

## 💻 Przykład użycia w Frontend

### Komponenta "Poczta" - mail.html

```javascript
// Sprawdź status Gmail
async function checkGmailStatus() {
  const response = await fetch('/api/gmail/status', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const data = await response.json();
  
  if (data.authorized) {
    console.log('✅ Gmail połączony:', data.profile.email);
    loadMessages();
  } else {
    showConnectButton();
  }
}

// Połącz z Gmail
async function connectGmail() {
  const response = await fetch('/api/gmail/auth-url', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const data = await response.json();
  
  // Otwórz okno autoryzacji
  window.open(data.authUrl, 'gmail-auth', 'width=600,height=700');
}

// Załaduj wiadomości
async function loadMessages() {
  const response = await fetch('/api/gmail/messages?maxResults=50', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const data = await response.json();
  
  displayMessages(data.messages);
}

// Wyślij wiadomość
async function sendEmail(to, subject, body, from = 'info@polska-grupa-wierzytelnosci.pl') {
  const response = await fetch('/api/gmail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to, subject, body, from })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('✅ Wiadomość wysłana!');
    loadMessages(); // Odśwież listę
  }
}
```

---

## 🎨 UI Sugestie

### Przycisk "Połącz z Gmail"
```html
<button onclick="connectGmail()" class="gmail-connect-btn">
  <img src="gmail-icon.png" alt="Gmail">
  Połącz z Gmail
</button>
```

### Wybór konta nadawcy
```html
<select id="fromEmail">
  <option value="info@polska-grupa-wierzytelnosci.pl">
    Polska Grupa Wierzytelności
  </option>
  <option value="info@kancelaria-pro-meritum.pl">
    Kancelaria Pro Meritum
  </option>
</select>
```

### Lista wiadomości
```html
<div class="email-list">
  <div class="email-item" onclick="openEmail('abc123')">
    <div class="email-from">Jan Kowalski <jan@example.com></div>
    <div class="email-subject">Zapytanie o sprawę</div>
    <div class="email-snippet">Dzień dobry, chciałbym zapytać...</div>
    <div class="email-date">2 godziny temu</div>
  </div>
</div>
```

---

## 🔧 Deployment na Render.com

### 1. Dodaj zmienne środowiskowe w Render
```
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REDIRECT_URI=https://promeritum-komunikator-v2.onrender.com/api/gmail/callback
```

### 2. Zaktualizuj Authorized redirect URIs w Google Cloud
Dodaj:
```
https://promeritum-komunikator-v2.onrender.com/api/gmail/callback
```

### 3. Commit i push
```bash
git add .
git commit -m "Add Gmail API integration"
git push origin master
```

### 4. Po deploy - autoryzuj Gmail
1. Wejdź na: https://promeritum-komunikator-v2.onrender.com
2. Połącz Gmail
3. Token zostanie zapisany w bazie/config

---

## ⚠️ Ważne

### Token Refresh
Token automatycznie się odświeża. Jeśli wygaśnie, usuń `config/gmail-token.json` i autoryzuj ponownie.

### Bezpieczeństwo
- ❌ NIE commituj `config/gmail-credentials.json`
- ❌ NIE commituj `config/gmail-token.json`
- ✅ Dodaj do `.gitignore`

### Rate Limits
Gmail API ma limity:
- 1 miliard requestów/dzień (praktycznie nieograniczone)
- Nie ma problemów dla typowego użycia kancelarii

---

## 📞 Potrzebujesz pomocy?

1. Sprawdź logi: `backend/server.log`
2. Sprawdź Google Cloud Console: https://console.cloud.google.com
3. Pełna dokumentacja: `GMAIL_API_SETUP.md`

---

## ✅ Checklist

- [ ] Node.js packages zainstalowane (`googleapis`)
- [ ] Google Cloud projekt utworzony
- [ ] Gmail API włączony
- [ ] OAuth credentials pobrane
- [ ] `config/gmail-credentials.json` skopiowany
- [ ] `.env` zaktualizowany
- [ ] Backend uruchomiony
- [ ] Gmail połączony przez UI
- [ ] Token zapisany
- [ ] Testowane wysyłanie/odbieranie

**Po wszystkim - gotowe! 🎉**
