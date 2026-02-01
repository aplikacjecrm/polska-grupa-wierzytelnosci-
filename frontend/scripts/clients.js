// MODUŁ KLIENTÓW - Prosta obsługa klientów
class ClientsModule {
    constructor() {
        this.clients = [];
        this.currentClient = null;
        this.init();
    }

    init() {
        console.log('👥 ClientsModule inicjalizacja...');
        
        // Słuchaj zmian route
        if (window.router) {
            window.router.addListener((route) => {
                if (route.type === 'client') {
                    this.showDetails(route.id);
                }
            });
        }
    }

    // Załaduj listę klientów
    async loadList(status = '') {
        try {
            if (window.showLoading) showLoading('Ładowanie klientów...');
            const response = await window.api.request(`/clients?status=${status}`);
            this.clients = response.clients || [];
            if (window.hideLoading) hideLoading();
            return this.clients;
        } catch (error) {
            if (window.hideLoading) hideLoading();
            if (window.showToast) showToast('Błąd ładowania klientów: ' + error.message, 'error');
            return [];
        }
    }

    // Pokaż szczegóły klienta
    async showDetails(clientId) {
        try {
            console.log('👤 Ładuję szczegóły klienta:', clientId);
            console.log('🔍 Sprawdzam czy modals jest dostępny:', window.modals);
            console.log('🔍 Sprawdzam czy ui jest dostępny:', window.ui);
            console.log('🔍 Sprawdzam czy api jest dostępny:', window.api);
            
            // Sprawdź czy modal istnieje
            const modalElement = document.getElementById('clientDetailsModal');
            console.log('🔍 Modal element:', modalElement);
            
            if (!modalElement) {
                console.error('❌ Modal clientDetailsModal nie istnieje w DOM!');
                alert('Błąd: Modal klienta nie został znaleziony');
                return;
            }
            
            // Otwórz modal
            if (window.openModal) {
                console.log('✅ Otwieram modal przez openModal()...');
                openModal('clientDetailsModal');
            } else {
                console.log('⚠️ openModal nie istnieje, otwieram bezpośrednio...');
                modalElement.classList.add('active');
            }
            
            // Załaduj dane
            if (window.showLoading) {
                showLoading('Ładowanie danych klienta...');
            } else {
                console.log('⚠️ showLoading nie istnieje');
            }
            
            const [client, cases, files, notes] = await Promise.all([
                window.api.request(`/clients/${clientId}`).then(r => r?.client).catch(e => { console.error('Błąd client:', e); return null; }),
                window.api.request(`/clients/${clientId}/cases`).then(r => r?.cases || []).catch(e => { console.error('Błąd cases:', e); return []; }),
                window.api.request(`/clients/${clientId}/files`).then(r => r?.files || []).catch(e => { console.error('Błąd files:', e); return []; }),
                window.api.request(`/clients/${clientId}/notes`).then(r => r?.notes || []).catch(e => { console.error('Błąd notes:', e); return []; })
            ]);
            
            if (!client) {
                throw new Error('Nie udało się załadować danych klienta');
            }
            
            this.currentClient = client;
            
            // Render danych
            this.renderClientHeader(client);
            this.renderClientInfo(client);
            this.renderClientCases(cases);
            this.renderClientFiles(files, client);
            this.renderClientHistory(notes, client);
            
            // Setup zakładek
            this.setupTabs();
            
            if (window.hideLoading) {
                hideLoading();
            }
            
            console.log('✅ Szczegóły klienta załadowane i wyświetlone!');
            
        } catch (error) {
            if (window.hideLoading) {
                hideLoading();
            }
            console.error('❌ Błąd ładowania szczegółów:', error);
            console.error('❌ Stack trace:', error.stack);
            
            if (window.showToast) {
                showToast('Błąd: ' + error.message, 'error');
            } else {
                alert('Błąd: ' + error.message);
            }
            
            if (window.closeModal) {
                closeModal('clientDetailsModal');
            } else {
                const modal = document.getElementById('clientDetailsModal');
                if (modal) modal.classList.remove('active');
            }
        }
    }

