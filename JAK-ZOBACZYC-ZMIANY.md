# 🔍 JAK ZOBACZYĆ ZMIANY AI - INSTRUKCJA KROK PO KROKU

**Problem:** "Nie widzę żadnych zmian"  
**Rozwiązanie:** Musisz odświeżyć przeglądarkę!

---

## ✅ KROK 1: TWARDY REFRESH PRZEGLĄDARKI

### Windows:
```
Naciśnij: Ctrl + Shift + R

LUB

Naciśnij: Ctrl + F5
```

### Co to robi?
- Czyści cache przeglądarki
- Pobiera NOWE pliki JavaScript
- Ładuje AI Co-Pilot

---

## ✅ KROK 2: ZALOGUJ SIĘ PONOWNIE

```
1. Otwórz: http://localhost:3500
2. Zaloguj się: admin@promeritum.pl / Admin123!@#
3. Naciśnij: Ctrl + Shift + R (twardy refresh!)
```

---

## ✅ KROK 3: JAK ZOBACZYĆ AI CO-PILOT

### Sprawdź w konsoli przeglądarki:

1. **Naciśnij:** F12
2. **Przejdź do:** Console
3. **Szukaj:**
   ```
   🤖 AI Co-Pilot Module Loaded v1.0.0 - Smart Form Assistant
   ✅ AI Co-Pilot dodany do XX pól
   ```

### Jeśli widzisz to = **DZIAŁA!** ✅

---

## ✅ KROK 4: GDZIE SZUKAĆ AI CO-PILOT

### A) Floating Button (Prawy dolny róg):

```
🤖 - Duży złoty przycisk
Kliknij = Panel AI otworzy się z prawej
```

### B) Ikony obok pól:

```
1. Otwórz dowolny formularz:
   - Nowa sprawa
   - Edytuj klienta
   - Dodaj dokument

2. Szukaj małych ikon 🤖 obok pól input

3. Kliknij ikonę 🤖 = AI daje podpowiedzi!
```

---

## ✅ KROK 5: JAK ZOBACZYĆ AI CZYTA DOKUMENTY

### WAŻNE: Potrzebujesz sprawy z dokumentami PDF/DOCX!

```
1. Otwórz istniejącą sprawę (lub utwórz nową)

2. Dodaj testowy dokument PDF:
   - Zakładka "Dokumenty"
   - Kliknij "Dodaj dokument"
   - Upload jakikolwiek PDF (pozew, umowa, cokolwiek)

3. Teraz kliknij: 🤖 AI Legal Search (w menu górnym)

4. ✅ ZAZNACZ: "Dołącz kontekst sprawy"

5. Wpisz: "Przeanalizuj dokumenty w sprawie"

6. Kliknij: 🚀 Wyszukaj z AI

7. ZOBACZYSZ:
   📄 1 dokument (w badge na górze)
   AI cytuje treść z PDF!
```

---

## 🔍 DIAGNOSTYKA - CO SPRAWDZAĆ:

### 1. Sprawdź czy backend działa:

**Otwórz w przeglądarce:**
```
http://localhost:3500
```

**Powinno pokazać:** Stronę logowania ✅

---

### 2. Sprawdź konsolę backendu:

**Szukaj:**
```
✅ Gemini AI: Initialized (gemini-2.5-flash)
🤖 Server running on port 3500
```

**Jeśli widzisz = Backend OK!** ✅

---

### 3. Sprawdź konsolę przeglądarki (F12):

**Szukaj:**
```javascript
🤖 AI Co-Pilot Module Loaded v1.0.0
🤖 AI Search Module Loaded v3.0.0
```

**Jeśli widzisz = Frontend załadowany!** ✅

---

### 4. Sprawdź czy są błędy:

**W konsoli przeglądarki (F12) szukaj czerwonych błędów:**

❌ **Jeśli widzisz:**
```
Failed to load resource: net::ERR_FILE_NOT_FOUND
ai-copilot.js:1
```

**Rozwiązanie:**
```
Ctrl + Shift + R (twardy refresh!)
```

---

## 🎬 SZYBKI TEST - 30 SEKUND:

### TEST AI CO-PILOT:

```
1. Ctrl + Shift + R (odśwież!)

2. Zaloguj się

3. Nowa sprawa (lub edytuj istniejącą)

4. Szukaj ZŁOTEGO PRZYCISKU 🤖 w prawym dolnym rogu

5. Kliknij go!

6. Panel AI otworzy się z prawej strony
   z napisem "🤖 AI Co-Pilot"

7. Kliknij małe 🤖 obok pola "Tytuł sprawy"

8. AI pokaże podpowiedzi!
```

**Jeśli widzisz panel AI = DZIAŁA!** ✅

---

## 🚨 NAJCZĘSTSZE PROBLEMY:

### Problem 1: "Nie widzę przycisku 🤖"

**Rozwiązanie:**
```
1. Ctrl + Shift + R (KONIECZNIE!)
2. Wyloguj się i zaloguj ponownie
3. F12 → Console → Sprawdź błędy
```

---

### Problem 2: "AI Legal Search nie pokazuje dokumentów"

**Przyczyna:** Sprawa nie ma dokumentów!

**Rozwiązanie:**
```
1. Dodaj testowy PDF do sprawy
2. Otwórz AI Legal Search
3. ✅ ZAZNACZ "Dołącz kontekst sprawy"
4. Teraz AI zobaczy dokumenty!
```

---

### Problem 3: "Panel AI się nie otwiera"

**Rozwiązanie:**
```
1. Sprawdź konsolę (F12) - są błędy?
2. Sprawdź czy backend działa (localhost:3500)
3. Zrestartuj przeglądarkę całkowicie
4. Ctrl + Shift + R
```

---

## ✅ CHECKLIST - Czy wszystko działa?

```
☐ Backend uruchomiony (localhost:3500 działa)
☐ Zalogowałem się
☐ Nacisnąłem Ctrl + Shift + R
☐ W konsoli (F12) widzę: "🤖 AI Co-Pilot Module Loaded"
☐ Widzę złoty przycisk 🤖 w prawym dolnym rogu
☐ Mogę kliknąć 🤖 obok pól w formularzach
☐ Panel AI otwiera się z prawej strony
```

**Jeśli wszystko zaznaczone = DZIAŁA IDEALNIE!** ✅

---

## 📞 POTRZEBUJESZ POMOCY?

### Pokaż mi:

1. **Screenshot konsoli przeglądarki (F12)**
   - Czy są błędy czerwone?
   - Czy widzisz "AI Co-Pilot Module Loaded"?

2. **Screenshot aplikacji**
   - Czy widzisz przycisk 🤖?
   - Gdzie klikasz?

3. **Logi backendu**
   - Co pokazuje terminal z backendem?

---

**SPRÓBUJ TERAZ: Ctrl + Shift + R i szukaj złotego 🤖!** 🚀
