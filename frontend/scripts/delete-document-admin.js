// 🗑️ MODUŁ USUWANIA DOKUMENTÓW - TYLKO DLA ADMINA
console.log('🗑️ delete-document-admin.js ZAŁADOWANY!');

/**
 * Usuń dokument (tylko admin)
 * @param {number} documentId - ID dokumentu do usunięcia
 * @param {number} caseId - ID sprawy (do odświeżenia listy po usunięciu)
 */
window.deleteDocumentAdmin = async function(documentId, caseId) {
    console.log(`🗑️ Próba usunięcia dokumentu ${documentId}`);
    
    // Sprawdź czy user to admin
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role !== 'admin') {
        alert('❌ Tylko administrator może usuwać dokumenty!');
        return;
    }
    
    // Potwierdzenie
    const confirmDelete = confirm(`⚠️ CZY NA PEWNO USUNĄĆ TEN DOKUMENT?\n\nTa operacja jest NIEODWRACALNA!\nDokument zostanie usunięty z bazy danych i dysku.`);
    
    if (!confirmDelete) {
        console.log('❌ Anulowano usuwanie');
        return;
    }
    
    try {
        console.log(`📡 Wysyłam żądanie usunięcia dokumentu ${documentId}...`);
        
        // Wywołaj endpoint usuwania
        const response = await window.api.request(`/documents/emergency-cleanup/${documentId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ Odpowiedź z serwera:', response);
        
        // Pokaż powiadomienie sukcesu
        showNotification('✅ Dokument usunięty pomyślnie!', 'success');
        
        // ODŚWIEŻ LISTĘ DOKUMENTÓW
        console.log(`🔄 Odświeżam listę dokumentów dla sprawy ${caseId}...`);
        
        // Jeśli jesteśmy w zakładce dokumentów w sprawie
        if (typeof window.crmManager !== 'undefined' && caseId) {
            // Przełącz na zakładkę dokumentów (to automatycznie odświeży listę)
            window.crmManager.switchCaseTab(caseId, 'documents');
        }
        
        // Jeśli to widok dokumentów globalny - odśwież całą stronę
        if (window.location.hash === '#documents') {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Błąd usuwania dokumentu:', error);
        alert(`❌ Błąd usuwania dokumentu: ${error.message}`);
    }
};

/**
 * Renderuj przycisk usuwania (tylko dla admina)
 * @param {number} documentId - ID dokumentu
 * @param {number} caseId - ID sprawy
 * @returns {string} HTML przycisku lub pusty string
 */
window.renderDeleteButtonAdmin = function(documentId, caseId) {
    // Sprawdź czy user to admin
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role !== 'admin') {
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
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role !== 'admin') {
        return; // Nie dodawaj dla nie-adminów
    }
    
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
        
        // Znajdź kontener z przyciskami
        const buttonContainer = container.querySelector('.document-buttons');
        if (!buttonContainer) {
            console.warn(`⚠️ Brak kontenera przycisków dla dokumentu ${documentId}`);
            return;
        }
        
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
