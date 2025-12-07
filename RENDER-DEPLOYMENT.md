# 🚀 RENDER.COM - INSTRUKCJA WDROŻENIA

## ✅ **PRZYGOTOWANIE - ZROBIONE!**

- ✅ render.yaml utworzony
- ✅ Kod gotowy
- ✅ Cloudinary skonfigurowany

---

## 📋 **INSTRUKCJA KROK PO KROKU:**

### **1. Załóż konto Render**

**Link:** https://render.com/

1. Kliknij **"Get Started"**
2. Wybierz **"Sign Up with GitHub"** (łatwiej)
   LUB email
3. Potwierdź email

**WAŻNE:** Nie trzeba karty kredytowej! ✅

---

### **2. Utwórz nowe GitHub repo (nowe, czyste)**

**W terminalu (już jesteś w projekcie):**

```bash
# Dodaj wszystko do Git
git add -A
git commit -m "Initial commit - Pro Meritum Komunikator"

# Utwórz nowe repo na GitHub:
# Wejdź na: https://github.com/new
# Nazwa: promeritum-komunikator-v2
# Private
# Bez README
# Create repository

# Połącz z GitHub (WKLEJ SWÓJ URL!):
git remote add origin https://github.com/TWOJ_USERNAME/promeritum-komunikator-v2.git
git branch -M main
git push -u origin main
```

---

### **3. Deploy na Render**

**W Render Dashboard:**

1. **Kliknij:** "New +"
2. **Wybierz:** "Web Service"
3. **Connect GitHub** (jeśli nie połączone)
4. **Wybierz repo:** promeritum-komunikator-v2
5. **Kliknij:** "Connect"

**Ustawienia:**
```
Name: pro-meritum-komunikator
Region: Frankfurt (Europe)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

6. **Add Disk:**
   - Name: data-disk
   - Mount Path: /opt/render/project/src/data
   - Size: 1 GB

7. **Environment Variables:**
```
NODE_ENV = production
PORT = 3500
USE_CLOUDINARY = true
CLOUDINARY_CLOUD_NAME = dnn1s4f30
CLOUDINARY_API_KEY = 695843691868791
CLOUDINARY_API_SECRET = gHde-cH8NDphM1z9iYH8FHobPIg
JWT_SECRET = (auto-generated lub swój)
```

8. **Kliknij:** "Create Web Service"

---

### **4. Czekaj na deployment (~5-10 min)**

Render:
- Instaluje dependencies
- Uruchamia server
- Pokazuje logi

**Status:**
- 🟡 Building...
- 🟢 Live! ✅

---

### **5. Test aplikacji**

**URL:** https://pro-meritum-komunikator.onrender.com

1. Otwórz URL
2. Poczekaj ~30 sek (pierwsze uruchomienie)
3. Zaloguj się
4. Testuj funkcje

---

## 🔧 **TROUBLESHOOTING:**

### **Problem: 502 Bad Gateway**
```
Rozwiązanie: Poczekaj 1-2 minuty (cold start)
```

### **Problem: Database error**
```
Render console → Restart service
LUB sprawdź czy disk jest mounted
```

### **Problem: Files not saving**
```
Sprawdź Cloudinary env vars
Sprawdź czy USE_CLOUDINARY=true
```

---

## 📊 **MONITOROWANIE:**

### **Logi:**
```
Render Dashboard → Your Service → Logs
```

### **Restart:**
```
Dashboard → Settings → Manual Deploy → Clear build cache & deploy
```

### **Disk usage:**
```
Dashboard → Disk → View usage
```

---

## 💰 **KOSZTY:**

```
✅ Free tier:
   - 750h/month (wystarczy!)
   - 1 GB disk
   - Persistent storage
   - Sleep po 15 min
   
💵 Paid tier (jeśli kiedyś):
   - $7/month
   - Bez sleep
   - 10 GB disk
```

---

## 🎯 **NASTĘPNE KROKI:**

1. ✅ Deploy na Render
2. ✅ Test wszystkich funkcji
3. ✅ Prześlij URL pracownikowi
4. ✅ Monitoruj logi

---

## 📝 **TWÓJ URL (po deployment):**

```
https://pro-meritum-komunikator.onrender.com
```

**Zapisz go!**

---

## ⚠️ **WAŻNE:**

- **Sleep:** Po 15 min bezczynności app usypia
- **Wake up:** Pierwsze otwarcie = 30-60 sek
- **Potem:** Szybko działa
- **Disk:** Pliki nie giną (persistent!)
- **Cloudinary:** Załączniki w chmurze (nie na dysku)

---

## 🔄 **UPDATE APLIKACJI:**

```bash
# Lokalnie zrób zmiany
git add -A
git commit -m "Update: opis zmian"
git push origin main

# Render auto-deployuje! (~3-5 min)
```

---

**Gotowe! Masz instrukcję!** 🚀

**Teraz idź krok po kroku:**
1. Załóż konto Render
2. Utwórz GitHub repo
3. Push kod
4. Deploy na Render

**Powodzenia!** 🎉
