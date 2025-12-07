# 🔢 SYSTEM UNIWERSALNEJ NUMERACJI v1

## 🎯 CEL SYSTEMU

**Każdy element w systemie ma unikalny, czytelny kod** który pozwala:
- ✅ Szybko zidentyfikować typ elementu
- ✅ Powiązać z konkretną sprawą
- ✅ Znaleźć w wyszukiwarce
- ✅ Zachować porządek i profesjonalizm

---

## 📐 STRUKTURA KODÓW

### **Format uniwersalny:**
```
[PREFIX]/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_ELEMENTU]
```

### **Format sprawy:**
```
[TYP]-[NUMER]/[ROK]
```

---

## 📁 KODY SPRAW

```
SP-001/2025      - Sprawa cywilna (ogólna)
ROD-042/2025     - Sprawa rodzinna
KAR-123/2024     - Sprawa karna
GOS-056/2025     - Sprawa gospodarcza
ADM-011/2025     - Sprawa administracyjna
PRA-008/2025     - Prawo pracy
DRG-033/2025     - Prawo o ruchu drogowym
MIE-001/2025     - Międzynarodowa
SPE-002/2025     - Specjalna
INN-099/2025     - Inna
```

---

## 👥 KODY OSÓB

### **Format:**
```
[ROLA]/[TYP_SPRAWY]/[INICJAŁY_KLIENTA]/[NUMER_SPRAWY]/[NUMER_OSOBY]
```

### **Role:**
- `KLI` - Klient (powód/oskarżyciel)
- `PRZ` - Przeciwnik (pozwany/oskarżony)
- `ŚW` - Świadek
- `BIE` - Biegły
- `MED` - Mediator
- `TŁU` - Tłumacz
- `KUR` - Kurator
- `ADW` - Adwokat strony przeciwnej
- `PRK` - Prokurator
- `SĘD` - Sędzia

### **Przykłady:**
```
KLI/CYW/JK/SP-001/2025/001     - Pierwszy klient (powód)
PRZ/CYW/JK/SP-001/2025/001     - Pozwany
ŚW/SP-001/2025/001             - Pierwszy świadek (PROSTY FORMAT!)
ŚW/SP-001/2025/002             - Drugi świadek (PROSTY FORMAT!)
BIE/KAR/MK/KAR-123/2024/001    - Biegły w sprawie karnej
MED/ROD/AN/ROD-042/2025/001    - Mediator w sprawie rodzinnej
```

---

## 📄 KODY DOKUMENTÓW

### **Format:**
```
DOK/[TYP_DOK]/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_DOK]
```

### **Typy dokumentów:**
- `POZ` - Pozew
- `ODP` - Odpowiedź na pozew
- `WNI` - Wniosek
- `WYR` - Wyrok
- `ODW` - Odwołanie
- `ZAS` - Zaskarżenie
- `UZA` - Uzasadnienie
- `ZAŁ` - Załącznik
- `PIS` - Pismo procesowe
- `SPR` - Sprzeciw
- `APE` - Apelacja
- `KAS` - Kasacja
- `SKA` - Skarga
- `ZAW` - Zawiadomienie

### **Przykłady:**
```
DOK/POZ/CYW/JK/SP-001/2025/001   - Pozew
DOK/ODP/CYW/JK/SP-001/2025/001   - Odpowiedź na pozew
DOK/WNI/ROD/AN/ROD-042/2025/001  - Wniosek o rozwód
DOK/WYR/KAR/MK/KAR-123/2024/001  - Wyrok
DOK/APE/GOS/TS/GOS-056/2025/001  - Apelacja
```

---

## 🔍 KODY DOWODÓW

### **Format:**
```
DOW/[TYP_DOW]/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_DOW]
```

### **Typy dowodów:**
- `DOK` - Dokument pisemny (umowa, faktura, korespondencja)
- `ZDJ` - Zdjęcie
- `VID` - Nagranie wideo
- `AUD` - Nagranie audio
- `EKS` - Ekspertyza
- `PRZ` - Protokół przesłuchania
- `OGL` - Protokół oględzin
- `BAD` - Badanie (medyczne, techniczne)
- `ANL` - Analiza (finansowa, chemiczna)
- `RAP` - Raport (policyjny, medyczny)

