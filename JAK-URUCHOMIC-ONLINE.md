# 🌐 JAK URUCHOMIĆ APLIKACJĘ ONLINE - INSTRUKCJA

**Data:** 21 grudnia 2025

---

## ✅ **AKTUALNY STATUS:**

### **Masz 2 platformy:**

1. **Render.com** ⭐ (REKOMENDOWANE)
   - URL: `https://promeritum-komunikator-v2.onrender.com`
   - Status: Skonfigurowany (render.yaml gotowy)
   - Baza: Persistent disk (1GB)

2. **Railway.app** 
   - Status: Skonfigurowany (railway.json gotowy)
   - Baza: Volume storage

---

## 🗄️ **TWOJA BAZA DANYCH - SPRAWDZONE:**

```
✅ Lokalizacja: komunikator-app/data/komunikator.db
✅ Użytkownicy: 9 kont
✅ Gotowa do wrzucenia na produkcję
```

### **Lista użytkowników:**
```
1. admin@pro-meritum.pl (Admin) - ADMIN
2. t.zygmund@pro-meritum.pl (Tomasz Zygmund) - LAWYER
3. pgw@pro-meritum.pl (PGW) - CLIENT_MANAGER
4. g.wiatrowski@pro-meritum.pl (Grzegorz Wiatrowski) - CASE_MANAGER
5. recepcja@pro-meritum.pl (Recepcja) - RECEPTION
6. pm@pro-meritum.pl (Pro Meritum) - CLIENT_MANAGER
7. hr@pro-meritum.pl (HR) - HR
8. finanse@pro-meritum.pl (Finanse) - FINANCE
9. payroll@pro-meritum.pl (Payroll) - PAYROLL
```

---

## 🚀 **OPCJA 1: RENDER.COM (REKOMENDOWANE)**

### **Krok 1: Zaloguj się na Render**
```
URL: https://dashboard.render.com/
Login: Twój email/GitHub
```

### **Krok 2: Sprawdź czy masz projekt**
```
Dashboard → Services → Szukaj "pro-meritum" lub "promeritum"
```

### **Krok 3: Jeśli projekt ISTNIEJE:**

**A. Sprawdź URL:**
```
Dashboard → Twój Service → URL widoczny na górze
Przykład: https://promeritum-komunikator-v2.onrender.com
```

**B. Wrzuć prawidłową bazę danych:**

**METODA 1 - Przez SSH/Shell:**
```bash
# W Render Dashboard:
1. Otwórz swój service
2. Kliknij "Shell" (terminal ikona)
3. Wejdź do katalogu:
   cd /opt/render/project/src/data

4. Upload bazy (będziesz musiał użyć SCP lub Render CLI)
```

**METODA 2 - Przez Git (ŁATWIEJSZA):**
```bash
# Lokalnie w projekcie:

# 1. Upewnij się że masz aktualną bazę
ls -lh data/komunikator.db

# 2. Commit i push
git add data/komunikator.db
git commit -m "Update: Dodanie prawidłowej bazy z 9 użytkownikami"
git push origin main

# 3. Render auto-deployuje! (3-5 min)
# Dashboard → Logs (obserwuj deployment)
```

**C. Zrestartuj service:**
```
Dashboard → Settings → Manual Deploy → "Clear build cache & deploy"
```

**D. Sprawdź czy działa:**
```
1. Otwórz URL: https://promeritum-komunikator-v2.onrender.com
2. Poczekaj 30-60 sek (cold start)
3. Zaloguj jako: admin@pro-meritum.pl
4. Hasło: (twoje hasło admina)
5. Sprawdź czy są użytkownicy (Panel użytkowników)
6. Sprawdź sprawy (Panel spraw)
```

### **Krok 4: Jeśli projekt NIE ISTNIEJE - utwórz nowy:**

```bash
# 1. Zaloguj się na Render
# 2. Kliknij "New +" → "Web Service"
# 3. Connect GitHub repo
# 4. Ustawienia:

Name: promeritum-komunikator-v2
Region: Frankfurt (Europe)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free

# 5. Add Disk:
Name: data-disk
Mount Path: /opt/render/project/src/data
Size: 1 GB

# 6. Environment Variables:
NODE_ENV = production
PORT = 3500
JWT_SECRET = (auto-generate)
USE_CLOUDINARY = true
CLOUDINARY_CLOUD_NAME = dnn1s4f30
CLOUDINARY_API_KEY = 695843691868791
CLOUDINARY_API_SECRET = gHde-cH8NDphM1z9iYH8FHobPIg

# 7. Create Web Service
# 8. Wait 5-10 min
```

