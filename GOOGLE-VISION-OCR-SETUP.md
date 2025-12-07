# 🔧 KONFIGURACJA GOOGLE CLOUD VISION OCR

## ✅ CO ZOSTAŁO ZAINSTALOWANE:
- ✅ Biblioteka @google-cloud/vision
- ✅ Funkcja OCR dla obrazów (JPG/PNG/GIF)
- ✅ Integracja z AI - screenshoty będą czytane!

---

## 📋 JAK UZYSKAĆ API KEY (DARMOWE 1000 OCR/miesiąc):

### **Krok 1: Utwórz projekt w Google Cloud**
1. Wejdź na: https://console.cloud.google.com/
2. Zaloguj się kontem Google
3. Kliknij "Create Project" (Utwórz projekt)
4. Nazwa: "Kancelaria-OCR" (dowolna)
5. Kliknij "Create"

### **Krok 2: Aktywuj Vision API**
1. W menu bocznym: "APIs & Services" → "Library"
2. Wyszukaj: "Cloud Vision API"
3. Kliknij na "Cloud Vision API"
4. Kliknij "Enable" (Włącz)

### **Krok 3: Utwórz API Key**
1. W menu: "APIs & Services" → "Credentials"
2. Kliknij "Create Credentials" → "API Key"
3. **SKOPIUJ KLUCZ!** (np. `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Kliknij "Close"

### **Krok 4: Ogranicz klucz (bezpieczeństwo)**
1. Kliknij na utworzony klucz API
2. W "API restrictions":
   - Wybierz "Restrict key"
   - Zaznacz tylko: "Cloud Vision API"
3. Kliknij "Save"

---

## 🔐 DODAJ KLUCZ DO APLIKACJI:

### **Windows (PowerShell):**
```powershell
# W folderze backend utwórz plik .env:
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\backend

# Utwórz plik .env z kluczem:
echo "GOOGLE_CLOUD_VISION_API_KEY=TU_WKLEJ_SWOJ_KLUCZ" > .env
```

### **Lub ręcznie:**
1. Otwórz folder: `kancelaria/komunikator-app/backend/`
2. Utwórz plik: `.env` (z kropką na początku!)
3. Dodaj linię:
```
GOOGLE_CLOUD_VISION_API_KEY=TU_WKLEJ_SWOJ_KLUCZ
```
4. Zapisz plik

### **Przykład pliku .env:**
```
PORT=3500
GEMINI_API_KEY=AIza...
GOOGLE_CLOUD_VISION_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔄 RESTART BACKENDU:

Po dodaniu klucza:
```powershell
# Zatrzymaj backend (Ctrl+C)
# Uruchom ponownie:
cd backend
node server.js
```

---

## ✅ WERYFIKACJA - Czy działa?

### **Test 1: Logi przy starcie**
Backend powinien pokazać:
```
✅ Google Cloud Vision OCR: AKTYWNE
```

### **Test 2: Test obrazu**
```powershell
node -e "const parser = require('./backend/services/document-parser'); parser.extractTextFromImage('ścieżka/do/screenshota.jpg').then(r => console.log(r));"
```

### **Test 3: W aplikacji**
1. Otwórz sprawę z obrazami/screenshotami
2. Kliknij "Asystent Prawny AI"
3. Zapytaj: "Co jest na zdjęciach/screenshotach?"
4. AI odpowie z treścią ze screenshotów!

---

## 💰 CENNIK (po darmowym limicie):

| Ilość OCR/miesiąc | Koszt |
|-------------------|-------|
| 0 - 1,000 | **DARMOWE** ✅ |
| 1,001 - 5,000,000 | $1.50 za 1000 |
| 5,000,001+ | $0.60 za 1000 |

**Przykład:** 10,000 screenshotów = $13.50/miesiąc

---

## ⚠️ BEZ KLUCZA API:

Jeśli nie dodasz klucza, system **będzie działał**, ale:
- ❌ Obrazy nie będą czytane (OCR wyłączony)
- ✅ PDFy i DOCXy będą działać normalnie
- ⚠️ W logach: "Google Cloud Vision API key brak - pomijam OCR"

---

## 🆘 PROBLEMY?

### **Błąd: "API key not valid"**
- Sprawdź czy klucz jest poprawny (skopiowany cały)
- Sprawdź czy Vision API jest włączone w projekcie

### **Błąd: "Quota exceeded"**
- Przekroczyłeś 1000 darmowych OCR/miesiąc
- Dodaj kartę płatniczą w Google Cloud Console

### **OCR nie działa**
- Sprawdź czy plik .env istnieje w folderze `backend/`
- Sprawdź czy backend został zrestartowany po dodaniu klucza
- Sprawdź logi backendu przy starcie

---

## 📞 KONTAKT:

Jeśli OCR nie działa lub masz pytania, napisz w czacie!
