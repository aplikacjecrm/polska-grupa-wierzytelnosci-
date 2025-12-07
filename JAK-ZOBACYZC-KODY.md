# 👀 JAK ZOBACZYĆ NOWE KODY - Instrukcja

**Dla użytkownika końcowego**

---

## 🚀 SZYBKI START (5 minut):

### **Krok 1: Odśwież przeglądarkę**
```
Naciśnij: Ctrl + Shift + R
```
⚠️ **WAŻNE:** Zwykłe Ctrl+R może NIE załadować nowych zmian!

---

### **Krok 2: Zaloguj się**
```
http://localhost:3500
```
Użyj swojego loginu i hasła mecenasa.

---

### **Krok 3: Otwórz sprawę**
1. Kliknij **"📋 CRM - Sprawy"** w menu
2. Wybierz dowolną sprawę z listy
3. Kliknij na nią, aby otworzyć szczegóły

---

### **Krok 4: Zobacz kody wydarzeń**

1. Kliknij zakładkę **"📅 Wydarzenia"**
2. Zobaczysz listę wydarzeń
3. **Każde wydarzenie ma kod na górze:**

```
┌──────────────────────────────────┐
│ 🔢 ROZ/CYW/GW/ODS/GW01/001/001   │  ← TO JEST KOD!
├──────────────────────────────────┤
│ ⚖️ Rozprawa w sądzie             │
│ 📅 15.12.2025, 10:00             │
│ 📍 Sąd Okręgowy                  │
└──────────────────────────────────┘
```

**Wygląd kodu:**
- Kolorowy badge (gradient)
- Ikonka 🔢
- Font jak na maszynie do pisania
- Kolor zależy od typu wydarzenia

---

### **Krok 5: Zobacz kody świadków**

1. Kliknij zakładkę **"👤 Świadkowie"**
2. Zobaczysz listę świadków
3. **Każdy świadek ma kod na górze karty:**

```
┌──────────────────────────────────┐
│ 🔢 ŚW/CYW/GW/ODS/GW01/001/001    │  ← TO JEST KOD!
├──────────────────────────────────┤
│ Jan Kowalski                     │
│ ✅ Potwierdzony  👤 Neutralny    │
└──────────────────────────────────┘
```

---

### **Krok 6: Dodaj nowe wydarzenie (test)**

1. W zakładce "📅 Wydarzenia"
2. Kliknij **"Dodaj nowe wydarzenie"**
3. Wypełnij formularz:
   - Typ: np. "Rozprawa"
   - Tytuł: "Test"
   - Data: jutro
4. Kliknij **"Zapisz"**
5. **Kod wygeneruje się automatycznie!**

---

## 🔍 CO ZOBACZYSZ:

### **1. Wydarzenia:**
- ROZ/... = Rozprawa
- SPO/... = Spotkanie
- TER/... = Termin
- MED/... = Mediacja
- KON/... = Konsultacja
- NEG/... = Negocjacje

### **2. Świadkowie:**
- ŚW/... = Świadek

### **3. Jeśli brak kodu:**
```
┌──────────────────────┐
│ ⚠️ Brak kodu         │  ← Stare wydarzenia
└──────────────────────┘
```
To normalne dla wydarzeń dodanych PRZED wdrożeniem systemu.

---

## ❓ CO OZNACZA KOD:

### **Przykład:** `ROZ/CYW/GW/ODS/GW01/001/001`

| Część | Znaczenie |
|-------|-----------|
| **ROZ** | Typ: Rozprawa |
| **CYW** | Typ sprawy: Cywilna |
| **GW** | Inicjały klienta: G.W. |
| **ODS/GW01/001** | Numer sprawy |
| **001** | Numer wydarzenia (1, 2, 3...) |

---

## ⚠️ CZĘSTE PROBLEMY:

### **Problem 1: Nie widzę kodów**
**Rozwiązanie:**
```
1. Ctrl + Shift + R (odśwież przeglądarkę)
2. Jeśli nie pomogło: zamknij i otwórz przeglądarkę
3. Sprawdź czy backend działa (czerwona kropka u góry)
```

---

### **Problem 2: Pokazuje "⚠️ Brak kodu"**
**To normalne!**
- Dotyczy STARYCH wydarzeń/świadków
- Dodanych przed wdrożeniem systemu
- Nowe elementy ZAWSZE mają kod

---

### **Problem 3: Kod jest dziwny/niepełny**
**Przykład błędnego kodu:** `ROZ/001`

**Rozwiązanie:**
```
1. Sprawdź czy backend jest zrestartowany
2. Backend musi używać NOWEJ wersji kodu
3. Skontaktuj się z administratorem
```

---

## 📊 GDZIE ZNAJDZIESZ KODY:

```
✅ Wydarzenia               → Zakładka "📅 Wydarzenia"
✅ Świadkowie              → Zakładka "👤 Świadkowie"
⏳ Nagrania zeznań         → Wkrótce
⏳ Dokumenty               → Wkrótce
⏳ Dowody                  → Wkrótce
```

---

## 💡 KORZYŚCI KODÓW:

### **1. Łatwe wyszukiwanie**
Wkrótce będzie można wpisać `ROZ/CYW/GW` i od razu znaleźć!

### **2. Unikalność**
Każdy kod jest UNIKALNY - nie pomylisz wydarzeń!

### **3. Porządek**
Kody pokazują hierarchię: Sprawa → Typ → Numer

### **4. Eksport**
Łatwo wyeksportować wszystko po kodzie

---

## 🎉 GOTOWE!

Jeśli widzisz kolorowe badge'e z kodami - **wszystko działa!**

**Pytania?** Skontaktuj się z administratorem systemu.

---

**Data:** 6 listopada 2025  
**Wersja:** Frontend v1.0
