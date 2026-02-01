/**
 * AttachmentUploader - Uniwersalny komponent do uploadu załączników
 * 
 * Użycie:
 * const uploader = new AttachmentUploader({
 *   caseId: 7,
 *   entityType: 'witness',
 *   entityId: 5,
 *   category: 'zeznanie',
 *   containerId: 'attachments-container',
 *   onSuccess: () => console.log('Załącznik dodany!')
 * });
 * uploader.render();
 */

class AttachmentUploader {
  constructor(config) {
    this.caseId = config.caseId;
    this.entityType = config.entityType;  // 'case', 'witness', 'client', 'comment', etc.
    this.entityId = config.entityId;
    this.category = config.category || 'general';
    this.containerId = config.containerId;
    this.onSuccess = config.onSuccess;
    this.showTitle = config.showTitle !== false; // Domyślnie true
    this.categories = config.categories || this.getDefaultCategories();
    this.showCategorySelect = config.showCategorySelect !== false;
  }
  
  getDefaultCategories() {
    const categoryMap = {
      'case': [
        { value: 'case_document', label: '📄 Dokument sprawy' },
        { value: 'case_evidence', label: '🔍 Dowód' },
        { value: 'case_verdict', label: '⚖️ Wyrok/Orzeczenie' },
        { value: 'case_correspondence', label: '✉️ Korespondencja' },
        { value: 'case_other', label: '📎 Inne' }
      ],
      'witness': [
        { value: 'witness_testimony', label: '📝 Zeznanie' },
        { value: 'witness_statement', label: '📋 Oświadczenie' },
        { value: 'witness_id', label: '🪪 Dokument tożsamości' },
        { value: 'witness_other', label: '📎 Inne' }
      ],
      'client': [
        { value: 'client_contract', label: '📜 Umowa' },
        { value: 'client_id', label: '🪪 Dokument tożsamości' },
        { value: 'client_power_attorney', label: '📋 Pełnomocnictwo' },
        { value: 'client_correspondence', label: '✉️ Korespondencja' },
        { value: 'client_other', label: '📎 Inne' }
      ],
      'comment': [
        { value: 'comment_attachment', label: '📎 Załącznik' },
        { value: 'comment_screenshot', label: '📸 Screenshot' },
        { value: 'comment_document', label: '📄 Dokument' }
      ]
    };
    
    return categoryMap[this.entityType] || [{ value: 'general', label: '📎 Ogólny' }];
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('❌ Container not found:', this.containerId);
      return;
    }
    
