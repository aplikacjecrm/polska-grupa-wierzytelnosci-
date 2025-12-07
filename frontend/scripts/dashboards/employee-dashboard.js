/**
 * Employee Dashboard HR - Main Module
 * Version: 5.0 | Date: 2025-11-13
 * Features: Modals, Charts, Filters, Drag & Drop, Auto-refresh, Export PDF/CSV
 */

console.log('%c🔥 EMPLOYEE-DASHBOARD.JS V5.0 - FINAL VERSION! 🔥', 
  'background: #3B82F6; color: white; font-size: 16px; font-weight: bold; padding: 10px;');

class EmployeeDashboard {
  constructor(userId) {
    this.userId = userId;
    this.profileData = null;
    this.activityData = [];
    this.loginHistory = [];
    this.monthlyReports = [];
    this.tasks = null;
    this.reviews = [];
    
    // Sprawdź rolę użytkownika
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userRole = currentUser.role || 'lawyer';
    this.isAdminOrHR = ['admin', 'hr', 'finance'].includes(this.userRole);
    
    // Ustaw domyślną zakładkę w zależności od roli
    this.currentTab = this.isAdminOrHR ? 'activity' : 'tasks';
    
    console.log('%c═══════════════════════════════════════', 'color: #3B82F6; font-weight: bold;');
    console.log('%c👤 EMPLOYEE DASHBOARD - ROLE CHECK', 'color: #3B82F6; font-weight: bold; font-size: 14px;');
    console.log('User ID:', this.userId);
    console.log('User Name:', currentUser.name);
    console.log('User Email:', currentUser.email);
    console.log('User Role:', this.userRole);
    console.log('Is Admin/HR/Finance:', this.isAdminOrHR);
    console.log('Default Tab:', this.currentTab);
    console.log('Allowed roles for full access:', ['admin', 'hr', 'finance']);
    console.log('%c═══════════════════════════════════════', 'color: #3B82F6; font-weight: bold;');
    
    // Filtry
    this.filters = {
      activity: { category: 'all', search: '', dateFrom: '', dateTo: '' },
      tasks: { status: 'all', search: '' },
      reviews: { search: '' }
    };
    
    // Auto-refresh
    this.refreshInterval = null;
    this.autoRefreshEnabled = true;
    
    // Tickety
    this.tickets = [];
    this.ticketStats = {};
  }

  async loadData() {
    console.log('📊 Loading employee data:', this.userId);
    
    try {
      // Profile - KRYTYCZNE
      try {
        const profileResponse = await window.api.request(`/employees/${this.userId}/profile`);
        this.profileData = profileResponse;
        console.log('✅ Profile loaded');
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        throw error; // Profile jest krytyczny
      }
      
      // Activity - opcjonalne
      try {
        const activityResponse = await window.api.request(`/employees/${this.userId}/activity?limit=50`);
        this.activityData = activityResponse.activities || [];
        console.log('✅ Activity loaded:', this.activityData.length);
      } catch (error) {
        console.warn('⚠️ Activity not loaded:', error);
        this.activityData = [];
      }
      
      // Login history - opcjonalne
      try {
        const loginResponse = await window.api.request(`/employees/${this.userId}/login-history?limit=30`);
        this.loginHistory = loginResponse.sessions || [];
        this.loginStats = loginResponse.stats || {};
        console.log('✅ Login history loaded:', this.loginHistory.length);
      } catch (error) {
        console.warn('⚠️ Login history not loaded:', error);
        this.loginHistory = [];
        this.loginStats = {};
      }
      
      // Tasks - opcjonalne
      try {
        const tasksResponse = await window.api.request(`/employees/${this.userId}/tasks`);
        this.tasks = tasksResponse.tasks || {};
        this.taskStats = tasksResponse.stats || {};
        console.log('✅ Tasks loaded');
      } catch (error) {
        console.warn('⚠️ Tasks not loaded:', error);
        this.tasks = {};
        this.taskStats = {};
      }
      
      // Reviews - opcjonalne
      try {
        const reviewsResponse = await window.api.request(`/employees/${this.userId}/reviews`);
        this.reviews = reviewsResponse.reviews || [];
        console.log('✅ Reviews loaded:', this.reviews.length);
      } catch (error) {
        console.warn('⚠️ Reviews not loaded:', error);
        this.reviews = [];
      }
      
      // Tickets - opcjonalne
      try {
        const ticketsResponse = await window.api.request(`/employees/${this.userId}/tickets`);
        this.tickets = ticketsResponse.tickets || [];
        this.ticketStats = ticketsResponse.stats || {};
        console.log('✅ Tickets loaded:', this.tickets.length);
      } catch (error) {
        console.warn('⚠️ Tickets not loaded:', error);
        this.tickets = [];
        this.ticketStats = {};
      }
      
      // Reports - opcjonalne
      try {
        const reportsResponse = await window.api.request(`/employees/${this.userId}/monthly-reports`);
        this.monthlyReports = reportsResponse.reports || [];
        console.log('✅ Reports loaded:', this.monthlyReports.length);
      } catch (error) {
        console.warn('⚠️ Reports not loaded:', error);
        this.monthlyReports = [];
      }
      
      console.log('✅ All critical data loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Critical error loading data:', error);
      throw error;
    }
  }

