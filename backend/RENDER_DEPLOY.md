# 🚀 Instrukcja wdrożenia backendu na Render.com

## 📋 Wymagania
- Hasło aplikacji Gmail (wygenerowane)
- Konto GitHub (do połączenia z Render)

---

## 🔧 Krok 1: Przygotowanie repozytorium

### 1.1 Utwórz nowe repozytorium GitHub
```
1. Wejdź na: https://github.com/new
2. Nazwa: promeritum-backend-api
3. Prywatne: TAK ✅
4. Kliknij "Create repository"
```

### 1.2 Wypchnij backend do GitHub
```bash
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\backend
git init
git add .
git commit -m "Initial backend setup for website contact form"
git branch -M main
git remote add origin https://github.com/TWOJA_NAZWA/promeritum-backend-api.git
git push -u origin main
```

---

## 🌐 Krok 2: Deploy na Render.com

### 2.1 Zarejestruj się na Render.com
```
1. Wejdź na: https://render.com/
2. Kliknij "Get Started for Free"
3. Zaloguj się przez GitHub
```

### 2.2 Utwórz nowy Web Service
```
1. Kliknij "New +" → "Web Service"
2. Połącz repozytorium: promeritum-backend-api
3. Nazwa: promeritum-backend
4. Environment: Node
5. Build Command: npm install
6. Start Command: npm start
7. Plan: FREE (wystarczający)
```

---

## 🔐 Krok 3: Konfiguracja zmiennych środowiskowych

W sekcji **"Environment Variables"** dodaj:

### Wymagane zmienne:

| Klucz | Wartość | Opis |
|-------|---------|------|
| `NODE_ENV` | `production` | Środowisko produkcyjne |
| `PORT` | `3500` | Port serwera |
| `JWT_SECRET` | `[wygeneruj losowy ciąg]` | Tajny klucz JWT (min. 32 znaki) |
| `GMAIL_USER` | `info@polska-grupa-wierzytelnosci.pl` | Twój Gmail |
| `GMAIL_APP_PASSWORD` | `[hasło aplikacji Gmail]` | 16-znakowe hasło bez spacji |
| `INQUIRY_EMAIL` | `info@polska-grupa-wierzytelnosci.pl` | Email docelowy dla zapytań |

### Generowanie JWT_SECRET:
```bash
# W PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## ✅ Krok 4: Weryfikacja

Po wdrożeniu Render poda Ci URL, np:
```
https://promeritum-backend.onrender.com
```

### Sprawdź czy działa:
```
https://promeritum-backend.onrender.com/api/health
```

Powinieneś zobaczyć:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T19:10:00.000Z"
}
```

---

## 🔄 Krok 5: Aktualizacja formularza na stronie

Po pomyślnym wdrożeniu musisz zaktualizować URL API w formularzu:

**Plik:** `kancelaria-www/index.html`

**Zmień linię 2113:**
```javascript
// PRZED:
const API_URL = 'http://localhost:3500/api/website-inquiries';

// PO:
const API_URL = 'https://promeritum-backend.onrender.com/api/website-inquiries';
```

Następnie wdróż ponownie stronę na Netlify:
```bash
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria-www
netlify deploy --prod
```

---

## 🎯 Testowanie

1. Wejdź na: https://kancelaria-pro-meritum.pl/
2. Wypełnij formularz kontaktowy
3. Wyślij
4. Sprawdź czy email przyszedł na: info@polska-grupa-wierzytelnosci.pl

---

## ⚠️ Ważne uwagi

1. **Render FREE**:
   - Usypia się po 15 min nieaktywności
   - Pierwsze żądanie po uśpieniu trwa ~30s
   - Wystarczające dla formularza kontaktowego

2. **Bezpieczeństwo**:
   - NIE commituj hasła aplikacji Gmail do repozytorium
   - Używaj tylko zmiennych środowiskowych
   - Repozytorium powinno być prywatne

3. **CORS**:
   - Backend już ma skonfigurowane CORS (`*`)
   - Formularz z Netlify będzie działał bez problemu

---

## 📞 Pomoc

Jeśli coś nie działa:
1. Sprawdź logi w Render Dashboard
2. Sprawdź czy zmienne środowiskowe są poprawnie ustawione
3. Zweryfikuj hasło aplikacji Gmail

---

✅ **Gotowe!** Twój formularz kontaktowy jest w pełni funkcjonalny!
