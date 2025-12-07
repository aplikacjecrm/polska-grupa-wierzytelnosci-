// ==========================================
// MODUŁ NOTATEK
// ==========================================

console.log('📝 Ładuję moduł notatek...');

// === FUNKCJA RENDEROWANIA ZAKŁADKI NOTATEK ===

window.renderNotesTab = async function(caseId) {
    console.log('📝 Renderuję zakładkę notatek dla sprawy:', caseId);
    
    try {
        // Pobierz notatki
        const response = await window.api.request(`/notes/case/${caseId}`);
        const notes = response.notes || [];
        
        console.log('📝 Pobrano notatek:', notes.length);
        
        // Mapowanie typów notatek
        const noteTypeConfig = {
            'general': { label: 'Ogólna', color: '#6c757d', icon: '📝' },
            'memo': { label: 'Memo', color: '#17a2b8', icon: '💭' },
            'strategy': { label: 'Strategia', color: '#3B82F6', icon: '🎯' },
            'analysis': { label: 'Analiza', color: '#3B82F6', icon: '🔍' },
            'report': { label: 'Raport', color: '#dc3545', icon: '📊' }
        };
        
        return `
            <div style="padding: 20px;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #1a2332;">📝 Notatki (${notes.length})</h3>
                    <button onclick="notesModule.showAddNoteForm(${caseId})" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                    ">
                        + Dodaj notatkę
                    </button>
                </div>
                
                ${notes.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; background: #f9f9f9; border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📝</div>
                        <p style="color: #999; font-size: 1.1rem; margin: 0;">Brak notatek w sprawie</p>
                        <p style="color: #bbb; font-size: 0.9rem; margin: 10px 0 0 0;">Dodaj pierwszą notatkę klikając przycisk powyżej</p>
                    </div>
                ` : `
                    <!-- Lista notatek -->
                    <div style="display: grid; gap: 15px;">
                        ${notes.map(n => {
                            const type = noteTypeConfig[n.note_type] || noteTypeConfig.general;
                            
                            return `
                                <div data-note-id="${n.id}" style="
                                    background: white;
                                    border: 2px solid #e0e0e0;
                                    border-left: 5px solid ${type.color};
                                    border-radius: 12px;
                                    padding: 20px;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                    transition: all 0.3s ease;
                                    ${n.is_important ? 'border: 2px solid #dc3545;' : ''}
                                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
                                    
                                    <!-- Kod notatki -->
                                    ${n.note_code ? `
                                        <div style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, #34495e, #2c3e50); color: white; border-radius: 8px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(52, 73, 94, 0.3);">
                                            🔢 ${n.note_code}
                                        </div>
                                    ` : `
                                        <div style="display: inline-block; padding: 4px 10px; background: #95a5a6; color: white; border-radius: 6px; font-size: 0.75rem; font-style: italic; margin-bottom: 12px;">
                                            ⚠️ Brak kodu
                                        </div>
                                    `}
                                    
                                    <!-- Nagłówek -->
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                        <div style="flex: 1;">
                                            <h4 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #1a2332;">
                                                ${n.is_important ? '⭐ ' : ''}${type.icon} ${window.crmManager.escapeHtml(n.title || 'Bez tytułu')}
                                            </h4>
                                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                                <span style="padding: 4px 10px; background: ${type.color}; color: white; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                    ${type.label}
                                                </span>
                                                ${n.is_important ? `
                                                    <span style="padding: 4px 10px; background: #dc3545; color: white; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                        ⭐ Ważne
                                                    </span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Treść -->
                                    <div style="color: #666; line-height: 1.6; margin-bottom: 15px; white-space: pre-wrap;">
                                        ${window.crmManager.escapeHtml(n.content).substring(0, 200)}${n.content.length > 200 ? '...' : ''}
                                    </div>
                                    
                                    <!-- Meta -->
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                                        <div style="font-size: 0.85rem; color: #999;">
                                            Autor: <strong>${window.crmManager.escapeHtml(n.author_name || 'Nieznany')}</strong> • 
                                            ${new Date(n.created_at).toLocaleString('pl-PL')}
                                        </div>
                                        <div style="display: flex; gap: 10px;">
                                            <button onclick="notesModule.viewDetails(${n.id})" style="
                                                padding: 6px 12px;
                                                background: #3B82F6;
                                                color: white;
                                                border: none;
                                                border-radius: 6px;
                                                cursor: pointer;
                                                font-size: 0.9rem;
                                            ">
                                                👁️ Szczegóły
                                            </button>
                                            <button onclick="notesModule.deleteNote(${n.id}, ${caseId})" style="
                                                padding: 6px 12px;
                                                background: #dc3545;
                                                color: white;
                                                border: none;
                                                border-radius: 6px;
                                                cursor: pointer;
                                                font-size: 0.9rem;
                                            ">
                                                🗑️ Usuń
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Błąd renderowania notatek:', error);
        return '<div style="padding: 20px; text-align: center; color: #dc3545;">Błąd ładowania notatek</div>';
    }
};

// === MODUŁ NOTATEK ===

window.notesModule = {
    showAddNoteForm: function(caseId) {
        // TODO: Implementacja formularza dodawania notatki
        alert('Formularz dodawania notatki - w przygotowaniu');
    },
    
    viewDetails: function(noteId) {
        // TODO: Implementacja wyświetlania szczegółów
        alert('Szczegóły notatki #' + noteId + ' - w przygotowaniu');
    },
    
    deleteNote: async function(noteId, caseId) {
        if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
            return;
        }
        
        try {
            await window.api.request(`/notes/${noteId}`, {
                method: 'DELETE'
            });
            
            alert('✅ Notatka została usunięta');
            
            // Odśwież zakładkę
            window.crmManager.switchCaseTab(caseId, 'notes');
        } catch (error) {
            console.error('❌ Błąd usuwania notatki:', error);
            alert('❌ Błąd usuwania notatki');
        }
    }
};

console.log('✅ Moduł notatek załadowany!');