  async render(containerId = 'employeeDashboardContainer') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }

    if (!this.profileData) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; background: red; color: white;">
          <h2>Błąd ładowania danych</h2>
          <p>Nie udało się pobrać danych pracownika</p>
        </div>
      `;
      return;
    }

    const html = `
      <div class="employee-dashboard">
        ${this.isAdminOrHR ? `
        <div style="position: sticky; top: 0; background: white; z-index: 1000; padding: 10px 20px; border-bottom: 2px solid #e0e0e0; display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <button onclick="window.employeeDashboard.exportToCSV()" style="padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            📥 CSV
          </button>
          <button onclick="window.employeeDashboard.exportToPDF()" style="padding: 10px 20px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            📄 PDF
          </button>
        </div>
        ` : ''}
        <div class="employee-header">
          ${this.renderProfileHeader()}
        </div>
        ${this.isAdminOrHR ? `<div class="employee-stats-grid">${this.renderStatsCards()}</div>` : ''}
        <div class="employee-tabs">
          <div class="tabs-navigation">
            ${this.isAdminOrHR ? `
              <button class="tab-btn active" data-tab="activity" onclick="employeeDashboard.switchTab('activity')">📋 Aktywność</button>
              <button class="tab-btn" data-tab="login-history" onclick="employeeDashboard.switchTab('login-history')">⏰ Logowania</button>
            ` : ''}
            <button class="tab-btn ${!this.isAdminOrHR ? 'active' : ''}" data-tab="tasks" onclick="employeeDashboard.switchTab('tasks')">🎫 Zadania <span class="badge">${this.taskStats.total || 0}</span></button>
            <button class="tab-btn" data-tab="tickets" onclick="employeeDashboard.switchTab('tickets')">🎟️ Tickety <span class="badge">${this.ticketStats.total || 0}</span></button>
            <button class="tab-btn" data-tab="reviews" onclick="employeeDashboard.switchTab('reviews')">⭐ Oceny</button>
            ${this.isAdminOrHR ? `<button class="tab-btn" data-tab="reports" onclick="employeeDashboard.switchTab('reports')">📁 Raporty</button>` : ''}
            <button class="tab-btn" data-tab="financial" onclick="employeeDashboard.switchTab('financial')">💰 Finanse</button>
            <button class="tab-btn" data-tab="vacations" onclick="employeeDashboard.switchTab('vacations')">🏖️ Urlopy</button>
            <button class="tab-btn" data-tab="training" onclick="employeeDashboard.switchTab('training')">🎓 Szkolenia</button>
            <button class="tab-btn" data-tab="certificates" onclick="employeeDashboard.switchTab('certificates')">📜 Zaświadczenia</button>
            <button class="tab-btn" data-tab="schedule" onclick="employeeDashboard.switchTab('schedule')">📅 Mój grafik</button>
            <button class="tab-btn" data-tab="benefits" onclick="employeeDashboard.switchTab('benefits')">🎁 Benefity</button>
            <button class="tab-btn" data-tab="documents" onclick="employeeDashboard.switchTab('documents')">📄 Dokumenty</button>
            ${this.isAdminOrHR ? `<button class="tab-btn" data-tab="statistics" onclick="employeeDashboard.switchTab('statistics')">📊 Statystyki</button>` : ''}
          </div>
          <div class="tabs-content">
            ${this.isAdminOrHR ? `
              <div class="tab-content active" id="tab-activity">${this.renderActivityTab()}</div>
              <div class="tab-content" id="tab-login-history">${this.renderLoginHistoryTab()}</div>
            ` : ''}
            <div class="tab-content ${!this.isAdminOrHR ? 'active' : ''}" id="tab-tasks">${this.renderTasksTab()}</div>
            <div class="tab-content" id="tab-tickets">${this.renderTicketsTab()}</div>
            <div class="tab-content" id="tab-reviews">${this.renderReviewsTab()}</div>
            ${this.isAdminOrHR ? `<div class="tab-content" id="tab-reports">${this.renderReportsTab()}</div>` : ''}
            <div class="tab-content" id="tab-financial">${this.renderFinancialTab()}</div>
            <div class="tab-content" id="tab-vacations"><div class="loading">Ładowanie...</div></div>
            <div class="tab-content" id="tab-training"><div class="loading">Ładowanie...</div></div>
            <div class="tab-content" id="tab-certificates"><div class="loading">Ładowanie...</div></div>
            <div class="tab-content" id="tab-schedule"><div class="loading">Ładowanie grafiku...</div></div>
            <div class="tab-content" id="tab-benefits"><div class="loading">Ładowanie...</div></div>
            <div class="tab-content" id="tab-documents"><div class="loading">Ładowanie...</div></div>
            ${this.isAdminOrHR ? `<div class="tab-content" id="tab-statistics">${this.renderStatisticsTab()}</div>` : ''}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }

  renderProfileHeader() {
    if (!this.profileData || !this.profileData.user) {
      console.error('❌ Profile data missing!', this.profileData);
      return '<div class="error">Błąd ładowania profilu</div>';
    }
    
    const user = this.profileData.user;
    const profile = this.profileData.profile || {};
    
    // Status online - UKRYTY (nie działa poprawnie)
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const tenure = profile.hire_date ? this.calculateTenure(profile.hire_date) : 'Brak danych';
    const currentUserRole = currentUserData.user_role || currentUserData.role || 'client';
    
    return `
      <div class="profile-card">
        <div class="profile-avatar">
          ${profile.avatar_url 
            ? `<img src="${profile.avatar_url}" alt="${user.name}">` 
            : `<div class="avatar-placeholder">${user.initials || user.name.substring(0,2).toUpperCase()}</div>`
          }
        </div>
        <div class="profile-info">
          <h2>${user.name}</h2>
          <p class="role">${this.getRoleLabel(user.user_role)}</p>
          ${profile.position ? `<p class="position">📌 ${profile.position}</p>` : ''}
          <div class="profile-meta">
            <span>📧 ${user.email}</span>
            ${profile.phone ? `<span>📞 ${profile.phone}</span>` : ''}
            ${profile.hire_date ? `<span>📅 Zatrudniony: ${this.formatDate(profile.hire_date)}</span>` : ''}
            ${profile.hire_date ? `<span>⏱️ Staż: ${tenure}</span>` : ''}
          </div>
        </div>
        <div class="profile-actions">
          ${currentUserRole === 'admin' ? `
            <button class="btn-primary" onclick="employeeDashboard.editProfile()">✏️ Edytuj</button>
            <button class="btn-success" onclick="employeeDashboard.showAddReviewModal()">⭐ Oceń</button>
          ` : ''}
          <button class="btn-secondary" onclick="employeeDashboard.showAssignTaskModal()">🎫 Zadanie</button>
        </div>
      </div>
    `;
  }

  renderStatsCards() {
    const stats = this.profileData?.stats || {};
    const taskRate = stats.total_tasks > 0 ? ((stats.completed_tasks / stats.total_tasks) * 100).toFixed(0) : 0;
    
    return `
      <div class="stat-card blue clickable" onclick="employeeDashboard.showCasesModal()" style="cursor: pointer;"><div class="stat-icon">⚖️</div><div class="stat-value">${stats.total_cases || 0}</div><div class="stat-label">Sprawy</div></div>
      <div class="stat-card green clickable" onclick="employeeDashboard.showClientsModal()" style="cursor: pointer;"><div class="stat-icon">👥</div><div class="stat-value">${stats.total_clients || 0}</div><div class="stat-label">Klienci</div></div>
      <div class="stat-card orange"><div class="stat-icon">🎫</div><div class="stat-value">${stats.completed_tasks || 0}/${stats.total_tasks || 0}</div><div class="stat-label">Zadania (${taskRate}%)</div></div>
      <div class="stat-card purple"><div class="stat-icon">⏰</div><div class="stat-value">${this.formatDecimalHours(this.getTodayHours())}</div><div class="stat-label">Dzisiaj</div></div>
      <div class="stat-card teal"><div class="stat-icon">📊</div><div class="stat-value">${this.formatDecimalHours(this.loginStats.total_hours_this_month || 0)}</div><div class="stat-label">Miesiąc</div></div>
      <div class="stat-card red"><div class="stat-icon">⭐</div><div class="stat-value">${this.getAverageRating()}</div><div class="stat-label">Ocena</div></div>
    `;
  }

  renderActivityTab() {
    if (!this.activityData || this.activityData.length === 0) {
      return `<div class="empty-state"><p>📋 Brak aktywności</p></div>`;
    }
    
    // Filtruj dane
    const filteredData = this.getFilteredActivity();
    
    return `
      <div class="activity-timeline">
        <h3>📋 Historia aktywności</h3>
        
        <!-- Panel filtrów -->
        <div class="filters-panel">
          <div class="filter-group">
            <label>🔍 Szukaj</label>
            <input type="text" placeholder="Szukaj w aktywnościach..." 
              value="${this.filters.activity.search}"
              oninput="employeeDashboard.updateFilter('activity', 'search', this.value)">
          </div>
          <div class="filter-group">
            <label>📂 Kategoria</label>
            <select onchange="employeeDashboard.updateFilter('activity', 'category', this.value)">
              <option value="all" ${this.filters.activity.category === 'all' ? 'selected' : ''}>Wszystkie</option>
              <option value="case" ${this.filters.activity.category === 'case' ? 'selected' : ''}>Sprawy</option>
              <option value="document" ${this.filters.activity.category === 'document' ? 'selected' : ''}>Dokumenty</option>
              <option value="communication" ${this.filters.activity.category === 'communication' ? 'selected' : ''}>Komunikacja</option>
              <option value="meeting" ${this.filters.activity.category === 'meeting' ? 'selected' : ''}>Spotkania</option>
              <option value="task" ${this.filters.activity.category === 'task' ? 'selected' : ''}>Zadania</option>
              <option value="note" ${this.filters.activity.category === 'note' ? 'selected' : ''}>Notatki</option>
            </select>
          </div>
          <div class="filter-group">
            <label>📅 Od</label>
            <input type="date" value="${this.filters.activity.dateFrom}"
              onchange="employeeDashboard.updateFilter('activity', 'dateFrom', this.value)">
          </div>
          <div class="filter-group">
            <label>📅 Do</label>
            <input type="date" value="${this.filters.activity.dateTo}"
              onchange="employeeDashboard.updateFilter('activity', 'dateTo', this.value)">
          </div>
          <button class="btn-secondary btn-small" onclick="employeeDashboard.clearFilters('activity')">🔄 Wyczyść</button>
        </div>
        
        <div class="timeline">
          ${filteredData.length > 0 ? filteredData.map(a => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <strong>${a.description}</strong>
                <span class="timeline-time">${this.formatDateTime(a.created_at)}</span>
                ${a.action_category ? `<span class="badge badge-${a.action_category}">${a.action_category}</span>` : ''}
              </div>
            </div>
          `).join('') : '<p class="empty-state">Brak wyników dla wybranych filtrów</p>'}
        </div>
      </div>
    `;
  }

  renderLoginHistoryTab() {
    return `
      <div class="login-history">
        <div class="login-summary">
          <div class="summary-card"><strong>Dzisiaj</strong><p>${this.formatDecimalHours(this.getTodayHours())}</p></div>
          <div class="summary-card"><strong>Tydzień</strong><p>${this.formatDecimalHours(this.getWeekHours())}</p></div>
          <div class="summary-card"><strong>Miesiąc</strong><p>${this.formatDecimalHours(this.loginStats.total_hours_this_month || 0)}</p></div>
          <div class="summary-card"><strong>Średnia</strong><p>${this.formatDecimalHours(this.loginStats.avg_duration_hours || 0)}</p></div>
        </div>
        ${this.loginHistory.length > 0 ? `
          <table class="login-table">
            <thead><tr>
              <th style="color: #1a1a1a; font-weight: 700;">Data</th>
              <th style="color: #1a1a1a; font-weight: 700;">Login</th>
              <th style="color: #1a1a1a; font-weight: 700;">Logout</th>
              <th style="color: #1a1a1a; font-weight: 700;">Czas</th>
              <th style="color: #1a1a1a; font-weight: 700;">IP</th>
            </tr></thead>
            <tbody>
              ${this.loginHistory.map(s => `
                <tr>
                  <td style="color: #1a1a1a;">${this.formatDate(s.login_time)}</td>
                  <td style="color: #1a1a1a;">${this.formatTime(s.login_time)}</td>
                  <td style="color: #1a1a1a;">${s.logout_time ? this.formatTime(s.logout_time) : '🟢 Aktywny'}</td>
                  <td style="color: #1a1a1a;">${this.formatSessionDuration(s)}</td>
                  <td style="color: #1a1a1a;"><code style="color: #1a1a1a;">${s.ip_address || 'N/A'}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `<div class="empty-state"><p>⏰ Brak logowań</p></div>`}
      </div>
    `;
  }

  renderTasksTab() {
    // Filtruj zadania
    const filteredTasks = this.getFilteredTasks();
    const pending = filteredTasks.filter(t => t.status === 'pending');
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress');
    const completed = filteredTasks.filter(t => t.status === 'completed');
    
    return `
      <div class="tasks-container">
        <div class="tasks-header">
          <h3>🎫 Zadania</h3>
          <button class="btn-primary btn-small" onclick="employeeDashboard.showAssignTaskModal()">+ Nowe</button>
        </div>
        
        <!-- Panel filtrów zadań -->
        <div class="filters-panel">
          <div class="filter-group">
            <label>🔍 Szukaj</label>
            <input type="text" placeholder="Szukaj w zadaniach..." 
              value="${this.filters.tasks.search}"
              oninput="employeeDashboard.updateFilter('tasks', 'search', this.value)">
          </div>
          <div class="filter-group">
            <label>📊 Status</label>
            <select onchange="employeeDashboard.updateFilter('tasks', 'status', this.value)">
              <option value="all" ${this.filters.tasks.status === 'all' ? 'selected' : ''}>Wszystkie</option>
              <option value="pending" ${this.filters.tasks.status === 'pending' ? 'selected' : ''}>Do zrobienia</option>
              <option value="in_progress" ${this.filters.tasks.status === 'in_progress' ? 'selected' : ''}>W trakcie</option>
              <option value="completed" ${this.filters.tasks.status === 'completed' ? 'selected' : ''}>Ukończone</option>
              <option value="cancelled" ${this.filters.tasks.status === 'cancelled' ? 'selected' : ''}>Anulowane</option>
            </select>
          </div>
          <button class="btn-secondary btn-small" onclick="employeeDashboard.clearFilters('tasks')">🔄 Wyczyść</button>
        </div>
        
        <div class="tasks-stats">
          <span>Razem: ${filteredTasks.length}</span>
          <span>Ukończone: ${completed.length}</span>
          <span>Zaległe: ${filteredTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length}</span>
        </div>
        <div class="tasks-columns">
          <div class="task-column" 
               data-status="pending"
               ondragover="employeeDashboard.handleDragOver(event)"
               ondrop="employeeDashboard.handleDrop(event)">
            <h4>📝 Do zrobienia (${pending.length})</h4>
            ${pending.length > 0 ? pending.map(t => this.renderTaskCard(t)).join('') : '<p class="empty-state">Brak zadań</p>'}
          </div>
          <div class="task-column" 
               data-status="in_progress"
               ondragover="employeeDashboard.handleDragOver(event)"
               ondrop="employeeDashboard.handleDrop(event)">
            <h4>⚙️ W trakcie (${inProgress.length})</h4>
            ${inProgress.length > 0 ? inProgress.map(t => this.renderTaskCard(t)).join('') : '<p class="empty-state">Brak zadań</p>'}
          </div>
          <div class="task-column" 
               data-status="completed"
               ondragover="employeeDashboard.handleDragOver(event)"
               ondrop="employeeDashboard.handleDrop(event)">
            <h4>✅ Ukończone (${completed.length})</h4>
            ${completed.length > 0 ? completed.slice(0, 5).map(t => this.renderTaskCard(t)).join('') : '<p class="empty-state">Brak zadań</p>'}
          </div>
        </div>
      </div>
    `;
  }

  renderTaskCard(task) {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    // Różne kolory dla każdego statusu + granatowa czcionka
    const statusColors = {
      pending: 'background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left: 4px solid #ff9800;',      // Pomarańczowy
      in_progress: 'background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #2196f3;',  // Niebieski
      completed: 'background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-left: 4px solid #4caf50;'     // Zielony
    };
    const cardStyle = (statusColors[task.status] || statusColors.pending) + ' color: #1a2332;';
    
    return `
      <div class="task-card ${task.status} ${isOverdue ? 'overdue' : ''}" 
           draggable="true" 
           data-task-id="${task.id}"
           ondragstart="employeeDashboard.handleDragStart(event)"
           ondragend="employeeDashboard.handleDragEnd(event)"
           style="cursor: pointer; ${cardStyle}">
        <div class="task-header">
          <div class="task-priority ${task.priority}">${task.priority || 'medium'}</div>
          ${task.task_number ? `<span class="task-number" style="color:#1a2332 !important;">${task.task_number}</span>` : ''}
        </div>
        <h5 style="color:#1a2332 !important;">${task.title}</h5>
        ${task.description ? `<p style="color:#1a2332 !important;">${task.description.substring(0, 80)}${task.description.length > 80 ? '...' : ''}</p>` : ''}
        ${task.due_date ? `<div class="task-due" style="color:#1a2332 !important;">📅 ${this.formatDate(task.due_date)}</div>` : ''}
        <button class="btn-small" onclick="event.stopPropagation(); event.preventDefault(); employeeDashboard.showTaskDetailsSimple(${task.id}); return false;" style="margin-top: 8px; font-size: 11px; color: white !important; background: #1a2332; border-radius: 4px; padding: 5px 10px;">🔍 Szczegóły</button>
      </div>
    `;
  }

  // Szczegóły zadania z załącznikami i komentarzami
  showTaskDetailsSimple(taskId) {
    // Znajdź zadanie
    const allTasks = [...(this.tasks.pending || []), ...(this.tasks.in_progress || []), ...(this.tasks.completed || [])];
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const priorityLabels = { low: '🟢 Niski', medium: '🟡 Średni', high: '🔴 Wysoki' };
    const statusLabels = { pending: '⏳ Do zrobienia', in_progress: '🔄 W trakcie', completed: '✅ Ukończone' };

    // Usuń istniejący modal
    const existing = document.getElementById('taskModal');
    if (existing) existing.remove();

    // Stwórz modal jako element DOM
    const modalDiv = document.createElement('div');
    modalDiv.id = 'taskModal';
    modalDiv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);z-index:999999;display:flex;align-items:center;justify-content:center;';
    
    modalDiv.innerHTML = `
      <div style="background:white;border-radius:12px;max-width:700px;width:90%;max-height:85vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation();">
        <div style="background:#1a2332;color:white;padding:20px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;">📋 ${task.task_number || 'Zadanie #' + task.id}</h3>
          <button onclick="document.getElementById('taskModal').remove()" style="background:none;border:none;color:white;font-size:28px;cursor:pointer;">×</button>
        </div>
        
        <div style="padding:25px;">
          <h4 style="margin:0 0 20px 0;color:#1a2332;">${task.title}</h4>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;padding:15px;background:#f8f9fa;border-radius:8px;color:#000;">
            <div><strong style="color:#000;">Status:</strong> <span style="color:#000;">${statusLabels[task.status] || task.status}</span></div>
            <div><strong style="color:#000;">Priorytet:</strong> <span style="color:#000;">${priorityLabels[task.priority] || task.priority}</span></div>
            <div><strong style="color:#000;">Termin:</strong> <span style="color:#000;">${task.due_date ? this.formatDate(task.due_date) : 'Brak'}</span></div>
            <div><strong style="color:#000;">Utworzono:</strong> <span style="color:#000;">${this.formatDate(task.created_at)}</span></div>
            <div><strong style="color:#000;">Zleceniodawca:</strong> <span style="color:#000;">${task.assigned_by_name || 'System'}</span></div>
            <div><strong style="color:#000;">Wykonawca:</strong> <span style="color:#000;">ID: ${task.assigned_to}</span></div>
          </div>
          
          ${task.description ? `
            <div style="margin-bottom:20px;">
              <strong style="color:#000;font-size:16px;">📝 Opis:</strong>
              <p style="background:#f0f0f0;padding:12px;border-radius:6px;margin-top:8px;color:#000;">${task.description}</p>
            </div>
          ` : ''}
          
          <!-- Załączniki -->
          <div style="margin-bottom:20px;padding:15px;border:2px solid #e0e0e0;border-radius:8px;">
            <strong style="color:#000;font-size:16px;">📎 Załączniki:</strong>
            <div id="taskAttachmentsList" style="margin-top:10px;min-height:40px;">
              <p style="color:#333;">Ładowanie załączników...</p>
            </div>
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid #eee;">
              <input type="file" id="taskFileInput" multiple style="margin-bottom:10px;">
              <button onclick="employeeDashboard.uploadAttachment(${taskId})" style="background:#d4af37;color:#1a2332;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:bold;">📤 Dodaj plik</button>
            </div>
          </div>
          
          <!-- Komentarze -->
          <div style="margin-bottom:20px;padding:15px;border:2px solid #e0e0e0;border-radius:8px;">
            <strong style="color:#000;font-size:16px;">💬 Komentarze:</strong>
            <div id="taskCommentsList" style="margin-top:10px;max-height:200px;overflow-y:auto;">
              <p style="color:#333;">Ładowanie komentarzy...</p>
            </div>
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid #eee;">
              <textarea id="taskCommentInput" placeholder="Napisz komentarz..." style="width:100%;height:60px;padding:10px;border:1px solid #ddd;border-radius:6px;resize:none;"></textarea>
              <button onclick="employeeDashboard.addTaskComment(${taskId})" style="background:#3B82F6;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:bold;margin-top:8px;">💬 Dodaj komentarz</button>
            </div>
          </div>
          
          <div style="text-align:right;padding-top:15px;border-top:1px solid #eee;">
            <button onclick="document.getElementById('taskModal').remove()" style="background:#6c757d;color:white;border:none;padding:10px 25px;border-radius:6px;cursor:pointer;font-weight:bold;">Zamknij</button>
          </div>
        </div>
      </div>
    `;
    
    // Zamknij przy kliknięciu tła
    modalDiv.onclick = (e) => {
      if (e.target === modalDiv) modalDiv.remove();
    };
    
    document.body.appendChild(modalDiv);
    
    // Załaduj załączniki i komentarze
    this.loadAttachments(taskId);
    this.loadComments(taskId);
  }

  // Załaduj załączniki
  async loadAttachments(taskId) {
    const container = document.getElementById('taskAttachmentsList');
    if (!container) return;
    
    try {
      const response = await window.api.request(`/employees/tasks/${taskId}/attachments`);
      if (response.attachments && response.attachments.length > 0) {
        container.innerHTML = response.attachments.map(a => {
          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(a.original_name);
          const isPdf = /\.pdf$/i.test(a.original_name);
          return `
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f5f5f5;border-radius:6px;margin-bottom:8px;flex-wrap:wrap;">
            <span style="flex:1;min-width:150px;color:#000;">📄 ${a.original_name} <small style="color:#000;">(${Math.round(a.file_size/1024)}KB)</small></span>
            <div style="display:flex;gap:5px;">
              ${isImage || isPdf ? `<button onclick="employeeDashboard.previewAttachment(${a.id}, '${a.original_name}')" style="background:#3B82F6;color:white;padding:5px 12px;border-radius:4px;border:none;font-size:12px;cursor:pointer;">👁️ Podgląd</button>` : ''}
              <button onclick="employeeDashboard.downloadAttachment(${a.id}, '${a.original_name}')" style="background:#28a745;color:white;padding:5px 12px;border-radius:4px;border:none;font-size:12px;cursor:pointer;">⬇️ Pobierz</button>
            </div>
          </div>
        `}).join('');
      } else {
        container.innerHTML = '<p style="color:#333;font-style:italic;">Brak załączników</p>';
      }
    } catch (e) {
      container.innerHTML = '<p style="color:#dc3545;">Błąd ładowania załączników</p>';
    }
  }

  // Pobierz załącznik z tokenem
  async downloadAttachment(attachmentId, filename) {
    try {
      const response = await fetch(`${window.api.baseURL}/employees/tasks/attachments/${attachmentId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Błąd pobierania');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Błąd pobierania:', e);
      alert('❌ Błąd pobierania pliku');
    }
  }

  // Podgląd załącznika
  async previewAttachment(attachmentId, filename) {
    try {
      const response = await fetch(`${window.api.baseURL}/employees/tasks/attachments/${attachmentId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Błąd pobierania');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Usuń istniejący modal podglądu
      const existing = document.getElementById('previewModal');
      if (existing) existing.remove();
      
      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
      const isPdf = /\.pdf$/i.test(filename);
      
      const modal = document.createElement('div');
      modal.id = 'previewModal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:9999999;display:flex;align-items:center;justify-content:center;flex-direction:column;';
      
      modal.innerHTML = `
        <div style="background:white;border-radius:12px;overflow:hidden;max-width:95%;max-height:95vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="background:#1a2332;color:white;padding:15px 20px;display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;font-size:16px;">📄 ${filename}</h3>
            <div style="display:flex;gap:10px;">
              <button onclick="employeeDashboard.downloadAttachment(${attachmentId}, '${filename}')" style="background:#28a745;color:white;padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-weight:bold;font-size:13px;">⬇️ Pobierz</button>
              <button onclick="document.getElementById('previewModal').remove()" style="background:#dc3545;color:white;padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-weight:bold;font-size:13px;">✕ Zamknij</button>
            </div>
          </div>
          <div style="padding:20px;overflow:auto;display:flex;justify-content:center;align-items:center;background:#f5f5f5;">
            ${isImage ? `<img src="${url}" style="max-width:100%;max-height:75vh;border-radius:4px;">` : ''}
            ${isPdf ? `<iframe src="${url}" style="width:100%;height:75vh;border:none;"></iframe>` : ''}
          </div>
        </div>
      `;
      
      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };
      
      document.body.appendChild(modal);
    } catch (e) {
      console.error('Błąd podglądu:', e);
      alert('❌ Błąd podglądu pliku');
    }
  }

  // Upload załącznika
  async uploadAttachment(taskId) {
    const input = document.getElementById('taskFileInput');
    if (!input.files || input.files.length === 0) {
      alert('Wybierz plik!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of input.files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        console.log('📤 Uploading:', file.name, 'to task:', taskId);
        const response = await fetch(`${window.api.baseURL}/employees/tasks/${taskId}/attachments`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        
        const result = await response.json();
        console.log('📥 Response:', result);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error('❌ Upload error:', result.message);
        }
      } catch (e) {
        errorCount++;
        console.error('❌ Błąd uploadu:', e);
      }
    }
    
    input.value = '';
    this.loadAttachments(taskId);
    
    if (successCount > 0) {
      alert(`✅ Dodano ${successCount} plik(ów)!`);
    } else if (errorCount > 0) {
      alert(`❌ Błąd dodawania plików. Sprawdź konsolę.`);
    }
  }

  // Załaduj komentarze
  async loadComments(taskId) {
    const container = document.getElementById('taskCommentsList');
    if (!container) return;
    
    try {
      const response = await window.api.request(`/employees/tasks/${taskId}/comments`);
      if (response.comments && response.comments.length > 0) {
        container.innerHTML = response.comments.map(c => `
          <div style="padding:10px;background:#f0f4f8;border-radius:6px;margin-bottom:8px;border-left:3px solid #3B82F6;">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <strong style="color:#1a2332;">${c.author_name || 'Użytkownik'}</strong>
              <small style="color:#555;">${this.formatDate(c.created_at)}</small>
            </div>
            <p style="margin:0;color:#333;">${c.content}</p>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p style="color:#333;font-style:italic;">Brak komentarzy</p>';
      }
    } catch (e) {
      container.innerHTML = '<p style="color:#333;font-style:italic;">Brak komentarzy</p>';
    }
  }

  // Dodaj komentarz
  async addTaskComment(taskId) {
    const input = document.getElementById('taskCommentInput');
    const content = input.value.trim();
    if (!content) {
      alert('Wpisz treść komentarza!');
      return;
    }
    
    try {
      await window.api.request(`/employees/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      input.value = '';
      this.loadComments(taskId);
    } catch (e) {
      alert('Błąd dodawania komentarza: ' + e.message);
    }
  }

  // Szczegóły zadania z załącznikami
  showTaskDetails(taskId) {
    console.log('🔍 showTaskDetails called for task:', taskId);
    
    // Najpierw zamknij istniejący modal
    const existingModal = document.getElementById('taskDetailsModal');
    if (existingModal) {
      console.log('🗑️ Removing existing modal');
      existingModal.remove();
    }

    // Znajdź zadanie
    const allTasks = [...(this.tasks.pending || []), ...(this.tasks.in_progress || []), ...(this.tasks.completed || [])];
    console.log('📋 All tasks:', allTasks.length);
    const task = allTasks.find(t => t.id === taskId);
    if (!task) {
      console.error('❌ Nie znaleziono zadania:', taskId);
      return;
    }
    console.log('✅ Found task:', task.title);

    const priorityLabels = { low: '🟢 Niski', medium: '🟡 Średni', high: '🔴 Wysoki' };
    const statusLabels = { pending: '⏳ Do zrobienia', in_progress: '🔄 W trakcie', completed: '✅ Ukończone' };

    const modalHtml = `
      <div class="modal-overlay" id="taskDetailsModal" style="z-index: 99999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.7) !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: auto !important;" onclick="if(event.target === this) employeeDashboard.closeModal('taskDetailsModal')">
        <div class="modal-content modal-medium" onclick="event.stopPropagation();" style="z-index: 100000 !important; position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; margin: 0 !important; max-width: 600px !important; max-height: 90vh !important; overflow: auto !important; background: white !important; border-radius: 12px !important;">
          <div class="modal-header" style="padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">📋 ${task.task_number || 'Zadanie #' + task.id}</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('taskDetailsModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
          </div>
          <div class="modal-body" style="padding: 20px;">
            <h4 style="margin-bottom: 15px; color: #333;">${task.title}</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div><strong>Status:</strong> ${statusLabels[task.status] || task.status}</div>
              <div><strong>Priorytet:</strong> ${priorityLabels[task.priority] || task.priority}</div>
              <div><strong>Termin:</strong> ${task.due_date ? this.formatDate(task.due_date) : 'Brak'}</div>
              <div><strong>Utworzono:</strong> ${this.formatDate(task.created_at)}</div>
            </div>
            
            ${task.description ? `
              <div style="margin-bottom: 20px;">
                <strong>Opis:</strong>
                <p style="background: #f9f9f9; padding: 10px; border-radius: 6px; margin-top: 5px;">${task.description}</p>
              </div>
            ` : ''}
            
            <div id="taskAttachmentsSection" style="margin-bottom: 20px;">
              <strong>📎 Załączniki:</strong>
              <div id="taskAttachmentsList" style="margin-top: 10px;">
                <p style="color: #666;">Ładowanie...</p>
              </div>
              <input type="file" id="newTaskAttachment" style="margin-top: 10px; padding: 8px; border: 2px dashed #ddd; border-radius: 6px; width: 100%;">
              <button onclick="employeeDashboard.uploadTaskAttachment(${taskId})" class="btn-primary btn-small" style="margin-top: 5px;">📤 Dodaj załącznik</button>
            </div>
            
            <div style="text-align: right; margin-top: 20px;">
              <button onclick="employeeDashboard.closeModal('taskDetailsModal')" class="btn-secondary">Zamknij</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Pobierz załączniki asynchronicznie
    this.loadTaskAttachments(taskId);
  }
  
  // Ładuj załączniki osobno
  async loadTaskAttachments(taskId) {
    const listDiv = document.getElementById('taskAttachmentsList');
    if (!listDiv) return;
    
    try {
      const response = await window.api.request(`/employees/tasks/${taskId}/attachments`);
      if (response.attachments && response.attachments.length > 0) {
        listDiv.innerHTML = response.attachments.map(a => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f5f5f5; border-radius: 6px; margin-bottom: 5px;">
            <span>📎 ${a.original_name}</span>
            <small style="color: #666;">(${Math.round(a.file_size / 1024)} KB)</small>
            <a href="${window.api.baseURL}/employees/tasks/attachments/${a.id}/download" 
               class="btn-small btn-primary" 
               style="margin-left: auto; padding: 4px 10px; font-size: 11px;"
               target="_blank">⬇️ Pobierz</a>
          </div>
        `).join('');
      } else {
        listDiv.innerHTML = '<p style="color: #666;">Brak załączników</p>';
      }
    } catch (e) {
      listDiv.innerHTML = '<p style="color: #999;">Błąd ładowania załączników</p>';
    }
  }

  // Upload załącznika do istniejącego zadania
  async uploadTaskAttachment(taskId) {
    const fileInput = document.getElementById('newTaskAttachment');
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Wybierz plik!');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const response = await fetch(`${window.api.baseURL}/employees/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      if (response.ok) {
        alert('✅ Załącznik dodany!');
        this.closeModal('taskDetailsModal');
        this.showTaskDetails(taskId); // Odśwież
      }
    } catch (e) {
      alert('Błąd uploadu: ' + e.message);
    }
  }

  renderTicketsTab() {
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserRole = currentUserData.user_role || currentUserData.role || 'client';
    const isAdmin = currentUserRole === 'admin';
    
    return `
      <div class="tickets-container">
        <div class="tickets-header">
          <h3>🎟️ Tickety HR/IT</h3>
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
              <div class="ticket-card status-${(t.status || 'nowy').toLowerCase().replace(/\s+/g, '-')}">
                <div class="ticket-header">
                  <span class="ticket-number">${t.ticket_number}</span>
                  <span class="ticket-status badge-${this.getTicketStatusClass(t.status || 'Nowy')}">${t.status || 'Nowy'}</span>
                </div>
                <h4>${t.title || 'Bez tytułu'}</h4>
                <div class="ticket-meta">
                  <span>📂 ${t.ticket_type || 'Inne'}</span>
                  <span>🏢 ${t.department || 'N/A'}</span>
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
            <p>🎟️ Brak ticketów</p>
            ${!isAdmin ? '<p>Kliknij "+ Nowy Ticket" aby zgłosić problem lub potrzebę</p>' : ''}
          </div>
        `}
      </div>
    `;
  }

  renderReviewsTab() {
    // Get current user from localStorage
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserRole = currentUserData.user_role || currentUserData.role || 'client';
    
    // Filtruj oceny
    const filteredReviews = this.getFilteredReviews();
    
    return `
      <div class="reviews-container">
        <div class="reviews-header">
          <h3>⭐ Oceny</h3>
          ${currentUserRole === 'admin' ? `
            <button class="btn-success btn-small" onclick="employeeDashboard.showAddReviewModal()">+ Dodaj</button>
          ` : ''}
        </div>
        
        <!-- Panel filtrów ocen -->
        <div class="filters-panel">
          <div class="filter-group">
            <label>🔍 Szukaj</label>
            <input type="text" placeholder="Szukaj w ocenach..." 
              value="${this.filters.reviews.search}"
              oninput="employeeDashboard.updateFilter('reviews', 'search', this.value)">
          </div>
          <button class="btn-secondary btn-small" onclick="employeeDashboard.clearFilters('reviews')">🔄 Wyczyść</button>
        </div>
        
        ${filteredReviews.length > 0 ? `
          <div class="reviews-list">
            ${filteredReviews.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <strong>${r.review_type}</strong>
                  <span>⭐ ${r.rating}/5</span>
                  <span>${this.formatDate(r.created_at)}</span>
                </div>
                <p>Oceniający: ${r.reviewer_name}</p>
                ${r.strengths ? `<div><strong>✅ Mocne strony:</strong><p>${r.strengths}</p></div>` : ''}
                ${r.recommendations ? `<div><strong>🎯 Rekomendacje:</strong><p>${r.recommendations}</p></div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : `<div class="empty-state"><p>⭐ Brak ocen spełniających kryteria</p></div>`}
      </div>
    `;
  }

  renderReportsTab() {
    if (!this.monthlyReports || this.monthlyReports.length === 0) {
      return `
        <div class="empty-state">
          <h3>📁 Brak raportów miesięcznych</h3>
          <p>Raporty są generowane automatycznie ostatniego dnia każdego miesiąca.</p>
          <p>Pierwszy raport pojawi się po zakończeniu bieżącego miesiąca.</p>
        </div>
      `;
    }

    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    return `
      <div class="reports-container">
        <div class="reports-header">
          <h3>📁 Archiwum raportów miesięcznych</h3>
          <p>Raporty są generowane automatycznie ostatniego dnia miesiąca o 23:55</p>
        </div>
        
        <div class="reports-grid">
          ${this.monthlyReports.map(report => `
            <div class="report-card" onclick="employeeDashboard.showReportDetails(${report.report_year}, ${report.report_month})">
              <div class="report-header">
                <h4>📊 ${monthNames[report.report_month - 1]} ${report.report_year}</h4>
                <span class="report-status ${report.status}">${report.status === 'generated' ? '✅ Wygenerowany' : '⏳ W trakcie'}</span>
              </div>
              
              <div class="report-stats-grid">
                <div class="report-stat">
                  <span class="stat-icon">⏰</span>
                  <div>
                    <div class="stat-value">${this.formatDecimalHours(report.total_work_hours || 0)}</div>
                    <div class="stat-label">Czas pracy</div>
                  </div>
                </div>
                
                <div class="report-stat">
                  <span class="stat-icon">🔐</span>
                  <div>
                    <div class="stat-value">${report.total_login_sessions || 0}</div>
                    <div class="stat-label">Logowań</div>
                  </div>
                </div>
                
                <div class="report-stat">
                  <span class="stat-icon">⚖️</span>
                  <div>
                    <div class="stat-value">${report.total_cases || 0}</div>
                    <div class="stat-label">Spraw</div>
                  </div>
                </div>
                
                <div class="report-stat">
                  <span class="stat-icon">👥</span>
                  <div>
                    <div class="stat-value">${report.total_clients || 0}</div>
                    <div class="stat-label">Klientów</div>
                  </div>
                </div>
                
                <div class="report-stat">
                  <span class="stat-icon">✅</span>
                  <div>
                    <div class="stat-value">${report.completed_tasks || 0}/${report.total_tasks || 0}</div>
                    <div class="stat-label">Zadań</div>
                  </div>
                </div>
                
                <div class="report-stat">
                  <span class="stat-icon">⭐</span>
                  <div>
                    <div class="stat-value">${report.avg_rating ? report.avg_rating.toFixed(1) : 'N/A'}</div>
                    <div class="stat-label">Ocena</div>
                  </div>
                </div>
              </div>
              
              <div class="report-footer">
                <small>Wygenerowano: ${new Date(report.generated_at).toLocaleString('pl-PL')}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async showReportDetails(year, month) {
    try {
      const response = await window.api.request(`/employees/${this.userId}/monthly-reports/${year}/${month}`);
      const report = response.report;
      
      const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                          'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
      
      // Otwórz modal ze szczegółami
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
          <div class="modal-header">
            <h2>📊 Raport miesięczny - ${monthNames[month - 1]} ${year}</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          
          <div class="modal-body">
            <h3>⏰ Czas pracy</h3>
            <div class="report-stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
              <div class="stat-box">
                <div class="stat-value">${this.formatDecimalHours(report.total_work_hours || 0)}</div>
                <div class="stat-label">Łączny czas</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${report.total_login_sessions || 0}</div>
                <div class="stat-label">Sesji</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${this.formatDecimalHours(report.avg_session_duration || 0)}</div>
                <div class="stat-label">Średnia sesja</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${report.total_work_hours ? Math.round(report.total_work_hours / 8) : 0}</div>
                <div class="stat-label">Dni roboczych</div>
              </div>
            </div>
            
            <h3>📊 Statystyki</h3>
            <div class="report-stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;">
              <div class="stat-box">
                <div class="stat-value">${report.total_cases || 0}</div>
                <div class="stat-label">Spraw</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${report.total_clients || 0}</div>
                <div class="stat-label">Klientów</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${report.completed_tasks || 0}/${report.total_tasks || 0}</div>
                <div class="stat-label">Zadań ukończonych</div>
              </div>
            </div>
            
            ${report.activity_summary && report.activity_summary.length > 0 ? `
              <h3>📋 Aktywność</h3>
              <table style="width: 100%; margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th>Kategoria</th>
                    <th style="text-align: right;">Liczba akcji</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.activity_summary.map(a => `
                    <tr>
                      <td>${a.action_category || 'Inne'}</td>
                      <td style="text-align: right;">${a.count}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            
            <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
              <small><strong>Wygenerowano:</strong> ${new Date(report.generated_at).toLocaleString('pl-PL')}</small>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Zamknij</button>
            <button class="btn-primary" onclick="employeeDashboard.exportReportToPDF(${year}, ${month})">📄 Eksportuj PDF</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
    } catch (error) {
      console.error('❌ Błąd pobierania szczegółów raportu:', error);
      alert('Błąd pobierania szczegółów raportu');
    }
  }

  exportReportToPDF(year, month) {
    // TODO: Implementacja eksportu raportu do PDF
    alert(`Eksport raportu ${year}-${month} do PDF - funkcja w budowie`);
  }

  // Helpers
  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
    
    // Jeśli przełączamy się na zakładkę Statystyki, zainicjuj wykresy
    if (tabName === 'statistics') {
      this.initCharts();
    }
    
    // Jeśli przełączamy się na zakładkę Finanse, załaduj historię wypłat i prowizje
    if (tabName === 'financial') {
      this.loadSalaryHistory();
      this.loadEmployeeCommissions();
    }
  }

  getRoleLabel(role) {
    const labels = {
      admin: '👑 Administrator',
      lawyer: '👔 Mecenas',
      case_manager: '📋 Opiekun sprawy',
      client_manager: '👤 Opiekun klienta',
      reception: '📞 Recepcja',
      client: '🤝 Klient'
    };
    return labels[role] || role;
  }

  calculateTenure(hireDate) {
    const now = new Date();
    const hire = new Date(hireDate);
    const months = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return years > 0 ? `${years}l ${remainingMonths}m` : `${remainingMonths}m`;
  }

  getTodayHours() {
    const today = this.loginHistory.filter(s => {
      let loginTimeStr = s.login_time;
      // Parsuj jako lokalny czas (nie UTC)
      if (loginTimeStr && loginTimeStr.includes(' ')) {
        loginTimeStr = loginTimeStr.replace(' ', 'T');
      }
      const loginDate = new Date(loginTimeStr).toDateString();
      return loginDate === new Date().toDateString();
    });
    const total = today.reduce((sum, s) => {
      let loginTimeStr = s.login_time;
      let logoutTimeStr = s.logout_time;
      if (loginTimeStr && loginTimeStr.includes(' ')) {
        loginTimeStr = loginTimeStr.replace(' ', 'T');
      }
      if (logoutTimeStr && logoutTimeStr.includes(' ')) {
        logoutTimeStr = logoutTimeStr.replace(' ', 'T');
      }
      const loginTime = new Date(loginTimeStr);
      const logoutTime = logoutTimeStr ? new Date(logoutTimeStr) : new Date();
      const diffSeconds = Math.floor((logoutTime - loginTime) / 1000);
      return sum + diffSeconds;
    }, 0);
    return parseFloat((total / 3600).toFixed(2));
  }

  getWeekHours() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const week = this.loginHistory.filter(s => {
      let loginTimeStr = s.login_time;
      // Parsuj jako lokalny czas (nie UTC)
      if (loginTimeStr && loginTimeStr.includes(' ')) {
        loginTimeStr = loginTimeStr.replace(' ', 'T');
      }
      return new Date(loginTimeStr) >= weekAgo;
    });
    const total = week.reduce((sum, s) => {
      let loginTimeStr = s.login_time;
      let logoutTimeStr = s.logout_time;
      if (loginTimeStr && loginTimeStr.includes(' ')) {
        loginTimeStr = loginTimeStr.replace(' ', 'T');
      }
      if (logoutTimeStr && logoutTimeStr.includes(' ')) {
        logoutTimeStr = logoutTimeStr.replace(' ', 'T');
      }
      const loginTime = new Date(loginTimeStr);
      const logoutTime = logoutTimeStr ? new Date(logoutTimeStr) : new Date();
      const diffSeconds = Math.floor((logoutTime - loginTime) / 1000);
      return sum + diffSeconds;
    }, 0);
    return parseFloat((total / 3600).toFixed(2));
  }

  getAverageRating() {
    if (this.reviews.length === 0) return 'N/A';
    const avg = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    return avg.toFixed(1);
  }

  formatDate(dateString) {
    let timeStr = dateString;
    if (timeStr && !timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-')) {
      timeStr = timeStr.replace(' ', 'T') + 'Z';
    }
    return new Date(timeStr).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' });
  }

  formatTime(dateString) {
    if (!dateString) return '-';
    
    // SQLite na Windows zapisuje w CZASIE LOKALNYM (nie UTC!)
    // Parsujemy jako lokalny czas i formatujemy
    let timeStr = dateString;
    
    // Zamień spację na 'T' ale NIE dodawaj 'Z' (nie jest UTC)
    if (timeStr.includes(' ')) {
      timeStr = timeStr.replace(' ', 'T');
    }
    
    // Parsuj jako lokalny czas (bez 'Z')
    const date = new Date(timeStr);
    
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date:', dateString);
      return 'Błąd';
    }
    
    // Formatuj godzinę i minutę
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  formatDateTime(dateString) {
    return `${this.formatDate(dateString)} ${this.formatTime(dateString)}`;
  }

  formatDuration(seconds) {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Konwertuje dziesiętne godziny (np. 3.8) na format "3h 48m"
  formatDecimalHours(decimalHours) {
    if (!decimalHours || decimalHours === 0) return '0h 0m';
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }

  formatSessionDuration(session) {
    // SQLite zapisuje w czasie lokalnym (nie UTC)
    let loginTimeStr = session.login_time;
    let logoutTimeStr = session.logout_time;
    
    // Zamień spację na 'T' ale NIE dodawaj 'Z' (to nie jest UTC)
    if (loginTimeStr && loginTimeStr.includes(' ')) {
      loginTimeStr = loginTimeStr.replace(' ', 'T');
    }
    if (logoutTimeStr && logoutTimeStr.includes(' ')) {
      logoutTimeStr = logoutTimeStr.replace(' ', 'T');
    }
    
    const loginTime = new Date(loginTimeStr);
    const logoutTime = logoutTimeStr ? new Date(logoutTimeStr) : new Date();
    
    // Oblicz różnicę w milisekundach
    const diffMs = logoutTime - loginTime;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 0) return 'Błąd';
    
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }

  // MODAL: Przypisz zadanie
  async showAssignTaskModal() {
    // Pobierz listę spraw
    let casesOptions = '<option value="">-- Brak powiązania --</option>';
    try {
      const casesResponse = await window.api.request('/cases');
      if (casesResponse.cases && casesResponse.cases.length > 0) {
        casesOptions += casesResponse.cases.map(c => 
          `<option value="${c.id}">${c.case_number} - ${c.title}</option>`
        ).join('');
      }
    } catch (e) {
      console.warn('Nie udało się pobrać listy spraw:', e);
    }

    // Pobierz listę pracowników
    let employeesOptions = '';
    try {
      const empResponse = await window.api.request('/employees/list');
      if (empResponse.employees && empResponse.employees.length > 0) {
        employeesOptions = empResponse.employees.map(e => 
          `<option value="${e.id}" ${e.id === this.userId ? 'selected' : ''}>${e.name} (${e.role})</option>`
        ).join('');
      }
    } catch (e) {
      console.warn('Nie udało się pobrać listy pracowników:', e);
      employeesOptions = `<option value="${this.userId}">Aktualny pracownik</option>`;
    }

    const modalHtml = `
      <div class="modal-overlay" id="assignTaskModal" style="z-index: 99999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.7) !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: auto !important;" onclick="if(event.target === this) employeeDashboard.closeModal('assignTaskModal')">
        <div class="modal-content modal-medium" style="z-index: 100000 !important; position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; margin: 0 !important; max-width: 90vw !important; max-height: 90vh !important; overflow: auto !important;">
          <div class="modal-header">
            <h3>🎫 Nowe zadanie</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('assignTaskModal')">×</button>
          </div>
          <form id="assignTaskForm" onsubmit="employeeDashboard.submitAssignTask(event)" enctype="multipart/form-data">
            <div class="form-row">
              <div class="form-group">
                <label>👤 Wykonawca *</label>
                <select name="assigned_to" required>
                  ${employeesOptions}
                </select>
              </div>
              ${this.isAdminOrHR ? `
              <div class="form-group">
                <label>👔 Zleceniodawca</label>
                <select name="assigned_by">
                  ${employeesOptions.replace(`value="${this.userId}" selected`, `value="${this.userId}"`).replace(`value="${window.currentUser?.id}"`, `value="${window.currentUser?.id}" selected`)}
                </select>
              </div>
              ` : `
              <input type="hidden" name="assigned_by" value="${window.currentUser?.id || this.userId}">
              `}
            </div>
            <div class="form-group">
              <label>Tytuł zadania *</label>
              <input type="text" name="title" required maxlength="200" placeholder="Np. Przygotuj dokumenty do sprawy X">
            </div>
            <div class="form-group">
              <label>Opis</label>
              <textarea name="description" rows="3" placeholder="Szczegółowy opis zadania..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Priorytet</label>
                <select name="priority">
                  <option value="low">🟢 Niski</option>
                  <option value="medium" selected>🟡 Średni</option>
                  <option value="high">🔴 Wysoki</option>
                </select>
              </div>
              <div class="form-group">
                <label>Termin</label>
                <input type="date" name="due_date">
              </div>
            </div>
            <div class="form-group">
              <label>📁 Powiązana sprawa</label>
              <select name="case_id">
                ${casesOptions}
              </select>
            </div>
            <div class="form-group">
              <label>📎 Załączniki (max 10MB każdy)</label>
              <input type="file" name="attachments" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" style="padding: 10px; border: 2px dashed #ddd; border-radius: 8px; width: 100%; cursor: pointer;">
              <small style="color: #666;">PDF, DOC, XLS, obrazy, ZIP</small>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="employeeDashboard.closeModal('assignTaskModal')">Anuluj</button>
              <button type="submit" class="btn-primary">✅ Utwórz zadanie</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => document.getElementById('assignTaskModal').classList.add('active'), 10);
  }

  async submitAssignTask(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable button podczas zapisu
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Zapisywanie...';
    }
    
    const assignedTo = parseInt(formData.get('assigned_to')) || this.userId;
    const assignedBy = parseInt(formData.get('assigned_by')) || (window.currentUser?.id || this.userId);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      due_date: formData.get('due_date') || null,
      case_id: formData.get('case_id') || null,
      assigned_by: assignedBy
    };
    
    // Pobierz pliki
    const files = form.querySelector('input[name="attachments"]')?.files;
    
    try {
      // 1. Utwórz zadanie
      const response = await window.api.request(`/employees/${assignedTo}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.success) {
        const taskId = response.task_id;
        
        // 2. Upload załączników jeśli są
        if (files && files.length > 0) {
          for (const file of files) {
            const fileForm = new FormData();
            fileForm.append('file', file);
            
            try {
              await fetch(`${window.api.baseURL}/employees/tasks/${taskId}/attachments`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: fileForm
              });
            } catch (e) {
              console.warn('Błąd uploadu pliku:', file.name, e);
            }
          }
        }
        
        this.closeModal('assignTaskModal');
        
        // Odśwież zadania
        try {
          const tasksResponse = await window.api.request(`/employees/${this.userId}/tasks`);
          if (tasksResponse.tasks) {
            this.tasks = tasksResponse.tasks;
            this.taskStats = tasksResponse.stats || { total: 0, pending: 0, in_progress: 0, completed: 0 };
          }
          this.switchTab('tasks');
        } catch (e) {
          console.warn('Błąd odświeżania zadań:', e);
        }
        
        alert(`✅ Zadanie ${response.task_number || ''} zostało utworzone!`);
      }
    } catch (error) {
      console.error('❌ Błąd tworzenia zadania:', error);
      alert('Błąd: ' + error.message);
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Utwórz zadanie';
      }
    }
  }

  // MODAL: Dodaj ocenę
  showAddReviewModal() {
    const modalHtml = `
      <div class="modal-overlay" id="addReviewModal" style="z-index: 99999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.7) !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: auto !important;" onclick="if(event.target === this) employeeDashboard.closeModal('addReviewModal')">
        <div class="modal-content modal-large" style="z-index: 100000 !important; position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; margin: 0 !important; max-width: 90vw !important; max-height: 90vh !important; overflow: auto !important;">
          <div class="modal-header">
            <h3>⭐ Dodaj ocenę pracownika</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('addReviewModal')">×</button>
          </div>
          <form id="addReviewForm" onsubmit="employeeDashboard.submitAddReview(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Typ oceny *</label>
                <select name="review_type" required>
                  <option value="">-- Wybierz --</option>
                  <option value="quarterly">Ocena kwartalna</option>
                  <option value="annual">Ocena roczna</option>
                  <option value="project">Ocena projektowa</option>
                  <option value="performance">Ocena wydajności</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ocena (1-5) *</label>
                <select name="rating" required>
                  <option value="">-- Wybierz --</option>
                  <option value="5">⭐⭐⭐⭐⭐ Doskonały</option>
                  <option value="4">⭐⭐⭐⭐ Bardzo dobry</option>
                  <option value="3">⭐⭐⭐ Dobry</option>
                  <option value="2">⭐⭐ Wymaga poprawy</option>
                  <option value="1">⭐ Niewystarczający</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>✅ Mocne strony</label>
              <textarea name="strengths" rows="3" placeholder="Co pracownik robi dobrze?"></textarea>
            </div>
            <div class="form-group">
              <label>⚠️ Obszary do poprawy</label>
              <textarea name="weaknesses" rows="3" placeholder="Co wymaga poprawy?"></textarea>
            </div>
            <div class="form-group">
              <label>🎯 Rekomendacje</label>
              <textarea name="recommendations" rows="3" placeholder="Sugestie rozwoju, szkolenia, cele..."></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="employeeDashboard.closeModal('addReviewModal')">Anuluj</button>
              <button type="submit" class="btn-success">⭐ Dodaj ocenę</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => document.getElementById('addReviewModal').classList.add('active'), 10);
  }

  async submitAddReview(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
      review_type: formData.get('review_type'),
      rating: parseFloat(formData.get('rating')),
      strengths: formData.get('strengths'),
      weaknesses: formData.get('weaknesses'),
      recommendations: formData.get('recommendations')
    };
    
    try {
      const response = await window.api.request(`/employees/${this.userId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.success) {
        alert('✅ Ocena została dodana!');
        this.closeModal('addReviewModal');
        await this.loadData();
        await this.render();
      }
    } catch (error) {
      console.error('❌ Błąd dodawania oceny:', error);
      alert('Błąd: ' + error.message);
    }
  }

  // MODAL: Edytuj profil
  editProfile() {
    const profile = this.profileData.profile || {};
    const user = this.profileData.user;
    
    const modalHtml = `
      <div class="modal-overlay" id="editProfileModal" style="z-index: 99999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.7) !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: auto !important;" onclick="if(event.target === this) employeeDashboard.closeModal('editProfileModal')">
        <div class="modal-content modal-large" style="z-index: 100000 !important; position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; margin: 0 !important; max-width: 90vw !important; max-height: 90vh !important; overflow: auto !important;">
          <div class="modal-header">
            <h3>✏️ Edytuj profil: ${user.name}</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('editProfileModal')">×</button>
          </div>
          <form id="editProfileForm" onsubmit="employeeDashboard.submitEditProfile(event)">
            <div class="form-row">
              <div class="form-group">
                <label>📞 Telefon</label>
                <input type="tel" name="phone" value="${profile.phone || ''}" placeholder="+48 123 456 789">
              </div>
              <div class="form-group">
                <label>📌 Stanowisko</label>
                <input type="text" name="position" value="${profile.position || ''}" placeholder="Np. Senior Lawyer">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>🏢 Departament</label>
                <input type="text" name="department" value="${profile.department || ''}" placeholder="Np. Prawo Cywilne">
              </div>
              <div class="form-group">
                <label>📅 Data zatrudnienia</label>
                <input type="date" name="hire_date" value="${profile.hire_date || ''}">
              </div>
            </div>
            <div class="form-group">
              <label>🖼️ URL avatara</label>
              <input type="url" name="avatar_url" value="${profile.avatar_url || ''}" placeholder="https://...">
            </div>
            <div class="form-group">
              <label>📝 Bio</label>
              <textarea name="bio" rows="4" placeholder="Krótki opis pracownika...">${profile.bio || ''}</textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="employeeDashboard.closeModal('editProfileModal')">Anuluj</button>
              <button type="submit" class="btn-primary">💾 Zapisz zmiany</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => document.getElementById('editProfileModal').classList.add('active'), 10);
  }

  async submitEditProfile(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
      phone: formData.get('phone'),
      position: formData.get('position'),
      department: formData.get('department'),
      hire_date: formData.get('hire_date'),
      avatar_url: formData.get('avatar_url'),
      bio: formData.get('bio')
    };
    
    try {
      const response = await window.api.request(`/employees/${this.userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      if (response.success) {
        alert('✅ Profil został zaktualizowany!');
        this.closeModal('editProfileModal');
        await this.loadData();
        await this.render();
      }
    } catch (error) {
      console.error('❌ Błąd aktualizacji profilu:', error);
      alert('Błąd: ' + error.message);
    }
  }

  // ZAKŁADKA: Statystyki z wykresami
  renderStatisticsTab() {
    return `
      <div class="statistics-container">
        <h3>📊 Statystyki i wykresy</h3>
        <div class="charts-grid">
          <div class="chart-card">
            <h4>⏰ Godziny pracy (ostatnie 30 dni)</h4>
            <canvas id="hoursChart" width="400" height="200"></canvas>
          </div>
          <div class="chart-card">
            <h4>📈 Wydajność zadań</h4>
            <canvas id="tasksChart" width="400" height="200"></canvas>
          </div>
          <div class="chart-card">
            <h4>📋 Aktywność według kategorii</h4>
            <canvas id="activityChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  // Inicjalizuj wykresy po renderowaniu
  initCharts() {
    // Czekaj na załadowanie Chart.js
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js nie jest załadowany!');
      return;
    }

    setTimeout(() => {
      this.initHoursChart();
      this.initTasksChart();
      this.initActivityChart();
    }, 100);
  }

  // Wykres 1: Godziny pracy
  initHoursChart() {
    const canvas = document.getElementById('hoursChart');
    if (!canvas) return;

    // Przygotuj dane - ostatnie 30 dni
    const last30Days = [];
    const hoursData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last30Days.push(date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }));
      
      // Oblicz godziny dla danego dnia
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const daySessions = this.loginHistory.filter(s => {
        const loginDate = new Date(s.login_time);
        return loginDate >= dayStart && loginDate <= dayEnd;
      });
      
      const totalSeconds = daySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      hoursData.push((totalSeconds / 3600).toFixed(1));
    }

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: last30Days,
        datasets: [{
          label: 'Godziny pracy',
          data: hoursData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Godziny' }
          }
        }
      }
    });
  }

  // Wykres 2: Wydajność zadań
  initTasksChart() {
    const canvas = document.getElementById('tasksChart');
    if (!canvas) return;

    const pending = (this.tasks?.pending || []).length;
    const inProgress = (this.tasks?.in_progress || []).length;
    const completed = (this.tasks?.completed || []).length;
    const cancelled = (this.tasks?.cancelled || []).length;

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Do zrobienia', 'W trakcie', 'Ukończone', 'Anulowane'],
        datasets: [{
          data: [pending, inProgress, completed, cancelled],
          backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Wykres 3: Aktywność według kategorii
  initActivityChart() {
    const canvas = document.getElementById('activityChart');
    if (!canvas) return;

    // Zlicz aktywności według kategorii
    const categories = {};
    this.activityData.forEach(a => {
      const cat = a.action_category || 'inne';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Liczba akcji',
          data: data,
          backgroundColor: colors.slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }

  // ============================================
  // FILTRY & WYSZUKIWANIE
  // ============================================
  
  updateFilter(tab, filterName, value) {
    this.filters[tab][filterName] = value;
    this.refreshCurrentTab();
  }
  
  clearFilters(tab) {
    if (tab === 'activity') {
      this.filters.activity = { category: 'all', search: '', dateFrom: '', dateTo: '' };
    } else if (tab === 'tasks') {
      this.filters.tasks = { status: 'all', search: '' };
    } else if (tab === 'reviews') {
      this.filters.reviews = { search: '' };
    }
    this.refreshCurrentTab();
  }
  
  refreshCurrentTab() {
    // Znajdź aktywną zakładkę
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
      const tabName = activeTab.dataset.tab;
      // Odśwież tylko zawartość zakładki
      const tabContent = document.getElementById(`tab-${tabName}`);
      if (tabContent) {
        if (tabName === 'activity') {
          tabContent.innerHTML = this.renderActivityTab();
        } else if (tabName === 'tasks') {
          tabContent.innerHTML = this.renderTasksTab();
        } else if (tabName === 'reviews') {
          tabContent.innerHTML = this.renderReviewsTab();
        }
      }
    }
  }
  
  getFilteredActivity() {
    let filtered = [...this.activityData];
    const f = this.filters.activity;
    
    // Filtruj po kategorii
    if (f.category !== 'all') {
      filtered = filtered.filter(a => a.action_category === f.category);
    }
    
    // Filtruj po wyszukiwaniu
    if (f.search) {
      const search = f.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.description?.toLowerCase().includes(search) ||
        a.action_type?.toLowerCase().includes(search)
      );
    }
    
    // Filtruj po dacie OD
    if (f.dateFrom) {
      const fromDate = new Date(f.dateFrom);
      filtered = filtered.filter(a => new Date(a.created_at) >= fromDate);
    }
    
    // Filtruj po dacie DO
    if (f.dateTo) {
      const toDate = new Date(f.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.created_at) <= toDate);
    }
    
    return filtered;
  }
  
  getFilteredTasks() {
    // Zbierz wszystkie zadania
    const allTasks = [
      ...(this.tasks?.pending || []),
      ...(this.tasks?.in_progress || []),
      ...(this.tasks?.completed || []),
      ...(this.tasks?.cancelled || [])
    ];
    
    let filtered = [...allTasks];
    const f = this.filters.tasks;
    
    // Filtruj po statusie
    if (f.status !== 'all') {
      filtered = filtered.filter(t => t.status === f.status);
    }
    
    // Filtruj po wyszukiwaniu
    if (f.search) {
      const search = f.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }
  
  getFilteredReviews() {
    let filtered = [...this.reviews];
    const f = this.filters.reviews;
    
    // Filtruj po wyszukiwaniu
    if (f.search) {
      const search = f.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.review_type?.toLowerCase().includes(search) ||
        r.strengths?.toLowerCase().includes(search) ||
        r.recommendations?.toLowerCase().includes(search) ||
        r.reviewer_name?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }
  
  getFilteredTickets() {
    // Zbierz wszystkie tickety
    const allTickets = Array.isArray(this.tickets) ? this.tickets : [];
    
    let filtered = [...allTickets];
    const f = this.filters.tickets || {};
    
    // Filtruj po statusie
    if (f.status && f.status !== 'all') {
      filtered = filtered.filter(t => t.status === f.status);
    }
    
    // Filtruj po wyszukiwaniu
    if (f.search) {
      const search = f.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(search) ||
        t.ticket_type?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  // ============================================
  // DRAG & DROP + REAL-TIME
  // ============================================
  
  handleDragStart(event) {
    const taskId = event.target.dataset.taskId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('taskId', taskId);
    event.target.style.opacity = '0.5';
  }
  
  handleDragEnd(event) {
    event.target.style.opacity = '1';
  }
  
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Visual feedback
    const column = event.currentTarget;
    column.style.background = 'rgba(33, 150, 243, 0.1)';
  }
  
  async handleDrop(event) {
    event.preventDefault();
    
    const column = event.currentTarget;
    column.style.background = '';
    
    const taskId = event.dataTransfer.getData('taskId');
    const newStatus = column.dataset.status;
    
    if (!taskId || !newStatus) return;
    
    try {
      console.log(`🔄 Przenoszenie zadania ${taskId} do statusu: ${newStatus}`);
      
      // Wyślij żądanie aktualizacji
      await window.api.request(`/employees/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Odśwież dane
      await this.loadData();
      this.refreshCurrentTab();
      
      console.log('✅ Zadanie przeniesione!');
    } catch (error) {
      console.error('❌ Błąd przenoszenia zadania:', error);
      alert('Błąd przy przenoszeniu zadania');
    }
  }
  
  // Auto-refresh
  startAutoRefresh(intervalSeconds = 30) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(async () => {
      if (this.autoRefreshEnabled) {
        console.log('🔄 Auto-refresh danych...');
        await this.loadData();
        this.refreshCurrentTab();
      }
    }, intervalSeconds * 1000);
    
    console.log(`✅ Auto-refresh włączony (co ${intervalSeconds}s)`);
  }
  
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏸️ Auto-refresh wyłączony');
    }
  }
  
  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    const status = this.autoRefreshEnabled ? 'włączony' : 'wyłączony';
    console.log(`🔄 Auto-refresh: ${status}`);
  }

  // ============================================
  // EXPORT PDF / CSV
  // ============================================
  
  exportToCSV() {
    const user = this.profileData.user;
    const profile = this.profileData.profile || {};
    const stats = this.profileData.stats || {};
    
    // Nagłówek CSV
    let csv = 'Employee Dashboard Export\n\n';
    
    // Informacje podstawowe
    csv += 'EMPLOYEE INFORMATION\n';
    csv += `Name,${user.name}\n`;
    csv += `Email,${user.email}\n`;
    csv += `Role,${user.user_role}\n`;
    csv += `Position,${profile.position || 'N/A'}\n`;
    csv += `Department,${profile.department || 'N/A'}\n`;
    csv += `Hire Date,${profile.hire_date || 'N/A'}\n\n`;
    
    // Statystyki
    csv += 'STATISTICS\n';
    csv += `Total Cases,${stats.total_cases || 0}\n`;
    csv += `Completed Cases,${stats.completed_cases || 0}\n`;
    csv += `Total Tasks,${stats.total_tasks || 0}\n`;
    csv += `Completed Tasks,${stats.completed_tasks || 0}\n`;
    csv += `Average Rating,${this.getAverageRating()}\n`;
    csv += `Total Hours This Month,${this.loginStats.total_hours_this_month || 0}\n\n`;
    
    // Aktywności
    csv += 'RECENT ACTIVITY\n';
    csv += 'Date,Description,Category\n';
    this.activityData.slice(0, 50).forEach(a => {
      const date = new Date(a.created_at).toLocaleString('pl-PL');
      csv += `"${date}","${a.description}","${a.action_category || 'N/A'}"\n`;
    });
    csv += '\n';
    
    // Zadania
    csv += 'TASKS\n';
    csv += 'Status,Title,Priority,Due Date,Description\n';
    const allTasks = [
      ...(this.tasks?.pending || []),
      ...(this.tasks?.in_progress || []),
      ...(this.tasks?.completed || [])
    ];
    allTasks.forEach(t => {
      csv += `"${t.status}","${t.title}","${t.priority}","${t.due_date || 'N/A'}","${t.description || ''}"\n`;
    });
    csv += '\n';
    
    // Oceny
    csv += 'REVIEWS\n';
    csv += 'Date,Type,Rating,Reviewer,Strengths,Recommendations\n';
    this.reviews.forEach(r => {
      const date = new Date(r.created_at).toLocaleDateString('pl-PL');
      csv += `"${date}","${r.review_type}","${r.rating}","${r.reviewer_name}","${r.strengths || ''}","${r.recommendations || ''}"\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employee_dashboard_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    console.log('✅ CSV exported!');
  }
  
  exportToPDF() {
    const user = this.profileData.user;
    const profile = this.profileData.profile || {};
    const stats = this.profileData.stats || {};
    
    // Otwórz nowe okno z raportem
    const printWindow = window.open('', '_blank');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Dashboard - ${user.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #3B82F6; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; margin: 20px 0; text-align: center; }
          .info-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #3B82F6; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .stat-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>📊 Employee Dashboard Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString('pl-PL')}</p>
        
        <h2>👤 Employee Information</h2>
        <div class="info-grid">
          <div class="info-label">Name:</div><div>${user.name}</div>
          <div class="info-label">Email:</div><div>${user.email}</div>
          <div class="info-label">Role:</div><div>${user.user_role}</div>
          <div class="info-label">Position:</div><div>${profile.position || 'N/A'}</div>
          <div class="info-label">Department:</div><div>${profile.department || 'N/A'}</div>
          <div class="info-label">Hire Date:</div><div>${profile.hire_date || 'N/A'}</div>
        </div>
        
        <h2>📊 Statistics</h2>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${stats.total_cases || 0}</div>
            <div class="stat-label">Total Cases</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.total_tasks || 0}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.getAverageRating()}</div>
            <div class="stat-label">Avg Rating</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.completed_cases || 0}</div>
            <div class="stat-label">Completed Cases</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.completed_tasks || 0}</div>
            <div class="stat-label">Completed Tasks</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.formatDecimalHours(this.loginStats.total_hours_this_month || 0)}</div>
            <div class="stat-label">Hours This Month</div>
          </div>
        </div>
        
        <h2>⏰ Login History & Work Time</h2>
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
          <div class="stat-box">
            <div class="stat-value">${this.formatDecimalHours(this.getTodayHours())}</div>
            <div class="stat-label">Today</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.formatDecimalHours(this.getWeekHours())}</div>
            <div class="stat-label">This Week</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.formatDecimalHours(this.loginStats.total_hours_this_month || 0)}</div>
            <div class="stat-label">This Month</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.formatDecimalHours(this.loginStats.avg_duration_hours || 0)}</div>
            <div class="stat-label">Average Session</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr><th>Date</th><th>Login</th><th>Logout</th><th>Duration</th><th>IP Address</th></tr>
          </thead>
          <tbody>
            ${this.loginHistory.slice(0, 20).map(s => `
              <tr>
                <td>${this.formatDate(s.login_time)}</td>
                <td>${this.formatTime(s.login_time)}</td>
                <td>${s.logout_time ? this.formatTime(s.logout_time) : '🟢 Active'}</td>
                <td>${this.formatSessionDuration(s)}</td>
                <td>${s.ip_address || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>📋 Recent Activity (Last 20)</h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th></tr>
          </thead>
          <tbody>
            ${this.activityData.slice(0, 20).map(a => `
              <tr>
                <td>${new Date(a.created_at).toLocaleString('pl-PL')}</td>
                <td>${a.description}</td>
                <td>${a.action_category || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>🎫 Tasks Summary</h2>
        <table>
          <thead>
            <tr><th>Status</th><th>Title</th><th>Priority</th><th>Due Date</th></tr>
          </thead>
          <tbody>
            ${[...(this.tasks?.pending || []), ...(this.tasks?.in_progress || []), ...(this.tasks?.completed || [])].slice(0, 15).map(t => `
              <tr>
                <td>${t.status}</td>
                <td>${t.title}</td>
                <td>${t.priority}</td>
                <td>${t.due_date ? new Date(t.due_date).toLocaleDateString('pl-PL') : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>⭐ Reviews</h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Rating</th><th>Reviewer</th></tr>
          </thead>
          <tbody>
            ${this.reviews.map(r => `
              <tr>
                <td>${new Date(r.created_at).toLocaleDateString('pl-PL')}</td>
                <td>${r.review_type}</td>
                <td>${r.rating}/5</td>
                <td>${r.reviewer_name}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="no-print" style="margin-top: 40px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 30px; background: #3B82F6; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🖨️ Print / Save as PDF</button>
          <button onclick="window.close()" style="padding: 10px 30px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">✕ Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    console.log('✅ PDF report opened!');
  }

  // Helper: Status class dla ticketów
  getTicketStatusClass(status) {
    switch(status) {
      case 'Nowy': return 'new';
      case 'W realizacji': return 'progress';
      case 'Zakończony': return 'success';
      default: return 'default';
    }
  }

  // Modal tworzenia ticketu - rozszerzony o wszystkie formularze HR
  showCreateTicketModal() {
    const html = `
      <div class="modal active" id="createTicketModal">
        <div class="modal-content" style="max-width: 700px;">
          <div class="modal-header">
            <h3>🎟️ Nowy Wniosek / Ticket</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('createTicketModal')">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Kategorie wniosków -->
            <div id="ticketCategorySelection" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
              <div style="grid-column: span 2; font-weight: 600; color: #10B981; margin-bottom: 5px;">💰 Finanse / Księgowość</div>
              <button type="button" onclick="employeeDashboard.showTicketForm('expense')" style="padding: 12px; border: 2px solid #10B981; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                💰 <strong>Delegacja</strong><br><small style="color: #666;">Rozliczenie kosztów</small>
              </button>
              <button type="button" onclick="employeeDashboard.showTicketForm('advance')" style="padding: 12px; border: 2px solid #10B981; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                💳 <strong>Zaliczka</strong><br><small style="color: #666;">Wniosek o zaliczkę</small>
              </button>
              
              <div style="grid-column: span 2; font-weight: 600; color: #8B5CF6; margin: 10px 0 5px;">💻 IT / Systemy</div>
              <button type="button" onclick="employeeDashboard.showTicketForm('access')" style="padding: 12px; border: 2px solid #8B5CF6; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                🔑 <strong>Dostęp IT</strong><br><small style="color: #666;">Dostęp do systemów</small>
              </button>
              <button type="button" onclick="employeeDashboard.showTicketForm('phone')" style="padding: 12px; border: 2px solid #8B5CF6; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                📱 <strong>Sprzęt</strong><br><small style="color: #666;">Telefon, laptop, komputer</small>
              </button>
              
              <div style="grid-column: span 2; font-weight: 600; color: #F59E0B; margin: 10px 0 5px;">🏢 Administracja</div>
              <button type="button" onclick="employeeDashboard.showTicketForm('parking')" style="padding: 12px; border: 2px solid #F59E0B; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                🚗 <strong>Parking</strong><br><small style="color: #666;">Miejsce parkingowe</small>
              </button>
              <button type="button" onclick="employeeDashboard.showTicketForm('supplies')" style="padding: 12px; border: 2px solid #F59E0B; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                🖨️ <strong>Materiały</strong><br><small style="color: #666;">Artykuły biurowe</small>
              </button>
              
              <div style="grid-column: span 2; font-weight: 600; color: #6B7280; margin: 10px 0 5px;">📝 Inne</div>
              <button type="button" onclick="employeeDashboard.showTicketForm('other')" style="padding: 12px; border: 2px solid #6B7280; border-radius: 8px; background: white; cursor: pointer; text-align: left; grid-column: span 2;">
                📋 <strong>Inny wniosek</strong><br><small style="color: #666;">Dowolny temat</small>
              </button>
            </div>
            
            <!-- Formularz szczegółowy (ukryty domyślnie) -->
            <div id="ticketFormDetails" style="display: none;">
              <button type="button" onclick="employeeDashboard.backToCategories()" style="margin-bottom: 15px; padding: 8px 15px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">
                ← Wróć do wyboru kategorii
              </button>
              <form id="createTicketForm">
                <div id="dynamicFormFields"></div>
                <div class="modal-actions" style="margin-top: 20px;">
                  <button type="button" class="btn-secondary" onclick="employeeDashboard.closeModal('createTicketModal')">Anuluj</button>
                  <button type="submit" class="btn-primary">📤 Wyślij wniosek</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
  }
  
  // Konfiguracja formularzy
  getFormConfigs() {
    return {
      expense: { 
        title: '💰 Rozliczenie delegacji', 
        department: 'Księgowość',
        ticketType: 'delegacja',
        category: 'finance',
        fields: [
          { name: 'destination', label: 'Miejsce wyjazdu', type: 'text', required: true },
          { name: 'dateFrom', label: 'Data od', type: 'date', required: true },
          { name: 'dateTo', label: 'Data do', type: 'date', required: true },
          { name: 'amount', label: 'Kwota (PLN)', type: 'number', required: true },
          { name: 'description', label: 'Opis kosztów', type: 'textarea', required: true }
        ]
      },
      advance: { 
        title: '💳 Wniosek o zaliczkę', 
        department: 'Księgowość',
        ticketType: 'zaliczka',
        category: 'finance',
        fields: [
          { name: 'amount', label: 'Kwota (PLN)', type: 'number', required: true },
          { name: 'purpose', label: 'Cel', type: 'textarea', required: true },
          { name: 'date', label: 'Data potrzebna', type: 'date', required: true }
        ]
      },
      access: { 
        title: '🔑 Wniosek o dostęp do systemów', 
        department: 'IT',
        ticketType: 'dostep_it',
        category: 'it',
        fields: [
          { name: 'system', label: 'System/Aplikacja', type: 'select', options: ['LEX', 'Legalis', 'CRM', 'Email', 'VPN', 'GitHub', 'Google Workspace', 'Inne'], required: true },
          { name: 'accessLevel', label: 'Poziom dostępu', type: 'select', options: ['Użytkownik', 'Administrator', 'Tylko odczyt'], required: true },
          { name: 'justification', label: 'Uzasadnienie', type: 'textarea', required: true }
        ]
      },
      phone: { 
        title: '📱 Wniosek o sprzęt służbowy', 
        department: 'IT',
        ticketType: 'sprzet',
        category: 'it',
        fields: [
          { name: 'deviceType', label: 'Typ urządzenia', type: 'select', options: ['Telefon', 'Tablet', 'Laptop', 'Komputer', 'Monitor', 'Inne'], required: true },
          { name: 'model', label: 'Preferowany model (opcjonalnie)', type: 'text', required: false },
          { name: 'justification', label: 'Uzasadnienie', type: 'textarea', required: true }
        ]
      },
      parking: { 
        title: '🚗 Wniosek o miejsce parkingowe', 
        department: 'Administracja',
        ticketType: 'parking',
        category: 'admin',
        fields: [
          { name: 'carModel', label: 'Marka i model auta', type: 'text', required: true },
          { name: 'registration', label: 'Numer rejestracyjny', type: 'text', required: true },
          { name: 'reason', label: 'Uzasadnienie', type: 'textarea', required: true }
        ]
      },
      supplies: { 
        title: '🖨️ Zamówienie materiałów biurowych', 
        department: 'Administracja',
        ticketType: 'materialy',
        category: 'admin',
        fields: [
          { name: 'items', label: 'Lista artykułów', type: 'textarea', required: true },
          { name: 'urgency', label: 'Pilność', type: 'select', options: ['Normalna', 'Pilne', 'Bardzo pilne'], required: true }
        ]
      },
      other: { 
        title: '📋 Inny wniosek', 
        department: 'Ogólne',
        ticketType: 'inne',
        category: 'other',
        fields: [
          { name: 'category', label: 'Kategoria', type: 'select', options: ['HR', 'IT', 'Księgowość', 'Administracja', 'Inne'], required: true },
          { name: 'title', label: 'Tytuł', type: 'text', required: true },
          { name: 'description', label: 'Opis', type: 'textarea', required: true }
        ]
      }
    };
  }
  
  showTicketForm(type) {
    const configs = this.getFormConfigs();
    const config = configs[type];
    if (!config) return;
    
    this.currentTicketConfig = config;
    
    // Ukryj kategorie, pokaż formularz
    document.getElementById('ticketCategorySelection').style.display = 'none';
    document.getElementById('ticketFormDetails').style.display = 'block';
    
    // Generuj pola formularza
    const fieldsHTML = config.fields.map(field => {
      if (field.type === 'select') {
        return `
          <div class="form-group">
            <label>${field.label} ${field.required ? '*' : ''}</label>
            <select name="${field.name}" ${field.required ? 'required' : ''}>
              <option value="">-- Wybierz --</option>
              ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (field.type === 'textarea') {
        return `
          <div class="form-group">
            <label>${field.label} ${field.required ? '*' : ''}</label>
            <textarea name="${field.name}" ${field.required ? 'required' : ''} rows="4"></textarea>
          </div>
        `;
      } else {
        return `
          <div class="form-group">
            <label>${field.label} ${field.required ? '*' : ''}</label>
            <input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>
          </div>
        `;
      }
    }).join('');
    
    document.getElementById('dynamicFormFields').innerHTML = `
      <h4 style="margin-bottom: 15px; color: #1f2937;">${config.title}</h4>
      <p style="color: #6b7280; margin-bottom: 15px;">Dział: ${config.department}</p>
      ${fieldsHTML}
    `;
    
    // Submit handler
    document.getElementById('createTicketForm').onsubmit = async (e) => {
      e.preventDefault();
      await this.submitTicketForm();
    };
  }
  
  backToCategories() {
    document.getElementById('ticketCategorySelection').style.display = 'grid';
    document.getElementById('ticketFormDetails').style.display = 'none';
  }
  
  async submitTicketForm() {
    const form = document.getElementById('createTicketForm');
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    const config = this.currentTicketConfig;
    const ticketPayload = {
      user_id: this.userId,
      ticket_type: config.ticketType,
      title: config.title,
      department: config.department,
      details: JSON.stringify(data),
      priority: 'normal',
      category: config.category
    };
    
    try {
      const response = await window.api.request('/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketPayload)
      });
      
      if (response.success) {
        alert('✅ Wniosek został wysłany!');
        this.closeModal('createTicketModal');
        await this.loadData();
        this.switchTab('tickets');
      }
    } catch (error) {
      console.error('❌ Błąd wysyłania wniosku:', error);
      alert('Błąd przy wysyłaniu wniosku: ' + error.message);
    }
  }

  async createTicket() {
    // Stara metoda - zachowana dla kompatybilności
    await this.submitTicketForm();
  }

  // Helper: Zamknij modal
  closeModal(modalId) {
    console.log('❌ closeModal called for:', modalId);
    console.trace('Call stack:'); // Pokaże skąd jest wywoływane
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }

  // Pokaż modal ze sprawami pracownika (według roli)
  async showCasesModal() {
    try {
      console.log('📂 Ładowanie spraw pracownika...');
      const response = await window.api.request(`/cases/my-cases`);
      
      if (!response || !response.cases) {
        alert('Błąd pobierania spraw');
        return;
      }
      
      const cases = response.cases;
      const userRole = response.user_role;
      console.log(`✅ Załadowano ${cases.length} spraw dla roli: ${userRole}`);
      
      // Pobierz listę klientów użytkownika aby sprawdzić relację przez klienta
      let myClientIds = [];
      try {
        const clientsResponse = await window.api.request(`/clients/my-clients`);
        if (clientsResponse && clientsResponse.clients) {
          myClientIds = clientsResponse.clients
            .filter(c => c.assigned_to == this.userId)
            .map(c => c.id);
        }
      } catch (e) {
        console.warn('⚠️ Nie udało się pobrać klientów:', e);
      }
      
      this.renderCasesModal(cases, userRole, myClientIds);
    } catch (error) {
      console.error('❌ Błąd ładowania spraw:', error);
      alert('Nie udało się pobrać spraw');
    }
  }

  renderCasesModal(cases, userRole, myClientIds = []) {
    const roleLabels = {
      'admin': '👑 Wszystkie sprawy',
      'lawyer': '👔 Sprawy mecenasa',
      'case_manager': '📋 Sprawy opiekuna',
      'client_manager': '👥 Sprawy klientów',
      'reception': '📞 Wszystkie sprawy'
    };
    
    const html = `
      <div id="casesModal" class="modal active">
        <div class="modal-overlay" onclick="employeeDashboard.closeModal('casesModal')"></div>
        <div class="modal-content" style="max-width: 900px;">
          <div class="modal-header">
            <h3>${roleLabels[userRole] || '⚖️ Sprawy'}</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('casesModal')">&times;</button>
          </div>
          <div class="modal-body">
            ${cases.length > 0 ? `
              <div class="cases-summary" style="margin-bottom: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; color: #1a1a1a;">
                <strong style="color: #1a1a1a;">Razem: ${cases.length} spraw</strong>
                <span style="margin-left: 20px; color: #1a1a1a;">⚠️ Otwarte: ${cases.filter(c => c.status === 'open').length}</span>
                <span style="margin-left: 20px; color: #1a1a1a;">🔄 W toku: ${cases.filter(c => c.status === 'in_progress').length}</span>
                <span style="margin-left: 20px; color: #1a1a1a;">✅ Zamknięte: ${cases.filter(c => c.status === 'closed').length}</span>
              </div>
              <table class="cases-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5; text-align: left;">
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Nr sprawy</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Tytuł</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Klient</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Moja rola</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Status</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${cases.map(c => {
                    // Sprawdź jaka jest rola użytkownika w tej sprawie
                    const roles = [];
                    if (c.assigned_to == this.userId) roles.push('👔 Mecenas');
                    // Sprawdź opiekuna - może być w additional_caretaker LUB case_manager_id
                    const isCaretaker = (c.additional_caretaker == this.userId) || (c.case_manager_id == this.userId);
                    if (isCaretaker) roles.push('📋 Opiekun sprawy');
                    // Sprawdź czy sprawa należy do mojego klienta
                    const isMyClient = myClientIds.includes(c.client_id);
                    if (isMyClient && roles.length === 0) roles.push('👤 Opiekun klienta');
                    
                    const isMyCase = roles.length > 0;
                    const bgColor = isMyCase ? '#e3f2fd' : 'transparent';
                    const fontWeight = isMyCase ? 'bold' : 'normal';
                    const roleText = roles.length > 0 ? roles.join(', ') : '👁️ Podgląd';
                    
                    return `
                    <tr style="border-bottom: 1px solid #e0e0e0; background: ${bgColor};">
                      <td style="padding: 10px; color: #1a1a1a; font-weight: ${fontWeight};"><strong>${c.case_number || '-'}</strong></td>
                      <td style="padding: 10px; color: #1a1a1a; font-weight: ${fontWeight};">${c.title}</td>
                      <td style="padding: 10px; color: #333;">
                        ${c.company_name || `${c.first_name || ''} ${c.last_name || ''}`}
                      </td>
                      <td style="padding: 10px;">
                        <span style="font-size: 0.9em; color: ${isMyCase ? '#1976d2' : '#666'}; font-weight: ${isMyCase ? '600' : 'normal'};">${roleText}</span>
                      </td>
                      <td style="padding: 10px;">
                        <span class="badge badge-${c.status}">${this.getCaseStatusLabel(c.status)}</span>
                      </td>
                      <td style="padding: 10px; color: #555;">${this.formatDate(c.created_at)}</td>
                    </tr>
                  `}).join('')}
                </tbody>
              </table>
            ` : '<p class="empty-state">Brak spraw</p>'}
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // Pokaż modal z klientami pracownika (według roli)
  async showClientsModal() {
    try {
      console.log('👥 Ładowanie klientów pracownika...');
      
      // Użyj dedykowanego endpointu dla klientów (konsystencja z /cases/my-cases)
      const response = await window.api.request(`/clients/my-clients`);
      
      if (!response || !response.clients) {
        alert('Błąd pobierania klientów');
        return;
      }
      
      const clients = response.clients;
      const userRole = response.user_role;
      
      console.log(`✅ Załadowano ${clients.length} klientów dla roli: ${userRole}`);
      
      // Dodaj liczbę spraw dla każdego klienta
      await this.addCasesCountToClients(clients);
      
      this.renderClientsModal(clients, userRole);
    } catch (error) {
      console.error('❌ Błąd ładowania klientów:', error);
      alert('Nie udało się pobrać klientów');
    }
  }

  // Helper: Dodaj liczbę spraw dla każdego klienta + sprawdź relację
  async addCasesCountToClients(clients) {
    try {
      const casesResponse = await window.api.request(`/cases/my-cases`);
      const cases = casesResponse.cases || [];
      
      clients.forEach(client => {
        // Liczba spraw tego klienta przypisanych do mnie
        const myCases = cases.filter(c => c.client_id === client.id);
        client.cases_count = myCases.length;
        
        // Sprawdź relację - czy klient ma sprawy gdzie jestem mecenasem/opiekunem
        const hasCasesAsMecenas = myCases.some(c => c.assigned_to == this.userId);
        const hasCasesAsCaretaker = myCases.some(c => c.additional_caretaker == this.userId || c.case_manager_id == this.userId);
        
        client.relationRole = [];
        if (client.assigned_to == this.userId) client.relationRole.push('👤 Opiekun klienta');
        if (hasCasesAsMecenas) client.relationRole.push('👔 Mecenas');
        if (hasCasesAsCaretaker) client.relationRole.push('📋 Opiekun spraw');
      });
    } catch (error) {
      console.error('⚠️ Błąd pobierania liczby spraw:', error);
      // Ustaw domyślnie 0 jeśli się nie uda
      clients.forEach(client => {
        client.cases_count = 0;
        client.relationRole = [];
      });
    }
  }

  renderClientsModal(clients, userRole) {
    const roleLabels = {
      'admin': '👑 Wszyscy klienci',
      'lawyer': '👔 Klienci mecenasa',
      'case_manager': '📋 Klienci ze spraw',
      'client_manager': '👥 Moi klienci',
      'reception': '📞 Wszyscy klienci'
    };
    
    const html = `
      <div id="clientsModal" class="modal active">
        <div class="modal-overlay" onclick="employeeDashboard.closeModal('clientsModal')"></div>
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <h3>${roleLabels[userRole] || '👥 Klienci'}</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('clientsModal')">&times;</button>
          </div>
          <div class="modal-body">
            ${clients.length > 0 ? `
              <div class="clients-summary" style="margin-bottom: 20px; padding: 15px; background: #f0fff4; border-radius: 8px; color: #1a1a1a;">
                <strong style="color: #1a1a1a;">Razem: ${clients.length} klientów</strong>
                <span style="margin-left: 20px; color: #1a1a1a;">📊 Łączna liczba spraw: ${clients.reduce((sum, c) => sum + c.cases_count, 0)}</span>
              </div>
              <table class="clients-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5; text-align: left;">
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">ID</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Klient</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Moja relacja</th>
                    <th style="padding: 10px; color: #1a1a1a; font-weight: 700;">Liczba spraw</th>
                  </tr>
                </thead>
                <tbody>
                  ${clients.map(client => {
                    const clientName = client.company_name || `${client.first_name || ''} ${client.last_name || ''}`;
                    const hasRelation = client.relationRole && client.relationRole.length > 0;
                    const bgColor = hasRelation ? '#e8f5e9' : 'transparent';
                    const relationText = hasRelation ? client.relationRole.join(', ') : '👁️ Podgląd';
                    
                    return `
                      <tr style="border-bottom: 1px solid #e0e0e0; background: ${bgColor};">
                        <td style="padding: 10px; color: #1a1a1a;"><strong>#${client.id}</strong></td>
                        <td style="padding: 10px; color: #1a1a1a;">
                          ${client.company_name ? `<strong>🏢 ${client.company_name}</strong>` : `👤 ${clientName}`}
                        </td>
                        <td style="padding: 10px;">
                          <span style="font-size: 0.9em; color: ${hasRelation ? '#2e7d32' : '#666'}; font-weight: ${hasRelation ? '600' : 'normal'};">${relationText}</span>
                        </td>
                        <td style="padding: 10px;">
                          <span class="badge" style="background: #3B82F6; color: white; padding: 3px 10px; border-radius: 12px;">
                            ${client.cases_count || 0} ${client.cases_count === 1 ? 'sprawa' : 'spraw'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p class="empty-state">Brak klientów</p>'}
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
  }

  renderFinancialTab() {
    const profile = this.profileData?.profile || {};
    const currentUserRole = JSON.parse(localStorage.getItem('currentUser') || '{}').user_role || 'client';
    const canEdit = ['admin', 'hr', 'finance'].includes(currentUserRole);
    
    return `
      <div class="financial-tab">
        <h3 style="color: #1a1a1a; font-size: 1.5em; margin-bottom: 20px;">💰 Dane Finansowe i Historia Wypłat</h3>
        
        <!-- Dane finansowe pracownika -->
        <div class="financial-data-section" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h4 style="margin: 0; color: #1a1a1a; font-size: 1.3em; font-weight: 700;">📋 Dane kontraktowe</h4>
            ${canEdit ? `
              <button class="btn-primary" onclick="employeeDashboard.showEditFinancialDataModal()" style="padding: 8px 16px; font-size: 14px;">
                ✏️ Edytuj dane
              </button>
            ` : ''}
          </div>
          
          <div class="financial-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div class="data-item" style="display: flex; flex-direction: column; gap: 5px;">
              <span class="label" style="font-weight: 600; color: #555; font-size: 0.9em;">💵 Pensja miesięczna (brutto):</span>
              <span class="value" style="font-size: 1.2em; font-weight: 700; color: #1a1a1a;">${profile.monthly_salary ? this.formatMoney(profile.monthly_salary) : 'Nie określono'}</span>
            </div>
            <div class="data-item" style="display: flex; flex-direction: column; gap: 5px;">
              <span class="label" style="font-weight: 600; color: #555; font-size: 0.9em;">🏦 Konto bankowe:</span>
              <span class="value" style="font-family: monospace; font-size: 1.05em; color: #1a1a1a; font-weight: 600;">${profile.bank_account || 'Brak danych'}</span>
            </div>
            <div class="data-item" style="display: flex; flex-direction: column; gap: 5px;">
              <span class="label" style="font-weight: 600; color: #555; font-size: 0.9em;">📄 Typ umowy:</span>
              <span class="value" style="font-size: 1.05em; color: #1a1a1a; font-weight: 600;">${this.getContractTypeLabel(profile.contract_type)}</span>
            </div>
            <div class="data-item" style="display: flex; flex-direction: column; gap: 5px;">
              <span class="label" style="font-weight: 600; color: #555; font-size: 0.9em;">📅 Data rozpoczęcia:</span>
              <span class="value" style="font-size: 1.05em; color: #1a1a1a; font-weight: 600;">${profile.contract_start_date ? this.formatDate(profile.contract_start_date) : 'Brak danych'}</span>
            </div>
            <div class="data-item" style="display: flex; flex-direction: column; gap: 5px;">
              <span class="label" style="font-weight: 600; color: #555; font-size: 0.9em;">🏛️ Urząd skarbowy:</span>
              <span class="value" style="font-size: 1.05em; color: #1a1a1a; font-weight: 600;">${profile.tax_office || 'Nie określono'}</span>
            </div>
            <div class="data-item" style="display: flex; flex-direction: column; gap: 5px;">
              <span class="label" style="font-weight: 600; color: #555; font-size: 0.9em;">🕐 Wymiar czasu pracy:</span>
              <span class="value" style="font-size: 1.05em; color: #1a1a1a; font-weight: 600;">${profile.work_hours_per_week ? profile.work_hours_per_week + ' h/tydzień' : 'Nie określono'}</span>
            </div>
          </div>
          
          ${profile.financial_notes ? `
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #3B82F6;">
              <strong style="color: #1a1a1a; font-size: 1.05em;">📝 Uwagi:</strong><br>
              <span style="color: #333; margin-top: 5px; display: block; line-height: 1.6;">${profile.financial_notes}</span>
            </div>
          ` : ''}
        </div>
        
        <!-- PROWIZJE - NOWA SEKCJA -->
        <div class="commissions-section" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h4 style="color: #1a1a1a; font-size: 1.3em; font-weight: 700; margin-bottom: 20px;">💰 Moje Prowizje</h4>
          <div id="commissionsContainer">
            <div style="text-align: center; padding: 40px; color: #666;">
              <p style="font-size: 1.1em;">🔄 Ładowanie prowizji...</p>
            </div>
          </div>
        </div>

        <!-- Historia wypłat -->
        <div class="salary-history-section" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h4 style="color: #1a1a1a; font-size: 1.3em; font-weight: 700; margin-bottom: 20px;">📊 Historia wypłat</h4>
          <div id="salaryHistoryContainer">
            <div style="text-align: center; padding: 40px; color: #666;">
              <p style="font-size: 1.1em;">🔄 Ładowanie historii wypłat...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  getContractTypeLabel(type) {
    const labels = {
      'uop': '📝 Umowa o pracę',
      'uz': '🤝 Umowa zlecenie',
      'b2b': '🏢 B2B',
      'uod': '📋 Umowa o dzieło'
    };
    return labels[type] || type || 'Nie określono';
  }
  
  async loadCommissions() {
    const container = document.getElementById('commissionsContainer');
    if (!container) return;
    
    try {
      // Pobierz prowizje
      const response = await window.api.request(`/payments/user-commissions/${this.userId}`);
      
      // Pobierz też dane finansowe z historią zmian stawek
      const financeResponse = await window.api.request(`/employees/${this.userId}/finances/summary`).catch(() => ({ success: false }));
      const rateChanges = financeResponse?.summary?.rate_changes || [];
      
      if (response.success) {
        const { commissions, stats } = response;
        
        // Oblicz statystyki z listy prowizji
        const rejected = commissions.filter(c => c.status === 'rejected');
        const rejectedAmount = rejected.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
        const approved = commissions.filter(c => c.status === 'approved');
        const approvedAmount = approved.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
        
        if (!commissions || commissions.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
              <p style="font-size: 1.1em;">📋 Brak prowizji do wyświetlenia</p>
            </div>
          `;
          return;
        }
        
        container.innerHTML = `
          <!-- Statystyki -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.3em; font-weight: 700; color: #2e7d32;">${(stats.paid_amount || 0).toFixed(2)} PLN</div>
              <div style="color: #388e3c; font-size: 0.9em;">💵 Do wypłaty</div>
            </div>
            <div style="background: #fff3e0; padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.3em; font-weight: 700; color: #ef6c00;">${(stats.pending_amount || 0).toFixed(2)} PLN</div>
              <div style="color: #f57c00; font-size: 0.85em;">⏳ Oczekujące</div>
            </div>
            <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.3em; font-weight: 700; color: #1565c0;">${approvedAmount.toFixed(2)} PLN</div>
              <div style="color: #1976d2; font-size: 0.85em;">✔️ Zatwierdzone</div>
            </div>
            <div style="background: #ffebee; padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.3em; font-weight: 700; color: #c62828;">${rejectedAmount.toFixed(2)} PLN</div>
              <div style="color: #c62828; font-size: 0.85em;">❌ Odrzucone (${rejected.length})</div>
            </div>
          </div>
          
          <!-- Lista prowizji -->
          <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
            ${commissions.map(c => {
              const statusColors = {
                paid: { bg: '#e8f5e9', color: '#2e7d32', label: '💵 Do wypłaty' },
                pending: { bg: '#fff3e0', color: '#ef6c00', label: '⏳ Oczekuje' },
                approved: { bg: '#e3f2fd', color: '#1565c0', label: '✔️ Zatwierdzone' },
                rejected: { bg: '#ffebee', color: '#c62828', label: '❌ Odrzucone' }
              };
              const st = statusColors[c.status] || statusColors.pending;
              const rate = c.commission_rate || c.rate || 0;
              
              // Debug dla odrzuconych
              if (c.status === 'rejected') {
                console.log('🔴 Odrzucona prowizja:', c.id, 'rejection_reason:', c.rejection_reason);
              }
              
              return `
              <div style="padding: 12px; margin-bottom: 8px; border-radius: 8px; background: ${st.bg}; border-left: 4px solid ${st.color};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${c.payment_code || c.case_number || 'Prowizja #' + c.id}</div>
                    <div style="font-size: 0.85em; color: #666;">${c.client_name || '-'} • ${new Date(c.created_at).toLocaleDateString('pl-PL')}</div>
                    <div style="font-size: 0.8em; color: #888; margin-top: 4px;">
                      💵 Kwota płatności: ${(c.payment_amount || 0).toFixed(2)} PLN • 
                      <strong style="color: #7c3aed;">Stawka: ${rate}%</strong>
                    </div>
                  </div>
                  <div style="text-align: right; min-width: 120px;">
                    <div style="font-weight: 700; font-size: 1.1em; color: ${st.color};">${(c.commission_amount || 0).toFixed(2)} PLN</div>
                    <div style="font-size: 0.8em; color: ${st.color}; margin-top: 2px;">${st.label}</div>
                  </div>
                </div>
                ${c.description && c.description.includes('Edycja') ? `
                  <div style="margin-top: 10px; padding: 10px; background: #f0f9ff; border-radius: 6px; border: 1px solid #bae6fd;">
                    <div style="font-size: 0.9em; color: #0369a1; font-weight: 600; margin-bottom: 5px;">
                      ✏️ HISTORIA EDYCJI
                    </div>
                    <div style="font-size: 0.85em; color: #0c4a6e; white-space: pre-line;">
                      ${c.description.split('|').filter(p => p.includes('Edycja')).map(e => {
                        const parts = e.trim().replace('Edycja:', '').trim();
                        return '📝 ' + parts;
                      }).join('\n')}
                    </div>
                  </div>
                ` : ''}
                ${c.status === 'rejected' ? `
                  <div style="margin-top: 10px; padding: 10px; background: #fff5f5; border-radius: 6px; border: 1px solid #ffcdd2;">
                    <div style="font-size: 0.9em; color: #c62828; font-weight: 600;">
                      ❌ ODRZUCONO
                    </div>
                    <div style="font-size: 0.85em; color: #c62828; margin-top: 5px;">
                      <strong>💬 Powód:</strong> ${c.rejection_reason || 'Brak powodu'}
                    </div>
                  </div>
                ` : ''}
              </div>
            `}).join('')}
          </div>
          
          <!-- Historia zmian stawki -->
          ${rateChanges.length > 0 ? `
            <div style="margin-top: 15px; border-top: 2px solid #f0f0f0; padding-top: 15px;">
              <h5 style="margin: 0 0 10px 0; color: #f39c12;">📊 Historia zmian stawki prowizji</h5>
              <div style="max-height: 150px; overflow-y: auto; background: #fffbeb; border-radius: 8px; padding: 10px;">
                ${rateChanges.map(rc => `
                  <div style="padding: 10px; border-bottom: 1px solid #fde68a; margin-bottom: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <span style="font-weight: 600; color: #c62828;">${rc.old_rate}%</span>
                        <span style="margin: 0 8px;">→</span>
                        <span style="font-weight: 600; color: #2e7d32;">${rc.new_rate}%</span>
                        <span style="color: #666; font-size: 0.85em; margin-left: 10px;">${new Date(rc.created_at).toLocaleDateString('pl-PL')}</span>
                      </div>
                      <span style="font-size: 0.8em; padding: 3px 8px; border-radius: 12px; ${rc.status === 'approved' ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">
                        ${rc.status === 'approved' ? '✅' : '⏳'}
                      </span>
                    </div>
                    <div style="margin-top: 6px; padding: 6px 10px; background: #fef3c7; border-radius: 4px; border-left: 3px solid #f39c12;">
                      <div style="font-size: 0.85em; color: #92400e;"><strong>Powód:</strong> ${rc.change_reason || '-'}</div>
                      ${rc.comment ? `<div style="font-size: 0.85em; color: #666; margin-top: 3px;">💬 ${rc.comment}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        `;
      }
    } catch (error) {
      console.error('Błąd ładowania prowizji:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #666;">
          <p style="font-size: 1.1em;">📋 Brak prowizji</p>
        </div>
      `;
    }
  }
  
  async loadSalaryHistory() {
    try {
      const response = await window.api.request(`/employees/${this.userId}/salary-history`);
      
      if (response.success) {
        this.renderSalaryHistory(response.salaries, response.stats);
      } else {
        console.error('Błąd ładowania historii wypłat');
      }
    } catch (error) {
      console.error('Błąd ładowania historii wypłat:', error);
      document.getElementById('salaryHistoryContainer').innerHTML = `
        <div class="empty-state">
          <p>📋 Brak historii wypłat</p>
        </div>
      `;
    }
  }
  
  renderSalaryHistory(salaries, stats) {
    const container = document.getElementById('salaryHistoryContainer');
    
    if (!container) return;
    
    if (!salaries || salaries.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>📋 Brak historii wypłat</p>
        </div>
      `;
      return;
    }
    
    // Statystyki
    const statsHtml = stats ? `
      <div class="salary-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        <div class="stat-card" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 15px; border-radius: 8px;">
          <div style="font-size: 0.9em; opacity: 0.9;">Łącznie wypłacono (brutto)</div>
          <div style="font-size: 1.5em; font-weight: 700; margin-top: 5px;">${this.formatMoney(stats.totalGross)}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 15px; border-radius: 8px;">
          <div style="font-size: 0.9em; opacity: 0.9;">Łącznie wypłacono (netto)</div>
          <div style="font-size: 1.5em; font-weight: 700; margin-top: 5px;">${this.formatMoney(stats.totalNet)}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 15px; border-radius: 8px;">
          <div style="font-size: 0.9em; opacity: 0.9;">Średnia pensja (brutto)</div>
          <div style="font-size: 1.5em; font-weight: 700; margin-top: 5px;">${this.formatMoney(stats.avgGross)}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 15px; border-radius: 8px;">
          <div style="font-size: 0.9em; opacity: 0.9;">Liczba wypłat</div>
          <div style="font-size: 1.5em; font-weight: 700; margin-top: 5px;">${stats.totalPayments}</div>
        </div>
      </div>
    ` : '';
    
    // Tabela wypłat
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
            <th style="padding: 12px; text-align: left;">Miesiąc</th>
            <th style="padding: 12px; text-align: right;">Kwota brutto</th>
            <th style="padding: 12px; text-align: right;">Kwota netto</th>
            <th style="padding: 12px; text-align: center;">Status</th>
            <th style="padding: 12px; text-align: left;">Data wypłaty</th>
            <th style="padding: 12px; text-align: left;">Wypłacił</th>
          </tr>
        </thead>
        <tbody>
          ${salaries.map(salary => `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 12px; font-weight: 600;">${this.getMonthName(salary.month)} ${salary.year}</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">${this.formatMoney(salary.gross_amount)}</td>
              <td style="padding: 12px; text-align: right; font-weight: 600; color: #10B981;">${this.formatMoney(salary.net_amount)}</td>
              <td style="padding: 12px; text-align: center;">
                <span style="
                  padding: 4px 12px;
                  border-radius: 12px;
                  font-size: 0.85em;
                  background: ${salary.payment_status === 'paid' ? '#d4edda' : '#fff3cd'};
                  color: ${salary.payment_status === 'paid' ? '#155724' : '#856404'};
                ">
                  ${salary.payment_status === 'paid' ? '✓ Wypłacone' : '⏳ Oczekuje'}
                </span>
              </td>
              <td style="padding: 12px;">${this.formatDate(salary.payment_date)}</td>
              <td style="padding: 12px; color: #666;">${salary.created_by_name || 'System'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = statsHtml + tableHtml;
  }
  
  getMonthName(monthNumber) {
    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    return months[monthNumber - 1] || monthNumber;
  }
  
  formatMoney(amount) {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount || 0);
  }
  
  showEditFinancialDataModal() {
    const profile = this.profileData?.profile || {};
    
    const modalHtml = `
      <div class="modal active" id="editFinancialModal">
        <div class="modal-overlay" onclick="employeeDashboard.closeModal('editFinancialModal')"></div>
        <div class="modal-content" style="max-width: 700px;">
          <div class="modal-header">
            <h3>💰 Edycja danych finansowych</h3>
            <button class="modal-close" onclick="employeeDashboard.closeModal('editFinancialModal')">&times;</button>
          </div>
          <form id="financialDataForm" onsubmit="employeeDashboard.saveFinancialData(event)">
            <div class="form-row">
              <div class="form-group">
                <label>💵 Pensja miesięczna (brutto)</label>
                <input type="number" name="monthly_salary" step="0.01" value="${profile.monthly_salary || ''}" placeholder="np. 8000.00">
              </div>
              <div class="form-group">
                <label>🏦 Numer konta bankowego</label>
                <input type="text" name="bank_account" value="${profile.bank_account || ''}" placeholder="26 1234 5678 9012 3456 7890 1234" maxlength="32">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>📄 Typ umowy</label>
                <select name="contract_type">
                  <option value="">Wybierz...</option>
                  <option value="uop" ${profile.contract_type === 'uop' ? 'selected' : ''}>📝 Umowa o pracę</option>
                  <option value="uz" ${profile.contract_type === 'uz' ? 'selected' : ''}>🤝 Umowa zlecenie</option>
                  <option value="b2b" ${profile.contract_type === 'b2b' ? 'selected' : ''}>🏢 B2B</option>
                  <option value="uod" ${profile.contract_type === 'uod' ? 'selected' : ''}>📋 Umowa o dzieło</option>
                </select>
              </div>
              <div class="form-group">
                <label>🕐 Wymiar czasu pracy (h/tydzień)</label>
                <input type="number" name="work_hours_per_week" value="${profile.work_hours_per_week || ''}" placeholder="np. 40" min="1" max="168">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>📅 Data rozpoczęcia umowy</label>
                <input type="date" name="contract_start_date" value="${profile.contract_start_date || ''}">
              </div>
              <div class="form-group">
                <label>📅 Data zakończenia umowy (opcjonalnie)</label>
                <input type="date" name="contract_end_date" value="${profile.contract_end_date || ''}">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>🏛️ Urząd skarbowy</label>
                <input type="text" name="tax_office" value="${profile.tax_office || ''}" placeholder="np. Urząd Skarbowy Warszawa-Śródmieście">
              </div>
              <div class="form-group">
                <label>🆔 NIP (dla B2B)</label>
                <input type="text" name="nip" value="${profile.nip || ''}" placeholder="np. 123-456-78-90" maxlength="13">
              </div>
            </div>
            
            <div class="form-group">
              <label>🏥 Rodzaj ubezpieczenia</label>
              <input type="text" name="insurance_type" value="${profile.insurance_type || ''}" placeholder="np. ZUS pełny, dobrowolne, brak">
            </div>
            
            <div class="form-group">
              <label>📝 Uwagi finansowe</label>
              <textarea name="financial_notes" rows="3" placeholder="Dodatkowe informacje dotyczące rozliczeń...">${profile.financial_notes || ''}</textarea>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="employeeDashboard.closeModal('editFinancialModal')">Anuluj</button>
              <button type="submit" class="btn-primary">💾 Zapisz dane finansowe</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
  
  async saveFinancialData(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
      monthly_salary: formData.get('monthly_salary') ? parseFloat(formData.get('monthly_salary')) : null,
      bank_account: formData.get('bank_account') || null,
      contract_type: formData.get('contract_type') || null,
      contract_start_date: formData.get('contract_start_date') || null,
      contract_end_date: formData.get('contract_end_date') || null,
      tax_office: formData.get('tax_office') || null,
      nip: formData.get('nip') || null,
      insurance_type: formData.get('insurance_type') || null,
      work_hours_per_week: formData.get('work_hours_per_week') ? parseInt(formData.get('work_hours_per_week')) : null,
      financial_notes: formData.get('financial_notes') || null
    };
    
    try {
      const response = await window.api.request(`/employees/${this.userId}/financial-data`, 'PUT', data);
      
      if (response.success) {
        alert('✅ Dane finansowe zaktualizowane!');
        this.closeModal('editFinancialModal');
        // Przeładuj dane
        await this.loadEmployeeData();
        this.render();
      } else {
        alert('❌ Błąd: ' + response.message);
      }
    } catch (error) {
      console.error('Błąd zapisywania danych finansowych:', error);
      alert('❌ Błąd zapisywania danych: ' + error.message);
    }
  }

  getCaseStatusLabel(status) {
    const labels = {
      'open': '⚠️ Otwarta',
      'in_progress': '🔄 W toku',
      'closed': '✅ Zamknięta',
      'pending': '⏳ Oczekująca'
    };
    return labels[status] || status;
  }

  // =====================================
  // EKSPORT DO PDF - SZCZEGÓŁOWY RAPORT
  // =====================================
  async exportToPDF() {
    const user = this.profileData.user;
    const stats = this.profileData.stats || {};
    
    // Pobierz szczegółowe dane miesięczne
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    let monthlyReport = null;
    let commissionsData = [];
    let salaryHistory = [];
    
    try {
      const response = await window.api.request(`/employees/${this.userId}/monthly-reports/${year}/${month}`);
      if (response && response.report) {
        monthlyReport = response.report;
      }
    } catch (error) {
      // Raport miesięczny nie istnieje (404) - to normalne dla bieżącego miesiąca
      console.log(`ℹ️ Raport miesięczny ${year}-${month} nie został jeszcze wygenerowany`);
    }
    
    // Pobierz prowizje pracownika
    try {
      const commResponse = await window.api.request(`/commissions/user/${this.userId}`);
      if (commResponse && commResponse.commissions) {
        commissionsData = commResponse.commissions.filter(c => {
          const commDate = new Date(c.created_at);
          return commDate.getFullYear() === year && (commDate.getMonth() + 1) === month;
        });
      }
    } catch (error) {
      console.log('ℹ️ Brak prowizji lub błąd API');
    }
    
    // Pobierz historię wypłat
    try {
      const salaryResponse = await window.api.request(`/employees/${this.userId}/salary-history`);
      if (salaryResponse && salaryResponse.salaries) {
        salaryHistory = salaryResponse.salaries.filter(s => {
          return s.year === year && s.month === month;
        });
      }
    } catch (error) {
      console.log('ℹ️ Brak wypłat lub błąd API');
    }
    
    // Stwórz HTML raportu
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Raport Pracownika - ${user.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #3B82F6; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
          .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6; }
          .stat-label { font-size: 0.9rem; color: #666; }
          .stat-value { font-size: 1.8rem; font-weight: bold; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          th { background: #3B82F6; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Raport Pracownika - ${monthlyReport ? 'Miesięczny' : 'Bieżący'}</h1>
          <h2>${user.name}</h2>
          <p>📧 ${user.email} | 👤 ${this.getRoleLabel(user.user_role)}</p>
          <p>📅 Okres: ${monthlyReport ? `${month}/${year}` : 'Bieżący miesiąc'}</p>
          <p>🕐 Wygenerowano: ${new Date().toLocaleString('pl-PL')}</p>
        </div>
        
        <div class="section">
          <h3>⏱️ Czas pracy</h3>
          ${monthlyReport ? `
            <p style="font-size: 1.8rem; font-weight: bold; color: #3B82F6; margin: 10px 0;">
              ${this.formatDecimalHours(monthlyReport.total_work_hours || 0)}
            </p>
            <p style="color: #666;">Liczba logowań: ${monthlyReport.login_count || 0}</p>
          ` : `
            <p style="color: #666;">Raport miesięczny nie jest jeszcze dostępny</p>
          `}
        </div>
        
        <div class="section">
          <h3>💰 Prowizje w tym miesiącu</h3>
          ${commissionsData.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Typ</th>
                  <th>Kwota</th>
                  <th>Status</th>
                  <th>Płatność</th>
                </tr>
              </thead>
              <tbody>
                ${commissionsData.map(comm => `
                  <tr>
                    <td>${new Date(comm.created_at).toLocaleDateString('pl-PL')}</td>
                    <td>${comm.commission_type || 'N/A'}</td>
                    <td style="font-weight: bold; color: #10B981;">${this.formatMoney(comm.amount)}</td>
                    <td>${comm.status === 'paid' ? '✅ Wypłacone' : comm.status === 'pending' ? '⏳ Oczekuje' : '❌ Anulowane'}</td>
                    <td>${comm.payment_id ? '#' + comm.payment_id : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="font-size: 1.2rem; font-weight: bold; color: #10B981; margin-top: 10px;">
              Suma prowizji: ${this.formatMoney(commissionsData.reduce((sum, c) => sum + (c.amount || 0), 0))}
            </p>
          ` : `<p style="color: #666;">Brak prowizji w tym miesiącu</p>`}
        </div>
        
        <div class="section">
          <h3>💵 Wypłaty w tym miesiącu</h3>
          ${salaryHistory.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Data wypłaty</th>
                  <th>Kwota brutto</th>
                  <th>Kwota netto</th>
                  <th>Status</th>
                  <th>Wypłacił</th>
                </tr>
              </thead>
              <tbody>
                ${salaryHistory.map(sal => `
                  <tr>
                    <td>${this.formatDate(sal.payment_date)}</td>
                    <td style="font-weight: bold;">${this.formatMoney(sal.gross_amount)}</td>
                    <td style="font-weight: bold; color: #10B981;">${this.formatMoney(sal.net_amount)}</td>
                    <td>${sal.payment_status === 'paid' ? '✅ Wypłacone' : '⏳ Oczekuje'}</td>
                    <td>${sal.created_by_name || 'System'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="font-size: 1.2rem; font-weight: bold; color: #3B82F6; margin-top: 10px;">
              Suma wypłat netto: ${this.formatMoney(salaryHistory.reduce((sum, s) => sum + (s.net_amount || 0), 0))}
            </p>
          ` : `<p style="color: #666;">Brak wypłat w tym miesiącu</p>`}
        </div>
        
        <div class="section">
          <h3>📈 Statystyki miesięczne</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Zadania wykonane</div>
              <div class="stat-value">${monthlyReport ? monthlyReport.tasks_completed : stats.completed_tasks || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tickety rozwiązane</div>
              <div class="stat-value">${monthlyReport ? monthlyReport.tickets_resolved : stats.total_tickets || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Obsłużone sprawy</div>
              <div class="stat-value">${monthlyReport ? monthlyReport.cases_handled : stats.total_cases || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Nowi klienci</div>
              <div class="stat-value">${monthlyReport ? monthlyReport.new_clients : stats.total_clients || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Średnia ocena</div>
              <div class="stat-value">${monthlyReport && monthlyReport.average_rating ? monthlyReport.average_rating.toFixed(1) + '⭐' : 'Brak'}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Liczba logowań</div>
              <div class="stat-value">${monthlyReport ? monthlyReport.login_count : this.loginHistory?.length || 0}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>⏰ Historia logowań (ostatnie 20)</h3>
          <table>
            <thead>
              <tr>
                <th>Data i godzina</th>
                <th>IP</th>
                <th>Przeglądarka</th>
              </tr>
            </thead>
            <tbody>
              ${(this.loginHistory || []).slice(0, 20).map(login => `
                <tr>
                  <td>${new Date(login.login_time).toLocaleString('pl-PL')}</td>
                  <td>${login.ip_address || 'N/A'}</td>
                  <td style="font-size: 0.85rem;">${(login.user_agent || '').substring(0, 40)}...</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>🎫 Zadania (ostatnie 15)</h3>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tytuł</th>
                <th>Status</th>
                <th>Priorytet</th>
              </tr>
            </thead>
            <tbody>
              ${this.getFilteredTasks().slice(0, 15).map(task => `
                <tr>
                  <td>${new Date(task.created_at).toLocaleDateString('pl-PL')}</td>
                  <td>${task.title}</td>
                  <td>${task.status === 'completed' ? '✅ Wykonane' : task.status === 'in_progress' ? '🔄 W toku' : '⏳ Oczekuje'}</td>
                  <td>${task.priority === 'high' ? '🔴 Wysoki' : task.priority === 'medium' ? '🟡 Średni' : '🟢 Niski'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>🎟️ Tickety (ostatnie 15)</h3>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Typ</th>
                <th>Tytuł</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.getFilteredTickets().slice(0, 15).map(ticket => `
                <tr>
                  <td>${new Date(ticket.created_at).toLocaleDateString('pl-PL')}</td>
                  <td>${ticket.ticket_type || 'N/A'}</td>
                  <td>${ticket.title}</td>
                  <td>${ticket.status === 'resolved' ? '✅ Rozwiązany' : ticket.status === 'in_progress' ? '🔄 W toku' : '⏳ Otwarty'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>📋 Aktywność (ostatnie 30)</h3>
          <table>
            <thead>
              <tr>
                <th>Data i godzina</th>
                <th>Typ</th>
                <th>Opis</th>
              </tr>
            </thead>
            <tbody>
              ${(this.activityLogs || []).slice(0, 30).map(log => `
                <tr>
                  <td>${new Date(log.created_at).toLocaleString('pl-PL')}</td>
                  <td style="font-size: 0.85rem;">${log.activity_type}</td>
                  <td>${log.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Pro Meritum - Kancelaria Prawna</p>
          <p>Raport wygenerowany automatycznie przez system HR</p>
        </div>
      </body>
      </html>
    `;
    
    // Otwórz w nowym oknie i wydrukuj
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // =====================================
  // EKSPORT DO CSV
  // =====================================
  exportToCSV() {
    const user = this.profileData.user;
    const stats = this.profileData.stats || {};
    
    const csvData = [
      ['Raport Pracownika'],
      [''],
      ['Imię i nazwisko', user.name],
      ['Email', user.email],
      ['Rola', this.getRoleLabel(user.user_role)],
      [''],
      ['Statystyki'],
      ['Zadania wykonane', stats.completed_tasks || 0],
      ['Zadania wszystkie', stats.total_tasks || 0],
      ['Tickety', stats.total_tickets || 0],
      ['Klienci', stats.total_clients || 0],
      [''],
      ['Data wygenerowania', new Date().toLocaleString('pl-PL')]
    ];
    
    const csvContent = csvData.map(row => row.join(';')).join('\n');
    const BOM = '\uFEFF'; // BOM dla UTF-8
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `raport_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // =====================================
  // ŁADOWANIE PROWIZJI PRACOWNIKA
  // =====================================
  async loadEmployeeCommissions() {
    try {
      console.log('💰 Ładowanie prowizji pracownika:', this.userId);
      
      const response = await window.api.request(`/employees/${this.userId}/finances/summary`);
      
      if (response.success) {
        this.renderCommissions(response.summary);
      } else {
        console.error('Błąd ładowania prowizji');
      }
    } catch (error) {
      console.error('❌ Błąd ładowania prowizji:', error);
      document.getElementById('commissionsContainer').innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          <p style="font-size: 1.1em;">❌ Błąd ładowania prowizji</p>
          <p style="font-size: 0.9em; color: #999;">${error.message}</p>
        </div>
      `;
    }
  }

  renderCommissions(summary) {
    const container = document.getElementById('commissionsContainer');
    const comm = summary.commissions || {};
    
    container.innerHTML = `
      <!-- Podsumowanie prowizji -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 12px; text-align: center; color: #1a2332;">
          <div style="font-size: 0.9rem; font-weight: 600; opacity: 0.9;">⏸️ Oczekujące</div>
          <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${comm.pending_amount || 0} PLN</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">${comm.pending_count || 0} prowizji</div>
        </div>
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <div style="font-size: 0.9rem; font-weight: 600; opacity: 0.9;">⏳ Do wypłaty</div>
          <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${comm.approved_amount || 0} PLN</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">${comm.approved_count || 0} prowizji</div>
        </div>
        <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <div style="font-size: 0.9rem; font-weight: 600; opacity: 0.9;">✅ Wypłacone</div>
          <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${comm.paid_amount || 0} PLN</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">${comm.paid_count || 0} prowizji</div>
        </div>
        <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <div style="font-size: 0.9rem; font-weight: 600; opacity: 0.9;">❌ Odrzucone</div>
          <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${comm.rejected_amount || 0} PLN</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">${comm.rejected_count || 0} prowizji</div>
        </div>
      </div>

      <!-- Zmodyfikowane prowizje -->
      ${summary.edited_commissions && summary.edited_commissions.length > 0 ? `
        <h5 style="margin: 20px 0 10px 0; color: #f39c12; font-weight: 700;">📝 Prowizje ze zmienioną stawką</h5>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #fff9e6; border-bottom: 2px solid #ffd966;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #d68910;">Data</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #d68910;">Kwota</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #d68910;">Sprawa</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #d68910;">Płatność</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #d68910;">Zmiana</th>
              </tr>
            </thead>
            <tbody>
              ${summary.edited_commissions.map((c, i) => {
                const editInfo = c.description && c.description.includes('Edycja:') 
                  ? c.description.split('Edycja:')[1].split('|').pop().trim()
                  : 'Zmieniono stawkę';
                return `
                  <tr style="border-bottom: 1px solid #fff3cd; background: ${i % 2 === 0 ? 'white' : '#fff9e6'};">
                    <td style="padding: 12px; font-weight: 600; color: #856404;">${new Date(c.created_at).toLocaleDateString('pl-PL')}</td>
                    <td style="padding: 12px; text-align: right; font-weight: 700; color: #f39c12; font-size: 1.1rem;">${c.amount} PLN</td>
                    <td style="padding: 12px; color: #757575;">
                      ${c.case_number ? `
                        <span style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                          ${c.case_number}
                        </span>
                      ` : '-'}
                    </td>
                    <td style="padding: 12px; color: #757575; font-size: 0.85rem;">
                      ${c.payment_code ? `
                        <span style="background: #e8f5e9; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                          ${c.payment_code}
                        </span>
                      ` : '-'}
                    </td>
                    <td style="padding: 12px; color: #856404; font-weight: 600; font-size: 0.85rem;">
                      ${editInfo}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Odrzucone prowizje -->
      ${summary.rejected_commissions && summary.rejected_commissions.length > 0 ? `
        <h5 style="margin: 20px 0 10px 0; color: #e74c3c; font-weight: 700;">❌ Odrzucone prowizje</h5>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #ffebee; border-bottom: 2px solid #ef9a9a;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #c62828;">Data</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #c62828;">Kwota</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #c62828;">Sprawa</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #c62828;">Płatność</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #c62828;">Powód</th>
              </tr>
            </thead>
            <tbody>
              ${summary.rejected_commissions.map((c, i) => `
                <tr style="border-bottom: 1px solid #ffcdd2; background: ${i % 2 === 0 ? 'white' : '#ffebee'};">
                  <td style="padding: 12px; font-weight: 600; color: #d32f2f;">${new Date(c.created_at).toLocaleDateString('pl-PL')}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; color: #d32f2f; font-size: 1.1rem;">${c.amount} PLN</td>
                  <td style="padding: 12px; color: #757575;">
                    ${c.case_number ? `
                      <span style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                        ${c.case_number}
                      </span>
                    ` : '-'}
                  </td>
                  <td style="padding: 12px; color: #757575; font-size: 0.85rem;">
                    ${c.payment_code ? `
                      <span style="background: #e8f5e9; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                        ${c.payment_code}
                      </span>
                    ` : '-'}
                  </td>
                  <td style="padding: 12px; color: #d32f2f; font-weight: 600;">
                    ${c.rejection_reason || 'Brak podanego powodu'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Ostatnie wypłaty -->
      ${summary.recent_payments && summary.recent_payments.length > 0 ? `
        <h5 style="margin: 20px 0 10px 0; color: #1a1a1a; font-weight: 700;">💳 Ostatnie wypłaty</h5>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #1a1a1a;">Data</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #1a1a1a;">Typ</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #1a1a1a;">Kwota</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #1a1a1a;">Opis</th>
              </tr>
            </thead>
            <tbody>
              ${summary.recent_payments.map((p, i) => `
                <tr style="border-bottom: 1px solid #ecf0f1; background: ${i % 2 === 0 ? 'white' : '#f8f9fa'};">
                  <td style="padding: 12px; font-weight: 600; color: #1a1a1a;">${p.payment_date}</td>
                  <td style="padding: 12px;">
                    <span style="background: ${p.payment_type === 'commission' ? '#FFD700' : '#3B82F6'}; color: ${p.payment_type === 'commission' ? '#1a2332' : 'white'}; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                      ${p.payment_type === 'commission' ? '💰 Prowizja' : '💼 Wypłata'}
                    </span>
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; color: #2ecc71; font-size: 1.1rem;">${p.amount} PLN</td>
                  <td style="padding: 12px; color: #64748b;">${p.description || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div style="text-align: center; padding: 20px; color: #999; background: #f8f9fa; border-radius: 8px;">
          📋 Brak wypłat
        </div>
      `}

      <div style="margin-top: 20px; text-align: center;">
        <button onclick="window.open('/test-commissions.html', '_blank')" 
                style="padding: 10px 20px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          📊 Zobacz szczegóły prowizji
        </button>
      </div>
    `;
  }

  // ============================================
  // NOWE: HR SYSTEM - Obsługa zakładek
  // ============================================
  
  async switchTab(tabName) {
    // Usuń aktywną klasę z wszystkich zakładek
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Dodaj aktywną klasę do wybranej zakładki
    const btn = document.querySelector(`[data-tab="${tabName}"]`);
    const content = document.getElementById(`tab-${tabName}`);
    
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');
    
    // Załaduj dane dla nowych zakładek HR
    if (tabName === 'vacations') {
      await this.loadVacationsTab();
    } else if (tabName === 'training') {
      await this.loadTrainingTab();
    } else if (tabName === 'benefits') {
      await this.loadBenefitsTab();
    } else if (tabName === 'documents') {
      await this.loadDocumentsTab();
    } else if (tabName === 'certificates') {
      await this.loadCertificatesTab();
    } else if (tabName === 'statistics') {
      setTimeout(() => this.initCharts(), 100);
    } else if (tabName === 'financial') {
      await this.loadCommissions();
      await this.loadSalaryHistory();
    } else if (tabName === 'schedule') {
      await this.loadScheduleTab();
    }
  }

  // ============================================
  // URLOPY
  // ============================================
  async loadVacationsTab() {
    const container = document.getElementById('tab-vacations');
    container.innerHTML = '<div class="loading">Ładowanie urlopów...</div>';
    
    try {
      const [balanceRes, vacationsRes] = await Promise.all([
        window.api.request(`/hr-vacations/${this.userId}/balance?year=${new Date().getFullYear()}`),
        window.api.request(`/hr-vacations/${this.userId}/list`)
      ]);
      
      const balance = balanceRes.balance || {};
      const vacations = vacationsRes.vacations || [];
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>🏖️ Moje Urlopy</h3>
          
          <!-- Saldo urlopów -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 12px; text-align: center; color: white;">
              <div style="font-size: 0.9rem; opacity: 0.9;">📅 Urlop wypoczynkowy</div>
              <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${balance.available_annual_days || 0}</div>
              <div style="font-size: 0.85rem; opacity: 0.9;">dostępne dni</div>
            </div>
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 20px; border-radius: 12px; text-align: center; color: white;">
              <div style="font-size: 0.9rem; opacity: 0.9;">⚡ Na żądanie</div>
              <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${balance.available_occasional_days || 0}</div>
              <div style="font-size: 0.85rem; opacity: 0.9;">dostępne dni</div>
            </div>
            <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 20px; border-radius: 12px; text-align: center; color: white;">
              <div style="font-size: 0.9rem; opacity: 0.9;">✓ Wykorzystane</div>
              <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${balance.used_annual_days || 0}</div>
              <div style="font-size: 0.85rem; opacity: 0.9;">dni w ${balance.year}</div>
            </div>
          </div>

          <button onclick="employeeDashboard.showRequestVacationModal()" 
                  style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Złóż wniosek urlopowy
          </button>

          <!-- Lista wniosków -->
          <h4>📋 Moje wnioski</h4>
          ${vacations.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 12px; text-align: left;">Typ</th>
                  <th style="padding: 12px; text-align: left;">Od - Do</th>
                  <th style="padding: 12px; text-align: center;">Dni</th>
                  <th style="padding: 12px; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${vacations.map(v => `
                  <tr style="border-bottom: 1px solid #ecf0f1;">
                    <td style="padding: 12px;">${this.getVacationType(v.vacation_type)}</td>
                    <td style="padding: 12px;">${new Date(v.start_date).toLocaleDateString('pl-PL')} - ${new Date(v.end_date).toLocaleDateString('pl-PL')}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 600;">${v.days_count}</td>
                    <td style="padding: 12px; text-align: center;">${this.getVacationStatus(v.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="text-align: center; color: #999; padding: 20px;">Brak wniosków urlopowych</p>'}
        </div>
      `;
    } catch (error) {
      console.error('❌ Error loading vacations:', error);
      container.innerHTML = '<div class="error">Błąd ładowania danych urlopów</div>';
    }
  }

  getVacationType(type) {
    const types = {
      'annual': '🏖️ Wypoczynkowy',
      'sick': '🏥 Zwolnienie lekarskie',
      'unpaid': '💔 Bezpłatny',
      'parental': '👶 Rodzicielski',
      'occasional': '⚡ Na żądanie',
      'other': '📝 Inny'
    };
    return types[type] || type;
  }

  getVacationStatus(status) {
    const statuses = {
      'pending': '<span style="background: #FFA726; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">⏳ Oczekuje</span>',
      'approved': '<span style="background: #66BB6A; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">✅ Zatwierdzony</span>',
      'rejected': '<span style="background: #EF5350; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">❌ Odrzucony</span>',
      'cancelled': '<span style="background: #999; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">🚫 Anulowany</span>'
    };
    return statuses[status] || status;
  }

  async showRequestVacationModal() {
    const modalHTML = `
      <div id="vacationModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
          <h3 style="margin: 0 0 20px 0;">🏖️ Wniosek urlopowy</h3>
          <form id="vacationForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data od:</label>
              <input type="date" name="start_date" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data do:</label>
              <input type="date" name="end_date" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Rodzaj urlopu:</label>
              <select name="vacation_type" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                <option value="annual">🏖️ Urlop wypoczynkowy</option>
                <option value="occasional">⚡ Na żądanie</option>
                <option value="unpaid">💔 Bezpłatny</option>
                <option value="sick">🏥 Zwolnienie lekarskie</option>
                <option value="parental">👶 Rodzicielski</option>
                <option value="other">📝 Inny</option>
              </select>
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Uwagi (opcjonalnie):</label>
              <textarea name="notes" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" onclick="document.getElementById('vacationModal').remove()" 
                      style="padding: 10px 20px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ✓ Wyślij wniosek
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('vacationForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        const res = await window.api.request(`/hr-vacations/${this.userId}/request`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        if (res.success) {
          alert('✅ Wniosek urlopowy został złożony! Utworzono ticket do zatwierdzenia.');
          document.getElementById('vacationModal').remove();
          await this.loadVacationsTab();
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
  }

  async showRequestTrainingModal() {
    const modalHTML = `
      <div id="trainingModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
          <h3 style="margin: 0 0 20px 0;">🎓 Wniosek o szkolenie</h3>
          <form id="trainingForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Typ szkolenia:</label>
              <select name="training_type" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                <option value="course">📚 Kurs</option>
                <option value="certification">📜 Certyfikacja</option>
                <option value="conference">🎤 Konferencja</option>
                <option value="workshop">🛠️ Warsztat</option>
                <option value="webinar">💻 Webinar</option>
                <option value="other">📝 Inne</option>
              </select>
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nazwa szkolenia:</label>
              <input type="text" name="title" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dostawca/Organizator:</label>
              <input type="text" name="provider" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Opis/Uzasadnienie:</label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data rozpoczęcia:</label>
                <input type="date" name="start_date" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Czas trwania (h):</label>
                <input type="number" name="duration_hours" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Szacowany koszt (PLN):</label>
              <input type="number" name="cost" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" onclick="document.getElementById('trainingModal').remove()" 
                      style="padding: 10px 20px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ✓ Wyślij wniosek
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('trainingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      data.create_ticket = true;
      
      try {
        const res = await window.api.request(`/hr-training/${this.userId}/add`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        if (res.success) {
          alert('✅ Wniosek o szkolenie został złożony! Utworzono ticket do zatwierdzenia.');
          document.getElementById('trainingModal').remove();
          await this.loadTrainingTab();
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
  }

  async showUploadDocumentModal() {
    const modalHTML = `
      <div id="documentModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
          <h3 style="margin: 0 0 20px 0;">📄 Prześlij dokument</h3>
          <form id="documentForm" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Typ dokumentu:</label>
              <select name="document_type" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                <option value="diploma">🎓 Dyplom</option>
                <option value="certificate">📜 Certyfikat</option>
                <option value="contract">📝 Umowa</option>
                <option value="id_card">🪪 Dowód osobisty</option>
                <option value="medical_exam">🏥 Badania lekarskie</option>
                <option value="other">📄 Inny</option>
              </select>
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nazwa dokumentu:</label>
              <input type="text" name="title" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Plik:</label>
              <input type="file" name="file" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data wystawienia:</label>
                <input type="date" name="issue_date" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Ważny do:</label>
                <input type="date" name="expiry_date" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Wystawca:</label>
              <input type="text" name="issuer" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" onclick="document.getElementById('documentModal').remove()" 
                      style="padding: 10px 20px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 10px 20px; background: #F59E0B; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ✓ Prześlij
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('documentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.append('create_ticket', 'true');
      
      try {
        const res = await fetch(`/api/hr-documents/${this.userId}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success) {
          alert('✅ Dokument został przesłany! Utworzono ticket do weryfikacji.');
          document.getElementById('documentModal').remove();
          await this.loadDocumentsTab();
        } else {
          throw new Error(data.error || 'Błąd uploadu');
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
  }

  // ============================================
  // SZKOLENIA
  // ============================================
  async loadTrainingTab() {
    const container = document.getElementById('tab-training');
    container.innerHTML = '<div class="loading">Ładowanie szkoleń...</div>';
    
    try {
      const res = await window.api.request(`/hr-training/${this.userId}/list`);
      const trainings = res.trainings || [];
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>🎓 Moje Szkolenia i Certyfikaty</h3>
          
          <button onclick="employeeDashboard.showRequestTrainingModal()" 
                  style="padding: 12px 24px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Poproś o szkolenie
          </button>
          
          ${trainings.length > 0 ? `
            <div style="display: grid; gap: 15px; margin-top: 20px;">
              ${trainings.map(t => `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; ${t.status === 'cancelled' ? 'border-left: 4px solid #EF5350;' : t.status === 'in_progress' && t.approved_by ? 'border-left: 4px solid #66BB6A;' : t.status === 'planned' ? 'border-left: 4px solid #FFA726;' : 'border-left: 4px solid #42A5F5;'}">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h4 style="margin: 0 0 5px 0; color: #1a1a1a;">${t.title}</h4>
                      <p style="color: #333; margin: 0; font-weight: 500;">${t.provider || 'Brak dostawcy'}</p>
                      ${t.description ? `<p style="margin: 10px 0; font-size: 0.9rem; color: #333;">${t.description}</p>` : ''}
                    </div>
                    <span style="background: ${this.getTrainingStatusColorFull(t)}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">
                      ${this.getTrainingStatusLabelFull(t)}
                    </span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; font-size: 0.9rem; color: #1a1a1a; font-weight: 500;">
                    ${t.start_date ? `<div>📅 Start: ${new Date(t.start_date).toLocaleDateString('pl-PL')}</div>` : ''}
                    ${t.duration_hours ? `<div>⏱️ Czas: ${t.duration_hours}h</div>` : ''}
                    ${t.cost ? `<div>💰 Koszt: ${t.cost} PLN</div>` : ''}
                    ${t.certificate_number ? `<div>📜 Nr cert.: ${t.certificate_number}</div>` : ''}
                    ${t.expiry_date ? `<div style="color: ${new Date(t.expiry_date) < new Date() ? '#c62828' : '#1a1a1a'};">⏰ Ważny do: ${new Date(t.expiry_date).toLocaleDateString('pl-PL')}</div>` : ''}
                  </div>
                  
                  ${t.approval_notes ? `
                    <div style="background: #e8f5e9; border-left: 3px solid #66BB6A; padding: 10px 15px; border-radius: 4px; margin-top: 15px; color: #1b5e20;">
                      <strong>📝 Notatka HR:</strong> ${t.approval_notes}
                    </div>
                  ` : ''}
                  
                  ${t.rejection_reason ? `
                    <div style="background: #ffebee; border-left: 3px solid #EF5350; padding: 10px 15px; border-radius: 4px; margin-top: 15px; color: #b71c1c;">
                      <strong>❌ Powód odrzucenia:</strong> ${t.rejection_reason}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p style="text-align: center; color: #999; padding: 40px;">Brak szkoleń i certyfikatów</p>'}
        </div>
      `;
    } catch (error) {
      console.error('❌ Error loading training:', error);
      container.innerHTML = '<div class="error">Błąd ładowania szkoleń</div>';
    }
  }

  getTrainingStatusColor(status) {
    return { 'planned': '#FFA726', 'in_progress': '#42A5F5', 'completed': '#66BB6A', 'cancelled': '#999' }[status] || '#999';
  }

  getTrainingStatusLabel(status) {
    return { 'planned': '📅 Zaplanowane', 'in_progress': '🔄 W trakcie', 'completed': '✅ Ukończone', 'cancelled': '❌ Anulowane' }[status] || status;
  }
  
  // Nowe funkcje - rozpoznają zaakceptowane/odrzucone
  getTrainingStatusColorFull(training) {
    if (training.status === 'cancelled') return '#EF5350'; // Odrzucone - czerwony
    if (training.status === 'in_progress' && training.approved_by) return '#66BB6A'; // Zaakceptowane - zielony
    if (training.status === 'planned') return '#FFA726'; // Oczekujące - pomarańczowy
    if (training.status === 'completed') return '#1976D2'; // Ukończone - niebieski
    return '#42A5F5'; // W trakcie - jasny niebieski
  }
  
  getTrainingStatusLabelFull(training) {
    if (training.status === 'cancelled') return '❌ Odrzucone';
    if (training.status === 'in_progress' && training.approved_by) return '✅ Zaakceptowane';
    if (training.status === 'planned') return '⏳ Oczekuje';
    if (training.status === 'completed') return '🏆 Ukończone';
    return '🔄 W trakcie';
  }

  // ============================================
  // CV / DOŚWIADCZENIE
  // ============================================
  async loadCVTab() {
    const container = document.getElementById('tab-cv');
    container.innerHTML = '<div class="loading">Ładowanie CV...</div>';
    
    try {
      const [cvRes, cvFileRes] = await Promise.all([
        window.api.request(`/hr-experience/${this.userId}/cv`),
        window.api.request(`/hr-documents/${this.userId}/list?type=cv`).catch(() => ({ documents: [] }))
      ]);
      
      const cv = cvRes.cv || {};
      const cvFiles = (cvFileRes.documents || []).filter(d => d.document_type === 'cv' || d.title?.toLowerCase().includes('cv'));
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>💼 Moje CV</h3>
          
          <!-- Plik CV -->
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 12px; margin-bottom: 25px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
              <div>
                <h4 style="margin: 0 0 5px 0;">📄 Plik CV</h4>
                <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">
                  ${cvFiles.length > 0 
                    ? `Ostatnia aktualizacja: ${new Date(cvFiles[0].uploaded_at).toLocaleDateString('pl-PL')}` 
                    : 'Nie przesłano jeszcze pliku CV'}
                </p>
              </div>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${cvFiles.length > 0 ? `
                  <button onclick="window.employeeDashboard.previewDocument(${cvFiles[0].id})" 
                          style="background: white; color: #667eea; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    👁️ Podgląd
                  </button>
                  <button onclick="window.employeeDashboard.downloadDocument(${cvFiles[0].id})" 
                          style="background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; border: 2px solid white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    📥 Pobierz
                  </button>
                ` : ''}
                <button onclick="window.employeeDashboard.showUploadCVModal()" 
                        style="background: #10B981; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  ${cvFiles.length > 0 ? '🔄 Aktualizuj CV' : '➕ Prześlij CV'}
                </button>
              </div>
            </div>
          </div>
          
          <div style="display: grid; gap: 20px;">
            <!-- Doświadczenie zawodowe -->
            <div>
              <h4 style="color: #1a1a1a;">👔 Doświadczenie zawodowe</h4>
              ${(cv.work || []).length > 0 ? cv.work.map(w => `
                <div style="background: white; border-left: 4px solid #3B82F6; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
                  <h5 style="margin: 0 0 5px 0; color: #1a1a1a;">${w.position || 'Stanowisko'} - ${w.company_name || 'Firma'}</h5>
                  <p style="color: #333; margin: 0; font-size: 0.9rem;">
                    ${w.start_date ? new Date(w.start_date).toLocaleDateString('pl-PL') : '?'} - 
                    ${w.is_current ? 'obecnie' : (w.end_date ? new Date(w.end_date).toLocaleDateString('pl-PL') : '?')}
                  </p>
                  ${w.responsibilities ? `<p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #333;">${w.responsibilities}</p>` : ''}
                </div>
              `).join('') : '<p style="color: #666; padding: 15px;">Brak doświadczenia zawodowego</p>'}
            </div>

            <!-- Wykształcenie -->
            <div>
              <h4 style="color: #1a1a1a;">🎓 Wykształcenie</h4>
              ${(cv.education || []).length > 0 ? cv.education.map(e => `
                <div style="background: white; border-left: 4px solid #10B981; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
                  <h5 style="margin: 0 0 5px 0; color: #1a1a1a;">${e.degree || 'Stopień'} - ${e.field_of_study || 'Kierunek'}</h5>
                  <p style="color: #333; margin: 0; font-size: 0.9rem;">${e.institution || 'Uczelnia'}</p>
                  ${e.start_date ? `<p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #333;">${new Date(e.start_date).getFullYear()} - ${e.end_date ? new Date(e.end_date).getFullYear() : 'obecnie'}</p>` : ''}
                </div>
              `).join('') : '<p style="color: #666; padding: 15px;">Brak wykształcenia</p>'}
            </div>

            <!-- Umiejętności -->
            <div>
              <h4 style="color: #1a1a1a;">⚡ Umiejętności</h4>
              ${(cv.skills || []).length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  ${cv.skills.map(s => `
                    <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem;">
                      ${s.skill_name} ${s.skill_level ? `(${s.skill_level})` : ''}
                    </span>
                  `).join('')}
                </div>
              ` : '<p style="color: #666; padding: 15px;">Brak umiejętności</p>'}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Error loading CV:', error);
      container.innerHTML = '<div class="error">Błąd ładowania CV</div>';
    }
  }
  
  // Modal przesyłania CV
  async showUploadCVModal() {
    const existingModal = document.getElementById('cvModal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
      <div id="cvModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a1a;">📄 Prześlij CV</h3>
          <form id="cvForm" enctype="multipart/form-data">
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Wybierz plik CV (PDF, DOC, DOCX):</label>
              <input type="file" name="file" accept=".pdf,.doc,.docx" required 
                     style="width: 100%; padding: 12px; border: 2px dashed #667eea; border-radius: 8px; cursor: pointer;">
            </div>
            <p style="color: #666; font-size: 0.85rem; margin-bottom: 20px;">
              💡 Zalecany format: PDF. Maksymalny rozmiar: 10MB.
            </p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" onclick="document.getElementById('cvModal').remove()" 
                      style="padding: 12px 24px; background: #999; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                ✓ Prześlij CV
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('cvModal').addEventListener('click', (e) => {
      if (e.target.id === 'cvModal') document.getElementById('cvModal').remove();
    });
    
    document.getElementById('cvForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.append('document_type', 'cv');
      formData.append('title', 'CV - ' + new Date().toLocaleDateString('pl-PL'));
      
      try {
        const res = await fetch(`/api/hr-documents/${this.userId}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success) {
          alert('✅ CV przesłane pomyślnie!');
          document.getElementById('cvModal').remove();
          await this.loadCVTab();
        } else {
          throw new Error(data.error || 'Błąd przesyłania');
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
  }

  // ============================================
  // BENEFITY
  // ============================================
  async loadBenefitsTab() {
    const container = document.getElementById('tab-benefits');
    container.innerHTML = '<div class="loading">Ładowanie benefitów...</div>';
    
    try {
      const res = await window.api.request(`/hr-benefits/${this.userId}/list`);
      const benefits = res.benefits || [];
      const totalMonthly = res.total_monthly || 0;
      const totalYearly = res.total_yearly || 0;
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>🎁 Moje Benefity</h3>
          
          <!-- Wartość pakietu -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 12px; text-align: center; color: white;">
              <div style="font-size: 0.9rem; opacity: 0.9;">💰 Wartość miesięczna</div>
              <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${totalMonthly} PLN</div>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 20px; border-radius: 12px; text-align: center; color: white;">
              <div style="font-size: 0.9rem; opacity: 0.9;">📊 Wartość roczna</div>
              <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${totalYearly} PLN</div>
            </div>
          </div>

          ${benefits.length > 0 ? `
            <h4>📋 Lista benefitów</h4>
            <div style="display: grid; gap: 15px;">
              ${benefits.map(b => `
                <div style="background: white; border: 1px solid ${b.is_active ? '#10B981' : '#999'}; border-radius: 8px; padding: 15px;">
                  <div style="display: flex; justify-content: between; align-items: start;">
                    <div style="flex: 1;">
                      <h5 style="margin: 0 0 5px 0;">${this.getBenefitIcon(b.benefit_type)} ${b.benefit_name}</h5>
                      ${b.provider ? `<p style="color: #666; margin: 0; font-size: 0.9rem;">Dostawca: ${b.provider}</p>` : ''}
                      ${b.policy_number ? `<p style="color: #666; margin: 5px 0 0 0; font-size: 0.85rem;">Nr polisy: ${b.policy_number}</p>` : ''}
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 1.2rem; font-weight: 700; color: #10B981;">${b.value_monthly} PLN/m-c</div>
                      <span style="background: ${b.is_active ? '#10B981' : '#999'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; margin-top: 5px; display: inline-block;">
                        ${b.is_active ? '✅ Aktywny' : '❌ Nieaktywny'}
                      </span>
                    </div>
                  </div>
                  <div style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    Od: ${new Date(b.start_date).toLocaleDateString('pl-PL')} 
                    ${b.end_date ? ` | Do: ${new Date(b.end_date).toLocaleDateString('pl-PL')}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="text-align: center; color: #999; padding: 40px;">Brak aktywnych benefitów</p>'}
        </div>
      `;
    } catch (error) {
      console.error('❌ Error loading benefits:', error);
      container.innerHTML = '<div class="error">Błąd ładowania benefitów</div>';
    }
  }

  getBenefitIcon(type) {
    const icons = {
      'health_insurance': '🏥',
      'life_insurance': '🛡️',
      'multisport': '🏃',
      'parking': '🅿️',
      'meal_vouchers': '🍽️',
      'phone': '📱',
      'laptop': '💻',
      'car': '🚗',
      'fuel_card': '⛽',
      'other': '🎁'
    };
    return icons[type] || '📦';
  }

  // ============================================
  // DOKUMENTY
  // ============================================
  async loadDocumentsTab() {
    const container = document.getElementById('tab-documents');
    container.innerHTML = '<div class="loading">Ładowanie dokumentów...</div>';
    
    try {
      const res = await window.api.request(`/hr-documents/${this.userId}/list`);
      const documents = res.documents || [];
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>📄 Moje Dokumenty</h3>
          
          <button onclick="window.employeeDashboard.showUploadDocumentModal()" 
                  style="padding: 12px 24px; background: #F59E0B; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Prześlij dokument (dyplom, certyfikat)
          </button>
          
          ${documents.length > 0 ? `
            <div style="display: grid; gap: 15px; margin-top: 20px;">
              ${documents.map(d => `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; border-left: 4px solid ${d.is_verified ? '#10B981' : '#FFA726'};">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <div style="font-weight: 600; font-size: 1.1rem; color: #1a1a1a;">${this.getDocumentTypeLabel(d.document_type)} ${d.title}</div>
                      <div style="color: #333; font-size: 0.9rem; margin-top: 5px; font-weight: 500;">
                        ${d.issue_date ? `📅 Wystawiony: ${new Date(d.issue_date).toLocaleDateString('pl-PL')}` : ''}
                        ${d.expiry_date ? ` • ⏰ Ważny do: <span style="color: ${new Date(d.expiry_date) < new Date() ? '#c62828' : '#1a1a1a'}; font-weight: 600;">${new Date(d.expiry_date).toLocaleDateString('pl-PL')}</span>` : ''}
                      </div>
                      ${d.issuer ? `<div style="color: #333; font-size: 0.85rem; margin-top: 3px;">Wystawca: ${d.issuer}</div>` : ''}
                    </div>
                    <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; ${d.is_verified ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">
                      ${d.is_verified ? '✅ Zweryfikowany' : '⏳ Oczekuje'}
                    </span>
                  </div>
                  <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="window.employeeDashboard.previewDocument(${d.id})" 
                            style="background: #6366F1; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                      👁️ Podgląd
                    </button>
                    <button onclick="window.employeeDashboard.downloadDocument(${d.id})" 
                            style="background: #3B82F6; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                      📥 Pobierz
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="text-align: center; color: #1a1a1a; padding: 40px;">Brak dokumentów</p>'}
        </div>
      `;
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      container.innerHTML = '<div class="error">Błąd ładowania dokumentów</div>';
    }
  }

  getDocumentTypeLabel(type) {
    const types = {
      'contract': '📝 Umowa',
      'annex': '📑 Aneks',
      'certificate': '🎓 Certyfikat',
      'diploma': '🎓 Dyplom',
      'id_card': '🪪 Dowód',
      'medical_exam': '🏥 Badania',
      'safety_training': '⚠️ BHP',
      'nda': '🔒 NDA',
      'other': '📄 Inne'
    };
    return types[type] || type;
  }
  
  // Podgląd dokumentu - wewnętrzny modal
  async previewDocument(docId) {
    // Usuń istniejący modal
    const existingModal = document.getElementById('docPreviewModal');
    if (existingModal) existingModal.remove();
    
    // Pokaż modal z ładowaniem
    const modalHTML = `
      <div id="docPreviewModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 99999;">
        <div style="background: white; border-radius: 12px; width: 95%; max-width: 1200px; height: 90vh; display: flex; flex-direction: column; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; background: #f8f9fa;">
            <h3 style="margin: 0; color: #1a1a1a;">📄 Podgląd dokumentu</h3>
            <button onclick="document.getElementById('docPreviewModal').remove()" 
                    style="background: #EF5350; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
              ✕ Zamknij
            </button>
          </div>
          <div id="docPreviewContent" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #f5f5f5; overflow: auto;">
            <div style="text-align: center;">
              <div style="font-size: 2rem;">⏳</div>
              <div style="margin-top: 10px; color: #333;">Ładowanie dokumentu...</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Zamknij po kliknięciu na tło
    document.getElementById('docPreviewModal').addEventListener('click', (e) => {
      if (e.target.id === 'docPreviewModal') {
        document.getElementById('docPreviewModal').remove();
      }
    });
    
    const token = localStorage.getItem('token');
    const url = `/api/hr-documents/${docId}/preview`;
    const contentDiv = document.getElementById('docPreviewContent');
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Nie można załadować dokumentu');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      if (blob.type === 'application/pdf') {
        contentDiv.innerHTML = `<iframe src="${blobUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
      } else if (blob.type.startsWith('image/')) {
        contentDiv.innerHTML = `<img src="${blobUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;"/>`;
      } else {
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 4rem;">📄</div>
            <div style="margin-top: 15px; color: #333; font-size: 1.1rem;">Ten typ pliku nie obsługuje podglądu</div>
            <button onclick="employeeDashboard.downloadDocument(${docId}); document.getElementById('docPreviewModal').remove();"
                    style="margin-top: 20px; background: #3B82F6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              📥 Pobierz plik
            </button>
          </div>
        `;
      }
    } catch (error) {
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 3rem;">❌</div>
          <div style="margin-top: 15px; color: #c62828; font-weight: 600;">${error.message}</div>
        </div>
      `;
    }
  }
  
  // Pobierz dokument
  async downloadDocument(docId) {
    const token = localStorage.getItem('token');
    const url = `/api/hr-documents/${docId}/download`;
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nie można pobrać dokumentu');
      }
      
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'dokument';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      
      // Utwórz link do pobrania
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      alert('❌ Błąd pobierania: ' + error.message);
    }
  }
  // ============================================
  // ZAŚWIADCZENIA
  // ============================================
  async loadCertificatesTab() {
    const container = document.getElementById('tab-certificates');
    container.innerHTML = '<div class="loading">Ładowanie zaświadczeń...</div>';
    
    try {
      // Pobierz tickety użytkownika związane z zaświadczeniami
      const res = await window.api.request('/tickets');
      const allTickets = res.tickets || [];
      
      // Filtruj tylko zaświadczenia tego użytkownika
      const certTickets = allTickets.filter(t => 
        t.user_id === this.userId &&
        (t.ticket_type?.toLowerCase().includes('zaswiadczenie') || 
         t.ticket_type?.toLowerCase().includes('certificate') ||
         t.title?.toLowerCase().includes('zaświadczenie'))
      );
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>📜 Moje Zaświadczenia</h3>
          
          <button onclick="window.employeeDashboard.showRequestCertificateModal()" 
                  style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Złóż wniosek o zaświadczenie
          </button>
          
          ${certTickets.length > 0 ? `
            <div style="display: grid; gap: 15px; margin-top: 20px;">
              ${certTickets.map(t => {
                // Parsuj details
                let details = {};
                try {
                  if (typeof t.details === 'string') {
                    details = JSON.parse(t.details);
                    if (typeof details === 'string') details = JSON.parse(details);
                  } else {
                    details = t.details || {};
                  }
                } catch (e) {
                  details = {};
                }
                
                const statusColors = {
                  'Nowy': { bg: '#fff3e0', border: '#FFA726', text: '⏳ Oczekuje' },
                  'W realizacji': { bg: '#e3f2fd', border: '#2196F3', text: '🔄 W realizacji' },
                  'Zakończony': { bg: '#e8f5e9', border: '#4CAF50', text: '✅ Gotowe' },
                  'Odrzucony': { bg: '#ffebee', border: '#EF5350', text: '❌ Odrzucony' }
                };
                const status = statusColors[t.status] || statusColors['Nowy'];
                
                return `
                  <div style="background: ${status.bg}; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; border-left: 4px solid ${status.border};">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                      <div>
                        <div style="font-weight: 600; font-size: 1.1rem; color: #1a1a1a;">
                          📄 ${details.certificateType || details.typZaswiadczenia || t.title || 'Zaświadczenie'}
                        </div>
                        <div style="color: #333; font-size: 0.9rem; margin-top: 5px;">
                          <strong>Cel:</strong> ${details.purpose || details.cel || 'Nie podano'}
                        </div>
                        <div style="color: #333; font-size: 0.9rem; margin-top: 3px;">
                          <strong>Język:</strong> ${details.language || details.jezyk || 'Polski'}
                        </div>
                        <div style="color: #666; font-size: 0.85rem; margin-top: 5px;">
                          📅 Złożono: ${new Date(t.created_at).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                      <span style="padding: 6px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; background: ${status.border}; color: white;">
                        ${status.text}
                      </span>
                    </div>
                    ${t.admin_note ? `
                      <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid ${status.border};">
                        <strong>📝 Notatka HR:</strong><br>
                        <span style="white-space: pre-line;">${t.admin_note}</span>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 40px; color: #666;">
              <div style="font-size: 3rem; margin-bottom: 15px;">📜</div>
              <p>Nie masz jeszcze żadnych wniosków o zaświadczenia</p>
              <p style="font-size: 0.9rem; color: #999;">Kliknij przycisk powyżej, aby złożyć wniosek</p>
            </div>
          `}
        </div>
      `;
      
    } catch (error) {
      console.error('❌ Błąd ładowania zaświadczeń:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #c62828;">
          <h3>❌ Błąd ładowania zaświadczeń</h3>
          <p>${error.message}</p>
          <button onclick="employeeDashboard.loadCertificatesTab()" 
                  style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
            🔄 Spróbuj ponownie
          </button>
        </div>
      `;
    }
  }
  
  // Modal: Złóż wniosek o zaświadczenie
  showRequestCertificateModal() {
    const modalHTML = `
      <div id="requestCertificateModal" class="modal active" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
          <h3 style="margin: 0 0 20px 0;">📜 Wniosek o zaświadczenie</h3>
          
          <form id="certificateRequestForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Typ zaświadczenia *</label>
              <select name="certificateType" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                <option value="">-- Wybierz typ --</option>
                <optgroup label="📋 Zatrudnienie i zarobki">
                  <option value="Zaświadczenie o zatrudnieniu">Zaświadczenie o zatrudnieniu</option>
                  <option value="Zaświadczenie o zarobkach">Zaświadczenie o zarobkach</option>
                  <option value="Zaświadczenie o zatrudnieniu i zarobkach">Zaświadczenie o zatrudnieniu i zarobkach</option>
                  <option value="Zaświadczenie o dochodach (PIT)">Zaświadczenie o dochodach (PIT)</option>
                </optgroup>
                <optgroup label="📅 Staż i okres pracy">
                  <option value="Zaświadczenie o stażu pracy">Zaświadczenie o stażu pracy</option>
                  <option value="Zaświadczenie o okresie zatrudnienia">Zaświadczenie o okresie zatrudnienia</option>
                  <option value="Świadectwo pracy (kopia)">Świadectwo pracy (kopia)</option>
                </optgroup>
                <optgroup label="🏥 Ubezpieczenia i ZUS">
                  <option value="Zaświadczenie ZUS Z-3">Zaświadczenie ZUS Z-3 (do zasiłku)</option>
                  <option value="Zaświadczenie o odprowadzanych składkach">Zaświadczenie o odprowadzanych składkach</option>
                  <option value="Druk RMUA">Druk RMUA</option>
                </optgroup>
                <optgroup label="🏖️ Urlopy i nieobecności">
                  <option value="Zaświadczenie o wykorzystanym urlopie">Zaświadczenie o wykorzystanym urlopie</option>
                  <option value="Zaświadczenie o urlopie macierzyńskim/rodzicielskim">Zaświadczenie o urlopie macierzyńskim/rodzicielskim</option>
                </optgroup>
                <optgroup label="📝 Inne">
                  <option value="Zaświadczenie do przedszkola/żłobka">Zaświadczenie do przedszkola/żłobka</option>
                  <option value="Zaświadczenie do MOPS/GOPS">Zaświadczenie do MOPS/GOPS</option>
                  <option value="Zaświadczenie do sądu">Zaświadczenie do sądu</option>
                  <option value="Referencje/List polecający">Referencje/List polecający</option>
                  <option value="Inne zaświadczenie">Inne zaświadczenie (opisz w uwagach)</option>
                </optgroup>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Cel zaświadczenia *</label>
              <select name="purpose" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                <option value="">-- Wybierz cel --</option>
                <option value="Bank - kredyt hipoteczny">Bank - kredyt hipoteczny</option>
                <option value="Bank - kredyt gotówkowy">Bank - kredyt gotówkowy</option>
                <option value="Bank - karta kredytowa">Bank - karta kredytowa</option>
                <option value="Urząd - zasiłek">Urząd - zasiłek</option>
                <option value="Urząd - świadczenia">Urząd - świadczenia</option>
                <option value="Sąd">Sąd</option>
                <option value="Przedszkole/Szkoła">Przedszkole/Szkoła</option>
                <option value="Wynajem mieszkania">Wynajem mieszkania</option>
                <option value="Inne">Inne</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Język zaświadczenia</label>
              <select name="language" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                <option value="Polski">Polski</option>
                <option value="Angielski">Angielski</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dodatkowe informacje</label>
              <textarea name="additionalInfo" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;" 
                        placeholder="Np. szczególne wymagania, okres zatrudnienia..."></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
              <button type="button" onclick="document.getElementById('requestCertificateModal').remove()" 
                      style="padding: 12px 24px; background: #999; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                📤 Złóż wniosek
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('certificateRequestForm').onsubmit = async (e) => {
      e.preventDefault();
      await this.submitCertificateRequest(e.target);
    };
  }
  
  // Wyślij wniosek o zaświadczenie
  async submitCertificateRequest(form) {
    const formData = new FormData(form);
    const certificateType = formData.get('certificateType');
    const purpose = formData.get('purpose');
    const language = formData.get('language');
    const additionalInfo = formData.get('additionalInfo');
    
    if (!certificateType) {
      alert('Wybierz typ zaświadczenia');
      return;
    }
    
    if (!purpose) {
      alert('Wybierz cel zaświadczenia');
      return;
    }
    
    try {
      const response = await window.api.request('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          user_id: this.userId,
          ticket_type: 'zaswiadczenie',
          title: certificateType,
          department: 'HR',
          priority: 'normal',
          details: JSON.stringify({
            certificateType: certificateType,
            typZaswiadczenia: certificateType,
            purpose: purpose,
            cel: purpose,
            language: language,
            jezyk: language,
            additionalInfo: additionalInfo
          })
        })
      });
      
      if (response.success) {
        document.getElementById('requestCertificateModal').remove();
        alert('✅ Wniosek o zaświadczenie został złożony!');
        await this.loadCertificatesTab();
      }
    } catch (error) {
      console.error('❌ Błąd składania wniosku:', error);
      alert('❌ Błąd: ' + error.message);
    }
  }

  // ============================================
  // MÓJ GRAFIK PRACY
  // ============================================
  async loadScheduleTab() {
    const container = document.getElementById('tab-schedule');
    container.innerHTML = '<div class="loading">Ładowanie grafiku...</div>';
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    try {
      const res = await window.api.request(`/work-schedule/user/${this.userId}/${year}/${String(month).padStart(2, '0')}`);
      
      const monthNames = ['', 'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                         'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
      const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
      
      const SCHEDULE_STATUSES = {
        'praca': { label: 'W pracy', color: '#4CAF50', icon: '🏢' },
        'zdalna': { label: 'Praca zdalna', color: '#2196F3', icon: '🏠' },
        'urlop': { label: 'Urlop', color: '#FF9800', icon: '🏖️' },
        'choroba': { label: 'Zwolnienie L4', color: '#F44336', icon: '🏥' },
        'wolne': { label: 'Dzień wolny', color: '#9C27B0', icon: '📅' },
        'nieobecny': { label: 'Nieobecny', color: '#757575', icon: '❌' },
        'delegacja': { label: 'Delegacja', color: '#00BCD4', icon: '✈️' }
      };
      
      const today = now.toISOString().split('T')[0];
      
      container.innerHTML = `
        <div class="schedule-container" style="padding: 20px;">
          <h3 style="margin: 0 0 20px 0;">📅 Mój grafik pracy - ${monthNames[month]} ${year}</h3>
          
          <!-- Legenda -->
          <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
            ${Object.entries(SCHEDULE_STATUSES).map(([key, val]) => `
              <span style="display: flex; align-items: center; gap: 5px; font-size: 0.9rem;">
                <span style="width: 16px; height: 16px; background: ${val.color}; border-radius: 4px;"></span>
                ${val.icon} ${val.label}
              </span>
            `).join('')}
          </div>
          
          <!-- Kalendarz -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding-bottom: 15px;">
            ${dayNames.map(d => `<div style="text-align: center; font-weight: 600; padding: 10px; color: #666;">${d}</div>`).join('')}
            
            ${(() => {
              const firstDay = new Date(year, month - 1, 1).getDay();
              const daysInMonth = new Date(year, month, 0).getDate();
              let html = '';
              
              // Puste komórki przed pierwszym dniem
              for (let i = 0; i < firstDay; i++) {
                html += '<div></div>';
              }
              
              // Dni miesiąca
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const scheduleEntry = res.schedule.find(s => s.date === dateStr);
                const status = scheduleEntry?.status || 'zdalna';
                const statusInfo = SCHEDULE_STATUSES[status] || SCHEDULE_STATUSES['zdalna'];
                const isToday = dateStr === today;
                const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
                const isPast = new Date(dateStr) < new Date(today);
                const tooltipText = `${day}.${month}.${year}\\n${statusInfo.label}\\nGodziny: ${scheduleEntry?.start_time || '09:00'} - ${scheduleEntry?.end_time || '17:00'}${scheduleEntry?.notes ? '\\nUwagi: ' + scheduleEntry.notes : ''}\\n\\nKliknij aby zarezerwować biuro`;
                
                html += `
                  <div style="
                    padding: 12px 8px;
                    border-radius: 8px;
                    text-align: center;
                    background: ${statusInfo.color}20;
                    border: 2px solid ${isToday ? '#1976D2' : 'transparent'};
                    ${isWeekend ? 'opacity: 0.7;' : ''}
                    ${!isWeekend && !isPast ? 'cursor: pointer;' : ''}
                    transition: transform 0.2s, box-shadow 0.2s;
                  "
                  title="${tooltipText}"
                  ${!isWeekend && !isPast ? `onclick="employeeDashboard.openBookingModal('${dateStr}')"` : ''}
                  ${!isWeekend && !isPast ? `onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"` : ''}
                  ${!isWeekend && !isPast ? `onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';"` : ''}
                  >
                    <div style="font-weight: ${isToday ? 'bold' : 'normal'}; color: ${isToday ? '#1976D2' : '#333'};">${day}</div>
                    <div style="font-size: 1.2rem; margin: 4px 0;">${statusInfo.icon}</div>
                    <div style="font-size: 0.7rem; color: #666;">${scheduleEntry?.start_time || '09:00'}-${scheduleEntry?.end_time || '17:00'}</div>
                  </div>
                `;
              }
              
              return html;
            })()}
          </div>
          
          <div style="height: 20px;"></div>
          
          <!-- Szczegóły dzisiejszego dnia -->
          ${(() => {
            const todayEntry = res.schedule.find(s => s.date === today);
            if (!todayEntry) return '';
            const statusInfo = SCHEDULE_STATUSES[todayEntry.status] || SCHEDULE_STATUSES['praca'];
            return `
              <div style="margin-top: 35px; padding: 20px; background: linear-gradient(135deg, ${statusInfo.color}40, ${statusInfo.color}20); border-radius: 12px; border-left: 4px solid ${statusInfo.color}; color: #333;">
                <h4 style="margin: 0 0 10px 0; color: #222;">${statusInfo.icon} Dzisiaj: ${statusInfo.label}</h4>
                <div style="display: flex; gap: 20px; flex-wrap: wrap; color: #444;">
                  <span>⏰ Godziny: <strong style="color: #222;">${todayEntry.start_time} - ${todayEntry.end_time}</strong></span>
                  <span>☕ Przerwa: <strong style="color: #222;">${todayEntry.break_minutes} min</strong></span>
                  ${todayEntry.notes ? `<span>📝 ${todayEntry.notes}</span>` : ''}
                </div>
              </div>
            `;
          })()}
        </div>
      `;
      
    } catch (error) {
      console.error('❌ Błąd ładowania grafiku:', error);
      container.innerHTML = `
        <div class="empty-state" style="padding: 40px; text-align: center;">
          <div style="font-size: 3rem;">📅</div>
          <h3>Nie można załadować grafiku</h3>
          <p style="color: #666;">${error.message}</p>
          <button onclick="employeeDashboard.loadScheduleTab()" style="margin-top: 15px; padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer;">
            🔄 Spróbuj ponownie
          </button>
        </div>
      `;
    }
  }

  // ============================================
  // REZERWACJA BIURA
  // ============================================
  async loadOfficeBookingTab() {
    const container = document.getElementById('tab-office-booking');
    container.innerHTML = '<div class="loading">Ładowanie systemu rezerwacji...</div>';
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const [resourcesRes, myBookingsRes, summaryRes] = await Promise.all([
        window.api.request('/office-booking/resources'),
        window.api.request(`/office-booking/my-bookings/${this.userId}`),
        window.api.request(`/office-booking/summary/${today}`)
      ]);
      
      const resources = resourcesRes.resources || [];
      const myBookings = myBookingsRes.bookings || [];
      const summary = summaryRes;
      
      container.innerHTML = `
        <div class="hr-section">
          <h3>🏢 Rezerwacja Biura - Gwiazdzista 6/5, Wrocław</h3>
          
          <!-- Info o biurze -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 15px 0;">📍 Biuro Pro Meritum</h4>
            <p style="margin: 0 0 10px 0; opacity: 0.9;">Domyślnie wszyscy pracują zdalnie. Jeśli chcesz przyjść do biura, zarezerwuj stanowisko.</p>
            <div style="display: flex; gap: 30px; flex-wrap: wrap; margin-top: 15px;">
              <div>
                <strong>🪑 Biurka:</strong> ${summary.desks?.available || 0}/${summary.desks?.total || 3} wolne
              </div>
              <div>
                <strong>🏛️ Sala konferencyjna:</strong> ${summary.conference_rooms?.available || 0}/${summary.conference_rooms?.total || 1} wolna
              </div>
            </div>
          </div>
          
          <!-- Formularz rezerwacji -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 15px 0;">➕ Nowa rezerwacja</h4>
            <form id="booking-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">📅 Data</label>
                <input type="date" id="booking-date" min="${today}" value="${today}" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;"
                       onchange="employeeDashboard.checkAvailability()">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">🪑 Zasób</label>
                <select id="booking-resource" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;"
                        onchange="employeeDashboard.checkAvailability()">
                  ${resources.map(r => `
                    <option value="${r.id}" data-type="${r.type}">
                      ${r.type === 'desk' ? '🪑' : '🏛️'} ${r.name} ${r.type === 'conference_room' ? `(do ${r.capacity} osób)` : ''}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">⏰ Od godziny</label>
                <select id="booking-start" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;"
                        onchange="employeeDashboard.updateEndTime()">
                  ${Array.from({length: 10}, (_, i) => i + 8).map(h => `
                    <option value="${String(h).padStart(2, '0')}:00">${String(h).padStart(2, '0')}:00</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">⏰ Do godziny</label>
                <select id="booking-end" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                  ${Array.from({length: 10}, (_, i) => i + 9).map(h => `
                    <option value="${String(h).padStart(2, '0')}:00">${String(h).padStart(2, '0')}:00</option>
                  `).join('')}
                </select>
              </div>
              <div style="grid-column: 1 / -1;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">📝 Cel wizyty (opcjonalnie)</label>
                <input type="text" id="booking-purpose" placeholder="np. Spotkanie z klientem, praca nad dokumentami..."
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
              </div>
              <div style="grid-column: 1 / -1;">
                <div id="availability-info" style="padding: 10px; border-radius: 8px; display: none;"></div>
              </div>
              <div style="grid-column: 1 / -1;">
                <button type="submit" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                  ✅ Zarezerwuj
                </button>
              </div>
            </form>
          </div>
          
          <!-- Moje rezerwacje -->
          <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <h4 style="margin: 0; padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee;">📋 Moje nadchodzące rezerwacje</h4>
            ${myBookings.length === 0 ? `
              <div style="padding: 30px; text-align: center; color: #666;">
                <p>Nie masz żadnych rezerwacji</p>
              </div>
            ` : `
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: left;">Data</th>
                    <th style="padding: 12px; text-align: left;">Zasób</th>
                    <th style="padding: 12px; text-align: center;">Godziny</th>
                    <th style="padding: 12px; text-align: left;">Cel</th>
                    <th style="padding: 12px; text-align: center;">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  ${myBookings.map(b => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px;">
                        <strong>${new Date(b.date).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                      </td>
                      <td style="padding: 12px;">
                        ${b.resource_type === 'desk' ? '🪑' : '🏛️'} ${b.resource_name}
                      </td>
                      <td style="padding: 12px; text-align: center;">
                        ${b.start_time.substring(0, 5)} - ${b.end_time.substring(0, 5)}
                      </td>
                      <td style="padding: 12px; color: #666;">${b.purpose || '-'}</td>
                      <td style="padding: 12px; text-align: center;">
                        <button onclick="employeeDashboard.cancelBooking(${b.id})" 
                                style="padding: 6px 12px; background: #F44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                          ❌ Anuluj
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>
      `;
      
      // Obsługa formularza
      document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitBooking();
      });
      
      // Sprawdź dostępność na start
      this.checkAvailability();
      
    } catch (error) {
      console.error('❌ Błąd ładowania rezerwacji:', error);
      container.innerHTML = `
        <div class="empty-state">
          <h3>❌ Błąd ładowania</h3>
          <p>${error.message}</p>
          <button onclick="employeeDashboard.loadOfficeBookingTab()" class="btn btn-primary">🔄 Spróbuj ponownie</button>
        </div>
      `;
    }
  }
  
  async checkAvailability() {
    const date = document.getElementById('booking-date')?.value;
    const resourceId = document.getElementById('booking-resource')?.value;
    const infoDiv = document.getElementById('availability-info');
    
    if (!date || !resourceId || !infoDiv) return;
    
    try {
      const res = await window.api.request(`/office-booking/availability/${resourceId}/${date}`);
      const slots = res.slots || [];
      const availableSlots = slots.filter(s => s.available);
      
      if (availableSlots.length === 0) {
        infoDiv.style.display = 'block';
        infoDiv.style.background = '#ffebee';
        infoDiv.style.color = '#c62828';
        infoDiv.innerHTML = '❌ Brak wolnych terminów w tym dniu. Wybierz inny dzień lub zasób.';
      } else if (availableSlots.length < slots.length) {
        infoDiv.style.display = 'block';
        infoDiv.style.background = '#fff3e0';
        infoDiv.style.color = '#e65100';
        const bookedBy = res.bookings.map(b => `${b.start_time.substring(0,5)}-${b.end_time.substring(0,5)}: ${b.user_name}`).join(', ');
        infoDiv.innerHTML = `⚠️ Częściowo zajęte: ${bookedBy}. Wolne: ${availableSlots.map(s => s.start_time).join(', ')}`;
      } else {
        infoDiv.style.display = 'block';
        infoDiv.style.background = '#e8f5e9';
        infoDiv.style.color = '#2e7d32';
        infoDiv.innerHTML = '✅ Zasób dostępny cały dzień!';
      }
    } catch (error) {
      console.error('Błąd sprawdzania dostępności:', error);
    }
  }
  
  updateEndTime() {
    const startSelect = document.getElementById('booking-start');
    const endSelect = document.getElementById('booking-end');
    if (!startSelect || !endSelect) return;
    
    const startHour = parseInt(startSelect.value.split(':')[0]);
    endSelect.innerHTML = '';
    
    for (let h = startHour + 1; h <= 18; h++) {
      const option = document.createElement('option');
      option.value = `${String(h).padStart(2, '0')}:00`;
      option.textContent = `${String(h).padStart(2, '0')}:00`;
      endSelect.appendChild(option);
    }
  }
  
  async submitBooking() {
    const date = document.getElementById('booking-date').value;
    const resourceId = document.getElementById('booking-resource').value;
    const startTime = document.getElementById('booking-start').value;
    const endTime = document.getElementById('booking-end').value;
    const purpose = document.getElementById('booking-purpose').value;
    
    if (!date || !resourceId || !startTime || !endTime) {
      alert('Wypełnij wszystkie wymagane pola');
      return;
    }
    
    try {
      const res = await window.api.request('/office-booking/book', {
        method: 'POST',
        body: JSON.stringify({
          resource_id: parseInt(resourceId),
          user_id: this.userId,
          date,
          start_time: startTime,
          end_time: endTime,
          purpose
        })
      });
      
      if (res.success) {
        alert('✅ Rezerwacja utworzona! Twój grafik został zaktualizowany.');
        this.loadOfficeBookingTab();
      } else {
        alert('❌ ' + (res.error || 'Błąd tworzenia rezerwacji'));
      }
    } catch (error) {
      alert('❌ ' + error.message);
    }
  }
  
  async cancelBooking(bookingId) {
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;
    
    try {
      const res = await window.api.request(`/office-booking/cancel/${bookingId}?user_id=${this.userId}`, {
        method: 'DELETE'
      });
      
      if (res.success) {
        alert('✅ Rezerwacja anulowana');
        this.loadOfficeBookingTab();
        this.loadScheduleTab(); // Odśwież też kalendarz
      } else {
        alert('❌ ' + (res.error || 'Błąd anulowania'));
      }
    } catch (error) {
      alert('❌ ' + error.message);
    }
  }
  
  // ============================================
  // MODAL REZERWACJI BIURA
  // ============================================
  async openBookingModal(date) {
    // Pobierz wszystkie dane równolegle
    const [resourcesRes, tasksRes, eventsRes, scheduleRes] = await Promise.all([
      window.api.request('/office-booking/resources'),
      window.api.request(`/tasks?assigned_to=${this.userId}`).catch(() => ({ tasks: [] })),
      window.api.request('/events').catch(() => ({ events: [] })),
      window.api.request(`/work-schedule/user/${this.userId}/${date.split('-')[0]}/${date.split('-')[1]}`).catch(() => ({ schedule: [] }))
    ]);
    
    const resources = resourcesRes.resources || [];
    const allTasks = tasksRes.tasks || [];
    const allEvents = eventsRes.events || eventsRes || [];
    
    // Filtruj zadania i wydarzenia na wybrany dzień
    const dayTasks = allTasks.filter(t => t.due_date && t.due_date.startsWith(date));
    const dayEvents = (Array.isArray(allEvents) ? allEvents : []).filter(e => {
      const eventDate = e.date || e.start_date;
      return eventDate && eventDate.startsWith(date);
    });
    
    // Pobierz notatkę z grafiku
    const scheduleEntry = (scheduleRes.schedule || []).find(s => s.date === date);
    const existingNote = scheduleEntry?.notes || '';
    
    const formattedDate = new Date(date).toLocaleDateString('pl-PL', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
    
    // Utwórz modal
    const modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; width: 95%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 16px 16px 0 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">📅 Szczegóły dnia</h3>
            <button onclick="document.getElementById('booking-modal').remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">✕</button>
          </div>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1rem;">${formattedDate}</p>
        </div>
        
        <div style="padding: 20px;">
          <!-- Zakładki -->
          <div style="display: flex; gap: 5px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            <button onclick="employeeDashboard.switchDayTab('tasks')" id="day-tab-tasks" class="day-tab active"
                    style="padding: 10px 15px; background: #3B82F6; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
              ✅ Zadania (${dayTasks.length})
            </button>
            <button onclick="employeeDashboard.switchDayTab('events')" id="day-tab-events" class="day-tab"
                    style="padding: 10px 15px; background: #e0e0e0; color: #333; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
              📆 Wydarzenia (${dayEvents.length})
            </button>
            <button onclick="employeeDashboard.switchDayTab('booking')" id="day-tab-booking" class="day-tab"
                    style="padding: 10px 15px; background: #e0e0e0; color: #333; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
              🏢 Biuro
            </button>
            <button onclick="employeeDashboard.switchDayTab('notes')" id="day-tab-notes" class="day-tab"
                    style="padding: 10px 15px; background: #e0e0e0; color: #333; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
              📝 Notatka
            </button>
          </div>
          
          <!-- Panel: Zadania -->
          <div id="day-panel-tasks" class="day-panel">
            ${dayTasks.length === 0 ? `
              <div style="text-align: center; padding: 30px; color: #666;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">✅</div>
                <p>Brak zadań na ten dzień</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${dayTasks.map(t => `
                  <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${t.status === 'completed' ? '#4CAF50' : t.priority === 'high' ? '#F44336' : '#FF9800'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong>${t.title}</strong>
                      <span style="font-size: 0.8rem; padding: 4px 8px; border-radius: 12px; background: ${t.status === 'completed' ? '#e8f5e9' : '#fff3e0'}; color: ${t.status === 'completed' ? '#2e7d32' : '#e65100'};">
                        ${t.status === 'completed' ? '✅ Ukończone' : t.status === 'in_progress' ? '🔄 W trakcie' : '⏳ Do zrobienia'}
                      </span>
                    </div>
                    ${t.description ? `<p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #666;">${t.description.substring(0, 100)}${t.description.length > 100 ? '...' : ''}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            `}
          </div>
          
          <!-- Panel: Wydarzenia -->
          <div id="day-panel-events" class="day-panel" style="display: none;">
            ${dayEvents.length === 0 ? `
              <div style="text-align: center; padding: 30px; color: #666;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">📆</div>
                <p>Brak wydarzeń na ten dzień</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${dayEvents.map(e => `
                  <div style="padding: 12px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196F3;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong>${e.title || e.name}</strong>
                      ${e.time || e.start_time ? `<span style="color: #1565c0;">⏰ ${e.time || e.start_time}</span>` : ''}
                    </div>
                    ${e.description || e.location ? `<p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #666;">${e.description || e.location}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            `}
          </div>
          
          <!-- Panel: Rezerwacja biura -->
          <div id="day-panel-booking" class="day-panel" style="display: none;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">🪑 Wybierz zasób</label>
              <select id="modal-resource" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;"
                      onchange="employeeDashboard.checkModalAvailability('${date}')">
                ${resources.map(r => `
                  <option value="${r.id}">
                    ${r.type === 'desk' ? '🪑' : '🏛️'} ${r.name} ${r.type === 'conference_room' ? `(do ${r.capacity} osób)` : ''}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">⏰ Od godziny</label>
                <select id="modal-start" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;"
                        onchange="employeeDashboard.updateModalEndTime()">
                  ${Array.from({length: 10}, (_, i) => i + 8).map(h => `
                    <option value="${String(h).padStart(2, '0')}:00">${String(h).padStart(2, '0')}:00</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">⏰ Do godziny</label>
                <select id="modal-end" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                  ${Array.from({length: 10}, (_, i) => i + 9).map(h => `
                    <option value="${String(h).padStart(2, '0')}:00">${String(h).padStart(2, '0')}:00</option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">📝 Cel wizyty (opcjonalnie)</label>
              <input type="text" id="modal-purpose" placeholder="np. Spotkanie z klientem..."
                     style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
            </div>
            
            <div id="modal-availability" style="padding: 12px; border-radius: 8px; margin-bottom: 15px; background: #e8f5e9; color: #2e7d32;">
              ✅ Sprawdzanie dostępności...
            </div>
            
            <div style="padding: 10px; border-radius: 8px; margin-bottom: 15px; background: #fff3e0; color: #e65100; font-size: 0.85rem;">
              ⏰ Rezerwację można złożyć minimum <strong>12 godzin</strong> przed terminem
            </div>
            
            <button onclick="employeeDashboard.submitModalBooking('${date}')" 
                    style="width: 100%; padding: 14px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
              ✅ Zarezerwuj biuro
            </button>
          </div>
          
          <!-- Panel: Notatka -->
          <div id="day-panel-notes" class="day-panel" style="display: none;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">📝 Notatka na ten dzień</label>
              <textarea id="modal-note" placeholder="Wpisz notatkę, przypomnienie lub plan na ten dzień..."
                        style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; box-sizing: border-box; min-height: 150px; resize: vertical;">${existingNote}</textarea>
            </div>
            <button onclick="employeeDashboard.saveNote('${date}')" 
                    style="width: 100%; padding: 14px; background: #9C27B0; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
              💾 Zapisz notatkę
            </button>
          </div>
          
          <!-- Przycisk zamknij -->
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <button onclick="document.getElementById('booking-modal').remove()" 
                    style="width: 100%; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
              Zamknij
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Zamknij po kliknięciu w tło
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Sprawdź dostępność biura
    this.checkModalAvailability(date);
  }
  
  switchDayTab(tabName) {
    // Ukryj wszystkie panele
    document.querySelectorAll('.day-panel').forEach(p => p.style.display = 'none');
    // Resetuj style zakładek
    document.querySelectorAll('.day-tab').forEach(t => {
      t.style.background = '#e0e0e0';
      t.style.color = '#333';
    });
    // Pokaż wybrany panel
    document.getElementById(`day-panel-${tabName}`).style.display = 'block';
    // Aktywuj zakładkę
    const activeTab = document.getElementById(`day-tab-${tabName}`);
    activeTab.style.background = '#3B82F6';
    activeTab.style.color = 'white';
  }
  
  async saveNote(date) {
    const note = document.getElementById('modal-note').value;
    
    try {
      await window.api.request('/work-schedule/entry', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: this.userId,
          date: date,
          status: 'zdalna', // Zachowaj domyślny status
          notes: note
        })
      });
      
      this.showNotification('💾 Notatka zapisana!', 'Twoja notatka została zapisana w grafiku.', 'success');
      this.loadScheduleTab();
    } catch (error) {
      this.showNotification('❌ Błąd', error.message, 'error');
    }
  }
  
  async checkModalAvailability(date) {
    const resourceId = document.getElementById('modal-resource')?.value;
    const infoDiv = document.getElementById('modal-availability');
    if (!resourceId || !infoDiv) return;
    
    try {
      const res = await window.api.request(`/office-booking/availability/${resourceId}/${date}`);
      const slots = res.slots || [];
      const availableSlots = slots.filter(s => s.available);
      
      if (availableSlots.length === 0) {
        infoDiv.style.background = '#ffebee';
        infoDiv.style.color = '#c62828';
        infoDiv.innerHTML = '❌ Brak wolnych terminów. Wybierz inny zasób.';
      } else if (availableSlots.length < slots.length) {
        infoDiv.style.background = '#fff3e0';
        infoDiv.style.color = '#e65100';
        const bookedBy = res.bookings.map(b => `${b.start_time.substring(0,5)}-${b.end_time.substring(0,5)}: ${b.user_name}`).join(', ');
        infoDiv.innerHTML = `⚠️ Częściowo zajęte: ${bookedBy}`;
      } else {
        infoDiv.style.background = '#e8f5e9';
        infoDiv.style.color = '#2e7d32';
        infoDiv.innerHTML = '✅ Zasób dostępny cały dzień!';
      }
    } catch (error) {
      infoDiv.innerHTML = '❌ Błąd sprawdzania dostępności';
    }
  }
  
  updateModalEndTime() {
    const startSelect = document.getElementById('modal-start');
    const endSelect = document.getElementById('modal-end');
    if (!startSelect || !endSelect) return;
    
    const startHour = parseInt(startSelect.value.split(':')[0]);
    endSelect.innerHTML = '';
    
    for (let h = startHour + 1; h <= 18; h++) {
      const option = document.createElement('option');
      option.value = `${String(h).padStart(2, '0')}:00`;
      option.textContent = `${String(h).padStart(2, '0')}:00`;
      endSelect.appendChild(option);
    }
  }
  
  async submitModalBooking(date) {
    const resourceId = document.getElementById('modal-resource').value;
    const startTime = document.getElementById('modal-start').value;
    const endTime = document.getElementById('modal-end').value;
    const purpose = document.getElementById('modal-purpose').value;
    
    try {
      const res = await window.api.request('/office-booking/book', {
        method: 'POST',
        body: JSON.stringify({
          resource_id: parseInt(resourceId),
          user_id: this.userId,
          date,
          start_time: startTime,
          end_time: endTime,
          purpose
        })
      });
      
      if (res.success) {
        document.getElementById('booking-modal').remove();
        this.showNotification('✅ Rezerwacja utworzona!', 'Twoje miejsce w biurze zostało zarezerwowane.', 'success');
        this.loadScheduleTab();
      } else {
        this.showNotification('❌ Nie można zarezerwować', res.error || 'Ten termin jest już zajęty. Wybierz inny zasób lub godziny.', 'error');
      }
    } catch (error) {
      this.showNotification('❌ Błąd', error.message, 'error');
    }
  }
  
  // Ładny modal z komunikatem
  showNotification(title, message, type = 'info') {
    const colors = {
      success: { bg: '#4CAF50', icon: '✅' },
      error: { bg: '#F44336', icon: '❌' },
      warning: { bg: '#FF9800', icon: '⚠️' },
      info: { bg: '#2196F3', icon: 'ℹ️' }
    };
    const color = colors[type] || colors.info;
    
    const notification = document.createElement('div');
    notification.id = 'notification-modal';
    notification.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.4); display: flex; align-items: center;
      justify-content: center; z-index: 10001; animation: fadeIn 0.2s ease;
    `;
    
    notification.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      </style>
      <div style="
        background: white; border-radius: 16px; width: 90%; max-width: 400px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;
        animation: slideIn 0.3s ease;
      ">
        <div style="background: ${color.bg}; padding: 25px; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 10px;">${color.icon}</div>
          <h3 style="margin: 0; color: white; font-size: 1.3rem;">${title}</h3>
        </div>
        <div style="padding: 25px; text-align: center;">
          <p style="margin: 0 0 20px 0; color: #555; font-size: 1rem; line-height: 1.5;">${message}</p>
          <button onclick="document.getElementById('notification-modal').remove()" 
                  style="padding: 12px 40px; background: ${color.bg}; color: white; border: none; 
                         border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;
                         transition: transform 0.2s, box-shadow 0.2s;"
                  onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 15px ${color.bg}50';"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
            OK
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Zamknij po kliknięciu w tło
    notification.addEventListener('click', (e) => {
      if (e.target === notification) notification.remove();
    });
    
    // Zamknij po ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        notification.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
}

// Global instance
window.EmployeeDashboard = EmployeeDashboard;

console.log('✅ EmployeeDashboard class ready with HR modules!');