    // Renderuj nagłówek
    renderClientHeader(client) {
        const nameElem = document.getElementById('clientDetailsName');
        const companyElem = document.getElementById('clientDetailsCompany');
        
        if (nameElem) {
            nameElem.textContent = `${client.first_name} ${client.last_name}`;
        }
        if (companyElem) {
            companyElem.textContent = client.company_name || 'Brak firmy';
        }
    }

    // Renderuj informacje
    renderClientInfo(client) {
        const pane = document.getElementById('clientInfoPane');
        if (!pane) return;
        
        pane.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <div>
                    <h3 style="color: #1a2332; margin-bottom: 15px; font-size: 1.1rem; border-left: 4px solid #FFD700; padding-left: 12px;">📞 Dane kontaktowe</h3>
                    <div style="background: white; padding: 15px; border-radius: 12px; border: 2px solid #ecf0f1;">
                        <div style="margin-bottom: 12px;">
                            <div style="color: #7f8c8d; font-size: 0.85rem;">Email</div>
                            <div style="font-weight: 600; color: #2c3e50;">${client.email || 'Brak'}</div>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem;">Telefon</div>
                            <div style="font-weight: 600; color: #2c3e50;">${client.phone || 'Brak'}</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #1a2332; margin-bottom: 15px; font-size: 1.1rem; border-left: 4px solid #FFD700; padding-left: 12px;">📍 Adres</h3>
                    <div style="background: white; padding: 15px; border-radius: 12px; border: 2px solid #ecf0f1;">
                        <div>${client.address_street || 'Brak'}</div>
                        <div>${client.address_postal || ''} ${client.address_city || ''}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderuj sprawy
    renderClientCases(cases) {
        const pane = document.getElementById('clientCasesPane');
        if (!pane) return;
        
        if (cases.length === 0) {
            pane.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">Brak spraw</div>';
            return;
        }
        
        pane.innerHTML = `
            <div style="display: grid; gap: 15px;">
                ${cases.map(c => `
                    <div style="background: white; border: 2px solid #ecf0f1; border-radius: 12px; padding: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #1a2332;">${c.title}</h4>
                        <p style="color: #7f8c8d; margin: 0 0 10px 0;">${c.description || 'Brak opisu'}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.85rem; color: #7f8c8d;">📋 ${c.case_number}</div>
                            <button onclick="router.navigate({ type: 'case', id: ${c.id} })" 
                                    style="padding: 8px 16px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                👁️ Otwórz sprawę
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Renderuj pliki
    renderClientFiles(files, client) {
        const pane = document.getElementById('clientFilesPane');
        if (!pane) return;
        
        pane.innerHTML = files.length === 0 
            ? '<div style="text-align: center; padding: 40px; color: #7f8c8d;">Brak plików</div>'
            : `<div style="display: grid; gap: 12px;">
                ${files.map(file => `
                    <div style="background: white; border: 2px solid #ecf0f1; border-radius: 12px; padding: 15px;">
                        <div style="font-weight: 600; color: #1a2332;">${file.title || file.file_name}</div>
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 4px;">
                            ${new Date(file.created_at).toLocaleDateString('pl-PL')}
                        </div>
                    </div>
                `).join('')}
            </div>`;
    }

    // Renderuj historię
    renderClientHistory(notes, client) {
        const pane = document.getElementById('clientHistoryPane');
        if (!pane) return;
        
        pane.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">Brak historii</div>';
    }

    // Setup zakładek
    setupTabs() {
        const tabs = document.querySelectorAll('.client-tab');
        const panes = document.querySelectorAll('.client-tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Usuń aktywne
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = '#ecf0f1';
                    t.style.color = '#2c3e50';
                });
                
                panes.forEach(p => p.style.display = 'none');
                
                // Dodaj aktywne
                tab.classList.add('active');
                tab.style.background = 'linear-gradient(135deg, #FFD700, #d4af37)';
                tab.style.color = '#1a2332';
                
                const targetPane = document.querySelector(`[data-pane="${targetTab}"]`);
                if (targetPane) targetPane.style.display = 'block';
            });
        });
    }
}

// Globalny dostęp
window.clientsModule = new ClientsModule();