    container.innerHTML = `
      <div class="attachment-uploader">
        ${this.showTitle ? '<h4 class="section-title">📎 Załączniki</h4>' : ''}
        
        <!-- Formularz uploadu -->
        <div class="upload-form">
          <div class="form-group">
            <label for="attachment-title-${this.containerId}">Tytuł załącznika *</label>
            <input 
              type="text" 
              id="attachment-title-${this.containerId}" 
              placeholder="np. Pozew o odszkodowanie" 
              required
            >
          </div>
          
          ${this.showCategorySelect ? `
          <div class="form-group">
            <label for="attachment-category-${this.containerId}">Kategoria *</label>
            <select id="attachment-category-${this.containerId}">
              ${this.categories.map(cat => `
                <option value="${cat.value}">${cat.label}</option>
              `).join('')}
            </select>
          </div>
          ` : ''}
          
          <div class="form-group">
            <label for="attachment-description-${this.containerId}">Opis (opcjonalnie)</label>
            <textarea 
              id="attachment-description-${this.containerId}" 
              placeholder="Dodatkowy opis..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="attachment-file-${this.containerId}">Plik *</label>
            <input 
              type="file" 
              id="attachment-file-${this.containerId}" 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              required
            >
            <small class="file-hint">Maksymalny rozmiar: 50MB. Dozwolone: PDF, DOC, DOCX, JPG, PNG, TXT</small>
          </div>
          
          <button 
            id="upload-btn-${this.containerId}" 
            class="btn btn-primary"
          >
            📤 Dodaj załącznik
          </button>
        </div>
        
        <!-- Lista załączników -->
        <div id="attachments-list-${this.containerId}" class="attachments-list">
          <div class="loading">Ładowanie załączników...</div>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
    this.loadAttachments();
  }
  
  setupEventListeners() {
    const uploadBtn = document.getElementById(`upload-btn-${this.containerId}`);
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.uploadAttachment());
    }
  }
  
  async uploadAttachment() {
    const titleInput = document.getElementById(`attachment-title-${this.containerId}`);
    const categoryInput = document.getElementById(`attachment-category-${this.containerId}`);
    const descriptionInput = document.getElementById(`attachment-description-${this.containerId}`);
    const fileInput = document.getElementById(`attachment-file-${this.containerId}`);
    
    if (!titleInput.value) {
      alert('⚠️ Proszę podać tytuł załącznika');
      return;
    }
    
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('⚠️ Proszę wybrać plik');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('entity_type', this.entityType);
    formData.append('entity_id', this.entityId || '');
    formData.append('case_id', this.caseId);
    formData.append('title', titleInput.value);
    formData.append('description', descriptionInput.value || '');
    
    // Kategoria - albo z select albo domyślna
    const category = categoryInput ? categoryInput.value : (this.category || this.categories[0].value);
    formData.append('category', category);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3500/api/attachments/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Załącznik został dodany!');
        
        // Wyczyść formularz
        titleInput.value = '';
        descriptionInput.value = '';
        fileInput.value = '';
        
        // Odśwież listę
        this.loadAttachments();
        
        // Callback
        if (this.onSuccess) {
          this.onSuccess(data);
        }
      } else {
        alert('❌ Błąd: ' + (data.error || 'Nieznany błąd'));
      }
    } catch (error) {
      console.error('❌ Błąd uploadu:', error);
      alert('❌ Błąd uploadu: ' + error.message);
    }
  }
  
  async loadAttachments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3500/api/attachments?entity_type=${this.entityType}&entity_id=${this.entityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        this.renderAttachments(data.attachments || []);
      } else {
        console.error('Błąd pobierania załączników:', data.error);
        this.renderAttachments([]);
      }
    } catch (error) {
      console.error('❌ Błąd pobierania załączników:', error);
      this.renderAttachments([]);
    }
  }
  
  renderAttachments(attachments) {
    const list = document.getElementById(`attachments-list-${this.containerId}`);
    if (!list) return;
    
    if (attachments.length === 0) {
      list.innerHTML = '<div class="no-attachments">Brak załączników</div>';
      return;
    }
    
    list.innerHTML = `
      <table class="attachments-table">
        <thead>
          <tr>
            <th>Kod</th>
            <th>Tytuł</th>
            <th>Kategoria</th>
            <th>Rozmiar</th>
            <th>Data</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          ${attachments.map(att => `
            <tr>
              <td class="attachment-code">${att.attachment_code}</td>
              <td class="attachment-title">${att.title}</td>
              <td class="attachment-category">${att.category || '-'}</td>
              <td class="attachment-size">${this.formatFileSize(att.file_size)}</td>
              <td class="attachment-date">${this.formatDate(att.uploaded_at)}</td>
              <td class="attachment-actions">
                <button 
                  class="btn btn-sm btn-download" 
                  onclick="downloadAttachment(${att.id})"
                  title="Pobierz"
                >
                  ⬇️
                </button>
                <button 
                  class="btn btn-sm btn-delete" 
                  onclick="deleteAttachment(${att.id}, '${this.containerId}')"
                  title="Usuń"
                >
                  🗑️
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  formatFileSize(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
}

// Funkcje globalne dla akcji
window.downloadAttachment = async function(attachmentId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3500/api/attachments/${attachmentId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'attachment';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } else {
      alert('❌ Błąd pobierania załącznika');
    }
  } catch (error) {
    console.error('❌ Błąd pobierania:', error);
    alert('❌ Błąd pobierania: ' + error.message);
  }
};

window.deleteAttachment = async function(attachmentId, containerId) {
  if (!confirm('Czy na pewno chcesz usunąć ten załącznik?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3500/api/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      alert('✅ Załącznik został usunięty');
      // Odśwież odpowiedni uploader
      if (window.attachmentUploaders && window.attachmentUploaders[containerId]) {
        window.attachmentUploaders[containerId].loadAttachments();
      }
    } else {
      alert('❌ Błąd usuwania załącznika');
    }
  } catch (error) {
    console.error('❌ Błąd usuwania:', error);
    alert('❌ Błąd usuwania: ' + error.message);
  }
};

// Przechowuj instancje uploaderów
window.attachmentUploaders = window.attachmentUploaders || {};

// Eksportuj klasę
window.AttachmentUploader = AttachmentUploader;
