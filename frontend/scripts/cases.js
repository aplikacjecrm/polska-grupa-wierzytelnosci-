// MODUŁ SPRAW - Prosta obsługa spraw
class CasesModule {
    constructor() {
        this.cases = [];
        this.currentCase = null;
        this.init();
    }

    init() {
        console.log('⚖️ CasesModule inicjalizacja...');
        
        // Słuchaj zmian route
        if (window.router) {
            window.router.addListener((route) => {
                if (route.type === 'case') {
                    this.showDetails(route.id);
                }
            });
        }
    }

    // Załaduj listę spraw
    async loadList(status = '') {
        try {
            if (window.showLoading) showLoading('Ładowanie spraw...');
            const response = await window.api.request(`/cases?status=${status}`);
            this.cases = response.cases || [];
            if (window.hideLoading) hideLoading();
            return this.cases;
        } catch (error) {
            if (window.hideLoading) hideLoading();
            if (window.showToast) showToast('Błąd ładowania spraw: ' + error.message, 'error');
            return [];
        }
    }

    // Pokaż szczegóły sprawy
    async showDetails(caseId) {
        try {
            console.log('📁 Ładuję szczegóły sprawy:', caseId);
            
            // Zamknij modal klienta jeśli otwarty
            if (window.closeModal) closeModal('clientDetailsModal');
            
            // Otwórz modal sprawy
            if (window.openModal) openModal('caseDetailsModal');
            
            // Załaduj dane
            if (window.showLoading) showLoading('Ładowanie sprawy...');
            
            const [caseData, documents, events, comments] = await Promise.all([
                window.api.request(`/cases/${caseId}`).then(r => r?.case).catch(e => { console.error('Błąd case:', e); return null; }),
                window.api.request(`/documents/case/${caseId}`).then(r => r?.documents || []).catch(e => { console.error('Błąd documents:', e); return []; }),
                window.api.request(`/events/case/${caseId}`).then(r => r?.events || []).catch(e => { console.error('Błąd events:', e); return []; }),
                window.api.request(`/comments/case/${caseId}`).then(r => r?.comments || []).catch(e => { console.error('Błąd comments:', e); return []; })
            ]);
            
            if (!caseData) {
                throw new Error('Nie udało się załadować danych sprawy');
            }
            
            this.currentCase = caseData;
            
            // Render
            this.renderCaseInfo(caseData);
            this.renderDocuments(documents);
            this.renderEvents(events);
            this.renderComments(comments);
            
            if (window.hideLoading) hideLoading();
            
        } catch (error) {
            if (window.hideLoading) hideLoading();
            console.error('❌ Błąd ładowania sprawy:', error);
            if (window.showToast) showToast('Błąd: ' + error.message, 'error');
            if (window.closeModal) closeModal('caseDetailsModal');
        }
    }

    // Renderuj info
    renderCaseInfo(c) {
        const fields = {
            'detailsCaseNumber': c.case_number || 'Brak',
            'detailsTitle': c.title || 'Brak',
            'detailsClient': `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Brak',
            'detailsType': window.translateCaseType ? window.translateCaseType(c.case_type) : (c.case_type || 'Brak'),
            'detailsStatus': c.status || 'Brak',
            'detailsPriority': c.priority || 'Brak',
            'detailsLawyer': c.assigned_to_name || 'Nie przypisano',
            'detailsDescription': c.description || 'Brak opisu'
        };
        
        Object.keys(fields).forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = fields[id];
        });
    }

    // Renderuj dokumenty
    renderDocuments(documents) {
        const container = document.getElementById('documentsList');
        if (!container) return;
        
        if (documents.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">Brak dokumentów</p>';
            return;
        }
        
        container.innerHTML = documents.map(doc => `
            <div style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${doc.title || doc.file_name}</strong>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        📅 ${new Date(doc.created_at).toLocaleDateString('pl-PL')}
                    </div>
                </div>
                <button onclick="window.open('https://web-production-ef868.up.railway.app/api/documents/download/${doc.id}', '_blank')" 
                        style="padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    📥 Pobierz
                </button>
            </div>
        `).join('');
    }

    // Renderuj wydarzenia
    renderEvents(events) {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        if (events.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">Brak terminów</p>';
            return;
        }
        
        container.innerHTML = events.map(event => {
            const eventDate = new Date(event.event_date);
            const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
            let urgencyColor = daysUntil < 0 ? '#3B82F6' : daysUntil <= 3 ? '#3B82F6' : '#95a5a6';
            
            return `
                <div style="padding: 10px; border-left: 4px solid ${urgencyColor}; background: #f8f9fa; border-radius: 4px; margin-bottom: 8px;">
                    <strong>${event.title}</strong>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        📅 ${eventDate.toLocaleDateString('pl-PL')} ${eventDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                    ${event.location ? `<div style="font-size: 0.85rem; color: #666;">📍 ${event.location}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Renderuj komentarze
    renderComments(comments) {
        const container = document.getElementById('commentsList');
        if (!container) return;
        
        if (comments.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">Brak komentarzy</p>';
            return;
        }
        
        container.innerHTML = comments.map(comment => `
            <div style="padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; background: ${comment.internal ? '#F8FAFC' : 'white'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <strong>${comment.author_name || 'Użytkownik'}</strong>
                    <span style="font-size: 0.85rem; color: #999;">
                        ${new Date(comment.created_at).toLocaleString('pl-PL')}
                        ${comment.internal ? ' 🔒' : ''}
                    </span>
                </div>
                <div>${comment.comment}</div>
            </div>
        `).join('');
    }
}

// Globalny dostęp
window.casesModule = new CasesModule();

