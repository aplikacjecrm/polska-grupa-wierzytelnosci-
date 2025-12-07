# 🚀 PLAN ROZBUDOWY AI ASYSTENTA I GENERATORA DOKUMENTÓW

## ✅ CO JUŻ DZIAŁA (ZROBIONE DZISIAJ):

### 1. **Parsowanie dokumentów** ✅
- ✅ PDF - czyta faktury, umowy, pisma
- ✅ DOCX - czyta dokumenty Word
- ✅ TXT - czyta pliki tekstowe
- ✅ **OCR (OBRAZY)** - czyta tekst ze screenshotów, zdjęć faktur, rozmów WhatsApp

### 2. **Pełny kontekst sprawy** ✅
AI teraz widzi:
- ✅ **Dokumenty** (7 PDFów, DOCXów)
- ✅ **Obrazy OCR** (15 zdjęć/screenshotów - pełna treść!)
- ✅ **Komentarze** do sprawy
- ✅ **Wydarzenia** (rozprawy, terminy)
- ✅ **Dane podstawowe** (numer sprawy, strony, sąd)

### 3. **Gemini AI** ✅
- ✅ Skonfigurowane i działa
- ✅ Darmowy model (gemini-2.5-flash)
- ✅ Czyta polski, niemiecki, angielski

---

## ❌ CO NIE DZIAŁA / BRAKUJE:

### 1. **Świadkowie** ❌
- AI **NIE WIDZI** świadków (tabela `witnesses`)
- Trzeba dodać do `full-case-context.js`

### 2. **Dowody** ❌
- AI **NIE WIDZI** dowodów (tabela `evidence`)
- Trzeba dodać do kontekstu

### 3. **Notatki** ❌
- AI **NIE WIDZI** notatek do sprawy (tabela `case_notes`)
- Trzeba dodać do kontekstu

### 4. **Generator dokumentów - ograniczony** ⚠️
**PROBLEM:** Tylko podstawowe typy dokumentów:
- Pozew
- Odpowiedź na pozew
- Wniosek
- Zażalenie
- Odwołanie
- Umowa zlecenia
- Pełnomocnictwo

**BRAKUJE:**
- Więcej typów (apelacja, kasacja, sprzeciw)
- Opcje wyboru stylu (oficjalny/uproszczony)
- Wybór szczegółowości
- Automatyczne uzupełnianie z danych sprawy
- Wersjowanie (szkic → wersja robocza → finalna)

### 5. **Brak timeline sprawy** ❌
**CO TO POWINNO POKAZYWAĆ:**
```
TIMELINE SPRAWY: DLU/TS01/001

└─ 📄 ETAP 1: Przygotowanie pozwu ✅ ZROBIONE
   ├─ Zebranie dokumentów (01.06.2024)
   ├─ Analiza prawna (15.06.2024)
   └─ Wygenerowanie pozwu (20.06.2024)

└─ ⚖️ ETAP 2: Złożenie do sądu 🔄 W TOKU
   ├─ Wysłanie pozwu (25.06.2024)
   └─ ⏳ Oczekiwanie na sygnaturę... (jeszcze nie)

└─ 📅 ETAP 3: Rozprawa ⏸️ OCZEKUJE
   └─ ⏳ Termin nie wyznaczony

NASTĘPNE KROKI:
✅ 1. Odpowiedź pozwanego - termin: 15.08.2024
⏸️ 2. Przygotowanie repliki
⏸️ 3. Zeznania świadków
```

### 6. **Wygenerowane dokumenty nie zapisują się automatycznie** ⚠️
- AI generuje dokument
- Użytkownik musi ręcznie kliknąć "Dodaj do sprawy"
- Brak historii wersji
- Brak oznaczenia "Wygenerowane przez AI"

---

## 🎯 PLAN NAPRAWY (PRIORYTET):

### ZADANIE 1: Dodaj świadków, dowody, notatki do AI ✨ PRIORITY 1
**PLIK:** `backend/services/full-case-context.js`

**CO DODAĆ:**
```javascript
// 6. ŚWIADKOWIE
const witnesses = await db.all(`
    SELECT name, testimony, contact, status 
    FROM witnesses 
    WHERE case_id = ?
`, [caseId]);

// 7. DOWODY
const evidence = await db.all(`
    SELECT id, title, description, evidence_type, date_acquired 
    FROM evidence 
    WHERE case_id = ?
`, [caseId]);

// 8. NOTATKI
const notes = await db.all(`
    SELECT content, created_at, author 
    FROM case_notes 
    WHERE case_id = ?
