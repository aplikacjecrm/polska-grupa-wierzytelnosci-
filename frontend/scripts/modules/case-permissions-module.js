// 🔐 MODUŁ UPRAWNIEŃ DO SPRAW
// Zarządzanie dostępem czasowym i stałym

console.log('🔐 Case Permissions Module v1.0 załadowany!');

class CasePermissionsModule {
    constructor() {
        this.currentCaseId = null;
        this.permissions = [];
        this.accessHistory = [];
    }

    // Renderuj zakładkę uprawnień
    async renderPermissionsTab(caseId) {
        this.currentCaseId = caseId;
        const container = document.getElementById('casePermissionsContent');
        
        if (!container) {
            console.error('❌ Kontener casePermissionsContent nie znaleziony!');
            return;
        }

        container.innerHTML = `
            <div class="permissions-panel">
                <div class="permissions-header">
                    <h3>🔐 Zarządzanie dostępem do sprawy</h3>
                    <button class="btn btn-primary" onclick="window.casePermissionsModule.showGrantAccessModal()">
                        ➕ Nadaj dostęp
                    </button>
                </div>

                <div class="permissions-body">
                    <div id="permissionsList">
                        <div class="loading">⏳ Ładowanie uprawnień...</div>
                    </div>
                </div>

                <div class="permissions-history">
                    <h4>📊 Historia dostępów</h4>
                    <div id="accessHistoryList">
                        <div class="loading">⏳ Ładowanie historii...</div>
                    </div>
                </div>
            </div>
        `;

        // Załaduj dane
        await this.loadPermissions(caseId);
        await this.loadAccessHistory(caseId);
    }

    // Załaduj uprawnienia
    async loadPermissions(caseId) {
        try {
            const response = await window.api.request(`/case-permissions/${caseId}/list`);
            this.permissions = response.permissions || [];
            this.renderPermissionsList();
        } catch (error) {
            console.error('❌ Błąd ładowania uprawnień:', error);
            document.getElementById('permissionsList').innerHTML = 
                '<div class="error">❌ Błąd ładowania uprawnień</div>';
        }
    }

