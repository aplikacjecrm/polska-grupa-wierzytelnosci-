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
    this.entityType = config.entityType;  // 'witness', 'civil_detail', 'scenario', etc.
    this.entityId = config.entityId;
    this.category = config.category || 'general';
    this.containerId = config.containerId;
    this.onSuccess = config.onSuccess;
    this.showTitle = config.showTitle !== false; // Domyślnie true
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
              placeholder="np. Zeznanie z 05.11.2025" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="attachment-category-${this.containerId}">Kategoria</label>
            <select id="attachment-category-${this.containerId}">
              <option value="zeznanie">Zeznanie</option>
              <option value="zaświadczenie">Zaświadczenie</option>
              <option value="dowód">Dowód</option>
              <option value="inne">Inne</option>
            </select>
          </div>
          
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
              required
            >
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
    formData.append('entity_id', this.entityId);
    formData.append('case_id', this.caseId);
    formData.append('title', titleInput.value);
    formData.append('description', descriptionInput.value);
    formData.append('category', categoryInput.value);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://web-production-7504.up.railway.app/api/attachments/upload', {
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
        `https://web-production-7504.up.railway.app/api/attachments?entity_type=${this.entityType}&entity_id=${this.entityId}`,
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
              <td class="attachment-code">
                ${att.attachment_code ? `
                  <div style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, #60A5FA, #16a085); color: white; border-radius: 8px; font-size: 0.85rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(26, 188, 156, 0.3); white-space: nowrap;">
                    🔢 ${att.attachment_code}
                  </div>
                ` : `
                  <div style="display: inline-block; padding: 4px 10px; background: #95a5a6; color: white; border-radius: 6px; font-size: 0.75rem; font-style: italic; white-space: nowrap;">
                    ⚠️ Brak kodu
                  </div>
                `}
              </td>
              <td class="attachment-title">${att.title}</td>
              <td class="attachment-category">${att.category || '-'}</td>
              <td class="attachment-size">${this.formatFileSize(att.file_size)}</td>
              <td class="attachment-date">${this.formatDate(att.uploaded_at)}</td>
              <td class="attachment-actions">
                <button 
                  class="btn btn-sm btn-preview" 
                  onclick="previewAttachment(${att.id}, '${att.title}', '${att.file_type}')"
                  title="Podgląd"
                  style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px;"
                >
                  👁️
                </button>
                <button 
                  class="btn btn-sm btn-download" 
                  onclick="downloadAttachment(${att.id})"
                  title="Pobierz"
                  style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px;"
                >
                  ⬇️
                </button>
                <button 
                  class="btn btn-sm btn-delete" 
                  onclick="deleteAttachment(${att.id}, '${this.containerId}')"
                  title="Usuń"
                  style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;"
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
    // Dodaj parametr download=true aby wymusić pobieranie
    const response = await fetch(`https://web-production-7504.up.railway.app/api/attachments/${attachmentId}/download?download=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Wyciągnij nazwę pliku z content-disposition
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'attachment';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
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
    const response = await fetch(`https://web-production-7504.up.railway.app/api/attachments/${attachmentId}`, {
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

window.previewAttachment = async function(attachmentId, title, fileType) {
  console.log('👁️ Podgląd załącznika:', attachmentId, title, fileType);
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://web-production-7504.up.railway.app/api/attachments/${attachmentId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      alert('❌ Błąd pobierania załącznika');
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Stwórz modal z podglądem
    const modal = document.createElement('div');
    modal.id = 'attachmentPreviewModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0,0,0,0.9);
      z-index: 10003;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    `;
    
    // Sprawdź typ pliku
    const isPDF = fileType === 'application/pdf' || title.toLowerCase().endsWith('.pdf');
    const isImage = fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(title);
    const isVideo = fileType?.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi)$/i.test(title);
    const isAudio = fileType?.startsWith('audio/') || /\.(mp3|wav|ogg|webm|m4a)$/i.test(title);
    const isText = fileType === 'text/plain' || title.toLowerCase().endsWith('.txt');
    
    let contentHTML = '';
    
    if (isText) {
      // Dla plików TXT pobierz treść i wyświetl
      const text = await blob.text();
      contentHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          overflow: auto; 
          padding: 30px; 
          background: #f8f9fa;
        ">
          <pre style="
            font-family: 'Courier New', monospace; 
            font-size: 0.95rem; 
            line-height: 1.6; 
            color: #2c3e50; 
            margin: 0; 
            white-space: pre-wrap; 
            word-wrap: break-word;
          ">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      `;
    } else if (isPDF) {
      contentHTML = `
        <iframe 
          src="${url}" 
          style="width: 100%; height: 100%; border: none; border-radius: 8px;"
        ></iframe>
      `;
    } else if (isImage) {
      contentHTML = `
        <img 
          src="${url}" 
          style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;"
          alt="${title}"
        />
      `;
    } else if (isVideo) {
      contentHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: #000; border-radius: 8px;">
          <video 
            controls 
            autoplay
            style="max-width: 100%; max-height: 100%; border-radius: 8px;"
            src="${url}"
          >
            Twoja przeglądarka nie obsługuje odtwarzania wideo.
          </video>
        </div>
      `;
    } else if (isAudio) {
      contentHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 40px; text-align: center;">
          <div style="font-size: 6rem; margin-bottom: 30px; color: white;">🎵</div>
          <h3 style="color: white; margin-bottom: 30px; font-size: 1.5rem;">Nagranie audio</h3>
          <audio 
            controls 
            autoplay
            style="width: 100%; max-width: 500px; margin-bottom: 20px;"
            src="${url}"
          >
            Twoja przeglądarka nie obsługuje odtwarzania audio.
          </audio>
          <p style="color: rgba(255,255,255,0.8); margin-top: 20px;">${title}</p>
        </div>
      `;
    } else {
      contentHTML = `
        <div style="text-align: center; color: white; padding: 40px;">
          <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
          <p style="font-size: 1.2rem; margin-bottom: 20px;">Podgląd niedostępny dla tego typu pliku</p>
          <p style="color: #ccc; margin-bottom: 30px;">${title}</p>
          <button 
            onclick="downloadAttachment(${attachmentId})" 
            style="
              padding: 12px 24px;
              background: #3B82F6;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1rem;
              font-weight: 600;
            "
          >
            ⬇️ Pobierz plik
          </button>
        </div>
      `;
    }
    
    modal.innerHTML = `
      <div style="
        background: white; 
        border-radius: 16px; 
        width: 90%; 
        height: 90vh; 
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #3B82F6, #1E40AF); 
          padding: 20px; 
          color: white; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
        ">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem;">👁️ Podgląd załącznika</h3>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">${title}</p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button 
              onclick="downloadAttachment(${attachmentId})" 
              style="
                background: rgba(255,255,255,0.2); 
                border: 2px solid white; 
                color: white; 
                padding: 8px 16px; 
                border-radius: 8px; 
                cursor: pointer; 
                font-size: 0.9rem;
                font-weight: 600;
              "
            >
              ⬇️ Pobierz
            </button>
            <button 
              onclick="document.getElementById('attachmentPreviewModal').remove(); window.URL.revokeObjectURL('${url}')" 
              style="
                background: rgba(255,255,255,0.2); 
                border: 2px solid white; 
                color: white; 
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                cursor: pointer; 
                font-size: 1.5rem; 
                font-weight: 700;
              "
            >
              ×
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div style="flex: 1; overflow: auto; display: flex; justify-content: center; align-items: center; background: ${isImage ? '#f0f0f0' : 'white'};">
          ${contentHTML}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Zamknięcie na ESC
    const closeOnEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        window.URL.revokeObjectURL(url);
        document.removeEventListener('keydown', closeOnEsc);
      }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Zamknięcie na kliknięcie w tło
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        window.URL.revokeObjectURL(url);
        document.removeEventListener('keydown', closeOnEsc);
      }
    });
    
  } catch (error) {
    console.error('❌ Błąd podglądu:', error);
    alert('❌ Błąd podglądu: ' + error.message);
  }
};

// Przechowuj instancje uploaderów
window.attachmentUploaders = window.attachmentUploaders || {};

// Eksportuj klasę
window.AttachmentUploader = AttachmentUploader;

