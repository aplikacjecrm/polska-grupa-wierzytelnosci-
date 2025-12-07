# 🔒 System Backupów - Instrukcja

## 🎯 Szybkie komendy

### Utworzenie backupu:
```bash
npm run backup
```
lub
```bash
node create-backup.js
```

### Lista backupów:
```bash
npm run list-backups
```

### Przywrócenie backupu:
```bash
npm run restore backup_2025-11-23_14-41-47
```
lub
```bash
node restore-backup.js backup_2025-11-23_14-41-47
```

## 📦 Co zawiera backup?

✅ **Frontend** - wszystkie pliki HTML, CSS, JavaScript  
✅ **Backend** - routes, middleware, utils  
✅ **Konfiguracja** - package.json, server.js, .env  
✅ **Baza danych** - wszystkie pliki .db  

❌ **Nie zawiera** - node_modules (trzeba pobrać przez `npm install`)

## 🗂️ Lokalizacja backupów

Backupy są zapisywane w:
```
kancelaria/backups/backup_YYYY-MM-DD_HH-MM-SS/
```

## ⚠️ WAŻNE!

1. **Przed dużymi zmianami** zawsze rób backup!
2. **Przywracanie nadpisuje** obecną aplikację!
3. **Po przywróceniu** uruchom ponownie serwer
4. **Regularnie usuwaj** stare backupy (zajmują ~440 MB każdy)

## 📊 Ostatni backup

**Data:** 2025-11-23 14:41  
**Status:** ✅ Aplikacja w pełni działająca  
**Funkcje:**
- ✅ Dokumenty w sprawie (dodawanie, wyświetlanie)
- ✅ Świadkowie (dodawanie, edycja, szczegóły)
- ✅ Zadania (dodawanie, wyświetlanie)
- ✅ CRM - pełna funkcjonalność
- ✅ Rozbudowany formularz świadków (19 opcji relacji, szczegółowy adres)

**Rozmiar:** 440.94 MB  
**Plików:** 913  

## 🆘 W razie problemów

Jeśli coś się zepsuje:

1. Zatrzymaj serwer
2. Uruchom: `npm run list-backups`
3. Wybierz najnowszy działający backup
4. Uruchom: `npm run restore [nazwa-backupu]`
5. Potwierdź operację wpisując: `tak`
6. Uruchom ponownie serwer

## 📝 Notatki

Backup jest automatycznie dokumentowany w pliku `backup-info.json` który zawiera:
- Datę utworzenia
- Liczbę plików
- Informacje o statusie aplikacji