---

## 🚂 **OPCJA 2: RAILWAY.APP**

### **Krok 1: Zaloguj się na Railway**
```
URL: https://railway.app/dashboard
Login: GitHub
```

### **Krok 2: Znajdź projekt**
```
Dashboard → Projects → Szukaj "promeritum" lub "komunikator"
```

### **Krok 3: Deploy/Update:**

**A. Sprawdź status:**
```
Project → Service → Deployments
Sprawdź czy ostatni deployment był successful
```

**B. Wrzuć bazę:**
```bash
# Railway używa volumów - musisz:

1. Dashboard → Service → Variables
2. Sprawdź czy jest zmienna: DATABASE_PATH

3. W projekcie lokalnie:
   git add data/komunikator.db
   git commit -m "Update database"
   git push origin main

4. Railway auto-deployuje
```

**C. Restart:**
```
Dashboard → Service → ... (menu) → Restart
```

---

## 🔍 **JAK SPRAWDZIĆ CZY BAZA JEST OK NA PRODUKCJI:**

### **Test przez API:**
```bash
# Sprawdź użytkowników:
curl https://TWOJ-URL.onrender.com/api/users

# Albo otwórz w przeglądarce:
https://TWOJ-URL.onrender.com/api/users
```

### **Test przez frontend:**
```
1. Otwórz aplikację
2. Zaloguj jako admin
3. Idź do: Panel użytkowników
4. Sprawdź czy widzisz 9 użytkowników
5. Idź do: Panel spraw
6. Sprawdź czy jest sprawa Tomasz Stefanczyk
```

---

## 🎯 **SZYBKI START - POLECANE KROKI:**

```bash
# KROK 1: Sprawdź lokalną bazę
cd C:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
node check-komunikator-db.js

# KROK 2: Commit i push
git add data/komunikator.db
git commit -m "Update: Baza z 9 użytkownikami i sprawami"
git push origin main

# KROK 3: Otwórz Render Dashboard
# https://dashboard.render.com/

# KROK 4: Znajdź swój service
# Kliknij na niego

# KROK 5: Obserwuj deployment w Logs
# Poczekaj 3-5 min

# KROK 6: Otwórz URL
# https://promeritum-komunikator-v2.onrender.com

# KROK 7: Zaloguj i sprawdź
# admin@pro-meritum.pl
```

---

## ⚠️ **TROUBLESHOOTING:**

### **Problem: Timeout przy otwieraniu**
```
Rozwiązanie: 
- Poczekaj 60 sekund (cold start na free tier)
- Odśwież stronę
```

### **Problem: Brak użytkowników po zalogowaniu**
```
Rozwiązanie:
- Sprawdź czy baza została wrzucona
- Render Dashboard → Shell → ls -la data/
- Powinna być komunikator.db
```

### **Problem: Błąd 502/503**
```
Rozwiązanie:
- Render Dashboard → Logs
- Sprawdź co się crashuje
- Restart service
```

### **Problem: Nie mogę się zalogować**
```
Rozwiązanie:
- Sprawdź hasło admina
- Jeśli nie pamiętasz - zresetuj lokalnie:
  node reset-admin-password.js
  git add data/komunikator.db
  git push
```

---

## 🔐 **DANE LOGOWANIA (PRZYPOMNIENIE):**

```
Email: admin@pro-meritum.pl
Hasło: [Twoje hasło - ustalone wcześniej]
```

**Jeśli zapomniałeś hasła - napisz, zresetuję!**

---

## 📊 **MONITORING:**

### **Render.com:**
```
Dashboard → Service → Metrics
- CPU usage
- Memory usage
- Response times
- Error rates
```

### **Logi:**
```
Dashboard → Service → Logs
- Real-time streaming
- Filter by error/warning
```

---

## 💰 **KOSZTY:**

```
✅ Render Free Tier:
   - 750h/month (więcej niż potrzebujesz)
   - 1 GB persistent storage
   - Sleep po 15 min bezczynności
   - Wake up = 30-60 sek
   
✅ Railway Free Tier:
   - $5 credit/month
   - Sleep po 30 min
   - Wake up = 10-30 sek
```

---

## 🎉 **GOTOWE!**

**Twoja aplikacja powinna być online pod:**
- Render: `https://promeritum-komunikator-v2.onrender.com`
- Railway: `https://[twój-project].railway.app`

**Sprawdź URL w dashboard swojej platformy!**

---

**Potrzebujesz pomocy?**
- Napisz jaki błąd widzisz
- Prześlij screenshot z Render/Railway Dashboard
- Sprawdzimy razem!
