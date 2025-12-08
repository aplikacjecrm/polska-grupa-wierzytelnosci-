# 🚂 RAILWAY DEPLOYMENT - KROK PO KROKU

## ✅ **WSZYSTKO GOTOWE! TYLKO KLIKAJ!**

---

## 📋 **KROK 1: Wejdź na Railway**

**Link:** https://railway.app/

1. Kliknij: **"Login"**
2. Wybierz: **"Login with GitHub"**
3. Zaloguj się przez GitHub
4. Autoryzuj Railway

---

## 📋 **KROK 2: Nowy Projekt**

1. Kliknij: **"+ New Project"** (prawy górny róg)
2. Wybierz: **"Deploy from GitHub repo"**
3. Jeśli nie widzisz repo:
   - Kliknij **"Configure GitHub App"**
   - Wybierz **pgwpl**
   - Daj dostęp do **promeritum-komunikator-v2**
   - Wróć do Railway
4. Znajdź i kliknij: **promeritum-komunikator-v2**
5. Kliknij: **"Deploy Now"**

**Czekaj 2-3 minuty - Railway deployuje!**

---

## 📋 **KROK 3: Environment Variables**

**W Railway Dashboard:**

1. Kliknij na nazwę projektu (lewy panel)
2. Kliknij zakładkę: **"Variables"**
3. Kliknij: **"+ New Variable"**

**Dodaj PO KOLEI (każda osobno):**

```
NODE_ENV
production

PORT
3500

USE_CLOUDINARY
true

CLOUDINARY_CLOUD_NAME
dnn1s4f30

CLOUDINARY_API_KEY
695843691868791

CLOUDINARY_API_SECRET
gHde-cH8NDphM1z9iYH8FHobPIg
```

**Po dodaniu KAŻDEJ zmiennej kliknij gdzie indziej żeby zapisało!**

---

## 📋 **KROK 4: Volume dla Bazy Danych**

**W tym samym projekcie:**

1. Kliknij: **"+ New"** (prawy górny)
2. Wybierz: **"Volume"**
3. Wypełnij:
```
Name: data-volume
Mount Path: /app/data
```
4. Kliknij: **"Add"**

**Railway automatycznie podłączy volume!**

---

## 📋 **KROK 5: Settings (opcjonalne - sprawdź)**

1. Kliknij: **"Settings"**
2. Sprawdź:
   - **Build Command:** powinno być auto-detected
   - **Start Command:** powinno być `npm start`
3. Jeśli nie ma - dodaj:
   ```
   Build Command: npm install
   Start Command: npm start
   ```

---

## 📋 **KROK 6: Generate Domain**

1. W zakładce **"Settings"**
2. Scroll do **"Domains"**
3. Kliknij: **"Generate Domain"**
4. **SKOPIUJ URL!**

Będzie coś jak:
```
https://promeritum-komunikator-v2-production.up.railway.app
```

**TO JEST TWÓJ URL!** 🎉

---

## 📋 **KROK 7: Czekaj na Deployment**

**W zakładce "Deployments":**

- 🟡 Building... (2-3 min)
- 🟢 Active ✅

**Logi pokażą czy wszystko OK!**

---

## 📋 **KROK 8: TEST!**

1. **Otwórz URL** (z kroku 6)
2. **Zaloguj się**
3. **Testuj funkcje**

---

## 🔧 **TROUBLESHOOTING:**

### **Problem: Deployment failed**
```
Sprawdź logi w zakładce "Deployments"
Szukaj czerwonych błędów
```

### **Problem: Application error**
```
Sprawdź czy wszystkie env vars są dodane
Sprawdź czy volume jest mounted
```

### **Problem: Database error**
```
Sprawdź czy volume jest w /app/data
Restart deployment
```

---

## 💰 **KOSZTY:**

```
Trial: $5 (masz ~$4.90)
Starczy na: ~1 miesiąc testów
Potem: $5/mies + $1 za volume
```

---

## 📊 **PODSUMOWANIE:**

| Krok | Czas | Status |
|------|------|--------|
| 1. Login | 1 min | ⏳ |
| 2. Deploy | 3 min | ⏳ |
| 3. Variables | 2 min | ⏳ |
| 4. Volume | 1 min | ⏳ |
| 5. Settings | 1 min | ⏳ |
| 6. Domain | 30 sek | ⏳ |
| 7. Wait | 3 min | ⏳ |
| 8. Test | 2 min | ⏳ |
| **RAZEM** | **~15 min** | |

---

## ✅ **MASZ TO!**

**Idź krok po kroku, zrzuty ekranu jak coś nie działa!**

**Powodzenia!** 🚀
