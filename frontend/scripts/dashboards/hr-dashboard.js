/**
 * HR DASHBOARD - Panel Zarządzania Pracownikami
 * Wersja: 2.0 FULL - Wszystkie funkcje
 * Funkcje: Lista, edycja, finanse, urlopy, szkolenia, statystyki
 */

console.log('%c🏢 HR DASHBOARD V2.0 FULL - Loaded!', 'background: #10B981; color: white; font-size: 16px; font-weight: bold; padding: 10px;');

class HRDashboard {
  constructor() {
    this.employees = [];
    this.selectedEmployee = null;
    this.currentTab = 'personal'; // Aktualna zakładka w widoku szczegółów
    this.filters = {
      search: '',
      role: 'all',
      status: 'all'
    };
    this.currentView = 'list'; // 'list' lub 'details'
  }

  async init() {
    console.log('🔄 HR Dashboard - Inicjalizacja...');
    await this.loadEmployees();
    this.render();
  }

  async loadEmployees() {
    try {
      console.log('📋 Ładowanie listy pracowników...');
      const response = await api.request('/users');
      if (response.success) {
        this.employees = response.users.filter(u => u.role !== 'client');
        console.log(`✅ Załadowano ${this.employees.length} pracowników`);
      }
    } catch (error) {
      console.error('❌ Błąd ładowania pracowników:', error);
      this.employees = [];
    }
  }

  async loadEmployeeDetails(userId) {
    try {
      console.log(`📊 Ładowanie szczegółów pracownika ${userId}...`);
      
      const [profile, tasks, vacations, trainings, financial, activity, loginHistory, reviews, salaryHistory] = await Promise.all([
        api.request(`/employees/${userId}/profile`).catch(() => ({ profile: null })),
        api.request(`/employees/${userId}/tasks`).catch(() => ({ tasks: [] })),
        api.request(`/employees/${userId}/vacations`).catch(() => ({ vacations: [] })),
        api.request(`/hr-training/${userId}`).catch(() => ({ trainings: [] })),
        api.request(`/employees/${userId}/finances/summary`).catch(() => ({ summary: null })),
        api.request(`/employees/${userId}/activity`).catch(() => ({ activities: [] })),
        api.request(`/employees/${userId}/login-history`).catch(() => ({ logins: [] })),
        api.request(`/employees/${userId}/reviews`).catch(() => ({ reviews: [] })),
        api.request(`/employees/${userId}/salary-history`).catch(() => ({ salaries: [], stats: null }))
      ]);

      this.selectedEmployee = {
        ...this.employees.find(e => e.id === userId),
        profile: profile?.profile || null,
        tasks: tasks?.tasks || [],
        vacations: vacations?.vacations || [],
        trainings: trainings?.trainings || [],
        financial: financial?.summary || null,
        activity: activity?.activities || [],
        loginHistory: loginHistory?.logins || [],
        reviews: reviews?.reviews || [],
        salaryHistory: salaryHistory?.salaries || [],
        salaryStats: salaryHistory?.stats || null
      };

      console.log('✅ Szczegóły pracownika załadowane:', this.selectedEmployee);
      this.currentView = 'details';
      this.render();
    } catch (error) {
      console.error('❌ Błąd ładowania szczegółów:', error);
    }
  }

  render() {
    const container = document.getElementById('hr-dashboardView');
    if (!container) {
      console.error('❌ Kontener #hr-dashboardView nie istnieje!');
      return;
    }

    container.innerHTML = `
      <style>
        .hr-dashboard {
          padding: 30px;
          background: #f5f5f5;
          min-height: 100vh;
        }
        
        .hr-header {
          background: linear-gradient(135deg, #10B981, #059669);
          padding: 30px;
          border-radius: 12px;
          color: white;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .hr-header h1 {
          margin: 0;
          font-size: 2rem;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .hr-filters {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .hr-filter-item {
          flex: 1;
          min-width: 200px;
        }
        
        .hr-filter-item label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .hr-filter-item input,
        .hr-filter-item select {
          width: 100%;
          padding: 10px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .hr-filter-item input:focus,
        .hr-filter-item select:focus {
          outline: none;
          border-color: #10B981;
        }
        
        .employees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .employee-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .employee-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .employee-card-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .employee-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
        }
        
        .employee-info h3 {
          margin: 0 0 5px 0;
          color: #1F2937;
          font-size: 1.1rem;
        }
        
        .employee-role {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: #DBEAFE;
          color: #1E40AF;
        }
        
        .employee-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 15px;
        }
        
        .employee-stat {
          text-align: center;
          padding: 10px;
          background: #F9FAFB;
          border-radius: 8px;
        }
        
        .employee-stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #10B981;
        }
        
        .employee-stat-label {
          font-size: 0.75rem;
          color: #6B7280;
          margin-top: 4px;
        }
        
        .back-button {
          background: #6B7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .back-button:hover {
          background: #4B5563;
        }
        
        .employee-details {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .details-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid #E5E7EB;
          margin-bottom: 30px;
        }
        
        .details-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 36px;
          font-weight: 700;
        }
        
        .details-info h2 {
          margin: 0 0 10px 0;
          color: #1F2937;
        }
        
        .details-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #E5E7EB;
          overflow-x: auto;
        }
        
        .details-tab {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          color: #6B7280;
          white-space: nowrap;
          transition: all 0.3s;
        }
        
        .details-tab.active {
          color: #10B981;
          border-bottom-color: #10B981;
        }
        
        .details-tab:hover {
          color: #059669;
        }
        
        .details-content {
          padding: 20px 0;
        }
        
        .info-group {
          margin-bottom: 30px;
        }
        
        .info-group h3 {
          color: #1F2937;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          padding: 15px;
          background: #F9FAFB;
          border-radius: 8px;
        }
        
        .info-label {
          font-size: 0.85rem;
          color: #6B7280;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 1rem;
          color: #1F2937;
          font-weight: 600;
        }
        
        .edit-button {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 10px;
        }
        
        .edit-button:hover {
          background: #2563EB;
        }
      </style>
      
      <div class="hr-dashboard">
        ${this.currentView === 'list' ? this.renderEmployeesList() : this.renderEmployeeDetails()}
      </div>
    `;
  }

  renderEmployeesList() {
    const filteredEmployees = this.getFilteredEmployees();
    
    return `
      <div class="hr-header">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h1>
              <span>🏢</span>
              <span>Panel Zarządzania Pracownikami</span>
            </h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Zarządzaj danymi, urlopami, szkoleniami i statystykami pracowników</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="/hr-panel.html" target="_blank" 
              style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; white-space: nowrap;">
              📋 Panel Wniosków
            </a>
          </div>
        </div>
      </div>
      
      <div class="hr-filters">
        <div class="hr-filter-item">
          <label>🔍 Szukaj</label>
          <input type="text" placeholder="Imię, nazwisko, email..." 
            onkeyup="window.hrDashboard.updateFilter('search', this.value)">
        </div>
        
        <div class="hr-filter-item">
          <label>👔 Rola</label>
          <select onchange="window.hrDashboard.updateFilter('role', this.value)">
            <option value="all">Wszystkie</option>
            <option value="admin">Admin</option>
            <option value="lawyer">Lawyer</option>
            <option value="hr">HR</option>
            <option value="finance">Finance</option>
            <option value="case_manager">Case Manager</option>
          </select>
        </div>
        
        <div class="hr-filter-item">
          <label>📊 Status</label>
          <select onchange="window.hrDashboard.updateFilter('status', this.value)">
            <option value="all">Wszystkie</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      
      <div style="margin-bottom: 20px; color: #6B7280;">
        Znaleziono: <strong>${filteredEmployees.length}</strong> pracowników
      </div>
      
      <div class="employees-grid">
        ${filteredEmployees.map(emp => this.renderEmployeeCard(emp)).join('')}
      </div>
    `;
  }

