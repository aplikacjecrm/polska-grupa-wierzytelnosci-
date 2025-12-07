# 🧪 JAK PRZETESTOWAĆ NOWY SYSTEM NUMERACJI

**Wersja:** 1.0  
**Data:** 6 listopada 2025

---

## ✅ KROK 1: Sprawdź czy backend działa

```bash
curl http://localhost:3500/api/health
```

**Oczekiwany wynik:**
```json
{"status":"ok","timestamp":"2025-11-06T..."}
```

---

## 🎯 KROK 2: Dodaj wydarzenie (Frontend)

### **Metoda 1: Przez interfejs**

1. Otwórz aplikację: `http://localhost:3500`
2. Zaloguj się jako mecenas
3. Otwórz sprawę
4. Kliknij zakładkę **"📅 Wydarzenia"**
5. Kliknij **"+ Dodaj nowe wydarzenie"**
6. Wybierz typ (np. "⚖️ Rozprawa sądowa")
7. Wypełnij formularz
8. Kliknij **"Zapisz"**

**Gdzie sprawdzić kod?**
- Kod powinien pojawić się w konsoli przeglądarki (F12)
- Szukaj linii: `✅ NOWY SYSTEM: Wygenerowano kod...`

---

### **Metoda 2: Przez API (Postman/curl)**

#### A) Wygeneruj kod wydarzenia:

```bash
curl -X POST http://localhost:3500/api/events/generate-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "case_id": 1,
    "event_type": "court"
  }'
```

**Oczekiwany wynik:**
```json
{
  "eventCode": "ROZ/CYW/GW/ODS/GW01/001/001",
  "prefix": "ROZ",
  "caseTypeCode": "CYW",
  "initials": "GW",
  "fullCaseNumber": "ODS/GW01/001",
  "elementNumber": "001"
}
```

#### B) Zapisz wydarzenie z kodem:

```bash
curl -X POST http://localhost:3500/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "case_id": 1,
    "event_code": "ROZ/CYW/GW/ODS/GW01/001/001",
    "event_type": "court",
    "title": "Rozprawa w sądzie",
    "start_date": "2025-12-01T10:00:00",
    "location": "Sąd Okręgowy"
  }'
```

---

## 👤 KROK 3: Dodaj świadka

#### A) Wygeneruj kod świadka:

```bash
curl -X POST http://localhost:3500/api/witnesses/generate-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "case_id": 1
  }'
```

**Oczekiwany wynik:**
```json
{
  "success": true,
  "witness_code": "ŚW/CYW/GW/ODS/GW01/001/001",
  "case_type_code": "CYW",
  "initials": "GW",
  "full_case_number": "ODS/GW01/001",
  "witness_number": "001"
}
```

#### B) Zapisz świadka:

```bash
curl -X POST http://localhost:3500/api/witnesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "case_id": 1,
    "witness_code": "ŚW/CYW/GW/ODS/GW01/001/001",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "witness_type": "nasz"
  }'
```

---

## 🎙️ KROK 4: Dodaj nagranie zeznania

#### Wygeneruj kod nagrania:

```bash
curl -X POST http://localhost:3500/api/witnesses/1/generate-recording-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Oczekiwany wynik:**
```json
{
  "success": true,
  "recording_code": "NAG/001",
  "recording_number": "001",
  "witness_code": "ŚW/CYW/GW/ODS/GW01/001/001"
}
```

---

## 🔍 KROK 5: Sprawdź logi backendu

Otwórz terminal gdzie działa backend i szukaj:

```
✅ NOWY SYSTEM: Wygenerowano kod ROZ/CYW/GW/ODS/GW01/001/001
✅ NOWY SYSTEM: Wygenerowano kod świadka: ŚW/CYW/GW/ODS/GW01/001/001
✅ NOWY SYSTEM: Wygenerowano numer nagrania: NAG/001
```

---

## 📊 KROK 6: Sprawdź bazę danych

### SQLite Browser:

1. Otwórz `data/komunikator.db`
2. Tabela `events` → kolumna `event_code`
3. Tabela `case_witnesses` → kolumna `witness_code`
4. Tabela `attachments` → kolumna `document_code`

**Powinny być wypełnione nowymi kodami!**

---

## ⚠️ TROUBLESHOOTING:

### Problem: "Module not found: code-generator"

**Rozwiązanie:**
```bash
# Sprawdź czy plik istnieje
ls backend/utils/code-generator.js

# Zrestartuj backend
node test-backend-start.js
```

---

### Problem: "Błąd generowania kodu"

**Rozwiązanie:**
1. Sprawdź czy sprawa istnieje w bazie
2. Sprawdź logi backendu
3. Uruchom test:
```bash
node test-new-codes.js
```

---

### Problem: Kod jest pusty lub NULL

**Przyczyny:**
- Backend używa starej wersji pliku
- Brak restartu po zmianach
- Błąd w module

**Rozwiązanie:**
```bash
# Zabij stary proces
taskkill /F /IM node.exe

# Uruchom ponownie
START-BACKEND.bat
```

---

## 🎉 SUKCES - Jeśli zobaczysz:

```
✅ Wydarzenia z kodami typu:  ROZ/CYW/GW/ODS/GW01/001/001
✅ Świadkowie z kodami typu:  ŚW/CYW/GW/ODS/GW01/001/001
✅ Nagrania z kodami typu:    NAG/001
```

**To znaczy że nowy system działa poprawnie!** 🚀

---

## 📝 NOTATKI:

- Kody są **unikalne** w ramach sprawy
- Format jest **spójny** dla wszystkich elementów
- System automatycznie **inkrementuje** numery
- **Pełny numer sprawy** jest zawsze zachowany

---

**Pytania?** Sprawdź:
- `SYSTEM-NUMERACJI-v1.md` - Pełna specyfikacja
- `INTEGRACJA-NOWEGO-SYSTEMU.md` - Co zostało zrobione
- `POSTEP-IMPLEMENTACJI-v1.md` - Postęp prac
