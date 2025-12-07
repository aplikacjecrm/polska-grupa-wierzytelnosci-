# 🔗 INTEGRACJA GOOGLE WORKSPACE - PEŁNA SPECYFIKACJA

## 💡 KONCEPCJA - OSZCZĘDNOŚĆ KOSZTÓW

### Problem:
- 10 pracowników × 6 EUR/miesiąc = **60 EUR/miesiąc (720 EUR/rok)**
- Każdy potrzebuje: Gmail, Drive, Calendar, Docs

### Rozwiązanie:
- **1 konto Google Workspace** (info@kancelaria.pl) - 6 EUR/miesiąc
- Wszyscy pracownicy używają **komunikatora Pro Meritum**
- **Oszczędność: 54 EUR/miesiąc (648 EUR/rok)** 💰

---

## 📋 MODUŁ 1: FORMULARZ KONTAKTOWY + AUTO-LEAD

### Formularz na stronie www

```html
<!-- FORMULARZ KONTAKTOWY -->
<form id="contactForm" class="pro-meritum-contact">
  <h2>📧 Potrzebujesz pomocy prawnej?</h2>
  <p>Wypełnij formularz - odpowiemy w 24h!</p>
  
  <!-- Dane osobowe -->
  <input type="text" name="firstName" placeholder="Imię *" required>
  <input type="text" name="lastName" placeholder="Nazwisko *" required>
  <input type="email" name="email" placeholder="Email *" required>
  <input type="tel" name="phone" placeholder="Telefon *" required>
  
  <!-- Dane firmy (opcjonalnie) -->
  <input type="text" name="companyName" placeholder="Nazwa firmy (opcjonalnie)">
  <input type="text" name="nip" placeholder="NIP (opcjonalnie)">
  
  <!-- Typ sprawy -->
  <select name="caseType" required>
    <option value="">Wybierz typ sprawy *</option>
    <option value="civil">🏛️ Sprawa cywilna</option>
    <option value="criminal">⚖️ Sprawa karna</option>
    <option value="family">👨‍👩‍👧 Sprawa rodzinna</option>
    <option value="business">💼 Sprawa gospodarcza</option>
    <option value="labor">👷 Sprawa pracownicza</option>
    <option value="administrative">📋 Sprawa administracyjna</option>
    <option value="other">📝 Inne</option>
  </select>
  
  <!-- Opis sprawy -->
  <textarea name="description" placeholder="Opisz swoją sprawę... *" 
            rows="5" required></textarea>
  
  <!-- Pilność -->
  <select name="urgency">
    <option value="low">Niska pilność</option>
    <option value="medium">Średnia pilność</option>
    <option value="high">🔥 Wysoka pilność</option>
    <option value="urgent">🚨 Sprawa pilna!</option>
  </select>
  
  <!-- Budżet -->
  <select name="budget">
    <option value="">Przewidywany budżet (opcjonalnie)</option>
    <option value="1000">Do 1,000 PLN</option>
    <option value="5000">1,000 - 5,000 PLN</option>
    <option value="10000">5,000 - 10,000 PLN</option>
    <option value="20000">10,000 - 20,000 PLN</option>
    <option value="more">Powyżej 20,000 PLN</option>
  </select>
  
  <!-- Źródło -->
  <input type="hidden" name="source" value="website">
  <input type="hidden" name="utm_source" value="">
  <input type="hidden" name="utm_campaign" value="">
  
  <!-- RODO -->
  <label>
    <input type="checkbox" name="gdpr_consent" required>
    Zgadzam się na przetwarzanie danych osobowych *
  </label>
  
  <label>
    <input type="checkbox" name="marketing_consent">
    Zgadzam się na otrzymywanie informacji marketingowych
  </label>
  
  <button type="submit">📨 Wyślij zapytanie</button>
  
  <p class="info">* Pola wymagane</p>
</form>

<script>
// Integracja z backend
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  // Dodaj UTM z URL
  const urlParams = new URLSearchParams(window.location.search);
  formData.set('utm_source', urlParams.get('utm_source') || 'direct');
  formData.set('utm_campaign', urlParams.get('utm_campaign') || '');
  
  const response = await fetch('https://api.pro-meritum.pl/api/leads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
  });
  
  if (response.ok) {
    alert('✅ Dziękujemy! Odpowiemy w ciągu 24h.');
    e.target.reset();
  }
});
</script>
```

### Formularz dla Facebook Ads