  renderEmployeeCard(employee) {
    const roleColors = {
      admin: '#EF4444',
      lawyer: '#3B82F6',
      hr: '#10B981',
      finance: '#F59E0B',
      case_manager: '#8B5CF6'
    };
    
    const roleName = {
      admin: 'Administrator',
      lawyer: 'Prawnik',
      hr: 'HR',
      finance: 'Finanse',
      case_manager: 'Case Manager'
    };
    
    const initials = employee.initials || employee.name?.substring(0, 2).toUpperCase() || '?';
    
    return `
      <div class="employee-card" onclick="window.hrDashboard.loadEmployeeDetails(${employee.id})">
        <div class="employee-card-header">
          <div class="employee-avatar">${initials}</div>
          <div class="employee-info">
            <h3>${employee.name || 'Brak nazwy'}</h3>
            <span class="employee-role" style="background-color: ${roleColors[employee.role]}20; color: ${roleColors[employee.role]};">
              ${roleName[employee.role] || employee.role}
            </span>
          </div>
        </div>
        
        <div style="color: #6B7280; font-size: 0.9rem; margin-bottom: 15px;">
          📧 ${employee.email}
        </div>
        
        <div class="employee-stats">
          <div class="employee-stat">
            <div class="employee-stat-value">-</div>
            <div class="employee-stat-label">Zadania</div>
          </div>
          <div class="employee-stat">
            <div class="employee-stat-value">-</div>
            <div class="employee-stat-label">Sprawy</div>
          </div>
          <div class="employee-stat">
            <div class="employee-stat-value">-</div>
            <div class="employee-stat-label">Godziny</div>
          </div>
        </div>
      </div>
    `;
  }

  renderEmployeeDetails() {
    if (!this.selectedEmployee) {
      return '<div>Ładowanie...</div>';
    }
    
    const emp = this.selectedEmployee;
    const initials = emp.initials || emp.name?.substring(0, 2).toUpperCase() || '?';
    
    return `
      <button class="back-button" onclick="window.hrDashboard.backToList()">
        ← Powrót do listy
      </button>
      
      <div class="employee-details">
        <div class="details-header">
          <div class="details-avatar">${initials}</div>
          <div class="details-info">
            <h2>${emp.name}</h2>
            <div style="color: #6B7280; margin: 5px 0;">📧 ${emp.email}</div>
            <div style="color: #6B7280;">👔 ${emp.role}</div>
          </div>
        </div>
        
        <div class="details-tabs">
          <button class="details-tab active" onclick="hrDashboard.switchDetailsTab(this, 'personal')">
            👤 Dane Osobowe
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'family')">
            👨‍👩‍👧‍👦 Rodzina
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'education')">
            🎓 Wykształcenie
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'finance')">
            💰 Finanse
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'vacations')">
            🏖️ Urlopy
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'trainings')">
            🎓 Szkolenia
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'cv')">
            💼 CV
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'documents')">
            📄 Dokumenty
          </button>
          <button class="details-tab" onclick="hrDashboard.switchDetailsTab(this, 'stats')">
            📊 Statystyki
          </button>
        </div>
        
        <div class="details-content" id="detailsContent">
          ${this.renderTabContent('personal')}
        </div>
      </div>
    `;
  }

