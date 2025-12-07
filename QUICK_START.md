# 🚀 Szybki start - Pro Meritum Komunikator

## ⚡ W 5 minut do działającej aplikacji!

### 1️⃣ Instalacja (2 min)

```bash
cd komunikator-app
npm install
```

### 2️⃣ Konfiguracja (1 min)

Skopiuj i edytuj plik `.env`:

```bash
cp .env.example .env
```

**Zmień w pliku `.env`:**
```env
JWT_SECRET=WPISZ_TUTAJ_LOSOWY_CIAG_MIN_32_ZNAKI
```

**Generuj losowy klucz:**
```bash
# W PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 3️⃣ Uruchomienie (1 min)

```bash
npm start
```

### 4️⃣ Pierwsze użycie (1 min)

1. **Zarejestruj się:**
   - Kliknij zakładkę "Rejestracja"
   - Wpisz: imię, email, hasło
   - Kliknij "Zarejestruj się"

2. **Dodaj konto email:**
   - Przejdź do "Poczta"
   - Kliknij "+ Dodaj konto"
   - Wpisz dane serwera Mail-in-a-Box:
     ```
     Email: kontakt@kancelaria-pro-meritum.pl
     Hasło: [hasło email]
     IMAP: mail.kancelaria-pro-meritum.pl:993
     SMTP: mail.kancelaria-pro-meritum.pl:587
     ```

3. **Gotowe!** 🎉

---

## 📋 Checklist

- [ ] Node.js zainstalowany
- [ ] `npm install` wykonane
- [ ] Plik `.env` skonfigurowany
- [ ] `JWT_SECRET` zmieniony
- [ ] Aplikacja uruchomiona
- [ ] Konto użytkownika utworzone
- [ ] Konto email dodane

---

## 🆘 Problemy?

### Błąd: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Błąd: "Port 3500 already in use"
Zmień `PORT` w pliku `.env`:
```env
PORT=3501
```

### Nie mogę połączyć się z serwerem email
- Sprawdź czy Mail-in-a-Box działa
- Sprawdź dane logowania
- Sprawdź połączenie internetowe

---

## 📚 Więcej informacji

- **Pełna dokumentacja:** `README.md`
- **Instrukcja użytkownika:** `INSTRUKCJA_UZYTKOWNIKA.md`
- **Historia zmian:** `CHANGELOG.md`

---

## 🎯 Następne kroki

1. Zaproś innych użytkowników
2. Przetestuj czat
3. Wyślij testowego emaila
4. Skonfiguruj ustawienia
5. Zbuduj aplikację: `npm run build:win`

**Miłego korzystania! 🚀**
