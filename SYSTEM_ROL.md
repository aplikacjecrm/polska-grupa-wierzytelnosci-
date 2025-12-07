# 👥 System Ról i Uprawnień - Portal Klienta

## 🎯 Przegląd systemu

Aplikacja obsługuje **dwa typy użytkowników** z różnymi uprawnieniami:

### 👔 **Pracownicy kancelarii**
- **Admin** - Pełne uprawnienia
- **Lawyer** (Radca prawny) - Zarządzanie sprawami i klientami
- **Assistant** (Asystent) - Pomoc w obsłudze spraw

### 👤 **Klienci**
- **Client** - Dostęp tylko do swoich spraw

---

## 🔐 Uprawnienia

### ✅ Pracownicy (Admin, Lawyer, Assistant)

**Mogą:**
- ✅ Widzieć wszystkie sprawy i klientów
- ✅ Dodawać nowych klientów
- ✅ Tworzyć nowe sprawy
- ✅ Edytować sprawy
- ✅ Dodawać notatki (w tym wewnętrzne)
- ✅ Widzieć wewnętrzne notatki
- ✅ Dodawać komentarze (publiczne i wewnętrzne)
- ✅ Zarządzać dokumentami
- ✅ Tworzyć wydarzenia w kalendarzu
- ✅ Czatować z klientami i pracownikami
- ✅ Przyznawać dostęp klientom do spraw

**Nie mogą:**
- ❌ (Brak ograniczeń dla pracowników)

### 👤 Klienci

**Mogą:**
- ✅ Widzieć tylko swoje sprawy
- ✅ Czytać publiczne notatki
- ✅ Dodawać komentarze do swoich spraw
- ✅ Widzieć dokumenty swoich spraw
- ✅ Widzieć wydarzenia związane ze swoimi sprawami
- ✅ Czatować z pracownikami kancelarii
- ✅ Otrzymywać powiadomienia o postępach

**Nie mogą:**
- ❌ Widzieć spraw innych klientów
- ❌ Widzieć wewnętrznych notatek
- ❌ Edytować spraw
- ❌ Dodawać nowych klientów
- ❌ Tworzyć nowych spraw
- ❌ Widzieć wewnętrznych komentarzy pracowników

---

## 📋 Jak to działa?

### 1️⃣ **Tworzenie konta klienta**

**Krok 1: Pracownik dodaje klienta w CRM**
```
Klienci i Sprawy → + Nowy klient
Imię: Jan
Nazwisko: Kowalski
Email: jan.kowalski@example.com
Telefon: 123-456-789
```

**Krok 2: Pracownik tworzy konto użytkownika dla klienta**
```
Ustawienia → Zarządzanie użytkownikami → + Nowy użytkownik
Email: jan.kowalski@example.com
Hasło: (wygenerowane lub ustalone)
Rola: Client
Powiąż z klientem: Jan Kowalski
```

**Krok 3: Klient otrzymuje dane logowania**
- Email z linkiem do aplikacji
- Login: jan.kowalski@example.com
- Hasło: (tymczasowe, do zmiany przy pierwszym logowaniu)

### 2️⃣ **Przypisywanie sprawy do klienta**

Sprawy są automatycznie widoczne dla klienta, jeśli:
- Sprawa jest przypisana do jego profilu klienta
- Pracownik przyznał mu dostęp przez `case_access`

**Automatyczne przypisanie:**
```
Nowa sprawa → Wybierz klienta: Jan Kowalski
```
Klient automatycznie widzi tę sprawę.

**Ręczne przyznanie dostępu:**
```
Otwórz sprawę → Dostęp → + Dodaj użytkownika
Wybierz: jan.kowalski@example.com
Poziom dostępu: view (tylko odczyt)
```

### 3️⃣ **Komentarze do spraw**

**Pracownik dodaje komentarz:**
```javascript
POST /api/comments
{
  "case_id": 123,
  "comment": "Przygotowałem pozew, wysłany do sądu",
  "is_internal": false  // Klient zobaczy
}
```

**Klient dodaje komentarz:**
```javascript
POST /api/comments
{
  "case_id": 123,
  "comment": "Czy mogę dostarczyć dodatkowe dokumenty?"
}
// is_internal zawsze = false dla klientów
```

**Wewnętrzny komentarz (tylko dla pracowników):**
```javascript
POST /api/comments
{
  "case_id": 123,
  "comment": "Klient może mieć trudności finansowe",
  "is_internal": true  // Klient NIE zobaczy
}
```

### 4️⃣ **Wspólny czat**

Czat działa między:
- Klient ↔ Pracownik
- Pracownik ↔ Pracownik

**Klient widzi:**
- Tylko pracowników kancelarii
- Nie widzi innych klientów

**Pracownik widzi:**
- Wszystkich pracowników
- Wszystkich klientów

### 5️⃣ **Powiadomienia**

**Klient otrzymuje powiadomienia gdy:**
- Pracownik dodał komentarz do jego sprawy
- Zmienił się status sprawy
- Dodano nowy dokument
- Zbliża się termin rozprawy

**Pracownik otrzymuje powiadomienia gdy:**
- Klient dodał komentarz
- Klient wysłał wiadomość na czacie
- Zbliża się termin rozprawy

---

## 🔧 Konfiguracja techniczna

### Baza danych

**Tabela `users`:**
```sql
- role: 'admin' | 'lawyer' | 'assistant' | 'client'
- client_id: ID z tabeli clients (dla klientów)
```

**Tabela `case_access`:**
```sql
- case_id: ID sprawy
- user_id: ID użytkownika (klienta)
- access_level: 'view' | 'comment'
```

**Tabela `case_comments`:**
```sql
- is_internal: 0 (publiczny) | 1 (wewnętrzny)
```

