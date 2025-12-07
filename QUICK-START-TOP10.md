# 🚀 QUICK START - TOP 10 USTAW

## ✅ AKTUALNY STATUS: 5/10 (50%)

### **GOTOWE:**
1. ✅ **KC** - Kodeks cywilny (1333 art.) 🎉

### **DO PEŁNEGO WKLEJENIA (tylko testowe 5 art.):**
2. ⏳ **KPC** - Kodeks postępowania cywilnego
3. ⏳ **KK** - Kodeks karny
4. ⏳ **KP** - Kodeks pracy
5. ⏳ **KRO** - Kodeks rodzinny i opiekuńczy

### **BRAK TEKSTU (trzeba wkleić):**
6. ❌ **PPSA** - Prawo o postępowaniu przed sądami admin.
7. ❌ **PODATKOWE** - Ordynacja podatkowa
8. ❌ **VAT** - Ustawa o VAT
9. ❌ **BANKOWE** - Prawo bankowe
10. ❌ **UPADLOSCIOWE** - Prawo upadłościowe

---

## 📝 INSTRUKCJA KROK PO KROKU:

### **KROK 1: Otwórz plik**
```
backend/temp/KPC-full.txt
```

### **KROK 2: Skopiuj link ISAP**
Link jest w pliku na górze!

### **KROK 3: Pobierz tekst z ISAP**
1. Otwórz link w przeglądarce
2. Kliknij "Tekst" lub "Pobierz PDF"
3. Zaznacz CAŁY tekst (Ctrl+A)
4. Skopiuj (Ctrl+C)

### **KROK 4: Wklej do pliku**
1. Wróć do pliku `.txt`
2. **USUŃ** instrukcje z pliku
3. **WKLEJ** cały tekst (Ctrl+V)
4. **ZAPISZ** (Ctrl+S)

### **KROK 5: Importuj**
```bash
node backend/scripts/import-single-code.js KPC
```

### **KROK 6: Sprawdź dashboard**
```bash
node backend/scripts/dashboard-top10.js
```

### **KROK 7: Powtórz dla kolejnych**
```
KK → KP → KRO → PPSA → PODATKOWE → VAT → BANKOWE → UPADLOSCIOWE
```

---

## ⚡ SZYBKA METODA (Wszystkie naraz):

### **1. Wklej wszystkie teksty (9 plików):**
```
backend/temp/KPC-full.txt
backend/temp/KK-full.txt
backend/temp/KP-full.txt
backend/temp/KRO-full.txt
backend/temp/PPSA-full.txt
backend/temp/PODATKOWE-full.txt
backend/temp/VAT-full.txt
backend/temp/BANKOWE-full.txt
backend/temp/UPADLOSCIOWE-full.txt
```

### **2. Uruchom import zbiorczy:**
```bash
node backend/scripts/import-single-code.js KPC
node backend/scripts/import-single-code.js KK
node backend/scripts/import-single-code.js KP
node backend/scripts/import-single-code.js KRO
node backend/scripts/import-single-code.js PPSA
node backend/scripts/import-single-code.js PODATKOWE
node backend/scripts/import-single-code.js VAT
node backend/scripts/import-single-code.js BANKOWE
node backend/scripts/import-single-code.js UPADLOSCIOWE
```

### **3. Sprawdź:**
```bash
node backend/scripts/dashboard-top10.js
```

---

## 🎯 LINKI ISAP (GOTOWE):

Wszystkie linki są w plikach `.txt` w folderze `backend/temp/`

**Najważniejsze:**
- **KPC:** https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296
- **KK:** https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553
- **KP:** https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141
- **KRO:** https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640090059
- **PPSA:** https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20020531532

---

## 📊 MONITORUJ POSTĘP:

```bash
# Sprawdź status TOP 10
node backend/scripts/dashboard-top10.js

# Sprawdź wszystkie 61 ustaw
node backend/scripts/dashboard.js
```

---

## ✅ PO UKOŃCZENIU TOP 10:

### **🎉 GRATULACJE!**

**Następny krok: ETAP 2**
```
Zobacz: ETAP-2-PLAN.md

Zaczynamy dodawać:
- ✅ Orzeczenia TK/SN
- ✅ Interpretacje
- ✅ Historię zmian
- ✅ Teksty jednolite
```

---

## 💡 TIPS:

### **Przyspieszenie:**
1. Otwórz wszystkie pliki `.txt` w edytorze
2. Otwórz wszystkie linki ISAP w przeglądárce (zakładki)
3. Kopiuj-wklej po kolei
4. Import zbiorczy na końcu

### **Jeśli coś nie działa:**
```bash
# Debug mode:
node backend/scripts/import-single-code.js KPC --debug

# Sprawdź logi w konsoli
# Sprawdź czy plik ma > 1000 znaków
```

### **Jeśli brak artykułów:**
- Sprawdź czy tekst jest PEŁNY (nie tylko fragmenty)
- Sprawdź czy zaczyna się od "Art. 1"
- Sprawdź czy ma artykuły w formacie: `Art. 123.`

---

## 🚀 START - ZACZNIJ OD KPC!

**Otwórz teraz:**
```
backend/temp/KPC-full.txt
```

**I wklej pełny tekst Kodeksu Postępowania Cywilnego!** 📚✨
