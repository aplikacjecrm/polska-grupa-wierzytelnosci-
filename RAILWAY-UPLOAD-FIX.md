# 🔴 RAILWAY - Problem z uploadami

## ❌ **PRAWDZIWY PROBLEM:**

Railway **nie ma plików z folderu `uploads/`**!

### **Dlaczego:**
```
1. Użytkownik uploaduje plik → zapisuje się w uploads/
2. Railway deployuje nową wersję → filesystem RESET
3. Wszystkie pliki z uploads/ ZNIKAJĄ ❌
4. Backend próbuje pobrać plik → 404 / Failed to fetch
```

---

## 🎯 **OBJAWY:**

```javascript
Dokument ID: 34
Nazwa: "Zgłoś się do PGW! (1).jpg"
file_path: "/app/data/uploads/case-documents/..."

❌ Failed to fetch - plik nie istnieje!
```

**Backend działa ✅, ale pliki fizyczne zniknęły ❌**

---

## ✅ **ROZWIĄZANIE 1: Railway Volumes (NAJLEPSZE)**

### **Krok 1: Utwórz Volume w Railway**

1. Otwórz Railway Dashboard
2. Wybierz projekt "promeritum-komunikator"
3. Zakładka **"Settings"**
4. Sekcja **"Volumes"**
5. Kliknij **"New Volume"**

### **Krok 2: Skonfiguruj Volume**

```
Mount Path: /app/data/uploads
Name: uploads-storage
```

### **Krok 3: Zrestartuj aplikację**

Railway automatycznie zrestartuje się z Volume.

---

## ✅ **ROZWIĄZANIE 2: Zmienne środowiskowe (TYMCZASOWE)**

Upewnij się że Railway ma:

```env
DB_PATH=/app/data/komunikator.db
UPLOAD_DIR=/app/data/uploads
```

---

## ✅ **ROZWIĄZANIE 3: Baza danych (OPCJONALNE)**

Railway potrzebuje też persystentnej bazy!

### **Volume dla bazy:**

```
Mount Path: /app/data
Name: database-storage
```

To zapewni że:
- ✅ Baza danych nie ginie
- ✅ Pliki uploadów nie giną

---

## 🔧 **RAILWAY.JSON - Dodaj volume mount:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node backend/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📊 **CO SPRAWDZIĆ:**

### **1. Czy Volume istnieje:**
```bash
# W Railway logs:
ls -la /app/data/uploads/
```

### **2. Czy pliki są zapisywane:**
```bash
# Po uploaderze:
ls -la /app/data/uploads/case-documents/
```

### **3. Czy baza jest persystentna:**
```bash
ls -la /app/data/komunikator.db
```

---

## 🚀 **INSTRUKCJA KROK PO KROKU:**

### **W Railway Dashboard:**

1. **Settings** → **Volumes** → **New Volume**
2. Utwórz 2 volumes:
   
   **Volume 1: Uploads**
   ```
   Name: uploads-storage
   Mount Path: /app/data/uploads
   Size: 1GB
   ```
   
   **Volume 2: Database**
   ```
   Name: database-storage  
   Mount Path: /app/data
   Size: 500MB
   ```

3. **Deploy** → **Redeploy**

4. ✅ Gotowe!

---

## 🎯 **BEZ VOLUME - CO SIĘ DZIEJE:**

```
User uploads file → /app/data/uploads/file.jpg
Railway deploys → RESET filesystem
User tries to download → ❌ File not found!
```

**VOLUME = Pliki nie giną przy deployment!** ✅

---

## 💡 **ALTERNATYWA: Cloud Storage**

Jeśli Railway Volume nie działa, można użyć:
- **AWS S3**
- **Cloudinary**
- **Google Cloud Storage**

Ale to wymaga przerobienia kodu uploadu.

---

## ✅ **REKOMENDACJA:**

**Najpierw spróbuj Railway Volumes - to najprostsze rozwiązanie!**

1. Utwórz volume `/app/data`
2. Redeploy aplikacji
3. Sprawdź czy pliki nie giną

---

**Po dodaniu Volume wszystko będzie działać jak lokalnie!** 🎉
