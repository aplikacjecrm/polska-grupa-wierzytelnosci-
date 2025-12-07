// 🎯 UNIFIED FAB - Jeden przycisk dla wszystkich funkcji (Pro Meritum)
console.log('🎯 Loading Unified FAB...');

class UnifiedFAB {
    constructor() {
        this.isOpen = false;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        
        this.createFAB();
        this.setupListeners();
    }
    
    createFAB() {
        // Container
        const fab = document.createElement('div');
        fab.id = 'unifiedFAB';
        fab.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 999999;
        `;
        
        // Main button
        const mainBtn = document.createElement('div');
        mainBtn.id = 'fabMain';
        mainBtn.innerHTML = '🎯';
        mainBtn.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a2332, #2c3e50);
            border: 3px solid #FFD700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            cursor: grab;
            box-shadow: 0 6px 20px rgba(212,175,55,0.6);
            transition: transform 0.2s;
        `;
        
        // Menu (ukryte domyślnie)
        const menu = document.createElement('div');
        menu.id = 'fabMenu';
        menu.style.cssText = `
            position: absolute;
            bottom: 70px;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            padding: 8px;
            display: none;
            min-width: 180px;
        `;
        
        const options = [
            { icon: '🔍', label: 'Wyszukaj', action: () => this.openGlobalSearch() },
            { icon: '📚', label: 'Kodeksy', action: () => this.openKodeksy() },
            { icon: '🤖', label: 'AI Search', action: () => this.openAI() },
            { icon: '💬', label: 'Czat', action: () => this.openChat() }
        ];
        
        options.forEach(opt => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                font-weight: 600;
                color: #1a2332;
                transition: background 0.2s;
            `;
            item.innerHTML = `<span style="font-size: 20px;">${opt.icon}</span> ${opt.label}`;
            
            item.onmouseover = () => item.style.background = 'linear-gradient(135deg, #FFD700, #d4af37)';
            item.onmouseout = () => item.style.background = 'transparent';
            item.onclick = () => {
                opt.action();
                this.toggleMenu();
            };
            
            menu.appendChild(item);
        });
        
        fab.appendChild(mainBtn);
        fab.appendChild(menu);
        document.body.appendChild(fab);
        
        this.fab = fab;
        this.mainBtn = mainBtn;
        this.menu = menu;
    }
    
    setupListeners() {
        this.mainBtn.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.toggleMenu();
            }
        });
        
        this.mainBtn.addEventListener('mousedown', (e) => {
            this.dragStart(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.drag(e);
        });
        
        document.addEventListener('mouseup', () => {
            this.dragEnd();
        });
        
        // Zamknij menu po kliknięciu poza
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.fab.contains(e.target)) {
                this.toggleMenu();
            }
        });
    }
    
    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.menu.style.display = this.isOpen ? 'block' : 'none';
        this.mainBtn.style.transform = this.isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
    }
    
    dragStart(e) {
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;
        this.isDragging = false; // Reset
        this.dragTimeout = setTimeout(() => {
            this.isDragging = true;
            this.mainBtn.style.cursor = 'grabbing';
        }, 100);
    }
    
    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
        this.xOffset = this.currentX;
        this.yOffset = this.currentY;
        
        this.fab.style.transform = `translate(${this.xOffset}px, ${this.yOffset}px)`;
    }
    
    dragEnd() {
        clearTimeout(this.dragTimeout);
        setTimeout(() => {
            this.isDragging = false;
        }, 50);
        this.mainBtn.style.cursor = 'grab';
    }
    
    openKodeksy() {
        console.log('📚 Opening Kodeksy...');
        // Najpierw spróbuj otworzyć browser z wszystkimi kodeksami
        if (typeof window.openLegalBrowser === 'function') {
            window.openLegalBrowser();
        } else {
            // Fallback - pokaż alert jeśli funkcja nie istnieje
            alert('📚 Ładowanie biblioteki kodeksów...');
            console.error('window.openLegalBrowser nie istnieje');
        }
    }
    
    openAI() {
        console.log('🤖 Opening AI...');
        if (window.crmManager?.currentCaseData && window.showAISearchFromCase) {
            window.showAISearchFromCase(window.crmManager.currentCaseData);
        } else if (window.showAISearchModal) {
            window.showAISearchModal();
        }
    }
    
    openChat() {
        console.log('💬 Opening Floating Chat...');
        // Otwórz mały floating komunikator
        if (window.floatingChat && typeof window.floatingChat.open === 'function') {
            window.floatingChat.open();
            console.log('✅ Opened floating chat');
        } else if (window.floatingChat && typeof window.floatingChat.toggle === 'function') {
            window.floatingChat.toggle();
            console.log('✅ Toggled floating chat');
        } else {
            console.error('window.floatingChat nie istnieje');
            alert('💬 Komunikator ładuje się... Spróbuj za chwilę.');
        }
    }
    
    openGlobalSearch() {
        console.log('🔍 Opening Global Search Modal...');
        this.showSearchModal();
    }
    
    showSearchModal() {
        // Usuń istniejący modal
        const existingModal = document.getElementById('fabSearchModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'fabSearchModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 10000000;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 80px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; width: 90%; max-width: 700px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 20px; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: white; font-size: 1.3rem;">🔍 Globalne wyszukiwanie</h3>
                    <button onclick="document.getElementById('fabSearchModal').remove()" style="background: none; border: 2px solid rgba(255,255,255,0.5); color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">✕</button>
                </div>
                <div style="padding: 20px;">
                    <input type="text" 
                           id="fabSearchInput" 
                           placeholder="Szukaj spraw, dowodów, dokumentów, świadków..." 
                           style="width: 100%; padding: 15px 20px; border: 2px solid #FFD700; border-radius: 12px; font-size: 1.1rem; outline: none; box-sizing: border-box;"
                           oninput="window.unifiedFAB.performSearch(this.value)">
                    <div id="fabSearchResults" style="margin-top: 15px; max-height: 400px; overflow-y: auto;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus na input
        setTimeout(() => {
            document.getElementById('fabSearchInput').focus();
        }, 100);
        
        // Zamknij po kliknięciu w tło
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    async performSearch(query) {
        const resultsDiv = document.getElementById('fabSearchResults');
        
        if (!query || query.length < 3) {
            resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Wpisz min. 3 znaki...</div>';
            return;
        }
        
        resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">🔍 Wyszukuję...</div>';
        
        try {
            const response = await window.api.request(`/search?q=${encodeURIComponent(query)}`);
            
            const cases = response.cases || [];
            const evidence = response.evidence || [];
            const documents = response.documents || [];
            const witnesses = response.witnesses || [];
            const testimonies = response.testimonies || [];
            
            const total = cases.length + evidence.length + documents.length + witnesses.length + testimonies.length;
            
            if (total === 0) {
                resultsDiv.innerHTML = `<div style="padding: 30px; text-align: center; color: #999;">Brak wyników dla "<b>${query}</b>"</div>`;
                return;
            }
            
            let html = '';
            
            // Sprawy
            if (cases.length > 0) {
                html += `<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 8px 0; color: #667eea;">⚖️ SPRAWY (${cases.length})</h4>`;
                cases.forEach(c => {
                    html += `<div onclick="document.getElementById('fabSearchModal').remove(); crmManager.viewCase(${c.id});" style="padding: 10px; margin-bottom: 5px; background: #f8f9fa; border-left: 3px solid #667eea; border-radius: 4px; cursor: pointer;"><strong style="color: #1a2332;">${c.case_number} - ${c.title || ''}</strong></div>`;
                });
                html += '</div>';
            }
            
            // Dowody
            if (evidence.length > 0) {
                html += `<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 8px 0; color: #f39c12;">📦 DOWODY (${evidence.length})</h4>`;
                evidence.forEach(e => {
                    html += `<div onclick="document.getElementById('fabSearchModal').remove(); crmManager.openEvidenceFromSearch(${e.id}, ${e.case_id});" style="padding: 10px; margin-bottom: 5px; background: #fff3e0; border-left: 3px solid #f39c12; border-radius: 4px; cursor: pointer;"><strong style="color: #1a2332;">${e.evidence_code} - ${e.name || ''}</strong><br><small style="color:#333;">Sprawa: ${e.case_number || 'Brak'}</small></div>`;
                });
                html += '</div>';
            }
            
            // Dokumenty
            if (documents.length > 0) {
                html += `<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 8px 0; color: #28a745;">📄 DOKUMENTY (${documents.length})</h4>`;
                documents.forEach(d => {
                    html += `<div onclick="document.getElementById('fabSearchModal').remove(); crmManager.openDocumentFromSearch(${d.id}, ${d.case_id});" style="padding: 10px; margin-bottom: 5px; background: #e8f5e9; border-left: 3px solid #28a745; border-radius: 4px; cursor: pointer;"><strong style="color: #1a2332;">${d.document_code || d.document_number || 'DOK'} - ${d.title || d.file_name || ''}</strong><br><small style="color:#333;">Sprawa: ${d.case_number || 'Brak'}</small></div>`;
                });
                html += '</div>';
            }
            
            // Świadkowie
            if (witnesses.length > 0) {
                html += `<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 8px 0; color: #ff9800;">👤 ŚWIADKOWIE (${witnesses.length})</h4>`;
                witnesses.forEach(w => {
                    html += `<div onclick="document.getElementById('fabSearchModal').remove(); crmManager.openWitnessFromSearch(${w.id}, ${w.case_id});" style="padding: 10px; margin-bottom: 5px; background: #fff3e0; border-left: 3px solid #ff9800; border-radius: 4px; cursor: pointer;"><strong style="color: #1a2332;">${w.witness_code} - **** *****</strong><br><small style="color:#333;">Sprawa: ${w.case_number || 'Brak'}</small></div>`;
                });
                html += '</div>';
            }
            
            // Zeznania
            if (testimonies.length > 0) {
                html += `<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 8px 0; color: #5c6bc0;">📝 ZEZNANIA (${testimonies.length})</h4>`;
                testimonies.forEach(t => {
                    html += `<div onclick="document.getElementById('fabSearchModal').remove(); crmManager.openWitnessFromSearch(${t.id}, ${t.case_id});" style="padding: 10px; margin-bottom: 5px; background: #e8eaf6; border-left: 3px solid #5c6bc0; border-radius: 4px; cursor: pointer;"><strong style="color: #1a2332;">${t.witness_code} - **** *****</strong><br><small style="color:#333;">📅 ${new Date(t.testimony_date).toLocaleDateString('pl-PL')}</small></div>`;
                });
                html += '</div>';
            }
            
            resultsDiv.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Błąd wyszukiwania:', error);
            resultsDiv.innerHTML = `<div style="padding: 20px; text-align: center; color: #dc3545;">Błąd: ${error.message}</div>`;
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unifiedFAB = new UnifiedFAB();
        hideOldButtons();
        console.log('✅ Unified FAB ready');
    });
} else {
    window.unifiedFAB = new UnifiedFAB();
    hideOldButtons();
    console.log('✅ Unified FAB ready');
}

