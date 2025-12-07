# 📧💬 Pro Meritum Komunikator

Aplikacja desktopowa łącząca funkcje klienta pocztowego i komunikatora czasu rzeczywistego dla Kancelarii Pro Meritum.

## ✨ Funkcje

### 📧 Poczta Email
- ✅ Obsługa wielu kont pocztowych (IMAP/SMTP)
- ✅ Odbieranie i wysyłanie wiadomości
- ✅ Obsługa załączników
- ✅ Integracja z Mail-in-a-Box
- ✅ Wyszukiwanie wiadomości

### 💬 Czat w czasie rzeczywistym
- ✅ Komunikacja między użytkownikami
- ✅ Wskaźnik "pisze..."
- ✅ Statusy online/offline
- ✅ Powiadomienia o nowych wiadomościach
- ✅ Historia rozmów

### 🔐 Bezpieczeństwo
- ✅ Autoryzacja JWT
- ✅ Szyfrowane połączenia
- ✅ Bezpieczne przechowywanie haseł (bcrypt)
- ✅ Sesje użytkowników

### 🎨 Interfejs
- ✅ Nowoczesny design w kolorach Pro Meritum (srebrno-złoty)
- ✅ Responsywny layout
- ✅ Intuicyjna nawigacja
- ✅ Własny titlebar

## 🚀 Instalacja

### Wymagania
- Node.js 18+ 
- npm lub yarn
- Windows/Mac/Linux

### Krok 1: Instalacja zależności

```bash
cd komunikator-app
npm install
```

### Krok 2: Konfiguracja

Skopiuj `.env.example` do `.env` i uzupełnij:

```bash
cp .env.example .env
```

Edytuj `.env`:

```env
# Konfiguracja serwera
PORT=3500
NODE_ENV=development

# Konfiguracja poczty (Mail-in-a-Box)
MAIL_HOST=mail.kancelaria-pro-meritum.pl
MAIL_PORT=993
MAIL_SECURE=true
SMTP_HOST=mail.kancelaria-pro-meritum.pl
SMTP_PORT=587
SMTP_SECURE=false

# JWT Secret (ZMIEŃ NA LOSOWY!)
JWT_SECRET=twoj_bardzo_bezpieczny_klucz_min_32_znaki_123456789
```

### Krok 3: Uruchomienie

**Tryb deweloperski:**
```bash
npm run dev
```

**Tryb produkcyjny:**
```bash
npm start
```

## 📦 Budowanie aplikacji

### Windows
```bash
npm run build:win
```
Wynik: `dist/Pro Meritum Komunikator Setup.exe`

### macOS
```bash
npm run build:mac
```
Wynik: `dist/Pro Meritum Komunikator.dmg`

### Linux
```bash
npm run build:linux
```
Wynik: `dist/Pro Meritum Komunikator.AppImage`

## 📁 Struktura projektu

```
komunikator-app/
├── main.js                 # Główny proces Electron
├── package.json
├── .env                    # Konfiguracja (NIE commituj!)
├── .env.example           # Przykładowa konfiguracja
│
├── backend/               # Backend Node.js
│   ├── server.js         # Serwer Express + Socket.IO
│   ├── database/
│   │   └── init.js       # Inicjalizacja SQLite
│   ├── routes/
│   │   ├── auth.js       # Autoryzacja
│   │   ├── mail.js       # Obsługa poczty
│   │   └── chat.js       # Obsługa czatu
│   ├── middleware/
│   │   └── auth.js       # Middleware JWT
│   └── socket/
│       └── handlers.js   # Handlery Socket.IO
│
├── frontend/             # Frontend (HTML/CSS/JS)
│   ├── index.html       # Główny plik HTML
│   ├── styles/
│   │   └── main.css     # Style aplikacji
│   └── scripts/
│       ├── api.js       # Komunikacja z API
│       ├── socket.js    # Socket.IO client
│       ├── auth.js      # Zarządzanie autoryzacją
│       ├── mail.js      # Zarządzanie pocztą
│       ├── chat.js      # Zarządzanie czatem
│       └── app.js       # Główna logika aplikacji
│
├── data/                # Baza danych (tworzona automatycznie)
│   └── komunikator.db   # SQLite database
│
└── assets/              # Zasoby (ikony, obrazy)
    ├── icon.png
    ├── icon.ico
    └── icon.icns
```

## 🔧 Konfiguracja konta pocztowego

### Dla Mail-in-a-Box:

1. Uruchom aplikację
2. Zaloguj się / Zarejestruj
3. Przejdź do zakładki "Poczta"
4. Kliknij "+ Dodaj konto"
5. Wprowadź dane:
   - **Email:** kontakt@kancelaria-pro-meritum.pl
   - **Hasło:** (hasło do konta email)
   - **Serwer IMAP:** mail.kancelaria-pro-meritum.pl
   - **Port IMAP:** 993
   - **Serwer SMTP:** mail.kancelaria-pro-meritum.pl
   - **Port SMTP:** 587

### Dla innych serwerów:

Sprawdź dokumentację swojego dostawcy poczty dla ustawień IMAP/SMTP.

## 💬 Korzystanie z czatu

1. Przejdź do zakładki "Czat"
2. Lista użytkowników pojawi się po lewej stronie
3. Kliknij na użytkownika aby rozpocząć rozmowę
4. Wpisz wiadomość i naciśnij Enter lub "Wyślij"
5. Zielona kropka = użytkownik online
6. Szara kropka = użytkownik offline

## 🎯 Skróty klawiszowe

- `Ctrl+N` - Nowa wiadomość email
- `Ctrl+1` - Przejdź do poczty
- `Ctrl+2` - Przejdź do czatu
- `Ctrl+Q` - Zamknij aplikację
- `F12` - Narzędzia deweloperskie

## 🔒 Bezpieczeństwo

### Ważne!
- **NIE** commituj pliku `.env` do repozytorium
- Zmień `JWT_SECRET` na losowy ciąg znaków (min. 32 znaki)
- Hasła są hashowane przy użyciu bcrypt
- Połączenia email używają TLS/SSL

### Generowanie bezpiecznego JWT_SECRET:

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 🐛 Rozwiązywanie problemów

### Aplikacja nie uruchamia się
```bash
# Sprawdź logi
npm start

# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules
npm install
```

### Błąd połączenia z serwerem poczty
- Sprawdź czy Mail-in-a-Box działa
- Sprawdź ustawienia IMAP/SMTP
- Sprawdź firewall/port forwarding

### Czat nie działa
- Sprawdź czy backend działa (port 3500)
- Sprawdź konsolę deweloperską (F12)
- Sprawdź połączenie Socket.IO

### Baza danych
```bash
# Usuń bazę danych (UWAGA: usunie wszystkie dane!)
rm data/komunikator.db

# Aplikacja utworzy nową przy następnym uruchomieniu
```

## 📊 Baza danych

Aplikacja używa SQLite z następującymi tabelami:

- `users` - Użytkownicy
- `chat_messages` - Wiadomości czatu
- `email_accounts` - Konta pocztowe
- `sessions` - Sesje użytkowników

## 🔄 Aktualizacja

```bash
git pull
npm install
npm start
```

## 📝 Licencja

© 2025 Pro Meritum - Kancelaria Radców Prawnych

## 🆘 Wsparcie

W razie problemów:
1. Sprawdź dokumentację
2. Sprawdź logi w konsoli
3. Skontaktuj się z administratorem

## 🎉 Gotowe!

Aplikacja jest gotowa do użycia. Miłego korzystania! 🚀
