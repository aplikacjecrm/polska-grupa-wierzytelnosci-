# 🏆 PRO MERITUM - PROFESJONALNY MASTER PLAN ROZBUDOWY

## 📋 SPIS TREŚCI
1. [Moduł Finansów i Kosztów](#moduł-finansów-i-kosztów)
2. [System Zarządzania Kontami](#system-zarządzania-kontami)
3. [Dashboard Admina - Ultimate](#dashboard-admina---ultimate)
4. [System Raportowania](#system-raportowania)
5. [Moduł Fakturowania](#moduł-fakturowania)
6. [System Powiadomień](#system-powiadomień)
7. [Integracje Zewnętrzne](#integracje-zewnętrzne)
8. [Architektura i Bezpieczeństwo](#architektura-i-bezpieczeństwo)

---

## 💰 MODUŁ FINANSÓW I KOSZTÓW

### Tabele bazy danych (8 tabel)

```sql
-- 1. KOSZTY GŁÓWNE
case_costs (id, cost_code, case_id, title, category, amount, currency, vat_rate, 
  payment_status, invoice_number, paid_by, reimbursable, is_recurring, 
  budget_category, approved_by, attachments, created_by, created_at)

-- 2. KATEGORIE KOSZTÓW
cost_categories (id, name, parent_id, icon, color, is_billable, default_vat_rate)

-- 3. PŁATNOŚCI
cost_payments (id, cost_id, amount, payment_date, method, reference, proof_path)

-- 4. BUDŻETY
case_budgets (id, case_id, total_budget, allocated, spent, remaining, period)

-- 5. FAKTURY
invoices (id, invoice_number, case_id, client_id, issue_date, due_date, 
  total_amount, status, pdf_path, sent_at, paid_at)

-- 6. POZYCJE FAKTUR
invoice_items (id, invoice_id, description, quantity, unit_price, vat_rate, total)

-- 7. ZWROTY KOSZTÓW
cost_reimbursements (id, cost_id, amount, status, requested_at, approved_at, paid_at)

-- 8. EKSPORTY FINANSOWE
financial_exports (id, export_type, period, file_path, generated_by, generated_at)
```

### Backend API (35+ endpointów)

**Koszty:**
- `GET/POST/PUT/DELETE /api/costs` - CRUD kosztów
- `GET /api/costs/case/:id/summary` - Podsumowanie finansowe
- `POST /api/costs/:id/payment` - Zarejestruj płatność
- `POST /api/costs/recurring` - Koszty cykliczne
- `GET /api/costs/overdue` - Przeterminowane
- `POST /api/costs/:id/split` - Podziel koszt między sprawy

**Budżety:**
- `GET/POST/PUT /api/budgets` - Zarządzanie budżetami
- `GET /api/budgets/:id/analysis` - Analiza wykonania

**Raporty:**
- `GET /api/costs/report/monthly` - Raport miesięczny
- `GET /api/costs/report/client/:id` - Dla klienta
- `GET /api/costs/export/excel` - Export Excel
- `GET /api/costs/export/accounting` - Dla księgowości

### Frontend - Funkcje kluczowe

1. **Dashboard finansowy** - statystyki, wykresy, budżet
2. **Lista kosztów** - filtrowanie, sortowanie, grupowanie
3. **Formularz kosztu** - walidacja, autouzupełnianie, załączniki
4. **Generator faktur** - PDF z logo, wysyłka email
5. **Raporty** - miesięczne, roczne, dla klienta, księgowość
6. **Budżetowanie** - planowanie, tracking, alerty
7. **Płatności** - historia, metody, potwierdzenia
8. **Kategorie** - konfigurowalne drzewo kategorii

---

## 👥 SYSTEM ZARZĄDZANIA KONTAMI

### Rozszerzona tabela users + 8 tabel powiązanych

```sql
-- USERS (rozszerzone)
ALTER TABLE users ADD (
  user_role, initials, position, department, phone, mobile,
  photo_url, bio, skills, certifications, hired_date, 
  contract_type, hourly_rate, monthly_salary,
  is_active, last_login, login_count, preferences,
  two_factor_enabled, signature_path
)

-- NOWE TABELE:
roles (id, name, display_name, permissions, is_system)
permissions (id, name, category, description)
user_roles (user_id, role_id, assigned_by, expires_at)
teams (id, name, description, team_lead_id, department)
team_members (team_id, user_id, role_in_team)
work_schedules (user_id, day_of_week, start_time, end_time)
absences (user_id, type, start_date, end_date, approved_by, status)
login_history (user_id, login_time, ip, user_agent, location)
user_audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
```

### Backend API (40+ endpointów)

**Użytkownicy:**
- `GET/POST/PUT/DELETE /api/users` - CRUD
- `POST /api/users/:id/deactivate` - Dezaktywacja
- `POST /api/users/:id/reset-password` - Reset hasła
- `GET /api/users/:id/statistics` - Statystyki osobiste
- `POST /api/users/bulk-import` - Import CSV

**Role i uprawnienia:**
- `GET/POST/PUT/DELETE /api/roles` - Zarządzanie rolami
- `GET /api/permissions` - Lista uprawnień
- `POST /api/users/:id/roles` - Przypisz rolę
- `GET /api/users/:id/permissions` - Sprawdź uprawnienia

**Zespoły:**
- `GET/POST/PUT/DELETE /api/teams` - Zarządzanie
- `POST /api/teams/:id/members` - Dodaj członka
- `GET /api/teams/:id/cases` - Sprawy zespołu

**Audyt:**
- `GET /api/audit/user/:id` - Historia akcji
- `GET /api/login-history/:id` - Historia logowań
- `GET /api/security/active-sessions` - Aktywne sesje

### Frontend - Panel zarządzania

**Główne widoki:**
1. **Lista użytkowników** - tabelka z filtrowaniem, wyszukiwaniem, eksportem
2. **Profil użytkownika** - szczegóły, edycja, statystyki, historia
3. **Kreator konta** - wizard 3-krokowy (dane, rola, potwierdzenie)
4. **Zarządzanie rolami** - definiowanie ról i uprawnień
5. **Zespoły** - tworzenie, przypisywanie, statystyki
6. **Grafik pracy** - harmonogram, nieobecności, urlopy
7. **Audyt** - logi akcji, historia logowań, bezpieczeństwo

**Funkcje zaawansowane:**
- 2FA (dwuskładnikowe uwierzytelnianie)
- SSO (Single Sign-On) - opcjonalnie
- Import/eksport użytkowników CSV
- Masowe operacje (zmiana roli, dezaktywacja)
- Automatyczne generowanie haseł
- Email powitalny z instrukcjami
- Zarządzanie sesjami (wymuszenie wylogowania)

---

## 📊 DASHBOARD ADMINA - ULTIMATE

### Statystyki (20+ wskaźników)

**Użytkownicy:**
- Łącznie, aktywni dziś, według ról, nowi w miesiącu
- Top 5 najbardziej aktywnych
- Grafik obecności

**Klienci:**
- Rekordy w bazie, aktywni, nowi, status
- Top klienci wg liczby spraw
- Mapa geograficzna klientów

**Sprawy:**
- Łącznie, według statusu, typu, priorytetu
- Średni czas trwania, wskaźnik wygranych
- Terminarz najbliższych wydarzeń

**Finanse:**
- Przychody miesiąc/rok, koszty, zysk
- Zaległe płatności, należności
- Top 5 najdroższych spraw

**Dokumenty i wydarzenia:**
- Liczba dokumentów, rozmiar, typy
- Wydarzenia dziś/tydzień/miesiąc
- Przeterminowane zadania

### Wykresy i wizualizacje (8 typów)

1. **Wykres słupkowy** - sprawy wg statusu
2. **Wykres kołowy** - koszty wg kategorii
3. **Wykres liniowy** - przychody w czasie
4. **Heatmapa** - aktywność użytkowników
5. **Wykres Gantta** - harmonogram spraw
6. **Mapa Polski** - klienci wg województw
7. **Funnel** - lejek sprzedażowy (nowi klienci → sprawy)
8. **Sparklines** - mini wykresy przy statystykach

### Alerty i powiadomienia

- ⚠️ Sprawy bez przypisanego mecenasa
- 🔴 Przeterminowane terminy
- 💰 Zaległe płatności
- 📄 Dokumenty do podpisu
- 🔔 Nowe wiadomości/zgłoszenia
- ⏰ Wydarzenia w najbliższych 24h
- 📊 Przekroczenie budżetu sprawy
- 👤 Nieaktywne konta (30+ dni)

### Akcje szybkie

```
┌─────────────────────────────────────┐
│ ⚡ SZYBKIE AKCJE                    │
├─────────────────────────────────────┤
│ [➕ Nowa sprawa]                     │
│ [👤 Dodaj klienta]                  │
│ [👔 Utwórz konto mecenasa]          │
│ [📅 Dodaj wydarzenie]               │
│ [💰 Zarejestruj koszt]              │
│ [📄 Wygeneruj raport]               │
│ [📧 Wyślij powiadomienie]           │
│ [🔧 Ustawienia systemu]             │
└─────────────────────────────────────┘
```

---

## 📈 SYSTEM RAPORTOWANIA

### Typy raportów (15 rodzajów)

**Finansowe:**
1. Raport przychodów i kosztów (miesięczny/roczny)
2. Zestawienie faktur (wystawionych/zapłaconych)
3. Raport budżetów spraw
4. Analiza rentowności klientów
5. JPK dla urzędu skarbowego

**Operacyjne:**
6. Raport spraw (według statusu, typu, mecenasa)
7. Raport wydarzeń (terminy, rozprawy)
8. Raport czasu pracy (godziny/sprawa)
9. Efektywność mecenasów
10. Wskaźniki KPI kancelarii

**Dla klienta:**
11. Wyciąg ze sprawy
12. Zestawienie kosztów
13. Kalendarz wydarzeń
14. Status dokumentów

**Administracyjne:**
15. Raport aktywności użytkowników
16. Raport bezpieczeństwa (logi, próby logowania)
17. Raport wykorzystania systemu

### Formaty eksportu
- PDF (z logo, nagłówkiem, stopką)
- Excel (XLSX z formatowaniem)
- CSV (dla systemów zewnętrznych)
- JSON (API)
- XML (JPK)

### Harmonogram raportów
- Automatyczne generowanie codziennie/tygodniowo/miesięcznie
- Email z raportem do admina
- Archiwizacja raportów
- Dashboard raportów historycznych

---

## 🧾 MODUŁ FAKTUROWANIA

### Funkcje

1. **Generator faktur VAT**
   - Szablon zgodny z prawem
   - Automatyczna numeracja
   - Logo i dane kancelarii
   - Podpis cyfrowy

2. **Typy dokumentów**
   - Faktura VAT
   - Faktura Pro Forma
   - Nota korygująca
   - Rachunek
   - Paragon fiskalny (integracja z drukarką)

3. **Wysyłka**
   - Email do klienta (automatyczna/ręczna)
   - SMS z linkiem
   - Portal klienta
   - Druk PDF

4. **Śledzenie**
   - Status: wystawiona/wysłana/zapłacona/przeterminowana
   - Przypomnienia o płatności
   - Historia korekt

5. **Integracje**
   - Księgowość (eksport)
   - Bankowość (potwierdzenia przelewów)
   - KSeF (Krajowy System e-Faktur) - opcjonalnie

---

## 🔔 SYSTEM POWIADOMIEŃ

### Kanały powiadomień
- 📧 Email
- 💬 Wewnętrzne (w aplikacji)
- 📱 SMS (opcjonalnie)
- 🔔 Push notifications (PWA)
- 🖥️ Desktop notifications

### Typy powiadomień

**Dla mecenasów:**
- Nowa sprawa przypisana
- Zbliżający się termin rozprawy
- Nowy dokument w sprawie
- Komentarz od klienta
- Zatwierdzenie kosztu wymagane

**Dla opiekunów:**
- Zadanie do wykonania
- Termin do przypomnienia
- Dokument do przesłania

**Dla klientów:**
- Zmiana statusu sprawy
- Nowe wydarzenie w kalendarzu
- Dokument do pobrania
- Przypomnienie o płatności
- Wiadomość od mecenasa

**Dla admina:**
- Nowy użytkownik
- Błąd systemu
- Przekroczenie budżetu
- Raport dzienny

### Ustawienia użytkownika
- Wybór kanałów dla każdego typu
- Cisza nocna (22:00-8:00)
- Grupowanie powiadomień
- Tryb "nie przeszkadzać"

---

## 🔌 INTEGRACJE ZEWNĘTRZNE

### 1. Systemy księgowe
- Comarch Optima
- Symfonia
- enova
- Wapro
- Eksport CSV uniwersalny

### 2. Systemy bankowe
- API banków (mBank, ING, PKO)
- Import wyciągów
- Automatyczne dopasowywanie płatności

### 3. Urząd Skarbowy
- e-Deklaracje
- JPK
- KSeF (e-Faktury)

### 4. Sądy
- e-Sąd (integracja z systemem sądowym)
- Portal Informacyjny
- Scraping wyroków

### 5. Poczta i komunikacja
- Gmail API
- Microsoft Outlook
- SMS API (SMSApi.pl)
- WhatsApp Business

### 6. Chmura
- Google Drive
- OneDrive
- Dropbox
- Własne S3

### 7. Podpis elektroniczny
- mObywatel
- Autenti
- Certum

---

## 🔒 ARCHITEKTURA I BEZPIECZEŃSTWO

### Zabezpieczenia

**Autentykacja:**
- JWT tokens (refresh + access)
- 2FA (TOTP, SMS)
- SSO (SAML, OAuth2)
- Sesje z timeoutem
- IP whitelisting

**Autoryzacja:**
- RBAC (Role-Based Access Control)
- Granularne uprawnienia
- Hierarchia ról
- Delegowanie uprawnień tymczasowych

**Dane:**
- Szyfrowanie w bazie (AES-256)
- Szyfrowanie w tranzycie (TLS 1.3)
- Backupy automatyczne (codziennie)
- GDPR compliance
- Anonimizacja danych testowych

**Audyt:**
- Logowanie wszystkich akcji
- Wersjonowanie zmian
- Ślad audytowy (kto, co, kiedy)
- Monitoring prób włamań
- Alerty bezpieczeństwa

### Architektura

**Backend:**
- Node.js + Express
- SQLite (produkcja: PostgreSQL/MySQL)
- Redis (cache, sesje)
- WebSockets (real-time)
- Queue system (Bull/RabbitMQ)

**Frontend:**
- Vanilla JS (modułowy)
- Progressive Web App (PWA)
- Service Workers (offline)
- Lazy loading
- Code splitting

**DevOps:**
- Docker containers
- CI/CD (GitHub Actions)
- Monitoring (PM2, Sentry)
- Load balancing
- CDN dla statycznych

---

## 📅 HARMONOGRAM WDROŻENIA

### Faza 1 (Tydzień 1-2): Fundamenty
- ✅ Moduł kosztów - tabele + API
- ✅ System kont - rozszerzenie users
- ✅ Dashboard - podstawowe statystyki

### Faza 2 (Tydzień 3-4): Funkcje biznesowe
- ✅ Faktury - generator + wysyłka
- ✅ Budżety - planowanie + tracking
- ✅ Zespoły - struktura organizacyjna

### Faza 3 (Tydzień 5-6): Raportowanie
- ✅ Raporty finansowe
- ✅ Raporty operacyjne
- ✅ Eksporty (Excel, PDF, CSV)

### Faza 4 (Tydzień 7-8): Integracje
- ✅ Email (Gmail, Outlook)
- ✅ Księgowość (eksport)
- ✅ Płatności online

### Faza 5 (Tydzień 9-10): Bezpieczeństwo
- ✅ 2FA
- ✅ Audyt kompletny
- ✅ Backupy automatyczne

### Faza 6 (Tydzień 11-12): Testy i optymalizacja
- ✅ Testy funkcjonalne
- ✅ Testy bezpieczeństwa
- ✅ Optymalizacja wydajności
- ✅ Szkolenia użytkowników

---

## 🎯 METRYKI SUKCESU

### KPI Systemu
- Dostępność: 99.9%
- Czas odpowiedzi API: <200ms
- Liczba aktywnych użytkowników dziennie
- Liczba przetworzonych spraw/miesiąc
- Średni czas obsługi klienta

### KPI Biznesowe
- Wzrost liczby klientów o 30%
- Redukcja czasu administracji o 50%
- Wzrost satysfakcji klientów (NPS)
- ROI systemu w ciągu 12 miesięcy

---

## 💳 SYSTEM PŁATNOŚCI RATALNYCH - PRIORYTET #1

**Szczegółowa specyfikacja:** `SYSTEM-PLATNOSCI-SPEC.md`

### Funkcje kluczowe:
1. **Portfel cyfrowy klienta** - saldo, historia, doładowanie
2. **Plany ratalne** - elastyczne, konfigurowalne
3. **Płatności online** - PayPal, BLIK, karty
4. **Monitoring zaległości** - auto-przypomnienia, alerty
5. **Dashboard klienta** - płatności, historia, metody
6. **Dashboard mecenasa** - kontrola płatności, zaległości
7. **Dashboard opiekuna** - zadania, przypomnienia
8. **Faktury automatyczne** - generowanie, wysyłka

### Integracje:
- PayPal API
- BLIK (Autopay/PayU)
- Stripe (karty)
- System faktur KP

---

## 🔗 INTEGRACJA GOOGLE WORKSPACE - PRIORYTET #2

**Szczegółowa specyfikacja:** `INTEGRACJA-GOOGLE-WORKSPACE.md`

### 💰 Oszczędność: 648 EUR/rok!
- **Zamiast:** 10 kont × 6 EUR = 60 EUR/miesiąc
- **Teraz:** 1 konto × 6 EUR = 6 EUR/miesiąc
- **Wszyscy pracują przez komunikator!**

### Funkcje kluczowe:
1. **Formularz kontaktowy** - na stronie www + Facebook
2. **Auto-lead processing** - automatyczne przetwarzanie zgłoszeń
3. **Google Drive** - auto-tworzenie folderów dla klientów
4. **Gmail API** - pełna integracja poczty w aplikacji
5. **Dashboard emaili** - profesjonalny widok skrzynki
6. **Synchronizacja** - wszystko w jednym miejscu

### Workflow:
```
Formularz → Lead w bazie → Folder Google Drive → 
Email powitalny → Assign do mecenasa → Dashboard
```

### Komponenty:
- **Formularz www/FB** - zbieranie leadów
- **Tabela leads** - CRM dla potencjalnych klientów
- **Google Drive API** - foldery, upload, download
- **Gmail API** - odbiór, wysyłka, wątki
- **Dashboard emaili** - odczyt poczty w aplikacji
- **Auto-processing** - bez ręcznej pracy!

---

## 💡 FUNKCJE PREMIUM (PRZYSZŁOŚĆ)

1. **AI Asystent prawny** - analiza dokumentów, sugestie
2. **Chatbot dla klientów** - obsługa 24/7
3. **Mobilna aplikacja** (iOS, Android)
4. **Analityka predykcyjna** - przewidywanie wyników spraw
5. **OCR dokumentów** - automatyczne wyciąganie danych
6. **Wideokonferencje** - integracja Zoom/Teams
7. **E-learning** - szkolenia dla klientów
8. **CRM dla potencjalnych klientów**
9. **Marketing automation**
10. **Multi-tenancy** - system dla wielu kancelarii

---

**Wersja:** 2.1 - ROZSZERZONE O PŁATNOŚCI  
**Data:** 12 listopada 2025  
**Autor:** Pro Meritum Team  
**Status:** ✅ Gotowy do wdrożenia
**Nowe:** 💳 System płatności ratalnych + Dashboardy specjalistyczne
