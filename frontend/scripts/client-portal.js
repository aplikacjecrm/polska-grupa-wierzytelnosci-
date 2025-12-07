class ClientPortal {
    constructor() {
        this.myCases = [];
        this.myDocuments = [];
        this.myEvents = [];
        this.projects = [];
    }

    async init() {
        await this.loadMyCases();
        await this.loadMyEvents();
        await this.loadMyDocuments();
        await this.loadProjects();
        this.render();
    }

    async loadMyCases() {
        try {
            // Pobierz sprawy klienta
            const response = await api.request('/cases');
            this.myCases = response.cases || [];
        } catch (error) {
            console.error('Błąd ładowania spraw:', error);
        }
    }

    async loadMyEvents() {
        try {
            // Pobierz wydarzenia/terminy klienta
            const response = await api.request('/events');
            this.myEvents = response.events || [];
            console.log('✅ Załadowano wydarzenia klienta:', this.myEvents.length);
        } catch (error) {
            console.error('Błąd ładowania wydarzeń:', error);
            this.myEvents = [];
        }
    }

    async loadMyDocuments() {
        try {
            // Pobierz dokumenty klienta
            const response = await api.request('/documents');
            this.myDocuments = response.documents || [];
            console.log('✅ Załadowano dokumenty klienta:', this.myDocuments.length);
        } catch (error) {
            console.error('Błąd ładowania dokumentów:', error);
            this.myDocuments = [];
        }
    }

    async loadProjects() {
        try {
            // Pobierz projekty inwestycyjne
            const response = await api.request('/projects');
            this.projects = response.projects || [];
        } catch (error) {
            console.error('Błąd ładowania projektów:', error);
            this.projects = [];
        }
    }

    render() {
        const container = document.getElementById('clientPortalView');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h2>🏠 Mój Portal</h2>
            </div>

            <div style="padding: 20px;">
                <!-- Powitanie -->
                <div style="background: linear-gradient(145deg, #FFD700, #FFC700); padding: 30px; border-radius: 16px; margin-bottom: 20px; color: #1a1a2e;">
                    <h2 style="margin: 0 0 10px 0;">Witaj w Portalu Klienta! 👋</h2>
                    <p style="margin: 0; opacity: 0.9;">Tutaj znajdziesz wszystkie informacje o swoich sprawach i możliwości współpracy.</p>
                </div>

                <!-- Moje sprawy -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px;">📋 Moje Sprawy</h3>
                    ${this.myCases.length > 0 ? `
                        <div style="display: grid; gap: 15px;">
                            ${this.myCases.map(c => `
                                <div style="border: 2px solid #e0e0e0; padding: 20px; border-radius: 12px; cursor: pointer; transition: all 0.3s;" onclick="clientPortal.viewCase(${c.id})">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div>
                                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${this.escapeHtml(c.title)}</h4>
                                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Numer sprawy: <strong>${this.escapeHtml(c.case_number)}</strong></p>
                                        </div>
                                        <span style="background: #3B82F6; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem;">${c.status}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 40px; color: #95a5a6;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">📋</div>
                            <p>Nie masz jeszcze żadnych spraw.</p>
                        </div>
                    `}
                </div>

                <!-- Moje terminy/wydarzenia -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px;">📅 Moje Terminy</h3>
                    ${this.myEvents.length > 0 ? `
                        <div style="display: grid; gap: 15px;">
                            ${this.myEvents.slice(0, 5).map(e => `
                                <div style="border-left: 4px solid #FFD700; padding: 15px; background: #fffdf7; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div style="flex: 1;">
                                            <h4 style="margin: 0 0 8px 0; color: #2c3e50;">${this.escapeHtml(e.title)}</h4>
                                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                                                📅 ${new Date(e.start_date).toLocaleDateString('pl-PL')} | 
                                                🕐 ${new Date(e.start_date).toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}
                                            </p>
                                            ${e.location ? `<p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">📍 ${this.escapeHtml(e.location)}</p>` : ''}
                                        </div>
                                        <span style="background: #FFD700; color: #1a1a2e; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${e.event_type}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 40px; color: #95a5a6;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">📅</div>
                            <p>Brak nadchodzących terminów.</p>
                        </div>
                    `}
                </div>

                <!-- Moje dokumenty -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px;">📄 Moje Dokumenty</h3>
                    ${this.myDocuments.length > 0 ? `
                        <div style="display: grid; gap: 12px;">
                            ${this.myDocuments.slice(0, 10).map(d => `
                                <div style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 0.95rem;">${this.escapeHtml(d.title || d.file_name)}</h4>
                                        <p style="margin: 0; color: #7f8c8d; font-size: 0.85rem;">
                                            ${new Date(d.uploaded_at).toLocaleDateString('pl-PL')} | 
                                            ${(d.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button onclick="clientPortal.downloadDocument(${d.id})" style="padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                        📥 Pobierz
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 40px; color: #95a5a6;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                            <p>Brak dokumentów.</p>
                        </div>
                    `}
                </div>

                <!-- Szybkie akcje -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
                    <button onclick="app.switchView('chat')" style="background: linear-gradient(145deg, #3B82F6, #1E40AF); color: white; padding: 30px; border: none; border-radius: 12px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                        💬 Czat z Kancelarią
                    </button>
                    <button onclick="app.switchView('mail')" style="background: linear-gradient(145deg, #3B82F6, #3B82F6); color: white; padding: 30px; border: none; border-radius: 12px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                        ✉️ Wyślij Wiadomość
                    </button>
                    <button onclick="app.switchView('projects')" style="background: linear-gradient(145deg, #FFD700, #FFC700); color: #1a1a2e; padding: 30px; border: none; border-radius: 12px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                        💼 Projekty Inwestycyjne
                    </button>
                </div>

                <!-- Informacje -->
                <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; border-left: 4px solid #3B82F6;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">ℹ️ Informacja</h4>
                    <p style="margin: 0; color: #555;">W razie pytań lub wątpliwości, skontaktuj się z nami przez czat lub email. Jesteśmy tu, aby Ci pomóc!</p>
                </div>
            </div>
        `;
    }

    viewCase(caseId) {
        alert('Szczegóły sprawy będą dostępne wkrótce');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Projekty Inwestycyjne
class InvestmentProjects {
    constructor() {
        this.projects = [];
    }

    async init() {
        await this.loadProjects();
        this.render();
    }

    async loadProjects() {
        // Przykładowe projekty
        this.projects = [
            {
                id: 1,
                title: 'Budowa Osiedla Mieszkaniowego "Zielone Wzgórza"',
                description: 'Nowoczesne osiedle 50 domów jednorodzinnych w malowniczej lokalizacji.',
                targetAmount: 5000000,
                currentAmount: 3200000,
                investors: 12,
                category: 'Nieruchomości',
                risk: 'Średnie',
                returnRate: '12-15%',
                duration: '24 miesiące'
            },
            {
                id: 2,
                title: 'Startup Technologiczny - Aplikacja FinTech',
                description: 'Innowacyjna aplikacja do zarządzania finansami osobistymi z AI.',
                targetAmount: 1000000,
                currentAmount: 450000,
                investors: 8,
                category: 'Technologia',
                risk: 'Wysokie',
                returnRate: '25-40%',
                duration: '18 miesięcy'
            },
            {
                id: 3,
                title: 'Farma Solarna 2MW',
                description: 'Ekologiczna inwestycja w odnawialne źródła energii.',
                targetAmount: 3000000,
                currentAmount: 2800000,
                investors: 15,
                category: 'Energia',
                risk: 'Niskie',
                returnRate: '8-10%',
                duration: '36 miesięcy'
            }
        ];
    }

    render() {
        const container = document.getElementById('projectsView');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h2>💼 Projekty Inwestycyjne</h2>
                <button class="btn-action primary" onclick="investmentProjects.showAddProject()">➕ Dodaj Projekt</button>
            </div>

            <div style="padding: 20px;">
                <!-- Info banner -->
                <div style="background: linear-gradient(145deg, #FFD700, #FFC700); padding: 25px; border-radius: 16px; margin-bottom: 30px; color: #1a1a2e;">
                    <h3 style="margin: 0 0 10px 0;">🤝 Od Klienta dla Klienta</h3>
                    <p style="margin: 0; opacity: 0.9;">Platforma współinwestowania dla klientów kancelarii. Dziel się pomysłami, inwestuj wspólnie, rozwijaj się razem!</p>
                </div>

                <!-- Filtry -->
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                        <select style="padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                            <option>Wszystkie kategorie</option>
                            <option>Nieruchomości</option>
                            <option>Technologia</option>
                            <option>Energia</option>
                            <option>Inne</option>
                        </select>
                        <select style="padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                            <option>Wszystkie ryzyka</option>
                            <option>Niskie</option>
                            <option>Średnie</option>
                            <option>Wysokie</option>
                        </select>
                        <input type="number" placeholder="Min. kwota" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                        <input type="search" placeholder="🔍 Szukaj..." style="padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                </div>

                <!-- Lista projektów -->
                <div style="display: grid; gap: 20px;">
                    ${this.projects.map(p => this.renderProject(p)).join('')}
                </div>
            </div>
        `;
    }

    renderProject(project) {
        const progress = (project.currentAmount / project.targetAmount * 100).toFixed(1);
        const riskColors = {
            'Niskie': '#3B82F6',
            'Średnie': '#3B82F6',
            'Wysokie': '#3B82F6'
        };

        return `
            <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="padding: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #2c3e50; flex: 1;">${this.escapeHtml(project.title)}</h3>
                        <span style="background: ${riskColors[project.risk]}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; white-space: nowrap; margin-left: 15px;">Ryzyko: ${project.risk}</span>
                    </div>
                    
                    <p style="color: #7f8c8d; margin: 0 0 20px 0;">${this.escapeHtml(project.description)}</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div>
                            <div style="font-size: 0.85rem; color: #95a5a6;">Kategoria</div>
                            <div style="font-weight: 600; color: #2c3e50;">${project.category}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #95a5a6;">Zwrot</div>
                            <div style="font-weight: 600; color: #3B82F6;">${project.returnRate}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #95a5a6;">Czas trwania</div>
                            <div style="font-weight: 600; color: #2c3e50;">${project.duration}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #95a5a6;">Inwestorzy</div>
                            <div style="font-weight: 600; color: #3B82F6;">${project.investors} osób</div>
                        </div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 0.9rem; color: #7f8c8d;">Zebrano:</span>
                            <span style="font-weight: 600; color: #2c3e50;">${progress}%</span>
                        </div>
                        <div style="background: #e0e0e0; height: 12px; border-radius: 6px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #FFD700, #FFC700); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.9rem;">
                            <span style="color: #2c3e50; font-weight: 600;">${(project.currentAmount / 1000).toFixed(0)}k PLN</span>
                            <span style="color: #7f8c8d;">z ${(project.targetAmount / 1000).toFixed(0)}k PLN</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="investmentProjects.viewProject(${project.id})" style="flex: 1; padding: 12px; background: white; border: 2px solid #3B82F6; color: #3B82F6; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            📊 Szczegóły
                        </button>
                        <button onclick="investmentProjects.invest(${project.id})" style="flex: 1; padding: 12px; background: linear-gradient(145deg, #FFD700, #FFC700); border: none; color: #1a1a2e; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            💰 Inwestuj
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showAddProject() {
        alert('Formularz dodawania projektu będzie dostępny wkrótce!\n\nBędziesz mógł:\n- Opisać swój projekt\n- Określić cel finansowy\n- Zaprosić innych do współinwestowania');
    }

    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        alert(`📊 Szczegóły projektu:\n\n${project.title}\n\nPełna prezentacja projektu będzie dostępna wkrótce!`);
    }

    invest(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const amount = prompt(`💰 Ile chcesz zainwestować w projekt:\n"${project.title}"?\n\nPodaj kwotę w PLN:`);
        if (amount && !isNaN(amount) && amount > 0) {
            alert(`✅ Dziękujemy za zainteresowanie!\n\nTwoja deklaracja inwestycji: ${amount} PLN\n\nKancelaria skontaktuje się z Tobą w celu finalizacji.`);
        }
    }

    downloadDocument(docId) {
        const token = localStorage.getItem('token');
        window.open(`https://web-production-7504.up.railway.app/api/documents/download/${docId}?token=${token}`, '_blank');
    }

    viewCase(caseId) {
        // Przełącz na widok szczegółów sprawy
        if (window.crmManager) {
            crmManager.viewCase(caseId);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const clientPortal = new ClientPortal();
const investmentProjects = new InvestmentProjects();
window.clientPortal = clientPortal;
window.investmentProjects = investmentProjects;

