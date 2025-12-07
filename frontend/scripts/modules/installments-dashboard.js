// ====================================
// INSTALLMENTS DASHBOARD MODULE
// Moduł dashboardu płatności ratalnych
// ====================================

class InstallmentsDashboard {
    constructor() {
        this.stats = null;
        this.overdueClients = [];
        this.upcomingInstallments = [];
    }
    
    // =====================================
    // GŁÓWNY WIDOK DASHBOARDU
    // =====================================
    async showDashboard() {
        try {
            // Pobierz wszystkie dane równolegle
            const [stats, overdueClients, upcoming] = await Promise.all([
                window.api.request('/installments/stats/overview'),
                window.api.request('/installments/stats/overdue-clients'),
                window.api.request('/installments/stats/upcoming?days=30')
            ]);
            
            this.stats = stats.stats;
            this.overdueClients = overdueClients.overdue_clients || [];
            this.upcomingInstallments = upcoming.upcoming || [];
            
            this.renderDashboard();
            
        } catch (error) {
            console.error('❌ Błąd ładowania dashboardu rat:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // RENDEROWANIE DASHBOARDU
    // =====================================
    renderDashboard() {
        const container = document.getElementById('financeActivityList');
        
        const stats = this.stats;
        const overdueClients = this.overdueClients;
        const upcoming = this.upcomingInstallments;
        
        container.innerHTML = `
            <div style="max-width: 1400px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h3 style="margin: 0;">💳 Dashboard płatności ratalnych</h3>
                    <button onclick="installmentsDashboard.exportReport()" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        📊 Eksport raportu
                    </button>
                </div>
                
                <!-- Statystyki -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    ${this.renderStatsCard('Wszystkie raty', stats.total_installments, stats.pending_amount + stats.paid_amount, '#3B82F6')}
                    ${this.renderStatsCard('Oczekujące', stats.pending_count, stats.pending_amount, '#3B82F6', '⏳')}
                    ${this.renderStatsCard('Zaległości', stats.overdue_count, stats.overdue_amount, '#3B82F6', '⚠️')}
                    ${this.renderStatsCard('Opłacone', stats.paid_count, stats.paid_amount, '#3B82F6', '✓')}
                </div>
                
                <!-- Zaległości klientów -->
                ${overdueClients.length > 0 ? `
                    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #3B82F6;">
                        <h4 style="margin: 0 0 20px 0; color: #3B82F6;">⚠️ Klienci z zaległościami (${overdueClients.length})</h4>
                        ${overdueClients.map(client => this.renderOverdueClient(client)).join('')}
                    </div>
                ` : ''}
                
                <!-- Nadchodzące raty -->
                ${this.renderUpcomingSection()}
            </div>
        `;
    }
    
    // =====================================
    // KARTA STATYSTYK
    // =====================================
    renderStatsCard(title, count, amount, color, icon = '📊') {
        return `
            <div style="background: linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color)} 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">${icon} ${title}</div>
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 10px;">${count}</div>
                <div style="font-size: 1.1rem; font-weight: 600; opacity: 0.95;">
                    ${this.formatMoney(amount)}
                </div>
            </div>
        `;
    }
    
    // =====================================
    // KLIENT Z ZALEGŁOŚCIĄ
    // =====================================
    renderOverdueClient(client) {
        const maxDays = Math.floor(client.max_days_overdue);
        const severity = maxDays > 30 ? '#1E40AF' : maxDays > 14 ? '#3B82F6' : '#3B82F6';
        
        return `
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${severity};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 600; font-size: 1.1rem; color: #1a2332; margin-bottom: 5px;">
                            ${this.escapeHtml(client.client_name)}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            ${client.client_email} ${client.client_phone ? '• ' + client.client_phone : ''}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${severity};">
                            ${this.formatMoney(client.overdue_amount)}
                        </div>
                        <div style="font-size: 0.85rem; color: #666;">
                            ${client.overdue_count} rat
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <span style="
                        padding: 4px 10px;
                        background: ${severity};
                        color: white;
                        border-radius: 12px;
                        font-size: 0.85rem;
                        font-weight: 600;
                    ">
                        ${maxDays} dni opóźnienia
                    </span>
                    <span style="font-size: 0.85rem; color: #666;">
                        Najstarsza: ${new Date(client.oldest_due_date).toLocaleDateString('pl-PL')}
                    </span>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="installmentsDashboard.showClientInstallments(${client.client_id})" style="
                        padding: 8px 16px;
                        background: #3B82F6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.9rem;
                    ">
                        📋 Zobacz raty
                    </button>
                    <button onclick="installmentsDashboard.sendReminder(${client.client_id})" style="
                        padding: 8px 16px;
                        background: #3B82F6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.9rem;
                    ">
                        💌 Wyślij przypomnienie
                    </button>
                </div>
            </div>
        `;
    }
    
    // =====================================
    // SEKCJA NADCHODZĄCYCH RAT
    // =====================================
    renderUpcomingSection() {
        if (this.upcomingInstallments.length === 0) {
            return `
                <div style="background: white; border-radius: 12px; padding: 25px; text-align: center; color: #999;">
                    <p>📅 Brak nadchodzących rat w najbliższych 30 dniach</p>
                </div>
            `;
        }
        
        // Grupuj po dniach
        const groupedByDate = {};
        this.upcomingInstallments.forEach(inst => {
            const date = inst.due_date;
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(inst);
        });
        
        return `
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 20px 0; color: #3B82F6;">📅 Nadchodzące raty (30 dni)</h4>
                ${Object.keys(groupedByDate).sort().map(date => this.renderDateGroup(date, groupedByDate[date])).join('')}
            </div>
        `;
    }
    
    // =====================================
    // GRUPA RAT PO DACIE
    // =====================================
    renderDateGroup(date, installments) {
        const dateObj = new Date(date);
        const today = new Date();
        const daysUntil = Math.ceil((dateObj - today) / (1000 * 60 * 60 * 24));
        
        let dateLabel = dateObj.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
        if (daysUntil === 0) dateLabel = '🔥 DZIŚ';
        else if (daysUntil === 1) dateLabel = '⚡ JUTRO';
        else if (daysUntil <= 7) dateLabel += ` (za ${daysUntil} dni)`;
        
        const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
        
        return `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #1a2332;">${dateLabel}</span>
                    <span style="font-weight: 600; color: #3B82F6;">
                        ${installments.length} rat • ${this.formatMoney(totalAmount)}
                    </span>
                </div>
                ${installments.map(inst => this.renderInstallmentRow(inst)).join('')}
            </div>
        `;
    }
    
    // =====================================
    // WIERSZ RATY
    // =====================================
    renderInstallmentRow(inst) {
        return `
            <div style="padding: 10px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #1a2332;">
                        ${this.escapeHtml(inst.client_name)}
                    </div>
                    <div style="font-size: 0.85rem; color: #666;">
                        ${inst.case_number || 'Brak sprawy'} • 
                        ${inst.invoice_number || 'Brak faktury'} • 
                        Rata ${inst.installment_number}/${inst.total_installments}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: #3B82F6; font-size: 1.1rem;">
                        ${this.formatMoney(inst.amount)}
                    </div>
                </div>
            </div>
        `;
    }
    
    // =====================================
    // POKAŻ RATY KLIENTA
    // =====================================
    async showClientInstallments(clientId) {
        try {
            const result = await window.api.request(`/installments?client_id=${clientId}`);
            const installments = result.installments || [];
            
            const modal = document.createElement('div');
            modal.id = 'clientInstallmentsModal';
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            const client = this.overdueClients.find(c => c.client_id === clientId);
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; position: sticky; top: 0; z-index: 10;">
                        <h2 style="margin: 0;">📋 Harmonogram rat</h2>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">${this.escapeHtml(client?.client_name || 'Klient')}</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        ${installments.length > 0 ? `
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                                        <th style="padding: 12px; text-align: left;">Rata</th>
                                        <th style="padding: 12px; text-align: left;">Termin</th>
                                        <th style="padding: 12px; text-align: right;">Kwota</th>
                                        <th style="padding: 12px; text-align: center;">Status</th>
                                        <th style="padding: 12px; text-align: center;">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${installments.map(inst => this.renderInstallmentTableRow(inst)).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="text-align: center; color: #999;">Brak rat</p>'}
                        
                        <div style="margin-top: 20px; text-align: right;">
                            <button onclick="installmentsDashboard.closeModal('clientInstallmentsModal')" style="
                                padding: 12px 24px;
                                background: #e0e0e0;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                            ">
                                ✕ Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Błąd ładowania rat klienta:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // WIERSZ RATY W TABELI
    // =====================================
    renderInstallmentTableRow(inst) {
        const statusBadge = {
            'paid': { text: '✓ Opłacona', color: '#d4edda', textColor: '#155724' },
            'pending': { text: '⏳ Oczekuje', color: '#F8FAFC', textColor: '#666' },
            'overdue': { text: '⚠️ Zaległość', color: '#f8d7da', textColor: '#721c24' }
        }[inst.status] || { text: inst.status, color: '#e0e0e0', textColor: '#666' };
        
        const isOverdue = inst.status === 'pending' && new Date(inst.due_date) < new Date();
        
        return `
            <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px; font-weight: 600;">${inst.installment_number}/${inst.total_installments}</td>
                <td style="padding: 12px;">
                    ${new Date(inst.due_date).toLocaleDateString('pl-PL')}
                    ${isOverdue ? `<br><small style="color: #3B82F6;">(${inst.late_days} dni)</small>` : ''}
                </td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">${this.formatMoney(inst.amount)}</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 0.85rem;
                        background: ${statusBadge.color};
                        color: ${statusBadge.textColor};
                    ">
                        ${statusBadge.text}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    ${inst.status === 'pending' ? `
                        <button onclick="installmentsDashboard.markAsPaid(${inst.id})" style="
                            padding: 4px 12px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 0.85rem;
                        ">
                            ✓ Opłać
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `;
    }
    
    // =====================================
    // OZNACZ JAKO OPŁACONĄ
    // =====================================
    async markAsPaid(installmentId) {
        if (!confirm('Oznaczyć ratę jako opłaconą?')) return;
        
        try {
            await window.api.request(`/installments/${installmentId}/mark-paid`, 'PATCH', {
                payment_method: 'transfer',
                notes: 'Opłacone przez system'
            });
            
            alert('✅ Rata oznaczona jako opłacona!');
            this.closeModal('clientInstallmentsModal');
            this.showDashboard();
            
        } catch (error) {
            console.error('❌ Błąd oznaczania raty:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // WYŚLIJ PRZYPOMNIENIE
    // =====================================
    async sendReminder(clientId) {
        alert('📧 Funkcja wysyłania przypomnień zostanie wkrótce dodana!\n\nPrzypomnienie email będzie zawierało:\n- Listę zaległych rat\n- Link do płatności online\n- Dane do przelewu');
    }
    
    // =====================================
    // EKSPORT RAPORTU
    // =====================================
    async exportReport() {
        alert('📊 Funkcja exportu raportu zostanie wkrótce dodana!\n\nRaport będzie zawierał:\n- Statystyki rat\n- Zaległości\n- Prognozy przychodów\n- Export do PDF/Excel');
    }
    
    // =====================================
    // POMOCNICZE
    // =====================================
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount || 0);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    darkenColor(hex) {
        const amount = -20;
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, ((num >> 16) & 0xFF) + amount);
        const g = Math.max(0, ((num >> 8) & 0xFF) + amount);
        const b = Math.max(0, (num & 0xFF) + amount);
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}

// Utwórz globalną instancję
const installmentsDashboard = new InstallmentsDashboard();
window.installmentsDashboard = installmentsDashboard;

console.log('✅ Installments Dashboard Module załadowany! 💳');
