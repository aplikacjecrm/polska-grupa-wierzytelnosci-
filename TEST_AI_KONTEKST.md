# 🧪 TESTOWANIE AI Z KONTEKSTEM SPRAWY

## 🎯 NOWA WERSJA - FLOATING BUTTON!

**Floating button w prawym dolnym rogu:**
- ✅ **Zawsze widoczny** 
- 🤖 Zmienia tekst w zależności od kontekstu:
  - Bez sprawy: "🤖 AI Search"
  - Ze sprawą: "🤖 Zapytaj AI o sprawę"
- ✅ **Automatycznie używa kontekstu** gdy sprawa otwarta
- ✅ **Nad modalem** (z-index: 999999)

---

## 📋 3 TRYBY AI SEARCH:

### 1️⃣ **⚖️ Artykuły prawne**
- Wyszukiwanie przepisów
- Cytowanie artykułów
- Porady prawne

### 2️⃣ **📊 Analiza dokumentu**
- Analiza umów, pozwów
- Ocena ryzyk prawnych
- Rekomendacje działań

### 3️⃣ **🔍 Analiza sprawy**
- Kompleksowa analiza sprawy
- Strategia procesowa
- Przewidywany przebieg

---

## 🧪 TEST 1: ARTYKUŁY PRAWNE (bez kontekstu)

### Krok po kroku:
1. Kliknij **"🤖 AI Search"**
2. Wybierz **"⚖️ Artykuły prawne"**
3. Wpisz:
   ```
   Jakie są podstawy prawne odszkodowania za wypadek?
   ```
4. Kliknij **"🔮 Wyszukaj z AI"**

### Oczekiwany rezultat:
```
📚 AKTUALNE PRZEPISY PRAWNE:
- Kodeks cywilny Art. 415 - odpowiedzialność...
- Art. 444 - zakres odszkodowania...

🤖 ODPOWIEDŹ AI:
Podstawy prawne odszkodowania za wypadek:

1. Art. 415 KC - odpowiedzialność za szkodę
2. Art. 444 KC - zakres naprawienia szkody
3. Praktyczne wskazówki...
```

---

## 🧪 TEST 2: Z KONTEKSTEM SPRAWY

### Przygotowanie:
1. Przejdź do zakładki **"Sprawy"**
2. Znajdź sprawę (np. "Odszkodowanie za wypadek")
3. Kliknij **👁️ Otwórz**
4. Zobaczysz szczegóły sprawy

### Test:
1. Kliknij **"🤖 AI Search"** (górny pasek)
2. Wybierz **"🔍 Analiza sprawy"**
3. **✅ ZAZNACZ** "Dołącz kontekst aktualnej sprawy"
4. Wpisz:
   ```
   Jakie dokumenty powinienem przygotować na rozprawę?
   ```
5. Kliknij **"🔮 Wyszukaj z AI"**

### Co się stanie w backendzie:
```javascript
KONTEKST SPRAWY:
Numer: ODS/TK01/001
Tytuł: Odszkodowanie za wypadek przy pracy
Typ: cywilna
Status: in_progress
Opis: Klient uległ wypadkowi w zakładzie pracy...
Sąd: Sąd Rejonowy w Warszawie
Sygnatura: I C 123/2024

PYTANIE UŻYTKOWNIKA:
Jakie dokumenty powinienem przygotować na rozprawę?
```

### Oczekiwany rezultat:
```
📁 Z kontekstem

🤖 ODPOWIEDŹ AI:
W Twojej sprawie ODS/TK01/001 (Odszkodowanie za wypadek 
przy pracy) przed Sądem Rejonowym w Warszawie 
sygnatura I C 123/2024, powinieneś przygotować:

1. DOKUMENTY MEDYCZNE:
   - Dokumentacja leczenia
   - Zaświadczenia lekarskie
   - Historia choroby

2. DOWODY WYPADKU:
   - Protokół powypadkowy
   - Zeznania świadków
   - Zdjęcia miejsca wypadku

3. DOWODY SZKODY:
   - Rachunki za leczenie
   - Potwierdzenia utraconego zarobku
   - Opinie biegłych

Zgodnie z art. 187 k.p.c. i art. 444 k.c....
```

---

## 🧪 TEST 3: ANALIZA DOKUMENTU

### Przykład 1: Analiza umowy
1. Kliknij **"🤖 AI Search"**
2. Wybierz **"📊 Analiza dokumentu"**
3. Wklej przykładową umowę:
   ```
   UMOWA O PRACĘ

   Zawarta w dniu 01.11.2024 pomiędzy:
   Pracodawcą: ABC Sp. z o.o.
   a Pracownikiem: Jan Kowalski

   §1 Pracownik zobowiązuje się do pracy na stanowisku 
   programisty za wynagrodzeniem 8000 zł brutto miesięcznie.

   §2 Pracownik nie może pracować dla konkurencji przez 
   okres 5 lat po ustaniu stosunku pracy.

   §3 Kary umowne za naruszenie zakazu konkurencji: 
   100 000 zł.
   ```
4. Zadaj pytanie:
   ```
   Czy te klauzule są zgodne z prawem?
   ```

