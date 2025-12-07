# 🚀 FAZA 3 i 4 - GOTOWA IMPLEMENTACJA

## ✅ WYKONANE (FAZY 1-2):
- ✅ **FAZA 1:** Świadkowie, dowody, notatki w kontekście AI
- ✅ **FAZA 2:** Rozbudowany generator (styl, szczegółowość, auto-fill, więcej typów)

---

## 📊 FAZA 3: TIMELINE SPRAWY (~90 min)

### KROK 1: Utwórz tabelę w bazie danych (5 min)

**Plik:** `backend/database/migrations/009-case-timeline.js`

```javascript
// ==========================================
// MIGRACJA: Timeline sprawy
// ==========================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔄 Tworzę tabelę case_timeline...');

db.serialize(() => {
    // Tabela timeline sprawy
    db.run(`
        CREATE TABLE IF NOT EXISTS case_timeline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id INTEGER NOT NULL,
            stage_name TEXT NOT NULL,
            stage_order INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            task_name TEXT,
            task_description TEXT,
            completed_date DATE,
            due_date DATE,
            assigned_to INTEGER,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Błąd tworzenia tabeli:', err);
        } else {
            console.log('✅ Tabela case_timeline utworzona');
        }
    });

    // Indeksy
    db.run(`CREATE INDEX IF NOT EXISTS idx_timeline_case ON case_timeline(case_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_timeline_status ON case_timeline(status)`);
});

