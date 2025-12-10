// ===================================
// MODUŁ DOWODÓW - Frontend v2.0
// ===================================

console.log('📦 evidence-module.js v2.0 załadowany - NAPRAWIONO RENDERING');

const evidenceModule = {
  currentCaseId: null,
  evidenceList: [],
  selectedSystemDocs: [],  // Dokumenty wybrane z systemu do załączenia
  
  // === RENDEROWANIE ZAKŁADKI ===
  
  async renderTab(caseId) {
    this.currentCaseId = caseId;
    console.log('📦 Renderuję zakładkę dowodów dla sprawy:', caseId);
    
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
      'invoice_sales': 'Faktura sprzedażowa',
      'invoice_cost': 'Faktura kosztowa',
      'invoice_vat': 'Faktura VAT',
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
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Nazwa dowodu *</label>
                  <input type="text" id="evidence_name" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="np. Umowa sprzedaży">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Typ dowodu *</label>
                    <select id="evidence_type" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="">-- Wybierz typ --</option>
                      <optgroup label="📦 Tradycyjne">
                        <option value="physical">📦 Dowód rzeczowy</option>
                        <option value="document">📄 Dokument papierowy</option>
                        <option value="invoice_sales">💰 Faktura sprzedażowa</option>
                        <option value="invoice_cost">💸 Faktura kosztowa</option>
                        <option value="invoice_vat">🧾 Faktura VAT / zbiorcza</option>
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
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Znaczenie</label>
                    <select id="significance" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="supporting">✅ Wspierający</option>
                      <option value="important">⭐ Ważny</option>
                      <option value="crucial">🔥 Kluczowy</option>
                      <option value="neutral">➖ Neutralny</option>
                    </select>
                  </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Opis</label>
                  <textarea id="description" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Szczegółowy opis dowodu"></textarea>
                </div>
                
                <!-- ZAŁĄCZNIKI -->
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #3B82F6;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">📎 Załączniki dowodu</label>
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
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">📂 Lub wybierz dokumenty z systemu</label>
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
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Data uzyskania</label>
                    <input type="date" id="obtained_date" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Źródło</label>
                    <input type="text" id="obtained_from" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Klient, świadek, sąd...">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Sposób uzyskania</label>
                    <input type="text" id="obtained_method" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Przekazanie, przeszukanie...">
                  </div>
                </div>
              </div>
              
              <!-- LINKI I ODNOŚNIKI (Social Media, WWW) -->
              <div style="background: #e1f5fe; border: 2px solid #03a9f4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #01579b;">🔗 Linki i odnośniki cyfrowe</h3>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">🌐 Link do źródła online (URL)</label>
                  <input type="url" id="source_url" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="https://...">
                  <small style="color: #666; display: block; margin-top: 5px;">Strona www, artykuł online, post w mediach społecznościowych</small>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📱 Link do profilu social media</label>
                    <input type="url" id="social_profile" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Facebook, Instagram, Twitter...">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Platform</label>
                    <select id="social_platform" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="">-- Wybierz --</option>
                      <option value="facebook">📘 Facebook</option>
                      <option value="instagram">📸 Instagram</option>
                      <option value="twitter">🐦 Twitter/X</option>
                      <option value="linkedin">💼 LinkedIn</option>
                      <option value="tiktok">🎵 TikTok</option>
                      <option value="youtube">📹 YouTube</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="telegram">✈️ Telegram</option>
                      <option value="other">🌐 Inne</option>
                    </select>
                  </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📧 Dodatkowe adresy email</label>
                  <input type="text" id="related_emails" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="email1@example.com, email2@example.com">
                  <small style="color: #666; display: block; margin-top: 5px;">Adresy email związane z dowodem (oddziel przecinkami)</small>
                </div>
                
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📞 Numery telefonów</label>
                  <input type="text" id="related_phones" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="+48 123 456 789, +48 987 654 321">
                  <small style="color: #666; display: block; margin-top: 5px;">Numery telefonów związane z dowodem (oddziel przecinkami)</small>
                </div>
              </div>
              
              <!-- ŚWIADEK I ZEZNANIA (duża sekcja) -->
              <div style="background: #f3e5f5; border: 2px solid #9c27b0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #4a148c;">👤 Powiązanie ze świadkiem i zeznaniami</h3>
                
                <div style="margin-bottom: 20px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">Świadek (opcjonalnie)</label>
                  <select id="witness_id" style="width: 100%; padding: 14px; border: 2px solid #9c27b0; border-radius: 6px; font-size: 1rem; background: white;">
                    <option value="">-- Brak powiązania --</option>
                    <option value="load">⏳ Ładowanie świadków...</option>
                  </select>
                  <small style="color: #666; display: block; margin-top: 5px;">Wybierz świadka jeśli ten dowód pochodzi od niego lub dotyczy jego zeznań</small>
                </div>
                
                <!-- WYBÓR ZEZNANIA (pokazuje się gdy wybrano świadka) -->
                <div id="testimony_section" style="background: rgba(156, 39, 176, 0.08); border: 2px dashed #9c27b0; border-radius: 8px; padding: 20px; margin-top: 15px; display: none;">
                  <h4 style="margin: 0 0 15px 0; color: #4a148c;">📝 Wybierz zeznanie świadka</h4>
                  
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">Istniejące zeznania świadka</label>
                    <select id="testimony_id" style="width: 100%; padding: 14px; border: 2px solid #9c27b0; border-radius: 6px; font-size: 1rem; background: white;">
                      <option value="">-- Brak powiązania z zeznaniem --</option>
                      <option value="load">⏳ Ładowanie zeznań...</option>
                    </select>
                    <small style="color: #666; display: block; margin-top: 5px;">
                      📌 Zeznania są tworzone w zakładce <strong>Świadkowie</strong><br>
                      💡 Wybierz zeznanie aby powiązać je z tym dowodem
                    </small>
                  </div>
                  
                  <!-- Podgląd wybranego zeznania -->
                  <div id="testimony_preview" style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; display: none; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <h5 style="margin: 0; color: #4a148c;">📋 Podgląd zeznania</h5>
                      <span id="testimony_code_badge" style="font-family: 'Courier New', monospace; font-weight: 600; color: #9c27b0; background: rgba(156, 39, 176, 0.1); padding: 5px 10px; border-radius: 4px;"></span>
                    </div>
                    <div id="testimony_details" style="color: #666; font-size: 0.95rem;"></div>
                  </div>
                </div>
                
                <!-- WYBÓR ZAŁĄCZNIKÓW ZEZNANIA (pokazuje się gdy wybrano zeznanie) -->
                <div id="witness_attachments_section" style="background: rgba(76, 175, 80, 0.08); border: 2px dashed #4CAF50; border-radius: 8px; padding: 20px; margin-top: 15px; display: none;">
                  <h4 style="margin: 0 0 15px 0; color: #2e7d32;">📎 Załączniki zeznania</h4>
                  
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">Pliki powiązane z wybranym zeznaniem</label>
                    <div id="witness_attachments_list" style="background: white; border: 2px solid #4CAF50; border-radius: 6px; padding: 15px; min-height: 60px;">
                      <small style="color: #999;">Wybierz zeznanie aby zobaczyć jego załączniki</small>
                    </div>
                    <small style="color: #666; display: block; margin-top: 8px;">
                      📌 Załączniki są dodawane przy zeznaniach w zakładce <strong>Świadkowie</strong><br>
                      💡 Zaznacz pliki które chcesz dodać jako dowód powiązany z zeznaniem
                    </small>
                  </div>
                </div>
              </div>
              
              <!-- POSZLAKI (jeśli typ = circumstantial) -->
              <div id="circumstantial_section" style="background: #fff9c4; border: 2px solid #fbc02d; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: none;">
                <h3 style="margin: 0 0 15px 0; color: #f57f17;">🔍 Szczegóły poszlaki</h3>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Typ poszlaki</label>
                  <select id="circumstantial_type" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <option value="behavioral">🚶 Behawioralna (zachowanie)</option>
                    <option value="temporal">⏰ Czasowa (zbieg okoliczności)</option>
                    <option value="spatial">📍 Przestrzenna (miejsce)</option>
                    <option value="material">🔨 Materialna (ślad, obiekt)</option>
                    <option value="testimonial">💬 Świadectwo pośrednie</option>
                    <option value="digital">💻 Cyfrowa (metadata, logi)</option>
                    <option value="financial">💰 Finansowa (transakcje)</option>
                    <option value="other">📋 Inna</option>
                  </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Siła dowodowa poszlaki</label>
                  <select id="circumstantial_strength" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <option value="weak">⚪ Słaba (wymaga dodatkowych dowodów)</option>
                    <option value="moderate">🟡 Umiarkowana</option>
                    <option value="strong">🟠 Silna</option>
                    <option value="conclusive">🔴 Przekonująca (niemal przesądzająca)</option>
                  </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Powiązanie z innymi dowodami</label>
                  <textarea id="circumstantial_connections" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jak ta poszlaka łączy się z innymi dowodami?"></textarea>
                </div>
                
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Alternatywne wyjaśnienia</label>
                  <textarea id="alternative_explanations" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jakie inne wyjaśnienia są możliwe?"></textarea>
                  <small style="color: #666; display: block; margin-top: 5px;">⚠️ Ważne: zawsze rozważ alternatywne interpretacje poszlak!</small>
                </div>
              </div>
              
              <!-- OCENA -->
              <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1b5e20;">⭐ Ocena</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Wiarygodność (1-10)</label>
                    <input type="number" id="credibility_score" min="1" max="10" value="5" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Dopuszczalność</label>
                    <select id="admissibility" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                      <option value="pending">⏳ Oczekujący</option>
                      <option value="admissible">✅ Dopuszczony</option>
                      <option value="contested">⚠️ Kwestionowany</option>
                      <option value="rejected">❌ Odrzucony</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Status</label>
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
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Mocne strony</label>
                  <textarea id="strengths" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Dlaczego ten dowód jest korzystny?"></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Słabości</label>
                  <textarea id="weaknesses" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jakie są ryzyka/słabości?"></textarea>
                </div>
                
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Plan wykorzystania</label>
                  <textarea id="usage_strategy" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jak strategicznie użyć tego dowodu?"></textarea>
                </div>
              </div>
              
              <!-- NOTATKI -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📝 Dodatkowe notatki</label>
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
      
      // Pokaż sekcję poszlak gdy wybrano typ "circumstantial"
      document.getElementById('evidence_type').addEventListener('change', (e) => {
        const circumstantialSection = document.getElementById('circumstantial_section');
        if (e.target.value === 'circumstantial') {
          circumstantialSection.style.display = 'block';
        } else {
          circumstantialSection.style.display = 'none';
        }
      });
      
      // Pokaż sekcję zeznania i załączników gdy wybrano świadka
      document.getElementById('witness_id').addEventListener('change', async (e) => {
        const testimonySection = document.getElementById('testimony_section');
        const attachmentsSection = document.getElementById('witness_attachments_section');
        const selectedWitnessId = e.target.value;
        
        if (selectedWitnessId && selectedWitnessId !== 'load') {
          testimonySection.style.display = 'block';
          attachmentsSection.style.display = 'none'; // Ukryj - pokaże się po wybraniu zeznania
          this.selectedWitnessId = selectedWitnessId;
          // Załaduj zeznania świadka
          await this.loadWitnessTestimonies(selectedWitnessId);
          // Wyczyść listę załączników
          const listDiv = document.getElementById('witness_attachments_list');
          if (listDiv) {
            listDiv.innerHTML = '<small style="color: #999;">Wybierz zeznanie aby zobaczyć jego załączniki</small>';
          }
        } else {
          testimonySection.style.display = 'none';
          attachmentsSection.style.display = 'none';
          this.selectedWitnessId = null;
        }
      });
      
      // Podgląd wybranego zeznania + załaduj załączniki zeznania
      document.getElementById('testimony_id').addEventListener('change', async (e) => {
        const testimonyId = e.target.value;
        const attachmentsSection = document.getElementById('witness_attachments_section');
        
        if (testimonyId) {
          this.showTestimonyPreview(testimonyId);
          attachmentsSection.style.display = 'block';
          // Załaduj załączniki przypisane do tego zeznania
          await this.loadTestimonyAttachments(testimonyId, caseId);
        } else {
          document.getElementById('testimony_preview').style.display = 'none';
          attachmentsSection.style.display = 'none';
        }
      });
      
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
  
  // === ZAŁADUJ ZAŁĄCZNIKI ŚWIADKA ===
  
  async loadWitnessAttachments(witnessId, caseId) {
    try {
      console.log('📎 Ładowanie załączników świadka:', witnessId);
      
      // Pobierz załączniki świadka z API
      const response = await window.api.request(`/attachments?entity_type=witness&entity_id=${witnessId}&case_id=${caseId}`);
      const attachments = response.attachments || [];
      
      const listDiv = document.getElementById('witness_attachments_list');
      if (!listDiv) return;
      
      if (attachments.length === 0) {
        listDiv.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #999;">
            <div style="font-size: 2rem; margin-bottom: 10px;">📭</div>
            <div>Brak załączników dla tego świadka</div>
            <small style="display: block; margin-top: 5px;">Dodaj załączniki w zakładce <strong>Świadkowie</strong></small>
          </div>
        `;
        return;
      }
      
      // Wyświetl listę załączników z checkboxami i podglądem
      listDiv.innerHTML = attachments.map(att => {
        const fileExt = att.file_name ? att.file_name.split('.').pop().toLowerCase() : '';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
        const isPdf = fileExt === 'pdf';
        const icon = isImage ? '🖼️' : isPdf ? '📄' : '📎';
        
        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; border: 2px solid transparent; transition: all 0.2s;" 
               onmouseover="this.style.borderColor='#4CAF50'" 
               onmouseout="this.style.borderColor='transparent'">
            <input type="checkbox" 
                   id="witness_att_${att.id}" 
                   name="witness_attachments" 
                   value="${att.id}"
                   data-filename="${att.file_name || ''}"
                   data-code="${att.attachment_code || ''}"
                   style="width: 20px; height: 20px; cursor: pointer;">
            <label for="witness_att_${att.id}" style="flex: 1; cursor: pointer; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">${icon}</span>
              <div>
                <div style="font-weight: 600; color: #1a2332;">${att.title || att.file_name || 'Bez nazwy'}</div>
                <div style="font-size: 0.85rem; color: #666;">
                  ${att.attachment_code ? `<span style="background: #e8f5e9; padding: 2px 6px; border-radius: 4px; margin-right: 8px;">${att.attachment_code}</span>` : ''}
                  ${att.file_name || ''}
                </div>
              </div>
            </label>
            <button type="button" onclick="evidenceModule.previewWitnessAttachment(${att.id}, '${(att.file_name || '').replace(/'/g, "\\'")}', '${att.case_id}')" 
                    style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 5px;">
              👁️ Podgląd
            </button>
          </div>
        `;
      }).join('');
      
      console.log(`✅ Załadowano ${attachments.length} załączników świadka`);
      
    } catch (error) {
      console.error('❌ Błąd ładowania załączników świadka:', error);
      const listDiv = document.getElementById('witness_attachments_list');
      if (listDiv) {
        listDiv.innerHTML = `<div style="color: #f44336; padding: 10px;">❌ Błąd ładowania załączników</div>`;
      }
    }
  },
  
  // === ZAŁADUJ ZAŁĄCZNIKI ZEZNANIA + DOKUMENTY ŚWIADKA ===
  
  async loadTestimonyAttachments(testimonyId, caseId) {
    try {
      console.log('📎 Ładowanie załączników zeznania + dokumentów świadka:', testimonyId);
      
      const listDiv = document.getElementById('witness_attachments_list');
      if (!listDiv) return;
      
      // Pokaż loading
      listDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;"><div style="animation: spin 1s linear infinite;">⏳</div> Ładowanie...</div>';
      
      // 1. Pobierz załączniki zeznania (entity_type=testimony)
      const testimonyAttResponse = await window.api.request(`/attachments?entity_type=testimony&entity_id=${testimonyId}`);
      const testimonyAttachments = testimonyAttResponse.attachments || [];
      console.log(`✅ Załączniki zeznania: ${testimonyAttachments.length}`);
      
      // 2. Pobierz ID świadka z wybranego zeznania
      const witnessId = this.selectedWitnessId || this.editWitnessId;
      
      // 3. Pobierz dokumenty świadka (DOK/SWI/ZEZ/...)
      let witnessDocuments = [];
      if (witnessId) {
        try {
          const docResponse = await window.api.request(`/witnesses/${witnessId}/documents`);
          witnessDocuments = docResponse.documents || [];
          console.log(`✅ Dokumenty świadka: ${witnessDocuments.length}`);
        } catch (err) {
          console.warn('⚠️ Nie można pobrać dokumentów świadka:', err);
        }
      }
      
      // 4. Pobierz załączniki bezpośrednio przypisane do świadka (ZAL/...)
      let witnessAttachments = [];
      if (witnessId) {
        try {
          const attResponse = await window.api.request(`/attachments?entity_type=witness&entity_id=${witnessId}&case_id=${caseId}`);
          witnessAttachments = attResponse.attachments || [];
          console.log(`✅ Załączniki świadka: ${witnessAttachments.length}`);
        } catch (err) {
          console.warn('⚠️ Nie można pobrać załączników świadka:', err);
        }
      }
      
      // Połącz wszystkie pliki
      const allFiles = [
        ...testimonyAttachments.map(att => ({ ...att, source: 'testimony', sourceLabel: '📝 Z zeznania' })),
        ...witnessDocuments.map(doc => ({ ...doc, id: doc.id, file_name: doc.filename, source: 'witness_doc', sourceLabel: '📋 Dokument świadka' })),
        ...witnessAttachments.map(att => ({ ...att, source: 'witness_att', sourceLabel: '📎 Załącznik świadka' }))
      ];
      
      if (allFiles.length === 0) {
        listDiv.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #999;">
            <div style="font-size: 2rem; margin-bottom: 10px;">📭</div>
            <div>Brak plików dla tego świadka</div>
            <small style="display: block; margin-top: 5px;">Dodaj załączniki lub dokumenty w zakładce <strong>Świadkowie</strong></small>
          </div>
        `;
        return;
      }
      
      // Wyświetl listę plików z checkboxami i podglądem
      listDiv.innerHTML = allFiles.map((file, idx) => {
        const filename = file.file_name || file.filename || '';
        const fileExt = filename ? filename.split('.').pop().toLowerCase() : '';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
        const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExt);
        const isPdf = fileExt === 'pdf';
        const icon = isVideo ? '🎬' : isImage ? '🖼️' : isPdf ? '📄' : '📎';
        
        // Określ kolor ramki w zależności od źródła
        const borderColor = file.source === 'testimony' ? '#4CAF50' : file.source === 'witness_doc' ? '#9C27B0' : '#FF9800';
        
        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${borderColor}; transition: all 0.2s;">
            <input type="checkbox" 
                   id="file_${idx}" 
                   name="testimony_attachments" 
                   value="${file.id}"
                   data-filename="${filename}"
                   data-code="${file.attachment_code || file.document_number || ''}"
                   data-source="${file.source}"
                   style="width: 20px; height: 20px; cursor: pointer;">
            <label for="file_${idx}" style="flex: 1; cursor: pointer; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">${icon}</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: #1a2332;">${file.title || filename || 'Bez nazwy'}</span>
                  <span style="font-size: 0.75rem; background: ${borderColor}; color: white; padding: 2px 6px; border-radius: 4px;">${file.sourceLabel}</span>
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                  ${file.attachment_code || file.document_number ? `<span style="background: #e8f5e9; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-weight: 600;">${file.attachment_code || file.document_number}</span>` : ''}
                  ${filename} ${file.file_size ? `• ${(file.file_size / 1024).toFixed(1)} KB` : ''}
                </div>
              </div>
            </label>
            <button type="button" onclick="window.crmManager.viewDocument(${file.id}, ${caseId}, '${file.source === 'witness_doc' ? 'witness_document' : 'attachment'}')" 
                    style="padding: 8px 12px; background: #FFD700; color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 5px;">
              👁️ Podgląd
            </button>
          </div>
        `;
      }).join('');
      
      console.log(`✅ Załadowano ${allFiles.length} plików (${testimonyAttachments.length} zeznanie + ${witnessDocuments.length} dokumenty + ${witnessAttachments.length} załączniki)`);
      
    } catch (error) {
      console.error('❌ Błąd ładowania załączników:', error);
      const listDiv = document.getElementById('witness_attachments_list');
      if (listDiv) {
        listDiv.innerHTML = `<div style="color: #f44336; padding: 10px;">❌ Błąd ładowania: ${error.message}</div>`;
      }
    }
  },
  
  // === PODGLĄD ZAŁĄCZNIKA ŚWIADKA ===
  
  async previewWitnessAttachment(attachmentId, filename, caseId) {
    try {
      console.log('👁️ Podgląd załącznika świadka:', attachmentId, filename);
      
      const apiBaseUrl = window.api?.baseURL || 'https://web-production-ef868.up.railway.app/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiBaseUrl}/attachments/${attachmentId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Błąd pobierania pliku');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const fileType = blob.type;
      const fileExt = filename ? filename.split('.').pop().toLowerCase() : '';
      
      // Stwórz modal podglądu
      const modal = document.createElement('div');
      modal.id = 'witness-attachment-preview-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex; align-items: center;
        justify-content: center; z-index: 100001; animation: fadeIn 0.2s ease;
      `;
      
      let previewContent = '';
      if (fileType.includes('pdf') || fileExt === 'pdf') {
        previewContent = `<iframe src="${url}" style="width: 100%; height: 100%; border: none; border-radius: 8px;"></iframe>`;
      } else if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        previewContent = `<img src="${url}" style="max-width: 95%; max-height: 90%; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">`;
      } else {
        previewContent = `
          <div style="text-align: center; color: white; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 12px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
            <div style="font-size: 1.2rem; margin-bottom: 10px;">${filename}</div>
            <div style="margin-bottom: 20px; opacity: 0.7;">Podgląd niedostępny dla tego typu pliku</div>
            <button onclick="const a = document.createElement('a'); a.href = '${url}'; a.download = '${filename}'; document.body.appendChild(a); a.click(); document.body.removeChild(a);" 
                style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              📥 Pobierz plik
            </button>
          </div>
        `;
      }
      
      modal.innerHTML = `
        <style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>
        <div style="position: relative; width: 95%; height: 95%; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 12px 12px 0 0;">
            <div style="color: white; font-weight: 600; font-size: 1.1rem;">📎 ${filename}</div>
            <div style="display: flex; gap: 10px;">
              <button onclick="const a = document.createElement('a'); a.href = '${url}'; a.download = '${filename}'; document.body.appendChild(a); a.click(); document.body.removeChild(a);" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Pobierz</button>
              <button onclick="document.getElementById('witness-attachment-preview-modal').remove()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">✕ Zamknij</button>
            </div>
          </div>
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
            ${previewContent}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      
    } catch (error) {
      console.error('❌ Błąd podglądu załącznika:', error);
      alert('Błąd wyświetlania załącznika: ' + error.message);
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
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.9); z-index: 999999; display: flex; justify-content: center; align-items: center; padding: 20px;';
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; width: 90vw; max-width: 800px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
          <div style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); padding: 20px; color: white;">
            <h3 style="margin: 0;">📂 Wybierz dokumenty z systemu</h3>
          </div>
          
          <div style="flex: 1; overflow-y: auto; padding: 20px;">
            ${documents.map(doc => {
              // Określ typ ikony i kolor
              const filename = doc.filename || '';
              const fileExt = filename.split('.').pop().toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
              const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExt);
              const isPdf = fileExt === 'pdf';
              const isDoc = ['doc', 'docx'].includes(fileExt);
              const icon = isVideo ? '🎬' : isImage ? '🖼️' : isPdf ? '📄' : isDoc ? '📝' : '📎';
              
              // Data dodania
              const uploadDate = doc.upload_date || doc.created_at || null;
              const dateStr = uploadDate ? new Date(uploadDate).toLocaleDateString('pl-PL', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'Brak daty';
              
              return `
              <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 2px solid transparent; transition: all 0.3s; border-left: 4px solid #9c27b0;" 
                   data-doc-id="${doc.id}"
                   data-doc-filename="${doc.filename}"
                   data-doc-path="${doc.file_path || ''}">
                <div style="display: flex; align-items: start; gap: 12px;">
                  <!-- Checkbox -->
                  <input type="checkbox" 
                         class="doc-checkbox" 
                         data-doc-id="${doc.id}"
                         style="width: 20px; height: 20px; margin-top: 4px; cursor: pointer;"
                         onchange="this.closest('[data-doc-id]').style.background = this.checked ? '#f3e5f5' : '#f5f5f5'; this.closest('[data-doc-id]').style.borderColor = this.checked ? '#9c27b0' : 'transparent';">
                  
                  <!-- Ikona -->
                  <div style="font-size: 2.5rem;">${icon}</div>
                  
                  <!-- Informacje -->
                  <div style="flex: 1;">
                    <!-- Nazwa pliku -->
                    <div style="font-weight: 700; color: #1a2332; margin-bottom: 6px; font-size: 1rem;">${doc.filename}</div>
                    
                    <!-- Numer dokumentu -->
                    ${doc.document_number ? `
                      <div style="display: inline-block; background: #9c27b0; color: white; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; margin-bottom: 6px;">
                        📋 ${doc.document_number}
                      </div>
                    ` : ''}
                    
                    <!-- Szczegóły -->
                    <div style="font-size: 0.85rem; color: #666; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
                      <span style="display: inline-flex; align-items: center; gap: 4px;">
                        📊 <strong>${(doc.file_size / 1024).toFixed(1)} KB</strong>
                      </span>
                      <span style="color: #e0e0e0;">•</span>
                      <span style="display: inline-flex; align-items: center; gap: 4px;">
                        📅 <strong>${dateStr}</strong>
                      </span>
                      ${doc.uploaded_by_name ? `
                        <span style="color: #e0e0e0;">•</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px;">
                          👤 <strong>${doc.uploaded_by_name}</strong>
                        </span>
                      ` : ''}
                    </div>
                    
                    <!-- Opis (jeśli istnieje) -->
                    ${doc.description ? `
                      <div style="margin-top: 8px; padding: 8px; background: white; border-radius: 6px; font-size: 0.85rem; color: #555; font-style: italic;">
                        💬 ${doc.description}
                      </div>
                    ` : ''}
                  </div>
                  
                  <!-- Przycisk podglądu -->
                  <button onclick="event.stopPropagation(); window.crmManager.viewDocument(${doc.id}, ${caseId}, 'document')" 
                          style="padding: 10px 16px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 700; box-shadow: 0 2px 8px rgba(255,215,0,0.3); transition: all 0.3s; white-space: nowrap; height: fit-content;"
                          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(255,215,0,0.5)'"
                          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(255,215,0,0.3)'">
                    👁️ Podgląd
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>
          
          <div style="padding: 20px; border-top: 2px solid #e0e0e0; display: flex; gap: 10px;">
            <button onclick="document.getElementById('systemDocsModal').remove()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Anuluj</button>
            <button onclick="evidenceModule.addSystemDocuments()" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">✓ Dodaj wybrane</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
    } catch (error) {
      console.error('❌ Błąd ładowania dokumentów:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  // === DODAJ DOKUMENTY Z SYSTEMU ===
  
  async addSystemDocuments() {
    const modal = document.getElementById('systemDocsModal');
    const selectedCheckboxes = modal.querySelectorAll('.doc-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
      alert('Nie wybrano żadnych dokumentów');
      return;
    }
    
    // Zapisz wybrane dokumenty do globalnej zmiennej
    this.selectedSystemDocs = Array.from(selectedCheckboxes).map(checkbox => {
      const docEl = checkbox.closest('[data-doc-id]');
      return {
        id: docEl.dataset.docId,
        filename: docEl.dataset.docFilename,
        path: docEl.dataset.docPath
      };
    });
    
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
    console.log('🔵 saveEvidence wywołane dla sprawy:', caseId);
    console.log('🔵 selectedSystemDocs:', this.selectedSystemDocs);
    console.log('🔵 selectedSystemDocs.length:', this.selectedSystemDocs ? this.selectedSystemDocs.length : 0);
    
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
      // Nowe pola
      witness_id: document.getElementById('witness_id').value || null,
      source_url: document.getElementById('source_url').value,
      social_profile: document.getElementById('social_profile').value,
      social_platform: document.getElementById('social_platform').value,
      related_emails: document.getElementById('related_emails').value,
      related_phones: document.getElementById('related_phones').value,
      // Poszlaki
      circumstantial_type: document.getElementById('circumstantial_type')?.value || null,
      circumstantial_strength: document.getElementById('circumstantial_strength')?.value || null,
      circumstantial_connections: document.getElementById('circumstantial_connections')?.value || null,
      alternative_explanations: document.getElementById('alternative_explanations')?.value || null,
      // Zeznanie (tylko ID)
      testimony_id: document.getElementById('testimony_id')?.value || null
    };
    
    // Załączniki - konwersja do base64
    const filesInput = document.getElementById('evidence_files');
    let attachments = [];
    
    console.log('📎 Sprawdzam załączniki...');
    console.log('   - filesInput:', filesInput);
    console.log('   - filesInput.files:', filesInput ? filesInput.files : 'null');
    console.log('   - liczba plików:', filesInput ? filesInput.files.length : 0);
    
    if (filesInput && filesInput.files.length > 0) {
      console.log(`📎 Przetwarzam ${filesInput.files.length} załączników...`);
      attachments = await this.convertFilesToBase64(filesInput.files);
      console.log(`✅ Przekonwertowano ${attachments.length} załączników`);
    }
    
    // Dokumenty z systemu - przekaż tylko ID, nie kopiuj plików
    if (this.selectedSystemDocs && this.selectedSystemDocs.length > 0) {
      console.log(`🔗 Linkuję ${this.selectedSystemDocs.length} dokumentów z systemu (bez kopiowania)...`);
      formData.systemDocIds = this.selectedSystemDocs.map(doc => doc.id);
    } else {
      console.log('📂 Brak dokumentów z systemu do zlinkowania');
    }
    
    // Załączniki zeznania - pobierz zaznaczone checkboxy
    const allTestimonyCheckboxes = document.querySelectorAll('input[name="testimony_attachments"]');
    console.log(`📎 Wszystkie checkboxy załączników zeznania: ${allTestimonyCheckboxes.length}`);
    
    const testimonyAttachmentCheckboxes = document.querySelectorAll('input[name="testimony_attachments"]:checked');
    console.log(`📎 Zaznaczone checkboxy: ${testimonyAttachmentCheckboxes.length}`);
    
    if (testimonyAttachmentCheckboxes.length > 0) {
      const testimonyAttachmentIds = Array.from(testimonyAttachmentCheckboxes).map(cb => {
        console.log(`   - checkbox value: ${cb.value}, checked: ${cb.checked}`);
        return cb.value;
      });
      console.log(`📎 Wybrano ${testimonyAttachmentIds.length} załączników zeznania:`, testimonyAttachmentIds);
      formData.testimonyAttachmentIds = testimonyAttachmentIds;
    } else {
      console.log('📎 Brak zaznaczonych załączników zeznania');
    }
    
    if (attachments.length > 0) {
      formData.attachments = attachments;
      console.log('📎 Załączniki do wysłania:', attachments.length);
      attachments.forEach((a, i) => {
        console.log(`   ${i+1}. ${a.filename} - ${a.size} bytes, type: ${a.mimetype}`);
      });
    } else {
      console.log('⚠️ Brak załączników do wysłania');
    }
    
    console.log('📤 Wysyłam formData:');
    console.log('   - testimonyAttachmentIds w formData:', formData.testimonyAttachmentIds);
    console.log('   - wszystkie klucze:', Object.keys(formData));
    
    // Wyczyść wybrane dokumenty
    this.selectedSystemDocs = [];
    
    try {
      console.log('🚀 Wysyłam żądanie POST /evidence...');
      console.log('📦 Rozmiar danych:', JSON.stringify(formData).length, 'znaków');
      
      const result = await window.api.request('/evidence', {
        method: 'POST',
        body: formData
      });
      console.log('✅ Odpowiedź serwera:', result);
      
      document.getElementById('evidenceFormModal').remove();
      window.showNotification('✅ Dowód dodany pomyślnie', 'success');
      this.renderTab(caseId);
      
      // Event Bus
      if (window.eventBus) {
        window.eventBus.emit('evidence:created', { caseId, evidence: formData });
      }
    } catch (error) {
      console.error('❌ Błąd zapisu dowodu:', error);
      console.error('❌ Szczegóły błędu:', error.message, error.stack);
      alert('Błąd zapisu: ' + error.message);
    }
  },
  
  // === SZCZEGÓŁY DOWODU ===
  
  async viewDetails(evidenceId) {
    try {
      const response = await window.api.request(`/evidence/${evidenceId}`);
      const evidence = response.evidence || response;
      
      if (!evidence || !evidence.id) {
        console.error('❌ Brak danych dowodu:', response);
        alert('Nie można pobrać danych dowodu');
        return;
      }
      
      // Zabezpiecz przed undefined
      const attachments = evidence.attachments || [];
      
      console.log('📦 Szczegóły dowodu:', evidence);
      console.log(`📎 Liczba załączników: ${attachments.length}`);
      
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
          
          <div style="padding: 30px; color: #000;">
            <style>
              #evidenceDetailsModal, #evidenceDetailsModal * {
                color: #000;
              }
              #evidenceDetailsModal h2, #evidenceDetailsModal h3, #evidenceDetailsModal p {
                color: inherit;
              }
            </style>
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
                  Załączniki dowodu ${attachments.length > 0 ? `(${attachments.length})` : ''}
                </h3>
                ${attachments.length > 0 ? `
                  <div style="background: #3B82F6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 1rem;">
                    ${attachments.length} ${attachments.length === 1 ? 'plik' : attachments.length < 5 ? 'pliki' : 'plików'}
                  </div>
                ` : ''}
              </div>
              
              ${attachments.length > 0 ? `
                <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <div style="color: #2e7d32 !important; font-weight: 600 !important; margin-bottom: 8px; font-size: 0.95rem !important;">💡 Dla AI i analizy strategicznej:</div>
                  <div style="color: #1b5e20 !important; font-size: 0.9rem !important; line-height: 1.6;">
                    Te pliki mogą być analizowane przez AI w celu:<br>
                    • Ekstrakcji kluczowych informacji z dokumentów<br>
                    • Rozpoznawania wzorców i powiązań<br>
                    • Sugerowania optymalnej strategii procesowej<br>
                    • Identyfikacji mocnych i słabych punktów
                  </div>
                </div>
                ${attachments.map((att, index) => `
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
                            <div style="font-weight: 700 !important; color: #1a2332 !important; font-size: 1.1rem !important;">${att.filename}</div>
                          </div>
                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem !important; color: #666 !important; text-transform: uppercase; letter-spacing: 0.5px;">Rozmiar</div>
                              <div style="font-weight: 600 !important; color: #1a2332 !important; font-size: 0.95rem !important;">${(att.filesize / 1024).toFixed(1)} KB</div>
                            </div>
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem !important; color: #666 !important; text-transform: uppercase; letter-spacing: 0.5px;">Typ</div>
                              <div style="font-weight: 600 !important; color: #1a2332 !important; font-size: 0.95rem !important;">${att.mimetype.split('/')[1].toUpperCase()}</div>
                            </div>
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem !important; color: #666 !important; text-transform: uppercase; letter-spacing: 0.5px;">Format</div>
                              <div style="font-weight: 600 !important; color: #1a2332 !important; font-size: 0.95rem !important;">${att.filename.split('.').pop().toUpperCase()}</div>
                            </div>
                            <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 6px;">
                              <div style="font-size: 0.75rem !important; color: #666 !important; text-transform: uppercase; letter-spacing: 0.5px;">Data dodania</div>
                              <div style="font-weight: 600 !important; color: #1a2332 !important; font-size: 0.95rem !important;">${att.uploaded_at ? new Date(att.uploaded_at).toLocaleDateString('pl-PL') : 'Nieznana'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button data-attachment-id="${att.id}" data-filename="${encodeURIComponent(att.filename || 'plik')}" class="download-attachment-btn"
                           style="padding: 12px 20px; background: linear-gradient(135deg, #3B82F6, #66bb6a); color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; text-align: center; box-shadow: 0 4px 12px rgba(76,175,80,0.3); transition: all 0.3s; cursor: pointer;"
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(76,175,80,0.4)'"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(76,175,80,0.3)'">
                          ⬇️ Pobierz
                        </button>
                        ${att.mimetype && (att.mimetype.includes('image') || att.mimetype.includes('video') || att.mimetype.includes('audio')) ? `
                          <button data-attachment-id="${att.id}" data-filename="${encodeURIComponent(att.filename || 'plik')}" data-mimetype="${att.mimetype}" class="preview-attachment-btn"
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
                  <div style="font-size: 1.1rem !important; font-weight: 600 !important; color: #1a2332 !important; margin-bottom: 8px;">Brak załączników</div>
                  <div style="color: #555 !important; font-size: 0.9rem !important;">Ten dowód nie ma jeszcze żadnych załączonych plików</div>
                </div>
              `}
            </div>
            
            ${evidence.linkedDocuments && evidence.linkedDocuments.length > 0 ? `
              <div style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border: 3px solid #2196F3; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <h3 style="margin: 0; color: #1565C0; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">🔗</span>
                    Zlinkowane dokumenty z systemu
                  </h3>
                  <div style="background: #2196F3; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 1rem;">
                    ${evidence.linkedDocuments.length} ${evidence.linkedDocuments.length === 1 ? 'dokument' : evidence.linkedDocuments.length < 5 ? 'dokumenty' : 'dokumentów'}
                  </div>
                </div>
                ${evidence.linkedDocuments.map((doc, index) => `
                  <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 2px solid #90CAF9; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                      <div style="background: #2196F3; width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                        📄
                      </div>
                      <div>
                        <div style="font-weight: 700 !important; color: #1a2332 !important; font-size: 1rem !important;">${doc.filename || doc.attachment_code || 'Załącznik #' + (index + 1)}</div>
                        <div style="font-size: 0.85rem !important; color: #333 !important;">
                          ${doc.source_type === 'document' ? '📁 Dokument sprawy' : '📎 Załącznik świadka'} 
                          ${doc.filesize ? `• ${(doc.filesize / 1024).toFixed(1)} KB` : ''}
                        </div>
                      </div>
                    </div>
                    <button data-doc-id="${doc.document_id || doc.attachment_id}" data-source-type="${doc.source_type}" data-filename="${encodeURIComponent(doc.filename || 'plik')}" class="view-linked-doc-btn"
                            style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                      👁️ Podgląd
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
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
      
      // Dodaj event listenery dla przycisków pobierania i podglądu
      modal.querySelectorAll('.download-attachment-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.attachmentId;
          const filename = decodeURIComponent(btn.dataset.filename);
          this.downloadAttachment(id, filename);
        };
      });
      
      modal.querySelectorAll('.preview-attachment-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.attachmentId;
          const filename = decodeURIComponent(btn.dataset.filename);
          const mimetype = btn.dataset.mimetype || 'application/octet-stream';
          this.previewAttachment(id, filename, mimetype);
        };
      });
      
      // Event listener dla zlinkowanych dokumentów
      modal.querySelectorAll('.view-linked-doc-btn').forEach(btn => {
        btn.onclick = () => {
          const docId = btn.dataset.docId;
          const sourceType = btn.dataset.sourceType;
          const filename = decodeURIComponent(btn.dataset.filename);
          this.viewLinkedDocument(docId, sourceType, filename);
        };
      });
    } catch (error) {
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
  
  // === EDYCJA DOWODU ===
  async showEditForm(evidenceId) {
    console.log('📝 Otwieranie formularza edycji dowodu:', evidenceId);
    
    try {
      // Pobierz aktualne dane dowodu
      const response = await window.api.request(`/evidence/${evidenceId}`);
      console.log('📝 Odpowiedź z API:', response);
      
      const evidence = response.evidence || response;
      
      if (!evidence || !evidence.id) {
        console.error('❌ Brak danych dowodu:', response);
        alert('Nie można pobrać danych dowodu');
        return;
      }
      
      // Zabezpiecz przed undefined
      const attachments = evidence.attachments || [];
      
      // Zapisz caseId
      this.currentCaseId = evidence.case_id;
      this.editingEvidenceId = evidenceId;
      this.selectedSystemDocs = [];
      
      const modal = document.createElement('div');
      modal.id = 'evidenceEditModal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; justify-content: center; align-items: flex-start; padding: 20px; overflow-y: auto;';
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; width: 90vw; max-width: 900px; margin: 20px auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #e67e22, #d35400); padding: 25px; border-radius: 16px 16px 0 0; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="margin: 0;">✏️ Edycja dowodu</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">${evidence.evidence_code}</p>
              </div>
              <button onclick="document.getElementById('evidenceEditModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">✕</button>
            </div>
          </div>
          
          <div style="padding: 30px; max-height: 70vh; overflow-y: auto; color: #000;">
            <style>
              #evidenceEditModal input, #evidenceEditModal select, #evidenceEditModal textarea {
                color: #000 !important;
                background: #fff !important;
              }
              #evidenceEditModal option, #evidenceEditModal optgroup {
                color: #000 !important;
                background: #fff !important;
              }
            </style>
            <!-- PODSTAWOWE INFORMACJE -->
            <div style="background: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1565c0;">📋 Podstawowe informacje</h3>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Nazwa dowodu *</label>
                <input type="text" id="edit_evidence_name" value="${window.crmManager.escapeHtml(evidence.name || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; color: #000; background: #fff;">
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Typ dowodu *</label>
                  <select id="edit_evidence_type" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <optgroup label="📦 Tradycyjne">
                      <option value="physical" ${evidence.evidence_type === 'physical' ? 'selected' : ''}>📦 Dowód rzeczowy</option>
                      <option value="document" ${evidence.evidence_type === 'document' ? 'selected' : ''}>📄 Dokument papierowy</option>
                      <option value="invoice_sales" ${evidence.evidence_type === 'invoice_sales' ? 'selected' : ''}>💰 Faktura sprzedażowa</option>
                      <option value="invoice_cost" ${evidence.evidence_type === 'invoice_cost' ? 'selected' : ''}>💸 Faktura kosztowa</option>
                      <option value="invoice_vat" ${evidence.evidence_type === 'invoice_vat' ? 'selected' : ''}>🧾 Faktura VAT / zbiorcza</option>
                      <option value="testimony" ${evidence.evidence_type === 'testimony' ? 'selected' : ''}>🗣️ Zeznanie świadka</option>
                      <option value="expert" ${evidence.evidence_type === 'expert' ? 'selected' : ''}>🎓 Opinia biegłego</option>
                      <option value="protocol" ${evidence.evidence_type === 'protocol' ? 'selected' : ''}>📝 Protokół</option>
                    </optgroup>
                    <optgroup label="📱 Cyfrowe / Komunikacja">
                      <option value="email" ${evidence.evidence_type === 'email' ? 'selected' : ''}>📧 Email</option>
                      <option value="whatsapp" ${evidence.evidence_type === 'whatsapp' ? 'selected' : ''}>💬 WhatsApp</option>
                      <option value="messenger" ${evidence.evidence_type === 'messenger' ? 'selected' : ''}>💬 Messenger</option>
                      <option value="sms" ${evidence.evidence_type === 'sms' ? 'selected' : ''}>📱 SMS</option>
                      <option value="social_media" ${evidence.evidence_type === 'social_media' ? 'selected' : ''}>📱 Social Media Post</option>
                      <option value="online_correspondence" ${evidence.evidence_type === 'online_correspondence' ? 'selected' : ''}>🌐 Korespondencja online</option>
                    </optgroup>
                    <optgroup label="🎥 Multimedia">
                      <option value="recording" ${evidence.evidence_type === 'recording' ? 'selected' : ''}>🎥 Nagranie wideo</option>
                      <option value="audio" ${evidence.evidence_type === 'audio' ? 'selected' : ''}>🎤 Nagranie audio</option>
                      <option value="photo" ${evidence.evidence_type === 'photo' ? 'selected' : ''}>📸 Zdjęcie</option>
                      <option value="screenshot" ${evidence.evidence_type === 'screenshot' ? 'selected' : ''}>📱 Screenshot</option>
                      <option value="screen_recording" ${evidence.evidence_type === 'screen_recording' ? 'selected' : ''}>📹 Nagranie ekranu</option>
                    </optgroup>
                    <optgroup label="🔬 Badania">
                      <option value="forensic" ${evidence.evidence_type === 'forensic' ? 'selected' : ''}>🔬 Badania kryminalistyczne</option>
                      <option value="dna" ${evidence.evidence_type === 'dna' ? 'selected' : ''}>🧬 Badanie DNA</option>
                      <option value="medical" ${evidence.evidence_type === 'medical' ? 'selected' : ''}>🏥 Badanie medyczne</option>
                      <option value="expert_research" ${evidence.evidence_type === 'expert_research' ? 'selected' : ''}>📊 Badanie eksperckie</option>
                    </optgroup>
                    <optgroup label="📋 Inne">
                      <option value="circumstantial" ${evidence.evidence_type === 'circumstantial' ? 'selected' : ''}>🔍 Poszlaka</option>
                      <option value="other" ${evidence.evidence_type === 'other' ? 'selected' : ''}>📋 Inne</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Znaczenie</label>
                  <select id="edit_significance" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <option value="supporting" ${evidence.significance === 'supporting' ? 'selected' : ''}>✅ Wspierający</option>
                    <option value="important" ${evidence.significance === 'important' ? 'selected' : ''}>⭐ Ważny</option>
                    <option value="crucial" ${evidence.significance === 'crucial' ? 'selected' : ''}>🔥 Kluczowy</option>
                    <option value="neutral" ${evidence.significance === 'neutral' ? 'selected' : ''}>➖ Neutralny</option>
                  </select>
                </div>
              </div>
              
              <div style="margin-top: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Opis</label>
                <textarea id="edit_description" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">${window.crmManager.escapeHtml(evidence.description || '')}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📅 Data uzyskania</label>
                  <input type="date" id="edit_obtained_date" value="${evidence.obtained_date || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📍 Źródło</label>
                  <input type="text" id="edit_obtained_from" value="${window.crmManager.escapeHtml(evidence.obtained_from || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Od kogo/skąd">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">🔧 Sposób uzyskania</label>
                  <input type="text" id="edit_obtained_method" value="${window.crmManager.escapeHtml(evidence.obtained_method || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Przekazanie, przeszukanie...">
                </div>
              </div>
            </div>
            
            <!-- LINKI I ODNOŚNIKI -->
            <div style="background: #e1f5fe; border: 2px solid #03a9f4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #01579b;">🔗 Linki i odnośniki cyfrowe</h3>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">🌐 Link do źródła online (URL)</label>
                <input type="url" id="edit_source_url" value="${window.crmManager.escapeHtml(evidence.source_url || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="https://...">
                <small style="color: #666; display: block; margin-top: 5px;">Strona www, artykuł online, post w mediach społecznościowych</small>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📱 Link do profilu social media</label>
                  <input type="url" id="edit_social_profile" value="${window.crmManager.escapeHtml(evidence.social_profile || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Facebook, Instagram, Twitter...">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Platforma</label>
                  <select id="edit_social_platform" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <option value="">-- Wybierz --</option>
                    <option value="facebook" ${evidence.social_platform === 'facebook' ? 'selected' : ''}>📘 Facebook</option>
                    <option value="instagram" ${evidence.social_platform === 'instagram' ? 'selected' : ''}>📸 Instagram</option>
                    <option value="twitter" ${evidence.social_platform === 'twitter' ? 'selected' : ''}>🐦 Twitter/X</option>
                    <option value="linkedin" ${evidence.social_platform === 'linkedin' ? 'selected' : ''}>💼 LinkedIn</option>
                    <option value="tiktok" ${evidence.social_platform === 'tiktok' ? 'selected' : ''}>🎵 TikTok</option>
                    <option value="youtube" ${evidence.social_platform === 'youtube' ? 'selected' : ''}>📹 YouTube</option>
                    <option value="whatsapp" ${evidence.social_platform === 'whatsapp' ? 'selected' : ''}>💬 WhatsApp</option>
                    <option value="telegram" ${evidence.social_platform === 'telegram' ? 'selected' : ''}>✈️ Telegram</option>
                    <option value="other" ${evidence.social_platform === 'other' ? 'selected' : ''}>🌐 Inne</option>
                  </select>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📧 Powiązane emaile</label>
                  <input type="text" id="edit_related_emails" value="${window.crmManager.escapeHtml(evidence.related_emails || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="email1@..., email2@...">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📞 Powiązane telefony</label>
                  <input type="text" id="edit_related_phones" value="${window.crmManager.escapeHtml(evidence.related_phones || '')}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="+48 123 456 789">
                </div>
              </div>
            </div>
            
            <!-- ŚWIADEK I ZEZNANIA -->
            <div style="background: #f3e5f5; border: 2px solid #9c27b0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #4a148c;">👤 Powiązanie ze świadkiem i zeznaniami</h3>
              
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">Świadek (opcjonalnie)</label>
                <select id="edit_witness_id" style="width: 100%; padding: 14px; border: 2px solid #9c27b0; border-radius: 6px; font-size: 1rem; background: white;">
                  <option value="">-- Brak powiązania --</option>
                  <option value="loading">⏳ Ładowanie świadków...</option>
                </select>
                <small style="color: #666; display: block; margin-top: 5px;">Wybierz świadka jeśli ten dowód pochodzi od niego lub dotyczy jego zeznań</small>
              </div>
              
              <!-- WYBÓR ZEZNANIA -->
              <div id="edit_testimony_section" style="background: rgba(156, 39, 176, 0.08); border: 2px dashed #9c27b0; border-radius: 8px; padding: 20px; margin-top: 15px; display: none;">
                <h4 style="margin: 0 0 15px 0; color: #4a148c;">📝 Wybierz zeznanie świadka</h4>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">Istniejące zeznania świadka</label>
                  <select id="edit_testimony_id" style="width: 100%; padding: 14px; border: 2px solid #9c27b0; border-radius: 6px; font-size: 1rem; background: white;">
                    <option value="">-- Brak powiązania z zeznaniem --</option>
                  </select>
                  <small style="color: #666; display: block; margin-top: 5px;">
                    📌 Zeznania są tworzone w zakładce <strong>Świadkowie</strong><br>
                    💡 Wybierz zeznanie aby powiązać je z tym dowodem
                  </small>
                </div>
              </div>
              
              <!-- WYBÓR ZAŁĄCZNIKÓW ZEZNANIA (pokazuje się gdy wybrano zeznanie) -->
              <div id="edit_witness_attachments_section" style="background: rgba(76, 175, 80, 0.08); border: 2px dashed #4CAF50; border-radius: 8px; padding: 20px; margin-top: 15px; display: none;">
                <h4 style="margin: 0 0 15px 0; color: #2e7d32;">📎 Załączniki i dokumenty świadka</h4>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; color: #1a2332;">Wszystkie pliki powiązane ze świadkiem</label>
                  <div id="edit_witness_attachments_list" style="background: white; border: 2px solid #4CAF50; border-radius: 6px; padding: 15px; min-height: 60px; max-height: 400px; overflow-y: auto;">
                    <small style="color: #999;">Wybierz zeznanie aby zobaczyć pliki świadka</small>
                  </div>
                  <small style="color: #666; display: block; margin-top: 8px;">
                    📌 Lista zawiera: załączniki zeznania, dokumenty świadka (DOK/SWI/ZEZ), załączniki świadka (ZAL)<br>
                    💡 Możesz przeglądać pliki klikając "👁️ Podgląd"
                  </small>
                </div>
              </div>
            </div>
            
            <!-- POSZLAKI (gdy typ = circumstantial) -->
            <div id="edit_circumstantial_section" style="background: #fff9c4; border: 2px solid #fbc02d; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: ${evidence.evidence_type === 'circumstantial' ? 'block' : 'none'};">
              <h3 style="margin: 0 0 15px 0; color: #f57f17;">🔍 Szczegóły poszlaki</h3>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Typ poszlaki</label>
                <select id="edit_circumstantial_type" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                  <option value="behavioral" ${evidence.circumstantial_type === 'behavioral' ? 'selected' : ''}>🚶 Behawioralna (zachowanie)</option>
                  <option value="temporal" ${evidence.circumstantial_type === 'temporal' ? 'selected' : ''}>⏰ Czasowa (zbieg okoliczności)</option>
                  <option value="spatial" ${evidence.circumstantial_type === 'spatial' ? 'selected' : ''}>📍 Przestrzenna (miejsce)</option>
                  <option value="material" ${evidence.circumstantial_type === 'material' ? 'selected' : ''}>🔨 Materialna (ślad, obiekt)</option>
                  <option value="testimonial" ${evidence.circumstantial_type === 'testimonial' ? 'selected' : ''}>💬 Świadectwo pośrednie</option>
                  <option value="digital" ${evidence.circumstantial_type === 'digital' ? 'selected' : ''}>💻 Cyfrowa (metadata, logi)</option>
                  <option value="financial" ${evidence.circumstantial_type === 'financial' ? 'selected' : ''}>💰 Finansowa (transakcje)</option>
                  <option value="other" ${evidence.circumstantial_type === 'other' ? 'selected' : ''}>📋 Inna</option>
                </select>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Siła dowodowa poszlaki</label>
                <select id="edit_circumstantial_strength" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                  <option value="weak" ${evidence.circumstantial_strength === 'weak' ? 'selected' : ''}>⚪ Słaba (wymaga dodatkowych dowodów)</option>
                  <option value="moderate" ${evidence.circumstantial_strength === 'moderate' ? 'selected' : ''}>🟡 Umiarkowana</option>
                  <option value="strong" ${evidence.circumstantial_strength === 'strong' ? 'selected' : ''}>🟠 Silna</option>
                  <option value="conclusive" ${evidence.circumstantial_strength === 'conclusive' ? 'selected' : ''}>🔴 Przekonująca (niemal przesądzająca)</option>
                </select>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Powiązanie z innymi dowodami</label>
                <textarea id="edit_circumstantial_connections" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jak ta poszlaka łączy się z innymi dowodami?">${window.crmManager.escapeHtml(evidence.circumstantial_connections || '')}</textarea>
              </div>
              
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Alternatywne wyjaśnienia</label>
                <textarea id="edit_alternative_explanations" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jakie inne wyjaśnienia są możliwe?">${window.crmManager.escapeHtml(evidence.alternative_explanations || '')}</textarea>
                <small style="color: #666; display: block; margin-top: 5px;">⚠️ Ważne: zawsze rozważ alternatywne interpretacje poszlak!</small>
              </div>
            </div>
            
            <!-- ANALIZA STRATEGICZNA -->
            <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #e65100;">🎯 Analiza strategiczna</h3>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">✅ Mocne strony dowodu</label>
                <textarea id="edit_strengths" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Co przemawia na korzyść tego dowodu?">${window.crmManager.escapeHtml(evidence.strengths || '')}</textarea>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">⚠️ Słabości / Zagrożenia</label>
                <textarea id="edit_weaknesses" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jakie są potencjalne zarzuty strony przeciwnej?">${window.crmManager.escapeHtml(evidence.weaknesses || '')}</textarea>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">🎯 Plan wykorzystania</label>
                <textarea id="edit_usage_strategy" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Jak zamierzamy wykorzystać ten dowód?">${window.crmManager.escapeHtml(evidence.usage_strategy || '')}</textarea>
              </div>
              
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">📝 Notatki</label>
                <textarea id="edit_notes" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;" placeholder="Dodatkowe uwagi...">${window.crmManager.escapeHtml(evidence.notes || '')}</textarea>
              </div>
            </div>
            
            <!-- ZAŁĄCZNIKI -->
            <div style="background: linear-gradient(135deg, #F8FAFC, #E2E8F0); border: 3px solid #3B82F6; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1b5e20; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 2rem;">📎</span>
                Załączniki (${attachments.length} istniejących)
              </h3>
              
              ${attachments.length > 0 ? `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <strong>Istniejące załączniki:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    ${attachments.map(att => `<li>${att.filename} (${(att.filesize / 1024).toFixed(1)} KB)</li>`).join('')}
                  </ul>
                </div>
              ` : `
                <div style="background: rgba(255,255,255,0.6); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 15px;">
                  <div style="font-size: 2rem; opacity: 0.5;">📎</div>
                  <div style="color: #666;">Brak załączników</div>
                </div>
              `}
              
              <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <button type="button" onclick="evidenceModule.showSystemDocumentsForEdit(${evidence.case_id})" style="padding: 12px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  📂 Wybierz z dokumentów sprawy
                </button>
                <div>
                  <input type="file" id="edit_evidence_files" multiple style="display: none;" onchange="evidenceModule.handleEditFileSelect(this.files)">
                  <button type="button" onclick="document.getElementById('edit_evidence_files').click()" style="padding: 12px 20px; background: #9c27b0; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    📤 Wgraj nowe pliki
                  </button>
                </div>
              </div>
              
              <div id="editSelectedFiles" style="margin-top: 15px;"></div>
              
              <!-- Wybrane dokumenty z systemu -->
              <div id="selected_system_docs" style="margin-top: 15px; display: none;">
                <strong style="color: #9c27b0;">📂 Wybrane dokumenty z systemu:</strong>
                <div id="system_docs_list" style="max-height: 150px; overflow-y: auto; margin-top: 10px;"></div>
              </div>
            </div>
            
            <!-- OCENA -->
            <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1b5e20;">⭐ Ocena</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Wiarygodność (1-10)</label>
                  <input type="number" id="edit_credibility_score" min="1" max="10" value="${evidence.credibility_score || 5}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Dopuszczalność</label>
                  <select id="edit_admissibility" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <option value="pending" ${evidence.admissibility === 'pending' ? 'selected' : ''}>⏳ Oczekujący</option>
                    <option value="admissible" ${evidence.admissibility === 'admissible' ? 'selected' : ''}>✅ Dopuszczony</option>
                    <option value="contested" ${evidence.admissibility === 'contested' ? 'selected' : ''}>⚠️ Kwestionowany</option>
                    <option value="rejected" ${evidence.admissibility === 'rejected' ? 'selected' : ''}>❌ Odrzucony</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">Status</label>
                  <select id="edit_status" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    <option value="secured" ${evidence.status === 'secured' ? 'selected' : ''}>🔒 Zabezpieczony</option>
                    <option value="catalogued" ${evidence.status === 'catalogued' ? 'selected' : ''}>📋 Skatalogowany</option>
                    <option value="presented" ${evidence.status === 'presented' ? 'selected' : ''}>📤 Przedstawiony</option>
                    <option value="accepted" ${evidence.status === 'accepted' ? 'selected' : ''}>✅ Przyjęty</option>
                    <option value="rejected" ${evidence.status === 'rejected' ? 'selected' : ''}>❌ Odrzucony</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- PRZYCISKI -->
            <div style="display: flex; gap: 15px; margin-top: 20px;">
              <button onclick="document.getElementById('evidenceEditModal').remove()" style="flex: 1; padding: 15px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                ❌ Anuluj
              </button>
              <button onclick="evidenceModule.saveEditedEvidence(${evidenceId})" style="flex: 2; padding: 15px; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                💾 Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Załaduj świadków
      this.loadWitnessesForEditSelect(evidence.case_id, evidence.witness_id);
      
      // Pokaż sekcję poszlak gdy wybrano typ "circumstantial"
      document.getElementById('edit_evidence_type').addEventListener('change', (e) => {
        const circumstantialSection = document.getElementById('edit_circumstantial_section');
        if (e.target.value === 'circumstantial') {
          circumstantialSection.style.display = 'block';
        } else {
          circumstantialSection.style.display = 'none';
        }
      });
      
      // Pokaż sekcję zeznania gdy wybrano świadka
      document.getElementById('edit_witness_id').addEventListener('change', async (e) => {
        const testimonySection = document.getElementById('edit_testimony_section');
        const attachmentsSection = document.getElementById('edit_witness_attachments_section');
        const selectedWitnessId = e.target.value;
        
        if (selectedWitnessId && selectedWitnessId !== 'loading' && selectedWitnessId !== '') {
          testimonySection.style.display = 'block';
          attachmentsSection.style.display = 'none'; // Ukryj - pokaże się po wybraniu zeznania
          this.editWitnessId = selectedWitnessId; // Zapisz ID świadka
          await this.loadTestimoniesForEditSelect(selectedWitnessId, evidence.testimony_id);
          // Wyczyść listę załączników
          const listDiv = document.getElementById('edit_witness_attachments_list');
          if (listDiv) {
            listDiv.innerHTML = '<small style="color: #999;">Wybierz zeznanie aby zobaczyć pliki świadka</small>';
          }
        } else {
          testimonySection.style.display = 'none';
          attachmentsSection.style.display = 'none';
          this.editWitnessId = null;
        }
      });
      
      // Podgląd wybranego zeznania + załaduj załączniki zeznania (EDYCJA)
      document.getElementById('edit_testimony_id').addEventListener('change', async (e) => {
        const testimonyId = e.target.value;
        const attachmentsSection = document.getElementById('edit_witness_attachments_section');
        
        if (testimonyId) {
          attachmentsSection.style.display = 'block';
          // Użyj tej samej funkcji co w dodawaniu, ale z innym ID kontenera
          const originalContainerId = 'witness_attachments_list';
          const editContainerId = 'edit_witness_attachments_list';
          
          // Tymczasowo podmień ID kontenera
          const editContainer = document.getElementById(editContainerId);
          if (editContainer) {
            editContainer.id = originalContainerId;
            await this.loadTestimonyAttachments(testimonyId, evidence.case_id);
            editContainer.id = editContainerId; // Przywróć oryginalne ID
          }
        } else {
          attachmentsSection.style.display = 'none';
        }
      });
      
      // Jeśli dowód ma świadka, pokaż sekcję zeznań
      if (evidence.witness_id) {
        this.editWitnessId = evidence.witness_id; // Zapisz ID świadka
        document.getElementById('edit_testimony_section').style.display = 'block';
        await this.loadTestimoniesForEditSelect(evidence.witness_id, evidence.testimony_id);
        
        // Jeśli ma też zeznanie, załaduj załączniki
        if (evidence.testimony_id) {
          const attachmentsSection = document.getElementById('edit_witness_attachments_section');
          attachmentsSection.style.display = 'block';
          
          // Użyj tej samej funkcji co w dodawaniu
          const editContainer = document.getElementById('edit_witness_attachments_list');
          if (editContainer) {
            editContainer.id = 'witness_attachments_list';
            await this.loadTestimonyAttachments(evidence.testimony_id, evidence.case_id);
            editContainer.id = 'edit_witness_attachments_list';
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Błąd ładowania danych dowodu:', error);
      alert('Błąd: ' + error.message);
    }
  },
  
  // Załaduj świadków do selecta w edycji
  async loadWitnessesForEditSelect(caseId, selectedWitnessId) {
    try {
      const response = await window.api.request(`/witnesses?case_id=${caseId}`);
      const witnesses = response.witnesses || [];
      
      const selectElement = document.getElementById('edit_witness_id');
      if (!selectElement) return;
      
      selectElement.innerHTML = '<option value="">-- Brak powiązania --</option>';
      
      witnesses.forEach(witness => {
        const option = document.createElement('option');
        option.value = witness.id;
        option.textContent = `${witness.first_name} ${witness.last_name} (${witness.witness_type || 'świadek'})`;
        if (witness.id == selectedWitnessId) {
          option.selected = true;
        }
        selectElement.appendChild(option);
      });
      
      if (witnesses.length === 0) {
        selectElement.innerHTML = '<option value="">-- Brak świadków w sprawie --</option>';
      }
    } catch (error) {
      console.error('❌ Błąd ładowania świadków:', error);
    }
  },
  
  // Załaduj zeznania świadka do selecta w edycji
  async loadTestimoniesForEditSelect(witnessId, selectedTestimonyId) {
    try {
      const response = await window.api.request(`/witnesses/${witnessId}/testimonies`);
      const testimonies = response.testimonies || [];
      
      const selectElement = document.getElementById('edit_testimony_id');
      if (!selectElement) return;
      
      selectElement.innerHTML = '<option value="">-- Brak powiązania z zeznaniem --</option>';
      
      testimonies.forEach(testimony => {
        const option = document.createElement('option');
        option.value = testimony.id;
        
        const date = testimony.testimony_date ? new Date(testimony.testimony_date).toLocaleDateString('pl-PL') : 'Brak daty';
        const type = this.getTestimonyTypeLabel(testimony.testimony_type);
        const code = testimony.testimony_code || `ID:${testimony.id}`;
        
        option.textContent = `${code} - ${type} - ${date}`;
        if (testimony.id == selectedTestimonyId) {
          option.selected = true;
        }
        selectElement.appendChild(option);
      });
      
      if (testimonies.length === 0) {
        selectElement.innerHTML = '<option value="">-- Brak zeznań dla tego świadka --</option>';
      }
    } catch (error) {
      console.error('❌ Błąd ładowania zeznań:', error);
    }
  },
  
  // Obsługa plików w edycji
  handleEditFileSelect(files) {
    if (!files || files.length === 0) return;
    
    const container = document.getElementById('editSelectedFiles');
    if (!container) return;
    
    // Inicjalizuj tablicę jeśli nie istnieje
    if (!this.editNewFiles) this.editNewFiles = [];
    
    // Dodaj nowe pliki
    Array.from(files).forEach(file => {
      this.editNewFiles.push(file);
    });
    
    // Wyświetl listę
    container.innerHTML = `
      <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #9c27b0;">
        <strong style="color: #9c27b0;">📤 Nowe pliki do dodania (${this.editNewFiles.length}):</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          ${this.editNewFiles.map(f => `<li>${f.name} (${(f.size / 1024).toFixed(1)} KB)</li>`).join('')}
        </ul>
      </div>
    `;
  },
  
  // Wybór dokumentów z systemu dla edycji
  async showSystemDocumentsForEdit(caseId) {
    // Użyj tej samej funkcji co przy dodawaniu
    await this.showSystemDocuments(caseId);
  },
  
  // Zapisz edytowany dowód
  async saveEditedEvidence(evidenceId) {
    const formData = {
      // Podstawowe
      name: document.getElementById('edit_evidence_name').value,
      evidence_type: document.getElementById('edit_evidence_type').value,
      description: document.getElementById('edit_description').value,
      significance: document.getElementById('edit_significance').value,
      // Daty i źródło
      obtained_date: document.getElementById('edit_obtained_date').value,
      obtained_from: document.getElementById('edit_obtained_from').value,
      obtained_method: document.getElementById('edit_obtained_method').value,
      // Linki
      source_url: document.getElementById('edit_source_url').value,
      social_profile: document.getElementById('edit_social_profile').value,
      social_platform: document.getElementById('edit_social_platform').value,
      related_emails: document.getElementById('edit_related_emails').value,
      related_phones: document.getElementById('edit_related_phones').value,
      // Świadek i zeznania
      witness_id: document.getElementById('edit_witness_id').value || null,
      testimony_id: document.getElementById('edit_testimony_id').value || null,
      // Poszlaki
      circumstantial_type: document.getElementById('edit_circumstantial_type').value,
      circumstantial_strength: document.getElementById('edit_circumstantial_strength').value,
      circumstantial_connections: document.getElementById('edit_circumstantial_connections').value,
      alternative_explanations: document.getElementById('edit_alternative_explanations').value,
      // Analiza
      strengths: document.getElementById('edit_strengths').value,
      weaknesses: document.getElementById('edit_weaknesses').value,
      usage_strategy: document.getElementById('edit_usage_strategy').value,
      notes: document.getElementById('edit_notes').value,
      // Ocena
      credibility_score: document.getElementById('edit_credibility_score').value,
      admissibility: document.getElementById('edit_admissibility').value,
      status: document.getElementById('edit_status').value
    };
    
    // Zbierz nowe załączniki
    let attachments = [];
    
    // Pliki wgrane bezpośrednio
    if (this.editNewFiles && this.editNewFiles.length > 0) {
      console.log(`📤 Konwertuję ${this.editNewFiles.length} nowych plików...`);
      attachments = await this.convertFilesToBase64(this.editNewFiles);
    }
    
    // Dokumenty z systemu - przekaż tylko ID, nie kopiuj plików
    if (this.selectedSystemDocs && this.selectedSystemDocs.length > 0) {
      console.log(`📂 Linkuję ${this.selectedSystemDocs.length} dokumentów z systemu...`);
      formData.systemDocIds = this.selectedSystemDocs.map(doc => doc.id);
    }
    
    if (attachments.length > 0) {
      formData.attachments = attachments;
    }
    
    try {
      await window.api.request(`/evidence/${evidenceId}`, {
        method: 'PUT',
        body: formData
      });
      
      // Wyczyść
      this.editNewFiles = [];
      this.selectedSystemDocs = [];
      
      document.getElementById('evidenceEditModal').remove();
      window.showNotification('✅ Dowód zaktualizowany pomyślnie', 'success');
      this.renderTab(this.currentCaseId);
      
    } catch (error) {
      console.error('❌ Błąd zapisu:', error);
      alert('Błąd zapisu: ' + error.message);
    }
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
  
  // === POBIERZ ZAŁĄCZNIK ===
  async downloadAttachment(attachmentId, filename) {
    const token = localStorage.getItem('token');
    const apiBaseUrl = window.api?.baseURL || window.getApiBaseUrl?.() || 'https://web-production-ef868.up.railway.app/api';
    const downloadUrl = `${apiBaseUrl}/attachments/${attachmentId}/download?download=true`;
    
    console.log('⬇️ Pobieranie załącznika:', attachmentId, filename, downloadUrl);
    
    try {
      const response = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Błąd pobierania pliku');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Błąd pobierania:', err);
      alert('Błąd pobierania pliku: ' + err.message);
    }
  },
  
  // === PODGLĄD ZLINKOWANEGO DOKUMENTU ===
  async viewLinkedDocument(docId, sourceType, filename) {
    const token = localStorage.getItem('token');
    const apiBaseUrl = window.api?.baseURL || 'https://web-production-ef868.up.railway.app/api';
    let url;
    
    if (sourceType === 'document') {
      url = `${apiBaseUrl}/documents/download/${docId}`;
    } else {
      url = `${apiBaseUrl}/attachments/${docId}/download`;
    }
    
    console.log('📄 Podgląd zlinkowanego dokumentu:', docId, sourceType, filename, url);
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('❌ Błąd pobierania:', response.status, response.statusText);
        alert(`Nie można pobrać pliku. Plik może nie istnieć na serwerze.\n\nStatus: ${response.status}`);
        return;
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Otwórz w modalu aplikacji
      const modal = document.createElement('div');
      modal.id = 'linkedDocPreviewModal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10003; display: flex; justify-content: center; align-items: center; padding: 20px;';
      
      let contentHtml = '';
      let iconEmoji = '📄';
      
      if (blob.type.includes('image')) {
        iconEmoji = '🖼️';
        contentHtml = `<img src="${objectUrl}" style="max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">`;
      } else if (blob.type.includes('video')) {
        iconEmoji = '🎥';
        contentHtml = `
          <video controls autoplay style="max-width: 90vw; max-height: 85vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <source src="${objectUrl}" type="${blob.type}">
            Twoja przeglądarka nie obsługuje odtwarzania wideo.
          </video>
        `;
      } else if (blob.type.includes('audio')) {
        iconEmoji = '🎵';
        contentHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: white; border-radius: 12px;">
            <div style="font-size: 5rem; margin-bottom: 30px;">🎵</div>
            <audio controls autoplay style="width: 100%; max-width: 500px;">
              <source src="${objectUrl}" type="${blob.type}">
              Twoja przeglądarka nie obsługuje odtwarzania audio.
            </audio>
          </div>
        `;
      } else if (blob.type.includes('pdf')) {
        contentHtml = `<iframe src="${objectUrl}" style="width: 90vw; height: 85vh; border: none; border-radius: 8px;"></iframe>`;
      } else {
        // Dla innych plików - pobierz
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      
      modal.innerHTML = `
        <div style="position: relative; max-width: 95vw; max-height: 95vh; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 15px; background: white; border-radius: 12px;">
            <h3 style="margin: 0; color: #1a2332; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">${iconEmoji}</span>
              ${filename}
            </h3>
            <div style="display: flex; gap: 10px;">
              <button id="downloadLinkedDoc" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                ⬇️ Pobierz
              </button>
              <button id="closeLinkedDocPreview" style="background: #dc3545; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: 600;">✕</button>
            </div>
          </div>
          <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
            ${contentHtml}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Event listeners
      document.getElementById('closeLinkedDocPreview').onclick = () => {
        URL.revokeObjectURL(objectUrl);
        modal.remove();
      };
      
      document.getElementById('downloadLinkedDoc').onclick = () => {
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      
      modal.onclick = (e) => {
        if (e.target === modal) {
          URL.revokeObjectURL(objectUrl);
          modal.remove();
        }
      };
      
    } catch (err) {
      console.error('Błąd podglądu dokumentu:', err);
      alert('Błąd: ' + err.message);
    }
  },
  
  // === PODGLĄD ZAŁĄCZNIKA ===
  async previewAttachment(attachmentId, filename, mimetype) {
    const token = localStorage.getItem('token');
    const apiBaseUrl = window.api?.baseURL || window.getApiBaseUrl?.() || 'https://web-production-ef868.up.railway.app/api';
    const fileUrl = `${apiBaseUrl}/attachments/${attachmentId}/download`;
    
    console.log('👁️ Podgląd załącznika:', attachmentId, filename);
    console.log('   - apiBaseUrl:', apiBaseUrl);
    console.log('   - fileUrl:', fileUrl);
    console.log('   - token:', token ? 'OK' : 'BRAK');
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10002; display: flex; justify-content: center; align-items: center; padding: 20px;';
    
    // Określ typ zawartości
    const isVideo = mimetype && mimetype.includes('video');
    const isAudio = mimetype && mimetype.includes('audio');
    const isImage = mimetype && mimetype.includes('image');
    const iconEmoji = isVideo ? '🎥' : isAudio ? '🎵' : '🖼️';
    
    modal.innerHTML = `
      <div style="position: relative; max-width: 95vw; max-height: 95vh; background: white; border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
          <h3 style="margin: 0; color: #1a2332;">${iconEmoji} ${filename}</h3>
          <button id="closePreviewBtn" style="background: #dc3545; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: 600;">✕</button>
        </div>
        <div id="previewContent" style="flex: 1; overflow: auto; display: flex; justify-content: center; align-items: center; min-height: 300px;">
          <div style="text-align: center; color: #666;">
            <div style="font-size: 2rem; animation: pulse 1.5s infinite;">⏳</div>
            <div>Ładowanie...</div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Obsługa zamknięcia
    document.getElementById('closePreviewBtn').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    try {
      // Pobierz plik z autoryzacją
      const response = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Błąd pobierania: ${response.status}`);
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const contentDiv = document.getElementById('previewContent');
      
      if (blob.type.includes('video')) {
        contentDiv.innerHTML = `
          <video controls autoplay style="max-width: 100%; max-height: 80vh; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <source src="${objectUrl}" type="${blob.type}">
            Twoja przeglądarka nie obsługuje odtwarzania wideo.
          </video>
        `;
      } else if (blob.type.includes('audio')) {
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 5rem; margin-bottom: 20px;">🎵</div>
            <audio controls autoplay style="width: 100%; max-width: 400px;">
              <source src="${objectUrl}" type="${blob.type}">
            </audio>
          </div>
        `;
      } else {
        contentDiv.innerHTML = `
          <img src="${objectUrl}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        `;
      }
    } catch (err) {
      console.error('❌ Błąd ładowania podglądu:', err);
      
      // Automatycznie otwórz w nowej karcie gdy fetch nie działa
      console.log('🔄 Otwieram załącznik w nowej karcie...');
      const token = localStorage.getItem('token');
      const newTabUrl = `${fileUrl}?token=${token}`;
      window.open(newTabUrl, '_blank');
      
      // Zamknij modal
      modal.remove();
    }
    
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