### Oczekiwany rezultat:
```
🤖 ANALIZA DOKUMENTU:

MOCNE STRONY:
✅ Jasno określone wynagrodzenie
✅ Precyzyjne stanowisko pracy

SŁABE STRONY / RYZYKA:
⚠️ Zakaz konkurencji na 5 lat - NIEZGODNY z art. 101² k.p.
   (max. 2 lata dla zwykłych pracowników)

⚠️ Kara umowna 100 000 zł - MOŻE BYĆ NIEWAŻNA
   (rażąco wygórowana, art. 484 k.c.)

REKOMENDACJE:
1. Skróć zakaz konkurencji do 2 lat
2. Obniż karę umowną do rozsądnej wysokości
3. Dodaj rekompensatę dla pracownika (30% wynagrodzenia)

PODSTAWY PRAWNE:
- Art. 101¹-101³ Kodeksu pracy
- Art. 484 § 2 k.c. (nadmierna kara)
```

---

## 🧪 TEST 4: Z KONTEKSTEM + ORZECZNICTWO

### Najlepsza konfiguracja:
1. **Otwórz sprawę** (👁️ Otwórz)
2. Kliknij **"🤖 AI Search"**
3. Wybierz **"🔍 Analiza sprawy"**
4. **✅ Zaznacz OBA:**
   - ✅ Dołącz kontekst aktualnej sprawy
   - ✅ Szukaj również w orzecznictwie sądowym
5. Wpisz:
   ```
   Jakie mam szanse wygrania sprawy?
   ```

### Oczekiwany rezultat:
```
📁 Z kontekstem 📚 Z orzecznictwem

🤖 ODPOWIEDŹ AI:

ANALIZA SPRAWY ODS/TK01/001:

PODSTAWY PRAWNE:
- Art. 415 k.c. - odpowiedzialność za szkodę
- Art. 444 k.c. - zakres odszkodowania

ORZECZNICTWO:
📜 Wyrok SN z 2023 r. - w podobnej sprawie...
📜 Wyrok SA w Warszawie - precedens...

TWOJE SZANSE:
🟢 DOBRE - 70-80%

ARGUMENTY ZA:
✅ Udokumentowany wypadek
✅ Dowody szkody
✅ Odpowiedzialność pracodawcy

ARGUMENTY PRZECIW:
⚠️ Możliwe zarzuty...

STRATEGIA:
1. Przedstaw silne dowody medyczne
2. Powołaj świadków
3. Złóż wniosek o biegłego...
```

---

## 📊 PORÓWNANIE TRYBÓW:

| Tryb | Bez kontekstu | Z kontekstem | + Orzecznictwo |
|------|---------------|--------------|----------------|
| ⚖️ Artykuły | Ogólne przepisy | Dopasowane do sprawy | + Precedensy |
| 📊 Analiza dok. | Ogólna analiza | Kontekst sprawy | + Podobne przypadki |
| 🔍 Analiza sprawy | Nie działa* | Pełna analiza | + Przewidywania |

*) Analiza sprawy wymaga kontekstu!

---

## ✅ CHECKLIST TESTOWANIA:

### Podstawowy test:
- [ ] Otwórz sprawę (👁️)
- [ ] Kliknij AI Search
- [ ] Zaznacz kontekst
- [ ] Wpisz pytanie
- [ ] Sprawdź czy w odpowiedzi jest numer sprawy

### Test wizualny:
- [ ] Zobacz wskaźnik "📁 Z kontekstem"
- [ ] Zobacz wskaźnik "📚 Z orzecznictwem"
- [ ] Sprawdź console.log (F12) - "📁 Dodaję kontekst sprawy"

### Test różnych kombinacji:
- [ ] Bez opcji (⚡ Podstawowa)
- [ ] Tylko kontekst (📁)
- [ ] Tylko orzecznictwo (📚)
- [ ] Oba zaznaczone (📁📚)

---

## 🐛 TROUBLESHOOTING:

### "Nie ma kontekstu sprawy":
```javascript
// Sprawdź w konsoli:
window.crmManager.currentCaseData
// Powinno zwrócić obiekt sprawy
```

**Rozwiązanie:**
1. Upewnij się że otworzyłeś sprawę (👁️ Otwórz)
2. Nie odświeżaj strony po otwarciu
3. AI Search musi być w tym samym oknie

### "AI nie używa kontekstu":
```javascript
// Sprawdź logi backendu:
📁 Dodano kontekst sprawy do promptu
```

**Rozwiązanie:**
1. Restart backendu
2. Sprawdź czy checkbox jest zaznaczony
3. F12 → Console → szukaj błędów

---

## 💡 PRZYKŁADOWE PYTANIA:

### Z kontekstem sprawy:
- "Jakie dokumenty przygotować?"
- "Jakie mam szanse wygrania?"
- "Czy mogę złożyć apelację?"
- "Ile może trwać postępowanie?"
- "Jakie koszty mnie czekają?"

### Analiza dokumentu:
- "Czy ta umowa jest uczciwa?"
- "Jakie są ryzyka podpisania?"
- "Czy mogę to zakwestionować?"
- "Co powinienem zmienić?"

---

**Gotowe do testowania!** 🚀📁🤖
