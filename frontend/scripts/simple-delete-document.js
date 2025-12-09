// PROSTY SYSTEM USUWANIA DOKUMENTÓW - TYLKO ADMIN
// Używa istniejącego endpointu DELETE /api/documents/:id

console.log('🗑️ Simple Delete Document - Loading...');

// Sprawdź czy użytkownik jest adminem
function isAdmin() {
    console.log('🔍 Sprawdzam czy admin...');
    
    // Sprawdź localStorage
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    const theme = localStorage.getItem('theme');
    
    console.log('📦 localStorage:');
    console.log('  - user:', user);
    console.log('  - userRole:', userRole);
    console.log('  - theme:', theme);
    
    // Sprawdź user object
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('👤 userData:', userData);
            if (userData.role === 'admin' || userData.user_role === 'admin') {
                console.log('✅ ADMIN - znaleziony w user object');
                return true;
            }
        } catch (e) {
            console.error('❌ Błąd parsowania user:', e);
        }
    }
    
    // Sprawdź userRole string
    if (userRole === 'admin') {
        console.log('✅ ADMIN - znaleziony w userRole');
        return true;
    }
    
    // Sprawdź theme (admin ma dark theme)
    if (theme === 'dark') {
        console.log('✅ ADMIN - znaleziony przez theme=dark');
        return true;
    }
    
    console.log('❌ NIE ADMIN');
    return false;
}

// GŁÓWNA FUNKCJA - Usuń dokument
window.deleteDocument = async function(documentId) {
    console.log(`🗑️ Usuwanie dokumentu ID: ${documentId}`);
    
    // Potwierdź
    if (!confirm('⚠️ Czy na pewno chcesz usunąć ten dokument?\n\nTa operacja jest nieodwracalna!')) {
        console.log('❌ Anulowano');
        return;
    }
    
    try {
        // Pobierz token
        const token = localStorage.getItem('token');
        if (!token) {
            alert('❌ Brak tokenu - zaloguj się ponownie');
            return;
        }
        
        console.log(`📡 Wysyłam DELETE request: /api/documents/${documentId}`);
        
        // Wyślij DELETE request
        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Błąd usuwania dokumentu');
        }
        
        console.log('✅ Dokument usunięty z bazy:', data);
        
        // Znajdź i usuń element z DOM
        const docElements = document.querySelectorAll(`[onclick*="${documentId}"]`);
        console.log(`🔍 Znaleziono ${docElements.length} elementów do usunięcia`);
        
        docElements.forEach(el => {
            // Znajdź card/kontener dokumentu (parent)
            let card = el.closest('.document-card') || el.closest('[style*="border"]') || el.parentElement;
            
            // Jeśli nie znaleziono card, usuń cały parent
            if (!card || card === el) {
                card = el.parentElement;
            }
            
            if (card) {
                // Animacja
                card.style.transition = 'all 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'translateX(-100px)';
                
                setTimeout(() => {
                    card.remove();
                    console.log('✅ Element usunięty z DOM');
                }, 300);
            }
        });
        
        alert('✅ Dokument usunięty pomyślnie!');
        
    } catch (error) {
        console.error('❌ Błąd usuwania:', error);
        alert(`❌ Błąd: ${error.message}`);
    }
};

// Dodaj przyciski "Usuń" do wszystkich dokumentów (tylko admin)
function addDeleteButtons() {
    if (!isAdmin()) {
        console.log('⚠️ Nie jesteś adminem - brak przycisków usuń');
        return;
    }
    
    console.log('✅ Jesteś adminem - dodaję przyciski Usuń');
    
    // Znajdź wszystkie przyciski z onclick zawierającym "Document"
    const buttons = document.querySelectorAll('button[onclick*="Document"]');
    console.log(`🔍 Znaleziono ${buttons.length} przycisków dokumentów`);
    
    const processed = new Set();
    
    buttons.forEach((btn, index) => {
        console.log(`📌 Przycisk ${index + 1}:`, btn);
        
        const onclick = btn.getAttribute('onclick');
        console.log(`  onclick: ${onclick}`);
        
        if (!onclick) {
            console.log(`  ⚠️ Brak onclick - pomijam`);
            return;
        }
        
        // Wyciągnij documentId z onclick
        const match = onclick.match(/Document\((\d+)/);
        if (!match) {
            console.log(`  ⚠️ Nie znaleziono documentId w onclick - pomijam`);
            return;
        }
        
        const documentId = match[1];
        console.log(`  ✅ documentId: ${documentId}`);
        
        // Jeśli już przetworzony - pomiń
        if (processed.has(documentId)) {
            console.log(`  ⚠️ Już przetworzony - pomijam`);
            return;
        }
        processed.add(documentId);
        
        // Sprawdź czy przycisk usuń już istnieje
        const container = btn.parentElement;
        console.log(`  📦 container:`, container);
        
        if (container.querySelector('.delete-btn-simple')) {
            console.log(`  ⚠️ Przycisk usuń już istnieje - pomijam`);
            return; // Już dodany
        }
        
        // Stwórz przycisk "Usuń"
        console.log(`  🔨 Tworzę przycisk Usuń...`);
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn-simple';
        deleteBtn.onclick = () => window.deleteDocument(documentId);
        deleteBtn.style.cssText = `
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            margin-left: 8px;
        `;
        deleteBtn.textContent = '🗑️ Usuń';
        
        // Hover
        deleteBtn.onmouseover = function() {
            this.style.background = '#c82333';
            this.style.transform = 'translateY(-2px)';
        };
        deleteBtn.onmouseout = function() {
            this.style.background = '#dc3545';
            this.style.transform = 'translateY(0)';
        };
        
        // Dodaj do kontenera
        container.appendChild(deleteBtn);
        console.log(`  ✅ DODANO przycisk Usuń dla dokumentu ${documentId}`);
    });
}

// Uruchom po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addDeleteButtons, 1000);
    });
} else {
    setTimeout(addDeleteButtons, 1000);
}

// Obserwuj zmiany DOM (nowe dokumenty)
const observer = new MutationObserver(() => {
    addDeleteButtons();
});

setTimeout(() => {
    const container = document.getElementById('caseDocuments') || document.body;
    observer.observe(container, {
        childList: true,
        subtree: true
    });
    console.log('✅ MutationObserver aktywny');
}, 1500);

console.log('✅ Simple Delete Document - Loaded!');
