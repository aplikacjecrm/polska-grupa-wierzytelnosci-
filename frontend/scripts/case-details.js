// PROSTY widok szczegółów sprawy - bez zbędnych komplikacji
class CaseDetailsManager {
    constructor() {
        this.currentCase = null;
    }

    // Otwórz szczegóły sprawy
    async open(caseId, addToHistory = true) {
        try {
            console.log('📂 Ładuję sprawę:', caseId, 'addToHistory:', addToHistory);
            
            // Sprawdź czy api istnieje
            if (typeof api === 'undefined') {
                throw new Error('API nie jest załadowane');
            }
            
            // Pobierz dane sprawy z backend
            const response = await api.request(`/cases/${caseId}`);
            console.log('📥 Response:', response);
            
            if (!response || !response.case) {
                throw new Error('Nie znaleziono sprawy - response: ' + JSON.stringify(response));
            }
            
            this.currentCase = response.case;
            
            // NAJPIERW zamknij modal klienta jeśli jest otwarty
            const clientModal = document.getElementById('clientDetailsModal');
            if (clientModal && clientModal.classList.contains('active')) {
                console.log('🔒 Zamykam modal klienta...');
                clientModal.classList.remove('active');
            }
            
            // Dodaj do historii tylko jeśli to nowe otwarcie
            if (addToHistory) {
                history.pushState({ modal: 'caseDetails', caseId }, '', `#case-${caseId}`);
                console.log('📝 Dodano modal sprawy do historii');
            }
            
            // Renderuj widok
            this.render();
            
            // Otwórz modal
            const modal = document.getElementById('caseDetailsModal');
            if (modal) {
                console.log('📂 Otwieram modal sprawy...');
                modal.classList.add('active');
            }
            
            // Załaduj powiązane dane
            this.loadRelatedData();
            
        } catch (error) {
            console.error('❌ Błąd ładowania sprawy:', error);
            alert('Nie udało się załadować szczegółów sprawy: ' + error.message);
        }
    }

    // Renderuj podstawowe informacje
    render() {
        const c = this.currentCase;
        
        // Numer sprawy
        const numberElem = document.getElementById('detailsCaseNumber');
        if (numberElem) numberElem.textContent = c.case_number || 'Brak';
        
        // Tytuł
        const titleElem = document.getElementById('detailsTitle');
        if (titleElem) titleElem.textContent = c.title || 'Brak tytułu';
        
        // Klient
        let clientName = '';
        if (c.company_name) {
            clientName = c.company_name;
        } else {
            clientName = `${c.first_name || ''} ${c.last_name || ''}`.trim();
        }
        const clientElem = document.getElementById('detailsClient');
        if (clientElem) clientElem.textContent = clientName || 'Brak';
        
        // Typ sprawy
        const typeMap = {
            'civil': 'Cywilna',
            'criminal': 'Karna',
            'family': 'Rodzinna',
            'corporate': 'Gospodarcza',
            'administrative': 'Administracyjna',
            'other': 'Inna'
        };
        const typeElem = document.getElementById('detailsType');
        if (typeElem) typeElem.textContent = window.translateCaseType ? window.translateCaseType(c.case_type) : (typeMap[c.case_type] || c.case_type || 'Brak');
        
        // Status
        const statusMap = {
            'new': 'Nowa',
            'in_progress': 'W toku',
            'suspended': 'Zawieszona',
            'closed': 'Zamknięta',
            'archived': 'Archiwalna'
        };
        const statusElem = document.getElementById('detailsStatus');
        if (statusElem) statusElem.textContent = statusMap[c.status] || c.status || 'Brak';
        
        // Priorytet
        const priorityMap = {
            'low': 'Niski',
            'medium': 'Średni',
            'high': 'Wysoki',
            'urgent': 'Pilny'
        };
        const priorityElem = document.getElementById('detailsPriority');
        if (priorityElem) priorityElem.textContent = priorityMap[c.priority] || c.priority || 'Brak';
        
        // Mecenas
        const lawyerElem = document.getElementById('detailsLawyer');
        if (lawyerElem) lawyerElem.textContent = c.assigned_to_name || 'Nie przypisano';
        
        // Opis
        const descElem = document.getElementById('detailsDescription');
        if (descElem) {
            if (descElem.tagName === 'TEXTAREA') {
                descElem.value = c.description || '';
            } else {
                descElem.textContent = c.description || 'Brak opisu';
            }
        }
    }

    // Załaduj powiązane dane
    async loadRelatedData() {
        try {
            // Dokumenty
            await this.loadDocuments();
            
            // Wydarzenia/Terminy
            await this.loadEvents();
            
            // Komentarze
            await this.loadComments();
            
        } catch (error) {
            console.error('❌ Błąd ładowania danych:', error);
        }
    }

