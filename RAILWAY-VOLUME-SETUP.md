# Konfiguracja Railway Volume dla plików

## Problem
Railway używa **ephemeral storage** - pliki znikają po każdym restarcie/deploy.

## Rozwiązanie
Railway Volume - trwałe przechowywanie plików za $0.25/GB/miesiąc.

---

## Krok 1: Utwórz Volume w Railway

1. Otwórz projekt w Railway Dashboard: https://railway.app/dashboard
2. Kliknij na swój serwis (web-production-7504)
3. Przejdź do zakładki **"Volumes"** (lub "Settings" → "Volumes")
4. Kliknij **"+ New Volume"**
5. Ustaw:
   - **Name**: `uploads-data`
   - **Mount Path**: `/app/data`
   - **Size**: 1GB (możesz zwiększyć później)
6. Kliknij **"Create Volume"**

---

## Krok 2: Redeploy

Po utworzeniu Volume, Railway automatycznie zrestartuje serwis.
Jeśli nie - kliknij **"Redeploy"** w zakładce "Deployments".

---

## Krok 3: Weryfikacja

Po deploy sprawdź logi serwera. Powinieneś zobaczyć:
```
📁 Upload config:
   - isProduction: true
   - UPLOADS_BASE: /app/data/uploads
```

---

## Struktura folderów na Volume

```
/app/data/
├── komunikator.db          # Baza danych SQLite
└── uploads/
    ├── documents/          # Dokumenty ogólne
    ├── case-documents/     # Dokumenty spraw
    ├── attachments/        # Załączniki
    ├── client-files/       # Pliki klientów
    ├── comment-attachments/# Załączniki komentarzy
    ├── contracts/          # Umowy
    ├── cv/                 # CV pracowników
    ├── employee-documents/ # Dokumenty HR
    ├── task-attachments/   # Załączniki zadań
    ├── invoices/           # Faktury
    └── payment-receipts/   # Potwierdzenia płatności
```

---

## Koszty

- **1 GB**: $0.25/miesiąc
- **5 GB**: $1.25/miesiąc
- **10 GB**: $2.50/miesiąc

Volume automatycznie się powiększa gdy potrzebujesz więcej miejsca.

---

## Backup

Railway Volume NIE ma automatycznego backupu!
Zalecam:
1. Regularne eksportowanie bazy danych
2. Backup ważnych dokumentów do zewnętrznego storage (np. Google Drive, S3)

---

## Troubleshooting

### Pliki nie zapisują się
Sprawdź logi:
```
📁 Upload dir: /app/data/uploads/case-documents | isProduction: true
```

Jeśli widzisz `isProduction: false` - sprawdź zmienne środowiskowe:
- `RAILWAY_ENVIRONMENT=production` lub
- `NODE_ENV=production`

### Volume nie jest zamontowany
W Railway Dashboard sprawdź czy Volume ma status "Mounted".
Jeśli nie - usuń i utwórz ponownie.

---

## Gotowe!

Po wykonaniu tych kroków, wszystkie uploadowane pliki będą trwale przechowywane na Railway Volume.
