# 🔐 System Logowania - Pro Meritum Komunikator

## 📧 Domeny Email i Role

System automatycznie rozpoznaje rolę użytkownika na podstawie domeny email:

| Domena | Rola | Dostęp |
|--------|------|--------|
| `@pro-meritum.pl` | **Administrator** | Pełny dostęp do systemu + ustawienia |
| `@kancelaria-pro-meritum.pl` | **Mecenas/Prawnik** | CRM, sprawy, klienci, kalendarz, dokumenty |
| Inne (np. `@gmail.com`) | **Klient** | Tylko swoje sprawy i dokumenty |

---

## 👨‍💼 Logowanie Administratora

**Email:** `admin@pro-meritum.pl`  
**Hasło:** `admin123`

### Utworzenie konta administratora:

```bash
cd backend
node scripts/create-admin.js
```

---

## 👔 Logowanie Mecenasa

### Rejestracja nowego mecenasa:

1. Kliknij "Rejestracja" na ekranie logowania
2. Wpisz dane:
   - **Email:** `jan.kowalski@kancelaria-pro-meritum.pl`
   - **Hasło:** (wybierz bezpieczne hasło)
   - **Imię i nazwisko:** Jan Kowalski
3. System automatycznie przypisze rolę "lawyer"

### Logowanie:

Użyj swojego emailu `@kancelaria-pro-meritum.pl` i hasła.

---

## 👤 Logowanie Klienta

### Jak klient może założyć konto?

**Klient NIE może sam się zarejestrować!** Konto musi utworzyć mecenas.

### Proces aktywacji konta klienta:

1. **Mecenas dodaje klienta w CRM:**
   - Przejdź do CRM → Klienci
   - Kliknij "➕ Nowy klient"
   - Wypełnij dane **z adresem email**
   - Zapisz

2. **Klient aktywuje konto:**
   - Klient klika "Rejestracja" na ekranie logowania
   - Wpisuje swój email (ten sam co w bazie klientów)
   - Ustawia hasło
   - System sprawdza czy email istnieje w bazie klientów
   - Jeśli TAK → konto zostaje aktywowane
   - Jeśli NIE → błąd "Skontaktuj się z kancelarią"

3. **Klient loguje się:**
   - Email: (adres podany przez kancelarię)
   - Hasło: (ustawione podczas aktywacji)

---

## 🔒 Bezpieczeństwo

- Hasła są hashowane (bcrypt)
- Tokeny JWT ważne 7 dni
- Klienci widzą tylko swoje sprawy
- Usuwanie klienta wymaga hasła administratora: `Proadmin`

---

## ⚙️ Konfiguracja

### Zmiana domeny kancelarii:

Edytuj plik `backend/routes/auth.js`:

```javascript
if (emailDomain === 'pro-meritum.pl') {
  userRole = 'admin';
} else if (emailDomain === 'kancelaria-pro-meritum.pl') {
  userRole = 'lawyer';
}
```

Zmień na swoją domenę.

---

## 🆘 Problemy?

### "Nieprawidłowy email lub hasło"

- Sprawdź czy email jest poprawny
- Sprawdź czy konto zostało utworzone (admin/mecenas) lub aktywowane (klient)

### "Nie znaleziono klienta z tym adresem email"

- Klient musi najpierw być dodany do bazy przez mecenasa
- Sprawdź czy email w bazie klientów jest identyczny

### "Konto już zostało aktywowane"

- Klient już ma konto, może się zalogować
- Użyj opcji "Logowanie" zamiast "Rejestracja"

---

## 📝 Przykłady

### Przykładowe konta testowe:

```
Admin:
Email: admin@pro-meritum.pl
Hasło: admin123

Mecenas:
Email: jan.kowalski@kancelaria-pro-meritum.pl
Hasło: (ustawione podczas rejestracji)

Klient:
Email: test@gmail.com (musi być w bazie klientów!)
Hasło: (ustawione podczas aktywacji)
```