  renderPersonalData() {
    const emp = this.selectedEmployee;
    const profile = emp.profile || {};
    
    return `
      <div class="info-group">
        <h3>Dane Osobowe</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Imię i Nazwisko</div>
            <div class="info-value">${emp.name || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${emp.email || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefon</div>
            <div class="info-value">${profile.phone || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Adres</div>
            <div class="info-value">${profile.address || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">PESEL</div>
            <div class="info-value">${profile.pesel || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Dowód osobisty</div>
            <div class="info-value">${profile.id_number || '-'}</div>
          </div>
        </div>
        <button class="edit-button" onclick="window.hrDashboard.editPersonalData()">
          ✏️ Edytuj dane osobowe
        </button>
      </div>
      
      <div class="info-group">
        <h3>Zatrudnienie</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Stanowisko</div>
            <div class="info-value">${profile.position || emp.role || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data zatrudnienia</div>
            <div class="info-value">${profile.hire_date || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Typ umowy</div>
            <div class="info-value">${profile.contract_type || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Wynagrodzenie brutto</div>
            <div class="info-value">${profile.salary ? profile.salary + ' PLN' : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Konto bankowe</div>
            <div class="info-value">${profile.bank_account || '-'}</div>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredEmployees() {
    return this.employees.filter(emp => {
      // Filtr wyszukiwania
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase();
        const nameMatch = emp.name?.toLowerCase().includes(search);
        const emailMatch = emp.email?.toLowerCase().includes(search);
        if (!nameMatch && !emailMatch) return false;
      }
      
      // Filtr roli
      if (this.filters.role !== 'all' && emp.role !== this.filters.role) {
        return false;
      }
      
      // Filtr statusu
      if (this.filters.status !== 'all' && emp.status !== this.filters.status) {
        return false;
      }
      
      return true;
    });
  }

  updateFilter(filterName, value) {
    this.filters[filterName] = value;
    this.render();
  }

  backToList() {
    this.currentView = 'list';
    this.selectedEmployee = null;
    this.render();
  }

  async switchDetailsTab(button, tab) {
    document.querySelectorAll('.details-tab').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');
    this.currentTab = tab;
    
    const content = document.getElementById('detailsContent');
    if (content) {
      // Zakładki z Employee Dashboard - ładowane dynamicznie
      if (['documents', 'vacations', 'trainings', 'cv'].includes(tab)) {
        content.innerHTML = '<div style="padding: 40px; text-align: center;"><div style="font-size: 2rem; margin-bottom: 10px;">⏳</div><p>Ładowanie...</p></div>';
        await this.loadEmployeeDashboardTab(tab);
      } else {
        content.innerHTML = this.renderTabContent(tab);
        
        // Po wyrenderowaniu Finance - załaduj prowizje
        if (tab === 'finance' && this.selectedEmployee) {
          this.loadCommissionsForEmployee(this.selectedEmployee.id);
        }
      }
    }
  }
  
  async loadEmployeeDashboardTab(tab) {
    const content = document.getElementById('detailsContent');
    const emp = this.selectedEmployee;
    
    try {
      switch(tab) {
        case 'vacations':
          await this.renderVacations();
          break;
        case 'trainings':
          await this.renderTrainings();
          break;
        case 'documents':
          await this.renderDocuments();
          break;
        case 'cv':
          await this.renderCVData();
          break;
      }
    } catch (error) {
      console.error(`❌ Błąd ładowania ${tab}:`, error);
      content.innerHTML = `<div style="padding: 40px; text-align: center; color: red;">❌ Błąd ładowania: ${error.message}</div>`;
    }
  }
  
  async renderVacations() {
    const content = document.getElementById('detailsContent');
    const emp = this.selectedEmployee;
    content.innerHTML = '<div style="padding: 40px; text-align: center;"><div style="font-size: 2rem; margin-bottom: 10px;">⏳</div><p>Ładowanie urlopów...</p></div>';
    
    try {
      const [balanceRes, vacationsRes] = await Promise.all([
        api.request(`/hr-vacations/${emp.id}/balance?year=${new Date().getFullYear()}`),
        api.request(`/hr-vacations/${emp.id}/list`)
      ]);
      
      const balance = balanceRes.balance || {};
      const vacations = vacationsRes.vacations || [];
      
      content.innerHTML = `
        <div class="info-group">
          <h3>🏖️ Urlopy Pracownika</h3>
          
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

          <button onclick="hrDashboard.showRequestVacationModal()" 
                  style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Złóż wniosek urlopowy dla pracownika
          </button>

          <!-- Lista wniosków -->
          <h4>📋 Wnioski urlopowe</h4>
          ${vacations.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 12px; text-align: left;">Typ</th>
                  <th style="padding: 12px; text-align: left;">Od - Do</th>
                  <th style="padding: 12px; text-align: center;">Dni</th>
                  <th style="padding: 12px; text-align: center;">Status</th>
                  ${this.canApproveVacations() ? '<th style="padding: 12px; text-align: center;">Akcje</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${vacations.map(v => `
                  <tr style="border-bottom: 1px solid #ecf0f1;">
                    <td style="padding: 12px;">${this.getVacationType(v.vacation_type)}</td>
                    <td style="padding: 12px;">${new Date(v.start_date).toLocaleDateString('pl-PL')} - ${new Date(v.end_date).toLocaleDateString('pl-PL')}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 600;">${v.days_count}</td>
                    <td style="padding: 12px; text-align: center;">${this.getVacationStatus(v.status)}</td>
                    ${this.canApproveVacations() && v.status === 'pending' ? `
                      <td style="padding: 12px; text-align: center;">
                        <button onclick="hrDashboard.approveVacation(${v.id})" style="padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px;">✓ Zatwierdź</button>
                        <button onclick="hrDashboard.rejectVacation(${v.id})" style="padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer;">✗ Odrzuć</button>
                      </td>
                    ` : this.canApproveVacations() ? '<td></td>' : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="text-align: center; color: #999; padding: 20px;">Brak wniosków urlopowych</p>'}
        </div>
      `;
    } catch (error) {
      console.error('❌ Błąd ładowania urlopów:', error);
      content.innerHTML = '<div class="error">Błąd ładowania danych urlopów</div>';
    }
  }
  
  renderTabContent(tab) {
    switch(tab) {
      case 'personal': return this.renderPersonalData();
      case 'family': return this.renderFamilyData();
      case 'education': return this.renderEducationData();
      case 'finance': return this.renderFinanceData();
      case 'vacations': return this.renderVacationsData();
      case 'trainings': return this.renderTrainingsData();
      case 'cv': return this.renderCVData();
      case 'stats': return this.renderStatsData();
      default: return '<div>Zakładka w przygotowaniu...</div>';
    }
  }

  renderFamilyData() {
    const profile = this.selectedEmployee.profile || {};
    return `
      <div class="info-group">
        <h3>Dane Kontaktowe Rodziny</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Osoba kontaktowa</div>
            <div class="info-value">${profile.emergency_contact_name || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefon kontaktowy</div>
            <div class="info-value">${profile.emergency_contact_phone || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Stopień pokrewieństwa</div>
            <div class="info-value">${profile.emergency_contact_relation || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Adres kontaktowy</div>
            <div class="info-value">${profile.emergency_contact_address || '-'}</div>
          </div>
        </div>
        <button class="edit-button" onclick="window.hrDashboard.editFamilyData()">
          ✏️ Edytuj dane rodziny
        </button>
      </div>
    `;
  }
  
  renderEducationData() {
    const profile = this.selectedEmployee.profile || {};
    return `
      <div class="info-group">
        <h3>Wykształcenie</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Poziom wykształcenia</div>
            <div class="info-value">${profile.education_level || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Uczelnia/Szkoła</div>
            <div class="info-value">${profile.school_name || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Kierunek</div>
            <div class="info-value">${profile.field_of_study || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Rok ukończenia</div>
            <div class="info-value">${profile.graduation_year || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Stopień naukowy</div>
            <div class="info-value">${profile.degree || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Specjalizacje</div>
            <div class="info-value">${profile.specializations || '-'}</div>
          </div>
        </div>
        <button class="edit-button" onclick="window.hrDashboard.editEducationData()">
          ✏️ Edytuj wykształcenie
        </button>
      </div>
    `;
  }
  
  renderFinanceData() {
    const emp = this.selectedEmployee;
    const financial = emp.financial || {};
    const profile = emp.profile || {};
    const rateChanges = financial.rate_changes || [];
    
    return `
      <div class="info-group">
        <h3>💼 Dane Kontraktowe i Bankowe</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Wynagrodzenie brutto</div>
            <div class="info-value">${profile.salary ? profile.salary + ' PLN' : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Konto bankowe</div>
            <div class="info-value">${profile.bank_account || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Typ umowy</div>
            <div class="info-value">${profile.contract_type || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data umowy</div>
            <div class="info-value">${profile.contract_start_date || '-'} ${profile.contract_end_date ? ' - ' + profile.contract_end_date : ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Godziny tygodniowo</div>
            <div class="info-value">${profile.work_hours_per_week ? profile.work_hours_per_week + ' h' : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">NIP</div>
            <div class="info-value">${profile.nip || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Urząd Skarbowy</div>
            <div class="info-value">${profile.tax_office || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Ubezpieczenie</div>
            <div class="info-value">${profile.insurance_type || '-'}</div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button class="edit-button" onclick="window.hrDashboard.editFinanceData()">
            ✏️ Edytuj dane finansowe
          </button>
          ${profile.contract_file_url ? 
            `<a href="/api/employees/${emp.id}/download-contract" target="_blank" 
              style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              📄 Pobierz umowę
            </a>` : 
            '<div style="padding: 10px 20px; background: #F3F4F6; color: #6B7280; border-radius: 8px; font-size: 0.9rem;">Brak umowy</div>'}
        </div>
      </div>
      
      <!-- PROWIZJE - PEŁNY WIDOK -->
      <div class="info-group">
        <h3>💰 Prowizje Pracownika</h3>
        <div id="hrCommissionsContainer">
          <div style="text-align: center; padding: 20px; color: #666;">
            <p>🔄 Ładowanie prowizji...</p>
          </div>
        </div>
      </div>
      
      <!-- Historia zmian stawki -->
      ${rateChanges.length > 0 ? `
        <div class="info-group">
          <h3>📊 Historia Zmian Stawki</h3>
          <div style="max-height: 200px; overflow-y: auto;">
            ${rateChanges.map(rc => `
              <div style="padding: 10px; margin-bottom: 8px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f39c12;">
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
                <div style="margin-top: 6px; font-size: 0.85em; color: #92400e;">
                  <strong>Powód:</strong> ${rc.change_reason || '-'}
                  ${rc.comment ? ` | 💬 ${rc.comment}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="info-group">
        <h3>💵 Historia Wypłat Pensji</h3>
        ${this.renderSalaryHistory(emp.salaryHistory || [])}
      </div>
    `;
  }
  
  // Ładowanie prowizji dla pracownika w HR Dashboard
  async loadCommissionsForEmployee(userId) {
    const container = document.getElementById('hrCommissionsContainer');
    if (!container) return;
    
    try {
      const response = await api.request(`/payments/user-commissions/${userId}`);
      
      if (response.success) {
        const { commissions, stats } = response;
        
        // Oblicz statystyki
        const rejected = commissions.filter(c => c.status === 'rejected');
        const rejectedAmount = rejected.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
        const approved = commissions.filter(c => c.status === 'approved');
        const approvedAmount = approved.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
        
        if (!commissions || commissions.length === 0) {
          container.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">📋 Brak prowizji</div>`;
          return;
        }
        
        container.innerHTML = `
          <!-- Statystyki -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
            <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.2em; font-weight: 700; color: #2e7d32;">${(stats.paid_amount || 0).toFixed(2)} PLN</div>
              <div style="color: #388e3c; font-size: 0.8em;">💵 Do wypłaty</div>
            </div>
            <div style="background: #fff3e0; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.2em; font-weight: 700; color: #ef6c00;">${(stats.pending_amount || 0).toFixed(2)} PLN</div>
              <div style="color: #f57c00; font-size: 0.8em;">⏳ Oczekujące</div>
            </div>
            <div style="background: #e3f2fd; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.2em; font-weight: 700; color: #1565c0;">${approvedAmount.toFixed(2)} PLN</div>
              <div style="color: #1976d2; font-size: 0.8em;">✔️ Zatwierdzone</div>
            </div>
            <div style="background: #ffebee; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.2em; font-weight: 700; color: #c62828;">${rejectedAmount.toFixed(2)} PLN</div>
              <div style="color: #c62828; font-size: 0.8em;">❌ Odrzucone (${rejected.length})</div>
            </div>
          </div>
          
          <!-- Lista prowizji -->
          <div style="max-height: 300px; overflow-y: auto;">
            ${commissions.map(c => {
              const statusColors = {
                paid: { bg: '#e8f5e9', color: '#2e7d32', label: '💵 Do wypłaty' },
                pending: { bg: '#fff3e0', color: '#ef6c00', label: '⏳ Oczekuje' },
                approved: { bg: '#e3f2fd', color: '#1565c0', label: '✔️ Zatwierdzone' },
                rejected: { bg: '#ffebee', color: '#c62828', label: '❌ Odrzucone' }
              };
              const st = statusColors[c.status] || statusColors.pending;
              const rate = c.commission_rate || c.rate || 0;
              
              return `
              <div style="padding: 12px; margin-bottom: 8px; border-radius: 8px; background: ${st.bg}; border-left: 4px solid ${st.color};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${c.payment_code || c.case_number || 'Prowizja #' + c.id}</div>
                    <div style="font-size: 0.85em; color: #666;">${c.client_name || '-'} • ${new Date(c.created_at).toLocaleDateString('pl-PL')}</div>
                    <div style="font-size: 0.8em; color: #888; margin-top: 4px;">
                      💵 Płatność: ${(c.payment_amount || 0).toFixed(2)} PLN • 
                      <strong style="color: #7c3aed;">Stawka: ${rate}%</strong>
                    </div>
                  </div>
                  <div style="text-align: right; min-width: 100px;">
                    <div style="font-weight: 700; font-size: 1.1em; color: ${st.color};">${(c.commission_amount || 0).toFixed(2)} PLN</div>
                    <div style="font-size: 0.75em; color: ${st.color};">${st.label}</div>
                  </div>
                </div>
                ${c.description && c.description.includes('Edycja') ? `
                  <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 6px; border: 1px solid #bae6fd;">
                    <div style="font-size: 0.85em; color: #0369a1;">
                      ✏️ ${c.description.split('|').filter(p => p.includes('Edycja')).map(e => e.trim()).join(' | ')}
                    </div>
                  </div>
                ` : ''}
                ${c.status === 'rejected' ? `
                  <div style="margin-top: 8px; padding: 8px; background: #fff5f5; border-radius: 6px; border: 1px solid #ffcdd2;">
                    <div style="font-size: 0.85em; color: #c62828;">
                      ❌ <strong>Powód:</strong> ${c.rejection_reason || 'Brak powodu'}
                    </div>
                  </div>
                ` : ''}
              </div>`;
            }).join('')}
          </div>
        `;
      }
    } catch (error) {
      console.error('Błąd ładowania prowizji:', error);
      container.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">📋 Brak prowizji</div>`;
    }
  }
  
  renderRecentPayments(payments) {
    if (!payments.length) {
      return '<div style="padding: 20px; text-align: center; color: #6B7280;">Brak wypłat</div>';
    }
    
    return `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB;">
              <th style="padding: 12px; text-align: left;">Data</th>
              <th style="padding: 12px; text-align: left;">Kwota</th>
              <th style="padding: 12px; text-align: left;">Typ</th>
              <th style="padding: 12px; text-align: left;">Opis</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(p => `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px;">${p.payment_date || '-'}</td>
                <td style="padding: 12px; font-weight: 600;">${p.amount?.toFixed(2) || '0.00'} PLN</td>
                <td style="padding: 12px;">${p.payment_type || '-'}</td>
                <td style="padding: 12px;">${p.description || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  renderSalaryHistory(salaries) {
    if (!salaries.length) {
      return '<div style="padding: 20px; text-align: center; color: #6B7280;">Brak historii wypłat</div>';
    }
    
    return `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB;">
              <th style="padding: 12px; text-align: left;">Okres</th>
              <th style="padding: 12px; text-align: left;">Brutto</th>
              <th style="padding: 12px; text-align: left;">Netto</th>
              <th style="padding: 12px; text-align: left;">Data wypłaty</th>
            </tr>
          </thead>
          <tbody>
            ${salaries.map(s => `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px;">${s.month}/${s.year}</td>
                <td style="padding: 12px; font-weight: 600;">${s.gross_amount?.toFixed(2) || '0.00'} PLN</td>
                <td style="padding: 12px; font-weight: 600; color: #10B981;">${s.net_amount?.toFixed(2) || '0.00'} PLN</td>
                <td style="padding: 12px;">${s.payment_date || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  renderVacationsData() {
    const vacations = this.selectedEmployee.vacations || [];
    
    return `
      <div class="info-group">
        <h3>Wnioski Urlopowe</h3>
        ${vacations.length === 0 ? 
          '<div style="padding: 20px; text-align: center; color: #6B7280;">Brak wniosków urlopowych</div>' :
          `<div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB;">
                  <th style="padding: 12px; text-align: left;">Typ</th>
                  <th style="padding: 12px; text-align: left;">Od</th>
                  <th style="padding: 12px; text-align: left;">Do</th>
                  <th style="padding: 12px; text-align: left;">Dni</th>
                  <th style="padding: 12px; text-align: left;">Status</th>
                  <th style="padding: 12px; text-align: left;">Akcje</th>
                </tr>
              </thead>
              <tbody>
                ${vacations.map(v => `
                  <tr style="border-bottom: 1px solid #E5E7EB;">
                    <td style="padding: 12px;">${v.vacation_type || '-'}</td>
                    <td style="padding: 12px;">${v.start_date || '-'}</td>
                    <td style="padding: 12px;">${v.end_date || '-'}</td>
                    <td style="padding: 12px;">${v.days_count || 0}</td>
                    <td style="padding: 12px;">
                      <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; 
                        background-color: ${v.status === 'approved' ? '#D1FAE5' : v.status === 'pending' ? '#FEF3C7' : '#FEE2E2'};
                        color: ${v.status === 'approved' ? '#065F46' : v.status === 'pending' ? '#92400E' : '#991B1B'};">
                        ${v.status === 'approved' ? 'Zaakceptowany' : v.status === 'pending' ? 'Oczekujący' : 'Odrzucony'}
                      </span>
                    </td>
                    <td style="padding: 12px;">
                      ${v.status === 'pending' ? 
                        `<button onclick="window.hrDashboard.approveVacation(${v.id})" style="padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px;">✓ Akceptuj</button>
                         <button onclick="window.hrDashboard.rejectVacation(${v.id})" style="padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer;">✗ Odrzuć</button>` :
                        '-'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`
        }
        <button class="edit-button" onclick="window.hrDashboard.addVacation()">
          ➕ Dodaj urlop
        </button>
      </div>
    `;
  }
  
  renderTrainingsData() {
    const trainings = this.selectedEmployee.trainings || [];
    
    return `
      <div class="info-group">
        <h3>Szkolenia</h3>
        ${trainings.length === 0 ?
          '<div style="padding: 20px; text-align: center; color: #6B7280;">Brak szkoleń</div>' :
          `<div style="display: grid; gap: 15px;">
            ${trainings.map(t => `
              <div style="padding: 20px; background: #F9FAFB; border-radius: 12px; border-left: 4px solid #10B981;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                  <h4 style="margin: 0; color: #1F2937;">${t.training_name || 'Brak nazwy'}</h4>
                  <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
                    background-color: ${t.status === 'completed' ? '#D1FAE5' : t.status === 'in_progress' ? '#DBEAFE' : '#FEF3C7'};
                    color: ${t.status === 'completed' ? '#065F46' : t.status === 'in_progress' ? '#1E40AF' : '#92400E'};">
                    ${t.status === 'completed' ? 'Ukończone' : t.status === 'in_progress' ? 'W trakcie' : 'Zaplanowane'}
                  </span>
                </div>
                <div style="color: #6B7280; font-size: 0.9rem;">
                  📅 ${t.start_date || '-'} ${t.end_date ? ' - ' + t.end_date : ''}
                </div>
                <div style="color: #6B7280; font-size: 0.9rem; margin-top: 5px;">
                  📍 ${t.location || '-'} | ⏱️ ${t.duration_hours || 0}h
                </div>
                ${t.certificate_url ? 
                  `<div style="margin-top: 10px;">
                    <a href="${t.certificate_url}" target="_blank" style="color: #3B82F6; text-decoration: none;">📜 Zobacz certyfikat</a>
                  </div>` : ''}
              </div>
            `).join('')}
          </div>`
        }
        <button class="edit-button" onclick="window.hrDashboard.addTraining()">
          ➕ Dodaj szkolenie
        </button>
      </div>
    `;
  }
  
  renderStatsData() {
    const emp = this.selectedEmployee;
    const tasks = emp.tasks || [];
    const activity = emp.activity || [];
    
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const taskCompletion = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    
    return `
      <div class="info-group">
        <h3>Statystyki Pracy</h3>
        <div class="info-grid">
          <div class="info-item" style="background: #DBEAFE;">
            <div class="info-label">Wszystkie zadania</div>
            <div class="info-value">${totalTasks}</div>
          </div>
          <div class="info-item" style="background: #D1FAE5;">
            <div class="info-label">Zadania ukończone</div>
            <div class="info-value">${completedTasks}</div>
          </div>
          <div class="info-item" style="background: #FEF3C7;">
            <div class="info-label">Procent ukończenia</div>
            <div class="info-value">${taskCompletion}%</div>
          </div>
          <div class="info-item" style="background: #E0E7FF;">
            <div class="info-label">Aktywność (ostatni miesiąc)</div>
            <div class="info-value">${activity.length}</div>
          </div>
        </div>
      </div>
      
      <div class="info-group">
        <h3>Ostatnia Aktywność</h3>
        ${activity.length === 0 ?
          '<div style="padding: 20px; text-align: center; color: #6B7280;">Brak aktywności</div>' :
          `<div style="max-height: 400px; overflow-y: auto;">
            ${activity.slice(0, 20).map(a => `
              <div style="padding: 15px; border-bottom: 1px solid #E5E7EB; display: flex; gap: 15px;">
                <div style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: #DBEAFE; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                  ${this.getActivityIcon(a.action_type)}
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #1F2937;">${a.description || a.action_type}</div>
                  <div style="font-size: 0.85rem; color: #6B7280; margin-top: 4px;">
                    ${new Date(a.created_at).toLocaleString('pl-PL')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>`
        }
      </div>
    `;
  }
  
  getActivityIcon(actionType) {
    const icons = {
      'task_created': '✅',
      'case_assigned': '⚖️',
      'document_upload': '📄',
      'client_added': '👤',
      'payment_created': '💰',
      'event_created': '📅',
      'comment_added': '💬'
    };
    return icons[actionType] || '📋';
  }
  
  async renderCVData() {
    const emp = this.selectedEmployee;
    const profile = emp.profile || {};
    const content = document.getElementById('detailsContent');
    
    content.innerHTML = '<div style="padding: 40px; text-align: center;"><div style="font-size: 2rem; margin-bottom: 10px;">⏳</div><p>Ładowanie CV...</p></div>';
    
    // Pobierz CV z dokumentów
    let cvDoc = null;
    try {
      const res = await api.request(`/hr-documents/${emp.id}/list`);
      const docs = res.documents || [];
      cvDoc = docs.find(d => d.document_type === 'cv' || d.title?.toLowerCase().includes('cv'));
    } catch (e) {
      console.log('Błąd pobierania CV:', e);
    }
    
    // Fallback na stare cv_file_url
    const hasCV = cvDoc || profile.cv_file_url;
    
    content.innerHTML = `
      <div class="info-group">
        <h3>💼 CV Pracownika</h3>
        
        ${hasCV ? `
          <div style="padding: 20px; background: #F0FDF4; border: 2px solid #10B981; border-radius: 12px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
              <div style="font-size: 3rem;">📄</div>
              <div>
                <div style="font-weight: 600; color: #1F2937; font-size: 1.1rem;">CV jest dostępne</div>
                <div style="color: #6B7280; font-size: 0.9rem;">
                  Przesłano: ${cvDoc ? new Date(cvDoc.uploaded_at).toLocaleString('pl-PL') : (profile.cv_uploaded_at ? new Date(profile.cv_uploaded_at).toLocaleString('pl-PL') : 'Brak daty')}
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${cvDoc ? `
                <button onclick="hrDashboard.previewDocument(${cvDoc.id})" 
                  style="padding: 10px 20px; background: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  👁️ Podgląd
                </button>
                <button onclick="hrDashboard.downloadDocument(${cvDoc.id})" 
                  style="padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  📥 Pobierz CV
                </button>
              ` : `
                <button onclick="hrDashboard.previewLegacyCV(${emp.id})" 
                  style="padding: 10px 20px; background: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  👁️ Podgląd
                </button>
                <button onclick="hrDashboard.downloadLegacyCV(${emp.id})" 
                  style="padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  📥 Pobierz CV
                </button>
              `}
              <button onclick="hrDashboard.uploadCV()" 
                style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                🔄 Zamień CV
              </button>
            </div>
          </div>
        ` : `
          <div style="padding: 40px; background: #FEF3C7; border: 2px dashed #F59E0B; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 4rem; margin-bottom: 15px;">📄</div>
            <h3 style="color: #92400E; margin-bottom: 10px;">Brak CV</h3>
            <p style="color: #78350F; margin-bottom: 20px;">Pracownik nie przesłał jeszcze swojego CV</p>
            <button onclick="hrDashboard.uploadCV()" 
              style="padding: 12px 30px; background: #F59E0B; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1.05rem;">
              📤 Prześlij CV
            </button>
          </div>
        `}
        
        <div style="padding: 20px; background: #F9FAFB; border-radius: 12px;">
          <h4 style="margin: 0 0 10px 0; color: #1F2937;">ℹ️ Informacje</h4>
          <ul style="margin: 0; padding-left: 20px; color: #6B7280;">
            <li>Akceptowane formaty: PDF, DOC, DOCX</li>
            <li>Maksymalny rozmiar pliku: 10 MB</li>
            <li>CV pracownika będzie widoczne dla HR i Admina</li>
            <li>Pracownik może również przesłać swoje CV przez własny dashboard</li>
          </ul>
        </div>
      </div>
    `;
  }
  
  // Dokumenty, Urlopy i Szkolenia są ładowane z Employee Dashboard przez loadEmployeeDashboardTab()
  
  uploadCV() {
    const emp = this.selectedEmployee;
    
    this.showModal('Prześlij CV pracownika', `
      <div style="display: grid; gap: 15px;">
        <div style="padding: 15px; background: #EFF6FF; border-radius: 8px;">
          <p style="margin: 0; color: #1E40AF; font-weight: 600;">📤 Wybierz plik CV</p>
          <p style="margin: 5px 0 0 0; color: #3B82F6; font-size: 0.9rem;">Formaty: PDF, DOC, DOCX | Max: 10 MB</p>
        </div>
        <input type="file" id="cv-file-input" accept=".pdf,.doc,.docx" 
          style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px;">
      </div>
    `, async () => {
      const fileInput = document.getElementById('cv-file-input');
      
      if (!fileInput.files || fileInput.files.length === 0) {
        alert('❌ Wybierz plik CV!');
        return;
      }
      
      const formData = new FormData();
      formData.append('cv', fileInput.files[0]);
      
      try {
        const response = await fetch(`${api.baseURL}/employees/${emp.id}/upload-cv`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('✅ CV przesłane pomyślnie!');
          await this.loadEmployeeDetails(emp.id);
          // Odśwież zakładkę CV
          const cvTabBtn = document.querySelector('.details-tab[onclick*="cv"]');
          if (cvTabBtn) {
            this.switchDetailsTab(cvTabBtn, 'cv');
          }
        } else {
          throw new Error(result.message || 'Błąd uploadu');
        }
      } catch (error) {
        alert('❌ Błąd: ' + (error.message || 'Nieznany błąd'));
      }
    });
  }
  
  // uploadDocument() i deleteDocument() usunięte - teraz używamy Employee Dashboard
  
  // Funkcje akcji - MODALS
  editPersonalData() {
    const emp = this.selectedEmployee;
    const profile = emp.profile || {};
    
    this.showModal('Edycja danych osobowych', `
      <div style="display: grid; gap: 15px;">
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">PESEL</label>
          <input type="text" id="edit-pesel" value="${profile.pesel || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Numer dowodu osobistego</label>
          <input type="text" id="edit-id-number" value="${profile.id_number || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Adres</label>
          <textarea id="edit-address" rows="3" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">${profile.address || ''}</textarea>
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Telefon</label>
          <input type="text" id="edit-phone" value="${profile.phone || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
      </div>
    `, async () => {
      const data = {
        pesel: document.getElementById('edit-pesel').value,
        id_number: document.getElementById('edit-id-number').value,
        address: document.getElementById('edit-address').value,
        phone: document.getElementById('edit-phone').value
      };
      
      try {
        const response = await api.request(`/employees/${emp.id}/personal-data`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (response.success) {
          alert('✅ Dane osobowe zaktualizowane!');
          await this.loadEmployeeDetails(emp.id);
        }
      } catch (error) {
        alert('❌ Błąd: ' + (error.message || 'Nieznany błąd'));
      }
    });
  }
  
  editFamilyData() {
    const emp = this.selectedEmployee;
    const profile = emp.profile || {};
    
    this.showModal('Edycja danych rodziny', `
      <div style="display: grid; gap: 15px;">
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Osoba kontaktowa</label>
          <input type="text" id="edit-contact-name" value="${profile.emergency_contact_name || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Telefon kontaktowy</label>
          <input type="text" id="edit-contact-phone" value="${profile.emergency_contact_phone || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Stopień pokrewieństwa</label>
          <input type="text" id="edit-contact-relation" value="${profile.emergency_contact_relation || ''}" 
            placeholder="np. Mąż, Żona, Matka, Ojciec"
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Adres kontaktowy</label>
          <textarea id="edit-contact-address" rows="3" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">${profile.emergency_contact_address || ''}</textarea>
        </div>
      </div>
    `, async () => {
      const data = {
        emergency_contact_name: document.getElementById('edit-contact-name').value,
        emergency_contact_phone: document.getElementById('edit-contact-phone').value,
        emergency_contact_relation: document.getElementById('edit-contact-relation').value,
        emergency_contact_address: document.getElementById('edit-contact-address').value
      };
      
      try {
        const response = await api.request(`/employees/${emp.id}/family-data`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (response.success) {
          alert('✅ Dane rodziny zaktualizowane!');
          await this.loadEmployeeDetails(emp.id);
        }
      } catch (error) {
        alert('❌ Błąd: ' + (error.message || 'Nieznany błąd'));
      }
    });
  }
  
  editEducationData() {
    const emp = this.selectedEmployee;
    const profile = emp.profile || {};
    
    this.showModal('Edycja wykształcenia', `
      <div style="display: grid; gap: 15px;">
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Poziom wykształcenia</label>
          <select id="edit-education-level" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
            <option value="">- Wybierz -</option>
            <option value="podstawowe" ${profile.education_level === 'podstawowe' ? 'selected' : ''}>Podstawowe</option>
            <option value="średnie" ${profile.education_level === 'średnie' ? 'selected' : ''}>Średnie</option>
            <option value="wyższe licencjat" ${profile.education_level === 'wyższe licencjat' ? 'selected' : ''}>Wyższe (licencjat)</option>
            <option value="wyższe magisterskie" ${profile.education_level === 'wyższe magisterskie' ? 'selected' : ''}>Wyższe (magisterskie)</option>
            <option value="doktorat" ${profile.education_level === 'doktorat' ? 'selected' : ''}>Doktorat</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Uczelnia/Szkoła</label>
          <input type="text" id="edit-school-name" value="${profile.school_name || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Kierunek</label>
          <input type="text" id="edit-field-of-study" value="${profile.field_of_study || ''}" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Rok ukończenia</label>
          <input type="text" id="edit-graduation-year" value="${profile.graduation_year || ''}" 
            placeholder="np. 2020"
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Stopień naukowy</label>
          <input type="text" id="edit-degree" value="${profile.degree || ''}" 
            placeholder="np. Mgr, Dr, Prof."
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Specjalizacje</label>
          <textarea id="edit-specializations" rows="3" 
            placeholder="np. Prawo karne, Prawo cywilne"
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">${profile.specializations || ''}</textarea>
        </div>
      </div>
    `, async () => {
      const data = {
        education_level: document.getElementById('edit-education-level').value,
        school_name: document.getElementById('edit-school-name').value,
        field_of_study: document.getElementById('edit-field-of-study').value,
        graduation_year: document.getElementById('edit-graduation-year').value,
        degree: document.getElementById('edit-degree').value,
        specializations: document.getElementById('edit-specializations').value
      };
      
      try {
        const response = await api.request(`/employees/${emp.id}/education-data`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (response.success) {
          alert('✅ Wykształcenie zaktualizowane!');
          await this.loadEmployeeDetails(emp.id);
        }
      } catch (error) {
        alert('❌ Błąd: ' + (error.message || 'Nieznany błąd'));
      }
    });
  }
  
  editFinanceData() {
    const emp = this.selectedEmployee;
    const profile = emp.profile || {};
    
    this.showModal('Edycja danych finansowych', `
      <div style="display: grid; gap: 15px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Wynagrodzenie brutto (PLN)</label>
            <input type="number" id="edit-salary" value="${profile.salary || ''}" 
              placeholder="np. 5000"
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Godziny/tydzień</label>
            <input type="number" id="edit-work-hours" value="${profile.work_hours_per_week || ''}" 
              placeholder="np. 40"
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
          </div>
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Numer konta bankowego</label>
          <input type="text" id="edit-bank-account" value="${profile.bank_account || ''}" 
            placeholder="PL 00 0000 0000 0000 0000 0000 0000"
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Typ umowy</label>
            <select id="edit-contract-type" 
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
              <option value="">- Wybierz -</option>
              <option value="Umowa o pracę" ${profile.contract_type === 'Umowa o pracę' ? 'selected' : ''}>Umowa o pracę</option>
              <option value="Umowa zlecenie" ${profile.contract_type === 'Umowa zlecenie' ? 'selected' : ''}>Umowa zlecenie</option>
              <option value="Umowa o dzieło" ${profile.contract_type === 'Umowa o dzieło' ? 'selected' : ''}>Umowa o dzieło</option>
              <option value="Kontrakt B2B" ${profile.contract_type === 'Kontrakt B2B' ? 'selected' : ''}>Kontrakt B2B</option>
              <option value="Umowa na czas nieokreślony" ${profile.contract_type === 'Umowa na czas nieokreślony' ? 'selected' : ''}>Umowa na czas nieokreślony</option>
              <option value="Umowa na czas określony" ${profile.contract_type === 'Umowa na czas określony' ? 'selected' : ''}>Umowa na czas określony</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Typ ubezpieczenia</label>
            <select id="edit-insurance-type" 
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
              <option value="">- Wybierz -</option>
              <option value="ZUS" ${profile.insurance_type === 'ZUS' ? 'selected' : ''}>ZUS</option>
              <option value="KRUS" ${profile.insurance_type === 'KRUS' ? 'selected' : ''}>KRUS</option>
              <option value="Brak" ${profile.insurance_type === 'Brak' ? 'selected' : ''}>Brak</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Data rozpoczęcia umowy</label>
            <input type="date" id="edit-contract-start" value="${profile.contract_start_date || ''}" 
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Data zakończenia umowy</label>
            <input type="date" id="edit-contract-end" value="${profile.contract_end_date || ''}" 
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">NIP</label>
            <input type="text" id="edit-nip" value="${profile.nip || ''}" 
              placeholder="0000000000"
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Urząd Skarbowy</label>
            <input type="text" id="edit-tax-office" value="${profile.tax_office || ''}" 
              placeholder="np. US Warszawa Śródmieście"
              style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">
          </div>
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 5px;">Notatki finansowe</label>
          <textarea id="edit-financial-notes" rows="3" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px;">${profile.financial_notes || ''}</textarea>
        </div>
        
        <div style="padding: 15px; background: #FEF3C7; border-radius: 8px; border-left: 4px solid #F59E0B;">
          <label style="display: block; font-weight: 600; margin-bottom: 10px;">📄 Upload umowy (PDF)</label>
          <input type="file" id="edit-contract-file" accept=".pdf" 
            style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; background: white;">
          <div style="margin-top: 5px; font-size: 0.85rem; color: #92400E;">
            ${profile.contract_file_url ? '✅ Umowa już przesłana. Wybierz nowy plik aby zastąpić.' : 'Wybierz plik PDF z umową pracownika'}
          </div>
        </div>
      </div>
    `, async () => {
      const data = {
        monthly_salary: document.getElementById('edit-salary').value,
        bank_account: document.getElementById('edit-bank-account').value,
        contract_type: document.getElementById('edit-contract-type').value,
        contract_start_date: document.getElementById('edit-contract-start').value,
        contract_end_date: document.getElementById('edit-contract-end').value,
        tax_office: document.getElementById('edit-tax-office').value,
        nip: document.getElementById('edit-nip').value,
        insurance_type: document.getElementById('edit-insurance-type').value,
        work_hours_per_week: document.getElementById('edit-work-hours').value,
        financial_notes: document.getElementById('edit-financial-notes').value
      };
      
      try {
        // Najpierw zapisz dane finansowe
        const response = await api.request(`/employees/${emp.id}/financial-data`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (!response.success) {
          throw new Error(response.message || 'Błąd zapisu danych');
        }
        
        // Jeśli wybrano plik, wyślij umowę
        const fileInput = document.getElementById('edit-contract-file');
        if (fileInput.files.length > 0) {
          const formData = new FormData();
          formData.append('contract', fileInput.files[0]);
          
          const uploadResponse = await fetch(`${api.baseURL}/employees/${emp.id}/upload-contract`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
          
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResult.success) {
            throw new Error('Błąd uploadu umowy: ' + uploadResult.message);
          }
          
          alert('✅ Dane finansowe i umowa zaktualizowane!');
        } else {
          alert('✅ Dane finansowe zaktualizowane!');
        }
        
        await this.loadEmployeeDetails(emp.id);
        
      } catch (error) {
        alert('❌ Błąd: ' + (error.message || 'Nieznany błąd'));
      }
    });
  }
  
  // Funkcja pomocnicza do pokazywania modali
  showModal(title, content, onSave) {
    const modalHTML = `
      <div id="hrModal" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
          <h2 style="margin: 0 0 20px 0; color: #1F2937;">${title}</h2>
          <div style="margin-bottom: 20px;">
            ${content}
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="document.getElementById('hrModal').remove()" 
              style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Anuluj
            </button>
            <button id="modalSaveBtn" 
              style="padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              💾 Zapisz
            </button>
          </div>
        </div>
      </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);
    
    document.getElementById('modalSaveBtn').onclick = async () => {
      document.getElementById('modalSaveBtn').disabled = true;
      document.getElementById('modalSaveBtn').textContent = '⏳ Zapisywanie...';
      await onSave();
      document.getElementById('hrModal').remove();
    };
  }
  
  async approveVacation(vacationId) {
    if (!confirm('Czy na pewno chcesz zaakceptować ten wniosek urlopowy?')) return;
    
    try {
      const response = await api.request(`/hr-vacations/${vacationId}/approve`, {
        method: 'POST'
      });
      
      if (response.success) {
        alert('✅ Wniosek został zaakceptowany!');
        await this.loadEmployeeDetails(this.selectedEmployee.id);
      }
    } catch (error) {
      console.error('Błąd akceptacji urlopu:', error);
      alert('❌ Błąd podczas akceptacji wniosku: ' + (error.message || 'Nieznany błąd'));
    }
  }
  
  async rejectVacation(vacationId) {
    const reason = prompt('Podaj powód odrzucenia:');
    if (!reason) return;
    
    try {
      const response = await api.request(`/hr-vacations/${vacationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejection_reason: reason })
      });
      
      if (response.success) {
        alert('✅ Wniosek został odrzucony');
        await this.loadEmployeeDetails(this.selectedEmployee.id);
      }
    } catch (error) {
      console.error('Błąd odrzucenia urlopu:', error);
      alert('❌ Błąd podczas odrzucania wniosku: ' + (error.message || 'Nieznany błąd'));
    }
  }
  
  // Helper functions for vacations
  canApproveVacations() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return ['admin', 'hr'].includes(user.role);
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
    const emp = this.selectedEmployee;
    
    const modalHTML = `
      <div id="vacationModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
          <h3 style="margin: 0 0 20px 0;">🏖️ Wniosek urlopowy dla ${emp.name}</h3>
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
        const res = await api.request(`/hr-vacations/${emp.id}/request`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        if (res.success) {
          alert('✅ Wniosek urlopowy został złożony!');
          document.getElementById('vacationModal').remove();
          await this.renderVacations();
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
  }
  
  async approveVacation(vacationId) {
    if (!confirm('Czy na pewno chcesz zatwierdzić ten wniosek urlopowy?')) return;
    
    try {
      const response = await api.request(`/hr-vacations/${vacationId}/approve`, {
        method: 'POST'
      });
      
      if (response.success) {
        alert('✅ Wniosek został zaakceptowany!');
        await this.renderVacations();
      }
    } catch (error) {
      console.error('Błąd akceptacji urlopu:', error);
      alert('❌ Błąd podczas akceptacji wniosku: ' + (error.message || 'Nieznany błąd'));
    }
  }
  
  async rejectVacation(vacationId) {
    const reason = prompt('Podaj powód odrzucenia:');
    if (!reason) return;
    
    try {
      const response = await api.request(`/hr-vacations/${vacationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejection_reason: reason })
      });
      
      if (response.success) {
        alert('✅ Wniosek został odrzucony');
        await this.renderVacations();
      }
    } catch (error) {
      console.error('Błąd odrzucenia urlopu:', error);
      alert('❌ Błąd podczas odrzucania wniosku: ' + (error.message || 'Nieznany błąd'));
    }
  }
  
  async renderTrainings() {
    const content = document.getElementById('detailsContent');
    const emp = this.selectedEmployee;
    content.innerHTML = '<div style="padding: 40px; text-align: center;"><div style="font-size: 2rem; margin-bottom: 10px;">⏳</div><p>Ładowanie szkoleń...</p></div>';
    
    try {
      const res = await api.request(`/hr-training/${emp.id}/list`);
      const trainings = res.trainings || [];
      
      content.innerHTML = `
        <div class="info-group">
          <h3>🎓 Szkolenia Pracownika</h3>
          
          <button type="button" id="btnAddTraining"
                  style="padding: 12px 24px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Dodaj szkolenie
          </button>

          ${trainings.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 15px;">
              ${trainings.map(t => `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; ${t.status === 'cancelled' ? 'border-left: 4px solid #EF5350;' : t.status === 'in_progress' && t.approved_by ? 'border-left: 4px solid #66BB6A;' : t.status === 'planned' ? 'border-left: 4px solid #FFA726;' : 'border-left: 4px solid #42A5F5;'}">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                      <div style="font-weight: 600; font-size: 1.1rem; color: #1a1a1a;">${this.getTrainingTypeIcon(t.training_type)} ${t.title}</div>
                      <div style="color: #333; font-size: 0.9rem; margin-top: 5px; font-weight: 500;">
                        ${t.provider ? `Organizator: ${t.provider}` : ''}
                        ${t.start_date ? ` • Data: ${new Date(t.start_date).toLocaleDateString('pl-PL')}` : ''}
                        ${t.cost ? ` • Koszt: ${t.cost} PLN` : ''}
                      </div>
                    </div>
                    <span style="padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; ${this.getTrainingStatusStyle(t)}">${this.getTrainingStatusLabel(t)}</span>
                  </div>
                  
                  ${t.description ? `<div style="color: #1a1a1a; margin: 10px 0; font-size: 0.95rem;">${t.description}</div>` : ''}
                  
                  ${t.approval_notes ? `
                    <div style="background: #e8f5e9; border-left: 3px solid #66BB6A; padding: 10px 15px; border-radius: 4px; margin-top: 10px; color: #1b5e20;">
                      <strong>📝 Notatka HR:</strong> ${t.approval_notes}
                    </div>
                  ` : ''}
                  
                  ${t.rejection_reason ? `
                    <div style="background: #ffebee; border-left: 3px solid #EF5350; padding: 10px 15px; border-radius: 4px; margin-top: 10px; color: #b71c1c;">
                      <strong>❌ Powód odrzucenia:</strong> ${t.rejection_reason}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p style="text-align: center; color: #999; padding: 40px;">Brak szkoleń</p>'}
        </div>
      `;
      
      // Dodaj event listener do przycisku
      const btnAdd = document.getElementById('btnAddTraining');
      if (btnAdd) {
        btnAdd.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showAddTrainingModal();
        });
      }
    } catch (error) {
      console.error('❌ Błąd ładowania szkoleń:', error);
      content.innerHTML = '<div class="error">Błąd ładowania szkoleń</div>';
    }
  }
  
  getTrainingTypeIcon(type) {
    const icons = {
      'course': '📚 Kurs',
      'certification': '📜 Certyfikacja',
      'conference': '🎤 Konferencja',
      'workshop': '🛠️ Warsztat',
      'webinar': '💻 Webinar',
      'other': '📝 Inne'
    };
    return icons[type] || '📚';
  }
  
  getTrainingStatusLabel(training) {
    // Jeśli cancelled = odrzucone
    if (training.status === 'cancelled') {
      return '❌ Odrzucone';
    }
    // Jeśli in_progress i ma approved_by = zaakceptowane
    if (training.status === 'in_progress' && training.approved_by) {
      return '✅ Zaakceptowane';
    }
    // Jeśli planned = oczekujące
    if (training.status === 'planned') {
      return '⏳ Oczekujące';
    }
    // Jeśli completed = ukończone
    if (training.status === 'completed') {
      return '🏆 Ukończone';
    }
    // Domyślnie in_progress
    return '🔄 W trakcie';
  }
  
  getTrainingStatusStyle(training) {
    if (training.status === 'cancelled') {
      return 'background: #ffebee; color: #c62828;';
    }
    if (training.status === 'in_progress' && training.approved_by) {
      return 'background: #e8f5e9; color: #2e7d32;';
    }
    if (training.status === 'planned') {
      return 'background: #fff3e0; color: #e65100;';
    }
    if (training.status === 'completed') {
      return 'background: #e3f2fd; color: #1565c0;';
    }
    return 'background: #f5f5f5; color: #666;';
  }
  
  async renderDocuments() {
    const content = document.getElementById('detailsContent');
    const emp = this.selectedEmployee;
    content.innerHTML = '<div style="padding: 40px; text-align: center;"><div style="font-size: 2rem; margin-bottom: 10px;">⏳</div><p>Ładowanie dokumentów...</p></div>';
    
    try {
      const res = await api.request(`/hr-documents/${emp.id}/list`);
      const documents = res.documents || [];
      
      content.innerHTML = `
        <div class="info-group">
          <h3>📄 Dokumenty Pracownika</h3>
          
          <button onclick="hrDashboard.showUploadDocumentModal()" 
                  style="padding: 12px 24px; background: #F59E0B; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">
            ➕ Prześlij dokument
          </button>
          
          ${documents.length > 0 ? `
            <div style="display: grid; gap: 15px;">
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
                    <button onclick="hrDashboard.previewDocument(${d.id})" 
                            style="background: #6366F1; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                      👁️ Podgląd
                    </button>
                    <button onclick="hrDashboard.downloadDocument(${d.id})" 
                            style="background: #3B82F6; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                      📥 Pobierz
                    </button>
                    ${!d.is_verified ? `
                      <button onclick="hrDashboard.verifyDocument(${d.id})" 
                              style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                        ✓ Zweryfikuj
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="text-align: center; color: #1a1a1a; padding: 40px;">Brak dokumentów</p>'}
        </div>
      `;
    } catch (error) {
      console.error('❌ Błąd ładowania dokumentów:', error);
      content.innerHTML = '<div class="error">Błąd ładowania dokumentów</div>';
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
  
  async showAddTrainingModal() {
    console.log('🎓 showAddTrainingModal() wywołane');
    const emp = this.selectedEmployee;
    
    if (!emp) {
      console.error('❌ Brak wybranego pracownika!');
      alert('Błąd: Nie wybrano pracownika');
      return;
    }
    
    // Usuń istniejący modal jeśli istnieje
    const existingModal = document.getElementById('trainingModal');
    if (existingModal) {
      console.log('🗑️ Usuwam istniejący modal');
      existingModal.remove();
    }
    
    console.log('📝 Tworzę modal dla:', emp.name);
    
    const modalHTML = `
      <div id="trainingModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999;">
        <div id="trainingModalContent" style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <h3 style="margin: 0 0 20px 0;">🎓 Dodaj szkolenie dla ${emp.name}</h3>
          <form id="trainingForm">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
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
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Status:</label>
                <select name="status" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                  <option value="planned">📅 Planowane</option>
                  <option value="in_progress">🔄 W trakcie</option>
                  <option value="completed">✅ Ukończone</option>
                  <option value="cancelled">❌ Anulowane</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nazwa szkolenia:</label>
              <input type="text" name="title" required placeholder="np. Kurs zarządzania projektami" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dostawca/Organizator:</label>
              <input type="text" name="provider" placeholder="np. Akademia Umiejętności" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Opis:</label>
              <textarea name="description" rows="3" placeholder="Opis szkolenia..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data rozpoczęcia:</label>
                <input type="date" name="start_date" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data ukończenia:</label>
                <input type="date" name="completion_date" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Czas trwania (h):</label>
                <input type="number" name="duration_hours" placeholder="24" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Koszt (PLN):</label>
                <input type="number" name="cost" placeholder="1500" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data ważności certyfikatu:</label>
                <input type="date" name="certificate_expiry" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" id="btnCancelTraining"
                      style="padding: 10px 20px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ✓ Dodaj szkolenie
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Modal wstawiony do DOM');
    
    const modal = document.getElementById('trainingModal');
    const modalContent = document.getElementById('trainingModalContent');
    const btnCancel = document.getElementById('btnCancelTraining');
    const form = document.getElementById('trainingForm');
    
    // Zamknij modal po kliknięciu na tło (ale nie na content)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        console.log('🔴 Kliknięto na tło - zamykam modal');
        modal.remove();
      }
    });
    
    // Zatrzymaj propagację kliknięć wewnątrz modala
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Przycisk Anuluj
    btnCancel.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔴 Kliknięto Anuluj - zamykam modal');
      modal.remove();
    });
    
    // Form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📤 Wysyłam formularz...');
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        const res = await api.request(`/hr-training/${emp.id}/add`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        if (res.success) {
          alert('✅ Szkolenie dodane pomyślnie!');
          modal.remove();
          await this.renderTrainings();
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
    
    console.log('✅ Event listenery dodane');
  }
  
  async showUploadDocumentModal() {
    const emp = this.selectedEmployee;
    
    const modalHTML = `
      <div id="documentModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%;">
          <h3 style="margin: 0 0 20px 0;">📄 Prześlij dokument dla ${emp.name}</h3>
          <form id="documentForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Typ dokumentu:</label>
              <select name="document_type" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                <option value="contract">📝 Umowa</option>
                <option value="annex">📑 Aneks</option>
                <option value="certificate">🎓 Certyfikat</option>
                <option value="diploma">🎓 Dyplom</option>
                <option value="id_card">🪪 Dowód osobisty</option>
                <option value="medical_exam">🏥 Badania lekarskie</option>
                <option value="safety_training">⚠️ Szkolenie BHP</option>
                <option value="nda">🔒 NDA</option>
                <option value="other">📄 Inne</option>
              </select>
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nazwa dokumentu:</label>
              <input type="text" name="title" required placeholder="np. Umowa o pracę" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
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
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notatki (opcjonalnie):</label>
              <textarea name="notes" rows="2" placeholder="Dodatkowe informacje..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Plik dokumentu:</label>
              <input type="file" name="document_file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                     style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
              <div style="margin-top: 5px; font-size: 0.85rem; color: #6B7280;">
                Akceptowane formaty: PDF, JPG, PNG, DOC, DOCX | Max: 10 MB
              </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" onclick="document.getElementById('documentModal').remove()" 
                      style="padding: 10px 20px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Anuluj
              </button>
              <button type="submit" 
                      style="padding: 10px 20px; background: #F59E0B; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ✓ Prześlij dokument
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
      
      try {
        const response = await fetch(`${api.baseURL}/hr-documents/${emp.id}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('✅ Dokument przesłany pomyślnie!');
          document.getElementById('documentModal').remove();
          await this.renderDocuments();
        } else {
          throw new Error(result.message || 'Błąd uploadu');
        }
      } catch (error) {
        alert('❌ Błąd: ' + error.message);
      }
    });
  }
  
  addVacation() {
    this.showRequestVacationModal();
  }
  
  addTraining() {
    this.showAddTrainingModal();
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
      
      if (!response.ok) throw new Error('Nie można załadować dokumentu');
      
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
            <button onclick="hrDashboard.downloadDocument(${docId}); document.getElementById('docPreviewModal').remove();"
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
  
  // Zweryfikuj dokument
  async verifyDocument(docId) {
    if (!confirm('Czy na pewno chcesz zweryfikować ten dokument?')) return;
    
    try {
      const res = await api.request(`/hr-documents/${docId}/verify`, {
        method: 'POST'
      });
      
      if (res.success) {
        alert('✅ Dokument zweryfikowany!');
        await this.renderDocuments();
      }
    } catch (error) {
      alert('❌ Błąd: ' + error.message);
    }
  }
  
  // Podgląd CV ze starego systemu (employee_profiles)
  async previewLegacyCV(userId) {
    const existingModal = document.getElementById('docPreviewModal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
      <div id="docPreviewModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 99999;">
        <div style="background: white; border-radius: 12px; width: 95%; max-width: 1200px; height: 90vh; display: flex; flex-direction: column; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; background: #f8f9fa;">
            <h3 style="margin: 0; color: #1a1a1a;">📄 Podgląd CV</h3>
            <button onclick="document.getElementById('docPreviewModal').remove()" 
                    style="background: #EF5350; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
              ✕ Zamknij
            </button>
          </div>
          <div id="docPreviewContent" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #f5f5f5; overflow: auto;">
            <div style="text-align: center;">
              <div style="font-size: 2rem;">⏳</div>
              <div style="margin-top: 10px; color: #333;">Ładowanie CV...</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('docPreviewModal').addEventListener('click', (e) => {
      if (e.target.id === 'docPreviewModal') document.getElementById('docPreviewModal').remove();
    });
    
    const token = localStorage.getItem('token');
    const url = `/api/hr-documents/cv/${userId}/preview`;
    const contentDiv = document.getElementById('docPreviewContent');
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Nie można załadować CV');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      if (blob.type === 'application/pdf') {
        contentDiv.innerHTML = `<iframe src="${blobUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
      } else {
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 4rem;">📄</div>
            <div style="margin-top: 15px; color: #333; font-size: 1.1rem;">Podgląd niedostępny dla tego formatu</div>
            <button onclick="hrDashboard.downloadLegacyCV(${userId}); document.getElementById('docPreviewModal').remove();"
                    style="margin-top: 20px; background: #3B82F6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              📥 Pobierz CV
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
  
  // Pobierz CV ze starego systemu
  async downloadLegacyCV(userId) {
    const token = localStorage.getItem('token');
    const url = `/api/hr-documents/cv/${userId}/download`;
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Nie można pobrać CV');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `CV_pracownik_${userId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      alert('❌ Błąd pobierania: ' + error.message);
    }
  }
}

// Eksportuj globalnie
window.HRDashboard = HRDashboard;
