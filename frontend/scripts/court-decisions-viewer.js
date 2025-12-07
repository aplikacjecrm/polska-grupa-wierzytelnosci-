// 🎨 MODUŁ WYŚWIETLANIA ORZECZEŃ SĄDOWYCH

console.log('⚡ COURT DECISIONS VIEWER v10 OPTIMIZED - Płynne działanie!');

// Funkcja do wyświetlania orzeczeń dla artykułu
window.showCourtDecisionsForArticle = async function(articleId, articleTitle) {
    console.log(`📋 Ładuję orzeczenia dla artykułu ${articleId}:`, articleTitle);
    
    try {
        const response = await window.api.request(`/court-decisions/article/${articleId}`);
        
        if (!response || !response.success) {
            throw new Error('Brak danych o orzeczeniach');
        }
        
        displayDecisionsModal(response.decisions, articleTitle);
    } catch (error) {
        console.error('❌ Błąd ładowania orzeczeń:', error);
        window.showNotification?.('Błąd ładowania orzeczeń', 'error');
    }
};

// Funkcja pomocnicza - wyszukaj orzeczenia po kodzie i numerze artykułu
window.showCourtDecisionsForArticleByQuery = async function(code, articleNumber, courtType = 'ALL') {
    const courtNames = {
        'SN': 'Sąd Najwyższy',
        'TK': 'Trybunał Konstytucyjny',
        'NSA': 'Naczelny Sąd Administracyjny',
        'ALL': 'Wszystkie sądy'
    };
    
    const courtName = courtNames[courtType] || 'Orzeczenia';
    console.log(`🔍 Wyszukuję ${courtName} dla: Art. ${articleNumber} ${code}`);
    
    try {
        const searchQuery = `art. ${articleNumber} ${code}`;
        let url = `/court-decisions/search?q=${encodeURIComponent(searchQuery)}&limit=50`;
        
        // Filtruj po typie sądu jeśli nie ALL
        if (courtType !== 'ALL') {
            url += `&court_type=${courtType}`;
        }
        
        const response = await window.api.request(url);
        
        if (!response || !response.success) {
            throw new Error('Brak danych o orzeczeniach');
        }
        
        if (response.count === 0) {
            const courtLabel = courtType === 'ALL' ? '' : ` ${courtName}`;
            alert(`Nie znaleziono orzeczeń${courtLabel} dla Art. ${articleNumber} ${code}\n\nMożliwe przyczyny:\n- Artykuł nie ma jeszcze orzeczeń${courtLabel} w bazie\n- Spróbuj inny typ sądu\n- Spróbuj kliknąć "📚 Wszystkie"`);
            return;
        }
        
        displayDecisionsModal(response.decisions, `${courtName} - Art. ${articleNumber} ${code}`);
    } catch (error) {
        console.error('❌ Błąd wyszukiwania orzeczeń:', error);
        alert('Błąd połączenia z bazą orzeczeń');
    }
};

