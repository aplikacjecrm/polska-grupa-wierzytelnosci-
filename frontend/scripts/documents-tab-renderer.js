// 📄 RENDERER ZAKŁADKI DOKUMENTÓW W SPRAWIE
// Funkcja renderuje zakładkę "Dokumenty w sprawie" z oznaczeniem wycofanych zeznań

window.crmManager = window.crmManager || {};

window.crmManager.renderCaseDocumentsTab = async function(caseId) {
    console.log('📄 Renderowanie zakładki dokumentów dla sprawy:', caseId);
    
    try {
        // Pobierz dokumenty sprawy
        const response = await window.api.request(`/cases/${caseId}/documents`);
        const documents = response.documents || [];
        
        console.log(`✅ Pobrano ${documents.length} dokumentów`);
        
        if (documents.length === 0) {
            return `
                <div style="padding: 40px; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;">📄</div>
                    <h3 style="color: #666; margin: 0 0 15px 0;">Brak dokumentów</h3>
                    <p style="color: #999; margin: 0 0 25px 0;">Nie dodano jeszcze żadnych dokumentów do tej sprawy</p>
                    <button onclick="crmManager.showAddCaseDocument(${caseId})" style="
                        padding: 14px 30px;
                        background: linear-gradient(135deg, #f39c12, #e67e22);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 700;
                        font-size: 1rem;
                        box-shadow: 0 4px 15px rgba(243,156,18,0.3);
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(243,156,18,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(243,156,18,0.3)'">
                        ➕ Dodaj pierwszy dokument
                    </button>
                </div>
            `;
        }
        
        // Grupuj dokumenty po kategorii
        const grouped = {};
        documents.forEach(doc => {
            const category = doc.category || 'INN';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(doc);
        });
        
        // Mapowanie kategorii na nazwy
        const categoryNames = {
            'POZ': '📄 Pozwy',
            'ODP': '📝 Odpowiedzi na pozew',
            'WNI': '📑 Wnioski',
            'ZAL': '📎 Załączniki',
            'ODW': '🔄 Odwołania',
            'ZAZ': '⚡ Zażalenia',
            'WYR': '⚖️ Wyroki',
            'POS': '📋 Postanowienia',
            'NAK': '📜 Nakazy zapłaty',
            'UZA': '✅ Uzasadnienia',
            'UMO': '💼 Umowy',
            'FAK': '💰 Faktury',
            'RAC': '🧾 Rachunki',
            'PRZ': '📤 Przelewy',
            'KOR': '📧 Korespondencja',
            'POC': '📨 Poczta',
            'ZAW': '📬 Zawiadomienia',
            'WEZ': '📞 Wezwania',
            'ZDJ': '📸 Zdjęcia',
            'NAG': '🎥 Nagrania',
            'EKS': '🔬 Ekspertyzy',
            'NOT': '📝 Notatki',
            'zeznanie': '👤 Zeznania świadków',
            'świadek': '👥 Dokumenty świadków',
            'INN': '📂 Inne dokumenty'
        };
        
        return `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; color: #1a2332; font-size: 1.5rem;">📄 Dokumenty w sprawie</h2>
                    <button onclick="crmManager.showAddCaseDocument(${caseId})" style="
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #f39c12, #e67e22);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 700;
                        box-shadow: 0 4px 15px rgba(243,156,18,0.3);
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(243,156,18,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(243,156,18,0.3)'">
                        ➕ Dodaj dokument
                    </button>
                </div>
                
                ${Object.keys(grouped).map(category => `
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #1a2332; font-size: 1.2rem; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f39c12;">
                            ${categoryNames[category] || category}
                        </h3>
                        <div style="display: grid; gap: 15px;">
                            ${grouped[category].map(doc => {
                                // 🚫 SPRAWDŹ CZY DOKUMENT JEST WYCOFANY (is_retracted=1)
                                const isRetracted = doc.is_retracted === 1 || doc.is_retracted === true;
                                
                                return `
                                    <div data-document-id="${doc.id}" style="
                                        background: ${isRetracted ? 'linear-gradient(135deg, #ffebee, #ffcdd2)' : 'white'};
                                        padding: 20px;
                                        border-radius: 12px;
                                        border-left: 4px solid ${isRetracted ? '#dc3545' : '#f39c12'};
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                        transition: all 0.3s;
                                        position: relative;
                                    " onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'; this.style.transform='translateX(5px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; this.style.transform='translateX(0)'">
                                        
                                        ${isRetracted ? `
                                            <div style="
                                                position: absolute;
                                                top: 10px;
                                                right: 10px;
                                                background: #dc3545;
                                                color: white;
                                                padding: 6px 12px;
                                                border-radius: 6px;
                                                font-weight: 700;
                                                font-size: 0.85rem;
                                                box-shadow: 0 2px 8px rgba(220,53,69,0.4);
                                                animation: pulseRetracted 2s infinite;
                                            ">
                                                🚫 WYCOFANE
                                            </div>
                                            <style>
                                                @keyframes pulseRetracted {
                                                    0%, 100% { 
                                                        transform: scale(1);
                                                        box-shadow: 0 2px 8px rgba(220,53,69,0.4);
                                                    }
                                                    50% { 
                                                        transform: scale(1.05);
                                                        box-shadow: 0 4px 12px rgba(220,53,69,0.6);
                                                    }
                                                }
                                            </style>
                                        ` : ''}
                                        
                                        <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px;">
                                            <div style="flex: 1;">
                                                <h4 style="margin: 0 0 8px 0; color: ${isRetracted ? '#c0392b' : '#1a2332'}; font-size: 1.1rem;">
                                                    ${isRetracted ? '🚫 ' : ''}${window.crmManager.escapeHtml(doc.title || doc.filename)}
                                                </h4>
                                                <div style="color: #666; font-size: 0.9rem; margin-bottom: 8px;">
                                                    <strong>Kod:</strong> ${window.crmManager.escapeHtml(doc.document_code || doc.document_number || 'Brak')}
                                                </div>
                                                ${doc.description ? `
                                                    <div style="color: ${isRetracted ? '#c0392b' : '#666'}; font-size: 0.95rem; line-height: 1.6; margin-bottom: 10px; padding: 10px; background: ${isRetracted ? 'rgba(220,53,69,0.1)' : 'rgba(243,156,18,0.05)'}; border-radius: 6px;">
                                                        ${window.crmManager.escapeHtml(doc.description)}
                                                    </div>
                                                ` : ''}
                                                <div style="display: flex; gap: 15px; font-size: 0.85rem; color: #999;">
                                                    <span>📅 ${new Date(doc.uploaded_at).toLocaleDateString('pl-PL')}</span>
                                                    <span>👤 ${window.crmManager.escapeHtml(doc.uploaded_by_name || 'Nieznany')}</span>
                                                    ${doc.file_size ? `<span>📏 ${(doc.file_size / 1024).toFixed(1)} KB</span>` : '<span>📝 Zeznanie tekstowe</span>'}
                                                </div>
                                            </div>
                                            
                                            ${doc.filename ? `
                                            <div style="display: flex; gap: 10px;">
                                                <button onclick="crmManager.viewDocument(${doc.id}, ${caseId}, 'document')" style="
                                                    padding: 10px 16px;
                                                    background: linear-gradient(135deg, #2196f3, #1976d2);
                                                    color: white;
                                                    border: none;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    font-weight: 600;
                                                    box-shadow: 0 2px 8px rgba(33,150,243,0.3);
                                                    transition: all 0.3s;
                                                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(33,150,243,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(33,150,243,0.3)'">
                                                    👁️ Podgląd
                                                </button>
                                                <button onclick="window.downloadDocument(${doc.id}, ${caseId}, '${(doc.filename || doc.title).replace(/'/g, "\\'")}', 'document')" style="
                                                    padding: 10px 16px;
                                                    background: linear-gradient(135deg, #4caf50, #388e3c);
                                                    color: white;
                                                    border: none;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    font-weight: 600;
                                                    box-shadow: 0 2px 8px rgba(76,175,80,0.3);
                                                    transition: all 0.3s;
                                                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(76,175,80,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(76,175,80,0.3)'">
                                                    📥 Pobierz
                                                </button>
                                            </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Błąd ładowania dokumentów:', error);
        return `
            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h3 style="color: #dc3545; margin: 0 0 15px 0;">Błąd ładowania dokumentów</h3>
                <p style="color: #999; margin: 0;">${error.message}</p>
            </div>
        `;
    }
};

console.log('✅ documents-tab-renderer.js załadowany - funkcja renderCaseDocumentsTab gotowa!');