// Ukryj stare przyciski floating i ustaw wysokie z-index dla floating chat
function hideOldButtons() {
    // Ukryj przycisk legal-browser
    const legalBtn = document.getElementById('legalBrowserBtn');
    if (legalBtn) {
        legalBtn.style.display = 'none';
        console.log('🚫 Ukryto stary przycisk Kodeksów');
    }
    
    // Ukryj stary przycisk floating chat (button)
    const oldChatBtn = document.getElementById('floatingChatButton');
    if (oldChatBtn) {
        oldChatBtn.style.display = 'none';
        console.log('🚫 Ukryto stary przycisk floating chat');
    }
    
    // Ustaw bardzo wysoki z-index dla floating chat panel (aby był zawsze na wierzchu)
    const floatingPanel = document.getElementById('floatingChatPanel');
    if (floatingPanel) {
        floatingPanel.style.zIndex = '99999999';
        console.log('✅ Ustawiono wysoki z-index dla floating chat panel');
    }
    
    // Sprawdź ponownie po 1 sekundzie (na wypadek opóźnionego ładowania)
    setTimeout(() => {
        const legalBtn2 = document.getElementById('legalBrowserBtn');
        if (legalBtn2) {
            legalBtn2.style.display = 'none';
            console.log('🚫 Ukryto stary przycisk Kodeksów (2nd check)');
        }
        
        const oldChatBtn2 = document.getElementById('floatingChatButton');
        if (oldChatBtn2) {
            oldChatBtn2.style.display = 'none';
            console.log('🚫 Ukryto stary przycisk floating chat (2nd check)');
        }
        
        const floatingPanel2 = document.getElementById('floatingChatPanel');
        if (floatingPanel2) {
            floatingPanel2.style.zIndex = '99999999';
            console.log('✅ Ustawiono wysoki z-index dla floating chat panel (2nd check)');
        }
    }, 1000);
    
    // I po 3 sekundach dla pewności
    setTimeout(() => {
        const floatingPanel3 = document.getElementById('floatingChatPanel');
        if (floatingPanel3) {
            floatingPanel3.style.zIndex = '99999999';
            console.log('✅ Ustawiono wysoki z-index dla floating chat panel (3rd check)');
        }
    }, 3000);
}
