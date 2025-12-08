// 🗑️ MODUŁ USUWANIA DOKUMENTÓW - TYLKO DLA ADMINA
console.log('🗑️ delete-document-admin.js ZAŁADOWANY!');

// Debug: Sprawdź od razu czy wykryto admina
setTimeout(() => {
    console.log('🔍 INITIAL ADMIN CHECK:');
    console.log('📊 localStorage values:', {
        user: localStorage.getItem('user'),
        userRole: localStorage.getItem('userRole'),
        theme: localStorage.getItem('theme')
    });
    
    // Wywołaj funkcję isUserAdmin gdy będzie dostępna
    if (typeof isUserAdmin === 'function') {
        console.log('✅ isUserAdmin:', isUserAdmin());
    }
}, 500);

/**
 * Usuń dokument (tylko admin)
 * @param {number} documentId - ID dokumentu do usunięcia
 * @param {number} caseId - ID sprawy (do odświeżenia listy po usunięciu)
 */
window.deleteDocumentAdmin = async function(documentId, caseId) {
    console.log(`🗑️ Próba usunięcia dokumentu ${documentId}`);
    
    // 1. Sprawdź czy użytkownik jest adminem
    console.log('🔍 Sprawdzam uprawnienia admina...');
    console.log('📊 localStorage:', {
        'user': localStorage.getItem('user'),
        'userRole': localStorage.getItem('userRole'),
        'theme': localStorage.getItem('theme')
    });
    
    if (!isUserAdmin()) {
        console.error('❌ Użytkownik NIE jest adminem!');
        showNotification('❌ Brak uprawnień! Tylko administrator może usuwać dokumenty.', 'error');
        return;
    }
    
    console.log('✅ Użytkownik jest adminem - można usuwać');
    
    // 2. Pokaż własny modal potwierdzenia (w stylu aplikacji)
    const confirmed = await showCustomConfirm(
        'CZY NA PEWNO USUNĄĆ TEN DOKUMENT?',
        'Ta operacja jest NIEODWRACALNA!\nDokument zostanie usunięty z bazy danych i dysku.'
    );
    
    if (!confirmed) {
        console.log('❌ Użytkownik anulował usuwanie');
        return;
    }
    
    try {
        console.log(`📡 Wysyłam żądanie usunięcia dokumentu ${documentId}...`);
        
        // Wywołaj endpoint usuwania
        const response = await window.api.request(`/documents/emergency-cleanup/${documentId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ Odpowiedź z serwera:', response);
        
        // USUŃ ELEMENT Z DOM (natychmiastowe usunięcie wizualne)
        const documentElement = document.querySelector(`[data-document-id="${documentId}"]`);
        if (documentElement) {
            documentElement.style.transition = 'all 0.3s ease';
            documentElement.style.opacity = '0';
            documentElement.style.transform = 'translateX(-100px)';
            setTimeout(() => {
                documentElement.remove();
                console.log(`✅ Element dokumentu ${documentId} usunięty z DOM`);
            }, 300);
        }
        
        // Pokaż powiadomienie sukcesu
        showNotification('✅ Dokument usunięty pomyślnie!', 'success');
        
        // ODŚWIEŻ SPRAWĘ (używając nowego systemu auto-refresh)
        console.log(`🔄 Odświeżam sprawę ${caseId}...`);
        
        setTimeout(() => {
            // Użyj nowego systemu auto-refresh (jeśli dostępny)
            if (typeof window.refreshCurrentCase === 'function') {
                console.log('✅ Używam window.refreshCurrentCase()');
                window.refreshCurrentCase();
            } 
            // Fallback: stary sposób
            else if (typeof window.crmManager !== 'undefined' && caseId) {
                console.log('⚠️ Fallback: używam viewCase()');
                window.crmManager.viewCase(caseId).then(() => {
                    setTimeout(() => {
                        window.crmManager.switchCaseTab(caseId, 'documents');
                    }, 300);
                });
            }
            
            // Jeśli to widok dokumentów globalny - odśwież całą stronę
            if (window.location.hash === '#documents') {
                window.location.reload();
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Błąd usuwania dokumentu:', error);
        alert(`❌ Błąd usuwania dokumentu: ${error.message}`);
    }
};

/**
 * Sprawdź czy użytkownik jest adminem (WSPÓLNA FUNKCJA)
 */
function isUserAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = localStorage.getItem('userRole');
    const theme = localStorage.getItem('theme');
    
    return currentUser.role === 'admin' || 
           userRole === 'admin' || 
           theme === 'dark';
}

/**
 * Renderuj przycisk usuwania (tylko dla admina)
 * @param {number} documentId - ID dokumentu
 * @param {number} caseId - ID sprawy
 * @returns {string} HTML przycisku lub pusty string
 */
window.renderDeleteButtonAdmin = function(documentId, caseId) {
    // Sprawdź czy user to admin
    if (!isUserAdmin()) {
        return ''; // Nie pokazuj przycisku dla nie-adminów
    }
    
    return `
        <button onclick="window.deleteDocumentAdmin(${documentId}, ${caseId})" 
            style="padding: 10px 20px; 
                   background: linear-gradient(135deg, #dc3545, #c82333); 
                   color: white; 
                   border: none; 
                   border-radius: 6px; 
                   cursor: pointer; 
                   font-weight: 600; 
                   transition: all 0.2s;
                   display: flex;
                   align-items: center;
                   gap: 8px;"
            onmouseover="this.style.background='linear-gradient(135deg, #c82333, #bd2130)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(220,53,69,0.4)'" 
            onmouseout="this.style.background='linear-gradient(135deg, #dc3545, #c82333)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            🗑️ Usuń
        </button>
    `;
};

/**
 * Pokazuje własny modal potwierdzenia (w stylu aplikacji)
 */
function showCustomConfirm(title, message) {
    return new Promise((resolve) => {
        // Stwórz backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;
        
        // Stwórz modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: scaleIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                <h2 style="margin: 0 0 15px 0; color: #dc3545; font-size: 1.5rem;">${title}</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 30px; white-space: pre-line;">${message}</p>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="confirmCancel" style="
                        padding: 12px 30px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        transition: all 0.2s;
                    ">Anuluj</button>
                    
                    <button id="confirmOK" style="
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #dc3545, #c82333);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        transition: all 0.2s;
                    ">OK - Usuń</button>
                </div>
            </div>
        `;
        
        // Dodaj style animacji
        if (!document.getElementById('modalStyles')) {
            const style = document.createElement('style');
            style.id = 'modalStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        // Obsługa przycisków
        const closeModal = (result) => {
            backdrop.style.animation = 'fadeIn 0.2s ease reverse';
            setTimeout(() => {
                backdrop.remove();
                resolve(result);
            }, 200);
        };
        
        document.getElementById('confirmOK').onclick = () => closeModal(true);
        document.getElementById('confirmCancel').onclick = () => closeModal(false);
        backdrop.onclick = (e) => {
            if (e.target === backdrop) closeModal(false);
        };
        
        // Hover effects
        const btnOK = document.getElementById('confirmOK');
        const btnCancel = document.getElementById('confirmCancel');
        
        btnOK.onmouseover = () => {
            btnOK.style.transform = 'translateY(-2px)';
            btnOK.style.boxShadow = '0 4px 12px rgba(220,53,69,0.4)';
        };
        btnOK.onmouseout = () => {
            btnOK.style.transform = 'translateY(0)';
            btnOK.style.boxShadow = 'none';
        };
        
        btnCancel.onmouseover = () => {
            btnCancel.style.background = '#5a6268';
            btnCancel.style.transform = 'translateY(-2px)';
        };
        btnCancel.onmouseout = () => {
            btnCancel.style.background = '#6c757d';
            btnCancel.style.transform = 'translateY(0)';
        };
    });
}

/**
 * Pokazuje powiadomienie na ekranie
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 100000;
        font-weight: 600;
        font-size: 1.1rem;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    // Dodaj style animacji
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Usuń po 3 sekundach
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Dodaj przyciski usuwania do wszystkich dokumentów na stronie (tylko admin)
 */
window.addDeleteButtonsToDocuments = function() {
    console.log('🔍 addDeleteButtonsToDocuments - sprawdzam czy admin...');
    
    if (!isUserAdmin()) {
        console.log('⚠️ Użytkownik NIE jest adminem - pomijam dodawanie przycisków');
        return; // Nie dodawaj dla nie-adminów
    }
    
    console.log('✅ Użytkownik jest adminem - dodaję przyciski usuwania');
    
    // Znajdź wszystkie kontenery z przyciskami "Pokaż" i "Pobierz"
    const documentContainers = document.querySelectorAll('[data-document-id]');
    
    console.log(`🗑️ Znaleziono ${documentContainers.length} dokumentów do dodania przycisków usuwania`);
    
    documentContainers.forEach(container => {
        const documentId = container.getAttribute('data-document-id');
        const caseId = container.getAttribute('data-case-id');
        
        // Sprawdź czy przycisk usuń już istnieje
        if (container.querySelector('.delete-button-admin')) {
            return; // Już dodany
        }
        
        // Znajdź wszystkie przyciski w kontenerze
        const existingButtons = container.querySelectorAll('button');
        if (existingButtons.length === 0) {
            console.warn(`⚠️ Brak przycisków dla dokumentu ${documentId}`);
            return;
        }
        
        // Znajdź kontener przycisków - parent pierwszego przycisku
        const firstButton = existingButtons[0];
        const buttonContainer = firstButton.parentElement;
        
        // Stwórz przycisk "Usuń"
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button-admin';
        deleteButton.onclick = () => window.deleteDocumentAdmin(documentId, caseId);
        deleteButton.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        deleteButton.innerHTML = '🗑️ Usuń';
        
        // Hover effect
        deleteButton.onmouseover = function() {
            this.style.background = 'linear-gradient(135deg, #c82333, #bd2130)';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(220,53,69,0.4)';
        };
        deleteButton.onmouseout = function() {
            this.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        
        // Dodaj przycisk do kontenera
        buttonContainer.appendChild(deleteButton);
        
        console.log(`✅ Dodano przycisk usuń dla dokumentu ${documentId}`);
    });
};

// Automatycznie dodawaj przyciski po załadowaniu dokumentów
// Użyj MutationObserver aby wykrywać nowe dokumenty
const documentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            // Poczekaj chwilę na pełne renderowanie
            setTimeout(() => {
                window.addDeleteButtonsToDocuments();
            }, 100);
        }
    });
});

// Obserwuj zmiany w DOM
setTimeout(() => {
    const documentsContainer = document.getElementById('caseDocuments') || document.body;
    documentObserver.observe(documentsContainer, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ MutationObserver ustawiony dla dokumentów');
}, 1000);

console.log('✅ Funkcje usuwania dokumentów dla admina gotowe!');
console.log('📌 Użyj: window.deleteDocumentAdmin(documentId, caseId)');
console.log('📌 Lub: window.renderDeleteButtonAdmin(documentId, caseId)');
console.log('📌 Lub: window.addDeleteButtonsToDocuments() - doda przyciski do wszystkich dokumentów');
