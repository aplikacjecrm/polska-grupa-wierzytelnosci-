class AdminPanel {
    constructor() {
        this.users = [];
        this.stats = {};
    }

    async init() {
        console.log('AdminPanel init started');
        try {
            await this.loadUsers();
            await this.loadStats();
            this.render();
            console.log('AdminPanel init completed');
        } catch (error) {
            console.error('AdminPanel init error:', error);
        }
    }

    async loadUsers() {
        try {
            console.log('Loading users...');
            const response = await api.request('/auth/users');
            console.log('Users response:', response);
            this.users = response.users || [];
            console.log('Users loaded:', this.users.length);
        } catch (error) {
            console.error('Błąd ładowania użytkowników:', error);
            this.users = [];
        }
    }

    async loadStats() {
        try {
            const [clients, cases, events, documents] = await Promise.all([
                api.request('/clients'),
                api.request('/cases'),
                api.request('/events'),
                api.request('/documents').catch(() => ({ documents: [] }))
            ]);

            const allCases = cases.cases || [];
            const allEvents = events.events || [];
            const allDocs = documents.documents || [];
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            this.stats = {
                // Użytkownicy
                totalUsers: this.users.length,
                admins: this.users.filter(u => u.role === 'admin').length,
                lawyers: this.users.filter(u => u.role === 'lawyer').length,
                caseManagers: this.users.filter(u => u.user_role === 'case_manager').length,
                clients: this.users.filter(u => u.role === 'client').length,
                
                // Klienci
                totalClients: clients.clients?.length || 0,
                activeClients: clients.clients?.filter(c => c.status === 'active').length || 0,
                
                // Sprawy
                totalCases: allCases.length,
                openCases: allCases.filter(c => c.status === 'open').length,
                inProgressCases: allCases.filter(c => c.status === 'in_progress').length,
                closedCases: allCases.filter(c => c.status === 'closed').length,
                
                // Wydarzenia
                totalEvents: allEvents.length,
                todayEvents: allEvents.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                }).length,
                weekEvents: allEvents.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate >= today && eventDate < weekLater;
                }).length,
                
                // Dokumenty
                totalDocuments: allDocs.length,
                documentsThisMonth: allDocs.filter(d => {
                    const docDate = new Date(d.uploaded_at || d.created_at);
                    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                }).length
            };
            
            // Przygotuj dane do wykresów
            this.chartData = {
                casesByStatus: {
                    labels: ['Otwarte', 'W toku', 'Zamknięte'],
                    data: [this.stats.openCases, this.stats.inProgressCases, this.stats.closedCases],
                    colors: ['#3B82F6', '#3B82F6', '#3B82F6']
                },
                usersByRole: {
                    labels: ['Admini', 'Mecenasi', 'Opiekunowie', 'Klienci'],
                    data: [this.stats.admins, this.stats.lawyers, this.stats.caseManagers, this.stats.clients],
                    colors: ['#FFD700', '#3B82F6', '#3B82F6', '#95a5a6']
                }
            };
        } catch (error) {
            console.error('Błąd ładowania statystyk:', error);
            this.stats = {};
            this.chartData = {};
        }
    }

    render() {
        const container = document.getElementById('adminView');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h2>👑 Panel Administratora</h2>
            </div>

            <!-- Statystyki -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px; background: white; margin: 20px; border-radius: 12px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(145deg, #3B82F6, #1E40AF); border-radius: 12px; color: white;">
                    <div style="font-size: 2.5rem; font-weight: 700;">${this.stats.totalUsers}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Użytkowników</div>
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(145deg, #FFD700, #FFC700); border-radius: 12px; color: #1a1a2e;">
                    <div style="font-size: 2.5rem; font-weight: 700;">${this.stats.admins}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Administratorów</div>
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(145deg, #3B82F6, #3B82F6); border-radius: 12px; color: white;">
                    <div style="font-size: 2.5rem; font-weight: 700;">${this.stats.lawyers}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Mecenasów</div>
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(145deg, #3B82F6, #1E40AF); border-radius: 12px; color: white;">
                    <div style="font-size: 2.5rem; font-weight: 700;">${this.stats.clients}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Klientów</div>
                </div>
            </div>

            <!-- Dodatkowe statystyki -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0 20px 20px 20px;">
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: #3B82F6;">${this.stats.totalClients}</div>
                    <div style="color: #7f8c8d;">Rekordów klientów</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: #3B82F6;">${this.stats.totalCases}</div>
                    <div style="color: #7f8c8d;">Aktywnych spraw</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: #3B82F6;">${this.stats.totalEvents}</div>
                    <div style="color: #7f8c8d;">Wydarzeń w kalendarzu</div>
                </div>
            </div>

            <!-- Narzędzia administratora -->
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; border-left: 4px solid #3B82F6;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">🔧 Narzędzia administratora</h3>
                <button onclick="adminPanel.purgeDeletedClients()" style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    🗑️ Wyczyść usuniętych klientów z bazy
                </button>
                <p style="color: #7f8c8d; margin-top: 10px; font-size: 0.9rem;">
                    ⚠️ Ta operacja trwale usuwa wszystkich klientów ze statusem "usunięty" z bazy danych. Wymaga hasła administratora.
                </p>
            </div>

            <!-- Lista użytkowników -->
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">📋 Lista użytkowników</h3>
                
                <div style="margin-bottom: 15px;">
                    <input type="search" id="adminUserSearch" placeholder="🔍 Szukaj użytkownika..." style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;">
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imię i nazwisko</th>
                            <th>Email</th>
                            <th>Rola</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody id="adminUsersList">
                        ${this.renderUsers()}
                    </tbody>
                </table>
            </div>
        `;

        // Event listeners
        const searchInput = document.getElementById('adminUserSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));
        }
    }

    renderUsers() {
        const roleLabels = {
            admin: '👑 Administrator',
            lawyer: '👔 Mecenas',
            client: '👤 Klient'
        };

        const roleColors = {
            admin: '#FFD700',
            lawyer: '#3B82F6',
            client: '#95a5a6'
        };

        return this.users.map(user => `
            <tr>
                <td><strong>#${user.id}</strong></td>
                <td>${this.escapeHtml(user.name)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td><span style="background: ${roleColors[user.role]} !important; color: white !important; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">${roleLabels[user.role]}</span></td>
                <td>
                    <button class="btn-small" onclick="adminPanel.viewUser(${user.id})">👁️ Zobacz</button>
                    ${user.role !== 'admin' ? `<button class="btn-small" style="background: #3B82F6; color: white;" onclick="adminPanel.deleteUser(${user.id})">🗑️ Usuń</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    filterUsers(query) {
        const rows = document.querySelectorAll('#adminUsersList tr');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    async viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        alert(`👤 Szczegóły użytkownika:\n\nID: ${user.id}\nImię: ${user.name}\nEmail: ${user.email}\nRola: ${user.role}`);
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const confirmDelete = confirm(`⚠️ UWAGA!\n\nCzy na pewno chcesz usunąć użytkownika:\n${user.name} (${user.email})?\n\nTa operacja wymaga hasła administratora.`);
        if (!confirmDelete) return;

        const password = prompt('🔒 Wprowadź hasło administratora:');
        if (!password) {
            alert('❌ Anulowano usuwanie');
            return;
        }

        if (password !== 'Proadmin') {
            alert('❌ Nieprawidłowe hasło administratora!');
            return;
        }

        try {
            // Usuń użytkownika z bazy
            await api.request(`/auth/users/${userId}`, { method: 'DELETE' });
            await this.loadUsers();
            this.render();
            alert('✅ Użytkownik został usunięty');
        } catch (error) {
            alert('❌ Błąd podczas usuwania użytkownika: ' + error.message);
        }
    }

    async purgeDeletedClients() {
        const modal = document.getElementById('deleteConfirmModal');
        const textEl = document.getElementById('deleteConfirmText');
        const passwordInput = document.getElementById('deleteAdminPassword');
        
        textEl.textContent = 'Czy na pewno chcesz TRWALE usunąć wszystkich usuniętych klientów z bazy danych? Ta operacja jest nieodwracalna!';
        passwordInput.value = '';
        modal.classList.add('active');
        passwordInput.focus();

        window.confirmDelete = async () => {
            const password = passwordInput.value;
            
            if (!password) {
                textEl.innerHTML = '<span style="color: #3B82F6;">❌ Wprowadź hasło administratora</span>';
                return;
            }

            console.log('=== PURGE START ===');
            console.log('Password entered:', password);
            console.log('Expected password: Proadmin');
            console.log('Passwords match:', password === 'Proadmin');
            
            try {
                console.log('Sending DELETE request to /clients/purge/deleted');
                const response = await api.request('/clients/purge/deleted', {
                    method: 'DELETE',
                    headers: {
                        'X-Admin-Password': password
                    }
                });

                console.log('=== PURGE SUCCESS ===');
                console.log('Purge response:', response);
                console.log('Deleted count:', response.deletedCount);
                
                // Sukces - pokaż komunikat i zamknij modal
                textEl.innerHTML = `<span style="color: #3B82F6;">✅ Usunięto ${response.deletedCount} klientów z bazy danych</span>`;
                
                // Zamknij modal po 2 sekundach
                setTimeout(() => {
                    modal.classList.remove('active');
                    textEl.innerHTML = '';
                }, 2000);
                
                // Odśwież statystyki
                await this.loadStats();
                this.render();
            } catch (error) {
                console.log('=== PURGE ERROR ===');
                console.error('Error object:', error);
                console.error('Error message:', error.message);
                console.log('Error includes "Nieprawidłowe hasło":', error.message.includes('Nieprawidłowe hasło'));
                
                // Błąd - NIE zamykaj modala, pokaż błąd
                if (error.message.includes('Nieprawidłowe hasło')) {
                    console.log('Showing wrong password error');
                    textEl.innerHTML = '<span style="color: #3B82F6; font-weight: 600;">❌ NIEPRAWIDŁOWE HASŁO ADMINISTRATORA!</span>';
                } else if (error.message.includes('Brak uprawnień')) {
                    console.log('Showing permission error');
                    textEl.innerHTML = '<span style="color: #3B82F6;">❌ Brak uprawnień - tylko administrator może czyścić bazę</span>';
                } else {
                    console.log('Showing generic error');
                    textEl.innerHTML = `<span style="color: #3B82F6;">❌ Błąd: ${error.message}</span>`;
                }
                
                // Wyczyść pole hasła i ustaw focus
                passwordInput.value = '';
                passwordInput.focus();
                
                console.log('Modal should remain open');
                // NIE zamykaj modala - użytkownik musi spróbować ponownie lub anulować
            }
        };

        window.closeDeleteModal = () => {
            modal.classList.remove('active');
        };
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderCharts() {
        // Wykres spraw według statusu
        const casesCtx = document.getElementById('casesChart');
        if (casesCtx && this.chartData?.casesByStatus) {
            new Chart(casesCtx, {
                type: 'doughnut',
                data: {
                    labels: this.chartData.casesByStatus.labels,
                    datasets: [{
                        data: this.chartData.casesByStatus.data,
                        backgroundColor: this.chartData.casesByStatus.colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Sprawy według statusu',
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                }
            });
        }

        // Wykres użytkowników według ról
        const usersCtx = document.getElementById('usersChart');
        if (usersCtx && this.chartData?.usersByRole) {
            new Chart(usersCtx, {
                type: 'bar',
                data: {
                    labels: this.chartData.usersByRole.labels,
                    datasets: [{
                        label: 'Liczba użytkowników',
                        data: this.chartData.usersByRole.data,
                        backgroundColor: this.chartData.usersByRole.colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Użytkownicy według ról',
                            font: { size: 16, weight: 'bold' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    showCreateAccountModal() {
        // TODO: Implementacja w następnym kroku
        alert('🔜 Kreator kont - w przygotowaniu!\\nBędzie dostępny w następnej wersji.');
    }
}

const adminPanel = new AdminPanel();
window.adminPanel = adminPanel;