`, [caseId]);
```

**REZULTAT:**
```
AI teraz odpowie:
"Na podstawie zeznania świadka Jana Kowalskiego (dodane 15.06.2024): 
'Widziałem jak dłużnik podpisywał umowę...' oraz dowodu #3 
(faktura VAT nr 123/2024), wynika że..."
```

---

### ZADANIE 2: Rozbuduj generator dokumentów 📝 PRIORITY 1

**CEL:** Bardziej elastyczny generator z opcjami

**NOWY INTERFEJS:**
```
┌─────────────────────────────────────────┐
│  🤖 GENERATOR DOKUMENTÓW                │
├─────────────────────────────────────────┤
│                                         │
│  Typ dokumentu: [Pozew ▼]             │
│                                         │
│  Styl dokumentu:                        │
│  ○ Formalny (sąd)                      │
│  ● Uproszczony (klient)                │
│  ○ Robocza notatka                     │
│                                         │
│  Szczegółowość:                         │
│  ○ Krótka (1 strona)                   │
│  ● Normalna (2-3 strony)               │
│  ○ Szczegółowa (5+ stron)              │
│                                         │
│  Auto-wypełnij danymi z sprawy:        │
│  ☑ Strony procesu                      │
│  ☑ Sąd i sygnatura                     │
│  ☑ Dowody                              │
│  ☑ Świadkowie                          │
│  ☑ Wydarzenia                          │
│                                         │
│  Dodatkowe informacje:                 │
│  ┌─────────────────────────────────┐   │
│  │ Np. Wnioskuję o przesłuchanie   │   │
│  │ świadka Kowalskiego...          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Anuluj]  [🤖 Generuj dokument]      │
└─────────────────────────────────────────┘
```

**NOWE TYPY DOKUMENTÓW:**
- ✅ Pozew
- ✅ Odpowiedź na pozew
- ✅ Wniosek
- ✅ Zażalenie
- ✅ Odwołanie
- 🆕 **Apelacja**
- 🆕 **Kasacja**
- 🆕 **Sprzeciw od nakazu zapłaty**
- 🆕 **Pismo procesowe**
- 🆕 **Replika**
- 🆕 **Wniosek dowodowy**
- 🆕 **Wniosek o zabezpieczenie**
- 🆕 **Ugoda sądowa**
- 🆕 **Podsumowanie sprawy (dla klienta)**

---

### ZADANIE 3: Timeline sprawy 📊 PRIORITY 2

