# 📄 ZEZNANIA PISEMNE JAKO PLIKI TXT

**Data:** 7 listopada 2025, 00:36  
**Funkcja:** Automatyczny zapis zeznań pisemnych jako pliki TXT z numeracją

---

## ✅ CO ZOSTAŁO ZROBIONE:

### **1. Przywrócenie prefiksu typu w załącznikach**
Format wrócił do: `ZAL/[numer_sprawy]/[TYP]/[nr]`

**Przykład:**
```
ZAL/GOS/AA01/001/SWI/003  ← Załącznik świadka nr 3
```

**Prefixy typów:**
- `SWI` - Świadek (zeznania, nagrania)
- `CYW` - Szczegóły cywilne
- `KAR` - Szczegóły karne
- `SCE` - Scenariusz
- `STR` - Strona przeciwna
- `DOW` - Dowód
- `ZAS` - Zaświadczenie
- `ZEZ` - Zeznanie
- `OGL` - Ogólny

---

### **2. Nowy endpoint - Zapis zeznania jako TXT**

**Endpoint:**
```
POST /api/witnesses/:witnessId/testimonies/:testimonyId/save-as-txt
```

**Co robi:**
1. Pobiera zeznanie z bazy danych
2. Generuje kod załącznika (`ZAL/[...]/SWI/[nr]`)
3. Tworzy plik TXT z sformatowaną treścią
4. Zapisuje plik w `backend/uploads/attachments/`
5. Dodaje załącznik do bazy danych

**Nazwa pliku:**
```
ZAL_GOS_AA01_001_SWI_003_v1_1699123456789.txt
```

---

### **3. Format pliku TXT**

**Przykładowa treść:**
```
ZEZNANIE ŚWIADKA
================

Kod załącznika: ZAL/GOS/AA01/001/SWI/003
Świadek: Jan Kowalski
Kod świadka: ŚW/GOS/AA01/001/001
Data zeznania: 5.11.2025, 14:30:00
Typ zeznania: Pisemne
Wersja: 1

--------------------------------------------------------------------------------

TREŚĆ ZEZNANIA:

W dniu 3 listopada 2025 roku około godziny 15:00 znajdowałem się 
na ulicy Głównej w Warszawie. Widziałem jak...
[pełna treść zeznania]

--------------------------------------------------------------------------------

OCENA WIARYGODNOŚCI:
Świadek przedstawia spójną relację, potwierdzoną przez inne dowody.

Data zapisu: 7.11.2025, 00:30:00
```

---

### **4. Automatyczne działanie we frontendzie**

**Kiedy użytkownik dodaje zeznanie PISEMNE:**
1. ✅ Zeznanie zapisuje się w bazie danych
2. ✅ **AUTOMATYCZNIE** tworzy się plik TXT
3. ✅ **AUTOMATYCZNIE** dodaje się załącznik z kodem
4. ✅ Załącznik pojawia się w sekcji "📎 Załączniki"

**Użytkownik nie musi nic robić!**

---

## 📊 PRZEPŁYW DANYCH:

```
1. Użytkownik dodaje zeznanie pisemne
   ↓
2. Frontend → POST /witnesses/:id/testimonies
   ← Response: { testimony_id: 123 }
   ↓
3. Frontend → POST /witnesses/:id/testimonies/123/save-as-txt
   ↓
4. Backend:
   - Pobiera zeznanie
   - Generuje kod ZAL/GOS/AA01/001/SWI/003
   - Tworzy plik TXT
   - Zapisuje w uploads/attachments/
   - Dodaje do tabeli attachments
   ↓
5. ← Response: { attachment_code: "ZAL/GOS/AA01/001/SWI/003" }
   ↓
6. Załącznik pojawia się w UI
```

---

## 🎯 ZALETY:

### **Dla użytkownika:**
- ✅ **Zero dodatkowej pracy** - wszystko automatyczne
- ✅ **Profesjonalny format** - czytelny plik TXT
- ✅ **Numer załącznika** - łatwe odnalezienie
- ✅ **Możliwość pobrania** - plik do archiwum/wydruku

### **Dla systemu:**
- ✅ **Spójność** - zeznania pisemne = załącznik
- ✅ **Numeracja** - jeden system dla wszystkich
- ✅ **Backup** - treść zeznania też w pliku
- ✅ **Archiwizacja** - łatwy export

---

## 🧪 JAK PRZETESTOWAĆ:

### **1. Odśwież przeglądarkę:**
```
Ctrl + Shift + R
```