```html
<!-- WERSJA UPROSZCZONA DLA FB ADS -->
<form id="fbLeadForm" class="fb-lead-form">
  <h2>💼 Bezpłatna konsultacja prawna</h2>
  
  <input type="text" name="firstName" placeholder="Imię">
  <input type="text" name="lastName" placeholder="Nazwisko">
  <input type="email" name="email" placeholder="Email">
  <input type="tel" name="phone" placeholder="Telefon">
  <textarea name="description" placeholder="Twoja sprawa..."></textarea>
  
  <input type="hidden" name="source" value="facebook">
  <input type="hidden" name="utm_source" value="facebook">
  
  <button type="submit">🎁 Umów bezpłatną konsultację</button>
</form>
```

---

## 📊 MODUŁ 2: AUTO-LEAD PROCESSING

### Baza danych

```sql
-- TABELA LEADÓW (POTENCJALNYCH KLIENTÓW)
CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  nip TEXT,
  
  -- Informacje o sprawie
  case_type TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium',
  estimated_budget TEXT,
  
  -- Tracking
  source TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  
  -- Status
  status TEXT DEFAULT 'new',
  assigned_to INTEGER,
  converted_to_client_id INTEGER,
  
  -- RODO
  gdpr_consent BOOLEAN DEFAULT 0,
  marketing_consent BOOLEAN DEFAULT 0,
  
  -- Google Drive
  google_folder_id TEXT,
  google_folder_url TEXT,
  
  -- Daty
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  first_contact_at DATETIME,
  converted_at DATETIME,
  
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (converted_to_client_id) REFERENCES clients(id)
);

-- TABELA NOTATEK DO LEADÓW
CREATE TABLE lead_notes (
  id INTEGER PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- TABELA AKCJI LEADÓW (FUNNEL)
CREATE TABLE lead_actions (
  id INTEGER PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  details TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
```

### Backend API

```javascript
// ===== LEADS =====
POST   /api/leads/submit                // Formularz publiczny
GET    /api/leads                       // Lista leadów
GET    /api/leads/:id                   // Szczegóły
PUT    /api/leads/:id/assign            // Przypisz do mecenasa
POST   /api/leads/:id/convert           // Konwertuj na klienta
POST   /api/leads/:id/note              // Dodaj notatkę
DELETE /api/leads/:id                   // Odrzuć lead

// ===== GOOGLE WORKSPACE =====
POST   /api/google/create-folder        // Utwórz folder na Drive
POST   /api/google/upload-file          // Upload pliku
GET    /api/google/list-files/:folderId // Lista plików w folderze
POST   /api/google/share-folder         // Udostępnij folder

// ===== EMAIL PRZEZ GMAIL API =====
GET    /api/gmail/inbox                 // Skrzynka odbiorcza
GET    /api/gmail/sent                  // Wysłane
POST   /api/gmail/send                  // Wyślij email
GET    /api/gmail/thread/:id            // Wątek konwersacji
POST   /api/gmail/reply                 // Odpowiedz
```

### Auto-processing workflow

```javascript
// /backend/services/lead-processor.js

async function processNewLead(leadData) {
  try {
    console.log('🎯 Nowy lead:', leadData.email);
    
    // 1. Zapisz lead w bazie
    const lead = await db.leads.create(leadData);
    console.log('✅ Lead zapisany:', lead.id);
    
    // 2. Utwórz folder na Google Drive
    const folderName = `${lead.first_name}_${lead.last_name}_${lead.id}`;
    const folder = await googleDrive.createFolder({
      name: folderName,
      parentFolderId: process.env.GOOGLE_LEADS_FOLDER_ID
    });
    
    // Zapisz ID folderu
    await db.leads.update(lead.id, {
      google_folder_id: folder.id,
      google_folder_url: folder.webViewLink
    });
    console.log('✅ Folder utworzony:', folder.webViewLink);
    
    // 3. Wyślij email powitalny do klienta
    await gmail.send({
      to: lead.email,
      subject: '✅ Otrzymaliśmy Twoje zgłoszenie - Kancelaria Pro Meritum',
      html: getWelcomeEmailTemplate(lead)
    });
    console.log('✅ Email powitalny wysłany');
    
    // 4. Wyślij notyfikację do admina/recepcji
    await sendNotification({
      type: 'new_lead',
      title: '🎯 Nowy lead!',
      message: `${lead.first_name} ${lead.last_name} - ${lead.case_type}`,
      recipients: ['admin', 'reception']
    });
    
    // 5. Auto-assign według typu sprawy
    const assignedLawyer = await autoAssignLawyer(lead.case_type);
    if (assignedLawyer) {
      await db.leads.update(lead.id, { assigned_to: assignedLawyer.id });
      await sendNotification({
        type: 'lead_assigned',
        title: '📋 Przypisano Ci nowy lead',
        message: `${lead.first_name} ${lead.last_name}`,
        recipients: [assignedLawyer.id]
      });
    }
    
    // 6. Zaloguj akcję
    await db.lead_actions.create({
      lead_id: lead.id,
      action_type: 'created',
      details: JSON.stringify({ source: lead.source })
    });
    
    return { success: true, lead, folder };
    
  } catch (error) {
    console.error('❌ Błąd przetwarzania leadu:', error);
    throw error;
  }
}

// Auto-assign według specjalizacji
async function autoAssignLawyer(caseType) {
  const specializations = {
    'civil': ['JK', 'AN'],      // Jan Kowalski, Anna Nowak
    'criminal': ['TW', 'MS'],   // Tomasz Wiśniewski, Maria Szymańska
    'family': ['AN', 'KD'],     // Anna Nowak, Katarzyna Dąbrowska
    'business': ['PL', 'MZ'],   // Piotr Lewandowski, Marcin Zieliński
  };
  
  const lawyerInitials = specializations[caseType]?.[0];
  if (!lawyerInitials) return null;
  
  return await db.users.findOne({ initials: lawyerInitials, user_role: 'lawyer' });
}
```

