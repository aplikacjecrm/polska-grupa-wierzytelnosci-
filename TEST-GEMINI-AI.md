WYSWIETLA SIE DASBORD COMING WSOSN
# 🧪 INSTRUKCJA TESTOWANIA GEMINI AI

**Data:** 2 grudnia 2025  
**Wersja:** 1.0

---

## ✅ CHECKLIST TESTOWANIA

### 1. Backend - Czy działa?

```powershell
# Sprawdź czy backend jest uruchomiony
netstat -ano | findstr :3500

# Jeśli nie - uruchom:
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
node backend/server.js
```

**Powinieneś zobaczyć:**
```
✅ Gemini AI: Initialized
🔑 GEMINI_API_KEY loaded: YES ✅
🌐 Server running on http://localhost:3500
```

---

### 2. Frontend - Odśwież cache

```
1. Otwórz aplikację w przeglądarce
2. Naciśnij: Ctrl + Shift + R (wymuś odświeżenie)
3. Sprawdź konsolę (F12) - czy są błędy?
```

---

### 3. Test AI Legal Search

**Krok po kroku:**
1. Zaloguj się do aplikacji
2. Kliknij **🤖 AI Legal Search** (w menu głównym)
3. Wpisz pytanie: **"Jaki jest termin na apelację?"**
4. Kliknij **"Wyszukaj z AI"**

**Oczekiwany rezultat:**
```
🤖 Odpowiedź AI

Termin na wniesienie apelacji w sprawie cywilnej 
wynosi 14 dni od doręczenia wyroku z uzasadnieniem.

Podstawa prawna:
- Art. 369 § 1 KPC
```

**Jeśli błąd:**
- Otwórz konsolę (F12)
- Pokaż mi błąd

---

### 4. Test AI Assistant w Sprawie

**Krok po kroku:**
1. Otwórz **dowolną sprawę** w CRM
2. Kliknij przycisk **"AI Asystent"** (⚖️ w "Szybkie akcje")
3. Kliknij **"📊 Przeanalizuj sprawę"**

**Oczekiwany rezultat:**
```
🔄 Analizuję z aktualnymi przepisami...

[Po chwili:]

Analiza sprawy [numer sprawy]:
- Status: Aktywna
- Kluczowe daty: ...
- Zalecenia: ...
```

**Jeśli błąd "Brak odpowiedzi":**
1. Sprawdź konsolę backendu
2. Sprawdź czy klucz API Gemini jest ważny
3. Zobacz **"Rozwiązywanie problemów"** poniżej

---

### 5. Test Generowania Dokumentów

**Krok po kroku:**
1. Otwórz **dowolną sprawę** w CRM
2. Kliknij **"AI Asystent"**
3. Kliknij **"📝 Generuj dokument"**
4. Wybierz typ: **"Pozew o zapłatę"**
5. Kliknij **"Wygeneruj dokument: pozew"**

**Oczekiwany rezultat:**
```
🔄 Generuję dokument... To może potrwać chwilę...

[Po 5-10 sekundach:]

📄 Wygenerowany szkic dokumentu

POZEW O ZAPŁATĘ
Do Sądu Rejonowego w [DO UZUPEŁNIENIA]
...
```

**Jeśli błąd:**
- Sprawdź konsolę (F12)
- Sprawdź czy endpoint `/api/ai/gemini/generate-document` działa

---

## 🔧 ROZWIĄZYWANIE PROBLEMÓW

### Problem 1: "key not valid. Please pass a valid API key"

**Diagnoza:** Klucz Gemini API jest nieprawidłowy

**Rozwiązanie:**
1. Wejdź: https://makersuite.google.com/app/apikey
2. **USUŃ stary klucz**
3. Kliknij **"Create API Key"**
4. Wybierz **"Default Gemini Project"**
5. **WAŻNE:** Sprawdź ustawienia w Google Cloud Console:
   ```
   https://console.cloud.google.com/apis/credentials
   
   Znajdź klucz → Edit:
   - API restrictions: "Don't restrict key"
   - Application restrictions: "None"
   - Zapisz
   ```
6. Skopiuj nowy klucz i daj mi - dodam automatycznie

---

### Problem 2: "Brak odpowiedzi"

**Diagnoza:** Gemini odpowiada, ale w złym formacie

**Rozwiązanie:**
1. Otwórz konsolę przeglądarki (F12)
2. Kliknij zakładkę **"Console"**
3. Powtórz akcję AI
4. Szukaj: `🤖 Gemini Response:`
5. Skopiuj całą odpowiedź i pokaż mi

---

### Problem 3: Backend nie działa

**Diagnoza:** Port 3500 jest zajęty lub backend nie uruchomiony

**Rozwiązanie:**
```powershell
# Zatrzymaj stary proces
netstat -ano | findstr :3500
# Znajdź PID (ostatnia kolumna)
taskkill /F /PID [NUMER_PID]

# Uruchom nowy
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
node backend/server.js
```

---

### Problem 4: Timeout / Zbyt długo czeka

**Diagnoza:** Gemini API jest wolne lub przeciążone

**Rozwiązanie:**
1. Poczekaj 10-15 sekund
2. Spróbuj ponownie
3. Sprawdź połączenie internetowe
4. Sprawdź status Google AI: https://status.cloud.google.com

---

### Problem 5: "Gemini AI nie jest skonfigurowane"

**Diagnoza:** Klucz API nie jest załadowany w backendzie

**Rozwiązanie:**
```powershell
# Sprawdź plik .env
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
Get-Content .env

# Powinno być:
# GEMINI_API_KEY=AIzaSy...

# Jeśli puste lub złe:
echo GEMINI_API_KEY=AIzaSyDMJL5m8E6BLh5f7thjRBBD1Y5ZN8G-fOE > .env

# Zrestartuj backend
```

---

## 📊 TESTY WYDAJNOŚCI

### Test 1: Prędkość odpowiedzi
- **Proste pytanie:** 2-3 sekundy
- **Analiza sprawy:** 5-8 sekund
- **Generowanie dokumentu:** 8-15 sekund

### Test 2: Limit zapytań
- **Gemini Free:** 60 zapytań/minutę
- **Gemini Pro (płatny):** 1000 zapytań/minutę

---

## ✅ WSZYSTKO DZIAŁA GDY:

1. ✅ Backend pokazuje: `✅ Gemini AI: Initialized`
2. ✅ AI Legal Search odpowiada na pytania
3. ✅ AI Assistant analizuje sprawy
4. ✅ Generowanie dokumentów działa
5. ✅ Brak błędów w konsoli (F12)

---

## 🆘 JEŚLI NIC NIE DZIAŁA:

1. **Sprawdź czy klucz API jest ważny**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Sprawdź czy Generative Language API jest włączone**
   ```
   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   ```

3. **Zrestartuj wszystko od zera:**
   ```powershell
   # Zatrzymaj backend
   taskkill /F /PID [backend_PID]
   
   # Wyczyść cache przeglądarki
   Ctrl + Shift + Delete
   
   # Uruchom backend
   node backend/server.js
   
   # Odśwież stronę
   Ctrl + Shift + R
   ```

4. **Wygeneruj NOWY klucz API** i daj mi - skonfiguruję automatycznie

---

## 📞 KONTAKT

Jeśli wszystko inne zawiedzie:
1. Pokaż mi **logi backendu** (konsola gdzie uruchomiłeś `node backend/server.js`)
2. Pokaż mi **konsolę przeglądarki** (F12 → Console)
3. Powiedz **co dokładnie zrobiłeś** i **jaki błąd dostałeś**

---

**Powodzenia w testach! 🚀**