### **2. Dodaj zeznanie pisemne:**
- Otwórz sprawę → Zakładka "👤 Świadkowie"
- Otwórz świadka → "📝 Zeznania"
- Kliknij "+ Dodaj zeznanie"
- **Typ:** Wybierz "Pisemne"
- **Data:** Wybierz datę
- **Treść:** Wpisz zeznanie
- Kliknij "Zapisz"

### **3. Sprawdź załączniki:**
Sekcja "📎 Załączniki" powinna pokazać:
```
┌─────────────────────────────────────┐
│ 🔢 ZAL/GOS/AA01/001/SWI/003         │
│ Zeznanie pisemne - Jan Kowalski v1  │
│ 📄 text/plain • 1.2 KB               │
│ [👁️ Zobacz] [⬇️ Pobierz]           │
└─────────────────────────────────────┘
```

### **4. Pobierz plik:**
- Kliknij "⬇️ Pobierz"
- Otwórz plik TXT w notatniku
- Sprawdź czy treść jest sformatowana

---

## 📁 ZMODYFIKOWANE PLIKI:

### **Backend:**
```
✅ backend/routes/attachments.js          - Przywrócenie prefiksu typu
✅ backend/routes/witnesses.js            - Nowy endpoint save-as-txt
```

### **Frontend:**
```
✅ frontend/scripts/modules/witnesses-module.js  - Auto-zapis jako TXT (v13)
✅ frontend/index.html                           - Cache busting
```

### **Dokumentacja:**
```
✅ ZEZNANIA-PISEMNE-TXT.md  - Ten plik
```

---

## 🔢 NUMERACJA:

### **Świadkowie:**
```
ŚW/GOS/AA01/001/001  - Pierwszy świadek
ŚW/GOS/AA01/001/002  - Drugi świadek
```

### **Załączniki świadków:**
```
ZAL/GOS/AA01/001/SWI/001  - Pierwsze zeznanie (TXT lub nagranie)
ZAL/GOS/AA01/001/SWI/002  - Drugie zeznanie
ZAL/GOS/AA01/001/SWI/003  - Trzecie zeznanie
```

**Prefix `SWI`** oznacza załącznik związany ze świadkiem.

---

## 🛠️ TECHNICZNE SZCZEGÓŁY:

### **Struktura pliku TXT:**
- **Header:** Metadata (kod, świadek, data)
- **Separator:** `---...---`
- **Treść:** Pełna treść zeznania
- **Separator:** `---...---`
- **Ocena:** Ocena wiarygodności (opcjonalna)
- **Wycofanie:** Info o wycofaniu (jeśli dotyczy)
- **Footer:** Data zapisu

### **Encoding:**
- **UTF-8** - polskie znaki działają poprawnie

### **Lokalizacja plików:**
```
backend/uploads/attachments/
├── ZAL_GOS_AA01_001_SWI_001_v1_1699123456789.txt
├── ZAL_GOS_AA01_001_SWI_002_v1_1699123467890.txt
└── ZAL_GOS_AA01_001_SWI_003_v1_1699123478901.txt
```

---

## ⚠️ WAŻNE:

### **Zeznania nagraniowe (audio/wideo):**
- **NIE są zapisywane jako TXT**
- Zapisywane są jako pliki multimedialne (.webm, .mp4, .ogg)
- Dostają ten sam format kodu: `ZAL/.../SWI/[nr]`

### **Wersje zeznań:**
- Każda nowa wersja zeznania dostaje **nowy numer załącznika**
- Przykład:
  - Zeznanie v1 → `ZAL/.../SWI/001`
  - Zeznanie v2 → `ZAL/.../SWI/002`

---

## ✅ STATUS:

**GOTOWE I DZIAŁAJĄCE!**

- ✅ Backend zaktualizowany i zrestartowany
- ✅ Frontend z auto-zapisem TXT
- ✅ Cache busting zaktualizowany
- ✅ Prefix typu przywrócony
- ✅ Dokumentacja gotowa

---

## 🚀 NASTĘPNE KROKI (opcjonalne):

### **Możliwe usprawnienia:**
1. **Format PDF** zamiast TXT (bardziej profesjonalny)
2. **Szablon zeznania** z logo kancelarii
3. **Eksport wielu zeznań** jako ZIP
4. **Edycja treści TXT** przed zapisem
5. **Podpis cyfrowy** na plikach TXT

**Ale to już na później!** 😊

---

**Gotowe do testowania!** 🎉

Dodaj zeznanie pisemne i zobacz jak automatycznie pojawia się załącznik TXT!
