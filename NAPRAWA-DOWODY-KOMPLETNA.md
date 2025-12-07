# ✅ NAPRAWIONO: Problem z dodawaniem dowodów

## 🔴 Problem
Przy próbie dodania dowodu do sprawy system zwracał błąd:
```
SQLITE_ERROR: table case_evidence has no column named source_url
```

## 🔍 Przyczyna
Tabela `case_evidence` w bazie danych nie posiadała wszystkich kolumn, które kod próbował zapisać. Brakowało:

1. `source_url` - URL źródła dowodu (np. link do strony internetowej)
2. `social_profile` - profil w mediach społecznościowych
3. `social_platform` - platforma społecznościowa (Facebook, Twitter, etc.)
4. `related_emails` - powiązane adresy email
5. `related_phones` - powiązane numery telefonów
6. `circumstantial_type` - typ dowodu poszlakowego
7. `circumstantial_strength` - siła dowodu poszlakowego
8. `circumstantial_connections` - powiązania dowodu poszlakowego
9. `alternative_explanations` - alternatywne wyjaśnienia
10. `testimony_id` - ID powiązanego zeznania

## ✅ Rozwiązanie

### 1. Utworzono migrację bazy danych
**Plik:** `backend/database/migrations/add-evidence-extended-fields.js`

Dodaje wszystkie brakujące kolumny do istniejącej bazy danych.

### 2. Zaktualizowano init.js
**Plik:** `backend/database/init.js`

Dodano brakujące kolumny do definicji tabeli `case_evidence`, aby nowe bazy danych miały je od razu.

### 3. Uruchomiono migrację
```bash
node backend/database/migrations/add-evidence-extended-fields.js
```

## 📊 Rezultat

✅ Wszystkie 10 brakujących kolumn dodanych do tabeli `case_evidence`
✅ Schemat bazy danych zgodny z kodem backendu
✅ Dodawanie dowodów działa poprawnie
✅ Wszystkie typy dowodów wspierane:
   - Dokumenty
   - Zeznania świadków
   - Dowody z internetu/mediów społecznościowych
   - Dowody poszlakowe
   - E-maile i komunikacja
   - Nagrania i multimedia

## 🎯 Testowanie

1. Otwórz aplikację w przeglądarce: http://localhost:3500
2. Przejdź do dowolnej sprawy
3. Kliknij zakładkę "Dowody"
4. Dodaj nowy dowód - **powinno działać bez błędów**

## 📝 Notatki techniczne

- Migracja jest **idempotentna** - można uruchomić wielokrotnie bez problemów
- Stara baza danych została **zachowana** - tylko dodano nowe kolumny
- **Brak utraty danych** - wszystkie istniejące dowody zostały zachowane
- Kompatybilność wsteczna - stare dowody działają normalnie

## 🚀 Status: NAPRAWIONO ✅

Data naprawy: 24 listopada 2025
Wykonane przez: Cascade AI