---

## 🔗 MODUŁ 3: GOOGLE WORKSPACE INTEGRATION

### Google Drive API

```javascript
// /backend/services/google-drive.js

const { google } = require('googleapis');

class GoogleDriveService {
  constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Refresh token dla konta info@kancelaria.pl
    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }
  
  // Utwórz folder dla klienta
  async createClientFolder(clientData) {
    const folderName = `${clientData.firstName}_${clientData.lastName}_${clientData.id}`;
    
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_CLIENTS_ROOT_FOLDER]
    };
    
    const folder = await this.drive.files.create({
      resource: folderMetadata,
      fields: 'id, name, webViewLink'
    });
    
    // Utwórz podfoldery
    await this.createSubfolders(folder.data.id);
    
    return folder.data;
  }
  
  // Podfoldery standardowe
  async createSubfolders(parentId) {
    const subfolders = [
      '📄 Dokumenty',
      '📧 Korespondencja',
      '⚖️ Pozwy i wnioski',
      '🏛️ Wyroki i postanowienia',
      '💰 Faktury',
      '📸 Zdjęcia i dowody'
    ];
    
    for (const name of subfolders) {
      await this.drive.files.create({
        resource: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId]
        }
      });
    }
  }
  
  // Upload pliku
  async uploadFile(fileData, folderId) {
    const fileMetadata = {
      name: fileData.originalName,
      parents: [folderId]
    };
    
    const media = {
      mimeType: fileData.mimeType,
      body: fileData.stream
    };
    
    const file = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });
    
    return file.data;
  }
  
  // Lista plików w folderze
  async listFiles(folderId) {
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, createdTime, webViewLink)',
      orderBy: 'name'
    });
    
    return response.data.files;
  }
  
  // Udostępnij folder (opcjonalnie dla klienta)
  async shareFolder(folderId, email) {
    await this.drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role: 'reader',
        emailAddress: email
      }
    });
  }
}

module.exports = new GoogleDriveService();
```

### Gmail API

```javascript
// /backend/services/gmail.js

const { google } = require('googleapis');

class GmailService {
  constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }
  
  // Pobierz wiadomości
  async getMessages(maxResults = 50) {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
      labelIds: ['INBOX']
    });
    
    const messages = [];
    for (const msg of response.data.messages || []) {
      const full = await this.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });
      messages.push(this.parseMessage(full.data));
    }
    
    return messages;
  }
  
  // Wyślij email
  async sendEmail({ to, subject, html, attachments = [] }) {
    const message = this.createMessage(to, subject, html, attachments);
    
    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: message
      }
    });
    
    return response.data;
  }
  
  // Pomocnicze - tworzenie wiadomości
  createMessage(to, subject, html, attachments) {
    const boundary = 'boundary_' + Date.now();
    let message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      '',
      html
    ];
    
    // Dodaj załączniki
    for (const att of attachments) {
      message.push(`--${boundary}`);
      message.push(`Content-Type: ${att.mimeType}; name="${att.filename}"`);
      message.push(`Content-Disposition: attachment; filename="${att.filename}"`);
      message.push(`Content-Transfer-Encoding: base64`);
      message.push('');
      message.push(att.data);
    }
    
    message.push(`--${boundary}--`);
    
    return Buffer.from(message.join('\n')).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  
  // Parse wiadomości
  parseMessage(message) {
    const headers = message.payload.headers;
    return {
      id: message.id,
      threadId: message.threadId,
      from: headers.find(h => h.name === 'From')?.value,
      to: headers.find(h => h.name === 'To')?.value,
      subject: headers.find(h => h.name === 'Subject')?.value,
      date: headers.find(h => h.name === 'Date')?.value,
      snippet: message.snippet,
      body: this.getBody(message.payload)
    };
  }
  
  getBody(payload) {
    if (payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }
    return '';
  }
}

module.exports = new GmailService();
```

