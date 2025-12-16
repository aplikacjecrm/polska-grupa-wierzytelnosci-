# 📧 Gmail API - Instrukcja Konfiguracji

## 🎯 Cel
Integracja Gmail API z aplikacją Promeritum Komunikator do obsługi emaili:
- **info@polska-grupa-wierzytelnosci.pl**
- **info@kancelaria-pro-meritum.pl** (alias)

---

## 📋 KROK 1: Google Cloud Console - Stwórz Projekt

### 1.1 Wejdź na Google Cloud Console
```
https://console.cloud.google.com
```

### 1.2 Stwórz nowy projekt
1. Kliknij **"Select a project"** (góra strony)
2. Kliknij **"New Project"**
3. Wypełnij:
   - **Project name:** `Promeritum Gmail Integration`
   - **Location:** polska-grupa-wierzytelnosci.pl (jeśli dostępne)
4. Kliknij **"Create"**
5. Poczekaj 10-30 sekund na utworzenie

---

## 📋 KROK 2: Włącz Gmail API

### 2.1 Przejdź do API Library
```
Menu → APIs & Services → Library
```

### 2.2 Szukaj Gmail API
1. W wyszukiwarce wpisz: **"Gmail API"**
2. Kliknij **Gmail API** (Google)
3. Kliknij **"Enable"** (niebieski przycisk)
4. Poczekaj na aktywację

---

## 📋 KROK 3: Konfiguruj OAuth Consent Screen

### 3.1 Przejdź do OAuth consent screen
```
Menu → APIs & Services → OAuth consent screen
```

### 3.2 Wybierz typ użytkownika
- **Internal** (jeśli masz Google Workspace) ✅ ZALECANE
- **External** (dla wszystkich użytkowników Gmail)

### 3.3 Wypełnij formularz

**App information:**
```
App name: Promeritum Komunikator
User support email: info@polska-grupa-wierzytelnosci.pl
```

**App domain:**
```
Application home page: https://promeritum-komunikator-v2.onrender.com
Application privacy policy: https://kancelaria-pro-meritum.pl/privacy (opcjonalne)
Application terms of service: https://kancelaria-pro-meritum.pl/terms (opcjonalne)
```

**Developer contact:**
```
Email: info@polska-grupa-wierzytelnosci.pl
```

### 3.4 Scopes (zakres uprawnień)
Kliknij **"Add or Remove Scopes"** i dodaj:
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.labels
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

### 3.5 Test users (tylko dla External)
Jeśli wybrano External, dodaj emaile użytkowników:
```
info@polska-grupa-wierzytelnosci.pl
(inne adresy pracowników)
```

---

## 📋 KROK 4: Stwórz OAuth 2.0 Credentials

### 4.1 Przejdź do Credentials
```
Menu → APIs & Services → Credentials
```

### 4.2 Stwórz OAuth Client ID
1. Kliknij **"Create Credentials"**
2. Wybierz **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **"Promeritum Backend"**

### 4.3 Authorized redirect URIs
Dodaj te URL (po kolei):
```
http://localhost:3500/api/gmail/callback
https://promeritum-komunikator-v2.onrender.com/api/gmail/callback
```

### 4.4 Pobierz credentials
1. Kliknij **"Create"**
2. Pojawi się okno z **Client ID** i **Client Secret**
3. Kliknij **"Download JSON"**
4. Zapisz plik jako: `credentials.json`

---

## 📋 KROK 5: Dodaj credentials do projektu

### 5.1 Skopiuj credentials.json
Przenieś plik do:
```
backend/config/gmail-credentials.json
```

### 5.2 Dodaj do .env
Otwórz `backend/.env` i dodaj:
```env
# Gmail API
GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3500/api/gmail/callback
```

### 5.3 Dodaj do .gitignore
```
backend/config/gmail-credentials.json
backend/config/gmail-token.json
```

---

## 📋 KROK 6: Zainstaluj zależności

```bash
cd backend
npm install googleapis @google-cloud/local-auth
```

---

## 🚀 KROK 7: Pierwsze uruchomienie

### 7.1 Uruchom backend
```bash
cd backend
node server.js
```

### 7.2 Autoryzuj konto Gmail
1. Otwórz przeglądarkę: `http://localhost:3500`
2. Zaloguj się do Promeritum
3. Kliknij **"Poczta"** w menu
4. Kliknij **"Połącz z Gmail"**
5. Zaloguj się na: **info@polska-grupa-wierzytelnosci.pl**
6. Zaakceptuj uprawnienia

### 7.3 Token zostanie zapisany
System automatycznie zapisze token w:
```
backend/config/gmail-token.json
```

---

## ✅ Gotowe!

Teraz możesz:
- 📥 Odbierać emaile z obu kont
- 📤 Wysyłać emaile z wybranego konta
- 💬 Odpowiadać na wiadomości
- 🏷️ Zarządzać labelami
- 🔍 Wyszukiwać wiadomości

---

## 🔒 Bezpieczeństwo

### Ważne pliki do chronienia:
```
backend/config/gmail-credentials.json  ← NIE COMMITUJ!
backend/config/gmail-token.json        ← NIE COMMITUJ!
backend/.env                           ← NIE COMMITUJ!
```

### Refresh token
Token automatycznie odświeża się co 60 minut.

---

## 🐛 Troubleshooting

### Problem: "Redirect URI mismatch"
**Rozwiązanie:** Sprawdź czy URL w Google Cloud Console pasuje dokładnie do tego w kodzie.

### Problem: "Access blocked: This app's request is invalid"
**Rozwiązanie:** Dodaj swojego użytkownika jako Test User w OAuth consent screen.

### Problem: "Token has been expired or revoked"
**Rozwiązanie:** Usuń `gmail-token.json` i autoryzuj ponownie.

---

## 📞 Wsparcie

W razie problemów:
- Sprawdź logi: `backend/server.log`
- Sprawdź Google Cloud Console: https://console.cloud.google.com