    // Załaduj dokumenty
    async loadDocuments() {
        try {
            console.log('📄 Ładuję dokumenty dla sprawy:', this.currentCase.id);
            const response = await api.request(`/documents/case/${this.currentCase.id}`);
            console.log('📄 Response dokumentów:', response);
            const documents = response.documents || [];
            console.log('📄 Liczba dokumentów:', documents.length);
            
            const container = document.getElementById('documentsList');
            if (!container) return;
            
            if (documents.length === 0) {
                container.innerHTML = '<p style="color: #999; padding: 10px;">Brak dokumentów</p>';
                return;
            }
            
            container.innerHTML = documents.map(doc => `
                <div style="padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${doc.document_code || 'Dok-' + doc.id}</strong>
                            <div style="font-size: 0.9rem; color: #666;">${doc.title || doc.file_name}</div>
                            <div style="font-size: 0.8rem; color: #999;">${new Date(doc.uploaded_at).toLocaleDateString('pl-PL')}</div>
                        </div>
                        <div>
                            <button onclick="caseDetails.downloadDocument(${doc.id})" 
                                    style="padding: 6px 12px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                📥 Pobierz
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('❌ Błąd ładowania dokumentów:', error);
        }
    }

    // Załaduj wydarzenia
    async loadEvents() {
        try {
            const response = await api.request(`/events/case/${this.currentCase.id}`);
            const events = response.events || [];
            
            const container = document.getElementById('eventsList');
            if (!container) return;
            
            if (events.length === 0) {
                container.innerHTML = '<p style="color: #999; padding: 10px;">Brak terminów</p>';
                return;
            }
            
            container.innerHTML = events.map(event => {
                const eventDate = new Date(event.event_date);
                const today = new Date();
                const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                
                let urgencyColor = '#95a5a6';
                if (daysUntil < 0) urgencyColor = '#3B82F6';
                else if (daysUntil <= 3) urgencyColor = '#3B82F6';
                else if (daysUntil <= 7) urgencyColor = '#3B82F6';
                
                return `
                    <div style="padding: 10px; border-left: 4px solid ${urgencyColor}; background: #f8f9fa; border-radius: 4px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <strong>${event.event_code || 'Wydarzenie-' + event.id}</strong>
                                <div style="font-size: 0.9rem; margin-top: 4px;">${event.title}</div>
                                <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                                    📅 ${eventDate.toLocaleDateString('pl-PL')} ${eventDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}
                                </div>
                                ${event.location ? `<div style="font-size: 0.85rem; color: #666;">📍 ${event.location}</div>` : ''}
                            </div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: ${urgencyColor};">
                                ${daysUntil < 0 ? 'Minął' : daysUntil === 0 ? 'Dziś!' : `Za ${daysUntil} dni`}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('❌ Błąd ładowania wydarzeń:', error);
        }
    }

    // Załaduj komentarze
    async loadComments() {
        try {
            const response = await api.request(`/comments/case/${this.currentCase.id}`);
            const comments = response.comments || [];
            
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
                            ${comment.internal ? ' 🔒 Wewnętrzny' : ''}
                        </span>
                    </div>
                    <div style="color: #333; line-height: 1.5;">${comment.comment}</div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('❌ Błąd ładowania komentarzy:', error);
        }
    }

// Załaduj wydarzenia
async loadEvents() {
    try {
        const response = await api.request(`/events/case/${this.currentCase.id}`);
        const events = response.events || [];
        
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        if (events.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">Brak terminów</p>';
            return;
        }
        
        container.innerHTML = events.map(event => {
            const eventDate = new Date(event.event_date);
            const today = new Date();
            const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            
            let urgencyColor = '#95a5a6';
            if (daysUntil < 0) urgencyColor = '#3B82F6';
            else if (daysUntil <= 3) urgencyColor = '#3B82F6';
            else if (daysUntil <= 7) urgencyColor = '#3B82F6';
            
            return `
                <div style="padding: 10px; border-left: 4px solid ${urgencyColor}; background: #f8f9fa; border-radius: 4px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong>${event.event_code || 'Wydarzenie-' + event.id}</strong>
                            <div style="font-size: 0.9rem; margin-top: 4px;">${event.title}</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                                📅 ${eventDate.toLocaleDateString('pl-PL')} ${eventDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}
                            </div>
                            ${event.location ? `<div style="font-size: 0.85rem; color: #666;">📍 ${event.location}</div>` : ''}
                        </div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: ${urgencyColor};">
                            ${daysUntil < 0 ? 'Minął' : daysUntil === 0 ? 'Dziś!' : `Za ${daysUntil} dni`}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Błąd ładowania wydarzeń:', error);
    }
}

// Załaduj komentarze
async loadComments() {
    try {
        const response = await api.request(`/comments/case/${this.currentCase.id}`);
        const comments = response.comments || [];
        
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
                        ${comment.internal ? ' 🔒 Wewnętrzny' : ''}
                    </span>
                </div>
                <div style="color: #333; line-height: 1.5;">${comment.comment}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Błąd ładowania komentarzy:', error);
    }
}

// Pobierz dokument
async downloadDocument(docId) {
    window.open(`https://web-production-7504.up.railway.app/api/documents/download/${docId}`, '_blank');
}

// Zamknij modal
close() {
    const modal = document.getElementById('caseDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        // Wróć do poprzedniego stanu (bez modala)
        if (history.state && history.state.modal === 'caseDetails') {
            history.back();
        }
    }
    this.currentCase = null;
}

}

// Globalny dostęp
window.caseDetails = new CaseDetailsManager();

// Auto-inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    // Zamykanie modala
    const closeButtons = document.querySelectorAll('#caseDetailsModal .modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => window.caseDetails.close());
    });
});

