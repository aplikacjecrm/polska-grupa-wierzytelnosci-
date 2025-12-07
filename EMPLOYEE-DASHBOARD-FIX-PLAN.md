# 🗺️ MAPA NAPRAW EMPLOYEE DASHBOARD

## 📋 PROBLEMY DO ROZWIĄZANIA:

### 1. ❌ Zadania nie wyświetlają się w dashboardzie pracownika
**Powód:** Endpoint `/api/employees/:userId/tasks` istnieje, ale mogą być problemy z danymi

### 2. ❌ Tickety HR nie są widoczne w dashboardzie
**Powód:** BRAK zakładki "Tickety" w employee-dashboard.js

### 3. ❌ Pracownik nie widzi swoich ticketów ani ich statusu
**Powód:** Brak integracji ticketów z dashboardem pracownika

### 4. ❌ Admin nie widzi ticketów pracownika w jego dashboardzie
**Powód:** Brak endpoint `/api/employees/:userId/tickets`

---

## ✅ PLAN DZIAŁANIA (KROK PO KROKU):

### KROK 1: Dodaj endpoint dla ticketów pracownika
**Plik:** `backend/routes/employees.js`

```javascript
/**
 * GET /api/employees/:userId/tickets
 * Tickety HR pracownika
 */
router.get('/:userId/tickets', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.all(`
    SELECT * FROM tickets 
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [targetUserId], (err, tickets) => {
    if (err) {
      console.error('❌ Błąd pobierania ticketów:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Statystyki
    const stats = {
      total: tickets.length,
      new: tickets.filter(t => t.status === 'Nowy').length,
      inProgress: tickets.filter(t => t.status === 'W realizacji').length,
      completed: tickets.filter(t => t.status === 'Zakończony').length
    };
    
    res.json({ success: true, tickets, stats });
  });
});
```

---

### KROK 2: Dodaj ładowanie ticketów w frontend
**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

**W funkcji `loadData()` dodaj:**
```javascript
const ticketsResponse = await window.api.request(`/employees/${this.userId}/tickets`);
this.tickets = ticketsResponse.tickets || [];
this.ticketStats = ticketsResponse.stats || {};
```

**W konstruktorze dodaj:**
```javascript
this.tickets = [];
this.ticketStats = {};
```

---

### KROK 3: Dodaj zakładkę "Tickety" w dashboardzie
**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

**W funkcji `render()` dodaj przycisk zakładki:**
```html
<button class="tab-btn" data-tab="tickets" onclick="employeeDashboard.switchTab('tickets')">
  🎫 Tickety <span class="badge">${this.ticketStats.total || 0}</span>