**UTWORZYĆ NOWĄ TABELĘ:**
```sql
CREATE TABLE case_timeline (
    id INTEGER PRIMARY KEY,
    case_id INTEGER,
    stage_name TEXT,  -- "Przygotowanie", "W sądzie", "Po wyroku"
    status TEXT,      -- "completed", "in_progress", "pending"
    task_name TEXT,   -- "Zebranie dokumentów", "Złożenie pozwu"
    completed_date DATE,
    due_date DATE,
    assigned_to INTEGER,
    notes TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**INTERFEJS - NOWA ZAKŁADKA W SPRAWIE:**
```
┌────────────────────────────────────────────┐
│  📊 TIMELINE SPRAWY: DLU/TS01/001         │
├────────────────────────────────────────────┤
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                            │
│  ✅ ETAP 1: Przygotowanie (ZAKOŃCZONE)   │
│     ├─ ✅ Zebranie dokumentów             │
│     │    └─ 15.06.2024 - Jan Kowalski    │
│     ├─ ✅ Analiza prawna                  │
│     │    └─ 20.06.2024 - AI + Mecenas    │
│     └─ ✅ Wygenerowanie pozwu             │
│          └─ 22.06.2024 - AI              │
│                                            │
│  🔄 ETAP 2: Postępowanie sądowe (W TOKU) │
│     ├─ ✅ Złożenie pozwu                  │
│     │    └─ 25.06.2024                   │
│     ├─ 🔄 Oczekiwanie na odpowiedź       │
│     │    └─ Termin: 15.08.2024           │
│     └─ ⏸️ Rozprawa                        │
│          └─ Jeszcze nie wyznaczona       │
│                                            │
│  ⏸️ ETAP 3: Po wyroku (OCZEKUJE)         │
│     └─ ⏸️ Egzekucja                       │
│                                            │
│  [+ Dodaj etap]  [+ Dodaj zadanie]       │
└────────────────────────────────────────────┘
```

---

### ZADANIE 4: Auto-zapis wygenerowanych dokumentów 💾 PRIORITY 2

**ZMIANA W:** `frontend/scripts/ai-assistant.js`

**OBECNIE:**
1. AI generuje dokument
2. Pokazuje modal z podglądem
3. Użytkownik klika "Dodaj do sprawy" ← RĘCZNE!

**PO ZMIANIE:**
1. AI generuje dokument
2. **AUTOMATYCZNIE** zapisuje jako szkic do sprawy
3. Pokazuje powiadomienie: "✅ Szkic zapisany jako: Pozew_szkic_AI_v1.doc"
4. Modal z podglądem + opcja "Wygeneruj nową wersję"

**HISTORIA WERSJI:**
```
📄 DOKUMENTY W SPRAWIE:
├─ Pozew_v3_final.doc         ← AKTUALNA
├─ Pozew_v2_poprawki.doc
├─ Pozew_v1_szkic_AI.doc      ← 🤖 Wygenerowane przez AI
└─ Faktura_1.pdf
```

---

## 📋 PODSUMOWANIE ZADAŃ:

| Zadanie | Priorytet | Czas | Status |
|---------|-----------|------|--------|
| ✅ Naprawa błędu `dlugosc` | P1 | 5 min | **ZROBIONE** |
| Dodanie świadków do AI | P1 | 20 min | PENDING |
| Dodanie dowodów do AI | P1 | 15 min | PENDING |
| Dodanie notatek do AI | P1 | 10 min | PENDING |
| Rozbudowa generatora (opcje) | P1 | 45 min | PENDING |
| Więcej typów dokumentów | P1 | 30 min | PENDING |
| Timeline sprawy (tabela + UI) | P2 | 90 min | PENDING |
| Auto-zapis dokumentów | P2 | 30 min | PENDING |
| Wersjowanie dokumentów | P2 | 40 min | PENDING |

**ŁĄCZNIE:** ~4.5 godziny pracy

---

## 🚀 KOLEJNOŚĆ REALIZACJI:

### FAZA 1 (30 min): Pełny kontekst AI
1. Dodaj świadków do `full-case-context.js`
2. Dodaj dowody
3. Dodaj notatki
4. Przetestuj

### FAZA 2 (75 min): Lepszy generator
1. Dodaj opcje (styl, szczegółowość)
2. Dodaj nowe typy dokumentów
3. Auto-wypełnianie danymi
4. Przetestuj

### FAZA 3 (90 min): Timeline
1. Utwórz tabelę `case_timeline`
2. Backend endpoints
3. Frontend UI (zakładka)
4. Integracja z AI

### FAZA 4 (70 min): Auto-zapis i wersje
1. Auto-zapis dokumentów
2. System wersjowania
3. Historia zmian
4. Przetestuj

---

## 💡 DODATKOWE POMYSŁY (FUTURE):

### 1. **AI Sugeruje następne kroki**
```
🤖 AI PODPOWIADA:
"Na podstawie analizy sprawy, sugeruję:
1. Wnieść o przesłuchanie świadka Kowalskiego (termin: 15.08)
2. Dołączyć dowód #7 (faktura) do repliki
3. Przygotować się na pytania o wartość szkody"
```

### 2. **Automatyczne powiadomienia**
```
🔔 PRZYPOMNIENIA:
- Jutro: Termin na odpowiedź pozwanego (15.08.2024)
- Za 7 dni: Rozprawa w sądzie
- UWAGA: Brakuje zeznania świadka #3!
```

### 3. **Analiza ryzyk prawnych**
```
⚠️ RYZYKA SPRAWY:
🔴 WYSOKIE: Brak podpisu na umowie (może skutkować oddaleniem)
🟡 ŚREDNIE: Świadek #2 niezlokalizowany
🟢 NISKIE: Dokumentacja kompletna
```

### 4. **Porównanie z podobnymi sprawami**
```
📊 PODOBNE SPRAWY:
- DLU/TS01/005 (2023) - wygrana, odszkodowanie 15k PLN
- DLU/TS01/012 (2024) - ugoda, 10k PLN
- DLU/TS01/018 (2024) - w toku, podobna sytuacja
```

---

## ✅ GOTOWE DO ROZPOCZĘCIA!

**Chcesz, żebym zaczął od FAZY 1 (pełny kontekst AI)?**

Napisz:
- **"tak"** = zaczynam od świadków/dowodów/notatek
- **"generator"** = zaczynam od rozbudowy generatora
- **"timeline"** = zaczynam od timeline

**Lub opisz swój priorytet!**