// Modal z orzeczeniami
function displayDecisionsModal(decisions, articleTitle) {
    // Usuń stary modal jeśli istnieje
    const existingModal = document.getElementById('courtDecisionsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'courtDecisionsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999999;
        animation: fadeIn 0.2s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #fff;
        border-radius: 12px;
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    header.innerHTML = `
        <div>
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">⚖️ ${articleTitle}</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 13px;">Znaleziono: ${decisions.length} orzeczeń</p>
        </div>
        <button id="closeDecisionsModal" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            font-size: 24px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
    `;
    
    // Body - lista orzeczeń
    const body = document.createElement('div');
    body.style.cssText = `
        padding: 20px 30px;
        overflow-y: auto;
        flex: 1;
    `;
    
    if (decisions.length === 0) {
        body.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <p style="font-size: 18px; margin: 0;">Brak orzeczeń dla tego artykułu</p>
            </div>
        `;
    } else {
        // Renderuj pierwsze 20 od razu
        const initialLimit = 20;
        const decisionsToShow = decisions.slice(0, initialLimit);
        const remainingDecisions = decisions.slice(initialLimit);
        
        decisionsToShow.forEach((decision, index) => {
            const card = createDecisionCard(decision, index);
            body.appendChild(card);
        });
        
        // Jeśli są jeszcze orzeczenia, dodaj przycisk "Pokaż więcej"
        if (remainingDecisions.length > 0) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.style.cssText = `
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #3B82F6, #1E40AF);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 20px;
                transition: transform 0.2s;
            `;
            loadMoreBtn.textContent = `Pokaż więcej (${remainingDecisions.length} orzeczeń)`;
            loadMoreBtn.onclick = () => {
                remainingDecisions.forEach((decision, index) => {
                    const card = createDecisionCard(decision, initialLimit + index);
                    body.insertBefore(card, loadMoreBtn);
                });
                loadMoreBtn.remove();
            };
            loadMoreBtn.onmouseover = () => loadMoreBtn.style.transform = 'translateY(-2px)';
            loadMoreBtn.onmouseout = () => loadMoreBtn.style.transform = 'translateY(0)';
            body.appendChild(loadMoreBtn);
        }
    }
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Zamknij modal
    document.getElementById('closeDecisionsModal').addEventListener('click', () => {
        modal.remove();
    });
    
    // Zamknij na kliknięcie tła
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Karta orzeczenia
function createDecisionCard(decision, index) {
    const card = document.createElement('div');
    card.style.cssText = `
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        transition: box-shadow 0.2s, border-color 0.2s;
        cursor: pointer;
        will-change: box-shadow, border-color;
    `;
    
    card.onmouseover = () => {
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        card.style.borderColor = '#3B82F6';
    };
    
    card.onmouseout = () => {
        card.style.boxShadow = 'none';
        card.style.borderColor = '#e0e0e0';
    };
    
    // Kliknięcie w kartę - pokaż pełny tekst
    card.onclick = (e) => {
        // Nie otwieraj jeśli kliknięto link
        if (e.target.tagName === 'A') return;
        showFullDecision(decision);
    };
    
    const date = new Date(decision.decision_date).toLocaleDateString('pl-PL');
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                        ${decision.court_type || 'SN'}
                    </span>
                    <h3 style="margin: 0; font-size: 18px; color: #333; font-weight: 600;">
                        ${decision.signature}
                    </h3>
                </div>
                <div style="display: flex; gap: 15px; color: #666; font-size: 14px; flex-wrap: wrap;">
                    <span>📅 ${date}</span>
                    ${decision.decision_type ? `<span>📋 ${decision.decision_type}</span>` : ''}
                    ${decision.judge_name ? `<span>👨‍⚖️ ${decision.judge_name}</span>` : ''}
                </div>
            </div>
        </div>
        
        ${decision.summary ? `
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6; margin-top: 15px;">
                <div style="font-size: 12px; color: #3B82F6; font-weight: 600; margin-bottom: 8px;">
                    📋 STRESZCZENIE:
                </div>
                <p style="margin: 0; color: #555; line-height: 1.6; font-size: 14px;">
                    ${decision.summary}
                </p>
            </div>
        ` : ''}
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
            <div style="flex: 1; min-width: 200px;">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Zastosowanie artykułu:</div>
                <div style="color: #333; font-size: 14px; font-weight: 600;">
                    ${decision.legal_base || decision.article_reference || 'Brak informacji'}
                </div>
            </div>
            ${decision.source_url ? `
                <a href="${decision.source_url}" target="_blank" 
                   onclick="event.stopPropagation()"
                   style="
                    background: linear-gradient(135deg, #3B82F6, #1E40AF);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 600;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(102,126,234,0.3);
                    transition: all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.5)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102,126,234,0.3)'">
                    🔗 Pełny wyrok
                </a>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Funkcja wyświetlania pełnego tekstu orzeczenia
function showFullDecision(decision) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999999;
        animation: fadeIn 0.2s;
        padding: 20px;
        will-change: opacity;
    `;
    
    const date = new Date(decision.decision_date).toLocaleDateString('pl-PL');
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 15px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    `;
    
    content.innerHTML = `
        <!-- Header -->
        <div style="
            background: linear-gradient(135deg, #3B82F6, #1E40AF);
            color: white;
            padding: 25px 30px;
            border-radius: 15px 15px 0 0;
        ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                            ${decision.court_type || 'SN'}
                        </span>
                        <h2 style="margin: 0; font-size: 22px; font-weight: 700;">
                            ${decision.signature}
                        </h2>
                    </div>
                    <div style="display: flex; gap: 20px; font-size: 14px; opacity: 0.95;">
                        <span>📅 ${date}</span>
                        ${decision.decision_type ? `<span>📋 ${decision.decision_type}</span>` : ''}
                        ${decision.judge_name ? `<span>👨‍⚖️ ${decision.judge_name}</span>` : ''}
                    </div>
                </div>
                <button onclick="this.closest('[style*=\\"z-index: 99999999\\"]').remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 24px;
                    transition: all 0.2s;
                    flex-shrink: 0;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
            </div>
        </div>
        
        <!-- Body -->
        <div style="
            padding: 30px;
            overflow-y: auto;
            flex: 1;
        ">
            ${decision.full_text && decision.full_text !== decision.summary ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #3B82F6; font-size: 18px; font-weight: 600;">
                        📄 Treść orzeczenia:
                    </h3>
                    <div style="
                        background: linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05));
                        padding: 25px;
                        border-radius: 10px;
                        border-left: 4px solid #3B82F6;
                        line-height: 1.9;
                        color: #333;
                        font-size: 15px;
                        white-space: pre-wrap;
                        font-family: Georgia, serif;
                    ">
                        ${decision.full_text}
                    </div>
                </div>
            ` : decision.summary ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #3B82F6; font-size: 18px; font-weight: 600;">
                        📋 Streszczenie orzeczenia:
                    </h3>
                    <div style="
                        background: linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05));
                        padding: 25px;
                        border-radius: 10px;
                        border-left: 4px solid #3B82F6;
                        line-height: 1.9;
                        color: #333;
                        font-size: 15px;
                        white-space: pre-wrap;
                        font-family: Georgia, serif;
                    ">
                        ${decision.summary}
                    </div>
                </div>
            ` : ''}
            
            <div style="
                background: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
                    ℹ️ Informacje dodatkowe:
                </h3>
                <div style="display: grid; gap: 12px; font-size: 14px;">
                    <div style="display: grid; grid-template-columns: 180px 1fr; gap: 10px;">
                        <span style="color: #666; font-weight: 600;">Podstawa prawna:</span>
                        <span style="color: #333;">${decision.legal_base || decision.article_reference || 'Brak informacji'}</span>
                    </div>
                    ${decision.court_name ? `
                        <div style="display: grid; grid-template-columns: 180px 1fr; gap: 10px;">
                            <span style="color: #666; font-weight: 600;">Sąd:</span>
                            <span style="color: #333;">${decision.court_name}</span>
                        </div>
                    ` : ''}
                    ${decision.keywords ? `
                        <div style="display: grid; grid-template-columns: 180px 1fr; gap: 10px;">
                            <span style="color: #666; font-weight: 600;">Słowa kluczowe:</span>
                            <span style="color: #333;">${decision.keywords}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${decision.source_url ? `
                <div style="margin-top: 25px; text-align: center;">
                    <a href="${decision.source_url}" target="_blank" style="
                        display: inline-block;
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        padding: 14px 30px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-size: 15px;
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(76,175,80,0.3);
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76,175,80,0.4)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76,175,80,0.3)'">
                        🔗 Zobacz pełny tekst w oficjalnym źródle
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Zamknij na kliknięcie tła
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// CSS Animation - optymalizowane dla wydajności
const courtDecisionsStyle = document.createElement('style');
courtDecisionsStyle.textContent = `
    @keyframes fadeIn {
        from { 
            opacity: 0;
        }
        to { 
            opacity: 1;
        }
    }
    
    /* Optymalizacja scrollowania */
    [style*="overflow-y: auto"] {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(courtDecisionsStyle);

console.log('✅ Court Decisions Viewer v10 OPTIMIZED ready!');