### **Przykłady:**
```
DOW/DOK/CYW/JK/SP-001/2025/001   - Umowa (dokument)
DOW/ZDJ/CYW/JK/SP-001/2025/002   - Zdjęcie uszkodzeń
DOW/VID/KAR/MK/KAR-123/2024/001  - Nagranie z monitoringu
DOW/EKS/GOS/TS/GOS-056/2025/001  - Ekspertyza techniczna
DOW/BAD/ROD/AN/ROD-042/2025/001  - Badanie psychologiczne dziecka
```

---

## 💬 KODY ZEZNAŃ

### **Format zeznania:**
```
ZEZ/[TYP_ZEZ]/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_ZEZ]
```

### **Format nagrania (per świadek):**
```
NAG/[NUMER]
```

### **Typy zeznań:**
- `PIS` - Pisemne
- `UST` - Ustne (protokół)
- `NAG` - Nagrane (audio/video)

### **Przykłady:**
```
ZEZ/PIS/CYW/JK/SP-001/2025/001   - Zeznanie pisemne świadka
ZEZ/UST/KAR/MK/KAR-123/2024/002  - Zeznanie ustne (protokół)

NAG/001   - Pierwsze nagranie zeznania świadka ŚW/.../001
NAG/002   - Drugie nagranie tego samego świadka
NAG/003   - Trzecie nagranie (korekta)
```

---

## 📅 KODY WYDARZEŃ

### **Format:**
```
[TYP_WYD]/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_WYD]
```

### **Typy wydarzeń:**
- `ROZ` - Rozprawa sądowa
- `SPO` - Spotkanie
- `TER` - Termin procesowy
- `MED` - Mediacja
- `NEG` - Negocjacje
- `PRZ` - Przesłuchanie
- `EKS` - Ekspertyza/Oględziny
- `DOK` - Złożenie dokumentu
- `KON` - Konsultacja
- `ZAD` - Zadanie
- `WOK` - Wokanda (ogłoszenie terminu)
- `WYR` - Ogłoszenie wyroku
- `INN` - Inne wydarzenie

### **Przykłady:**
```
ROZ/CYW/JK/SP-001/2025/001       - Pierwsza rozprawa
ROZ/CYW/JK/SP-001/2025/002       - Druga rozprawa
SPO/ROD/AN/ROD-042/2025/001      - Spotkanie z klientem
MED/GOS/TS/GOS-056/2025/001      - Mediacja
TER/KAR/MK/KAR-123/2024/001      - Termin złożenia apelacji
```

---

## 💰 KODY KOSZTÓW

### **Format:**
```
KOS/[TYP_KOS]/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_KOS]
```

### **Typy kosztów:**
- `OPL` - Opłata sądowa
- `WYD` - Wydatek (dojazd, ekspertyza)
- `FAK` - Faktura
- `HON` - Honorarium
- `ZAL` - Zaliczka
- `KAU` - Kaucja
- `GRZ` - Grzywna
- `NAW` - Nawiązka
- `ODK` - Odszkodowanie (wypłacone)

### **Przykłady:**
```
KOS/OPL/CYW/JK/SP-001/2025/001   - Opłata od pozwu
KOS/WYD/CYW/JK/SP-001/2025/002   - Koszty dojazdu
KOS/HON/GOS/TS/GOS-056/2025/001  - Honorarium adwokata
KOS/FAK/ROD/AN/ROD-042/2025/001  - Faktura za usługi
```

---

## 📝 KODY NOTATEK

### **Format:**
```
NOT/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_NOT]
```

### **Typy notatek:**
- `NOT` - Notatka zwykła
- `MEM` - Memo
- `STR` - Strategia
- `ANA` - Analiza
- `RAP` - Raport

### **Przykłady:**
```
NOT/CYW/JK/SP-001/2025/001       - Pierwsza notatka
MEM/KAR/MK/KAR-123/2024/005      - Piąte memo
STR/GOS/TS/GOS-056/2025/001      - Strategia procesowa
```

---