    // Renderuj listę uprawnień
    renderPermissionsList() {
        const container = document.getElementById('permissionsList');
        
        if (this.permissions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📭 Brak dodatkowych uprawnień do tej sprawy</p>
                    <small>Kliknij "➕ Nadaj dostęp" aby dodać osobę</small>
                </div>
            `;
            return;
        }

        const activePermissions = this.permissions.filter(p => p.is_active);
        const inactivePermissions = this.permissions.filter(p => !p.is_active);

        let html = '';

        // Aktywne uprawnienia
        if (activePermissions.length > 0) {
            html += '<h4>✅ Aktywne uprawnienia</h4>';
            html += '<div class="permissions-grid">';
            activePermissions.forEach(p => {
                html += this.renderPermissionCard(p);
            });
            html += '</div>';
        }

        // Nieaktywne (wygasłe/odwołane)
        if (inactivePermissions.length > 0) {
            html += '<details style="margin-top: 20px;"><summary>📋 Historia nieaktywnych (${inactivePermissions.length})</summary>';
            html += '<div class="permissions-grid" style="margin-top: 10px;">';
            inactivePermissions.forEach(p => {
                html += this.renderPermissionCard(p);
            });
            html += '</div></details>';
        }

        container.innerHTML = html;
    }

    // Renderuj pojedynczą kartę uprawnienia
    renderPermissionCard(permission) {
        const isActive = permission.is_active;
        const isPermanent = permission.permission_type === 'permanent';
        const isExpired = permission.is_expired;
        const isRevoked = permission.is_revoked;

        let statusBadge = '';
        let statusClass = '';
        let expiresInfo = '';
        let actions = '';

        if (isRevoked) {
            statusBadge = '❌ Odwołany';
            statusClass = 'revoked';
        } else if (isExpired) {
            statusBadge = '⏰ Wygasły';
            statusClass = 'expired';
        } else if (isPermanent) {
            statusBadge = '✅ Stały dostęp';
            statusClass = 'permanent';
        } else {
            statusBadge = '⏱️ Czasowy';
            statusClass = 'temporary';
            
            // Oblicz pozostały czas
            const expiresAt = new Date(permission.expires_at);
            const now = new Date();
            const hoursLeft = Math.round((expiresAt - now) / (1000 * 60 * 60));
            
            if (hoursLeft > 0) {
                expiresInfo = `<div class="expires-info">⏰ Wygasa za: <strong>${hoursLeft}h</strong></div>`;
            }
        }

        // Akcje (tylko dla aktywnych)
        if (isActive) {
            actions = `
                <div class="permission-actions">
                    ${!isPermanent ? `<button class="btn-small btn-warning" onclick="window.casePermissionsModule.extendPermission(${permission.id})">⏱️ Przedłuż</button>` : ''}
                    <button class="btn-small btn-danger" onclick="window.casePermissionsModule.revokePermission(${permission.id})">❌ Odbierz</button>
                </div>
            `;
        }

        const revokedInfo = isRevoked ? `<div class="revoked-info">Odwołany przez: ${permission.revoked_by_name} (${new Date(permission.revoked_at).toLocaleString()})</div>` : '';

        return `
            <div class="permission-card ${statusClass}">
                <div class="permission-header">
                    <div class="user-info">
                        <strong>👤 ${permission.user_name}</strong>
                        <span class="user-email">${permission.user_email}</span>
                        <span class="user-role">${this.getRoleLabel(permission.user_role)}</span>
                    </div>
                    <span class="status-badge ${statusClass}">${statusBadge}</span>
                </div>
                
                <div class="permission-details">
                    <div class="detail-row">
                        <span class="label">Nadane przez:</span>
                        <span>${permission.granted_by_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Data nadania:</span>
                        <span>${new Date(permission.granted_at).toLocaleString()}</span>
                    </div>
                    ${isPermanent ? '' : `
                        <div class="detail-row">
                            <span class="label">Wygasa:</span>
                            <span>${new Date(permission.expires_at).toLocaleString()}</span>
                        </div>
                    `}
                    ${permission.notes ? `
                        <div class="detail-row">
                            <span class="label">Notatka:</span>
                            <span>${permission.notes}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${expiresInfo}
                ${revokedInfo}
                ${actions}
            </div>
        `;
    }

    // Pomocnicza - etykieta roli
    getRoleLabel(role) {
        const labels = {
            'admin': 'Administrator',
            'lawyer': 'Mecenas',
            'case_manager': 'Opiekun sprawy',
            'client_manager': 'Opiekun klienta',
            'reception': 'Recepcja',
            'client': 'Klient'
        };
        return labels[role] || role;
    }

    // Modal nadawania dostępu
    async showGrantAccessModal() {
        // Pobierz listę użytkowników
        const users = await this.fetchAvailableUsers();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h3>➕ Nadaj dostęp do sprawy</h3>
                
                <div class="form-group">
                    <label>Użytkownik:</label>
                    <select id="grantUserId" class="form-control">
                        <option value="">-- Wybierz użytkownika --</option>
                        ${users.map(u => `<option value="${u.id}">${u.name} (${u.email}) - ${this.getRoleLabel(u.user_role)}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Typ dostępu:</label>
                    <select id="grantType" class="form-control" onchange="window.casePermissionsModule.toggleHoursInput()">
                        <option value="temporary">⏱️ Czasowy (domyślnie 24h)</option>
                        <option value="permanent">✅ Stały</option>
                    </select>
                </div>

                <div class="form-group" id="hoursInputGroup">
                    <label>Liczba godzin:</label>
                    <input type="number" id="grantHours" class="form-control" value="24" min="1" max="720">
                    <small>Maksymalnie 720h (30 dni)</small>
                </div>

                <div class="form-group">
                    <label>Notatka (opcjonalnie):</label>
                    <input type="text" id="grantNotes" class="form-control" placeholder="np. Konsultacja prawna, Współpraca">
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Anuluj</button>
                    <button class="btn btn-primary" onclick="window.casePermissionsModule.grantAccess()">✓ Nadaj dostęp</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Toggle input godzin
    toggleHoursInput() {
        const type = document.getElementById('grantType').value;
        const hoursGroup = document.getElementById('hoursInputGroup');
        hoursGroup.style.display = type === 'temporary' ? 'block' : 'none';
    }

    // Pobierz dostępnych użytkowników
    async fetchAvailableUsers() {
        try {
            // Pobierz wszystkich pracowników
            const response = await window.api.request('/cases/staff/list');
            const allStaff = [
                ...(response.lawyers || []),
                ...(response.case_managers || []),
                ...(response.client_managers || [])
            ];

            // Filtruj tych którzy już mają dostęp
            const activeUserIds = this.permissions
                .filter(p => p.is_active)
                .map(p => p.user_id);

            return allStaff.filter(u => !activeUserIds.includes(u.id));
        } catch (error) {
            console.error('❌ Błąd pobierania użytkowników:', error);
            return [];
        }
    }

    // Nadaj dostęp
    async grantAccess() {
        const userId = document.getElementById('grantUserId').value;
        const type = document.getElementById('grantType').value;
        const hours = parseInt(document.getElementById('grantHours').value) || 24;
        const notes = document.getElementById('grantNotes').value;

        if (!userId) {
            alert('Wybierz użytkownika!');
            return;
        }

        try {
            const endpoint = type === 'temporary' 
                ? `/case-permissions/${this.currentCaseId}/grant-temporary`
                : `/case-permissions/${this.currentCaseId}/grant-permanent`;

            const body = {
                user_id: parseInt(userId),
                notes: notes || null
            };

            if (type === 'temporary') {
                body.hours = hours;
            }

            const response = await window.api.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (response.success) {
                alert(`✅ Dostęp ${type === 'permanent' ? 'stały' : 'czasowy'} nadany pomyślnie!`);
                document.querySelector('.modal-overlay').remove();
                await this.loadPermissions(this.currentCaseId);
                
                // Wyślij powiadomienie na czat (KROK 5)
                await this.notifyChatAboutAccess(response.permission);
            }
        } catch (error) {
            console.error('❌ Błąd nadawania dostępu:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // Odbierz dostęp
    async revokePermission(permissionId) {
        const reason = prompt('Powód odwołania dostępu (opcjonalnie):');
        if (reason === null) return; // Anulowano

        try {
            const response = await window.api.request(
                `/case-permissions/${this.currentCaseId}/revoke/${permissionId}`,
                {
                    method: 'POST',
                    body: JSON.stringify({ reason })
                }
            );

            if (response.success) {
                alert('✅ Dostęp odwołany pomyślnie!');
                await this.loadPermissions(this.currentCaseId);
            }
        } catch (error) {
            console.error('❌ Błąd odwoływania dostępu:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // Przedłuż dostęp
    async extendPermission(permissionId) {
        const hours = prompt('O ile godzin przedłużyć dostęp?', '24');
        if (!hours || isNaN(hours)) return;

        try {
            const response = await window.api.request(
                `/case-permissions/${this.currentCaseId}/extend/${permissionId}`,
                {
                    method: 'POST',
                    body: JSON.stringify({ additional_hours: parseInt(hours) })
                }
            );

            if (response.success) {
                alert(`✅ Dostęp przedłużony o ${hours}h!`);
                await this.loadPermissions(this.currentCaseId);
            }
        } catch (error) {
            console.error('❌ Błąd przedłużania dostępu:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // Załaduj historię dostępów
    async loadAccessHistory(caseId) {
        try {
            const response = await window.api.request(`/case-permissions/${caseId}/access-history`);
            this.accessHistory = response.access_logs || [];
            this.renderAccessHistory();
        } catch (error) {
            console.error('❌ Błąd ładowania historii:', error);
            document.getElementById('accessHistoryList').innerHTML = 
                '<div class="error">❌ Błąd ładowania historii</div>';
        }
    }

    // Renderuj historię dostępów
    renderAccessHistory() {
        const container = document.getElementById('accessHistoryList');
        
        if (this.accessHistory.length === 0) {
            container.innerHTML = '<div class="empty-state">📭 Brak historii dostępów</div>';
            return;
        }

        let html = '<div class="history-list">';
        
        // Pokaż ostatnie 20
        this.accessHistory.slice(0, 20).forEach(log => {
            const date = new Date(log.created_at).toLocaleString();
            const method = log.access_method === 'password' ? '🔑 Hasło' : '🔓 Uprawnienie';
            
            html += `
                <div class="history-item">
                    <span class="history-date">${date}</span>
                    <span class="history-user">${log.user_name}</span>
                    <span class="history-method">${method}</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (this.accessHistory.length > 20) {
            html += `<div class="history-more">... i ${this.accessHistory.length - 20} więcej</div>`;
        }

        container.innerHTML = html;
    }

    // KROK 5: Wyślij powiadomienie na czat
    async notifyChatAboutAccess(permission) {
        try {
            // Pobierz dane sprawy
            const caseResp = await window.api.request(`/cases/${this.currentCaseId}`);
            const caseData = caseResp.case;

            // Format wiadomości
            const isPermanent = permission.permission_type === 'permanent';
            const expiresInfo = isPermanent ? '' : `\n⏰ **Dostęp wygasa:** ${new Date(permission.expires_at).toLocaleString('pl-PL')}`;
            
            const message = `🔓 **Nadano dostęp do sprawy**\n\n` +
                           `**Sprawa:** ${caseData.case_number}\n` +
                           `**Tytuł:** ${caseData.title}\n` +
                           `**Typ dostępu:** ${isPermanent ? '✅ Stały' : '⏱️ Czasowy'}\n` +
                           `${expiresInfo}\n\n` +
                           `Możesz teraz otworzyć tę sprawę bez hasła.`;

            // Wyślij wiadomość bezpośrednio do użytkownika
            await window.api.request('/chat/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: permission.user_id,
                    message: message,
                    attachments: []
                })
            });

            console.log(`✅ Powiadomienie wysłane do użytkownika ${permission.user_name}`);
        } catch (error) {
            console.error('❌ Błąd wysyłania powiadomienia:', error);
            // Nie blokuj - to tylko notyfikacja
        }
    }
}

// Inicjalizacja globalnego modułu
window.casePermissionsModule = new CasePermissionsModule();

console.log('✅ Case Permissions Module gotowy!');
