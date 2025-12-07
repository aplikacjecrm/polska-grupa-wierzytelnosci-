# 🔢 NOWA NUMERACJA SPRAW v2.0

## ✅ CO ZMIENIONO:

### **STARY SYSTEM (v1.0):**
```
KRA/JK/001      - Pierwszy klient Jan Kowalski
KRA/JK02/001    - Drugi klient Jan Kowalski (duplikat)
KRA/JK03/001    - Trzeci klient Jan Kowalski (duplikat)
```
❌ Problem: Numer dodawany tylko gdy są duplikaty

---

### **NOWY SYSTEM (v2.0):**
```
KRA/JK01/001    - Pierwszy klient Jan Kowalski
KRA/JK02/001    - Drugi klient Jan Kowalski
KRA/JK03/001    - Trzeci klient Jan Kowalski
```
✅ Rozwiązanie: ZAWSZE dodawany numer sekwencyjny od 01

---

## 📋 FORMAT NUMERU:

```
PREFIX / INICJAŁY + NUMER / NUMER_SPRAWY
   ↓         ↓                  ↓
  KRA   /   JK01     /        001

Gdzie:
- PREFIX = Kod typu sprawy (KRA, ODS, UMO, etc.)
- INICJAŁY = Pierwsze litery imienia i nazwiska klienta
- NUMER = Numer sekwencyjny klienta (01, 02, 03...)
- NUMER_SPRAWY = Numer sprawy dla tego klienta (001, 002, 003...)
```

---

## 🎯 PRZYKŁADY:

### **Pierwsi klienci z różnymi inicjałami:**
```
Jan Kowalski    → JK01
Anna Nowak      → AN01
Tomasz Lewandowski → TL01
Maria Kowalska  → MK01
```

### **Klienci z tymi samymi inicjałami:**
```
Jan Kowalski         → JK01
Jerzy Kaczmarek      → JK02
Joanna Kamińska      → JK03
Jan Kot              → JK04
```

### **Numery spraw:**
```
Klient: Jan Kowalski (JK01)
├── Sprawa 1: KRA/JK01/001 (Kradzież)
├── Sprawa 2: ODS/JK01/002 (Odszkodowanie)
└── Sprawa 3: UMO/JK01/003 (Umowa)

Klient: Jerzy Kaczmarek (JK02)
├── Sprawa 1: KRA/JK02/001 (Kradzież)
└── Sprawa 2: POB/JK02/002 (Pobicie)
```

---

## 💡 DLACZEGO TAKA ZMIANA?

### **Zalety:**

1. **Konsystencja:**
   - Wszystkie numery mają ten sam format
   - Łatwiej je zapamiętać

2. **Przewidywalność:**
   - Od razu wiadomo że pierwszy klient to 01
   - Nie trzeba sprawdzać czy są duplikaty

3. **Przejrzystość:**
   - Łatwiej zrozumieć strukturę numeru
   - Łatwiej szukać w systemie

4. **Przyszłościowość:**
   - Gotowe na 99 klientów z tymi samymi inicjałami
   - Elastyczne rozszerzenie (można zwiększyć do 001, 002... dla 999 klientów)

---

## 🔧 JAK TO DZIAŁA (BACKEND):

```javascript
// 1. Pobierz inicjały
const baseInitials = "JK"

// 2. Znajdź wszystkich klientów z tymi inicjałami
const clientsWithSameInitials = [...] // [klient_5, klient_12, klient_25]

// 3. Znajdź pozycję obecnego klienta
const clientIndex = 2  // Drugi klient z JK

// 4. Dodaj numer (zawsze, od 01)
const initials = "JK02"

// 5. Wygeneruj numer sprawy
const caseNumber = "KRA/JK02/001"
```

---

## 📊 PRZYKŁADY RZECZYWISTE:

### **Kancelaria z 50 klientami:**
```
Jan Kowalski        → JK01 (10 spraw: KRA/JK01/001 - KRA/JK01/010)
Anna Nowak          → AN01 (5 spraw: ODS/AN01/001 - ODS/AN01/005)
Jerzy Kaczmarek     → JK02 (3 sprawy: UMO/JK02/001 - UMO/JK02/003)
Tomasz Lewandowski  → TL01 (15 spraw: ROD/TL01/001 - ROD/TL01/015)
```

### **Łatwe wyszukiwanie:**
```sql
-- Wszystkie sprawy klienta JK01
SELECT * FROM cases WHERE case_number LIKE '%/JK01/%'

-- Wszystkie sprawy typu KRA
SELECT * FROM cases WHERE case_number LIKE 'KRA/%'

-- Konkretna sprawa
SELECT * FROM cases WHERE case_number = 'KRA/JK01/005'
```

---

## ✅ CO DZIAŁA:

✅ Numer sekwencyjny zawsze od 01  
✅ Konsystentny format dla wszystkich spraw  
✅ Automatyczne obliczanie pozycji klienta  
✅ Wsparcie dla 99 klientów z tymi samymi inicjałami  
✅ Backend automatycznie generuje prawidłowe numery  

---

## 🚀 MIGRACJA STARYCH SPRAW:

**Dla istniejących spraw które mają format bez numeru:**

```sql
-- Przykład: Jan Kowalski był pierwszy z JK, więc dodaj 01
UPDATE cases 
SET case_number = REPLACE(case_number, '/JK/', '/JK01/')
WHERE case_number LIKE '%/JK/%' 
  AND case_number NOT LIKE '%/JK[0-9][0-9]/%';

-- Powtórz dla każdego klienta który miał sprawy bez numeru
```

**Uwaga:** Migracja nie jest wymagana - stare numery nadal działają!

---

## 📋 WERSJA:

- **Status:** ✅ Gotowe
- **Wersja:** 2.0
- **Data:** 5 listopada 2025
- **Backend:** Zaktualizowany (`cases.js`)

---

## 🎉 NOWA NUMERACJA DZIAŁA!

**Format:** `PREFIX/INICJAŁY##/###`  
**Przykład:** `KRA/JK01/001`  

✨ Wszystkie nowe sprawy będą miały numer klienta! ✨