</button>
```

**Dodaj zawartość zakładki:**
```html
<div class="tab-content" id="tab-tickets">${this.renderTicketsTab()}</div>
```

---

### KROK 4: Dodaj funkcję renderTicketsTab()
**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

```javascript
renderTicketsTab() {
  const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserRole = currentUserData.user_role || currentUserData.role || 'client';
  const isAdmin = currentUserRole === 'admin';
  
  return `
    <div class="tickets-container">
      <div class="tickets-header">
        <h3>🎫 Tickety HR/IT</h3>
        ${!isAdmin ? `
          <button class="btn-primary btn-small" onclick="employeeDashboard.showCreateTicketModal()">+ Nowy Ticket</button>
        ` : ''}
      </div>
      
      <!-- Statystyki -->
      <div class="tickets-stats">
        <div class="stat-box">
          <span class="stat-value">${this.ticketStats.total || 0}</span>
          <span class="stat-label">Wszystkie</span>
        </div>
        <div class="stat-box new">
          <span class="stat-value">${this.ticketStats.new || 0}</span>
          <span class="stat-label">Nowe</span>
        </div>
        <div class="stat-box progress">
          <span class="stat-value">${this.ticketStats.inProgress || 0}</span>
          <span class="stat-label">W realizacji</span>
        </div>
        <div class="stat-box completed">
          <span class="stat-value">${this.ticketStats.completed || 0}</span>
          <span class="stat-label">Zakończone</span>
        </div>
      </div>
      
      <!-- Lista ticketów -->
      ${this.tickets.length > 0 ? `
        <div class="tickets-list">
          ${this.tickets.map(t => `
            <div class="ticket-card status-${t.status.toLowerCase().replace(/\s+/g, '-')}">
              <div class="ticket-header">
                <span class="ticket-number">${t.ticket_number}</span>
                <span class="ticket-status badge-${this.getTicketStatusClass(t.status)}">${t.status}</span>
              </div>
              <h4>${t.title}</h4>
              <div class="ticket-meta">
                <span>📂 ${t.ticket_type}</span>
                <span>🏢 ${t.department}</span>
                <span>⚡ ${t.priority || 'normal'}</span>
              </div>
              <div class="ticket-date">
                📅 ${this.formatDate(t.created_at)}
              </div>
              ${t.admin_note ? `
                <div class="ticket-note">
                  <strong>📝 Notatka admina:</strong>
                  <p>${t.admin_note}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p>🎫 Brak ticketów</p>
          ${!isAdmin ? '<p>Kliknij "+ Nowy Ticket" aby zgłosić problem</p>' : ''}
        </div>
      `}
    </div>
  `;
}

getTicketStatusClass(status) {
  switch(status) {
    case 'Nowy': return 'new';
    case 'W realizacji': return 'progress';
    case 'Zakończony': return 'success';
    default: return 'default';
  }
}
```

---

### KROK 5: Dodaj modal tworzenia ticketu
**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

```javascript
showCreateTicketModal() {
  const html = `
    <div class="modal active" id="createTicketModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎫 Nowy Ticket HR/IT</h3>
          <button class="modal-close" onclick="employeeDashboard.closeModal('createTicketModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="createTicketForm">
            <div class="form-group">
              <label>Typ ticketu *</label>
              <select id="ticketType" required>
                <option value="">Wybierz...</option>
                <option value="HR">HR - Urlop, umowa, dokumenty</option>
                <option value="IT">IT - Sprzęt, oprogramowanie, dostęp</option>
                <option value="Administracja">Administracja - Biuro, wyposażenie</option>
                <option value="Szkolenienie">Szkolenie - Kursy, rozwój</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Dział *</label>
              <input type="text" id="ticketDepartment" placeholder="np. IT, HR, Księgowość" required>
            </div>
            
            <div class="form-group">
              <label>Tytuł *</label>
              <input type="text" id="ticketTitle" placeholder="Krótki opis problemu" required>
            </div>
            
            <div class="form-group">
              <label>Szczegóły</label>
              <textarea id="ticketDetails" rows="5" placeholder="Opisz dokładnie problem lub potrzebę..."></textarea>
            </div>
            
            <div class="form-group">
              <label>Priorytet</label>
              <select id="ticketPriority">
                <option value="low">Niski</option>
                <option value="normal" selected>Normalny</option>
                <option value="high">Wysoki</option>
                <option value="urgent">Pilny</option>
              </select>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="employeeDashboard.closeModal('createTicketModal')">Anuluj</button>
              <button type="submit" class="btn-primary">📤 Wyślij Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
  
  // Submit handler
  document.getElementById('createTicketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await this.createTicket();
  });
}

async createTicket() {
  const ticketData = {
    user_id: this.userId,
    ticket_type: document.getElementById('ticketType').value,
    title: document.getElementById('ticketTitle').value,
    department: document.getElementById('ticketDepartment').value,
    details: document.getElementById('ticketDetails').value,
    priority: document.getElementById('ticketPriority').value
  };
  
  try {
    const response = await window.api.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
    
    if (response.success) {
      alert('✅ Ticket został utworzony!');
      this.closeModal('createTicketModal');
      await this.loadData();
      this.switchTab('tickets');
    }
  } catch (error) {
    console.error('❌ Błąd tworzenia ticketu:', error);
    alert('Błąd przy tworzeniu ticketu');
  }
}
```

---

### KROK 6: Dodaj logowanie aktywności przy tworzeniu ticketu
**Plik:** `backend/routes/tickets.js`

**W endpoincie `POST /` dodaj logowanie:**
```javascript
// Po utworzeniu ticketu (po db.run success):
const { getDatabase } = require('../database/init');

db.run(`
  INSERT INTO employee_activity_logs (
    user_id, action_type, action_category, description
  ) VALUES (?, ?, ?, ?)
`, [
  user_id,
  'ticket_created',
  'ticket',
  `Utworzono ticket: ${title} (${ticketNumber})`
], (logErr) => {
  if (logErr) console.error('⚠️ Błąd logowania aktywności:', logErr);
  else console.log('📊 Aktywność ticketu zalogowana');
});
```

---

### KROK 7: Dodaj style dla ticketów
**Plik:** `frontend/styles/employee-dashboard.css`

```css
/* Tickety */
.tickets-container {
  padding: 20px;
}

.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tickets-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.tickets-stats .stat-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: white;
}

.tickets-stats .stat-box.new {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.tickets-stats .stat-box.progress {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.tickets-stats .stat-box.completed {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.tickets-list {
  display: grid;
  gap: 15px;
}

.ticket-card {
  background: white;
  border-left: 4px solid #667eea;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.ticket-card.status-nowy {
  border-left-color: #f5576c;
}

.ticket-card.status-w-realizacji {
  border-left-color: #4facfe;
}

.ticket-card.status-zakończony {
  border-left-color: #43e97b;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ticket-number {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #667eea;
}

.ticket-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.badge-new {
  background: #f5576c;
  color: white;
}

.badge-progress {
  background: #4facfe;
  color: white;
}

.badge-success {
  background: #43e97b;
  color: white;
}

.ticket-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
  margin: 10px 0;
}

.ticket-note {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-left: 3px solid #ffc107;
  border-radius: 4px;
}

.ticket-note strong {
  display: block;
  margin-bottom: 5px;
  color: #ffc107;
}
```

---

## 📊 PODSUMOWANIE ZMIAN:

1. ✅ **Backend:** Nowy endpoint `/api/employees/:userId/tickets`
2. ✅ **Backend:** Logowanie aktywności przy tworzeniu ticketu
3. ✅ **Frontend:** Nowa zakładka "Tickety" w dashboardzie
4. ✅ **Frontend:** Funkcja `renderTicketsTab()`
5. ✅ **Frontend:** Modal tworzenia ticketu
6. ✅ **Frontend:** Ładowanie ticketów w `loadData()`
7. ✅ **CSS:** Style dla ticketów

---

## 🎯 REZULTAT:

- ✅ Pracownik widzi swoje tickety w dashboardzie
- ✅ Pracownik może tworzyć nowe tickety
- ✅ Admin widzi tickety pracownika w jego dashboardzie
- ✅ Statusy ticketów są kolorowo oznaczone
- ✅ Aktywność tworzenia ticketu jest logowana
- ✅ Pracownik widzi notatki admina do ticketów
- ✅ Zadania już działają (endpoint istnieje)

---

## 🚀 KOLEJNOŚĆ IMPLEMENTACJI:

1. Backend endpoint ticketów
2. Frontend ładowanie ticketów
3. Frontend zakładka ticketów
4. Frontend renderowanie ticketów
5. Frontend modal tworzenia
6. Backend logowanie aktywności
7. CSS style