## 🗂️ PRZYKŁAD KOMPLETNY - SPRAWA SP-001/2025

```
SPRAWA:          SP-001/2025 (Jan Kowalski - odszkodowanie)

STRONY:
  Powód:         KLI/CYW/JK/SP-001/2025/001
  Pozwany:       PRZ/CYW/JK/SP-001/2025/001

ŚWIADKOWIE:
  Świadek 1:     ŚW/CYW/JK/SP-001/2025/001
  Świadek 2:     ŚW/CYW/JK/SP-001/2025/002

DOKUMENTY:
  Pozew:         DOK/POZ/CYW/JK/SP-001/2025/001
  Odpowiedź:     DOK/ODP/CYW/JK/SP-001/2025/001
  Wyrok:         DOK/WYR/CYW/JK/SP-001/2025/001

DOWODY:
  Umowa:         DOW/DOK/CYW/JK/SP-001/2025/001
  Zdjęcia:       DOW/ZDJ/CYW/JK/SP-001/2025/002
  Ekspertyza:    DOW/EKS/CYW/JK/SP-001/2025/003

ZEZNANIA:
  Świadka 1:     ZEZ/PIS/CYW/JK/SP-001/2025/001
    Nagrania:    NAG/001, NAG/002
  Świadka 2:     ZEZ/UST/CYW/JK/SP-001/2025/002

WYDARZENIA:
  Rozprawa 1:    ROZ/CYW/JK/SP-001/2025/001
  Rozprawa 2:    ROZ/CYW/JK/SP-001/2025/002
  Wyrok:         WYR/CYW/JK/SP-001/2025/001

KOSZTY:
  Opłata:        KOS/OPL/CYW/JK/SP-001/2025/001
  Ekspertyza:    KOS/WYD/CYW/JK/SP-001/2025/002
  Honorarium:    KOS/HON/CYW/JK/SP-001/2025/003

NOTATKI:
  Strategia:     STR/CYW/JK/SP-001/2025/001
  Memo:          MEM/CYW/JK/SP-001/2025/002
```

---

## 🔍 WYSZUKIWANIE

### **Po kodzie sprawy:**
```
SP-001/2025  → Wszystkie elementy tej sprawy
```

### **Po kodzie elementu:**
```
ŚW/CYW/JK/SP-001/2025/001  → Konkretny świadek
DOK/POZ/CYW/JK/SP-001/2025/001  → Konkretny dokument
```

### **Po typie elementu:**
```
ŚW/*  → Wszyscy świadkowie
DOK/POZ/*  → Wszystkie pozwy
ROZ/*  → Wszystkie rozprawy
```

### **Po inicjałach klienta:**
```
*/JK/*  → Wszystkie sprawy Jana Kowalskiego
```

---

## ✅ KORZYŚCI

1. **Jednoznaczność** - Każdy kod unikalny
2. **Czytelność** - Z kodu wiadomo co to jest
3. **Hierarchia** - Widoczny związek ze sprawą
4. **Wyszukiwanie** - Łatwe filtrowanie
5. **Profesjonalizm** - Spójna numeracja
6. **Archiwizacja** - Łatwe odnalezienie po latach

---

## 📊 STATYSTYKI SYSTEMU

**Maksymalna pojemność per sprawa:**
- Osoby: 999 (001-999)
- Dokumenty: 999 per typ
- Dowody: 999 per typ
- Wydarzenia: 999 per typ
- Koszty: 999 per typ
- Notatki: 999

**Szacunkowa pojemność całkowita:**
- Sprawy: 999 per rok per typ = ~10,000/rok
- Elementy per sprawa: ~5,000
- **Razem: > 50,000,000 unikalnych kodów możliwych**

---

## 🎓 KONWENCJE

1. **Zawsze uppercase** - ŚW, DOK, ROZ (nie św, dok, roz)
2. **Padding zerami** - 001, 002, 099 (nie 1, 2, 99)
3. **Separator slash** - `/` (nie `-`, `_`, `.`)
4. **Format daty** - ROK zawsze 4 cyfry (2025, nie 25)
5. **Inicjały** - 2 litery minimum (JK, AN, TS)

---

**System gotowy do implementacji! ✨**
