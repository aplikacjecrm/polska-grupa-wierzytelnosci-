# 👥 Konta systemowe - Działy HR i Finanse

## 🚀 Jak utworzyć konta HR i Finance

**WAŻNE:** Konta HR i Finance należy tworzyć przez Admin Dashboard, tak samo jak innych pracowników!

### 📝 Instrukcja tworzenia:

1. **Zaloguj się jako Administrator**
2. **Otwórz Admin Dashboard** (⚙️ w menu)
3. **Kliknij "👤 Dodaj użytkownika"** (w sekcji Szybkie akcje)
4. **Wypełnij formularz:**

### 🎓 DZIAŁ HR (Kadry i Płace)

**Dane do wprowadzenia:**
- 📧 Email: `hr@promeritum.pl`
- 🔑 Hasło: `(ustaw własne, np. Hr123456!)`
- 👤 Imię i nazwisko: `Dział HR`
- 📋 Rola: **🎓 Dział HR (Kadry)** ⬅️ wybierz z listy!
- ✅ Aktywny: zaznacz

**Uprawnienia:**
- ✅ Pełny dostęp do Employee Dashboard
- ✅ Zarządzanie profilami pracowników
- ✅ Dodawanie i edycja ocen pracowników
- ✅ Przeglądanie raportów miesięcznych
- ✅ Przypisywanie zadań pracownikom
- ✅ Historia logowań pracowników
- ✅ Dostęp do ankiet HR
- ❌ Brak dostępu do spraw klientów (CRM)
- ❌ Brak dostępu do finansów (tylko viewing)

---

### 💰 DZIAŁ FINANSOWY

**Dane do wprowadzenia:**
- 📧 Email: `finanse@promeritum.pl`
- 🔑 Hasło: `(ustaw własne, np. Finanse123456!)`
- 👤 Imię i nazwisko: `Dział Finansowy`
- 📋 Rola: **💰 Dział Finansowy** ⬅️ wybierz z listy!
- ✅ Aktywny: zaznacz

**Uprawnienia:**
- ✅ Pełny dostęp do Finance Dashboard
- ✅ Wypłata pensji pracowników (z automatyczną listą)
- ✅ Zarządzanie wydatkami firmy
- ✅ Fakturowanie (wystawne i kosztowe)
- ✅ Płatności ratalne
- ✅ Dostęp do Employee Dashboard (viewing)
- ✅ Historia wypłat pracowników
- ❌ Brak dostępu do spraw klientów (CRM)
- ❌ Brak edycji profili pracowników

---

## 🎯 Po utworzeniu konta

5. **System wyświetli potwierdzenie** z danymi logowania
6. **Zapisz hasło!** (nie będzie już widoczne)
7. Konto jest gotowe do użycia

---

## 🚀 Jak się zalogować?

1. Otwórz aplikację w przeglądarce
2. Wyloguj się jeśli jesteś zalogowany (prawy górny róg → Wyloguj)
3. Na ekranie logowania wprowadź:
   - Email: `hr@promeritum.pl` lub `finanse@promeritum.pl`
   - Hasło: hasło które ustawiłeś przy tworzeniu konta
4. Kliknij "Zaloguj"

---

## 🔐 Bezpieczeństwo

**Zalecenia:**
1. Używaj silnych haseł (min. 8 znaków, małe, wielkie, cyfry, znaki specjalne)
2. Nie udostępniaj swoich danych logowania
3. Wyloguj się po zakończeniu pracy
4. Regularnie zmieniaj hasło

**Zmiana hasła:**
- Po zalogowaniu → Prawy górny róg → Profil → Zmień hasło

---

## 🎯 Co można zrobić po zalogowaniu?

### Jako HR:
1. **Employee Dashboard** → Lista wszystkich pracowników
2. **Profil pracownika** → Edytuj dane, dodaj oceny
3. **Raporty miesięczne** → Zobacz statystyki pracy
4. **Zadania** → Przypisuj zadania pracownikom
5. **Ankiety HR** (wkrótce) → Kwestionariusze onboardingowe

### Jako Finance:
1. **Finance Dashboard** → Przegląd finansowy firmy
2. **Wypłać pensję** → Automatyczna lista pracowników z dropdownu
3. **Faktury** → Zarządzanie fakturami (sprzedażowymi i kosztowymi)
4. **Wydatki** → Dodawaj wydatki firmy
5. **Płatności ratalne** → Zarządzanie ratami
6. **Employee Dashboard** → Zobacz dane pracowników (tylko viewing)

---

## 🔄 Zarządzanie kontami

### Dodawanie nowych użytkowników HR/Finance:

**Zawsze używaj Admin Dashboard** do tworzenia użytkowników (patrz instrukcja na górze)

### Usuwanie konta:

**Opcja 1: Deaktywacja (zalecane)**
```sql
UPDATE users SET is_active = 0 WHERE email = 'hr@promeritum.pl';
```

**Opcja 2: Całkowite usunięcie (nieodwracalne)**
```sql
DELETE FROM users WHERE email = 'hr@promeritum.pl';
```

### Resetowanie hasła:

Administrator może zresetować hasło w Admin Dashboard lub bezpośrednio w bazie:
```bash
node backend/scripts/reset-password.js hr@promeritum.pl NoweHaslo123
```

---

## 📞 Kontakt w razie problemów

Jeśli masz problemy z logowaniem:
1. Sprawdź czy używasz prawidłowego emaila (małe litery!)
2. Upewnij się że serwer działa (`node backend/server.js`)
3. Sprawdź logi serwera w konsoli
4. Skontaktuj się z administratorem systemu

---

**Utworzono:** 2025-11-23 21:00  
**Ostatnia aktualizacja:** 2025-11-23 21:46  
**Wersja:** 2.0 - Zmiana: konta tworzy się przez Admin Dashboard (nie skrypt)