db.close();
```

**URUCHOM:**
```powershell
node backend/database/migrations/009-case-timeline.js
```

---

### KROK 2: Backend endpoints (30 min)

**Plik:** `backend/routes/case-timeline.js` (NOWY)

```javascript
// ==========================================
// CASE TIMELINE ROUTES
// Zarządzanie timeline sprawy
// ==========================================

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// Pobierz timeline sprawy
router.get('/:caseId', verifyToken, async (req, res) => {
    try {
        const { caseId } = req.params;
        const db = getDatabase();

        const timeline = await new Promise((resolve, reject) => {
            db.all(
                `SELECT t.*, u.name as assigned_name
                 FROM case_timeline t
                 LEFT JOIN users u ON t.assigned_to = u.id
                 WHERE t.case_id = ?
                 ORDER BY t.stage_order ASC, t.created_at ASC`,
                [caseId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        // Grupuj po etapach
        const stages = {};
        timeline.forEach(item => {
            if (!stages[item.stage_name]) {
                stages[item.stage_name] = {
                    name: item.stage_name,
                    order: item.stage_order,
                    tasks: []
                };
            }
            stages[item.stage_name].tasks.push(item);
        });

        res.json({
            success: true,
            timeline: Object.values(stages).sort((a, b) => a.order - b.order)
        });

    } catch (error) {
        console.error('Timeline fetch error:', error);
        res.status(500).json({ error: 'Błąd pobierania timeline' });
    }
});

// Dodaj etap/zadanie
router.post('/:caseId', verifyToken, async (req, res) => {
    try {
        const { caseId } = req.params;
        const {
            stageName,
            stageOrder,
            taskName,
            taskDescription,
            dueDate,
            assignedTo
        } = req.body;

        const db = getDatabase();

        const result = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO case_timeline 
                 (case_id, stage_name, stage_order, task_name, task_description, due_date, assigned_to, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [caseId, stageName, stageOrder, taskName, taskDescription, dueDate, assignedTo],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        res.json({
            success: true,
            timelineId: result.id
        });

    } catch (error) {
        console.error('Timeline add error:', error);
        res.status(500).json({ error: 'Błąd dodawania do timeline' });
    }
});

// Zaktualizuj status zadania
router.put('/:timelineId', verifyToken, async (req, res) => {
    try {
        const { timelineId } = req.params;
        const { status, completedDate, notes } = req.body;

        const db = getDatabase();

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE case_timeline 
                 SET status = ?, completed_date = ?, notes = ?, updated_at = datetime('now')
                 WHERE id = ?`,
                [status, completedDate, notes, timelineId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Timeline update error:', error);
        res.status(500).json({ error: 'Błąd aktualizacji timeline' });
    }
});

// Usuń zadanie
router.delete('/:timelineId', verifyToken, async (req, res) => {
    try {
        const { timelineId } = req.params;
        const db = getDatabase();

        await new Promise((resolve, reject) => {
            db.run('DELETE FROM case_timeline WHERE id = ?', [timelineId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Timeline delete error:', error);
        res.status(500).json({ error: 'Błąd usuwania z timeline' });
    }
});

module.exports = router;
```

**Dodaj do `server.js`:**
```javascript
// W sekcji routes (około linii 40)
const caseTimelineRoutes = require('./routes/case-timeline');

// W sekcji app.use (około linii 80)
app.use('/api/timeline', caseTimelineRoutes);
```

---

### KROK 3: Frontend UI (55 min)

**Plik:** `frontend/scripts/case-timeline.js` (NOWY)

```javascript
// ==========================================
// CASE TIMELINE MANAGER
// Zarządzanie timeline sprawy
// ==========================================

class CaseTimeline {
    constructor(caseId) {
        this.caseId = caseId;
        this.timeline = [];
    }

    async load() {
        try {
            const response = await api.request(`/timeline/${this.caseId}`);
            if (response.success) {
                this.timeline = response.timeline;
                this.render();
            }
        } catch (error) {
            console.error('Timeline load error:', error);
        }
    }

    render() {
        const container = document.getElementById('case-timeline');
        if (!container) return;

        let html = `
            <div style="padding: 20px; background: white; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">📊 Timeline Sprawy</h3>
                    <button onclick="caseTimeline.addStage()" 
                            style="padding: 8px 16px; background: #d4af37; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        + Dodaj etap
                    </button>
                </div>

                <div style="border-left: 4px solid #d4af37; padding-left: 20px;">
        `;

        this.timeline.forEach((stage, index) => {
            const statusIcon = stage.tasks.every(t => t.status === 'completed') ? '✅' : 
                               stage.tasks.some(t => t.status === 'in_progress') ? '🔄' : '⏸️';
            
            html += `
                <div style="margin-bottom: 30px; position: relative;">
                    <div style="position: absolute; left: -27px; top: 0; width: 18px; height: 18px; background: white; border: 4px solid #d4af37; border-radius: 50%;"></div>
                    
                    <h4 style="margin: 0 0 10px 0; color: #1a1a2e;">
                        ${statusIcon} ETAP ${index + 1}: ${stage.name}
                    </h4>
                    
                    <div style="margin-left: 20px;">
            `;

            stage.tasks.forEach(task => {
                const taskIcon = task.status === 'completed' ? '✅' : 
                                task.status === 'in_progress' ? '🔄' : '⏸️';
                
                html += `
                    <div style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 10px; cursor: pointer;"
                         onclick="caseTimeline.showTaskDetails(${task.id})">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${taskIcon} ${task.task_name}</strong>
                                ${task.completed_date ? `<span style="color: #27ae60; margin-left: 10px;">✓ ${task.completed_date}</span>` : ''}
                                ${task.due_date && !task.completed_date ? `<span style="color: #e74c3c; margin-left: 10px;">⏰ Termin: ${task.due_date}</span>` : ''}
                            </div>
                            <div>
                                ${task.assigned_name ? `<span style="color: #7f8c8d; font-size: 0.9rem;">${task.assigned_name}</span>` : ''}
                            </div>
                        </div>
                        ${task.task_description ? `<div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 5px;">${task.task_description}</div>` : ''}
                    </div>
                `;
            });

            html += `
                        <button onclick="caseTimeline.addTask('${stage.name}', ${stage.order})" 
                                style="padding: 6px 12px; background: white; border: 2px solid #d4af37; border-radius: 6px; cursor: pointer; color: #d4af37; font-weight: 600; margin-top: 10px;">
                            + Dodaj zadanie
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    async addStage() {
        const stageName = prompt('Nazwa nowego etapu:');
        if (!stageName) return;

        try {
            await api.request(`/timeline/${this.caseId}`, {
                method: 'POST',
                body: JSON.stringify({
                    stageName,
                    stageOrder: this.timeline.length,
                    taskName: 'Rozpoczęcie etapu',
                    taskDescription: '',
                    dueDate: null,
                    assignedTo: null
                })
            });

            this.load();
        } catch (error) {
            alert('Błąd dodawania etapu');
        }
    }

    async addTask(stageName, stageOrder) {
        const taskName = prompt('Nazwa zadania:');
        if (!taskName) return;

        const taskDescription = prompt('Opis zadania (opcjonalnie):') || '';
        const dueDate = prompt('Termin (YYYY-MM-DD, opcjonalnie):') || null;

        try {
            await api.request(`/timeline/${this.caseId}`, {
                method: 'POST',
                body: JSON.stringify({
                    stageName,
                    stageOrder,
                    taskName,
                    taskDescription,
                    dueDate,
                    assignedTo: null
                })
            });

            this.load();
        } catch (error) {
            alert('Błąd dodawania zadania');
        }
    }

    async showTaskDetails(taskId) {
        // TODO: Modal z szczegółami zadania i opcją zmiany statusu
        const newStatus = confirm('Oznaczyć jako zakończone?') ? 'completed' : 'in_progress';
        
        try {
            await api.request(`/timeline/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: newStatus,
                    completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
                    notes: ''
                })
            });

            this.load();
        } catch (error) {
            alert('Błąd aktualizacji zadania');
        }
    }
}

// Globalna instancja
let caseTimeline = null;
```

**Dodaj do `index.html` (w sekcji scripts):**
```html
<script src="scripts/case-timeline.js?v=1.0.0"></script>
```

**Dodaj zakładkę Timeline w sprawie (plik `case-details.js` lub odpowiedni):**
```javascript
// W funkcji renderującej zakładki sprawy
<div class="tab-button" onclick="showTab('timeline')">📊 Timeline</div>

// W content area
<div id="timeline-tab" class="tab-content" style="display: none;">
    <div id="case-timeline"></div>
</div>

// W funkcji showTab
if (tabName === 'timeline') {
    if (!caseTimeline || caseTimeline.caseId !== currentCaseId) {
        caseTimeline = new CaseTimeline(currentCaseId);
    }
    caseTimeline.load();
}
```

---

## 💾 FAZA 4: AUTO-ZAPIS DOKUMENTÓW (~70 min)

### KROK 1: Modyfikacja zapisywania (20 min)

**Plik:** `frontend/scripts/ai-assistant.js`

Znajdź funkcję `saveDraftToCase` (około linii 519) i ZASTĄP ją:

```javascript
// Save draft to case documents - AUTO-SAVE VERSION
async saveDraftToCase(type, autoSave = false) {
    const draftText = document.querySelector('#documentDraftModal pre, #documentDraftModal div[style*="monospace"]').textContent;
    
    // Pobierz niestandardową nazwę pliku (jeśli podana)
    const customFileName = document.getElementById('documentFileName')?.value.trim();
    
    try {
        // Przygotuj HTML content
        const htmlContent = this.generateDocumentHTML(draftText, type);
        
        // Konwertuj na blob
        const blob = new Blob(['\ufeff' + htmlContent], { 
            type: 'application/msword;charset=utf-8' 
        });
        
        // Sprawdź ile wersji już istnieje
        const existingVersions = await this.getDocumentVersions(type);
        const versionNumber = existingVersions.length + 1;
        
        // Utwórz nazwę pliku z wersją
        const fileTitle = customFileName || `${type}_v${versionNumber}`;
        const fileName = `${fileTitle.replace(/[^a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]/g, '_')}.doc`;
        
        // Przygotuj FormData
        const formData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('case_id', this.currentCaseId);
        formData.append('title', fileTitle);
        formData.append('description', `Dokument wygenerowany przez AI (v${versionNumber}) - wymaga weryfikacji prawnika`);
        formData.append('category', 'ai_generated');
        formData.append('is_draft', 'true');
        formData.append('version', versionNumber);
        
        // Wyślij do backendu
        const response = await fetch(`http://localhost:3500/api/cases/${this.currentCaseId}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            if (autoSave) {
                this.showToast(`✅ Auto-zapisano: ${fileTitle}.doc (wersja ${versionNumber})`, 'success');
            } else {
                this.showToast(`✅ Dodano do sprawy: ${fileTitle}.doc`, 'success');
                document.getElementById('documentDraftModal')?.remove();
            }
            
            // Odśwież listę dokumentów jeśli jest widoczna
            if (typeof loadCaseDocuments === 'function') {
                loadCaseDocuments(this.currentCaseId);
            }
        } else {
            throw new Error('Błąd zapisywania');
        }

    } catch (error) {
        console.error('Save draft error:', error);
        this.showToast('❌ Błąd zapisywania dokumentu', 'error');
    }
}

// Pobierz istniejące wersje dokumentu
async getDocumentVersions(type) {
    try {
        const response = await api.request(`/cases/${this.currentCaseId}/documents`);
        if (response.success) {
            return response.documents.filter(d => d.title && d.title.includes(type));
        }
        return [];
    } catch (error) {
        return [];
    }
}
```

**W funkcji `showDocumentDraft` (około linii 438) dodaj AUTO-SAVE:**

Zaraz po `document.body.insertAdjacentHTML('beforeend', draftHtml);` dodaj:

```javascript
// AUTO-SAVE po 2 sekundach
setTimeout(() => {
    this.saveDraftToCase(type, true); // true = auto-save mode
}, 2000);
```

---

### KROK 2: System wersjowania (30 min)

**Backend:** `backend/routes/documents.js`

Dodaj endpoint do pobierania wersji:

```javascript
// Pobierz wersje dokumentu
router.get('/:caseId/document-versions/:baseTitle', verifyToken, async (req, res) => {
    try {
        const { caseId, baseTitle } = req.params;
        const db = getDatabase();

        const versions = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, title, version, created_at, updated_at, description, category
                 FROM documents
                 WHERE case_id = ? AND title LIKE ?
                 ORDER BY version DESC, created_at DESC`,
                [caseId, `%${baseTitle}%`],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        res.json({
            success: true,
            versions,
            count: versions.length
        });

    } catch (error) {
        console.error('Document versions error:', error);
        res.status(500).json({ error: 'Błąd pobierania wersji' });
    }
});
```

**Frontend:** Dodaj przycisk "Historia wersji" w liście dokumentów:

```javascript
// W funkcji renderującej listę dokumentów
if (doc.category === 'ai_generated') {
    html += `
        <button onclick="showDocumentVersions('${doc.title}')" 
                style="padding: 4px 8px; background: #3B82F6; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 0.8rem;">
            📜 Historia (v${doc.version || 1})
        </button>
    `;
}

// Funkcja pokazująca wersje
async function showDocumentVersions(baseTitle) {
    try {
        const response = await api.request(`/cases/${currentCaseId}/document-versions/${baseTitle}`);
        
        if (response.success) {
            let html = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%;">
                        <h3>📜 Historia wersji: ${baseTitle}</h3>
                        <div style="max-height: 400px; overflow-y: auto;">
            `;

            response.versions.forEach((ver, index) => {
                html += `
                    <div style="padding: 12px; background: ${index === 0 ? '#e3f2fd' : '#f5f5f5'}; border-radius: 6px; margin-bottom: 10px;">
                        <div style="font-weight: 600;">
                            ${index === 0 ? '✨ ' : ''}Wersja ${ver.version || index + 1}
                            ${index === 0 ? '<span style="color: #2196F3;"> (AKTUALNA)</span>' : ''}
                        </div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                            ${ver.created_at}
                        </div>
                        <div style="font-size: 0.85rem; color: #999; margin-top: 3px;">
                            ${ver.description}
                        </div>
                    </div>
                `;
            });

            html += `
                        </div>
                        <button onclick="this.closest('div[style*=fixed]').remove()" 
                                style="padding: 10px 20px; background: #d4af37; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px; width: 100%;">
                            Zamknij
                        </button>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', html);
        }
    } catch (error) {
        alert('Błąd pobierania wersji');
    }
}
```

---

### KROK 3: Oznaczenia dokumentów AI (20 min)

**Dodaj kolumnę do tabeli documents:**

```sql
ALTER TABLE documents ADD COLUMN is_draft BOOLEAN DEFAULT 0;
ALTER TABLE documents ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN parent_id INTEGER;
```

**W UI dodaj wizualne oznaczenia:**

```javascript
// W liście dokumentów
if (doc.category === 'ai_generated') {
    html += `
        <div style="display: inline-block; padding: 4px 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-left: 8px;">
            🤖 AI
        </div>
    `;
}

if (doc.is_draft) {
    html += `
        <div style="display: inline-block; padding: 4px 8px; background: #ffa726; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-left: 4px;">
            ✏️ SZKIC
        </div>
    `;
}
```

---

## ✅ PODSUMOWANIE IMPLEMENTACJI

### CO ZOSTAŁO ZROBIONE:
1. ✅ **FAZA 1** - Pełny kontekst AI (świadkowie, dowody, notatki)
2. ✅ **FAZA 2** - Rozbudowany generator dokumentów
   - Więcej typów (apelacja, kasacja, replika, etc.)
   - Opcje stylu (formalny/uproszczony/szkic)
   - Szczegółowość (krótki/normalny/szczegółowy)
   - Auto-wypełnianie danymi

### CO TRZEBA ZROBIĆ (FAZY 3-4):
3. ⏸️ **FAZA 3** - Timeline sprawy
   - Tabela SQL ✅ (gotowa)
   - Backend endpoints ✅ (gotowe)
   - Frontend UI ✅ (gotowy)
   - **DO URUCHOMIENIA:** Skopiuj kod i uruchom

4. ⏸️ **FAZA 4** - Auto-zapis i wersjowanie
   - Auto-zapis dokumentów ✅ (gotowy kod)
   - System wersjonowania ✅ (gotowy kod)
   - Historia wersji ✅ (gotowa)
   - **DO URUCHOMIENIA:** Zaimplementuj zmiany

---

## 🚀 JAK URUCHOMIĆ FAZY 3-4:

### FAZA 3:
```powershell
# 1. Utwórz plik migracji
New-Item -Path backend/database/migrations/009-case-timeline.js -Force

# 2. Skopiuj kod SQL z tego dokumentu do pliku

# 3. Uruchom migrację
node backend/database/migrations/009-case-timeline.js

# 4. Utwórz plik routes
New-Item -Path backend/routes/case-timeline.js -Force

# 5. Skopiuj kod backend z tego dokumentu

# 6. Utwórz plik frontend
New-Item -Path frontend/scripts/case-timeline.js -Force

# 7. Skopiuj kod frontend z tego dokumentu

# 8. Dodaj do server.js i index.html

# 9. Restart backendu
```

### FAZA 4:
```
# 1. Zmodyfikuj ai-assistant.js (funkcja saveDraftToCase)

# 2. Dodaj endpoint do documents.js

# 3. Dodaj SQL kolumny (ALTER TABLE)

# 4. Restart backendu

# 5. Testuj auto-zapis
```

---

## 📝 NOTATKI:

- Cały kod jest gotowy do użycia
- Wystarczy skopiować i wkleić
- Nie zapomnij o restartach backendu
- Przetestuj każdą fazę osobno

**Powodzenia!** 🎉
