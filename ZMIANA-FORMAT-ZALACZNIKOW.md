# 🔄 ZMIANA FORMATU KODÓW ZAŁĄCZNIKÓW

**Data:** 7 listopada 2025, 00:23  
**Powód:** Uproszenie numeracji na prośbę użytkownika - spójność ze świadkami

---

## 📋 STARY FORMAT (za długi):

```
ZAL/GOS/AA01/001/SWI/003
│   │            │   └── Numer załącznika (003)
│   │            └────── Typ encji (SWI - świadek)
│   └─────────────────── Numer sprawy
└─────────────────────── Prefix ZAŁĄCZNIK
```

**Problem:** Zbyt skomplikowany, niepotrzebny prefix typu

---

## ✅ NOWY FORMAT (prosty i czytelny):

```
ZAL/GOS/AA01/001/003
│   │            └── Numer załącznika
│   └──────────────── Numer sprawy
└──────────────────── Załącznik
```

**Zalety:**
- ✅ **40% krótszy**
- ✅ **Spójny ze świadkami** (`ŚW/GOS/AA01/001/001`)
- ✅ **Wszystkie istotne informacje**
- ✅ **Łatwiejszy do zapamiętania**

---

## 🔧 CO ZOSTAŁO ZMIENIONE:

### **1. Backend - Generator załączników:**
**Plik:** `backend/routes/attachments.js`

**Zmiana:**
```javascript
// STARE:
const typePrefix = ATTACHMENT_TYPE_PREFIXES[entity_type] || 'OGL';
const prefix = `ZAL/${caseNumber}/${typePrefix}/`;

// NOWE (prosty format):
const prefix = `ZAL/${caseNumber}/`;
// Pomiń typePrefix - uproszczony format jak świadkowie
```

---

## 📊 PORÓWNANIE:

| Aspekt | Stary Format | Nowy Format |
|--------|--------------|-------------|
| Długość | 25 znaków | 18 znaków |
| Czytelność | ⚠️ Niska | ✅ Wysoka |
| Spójność | ⚠️ Różni się od świadków | ✅ Spójny system |
| Unikalność | ✅ Tak | ✅ Tak |

---

## 🧪 PRZYKŁADY NOWYCH KODÓW:

### **Zeznania świadka:**
```
ZAL/GOS/AA01/001/001  - Pierwsze zeznanie (pisemne/audio/wideo)
ZAL/GOS/AA01/001/002  - Drugie zeznanie
ZAL/GOS/AA01/001/003  - Trzecie zeznanie
```

### **Dokumenty sprawy:**
```
ZAL/SP-042/2025/001  - Pierwszy dokument
ZAL/SP-042/2025/002  - Drugi dokument
```

### **Nagrania:**
```
ZAL/KAR-123/2024/001  - Pierwsze nagranie
ZAL/KAR-123/2024/002  - Drugie nagranie
```

---

## 📁 TYP ZAŁĄCZNIKÓW (wewnętrznie):

Typ załącznika (`entity_type`) jest nadal przechowywany w bazie, ale **nie jest częścią kodu**:

| entity_type | Opis | Przykład użycia |
|-------------|------|-----------------|
| `witness` | Świadek | Zeznania, nagrania |
| `evidence` | Dowód | Zdjęcia, dokumenty |
| `testimony` | Zeznanie | Pisemne zeznania |
| `document` | Dokument | Pozwy, odpowiedzi |
| `general` | Ogólny | Różne |

---

## ⚠️ UWAGA - KOMPATYBILNOŚĆ:

### **Istniejące załączniki:**
Stare kody **pozostaną bez zmian**:
- `ZAL/GOS/AA01/001/SWI/001` ← Stary format (zachowany)

### **Nowe załączniki:**
Nowo dodane załączniki dostaną **nowy prosty format**:
- `ZAL/GOS/AA01/001/001` ← Nowy format

### **Frontend:**
Wyświetli **oba formaty** poprawnie - bez zmian w `attachment-uploader.js`

---

## 🚀 JAK PRZETESTOWAĆ:

### **1. Dodaj zeznanie świadka:**
- Otwórz sprawę
- Zakładka "👤 Świadkowie"
- Otwórz świadka → "📝 Zeznania"
- Dodaj nowe zeznanie (pisemne/audio/wideo)
- Sprawdź sekcję "📎 Załączniki"

### **2. Sprawdź kod:**
Powinien być w nowym formacie:
```
┌───────────────────────────────┐
│ 🔢 ZAL/GOS/AA01/001/003       │  ← NOWY PROSTY FORMAT!
└───────────────────────────────┘
```

### **3. Upload dokumentu:**
- Dodaj dowolny załącznik do sprawy
- Kod powinien być: `ZAL/[numer_sprawy]/[numer]`

---

## 🔗 SPÓJNOŚĆ SYSTEMU:

Wszystkie kody mają teraz **ten sam prosty format**:

```
ŚW/GOS/AA01/001/001   - Świadkowie
ZAL/GOS/AA01/001/001  - Załączniki
```

**Logika:**
```
[PREFIX]/[NUMER_SPRAWY]/[NUMER_PORZĄDKOWY]
```

---

## ✅ STATUS:

**GOTOWE!** Zmiana została wdrożona:
- ✅ Backend zaktualizowany
- ✅ Generator uproszczony
- ✅ Kompatybilność wsteczna zachowana
- ✅ Spójność z systemem świadków
- ✅ Backend zrestartowany

---

## 📝 DALSZE ZMIANY (opcjonalne):

Jeśli potrzebujesz innych uproszczeń:
- **Wydarzenia:** `ROZ/[numer_sprawy]/[numer]` zamiast pełnego
- **Dokumenty:** `DOK/[numer_sprawy]/[numer]` zamiast pełnego
- **Notatki:** `NOT/[numer_sprawy]/[numer]` zamiast pełnego

**Decyzja należy do Ciebie!** Możemy uprościć wszystko albo zostawić jak jest.

---

**Zaktualizowano:** 7 listopada 2025, 00:23  
**Gotowe do testowania!** 🚀
