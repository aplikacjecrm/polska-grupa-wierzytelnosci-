// ===================================
// MODUŁ DOWODÓW - Frontend v2.0
// ===================================

console.log('📦 evidence-module.js v16.0 - HTML CAŁKOWICIE USUNIĘTY - 2025-11-24 02:18');

const evidenceModule = {
  currentCaseId: null,
  evidenceList: [],
  
  // === RENDEROWANIE ZAKŁADKI ===
  
  async renderTab(caseId) {
    this.currentCaseId = caseId;
    console.log('📦 Renderuję zakładkę dowodów dla sprawy:', caseId);
    
    // Pokaż okienko ładowania w kontenerze
    const container = document.getElementById('caseTabContent') ||
                     document.getElementById('caseTabContentArea') ||
                     document.querySelector('[id*="Tab"][id*="Content"]');
    
    if (container) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; padding: 60px; flex-direction: column;">
                <div style="font-size: 3rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">🔍</div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #1a2332; margin-bottom: 15px;">Ładowanie dowodów...</div>
                <div style="width: 200px; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
                    <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #3B82F6, #1E40AF); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
                </div>
                <style>
                    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                    @keyframes loadingBar { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
                </style>
            </div>
        `;
    }
    
    try {
      const response = await window.api.request(`/evidence/case/${caseId}`);
      this.evidenceList = response.evidence || [];
      console.log('📦 Pobrano dowodów:', this.evidenceList.length);
      
      return this.renderEvidenceList(caseId);
    } catch (error) {
      console.error('❌ Błąd ładowania dowodów:', error);
      return `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          <h3>⚠️ Błąd ładowania dowodów</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  },
  
  renderEvidenceList(caseId) {
    const groupedEvidence = this.groupByType(this.evidenceList);
    
    return `
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3B82F6, #3B82F6); padding: 25px; border-radius: 12px 12px 0 0; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0 0 5px 0;">🔍 Dowody w sprawie</h2>
            <p style="margin: 0; opacity: 0.9;">Zarządzaj materiałem dowodowym</p>
          </div>
          <button onclick="evidenceModule.showAddForm(${caseId})" 
                  style="padding: 12px 24px; background: white; color: #3B82F6; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);"
                  onmouseover="this.style.transform='translateY(-2px)'"
                  onmouseout="this.style.transform='translateY(0)'">
            ➕ Dodaj dowód
          </button>
        </div>
      </div>
      
      <!-- Statystyki -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 20px; background: #fafafa;">
        ${this.renderStats()}
      </div>
      
      <!-- Filtry -->
      <div style="padding: 20px; background: white; border-bottom: 2px solid #e0e0e0;">
        <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
          <select id="evidenceTypeFilter" onchange="evidenceModule.applyFilters()" style="padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
            <option value="all">Wszystkie typy</option>
            <option value="physical">📦 Dowody rzeczowe</option>
            <option value="document">📄 Dokumenty</option>
            <option value="testimony">🗣️ Zeznania</option>
            <option value="expert">🎓 Opinie biegłych</option>
            <option value="recording">🎥 Nagrania</option>
            <option value="photo">📸 Zdjęcia</option>
            <option value="correspondence">📧 Korespondencja</option>
            <option value="protocol">📝 Protokoły</option>
            <option value="other">📋 Inne</option>
          </select>
          
          <select id="evidenceSignificanceFilter" onchange="evidenceModule.applyFilters()" style="padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
            <option value="all">Wszystkie znaczenia</option>
            <option value="crucial">🔥 Kluczowe</option>
            <option value="important">⭐ Ważne</option>
            <option value="supporting">✅ Wspierające</option>
            <option value="neutral">➖ Neutralne</option>
          </select>
          
          <select id="evidenceStatusFilter" onchange="evidenceModule.applyFilters()" style="padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
            <option value="all">Wszystkie statusy</option>
            <option value="secured">🔒 Zabezpieczony</option>
            <option value="catalogued">📋 Skatalogowany</option>
            <option value="presented">📤 Przedstawiony</option>
            <option value="accepted">✅ Przyjęty</option>
            <option value="rejected">❌ Odrzucony</option>
          </select>
          
          <button onclick="evidenceModule.renderTab(${caseId})" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            🔄 Odśwież
          </button>
        </div>
      </div>
      
      <!-- Lista dowodów -->
      <div id="evidenceCards" style="padding: 20px; background: #fafafa;">
        ${this.evidenceList.length === 0 ? 
          '<div style="text-align: center; padding: 60px; color: #999;"><h3>📭 Brak dowodów</h3><p>Kliknij "Dodaj dowód" aby dodać pierwszy materiał dowodowy</p></div>' :
          this.renderEvidenceCards()
        }
      </div>
    `;
  },
  
  renderStats() {
    const total = this.evidenceList.length;
    const crucial = this.evidenceList.filter(e => e.significance === 'crucial').length;
    const presented = this.evidenceList.filter(e => e.status === 'presented' || e.status === 'accepted').length;
    const pending = this.evidenceList.filter(e => e.admissibility === 'pending').length;
    
    return `
      <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 10px; color: white; text-align: center;">
        <div style="font-size: 2rem; font-weight: 700;">${total}</div>
        <div style="font-size: 0.9rem; opacity: 0.9;">Wszystkich</div>
      </div>
      <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 10px; color: white; text-align: center;">
        <div style="font-size: 2rem; font-weight: 700;">${crucial}</div>
        <div style="font-size: 0.9rem; opacity: 0.9;">Kluczowych</div>
      </div>
      <div style="background: linear-gradient(135deg, #3B82F6, #3B82F6); padding: 20px; border-radius: 10px; color: white; text-align: center;">
        <div style="font-size: 2rem; font-weight: 700;">${presented}</div>
        <div style="font-size: 0.9rem; opacity: 0.9;">Przedstawionych</div>
      </div>
      <div style="background: linear-gradient(135deg, #3B82F6, #3B82F6); padding: 20px; border-radius: 10px; color: white; text-align: center;">
        <div style="font-size: 2rem; font-weight: 700;">${pending}</div>
        <div style="font-size: 0.9rem; opacity: 0.9;">Do oceny</div>
      </div>
    `;
  },
  
  renderEvidenceCards() {
    return this.evidenceList.map(evidence => {
      const typeEmoji = this.getTypeEmoji(evidence.evidence_type);
      const typeLabel = this.getTypeLabel(evidence.evidence_type);
      const significanceColor = this.getSignificanceColor(evidence.significance);
      const statusColor = this.getStatusColor(evidence.status);
      
      return `
        <div data-evidence-id="${evidence.id}" style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; border-left: 5px solid ${significanceColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s;"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
          
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 1.5rem;">${typeEmoji}</span>
                <h3 style="margin: 0; color: #1a2332;">${window.crmManager.escapeHtml(evidence.name)}</h3>
              </div>
              <div style="color: #999; font-size: 0.85rem; margin-bottom: 5px;">
                ${evidence.evidence_code} • ${typeLabel}
              </div>
              ${evidence.description ? `
                <div style="color: #666; font-size: 0.9rem; margin-top: 8px;">
                  ${window.crmManager.escapeHtml(evidence.description).substring(0, 150)}${evidence.description.length > 150 ? '...' : ''}
                </div>
              ` : ''}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
              ${this.renderSignificanceBadge(evidence.significance)}
              ${this.renderStatusBadge(evidence.status)}
              ${this.renderAdmissibilityBadge(evidence.admissibility)}
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; padding: 15px; background: #f8f9fa; border-radius: 6px; margin-bottom: 15px;">
            ${evidence.obtained_date ? `
              <div>
                <div style="font-size: 0.75rem; color: #999; text-transform: uppercase;">Uzyskano</div>
                <div style="font-weight: 600; color: #1a2332;">${new Date(evidence.obtained_date).toLocaleDateString('pl-PL')}</div>
              </div>
            ` : ''}
            ${evidence.obtained_from ? `
              <div>
                <div style="font-size: 0.75rem; color: #999; text-transform: uppercase;">Źródło</div>
                <div style="font-weight: 600; color: #1a2332;">${window.crmManager.escapeHtml(evidence.obtained_from)}</div>
              </div>
            ` : ''}
            ${evidence.credibility_score ? `
              <div>
                <div style="font-size: 0.75rem; color: #999; text-transform: uppercase;">Wiarygodność</div>
                <div style="font-weight: 600; color: #1a2332;">${evidence.credibility_score}/10</div>
              </div>
            ` : ''}
            ${evidence.attachments_count > 0 ? `
              <div>
                <div style="font-size: 0.75rem; color: #999; text-transform: uppercase;">Załączniki</div>
                <div style="font-weight: 600; color: #3B82F6;">📎 ${evidence.attachments_count}</div>
              </div>
            ` : ''}
            ${evidence.presented_date ? `
              <div>
                <div style="font-size: 0.75rem; color: #999; text-transform: uppercase;">Przedstawiono</div>
                <div style="font-weight: 600; color: #1a2332;">${new Date(evidence.presented_date).toLocaleDateString('pl-PL')}</div>
              </div>
            ` : ''}
          </div>
          
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="evidenceModule.viewDetails(${evidence.id})" style="flex: 1; min-width: 120px; padding: 10px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              👁️ Szczegóły
            </button>
            <button onclick="evidenceModule.showEditForm(${evidence.id})" style="flex: 1; min-width: 120px; padding: 10px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              ✏️ Edytuj
            </button>
            ${evidence.status === 'secured' || evidence.status === 'catalogued' ? `
              <button onclick="evidenceModule.presentEvidence(${evidence.id})" style="flex: 1; min-width: 120px; padding: 10px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                📤 Przedstaw
              </button>
            ` : ''}
            <button onclick="evidenceModule.deleteEvidence(${evidence.id})" style="padding: 10px 15px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },
  
  // === POMOCNICZE FUNKCJE ===
  
  getTypeEmoji(type) {
    const emojis = {
      'physical': '📦',
      'document': '📄',
      'testimony': '🗣️',
      'expert': '🎓',
      'recording': '🎥',
      'photo': '📸',
      'correspondence': '📧',
      'protocol': '📝',
      'other': '📋'
    };
    return emojis[type] || '📋';
  },
  
  getTypeLabel(type) {
    const labels = {
      'physical': 'Dowód rzeczowy',
      'document': 'Dokument',
      'testimony': 'Zeznanie',
      'expert': 'Opinia biegłego',
      'recording': 'Nagranie',
      'photo': 'Zdjęcie',
      'correspondence': 'Korespondencja',
      'protocol': 'Protokół',
      'other': 'Inne'
    };
    return labels[type] || 'Nieznany';
  },
  
  getSignificanceColor(significance) {
    const colors = {
      'crucial': '#3B82F6',
      'important': '#3B82F6',
      'supporting': '#3B82F6',
      'neutral': '#95a5a6'
    };
    return colors[significance] || '#95a5a6';
  },
  
  getStatusColor(status) {
    const colors = {
      'secured': '#3B82F6',
      'catalogued': '#3B82F6',
      'presented': '#3B82F6',
      'accepted': '#3B82F6',
      'rejected': '#3B82F6',
      'challenged': '#3B82F6'
    };
    return colors[status] || '#95a5a6';
  },
  
  renderSignificanceBadge(significance) {
    const labels = {
      'crucial': '🔥 Kluczowy',
      'important': '⭐ Ważny',
      'supporting': '✅ Wspierający',
      'neutral': '➖ Neutralny'
    };
    const color = this.getSignificanceColor(significance);
    return `<span style="padding: 4px 10px; background: ${color}; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${labels[significance] || significance}</span>`;
  },
  
  renderStatusBadge(status) {
    const labels = {
      'secured': '🔒 Zabezpieczony',
      'catalogued': '📋 Skatalogowany',
      'presented': '📤 Przedstawiony',
      'accepted': '✅ Przyjęty',
      'rejected': '❌ Odrzucony',
      'challenged': '⚠️ Kwestionowany'
    };
    const color = this.getStatusColor(status);
    return `<span style="padding: 4px 10px; background: ${color}; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${labels[status] || status}</span>`;
  },
  
  renderAdmissibilityBadge(admissibility) {
    const labels = {
      'admissible': '✅ Dopuszczony',
      'contested': '⚠️ Kwestionowany',
      'rejected': '❌ Odrzucony',
      'pending': '⏳ Oczekujący'
    };
    const colors = {
      'admissible': '#3B82F6',
      'contested': '#3B82F6',
      'rejected': '#3B82F6',
      'pending': '#95a5a6'
    };
    return `<span style="padding: 4px 10px; background: ${colors[admissibility] || '#95a5a6'}; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${labels[admissibility] || admissibility}</span>`;
  },
  
  groupByType(evidenceList) {
    return evidenceList.reduce((acc, evidence) => {
      const type = evidence.evidence_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(evidence);
      return acc;
    }, {});
  },
  
  applyFilters() {
    const typeFilter = document.getElementById('evidenceTypeFilter')?.value;
    const significanceFilter = document.getElementById('evidenceSignificanceFilter')?.value;
    const statusFilter = document.getElementById('evidenceStatusFilter')?.value;
    
    let filtered = this.evidenceList;
    
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(e => e.evidence_type === typeFilter);
    }
    if (significanceFilter && significanceFilter !== 'all') {
      filtered = filtered.filter(e => e.significance === significanceFilter);
    }
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    const container = document.getElementById('evidenceCards');
    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px; color: #999;"><h3>🔍 Brak wyników</h3><p>Zmień filtry aby zobaczyć więcej dowodów</p></div>';
      } else {
        this.evidenceList = filtered;
        container.innerHTML = this.renderEvidenceCards();
        this.evidenceList = this.currentCaseId ? filtered : this.evidenceList; // Restore
      }
    }
  },
  
  // === FORMULARZ DODAWANIA ===
  
  async showAddForm(caseId) {
    try {
      // Generuj kod dowodu
      const codeResponse = await window.api.request('/evidence/generate-code', {
        method: 'POST',
        body: { case_id: caseId }
      });
      
      const modal = document.createElement('div');
      modal.id = 'evidenceFormModal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 99999; display: flex; justify-content: center; align-items: center; padding: 20px; overflow-y: auto;';
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; width: 90vw; max-width: 1200px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #3B82F6, #3B82F6); padding: 25px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 10;">
            <h2 style="margin: 0;">➕ Dodaj nowy dowód</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Kod: ${codeResponse.evidence_code}</p>
          </div>
          
          <div style="padding: 30px;">
            <form id="evidenceForm">
              <input type="hidden" id="evidence_code" value="${codeResponse.evidence_code}">
              <input type="hidden" id="case_id" value="${caseId}">
              
              <!-- PODSTAWOWE -->
              <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #0d47a1;">📋 Informacje podstawowe</h3>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px;">Nazwa dowodu *</label>
                  <input type="text" id="evidence_name" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="np. Umowa sprzedaży">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Typ dowodu *</label>
                    <select id="evidence_type" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="">-- Wybierz typ --</option>
                      <optgroup label="📦 Tradycyjne">
                        <option value="physical">📦 Dowód rzeczowy</option>
                        <option value="document">📄 Dokument papierowy</option>
                        <option value="testimony">🗣️ Zeznanie świadka</option>
                        <option value="expert">🎓 Opinia biegłego</option>
                        <option value="protocol">📝 Protokół</option>
                      </optgroup>
                      <optgroup label="📱 Cyfrowe / Komunikacja">
                        <option value="email">📧 Email</option>
                        <option value="whatsapp">💬 WhatsApp</option>
                        <option value="messenger">💬 Messenger</option>
                        <option value="sms">📱 SMS</option>
                        <option value="social_media">📱 Social Media Post</option>
                        <option value="online_correspondence">🌐 Korespondencja online</option>
                      </optgroup>
                      <optgroup label="🎥 Multimedia">
                        <option value="recording">🎥 Nagranie wideo</option>
                        <option value="audio">🎤 Nagranie audio</option>
                        <option value="photo">📸 Zdjęcie</option>
                        <option value="screenshot">📱 Screenshot</option>
                        <option value="screen_recording">📹 Nagranie ekranu</option>
                      </optgroup>
                      <optgroup label="🔬 Badania">
                        <option value="forensic">🔬 Badania kryminalistyczne</option>
                        <option value="dna">🧬 Badanie DNA</option>
                        <option value="medical">🏥 Badanie medyczne</option>
                        <option value="expert_research">📊 Badanie eksperckie</option>
                      </optgroup>
                      <optgroup label="📋 Inne">
                        <option value="circumstantial">🔍 Poszlaka</option>
                        <option value="other">📋 Inne</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Znaczenie</label>
                    <select id="significance" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="supporting">✅ Wspierający</option>
                      <option value="important">⭐ Ważny</option>
                      <option value="crucial">🔥 Kluczowy</option>
                      <option value="neutral">➖ Neutralny</option>
                    </select>
                  </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px;">Opis</label>
                  <textarea id="description" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Szczegółowy opis dowodu"></textarea>
                </div>
                
                <!-- ZAŁĄCZNIKI -->
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #3B82F6;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem;">📎 Załączniki dowodu</label>
                  <input type="file" id="evidence_files" multiple accept="*/*" style="width: 100%; padding: 12px; border: 2px solid #3B82F6; border-radius: 6px; background: white; cursor: pointer;" onchange="evidenceModule.displaySelectedFiles(this)">
                  <small style="color: #666; display: block; margin-top: 5px;">
                    📌 Dozwolone wszystkie typy plików (PDF, obrazy, wideo, audio, dokumenty)<br>
                    💡 Możesz wybrać wiele plików naraz (Ctrl + klik)
                  </small>
                  
                  <!-- Lista wybranych plików -->
                  <div id="selected_files_preview" style="margin-top: 10px; display: none;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #3B82F6;">Wybrane pliki:</div>
                    <div id="files_list" style="max-height: 150px; overflow-y: auto;"></div>
                  </div>
                </div>
                
                <!-- DOKUMENTY Z SYSTEMU -->
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #9c27b0;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem;">📂 Lub wybierz dokumenty z systemu</label>
                  <button type="button" onclick="evidenceModule.showSystemDocuments(${caseId})" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 12px rgba(156,39,176,0.3);">
                    📂 Wybierz z istniejących dokumentów sprawy
                  </button>
                  <small style="color: #666; display: block; margin-top: 5px;">
                    💡 Możesz dołączyć dokumenty które już istnieją w systemie
                  </small>
                  
                  <!-- Lista wybranych dokumentów z systemu -->
                  <div id="selected_system_docs" style="margin-top: 10px; display: none;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #9c27b0;">Wybrane dokumenty z systemu:</div>
                    <div id="system_docs_list" style="max-height: 150px; overflow-y: auto;"></div>
                  </div>
                </div>
              </div>
              
              <!-- POCHODZENIE -->
              <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #e65100;">📍 Pochodzenie i powiązania</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Data uzyskania</label>
                    <input type="date" id="obtained_date" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Źródło</label>
                    <input type="text" id="obtained_from" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Klient, świadek, sąd...">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Sposób uzyskania</label>
                    <input type="text" id="obtained_method" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Przekazanie, przeszukanie...">
                  </div>
                </div>
              </div>
              
              <!-- SEKCJA LINKÓW USUNIĘTA - NIE WSPIERANA W BAZIE -->
              
              <!-- ŚWIADEK (tylko powiązanie, bez zeznania) -->
              <div style="background: #f3e5f5; border: 2px solid #9c27b0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #4a148c;">👤 Powiązanie ze świadkiem</h3>
                
                <div style="margin-bottom: 20px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem;">Świadek (opcjonalnie)</label>
                  <select id="witness_id" style="width: 100%; padding: 14px; border: 2px solid #9c27b0; border-radius: 6px; font-size: 1rem; background: white;">
                    <option value="">-- Brak powiązania --</option>
                    <option value="load">⏳ Ładowanie świadków...</option>
                  </select>
                  <small style="color: #666; display: block; margin-top: 5px;">Wybierz świadka jeśli ten dowód pochodzi od niego lub dotyczy jego zeznań</small>
                </div>
                
                <!-- SEKCJA ZEZNAŃ USUNIĘTA - NIE WSPIERANA W BAZIE -->
              </div>
              
              <!-- SEKCJA POSZLAK USUNIĘTA - NIE WSPIERANA W BAZIE -->
              
              <!-- OCENA -->
              <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1b5e20;">⭐ Ocena</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Wiarygodność (1-10)</label>
                    <input type="number" id="credibility_score" min="1" max="10" value="5" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Dopuszczalność</label>
                    <select id="admissibility" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="pending">⏳ Oczekujący</option>
                      <option value="admissible">✅ Dopuszczony</option>
                      <option value="contested">⚠️ Kwestionowany</option>
                      <option value="rejected">❌ Odrzucony</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Status</label>
                    <select id="status" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="secured">🔒 Zabezpieczony</option>
                      <option value="catalogued">📋 Skatalogowany</option>
                      <option value="presented">📤 Przedstawiony</option>
                      <option value="accepted">✅ Przyjęty</option>
                      <option value="rejected">❌ Odrzucony</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- STRATEGIA -->
              <div style="background: #fce4ec; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #880e4f;">🎯 Strategia wykorzystania</h3>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px;">Mocne strony</label>
                  <textarea id="strengths" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Dlaczego ten dowód jest korzystny?"></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px;">Słabości</label>
                  <textarea id="weaknesses" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jakie są ryzyka/słabości?"></textarea>
                </div>
                
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px;">Plan wykorzystania</label>
                  <textarea id="usage_strategy" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jak strategicznie użyć tego dowodu?"></textarea>
                </div>
              </div>
              
              <!-- NOTATKI -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">📝 Dodatkowe notatki</label>
                <textarea id="notes" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Wszelkie dodatkowe informacje..."></textarea>
              </div>
              
              <!-- PRZYCISKI -->
              <div style="display: flex; gap: 15px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                <button type="button" onclick="document.getElementById('evidenceFormModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                  ✕ Anuluj
                </button>
                <button type="submit" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #3B82F6, #3B82F6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(243,156,18,0.4);">
                  ✓ Dodaj dowód
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Załaduj świadków
      this.loadWitnessesForSelect(caseId);
      
      // Handle form submit
      document.getElementById('evidenceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveEvidence(caseId);
      });
      
    } catch (error) {
      console.error('❌ Błąd tworzenia formularza:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  // === ZAPISZ DOWÓD ===
  
  // === ZAŁADUJ ZEZNANIA ŚWIADKA ===
  
  async loadWitnessTestimonies(witnessId) {
    try {
      const response = await window.api.request(`/witnesses/${witnessId}/testimonies`);
      const testimonies = response.testimonies || [];
      
      const selectElement = document.getElementById('testimony_id');
      if (!selectElement) return;
      
      selectElement.innerHTML = '<option value="">-- Brak powiązania z zeznaniem --</option>';
      
      testimonies.forEach(testimony => {
        const option = document.createElement('option');
        option.value = testimony.id;
        
        // Format: [KOD] - [TYP] - [DATA]
        const date = testimony.testimony_date ? new Date(testimony.testimony_date).toLocaleDateString('pl-PL') : 'Brak daty';
        const type = this.getTestimonyTypeLabel(testimony.testimony_type);
        const code = testimony.testimony_code || `ID:${testimony.id}`;
        
        option.textContent = `${code} - ${type} - ${date}`;
        option.dataset.testimony = JSON.stringify(testimony);
        selectElement.appendChild(option);
      });
      
      if (testimonies.length === 0) {
        selectElement.innerHTML = '<option value="">-- Brak zeznań dla tego świadka --</option>';
      }
    } catch (error) {
      console.error('❌ Błąd ładowania zeznań:', error);
    }
  },
  
  // === PODGLĄD ZEZNANIA ===
  
  showTestimonyPreview(testimonyId) {
    const selectElement = document.getElementById('testimony_id');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    
    if (!selectedOption || !selectedOption.dataset.testimony) return;
    
    const testimony = JSON.parse(selectedOption.dataset.testimony);
    const previewDiv = document.getElementById('testimony_preview');
    const codeBadge = document.getElementById('testimony_code_badge');
    const detailsDiv = document.getElementById('testimony_details');
    
    // Pokaż badge z kodem
    codeBadge.textContent = testimony.testimony_code || `ID: ${testimony.id}`;
    
    // Wyświetl szczegóły
    const date = testimony.testimony_date ? new Date(testimony.testimony_date).toLocaleDateString('pl-PL') : 'Brak daty';
    const type = this.getTestimonyTypeLabel(testimony.testimony_type);
    
    detailsDiv.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>Typ:</strong> ${type}</div>
      <div style="margin-bottom: 8px;"><strong>Data:</strong> ${date}</div>
      ${testimony.content ? `<div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">${testimony.content.substring(0, 200)}${testimony.content.length > 200 ? '...' : ''}</div>` : ''}
    `;
    
    previewDiv.style.display = 'block';
  },
  
  // === HELPER: ETYKIETA TYPU ZEZNANIA ===
  
  getTestimonyTypeLabel(type) {
    const types = {
      'written': '📄 Pisemne',
      'oral': '🗣️ Ustne',
      'recorded': '🎤 Nagrane',
      'PIS': '📄 Pisemne',
      'UST': '🗣️ Ustne',
      'NAG': '🎤 Nagrane'
    };
    return types[type] || type;
  },
  
  // === WYŚWIETL WYBRANE PLIKI ===
  
  displaySelectedFiles(input) {
    const files = input.files;
    const previewDiv = document.getElementById('selected_files_preview');
    const filesList = document.getElementById('files_list');
    
    if (files.length === 0) {
      previewDiv.style.display = 'none';
      return;
    }
    
    let html = '';
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const size = (file.size / 1024).toFixed(1); // KB
      const icon = this.getFileIcon(file.name);
      
      html += `
        <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">${icon}</span>
            <div>
              <div style="font-weight: 600; color: #1a2332;">${file.name}</div>
              <div style="font-size: 0.85rem; color: #666;">${size} KB</div>
            </div>
          </div>
        </div>
      `;
    }
    
    filesList.innerHTML = html;
    previewDiv.style.display = 'block';
    
    console.log(`📎 Wybrano ${files.length} plików do załączenia`);
  },
  
  // === HELPER: IKONA PLIKU ===
  
  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'pdf': '📄',
      'doc': '📝', 'docx': '📝',
      'xls': '📊', 'xlsx': '📊',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
      'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
      'mp3': '🎵', 'wav': '🎵', 'm4a': '🎵',
      'zip': '📦', 'rar': '📦', '7z': '📦',
      'txt': '📃'
    };
    return icons[ext] || '📎';
  },
  
  // === KONWERTUJ PLIKI DO BASE64 ===
  
  async convertFilesToBase64(files) {
    const attachments = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const base64 = await this.fileToBase64(file);
        
        attachments.push({
          filename: file.name,
          mimetype: file.type || 'application/octet-stream',
          size: file.size,
          data: base64
        });
        
        console.log(`✅ Plik "${file.name}" przekonwertowany (${(file.size / 1024).toFixed(1)} KB)`);
      } catch (error) {
        console.error(`❌ Błąd konwersji pliku "${file.name}":`, error);
      }
    }
    
    return attachments;
  },
  
  // === HELPER: PLIK → BASE64 ===
  
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Usuń prefix "data:...;base64,"
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  // === HELPER: BLOB → BASE64 ===
  
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
  
  // === ZAŁADUJ ŚWIADKÓW DO SELECT ===
  
  async loadWitnessesForSelect(caseId) {
    try {
      const response = await window.api.request(`/witnesses/case/${caseId}`);
      const witnesses = response.witnesses || [];
      
      const selectElement = document.getElementById('witness_id');
      if (!selectElement) return;
      
      selectElement.innerHTML = '<option value="">-- Brak powiązania --</option>';
      
      witnesses.forEach(witness => {
        const option = document.createElement('option');
        option.value = witness.id;
        option.textContent = `${witness.first_name} ${witness.last_name} (${witness.role || 'świadek'})`;
        selectElement.appendChild(option);
      });
      
      if (witnesses.length === 0) {
        selectElement.innerHTML = '<option value="">-- Brak świadków w sprawie --</option>';
      }
    } catch (error) {
      console.error('❌ Błąd ładowania świadków:', error);
    }
  },
  
  // === POKAŻ WYBÓR DOKUMENTÓW Z SYSTEMU ===
  
  async showSystemDocuments(caseId) {
    try {
      // Pobierz dokumenty sprawy
      const response = await window.api.request(`/cases/${caseId}/documents`);
      const documents = response.documents || [];
      
      if (documents.length === 0) {
        alert('Brak dokumentów w systemie dla tej sprawy');
        return;
      }
      
      // Utwórz modal wyboru
      const modal = document.createElement('div');
      modal.id = 'systemDocsModal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10002; display: flex; justify-content: center; align-items: center; padding: 20px;';
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; width: 90vw; max-width: 800px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
          <div style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); padding: 20px; color: white;">
            <h3 style="margin: 0;">📂 Wybierz dokumenty z systemu</h3>
          </div>
          
          <div style="flex: 1; overflow-y: auto; padding: 20px;">
            ${documents.map(doc => `
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent; transition: all 0.3s;" 
                   onclick="this.classList.toggle('selected'); this.style.borderColor = this.classList.contains('selected') ? '#9c27b0' : 'transparent'; this.style.background = this.classList.contains('selected') ? '#f3e5f5' : '#f5f5f5';"
                   data-doc-id="${doc.id}"
                   data-doc-filename="${doc.filename}"
                   data-doc-path="${doc.file_path || ''}">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="font-size: 2rem;">📄</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${doc.filename}</div>
                    <div style="font-size: 0.85rem; color: #666;">${doc.document_number || 'Brak numeru'} • ${(doc.file_size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div id="check_${doc.id}" style="width: 24px; height: 24px; border: 2px solid #9c27b0; border-radius: 4px; display: none; background: #9c27b0; color: white; text-align: center; line-height: 20px;">✓</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="padding: 20px; border-top: 2px solid #e0e0e0; display: flex; gap: 10px;">
            <button onclick="document.getElementById('systemDocsModal').remove()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Anuluj</button>
            <button onclick="evidenceModule.addSystemDocuments()" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">✓ Dodaj wybrane</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Toggle checkmark visibility
      modal.querySelectorAll('[data-doc-id]').forEach(el => {
        el.addEventListener('click', () => {
          const check = el.querySelector('[id^="check_"]');
          if (check) {
            check.style.display = el.classList.contains('selected') ? 'block' : 'none';
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Błąd ładowania dokumentów:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  // === DODAJ DOKUMENTY Z SYSTEMU ===
  
  async addSystemDocuments() {
    const modal = document.getElementById('systemDocsModal');
    const selectedDocs = modal.querySelectorAll('[data-doc-id].selected');
    
    if (selectedDocs.length === 0) {
      alert('Nie wybrano żadnych dokumentów');
      return;
    }
    
    // Zapisz wybrane dokumenty do globalnej zmiennej
    this.selectedSystemDocs = Array.from(selectedDocs).map(el => ({
      id: el.dataset.docId,
      filename: el.dataset.docFilename,
      path: el.dataset.docPath
    }));
    
    // Pokaż listę wybranych
    const previewDiv = document.getElementById('selected_system_docs');
    const listDiv = document.getElementById('system_docs_list');
    
    listDiv.innerHTML = this.selectedSystemDocs.map((doc, index) => `
      <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #9c27b0; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">📄</span>
          <span style="font-weight: 600; color: #1a2332;">${doc.filename}</span>
        </div>
        <button onclick="evidenceModule.removeSystemDoc(${index})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✕</button>
      </div>
    `).join('');
    
    previewDiv.style.display = 'block';
    
    console.log(`✅ Wybrano ${this.selectedSystemDocs.length} dokumentów z systemu`);
    modal.remove();
  },
  
  // === USUŃ DOKUMENT Z SYSTEMU ===
  
  removeSystemDoc(index) {
    this.selectedSystemDocs.splice(index, 1);
    
    const previewDiv = document.getElementById('selected_system_docs');
    const listDiv = document.getElementById('system_docs_list');
    
    if (this.selectedSystemDocs.length === 0) {
      previewDiv.style.display = 'none';
    } else {
      listDiv.innerHTML = this.selectedSystemDocs.map((doc, i) => `
        <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #9c27b0; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">📄</span>
            <span style="font-weight: 600; color: #1a2332;">${doc.filename}</span>
          </div>
          <button onclick="evidenceModule.removeSystemDoc(${i})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✕</button>
        </div>
      `).join('');
    }
  },
  
  // === ZAPISZ DOWÓD ===
  
  async saveEvidence(caseId) {
    const formData = {
      case_id: caseId,
      evidence_code: document.getElementById('evidence_code').value,
      evidence_type: document.getElementById('evidence_type').value,
      name: document.getElementById('evidence_name').value,
      description: document.getElementById('description').value,
      obtained_date: document.getElementById('obtained_date').value,
      obtained_from: document.getElementById('obtained_from').value,
      obtained_method: document.getElementById('obtained_method').value,
      significance: document.getElementById('significance').value,
      credibility_score: document.getElementById('credibility_score').value,
      admissibility: document.getElementById('admissibility').value,
      status: document.getElementById('status').value,
      strengths: document.getElementById('strengths').value,
      weaknesses: document.getElementById('weaknesses').value,
      usage_strategy: document.getElementById('usage_strategy').value,
      notes: document.getElementById('notes').value,
      // Powiązania
      witness_id: document.getElementById('witness_id').value || null
    };
    
    // Załączniki - konwersja do base64
    const filesInput = document.getElementById('evidence_files');
    let attachments = [];
    
    if (filesInput && filesInput.files.length > 0) {
      console.log(`📎 Przetwarzam ${filesInput.files.length} załączników...`);
      attachments = await this.convertFilesToBase64(filesInput.files);
    }
    
    // Dodaj dokumenty z systemu
    if (this.selectedSystemDocs && this.selectedSystemDocs.length > 0) {
      console.log(`📂 Dodaję ${this.selectedSystemDocs.length} dokumentów z systemu...`);
      
      for (const doc of this.selectedSystemDocs) {
        try {
          // Pobierz plik z systemu
          const response = await fetch(`https://web-production-7504.up.railway.app/api/cases/${caseId}/documents/${doc.id}/download`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          
          attachments.push({
            filename: doc.filename,
            mimetype: blob.type || 'application/octet-stream',
            size: blob.size,
            data: base64
          });
          
          console.log(`✅ Dokument "${doc.filename}" dodany`);
        } catch (error) {
          console.error(`❌ Błąd dodawania dokumentu "${doc.filename}":`, error);
        }
      }
    }
    
    if (attachments.length > 0) {
      formData.attachments = attachments;
    }
    
    // Wyczyść wybrane dokumenty
    this.selectedSystemDocs = [];
    
    try {
      await window.api.request('/evidence', {
        method: 'POST',
        body: formData
      });
      
      document.getElementById('evidenceFormModal').remove();
      window.showNotification('✅ Dowód dodany pomyślnie', 'success');
      this.renderTab(caseId);
      
      // Event Bus
      if (window.eventBus) {
        window.eventBus.emit('evidence:created', { caseId, evidence: formData });
      }
    } catch (error) {
      console.error('❌ Błąd zapisu dowodu:', error);
      alert('Błąd zapisu: ' + error.message);
    }
  },
  
  // === SZCZEGÓŁY DOWODU ===
  
  async viewDetails(evidenceId) {
    // Pokaż okienko ładowania
    const loadingModal = document.createElement('div');
    loadingModal.id = 'evidenceLoadingModal';
    loadingModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    loadingModal.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">🔍</div>
            <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Ładowanie dowodu...</div>
            <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #3B82F6, #1E40AF); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
            </div>
            <style>
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes loadingBar { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
            </style>
        </div>
    `;
    document.body.appendChild(loadingModal);
    
    try {
      const response = await window.api.request(`/evidence/${evidenceId}`);
      const evidence = response.evidence;
      
      console.log('📦 Szczegóły dowodu:', evidence);
      console.log(`📎 Liczba załączników: ${evidence.attachments ? evidence.attachments.length : 0}`);
      
      // Płynne przejście z ładowania do modala
      const loadingEl = document.getElementById('evidenceLoadingModal');
      if (loadingEl) {
          loadingEl.style.transition = 'opacity 0.3s ease';
          loadingEl.style.opacity = '0';
          setTimeout(() => loadingEl.remove(), 300);
      }
      
      const modal = document.createElement('div');
      modal.id = 'evidenceDetailsModal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; justify-content: center; align-items: center; padding: 20px; overflow-y: auto;';
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; width: 90vw; max-width: 1200px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 25px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 10;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h2 style="margin: 0 0 5px 0;">${this.getTypeEmoji(evidence.evidence_type)} ${window.crmManager.escapeHtml(evidence.name)}</h2>
                <p style="margin: 0; opacity: 0.9;">${evidence.evidence_code}</p>
              </div>
              <button onclick="document.getElementById('evidenceDetailsModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">✕</button>
            </div>
          </div>
          
          <div style="padding: 30px;">
            ${evidence.description ? `
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>Opis:</strong> ${window.crmManager.escapeHtml(evidence.description)}
              </div>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
              ${this.renderDetailCard('📋 Typ', this.getTypeLabel(evidence.evidence_type))}
              ${this.renderDetailCard('⭐ Znaczenie', this.renderSignificanceBadge(evidence.significance))}
              ${this.renderDetailCard('📊 Status', this.renderStatusBadge(evidence.status))}
              ${this.renderDetailCard('⚖️ Dopuszczalność', this.renderAdmissibilityBadge(evidence.admissibility))}
              ${evidence.credibility_score ? this.renderDetailCard('🎯 Wiarygodność', `${evidence.credibility_score}/10`) : ''}
              ${evidence.obtained_date ? this.renderDetailCard('📅 Data uzyskania', new Date(evidence.obtained_date).toLocaleDateString('pl-PL')) : ''}
              ${evidence.obtained_from ? this.renderDetailCard('📍 Źródło', evidence.obtained_from) : ''}
              ${evidence.obtained_method ? this.renderDetailCard('🔧 Sposób', evidence.obtained_method) : ''}
              ${evidence.presented_date ? this.renderDetailCard('📤 Przedstawiono', new Date(evidence.presented_date).toLocaleDateString('pl-PL')) : ''}
            </div>
            
            ${evidence.strengths || evidence.weaknesses || evidence.usage_strategy ? `
              <div style="background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1b5e20;">🎯 Analiza strategiczna</h3>
                ${evidence.strengths ? `<div style="margin-bottom: 10px;"><strong>✅ Mocne strony:</strong> ${evidence.strengths}</div>` : ''}
                ${evidence.weaknesses ? `<div style="margin-bottom: 10px;"><strong>⚠️ Słabości:</strong> ${evidence.weaknesses}</div>` : ''}
                ${evidence.usage_strategy ? `<div><strong>🎯 Plan wykorzystania:</strong> ${evidence.usage_strategy}</div>` : ''}
              </div>
            ` : ''}
            
            ${evidence.witness_name ? `
              <div style="background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #4a148c;">👤 Powiązanie ze świadkiem</h3>
                <p style="margin: 0;"><strong>Świadek:</strong> ${evidence.witness_name}</p>
                ${evidence.testimony_code ? `<p style="margin: 5px 0 0 0;"><strong>Zeznanie:</strong> ${evidence.testimony_code}</p>` : ''}
              </div>
            ` : ''}
            
            ${evidence.source_url || evidence.social_profile || evidence.related_emails || evidence.related_phones ? `
              <div style="background: #e1f5fe; border-left: 4px solid #03a9f4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #01579b;">🔗 Linki i odnośniki cyfrowe</h3>
                ${evidence.source_url ? `<p style="margin: 5px 0;"><strong>🌐 URL:</strong> <a href="${evidence.source_url}" target="_blank" style="color: #03a9f4;">${evidence.source_url}</a></p>` : ''}
                ${evidence.social_profile ? `<p style="margin: 5px 0;"><strong>📱 Profil:</strong> <a href="${evidence.social_profile}" target="_blank" style="color: #03a9f4;">${evidence.social_profile}</a></p>` : ''}
                ${evidence.social_platform ? `<p style="margin: 5px 0;"><strong>Platform:</strong> ${evidence.social_platform}</p>` : ''}
                ${evidence.related_emails ? `<p style="margin: 5px 0;"><strong>📧 Emaile:</strong> ${evidence.related_emails}</p>` : ''}
                ${evidence.related_phones ? `<p style="margin: 5px 0;"><strong>📞 Telefony:</strong> ${evidence.related_phones}</p>` : ''}
              </div>
            ` : ''}
            
            ${evidence.circumstantial_type ? `
              <div style="background: #fff9c4; border-left: 4px solid #fbc02d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #f57f17;">🔍 Szczegóły poszlaki</h3>
                <p style="margin: 5px 0;"><strong>Typ poszlaki:</strong> ${evidence.circumstantial_type}</p>
                ${evidence.circumstantial_strength ? `<p style="margin: 5px 0;"><strong>Siła dowodowa:</strong> ${evidence.circumstantial_strength}</p>` : ''}
                ${evidence.circumstantial_connections ? `<p style="margin: 5px 0;"><strong>Powiązania:</strong> ${evidence.circumstantial_connections}</p>` : ''}
                ${evidence.alternative_explanations ? `<p style="margin: 5px 0;"><strong>Alternatywne wyjaśnienia:</strong> ${evidence.alternative_explanations}</p>` : ''}
              </div>
            ` : ''}
            
            ${evidence.notes ? `
              <div style="background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #e65100;">📝 Notatki</h3>
                <p style="margin: 0;">${evidence.notes}</p>
              </div>
            ` : ''}
            
            <div style="background: linear-gradient(135deg, #F8FAFC, #E2E8F0); border: 3px solid #3B82F6; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(76,175,80,0.2);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #1b5e20; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 2rem;">📎</span>
                  Załączniki dowodu ${evidence.attachments && evidence.attachments.length > 0 ? `(${evidence.attachments.length})` : ''}
                </h3>
                ${evidence.attachments && evidence.attachments.length > 0 ? `
                  <div style="background: #3B82F6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 1rem;">
                    ${evidence.attachments.length} ${evidence.attachments.length === 1 ? 'plik' : evidence.attachments.length < 5 ? 'pliki' : 'plików'}
                  </div>
                ` : ''}
              </div>
              
              ${evidence.attachments && evidence.attachments.length > 0 ? `
                <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <div style="color: #2e7d32; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">💡 Dla AI i analizy strategicznej:</div>
                  <div style="color: #1b5e20; font-size: 0.9rem; line-height: 1.6;">
                    Te pliki mogą być analizowane przez AI w celu:<br>
                    • Ekstrakcji kluczowych informacji z dokumentów<br>
                    • Rozpoznawania wzorców i powiązań<br>
                    • Sugerowania optymalnej strategii procesowej<br>
                    • Identyfikacji mocnych i słabych punktów
                  </div>
                </div>
                ${evidence.attachments.map((att, index) => `
                  <div style="background: white; padding: 18px; border-radius: 10px; margin-bottom: 12px; border: 2px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s;" onmouseover="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 4px 16px rgba(76,175,80,0.3)'" onmouseout="this.style.borderColor='#e0e0e0'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                      <div style="display: flex; align-items: start; gap: 15px; flex: 1;">
                        <div style="background: linear-gradient(135deg, #3B82F6, #66bb6a); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 4px 8px rgba(76,175,80,0.3);">
                          ${this.getFileIcon(att.filename)}
                        </div>
                        <div style="flex: 1;">
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                            <span style="background: #2e7d32; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
                              #${index + 1}
                            </span>
                            <div style="font-weight: 700; color: #1a2332; font-size: 1.1rem;">${att.filename}</div>
                          </div>
                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Rozmiar</div>
                              <div style="font-weight: 600; color: #1a2332; font-size: 0.95rem;">${(att.filesize / 1024).toFixed(1)} KB</div>
                            </div>
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Typ</div>
                              <div style="font-weight: 600; color: #1a2332; font-size: 0.95rem;">${att.mimetype.split('/')[1].toUpperCase()}</div>
                            </div>
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Format</div>
                              <div style="font-weight: 600; color: #1a2332; font-size: 0.95rem;">${att.filename.split('.').pop().toUpperCase()}</div>
                            </div>
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Data dodania</div>
                              <div style="font-weight: 600; color: #1a2332; font-size: 0.95rem;">${att.uploaded_at ? new Date(att.uploaded_at).toLocaleDateString('pl-PL') : 'Nieznana'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <a href="data:${att.mimetype};base64,${att.file_data}" download="${att.filename}" 
                           style="padding: 12px 20px; background: linear-gradient(135deg, #3B82F6, #66bb6a); color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; text-align: center; box-shadow: 0 4px 12px rgba(76,175,80,0.3); transition: all 0.3s;"
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(76,175,80,0.4)'"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(76,175,80,0.3)'">
                          ⬇️ Pobierz
                        </a>
                        ${att.mimetype.includes('image') || att.mimetype.includes('video') ? `
                          <button onclick="evidenceModule.previewAttachment('${att.filename}', '${att.mimetype}', '${att.file_data}')"
                                  style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
                            👁️ Podgląd
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              ` : `
                <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.6); border-radius: 8px;">
                  <div style="font-size: 4rem; margin-bottom: 15px; opacity: 0.5;">📎</div>
                  <div style="font-size: 1.1rem; font-weight: 600; color: #666; margin-bottom: 8px;">Brak załączników</div>
                  <div style="color: #999; font-size: 0.9rem;">Ten dowód nie ma jeszcze żadnych załączonych plików</div>
                </div>
              `}
            </div>
            
            ${evidence.history && evidence.history.length > 0 ? `
              <div style="margin-top: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #1a2332;">📜 Historia zmian</h3>
                ${evidence.history.map(h => `
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #3B82F6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong>${h.action}</strong>
                      <small style="color: #666;">${new Date(h.changed_at).toLocaleString('pl-PL')}</small>
                    </div>
                    <div style="color: #666; font-size: 0.9rem; margin-top: 5px;">
                      ${h.changed_by_name} ${h.field_changed ? `• ${h.field_changed}: ${h.old_value} → ${h.new_value}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <button onclick="document.getElementById('evidenceDetailsModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">
                Zamknij
              </button>
              <button onclick="evidenceModule.showEditForm(${evidenceId}); document.getElementById('evidenceDetailsModal').remove()" style="flex: 1; padding: 14px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">
                ✏️ Edytuj
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Płynne pojawienie się modala
      const modalContent = modal.querySelector('div');
      if (modalContent) {
          modalContent.style.opacity = '0';
          modalContent.style.transform = 'scale(0.95)';
          modalContent.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          
          requestAnimationFrame(() => {
              modalContent.style.opacity = '1';
              modalContent.style.transform = 'scale(1)';
          });
      }
    } catch (error) {
      // Usuń okienko ładowania w przypadku błędu
      const loadingEl = document.getElementById('evidenceLoadingModal');
      if (loadingEl) loadingEl.remove();
      
      console.error('❌ Błąd ładowania szczegółów:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  renderDetailCard(label, value) {
    return `
      <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px;">
        <div style="font-size: 0.8rem; color: #999; text-transform: uppercase; margin-bottom: 5px;">${label}</div>
        <div style="font-weight: 600; color: #1a2332;">${value}</div>
      </div>
    `;
  },
  
  // === EDYCJA (TODO) ===
  showEditForm(evidenceId) {
    console.log('TODO: Formularz edycji dowodu', evidenceId);
    alert('Funkcja w przygotowaniu');
  },
  
  // === PRZEDSTAW W SĄDZIE ===
  async presentEvidence(evidenceId) {
    if (!confirm('Czy na pewno chcesz oznaczyć ten dowód jako przedstawiony w sądzie?')) {
      return;
    }
    
    try {
      await window.api.request(`/evidence/${evidenceId}/present`, {
        method: 'POST',
        body: {
          presented_date: new Date().toISOString().split('T')[0],
          notes: 'Dowód przedstawiony w sądzie'
        }
      });
      
      window.showNotification('✅ Dowód oznaczony jako przedstawiony', 'success');
      this.renderTab(this.currentCaseId);
      
      if (window.eventBus) {
        window.eventBus.emit('evidence:presented', { evidenceId });
      }
    } catch (error) {
      console.error('❌ Błąd:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  // === USUŃ DOWÓD ===
  async deleteEvidence(evidenceId) {
    if (!confirm('Czy na pewno chcesz usunąć ten dowód?\n\nTEJ OPERACJI NIE MOŻNA COFNĄĆ!')) {
      return;
    }
    
    try {
      await window.api.request(`/evidence/${evidenceId}`, {
        method: 'DELETE'
      });
      
      window.showNotification('✅ Dowód usunięty', 'success');
      this.renderTab(this.currentCaseId);
      
      if (window.eventBus) {
        window.eventBus.emit('evidence:deleted', { evidenceId });
      }
    } catch (error) {
      console.error('❌ Błąd usuwania:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  // === PODGLĄD ZAŁĄCZNIKA ===
  previewAttachment(filename, mimetype, base64data) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10002; display: flex; justify-content: center; align-items: center; padding: 20px;';
    
    // Określ typ zawartości
    let contentHtml = '';
    if (mimetype.includes('video')) {
      contentHtml = `
        <video controls autoplay style="max-width: 100%; max-height: 80vh; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
          <source src="data:${mimetype};base64,${base64data}" type="${mimetype}">
          Twoja przeglądarka nie obsługuje odtwarzania wideo.
        </video>
      `;
    } else {
      contentHtml = `
        <img src="data:${mimetype};base64,${base64data}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      `;
    }
    
    modal.innerHTML = `
      <div style="position: relative; max-width: 95vw; max-height: 95vh; background: white; border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
          <h3 style="margin: 0; color: #1a2332;">${mimetype.includes('video') ? '🎥' : '🖼️'} ${filename}</h3>
          <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #dc3545; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: 600;">✕</button>
        </div>
        <div style="flex: 1; overflow: auto; display: flex; justify-content: center; align-items: center;">
          ${contentHtml}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
};

// Rejestracja w systemie globalnym
window.renderEvidenceTab = (caseId) => evidenceModule.renderTab(caseId);
window.evidenceModule = evidenceModule; // ✅ Eksport modułu do użycia w ankietach

console.log('✅ Moduł dowodów gotowy do użycia');