### API Endpoints

**Sprawdzanie dostępu:**
```javascript
// Middleware
canAccessCase - Sprawdza czy użytkownik ma dostęp do sprawy
canModifyCase - Sprawdza czy może modyfikować
canViewInternalNotes - Sprawdza czy widzi wewnętrzne notatki
```

**Przykład użycia:**
```javascript
router.get('/cases/:id', verifyToken, canAccessCase, (req, res) => {
  // Tylko użytkownicy z dostępem do sprawy
});

router.put('/cases/:id', verifyToken, canModifyCase, (req, res) => {
  // Tylko pracownicy
});
```

---

## 📱 Interfejs dla klientów

### Widok klienta po zalogowaniu:

```
┌─────────────────────────────────────┐
│  Pro Meritum - Portal Klienta      │
├─────────────────────────────────────┤
│                                     │
│  👤 Jan Kowalski                    │
│  📧 jan.kowalski@example.com        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📋 Moje sprawy (2)                 │
│  ├─ SP/2025/001 - Sprawa cywilna   │
│  │  Status: W toku 🟡              │
│  │  Następny termin: 15.02.2025    │
│  │                                  │
│  └─ SP/2025/015 - Sprawa rodzinna  │
│     Status: Otwarta 🟢             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💬 Wiadomości (3 nowe)             │
│  ├─ Radca Nowak: Przygotowałem...  │
│  └─ Asystent Kowal: Proszę o...    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📅 Nadchodzące terminy             │
│  └─ 15.02.2025 10:00               │
│     Rozprawa - Sąd Rejonowy        │
│                                     │
└─────────────────────────────────────┘
```

### Widok szczegółów sprawy dla klienta:

```
┌─────────────────────────────────────┐
│  Sprawa SP/2025/001                 │
├─────────────────────────────────────┤
│                                     │
│  📋 Informacje                      │
│  Typ: Cywilna                       │
│  Status: W toku 🟡                  │
│  Sąd: Sąd Rejonowy Wrocław         │
│  Sygnatura: I C 123/2025           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📝 Postępy (tylko publiczne)       │
│  ✓ 10.01.2025 - Pozew złożony      │
│  ✓ 20.01.2025 - Termin wyznaczony  │
│  ⏳ 15.02.2025 - Rozprawa          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💬 Komentarze                      │
│  ┌─────────────────────────────┐   │
│  │ Radca Nowak (12.01.2025)    │   │
│  │ Przygotowałem pozew...      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Ty (13.01.2025)             │   │
│  │ Dziękuję, czy mogę...       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Dodaj komentarz...]          [→] │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📎 Dokumenty (3)                   │
│  ├─ Pozew.pdf                      │
│  ├─ Umowa.pdf                      │
│  └─ Faktura.pdf                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Jak uruchomić z systemem ról?

### 1. Zatrzymaj aplikację
```powershell
Ctrl+C
```

### 2. Usuń starą bazę (OPCJONALNIE)
```powershell
Remove-Item data\komunikator.db
```

### 3. Uruchom ponownie
```powershell
npm start
```

### 4. Zarejestruj pierwszego pracownika (Admin)
```
Email: admin@kancelaria.pl
Hasło: admin123
Rola: admin (domyślnie lawyer)
```

### 5. Dodaj klienta w CRM
```
Klienci i Sprawy → + Nowy klient
Jan Kowalski, jan@example.com
```

### 6. Utwórz konto dla klienta
```javascript
POST /api/auth/register
{
  "email": "jan@example.com",
  "password": "haslo123",
  "name": "Jan Kowalski",
  "role": "client",
  "client_id": 1  // ID z tabeli clients
}
```

### 7. Klient może się zalogować!
```
Email: jan@example.com
Hasło: haslo123
```

---

## 💡 Przykładowe scenariusze

### Scenariusz 1: Klient pyta o sprawę

1. **Klient** loguje się do portalu
2. Widzi swoją sprawę SP/2025/001
3. Dodaje komentarz: "Kiedy będzie rozprawa?"
4. **Pracownik** otrzymuje powiadomienie
5. Pracownik odpowiada: "15 lutego o 10:00"
6. **Klient** otrzymuje powiadomienie i widzi odpowiedź

### Scenariusz 2: Pracownik aktualizuje sprawę

1. **Pracownik** dodaje notatkę publiczną: "Pozew złożony"
2. **Klient** widzi notatkę w postępach
3. Pracownik dodaje notatkę wewnętrzną: "Klient może mieć problemy finansowe"
4. **Klient NIE widzi** wewnętrznej notatki

### Scenariusz 3: Czat klient-pracownik

1. **Klient** otwiera czat
2. Widzi listę pracowników kancelarii
3. Pisze do Radcy Nowak: "Mam pytanie..."
4. **Radca** otrzymuje wiadomość
5. Radca odpowiada w czasie rzeczywistym
6. Rozmowa jest zapisana i powiązana ze sprawą

---

## 🔒 Bezpieczeństwo

- ✅ Klienci widzą TYLKO swoje sprawy
- ✅ Wewnętrzne notatki są ukryte przed klientami
- ✅ Klienci nie mogą modyfikować spraw
- ✅ Każde działanie jest logowane
- ✅ Tokeny JWT z rolami
- ✅ Middleware sprawdza uprawnienia

---

## 📊 Statystyki i raporty

**Dla pracowników:**
- Liczba aktywnych spraw
- Liczba klientów
- Nadchodzące terminy
- Statystyki czatu

**Dla klientów:**
- Status swoich spraw
- Historia komunikacji
- Nadchodzące terminy

---

**System ról zapewnia bezpieczny i wygodny dostęp dla klientów przy zachowaniu pełnej kontroli pracowników!** 🎉