---

## 📧 MODUŁ 4: DASHBOARD EMAILI W APLIKACJI

```
┌─────────────────────────────────────────────────────┐
│ 📧 SKRZYNKA ODBIORCZA - info@kancelaria.pl         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [✉️ Nowa wiadomość] [🔄 Odśwież] [⚙️ Ustawienia]    │
│                                                     │
│ 📁 FOLDERY                                          │
│ • 📥 Odebrane (24)                                  │
│ • 📤 Wysłane (156)                                  │
│ • ⭐ Oznaczone                                      │
│ • 🗑️ Kosz                                           │
│ • 📋 Sprawy                                         │
│ • 💼 Klienci                                        │
│                                                     │
│ ┌───────────────────────────────────────────────┐  │
│ │ ☑ jan.kowalski@gmail.com           10:35     │  │
│ │ 📋 Re: Sprawa CYW/JK/001                      │  │
│ │ Dziękuję za informacje. Czy możemy...        │  │
│ │ [👁️] [↩️] [🗑️] [📋 Przypisz do sprawy]       │  │
│ ├───────────────────────────────────────────────┤  │
│ │ ☑ anna.nowak@firma.pl          Wczoraj       │  │
│ │ 💼 Zapytanie o pomoc prawną                   │  │
│ │ Witam, potrzebuję pomocy w sprawie...        │  │
│ │ [👁️] [↩️] [🗑️] [➕ Utwórz lead]              │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ 🔍 Wyszukaj: [_____________________] [🔍]          │
│ Filtruj: [Wszystkie ▼] [Data ▼] [Od kogo ▼]       │
└─────────────────────────────────────────────────────┘
```

### Funkcje dashboardu email:

1. **Odczyt poczty** - synchronizacja co 2 minuty
2. **Wysyłka** - z szablonami, załącznikami
3. **Przypisywanie** - email do sprawy/klienta/leadu
4. **Etykiety** - kolorowe oznaczenia
5. **Wyszukiwarka** - pełnotekstowa
6. **Filtry** - według nadawcy, daty, słów kluczowych
7. **Auto-odpowiedzi** - dla nieobecności
8. **Szablony** - gotowe odpowiedzi

---

## 💰 MODUŁ 5: OSZCZĘDNOŚCI I ROI

### Porównanie kosztów:

**Wariant A: 10 kont Google Workspace**
- 10 użytkowników × 6 EUR = 60 EUR/miesiąc
- Rocznie: 720 EUR
- **+ Brak integracji z systemem**
- **+ Rozproszenie danych**

**Wariant B: 1 konto + Pro Meritum**
- 1 konto Google × 6 EUR = 6 EUR/miesiąc
- Rocznie: 72 EUR
- **Oszczędność: 648 EUR/rok** 💰
- **+ Pełna integracja**
- **+ Centralizacja danych**
- **+ Kontrola admina**

### ROI wdrożenia:

**Koszt wdrożenia:** ~2000 EUR (jednorazowo)
**Oszczędność roczna:** 648 EUR
**ROI:** 3.08 lata (zwrot inwestycji w 3 lata)

**Ale:** Dodatkowe korzyści:
- Automatyzacja lead'ów
- Centralizacja dokumentów
- Lepsza organizacja
- **Wartość trudna do wyceny!**

---

## 🔒 BEZPIECZEŃSTWO

### OAuth2 Authentication
- Bezpieczne logowanie przez Google
- Refresh tokens (nie wygasają)
- Scope'y ograniczone do minimum

### Uprawnienia minimalne:
```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',  // Tylko pliki utworzone przez app
  'https://www.googleapis.com/auth/gmail.send',  // Tylko wysyłanie
  'https://www.googleapis.com/auth/gmail.readonly'  // Tylko odczyt
];
```

### Backup danych:
- Kopia zapasowa folderów co tydzień
- Archiwum emaili co miesiąc
- Export danych w Google Takeout

---

## 📅 HARMONOGRAM WDROŻENIA

### Tydzień 1: Setup Google
- Utworzenie konta info@kancelaria.pl
- Konfiguracja OAuth2
- Test połączenia API

### Tydzień 2: Formularz + Leads
- Formularz kontaktowy
- Baza danych leads
- Auto-processing

### Tydzień 3: Google Drive
- Integracja Drive
- Auto-tworzenie folderów
- Upload/download plików

### Tydzień 4: Gmail
- Integracja Gmail
- Dashboard emaili
- Wysyłka/odbiór

### Tydzień 5: Testy
- Testy end-to-end
- Optymalizacja
- Szkolenie zespołu

---

**Status:** ✅ Gotowe do wdrożenia  
**Priorytet:** 🔥 WYSOKI (oszczędność kosztów!)  
**ROI:** 3 lata
