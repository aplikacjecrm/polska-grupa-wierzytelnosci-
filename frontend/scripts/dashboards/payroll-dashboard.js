/**
 * Payroll Dashboard v2.0
 * Dział Płacowy - łączy HR i Finance
 * Odpowiedzialny za: wypłaty, wynagrodzenia, składki ZUS/US
 */

class PayrollDashboard {
  constructor() {
    console.log('💼 Payroll Dashboard v2.0');
    this.currentTab = 'overview';
    this.employees = [];
    this.commissions = [];
    this.totals = {};
  }

  async open() {
    console.log('💼 Otwieranie Payroll Dashboard');
    let container = document.getElementById('payrollDashboardContainer');
    
    if (!container) {
      const parentView = document.getElementById('payroll-dashboardView');
      if (!parentView) {
        console.error('❌ payroll-dashboardView nie istnieje!');
        return;
      }
      container = document.createElement('div');
      container.id = 'payrollDashboardContainer';
      parentView.innerHTML = '';
      parentView.appendChild(container);
    }
    
    await this.render();
    await this.loadData();
  }

  async render() {
    const container = document.getElementById('payrollDashboardContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div style="padding: 20px; background: linear-gradient(135deg, #1a2332 0%, #2d3748 100%); min-height: 100vh;">
        <div style="max-width: 1400px; margin: 0 auto;">
          <h1 style="color: white; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
            💼 Payroll Dashboard
            <span style="font-size: 0.5em; background: #10b981; padding: 4px 12px; border-radius: 20px;">v1.0</span>
          </h1>
          
          <!-- Tabs -->
          <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            ${this.renderTabs()}
          </div>
          
          <!-- Content -->
          <div id="payrollContent" style="background: white; border-radius: 12px; padding: 20px;">
            <div style="text-align: center; padding: 40px;">🔄 Ładowanie...</div>
          </div>
        </div>
      </div>
    `;
  }

  renderTabs() {
    const tabs = [
      { id: 'overview', icon: '📊', label: 'Przegląd' },
      { id: 'payouts', icon: '💰', label: 'Wypłaty Prowizji' },
      { id: 'salaries', icon: '💵', label: 'Wynagrodzenia' },
      { id: 'zus', icon: '🏛️', label: 'Składki ZUS' },
      { id: 'taxes', icon: '📋', label: 'Podatki US' },
      { id: 'reports', icon: '📈', label: 'Raporty' }
    ];
    
    return tabs.map(t => `
      <button onclick="payrollDashboard.switchTab('${t.id}')" 
        style="padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
          ${this.currentTab === t.id 
            ? 'background: #10b981; color: white;' 
            : 'background: rgba(255,255,255,0.1); color: white;'}">
        ${t.icon} ${t.label}
      </button>
    `).join('');
  }

  async switchTab(tab) {
    this.currentTab = tab;
    await this.render();
    await this.loadTabContent();
  }

  async loadData() {
    try {
      // Pobierz dane z API
      const [summaryRes, commissionsRes] = await Promise.all([
        api.request('/employees/payroll/summary'),
        api.request('/employees/payroll/commissions')
      ]);
      
      this.employees = summaryRes.employees || [];
      this.totals = summaryRes.totals || {};
      this.commissions = commissionsRes.commissions || [];
      
      console.log('✅ Payroll data loaded:', this.employees.length, 'employees,', this.commissions.length, 'commissions');
    } catch (error) {
      console.error('❌ Błąd ładowania danych payroll:', error);
    }
    
    await this.loadTabContent();
  }

  async loadTabContent() {
    const content = document.getElementById('payrollContent');
    if (!content) return;
    
    switch(this.currentTab) {
      case 'overview': await this.renderOverview(content); break;
      case 'payouts': await this.renderPayouts(content); break;
      case 'salaries': await this.renderSalaries(content); break;
      case 'zus': await this.renderZUS(content); break;
      case 'taxes': await this.renderTaxes(content); break;
      case 'reports': await this.renderReports(content); break;
    }
  }

  async renderOverview(container) {
    const totalSalaries = this.totals.total_salaries || 0;
    const totalPending = this.totals.total_pending_commissions || 0;
    const totalApproved = this.totals.total_approved_commissions || 0;
    
    container.innerHTML = `
      <h2 style="margin: 0 0 20px 0; color: #1a2332;">📊 Przegląd Payroll</h2>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; color: white;">
          <div style="font-size: 2em; font-weight: 700;">${this.employees.length}</div>
          <div>👥 Pracowników</div>
        </div>
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 12px; color: white;">
          <div style="font-size: 1.5em; font-weight: 700;">${totalPending.toFixed(2)} PLN</div>
          <div>💰 Do wypłaty (prowizje)</div>
        </div>
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px; color: white;">
          <div style="font-size: 1.5em; font-weight: 700;">${totalSalaries.toFixed(2)} PLN</div>
          <div>💵 Suma wynagrodzeń</div>
        </div>
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 20px; border-radius: 12px; color: white;">
          <div style="font-size: 1.5em; font-weight: 700;">${totalApproved.toFixed(2)} PLN</div>
          <div>✅ Zatwierdzone prowizje</div>
        </div>
      </div>
      
      <!-- Lista pracowników -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1e293b;">👥 Pracownicy - podsumowanie</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
            <thead>
              <tr style="background: #1e293b; color: white;">
                <th style="padding: 10px; text-align: left;">Pracownik</th>
                <th style="padding: 10px; text-align: left;">Stanowisko</th>
                <th style="padding: 10px; text-align: left;">Umowa</th>
                <th style="padding: 10px; text-align: right;">Pensja</th>
                <th style="padding: 10px; text-align: right;">Prowizje</th>
                <th style="padding: 10px; text-align: left;">Konto bankowe</th>
              </tr>
            </thead>
            <tbody>
              ${this.employees.map(e => `
                <tr style="border-bottom: 1px solid #cbd5e1; background: white;">
                  <td style="padding: 10px; color: #1e293b;">
                    <strong>${e.name}</strong><br>
                    <span style="font-size: 0.8em; color: #475569;">${e.email}</span>
                  </td>
                  <td style="padding: 10px; color: #334155;">${e.position}</td>
                  <td style="padding: 10px;">
                    <span style="background: ${this.getContractColor(e.contract_type)}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">
                      ${e.contract_type}
                    </span>
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: 600; color: #1e293b;">${e.salary > 0 ? e.salary.toFixed(2) + ' PLN' : '-'}</td>
                  <td style="padding: 10px; text-align: right; color: ${e.pending_commissions > 0 ? '#059669' : '#64748b'}; font-weight: 600;">
                    ${e.pending_commissions > 0 ? e.pending_commissions.toFixed(2) + ' PLN' : '-'}
                  </td>
                  <td style="padding: 10px; font-family: monospace; font-size: 0.85em; color: #334155;">
                    ${e.bank_account !== 'Brak' ? this.maskBankAccount(e.bank_account) : '<span style="color: #dc2626;">⚠️ Brak</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 15px 0;">⚡ Szybkie akcje</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="payrollDashboard.switchTab('payouts')" style="padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              💰 Wypłać prowizje (${this.commissions.length})
            </button>
            <button onclick="payrollDashboard.switchTab('salaries')" style="padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              💵 Generuj listę płac
            </button>
            <button onclick="payrollDashboard.switchTab('zus')" style="padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              🏛️ Rozlicz ZUS
            </button>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 15px 0;">📋 Terminy - ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
          <div style="font-size: 0.9em; color: #64748b;">
            ${this.renderDeadlines()}
          </div>
        </div>
      </div>
    `;
  }

  getContractColor(type) {
    const colors = {
      'Umowa o pracę': '#10b981',
      'Umowa zlecenie': '#3b82f6',
      'Umowa o dzieło': '#f59e0b',
      'B2B': '#8b5cf6'
    };
    return colors[type] || '#64748b';
  }

  maskBankAccount(account) {
    if (!account || account.length < 8) return account;
    return account.slice(0, 4) + ' **** **** ' + account.slice(-4);
  }

  renderDeadlines() {
    const today = new Date();
    const day = today.getDate();
    
    const deadlines = [
      { day: 10, label: 'Składki ZUS', color: day > 10 ? '#ef4444' : '#10b981', done: day > 10 },
      { day: 20, label: 'Zaliczka PIT', color: day > 20 ? '#ef4444' : '#f59e0b', done: day > 20 },
      { day: 31, label: 'Wypłata wynagrodzeń', color: '#3b82f6', done: false }
    ];
    
    return deadlines.map(d => `
      <div style="padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid ${d.color};">
        <strong>${d.day}. dzień</strong> - ${d.label}
        ${d.done ? '<span style="float: right; color: #ef4444;">⏰ Minął!</span>' : ''}
      </div>
    `).join('');
  }

  async renderPayouts(container) {
    const commissions = this.commissions;
    const total = commissions.reduce((s, c) => s + (c.amount || 0), 0);
    
    container.innerHTML = `
      <h2 style="margin: 0 0 20px 0; color: #1a2332;">💰 Wypłaty Prowizji</h2>
      <p style="color: #64748b; margin-bottom: 20px;">Prowizje oznaczone jako "Do wypłaty" - gotowe do przelewu na konta pracowników.</p>
      
      ${commissions.length === 0 ? `
        <div style="text-align: center; padding: 40px; background: #f0fdf4; border-radius: 12px;">
          <div style="font-size: 3em;">✅</div>
          <p style="color: #166534; font-weight: 600;">Wszystkie prowizje wypłacone!</p>
          <p style="color: #64748b;">Brak prowizji oczekujących na przelew.</p>
        </div>
      ` : `
        <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
          <button onclick="payrollDashboard.payAllCommissions()" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            💸 Przelej wszystkie (${commissions.length}) - ${total.toFixed(2)} PLN
          </button>
          <button onclick="payrollDashboard.loadData()" style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer;">
            🔄 Odśwież
          </button>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 12px; text-align: left;">Pracownik</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Sprawa</th>
              <th style="padding: 12px; text-align: right;">Kwota</th>
              <th style="padding: 12px; text-align: center;">Typ</th>
              <th style="padding: 12px; text-align: center;">Akcja</th>
            </tr>
          </thead>
          <tbody>
            ${commissions.map(c => `
              <tr style="border-bottom: 1px solid #cbd5e1; background: white;">
                <td style="padding: 12px; color: #1e293b;"><strong>${c.user_name}</strong></td>
                <td style="padding: 12px; color: #475569;">${c.email}</td>
                <td style="padding: 12px; color: #334155;">${c.case_number || '-'}</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #059669;">${(c.amount || 0).toFixed(2)} PLN</td>
                <td style="padding: 12px; text-align: center;">
                  <span style="background: ${c.commission_type === 'lawyer' ? '#8b5cf6' : '#3b82f6'}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">
                    ${c.commission_type === 'lawyer' ? 'Prawnik' : 'Pracownik'}
                  </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                  <button onclick="payrollDashboard.showTransferModal(${c.id}, '${c.commission_type}', '${c.user_name.replace(/'/g, "\\'")}', ${c.amount || 0}, '${c.email}', '${c.case_number || ''}')" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85em;">
                    💸 Wyślij
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #1e293b; color: white; font-weight: 700;">
              <td colspan="3" style="padding: 12px;">RAZEM:</td>
              <td style="padding: 12px; text-align: right; color: #10b981;">${total.toFixed(2)} PLN</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      `}
    `;
  }

  // Modal z detalami przelewu
  showTransferModal(id, type, userName, amount, email, caseNumber) {
    // Znajdź dane pracownika z this.employees
    const employee = this.employees.find(e => e.email === email) || {};
    const bankAccount = employee.bank_account || 'BRAK - UZUPEŁNIJ W HR';
    const today = new Date();
    const period = today.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    const titleCase = caseNumber ? `Prowizja ${caseNumber}` : `Prowizja ${period}`;
    
    const modal = document.createElement('div');
    modal.id = 'transferModal';
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; padding: 30px; border-radius: 16px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <h2 style="margin: 0 0 20px 0; color: #1e293b; display: flex; align-items: center; gap: 10px;">
            💸 Przelew prowizji
          </h2>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #166534;">📋 Dane przelewu</h3>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                <span style="color: #166534;">Odbiorca:</span>
                <strong style="color: #14532d;">${userName}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                <span style="color: #166534;">Kwota:</span>
                <strong style="color: #14532d; font-size: 1.2em;">${amount.toFixed(2)} PLN</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                <span style="color: #166534;">Konto bankowe:</span>
                <strong style="color: ${bankAccount.includes('BRAK') ? '#dc2626' : '#14532d'}; font-family: monospace;">${bankAccount}</strong>
              </div>
              ${caseNumber ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                <span style="color: #166534;">Numer sprawy:</span>
                <strong style="color: #14532d;">${caseNumber}</strong>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                <span style="color: #166534;">Okres:</span>
                <strong style="color: #14532d;">${period}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #166534;">Tytuł przelewu:</span>
                <strong style="color: #14532d;">${titleCase}</strong>
              </div>
            </div>
          </div>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
            <strong style="color: #0369a1;">📎 Załącz potwierdzenie przelewu (PDF):</strong>
            <input type="file" id="transferConfirmationFile" accept=".pdf" 
              style="display: block; margin-top: 10px; padding: 10px; border: 2px dashed #0284c7; border-radius: 8px; width: 100%; background: white; cursor: pointer;">
            <p style="margin: 5px 0 0 0; color: #0369a1; font-size: 0.85em;">
              Opcjonalnie - załącz potwierdzenie z banku
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <strong style="color: #92400e;">⚠️ Uwaga:</strong>
            <p style="margin: 5px 0 0 0; color: #78350f; font-size: 0.9em;">
              Po wykonaniu przelewu w banku kliknij "Oznacz jako przelane" aby zaktualizować status w systemie.
            </p>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="document.getElementById('transferModal').remove()" 
              style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Anuluj
            </button>
            <button onclick="payrollDashboard.copyTransferData('${userName}', ${amount}, '${bankAccount.replace(/'/g, "\\'")}', '${titleCase}')" 
              style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              📋 Kopiuj dane
            </button>
            <button onclick="payrollDashboard.confirmTransfer(${id}, '${type}')" 
              style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              ✅ Oznacz jako przelane
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  copyTransferData(userName, amount, bankAccount, title) {
    const text = `Odbiorca: ${userName}
Kwota: ${amount.toFixed(2)} PLN
Konto: ${bankAccount}
Tytuł: ${title}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Dane przelewu skopiowane do schowka!');
    }).catch(() => {
      // Fallback dla starszych przeglądarek
      prompt('Skopiuj dane przelewu:', text);
    });
  }

  async confirmTransfer(id, type) {
    try {
      const fileInput = document.getElementById('transferConfirmationFile');
      let confirmationUrl = null;
      
      // Jeśli wybrano plik, najpierw wyślij go
      if (fileInput && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('confirmation', fileInput.files[0]);
        formData.append('commission_id', id);
        formData.append('commission_type', type);
        
        const uploadResponse = await fetch(`${api.baseURL}/employees/payroll/upload-confirmation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          confirmationUrl = uploadResult.file_url;
        }
      }
      
      // Oznacz jako przelane
      await api.request('/employees/payroll/mark-transferred/' + id, {
        method: 'POST',
        body: JSON.stringify({ type, confirmation_url: confirmationUrl })
      });
      
      document.getElementById('transferModal')?.remove();
      alert('✅ Prowizja oznaczona jako przelana!' + (confirmationUrl ? '\n📎 Potwierdzenie zapisane.' : ''));
      await this.loadData();
    } catch (error) {
      alert('❌ Błąd: ' + error.message);
    }
  }

  async payAllCommissions() {
    if (!confirm(`Przelać wszystkie prowizje (${this.commissions.length})?\n\nPo kliknięciu OK wszystkie prowizje zostaną oznaczone jako przelane.`)) return;
    
    // Pokaż podsumowanie
    const total = this.commissions.reduce((s, c) => s + (c.amount || 0), 0);
    const groupedByUser = {};
    this.commissions.forEach(c => {
      if (!groupedByUser[c.email]) {
        groupedByUser[c.email] = { name: c.user_name, email: c.email, total: 0, count: 0 };
      }
      groupedByUser[c.email].total += c.amount || 0;
      groupedByUser[c.email].count++;
    });
    
    let summary = 'PODSUMOWANIE PRZELEWÓW:\n\n';
    Object.values(groupedByUser).forEach(u => {
      summary += `${u.name}: ${u.total.toFixed(2)} PLN (${u.count} prowizji)\n`;
    });
    summary += `\nRAZEM: ${total.toFixed(2)} PLN`;
    
    if (!confirm(summary + '\n\nCzy oznaczyć wszystkie jako przelane?')) return;
    
    try {
      for (const c of this.commissions) {
        await api.request('/employees/payroll/mark-transferred/' + c.id, {
          method: 'POST',
          body: JSON.stringify({ type: c.commission_type })
        });
      }
      
      alert('✅ Wszystkie prowizje zostały oznaczone jako przelane!');
      await this.loadData();
    } catch (error) {
      alert('❌ Błąd: ' + error.message);
    }
  }

  async renderSalaries(container) {
    const employees = this.employees.filter(e => e.salary > 0);
    
    // Oblicz składki dla każdego pracownika
    const payroll = employees.map(e => {
      const brutto = e.salary;
      const isUoP = e.contract_type === 'Umowa o pracę';
      const isZlecenie = e.contract_type === 'Umowa zlecenie';
      const isDzielo = e.contract_type === 'Umowa o dzieło';
      const isB2B = e.contract_type === 'B2B';
      
      let zus = 0, zdrow = 0, podatek = 0;
      
      if (isUoP || isZlecenie) {
        // Składki ZUS pracownika: emerytalna 9.76%, rentowa 1.5%, chorobowa 2.45%
        zus = brutto * 0.1371;
        // Składka zdrowotna 9% od podstawy po ZUS
        zdrow = (brutto - zus) * 0.09;
        // Podatek 12% (po odliczeniu ZUS i kosztów 250 PLN, minus kwota wolna 300 PLN/mies)
        podatek = Math.max(0, (brutto - zus - 250) * 0.12 - 300);
      } else if (isDzielo) {
        // Umowa o dzieło: tylko podatek 12% od 50% przychodu (koszty 50%)
        podatek = brutto * 0.5 * 0.12;
      }
      // B2B - bez potrąceń (faktura)
      
      const netto = brutto - zus - zdrow - podatek;
      
      return { ...e, brutto, zus, zdrow, podatek, netto };
    });
    
    const totals = {
      brutto: payroll.reduce((s, e) => s + e.brutto, 0),
      zus: payroll.reduce((s, e) => s + e.zus, 0),
      zdrow: payroll.reduce((s, e) => s + e.zdrow, 0),
      podatek: payroll.reduce((s, e) => s + e.podatek, 0),
      netto: payroll.reduce((s, e) => s + e.netto, 0)
    };
    
    container.innerHTML = `
      <h2 style="margin: 0 0 20px 0;">💵 Lista Płac - ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</h2>
      
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <button onclick="payrollDashboard.exportPayroll()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          📥 Eksportuj do CSV
        </button>
        <button onclick="payrollDashboard.printPayroll()" style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer;">
          🖨️ Drukuj
        </button>
      </div>
      
      ${payroll.length === 0 ? `
        <div style="text-align: center; padding: 40px; background: #fef3c7; border-radius: 12px;">
          <div style="font-size: 3em;">⚠️</div>
          <p style="color: #92400e; font-weight: 600;">Brak pracowników z ustaloną pensją</p>
          <p style="color: #78350f;">Uzupełnij dane finansowe pracowników w HR Dashboard.</p>
        </div>
      ` : `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
            <thead>
              <tr style="background: #1e293b; color: white;">
                <th style="padding: 12px; text-align: left;">Pracownik</th>
                <th style="padding: 12px; text-align: left;">Umowa</th>
                <th style="padding: 12px; text-align: right;">Brutto</th>
                <th style="padding: 12px; text-align: right;">ZUS prac.</th>
                <th style="padding: 12px; text-align: right;">Zdrowotna</th>
                <th style="padding: 12px; text-align: right;">Podatek</th>
                <th style="padding: 12px; text-align: right;">Netto</th>
                <th style="padding: 12px; text-align: left;">Konto</th>
              </tr>
            </thead>
            <tbody>
              ${payroll.map(e => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px;">
                    <strong>${e.name}</strong><br>
                    <span style="font-size: 0.8em; color: #64748b;">${e.position}</span>
                  </td>
                  <td style="padding: 12px;">
                    <span style="background: ${this.getContractColor(e.contract_type)}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">
                      ${e.contract_type}
                    </span>
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: 600;">${e.brutto.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right; color: #ef4444;">${e.zus > 0 ? '-' + e.zus.toFixed(2) : '-'}</td>
                  <td style="padding: 12px; text-align: right; color: #ef4444;">${e.zdrow > 0 ? '-' + e.zdrow.toFixed(2) : '-'}</td>
                  <td style="padding: 12px; text-align: right; color: #ef4444;">${e.podatek > 0 ? '-' + e.podatek.toFixed(2) : '-'}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; color: #10b981;">${e.netto.toFixed(2)}</td>
                  <td style="padding: 12px; font-family: monospace; font-size: 0.85em;">
                    ${e.bank_account !== 'Brak' ? this.maskBankAccount(e.bank_account) : '<span style="color: #ef4444;">⚠️</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #1e293b; color: white; font-weight: 700;">
                <td colspan="2" style="padding: 12px;">RAZEM (${payroll.length} pracowników):</td>
                <td style="padding: 12px; text-align: right;">${totals.brutto.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right;">${totals.zus.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right;">${totals.zdrow.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right;">${totals.podatek.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; color: #10b981;">${totals.netto.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
            <div style="font-size: 0.9em; color: #1e40af;">Koszt pracodawcy (ZUS)</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #1e3a8a;">${(totals.brutto * 0.2041).toFixed(2)} PLN</div>
          </div>
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px;">
            <div style="font-size: 0.9em; color: #166534;">Całkowity koszt wynagrodzeń</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #14532d;">${(totals.brutto * 1.2041).toFixed(2)} PLN</div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
            <div style="font-size: 0.9em; color: #92400e;">Do przelewu na konta</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #78350f;">${totals.netto.toFixed(2)} PLN</div>
          </div>
        </div>
      `}
    `;
  }

  exportPayroll() {
    const employees = this.employees.filter(e => e.salary > 0);
    if (employees.length === 0) {
      alert('Brak danych do eksportu');
      return;
    }
    
    let csv = 'Pracownik,Email,Stanowisko,Umowa,Brutto,Konto bankowe\n';
    employees.forEach(e => {
      csv += `"${e.name}","${e.email}","${e.position}","${e.contract_type}",${e.salary},"${e.bank_account}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lista-plac-${new Date().toISOString().slice(0, 7)}.csv`;
    link.click();
  }

  printPayroll() {
    window.print();
  }

  async renderZUS(container) {
    container.innerHTML = `
      <h2 style="margin: 0 0 20px 0;">🏛️ Rozliczenia ZUS</h2>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
        <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">📋 ZUS DRA</h3>
          <p style="color: #78350f; font-size: 0.9em;">Deklaracja rozliczeniowa - suma składek</p>
          <button style="margin-top: 10px; padding: 8px 16px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer;">Generuj</button>
        </div>
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📋 ZUS RCA</h3>
          <p style="color: #1e3a8a; font-size: 0.9em;">Raport imienny pracowników</p>
          <button style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Generuj</button>
        </div>
        <div style="background: #dcfce7; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">📋 RMUA</h3>
          <p style="color: #14532d; font-size: 0.9em;">Informacja dla pracownika</p>
          <button style="margin-top: 10px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">Generuj</button>
        </div>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
        <h3 style="margin: 0 0 15px 0;">📊 Składki ZUS - podsumowanie</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Emerytalna (9.76% + 9.76%)</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">19.52%</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Rentowa (1.5% + 6.5%)</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">8.00%</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Chorobowa (2.45%)</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">2.45%</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Wypadkowa (pracodawca)</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">1.67%</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Zdrowotna (9%)</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">9.00%</td>
          </tr>
        </table>
      </div>
    `;
  }

  async renderTaxes(container) {
    container.innerHTML = `
      <h2 style="margin: 0 0 20px 0;">📋 Rozliczenia Podatkowe</h2>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
          <h3 style="margin: 0 0 10px 0; color: #991b1b;">💰 Zaliczki PIT</h3>
          <p style="color: #7f1d1d; font-size: 0.9em; margin-bottom: 15px;">Miesięczne zaliczki na podatek dochodowy</p>
          <div style="font-size: 0.85em; color: #64748b;">
            <div>Termin: <strong>20. dzień miesiąca</strong></div>
            <div>Stawki: <strong>12% / 32%</strong></div>
            <div>Kwota wolna: <strong>30 000 PLN/rok</strong></div>
          </div>
          <button style="margin-top: 15px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">Oblicz zaliczki</button>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">📄 PIT-11</h3>
          <p style="color: #14532d; font-size: 0.9em; margin-bottom: 15px;">Roczna informacja o dochodach</p>
          <div style="font-size: 0.85em; color: #64748b;">
            <div>Termin: <strong>do końca lutego</strong></div>
            <div>Dla: <strong>pracowników i zleceniobiorców</strong></div>
          </div>
          <button style="margin-top: 15px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">Generuj PIT-11</button>
        </div>
      </div>
    `;
  }

  async renderReports(container) {
    container.innerHTML = `
      <h2 style="margin: 0 0 20px 0;">📈 Raporty Payroll</h2>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; cursor: pointer;" onclick="alert('Generowanie raportu...')">
          <h3 style="margin: 0 0 10px 0;">📊 Koszty wynagrodzeń</h3>
          <p style="color: #64748b; font-size: 0.9em;">Miesięczne zestawienie kosztów płacowych</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; cursor: pointer;" onclick="alert('Generowanie raportu...')">
          <h3 style="margin: 0 0 10px 0;">💰 Prowizje pracowników</h3>
          <p style="color: #64748b; font-size: 0.9em;">Zestawienie prowizji wg pracowników</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; cursor: pointer;" onclick="alert('Generowanie raportu...')">
          <h3 style="margin: 0 0 10px 0;">🏛️ Składki ZUS</h3>
          <p style="color: #64748b; font-size: 0.9em;">Zestawienie składek ubezpieczeniowych</p>
        </div>
      </div>
    `;
  }
}

// Globalna instancja
window.payrollDashboard = new PayrollDashboard();
