// =====================================
// TASKS MODULE
// Moduł zarządzania zadaniami w sprawach
// =====================================

class TasksModule {
    constructor() {
        this.tasks = [];
        this.currentCaseId = null;
        
        // Listen for task events
        if (window.eventBus) {
            window.eventBus.on('task:created', (data) => {
                console.log('📋 Zadanie utworzone:', data);
                if (this.currentCaseId) {
                    this.loadCaseTasks(this.currentCaseId);
                }
            });
            
            window.eventBus.on('task:statusChanged', (data) => {
                console.log('🔄 Status zadania zmieniony:', data);
                if (this.currentCaseId) {
                    this.loadCaseTasks(this.currentCaseId);
                }
            });
        }
    }
    
    // =====================================
    // RENDEROWANIE LISTY ZADAŃ
    // =====================================
    async showTasksList(caseId, containerId = 'caseTasks') {
        this.currentCaseId = caseId;
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('❌ Kontener zadań nie znaleziony:', containerId);
            return;
        }
        
        try {
            const response = await window.api.request(`/tasks/case/${caseId}`);
            this.tasks = response.tasks || [];
            
            console.log(`✅ Załadowano ${this.tasks.length} zadań dla sprawy ${caseId}`);
            
            this.renderTasksList(container);
            
        } catch (error) {
            console.error('❌ Błąd ładowania zadań:', error);
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #e74c3c;">
                    <p>❌ Błąd ładowania zadań: ${error.message}</p>
                </div>
            `;
        }
    }
    
    renderTasksList(container) {
        const todoTasks = this.tasks.filter(t => t.status === 'todo');
        const inProgressTasks = this.tasks.filter(t => t.status === 'in_progress');
        const doneTasks = this.tasks.filter(t => t.status === 'done');
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800; color: #1a2332;">✅ Zadania (${this.tasks.length})</h3>
                    <button onclick="tasksModule.showAddTaskModal()" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%);
                        color: #1a2332;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        ➕ Dodaj zadanie
                    </button>
                </div>
                
                ${this.tasks.length === 0 ? `
                    <div style="text-align: center; padding: 40px; color: #999;">
                        <p style="font-size: 1.1rem;">📋 Brak zadań</p>
                        <p>Kliknij "Dodaj zadanie" aby utworzyć pierwsze zadanie.</p>
                    </div>
                ` : `
                    <!-- DO ZROBIENIA -->
                    ${todoTasks.length > 0 ? `
                        <div style="margin-bottom: 30px;">
                            <h4 style="color: #1a2332; margin-bottom: 15px; font-weight: 700; font-size: 1.15rem; border-bottom: 2px solid #e74c3c; padding-bottom: 8px;">📌 Do zrobienia (${todoTasks.length})</h4>
                            ${todoTasks.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- W TOKU -->
                    ${inProgressTasks.length > 0 ? `
                        <div style="margin-bottom: 30px;">
                            <h4 style="color: #1a2332; margin-bottom: 15px; font-weight: 700; font-size: 1.15rem; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">🔄 W toku (${inProgressTasks.length})</h4>
                            ${inProgressTasks.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- UKOŃCZONE -->
                    ${doneTasks.length > 0 ? `
                        <div style="margin-bottom: 30px;">
                            <h4 style="color: #1a2332; margin-bottom: 15px; font-weight: 700; font-size: 1.15rem; border-bottom: 2px solid #4caf50; padding-bottom: 8px;">✓ Ukończone (${doneTasks.length})</h4>
                            ${doneTasks.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    ` : ''}
                `}
            </div>
        `;
    }
    
    renderTaskCard(task) {
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
        const priorityColors = {
            low: '#95a5a6',
            medium: '#FFD700',
            high: '#e74c3c'
        };
        const priorityLabels = {
            low: 'Niski',
            medium: 'Średni',
            high: 'Wysoki'
        };
        
        return `
            <div style="
                background: ${task.status === 'done' ? '#f8f9fa' : 'white'};
                border: 2px solid ${isOverdue ? '#FFD700' : '#e0e0e0'};
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                transition: all 0.2s ease;
                ${task.status === 'done' ? 'opacity: 0.7;' : ''}
            " onmouseover="this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.boxShadow='0 2px 6px rgba(0, 0, 0, 0.08)'; this.style.transform='translateY(0)';">
                <div style="display: flex; align-items: start; gap: 15px;">
                    <!-- Checkbox -->
                    <input 
                        type="checkbox" 
                        ${task.status === 'done' ? 'checked' : ''}
                        onchange="tasksModule.toggleTaskStatus(${task.id}, this.checked)"
                        style="
                            width: 24px;
                            height: 24px;
                            cursor: pointer;
                            margin-top: 3px;
                            accent-color: #4caf50;
                        "
                    >
                    
                    <!-- Treść zadania -->
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <h4 style="
                                margin: 0;
                                font-size: 1.1rem;
                                font-weight: 700;
                                color: ${task.status === 'done' ? '#999' : '#1a2332'};
                                ${task.status === 'done' ? 'text-decoration: line-through;' : ''}
                            ">${this.escapeHtml(task.title)}</h4>
                            
                            <!-- Priorytet -->
                            <span style="
                                padding: 3px 8px;
                                background: ${priorityColors[task.priority]};
                                color: ${task.priority === 'medium' ? '#1a2332' : 'white'};
                                border-radius: 12px;
                                font-size: 0.75rem;
                                font-weight: 600;
                            ">
                                ${priorityLabels[task.priority]}
                            </span>
                            
                            <!-- Zaległość -->
                            ${isOverdue ? `
                                <span style="
                                    padding: 3px 8px;
                                    background: #e74c3c;
                                    color: white;
                                    border-radius: 12px;
                                    font-size: 0.75rem;
                                    font-weight: 600;
                                ">
                                    ⚠️ ZALEGŁE
                                </span>
                            ` : ''}
                        </div>
                        
                        ${task.description ? `
                            <p style="margin: 5px 0; color: #666; font-size: 0.95rem; line-height: 1.5;">
                                ${this.escapeHtml(task.description)}
                            </p>
                        ` : ''}
                        
                        <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 0.85rem; color: #888;">
                            ${task.assigned_to_name ? `
                                <span>👤 ${this.escapeHtml(task.assigned_to_name)}</span>
                            ` : ''}
                            
                            ${task.due_date ? `
                                <span style="color: ${isOverdue ? '#e74c3c' : '#888'};">
                                    📅 ${new Date(task.due_date).toLocaleDateString('pl-PL')}
                                </span>
                            ` : ''}
                            
                            <span>🕒 ${new Date(task.created_at).toLocaleDateString('pl-PL')}</span>
                        </div>
                    </div>
                    
                    <!-- Akcje -->
                    <div style="display: flex; gap: 5px;">
                        ${task.status !== 'done' ? `
                            <button onclick="tasksModule.markInProgress(${task.id})" style="
                                padding: 6px 12px;
                                background: linear-gradient(135deg, #FFD700, #d4af37);
                                color: #1a2332;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 0.85rem;
                                font-weight: 600;
                            " title="Oznacz w toku">
                                🔄
                            </button>
                        ` : ''}
                        
                        <button onclick="tasksModule.deleteTask(${task.id})" style="
                            padding: 6px 12px;
                            background: #e74c3c;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.85rem;
                            font-weight: 600;
                        " title="Usuń">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // =====================================
    // MODAL DODAWANIA ZADANIA
    // =====================================
    async showAddTaskModal() {
        if (!this.currentCaseId) {
            alert('Błąd: Brak ID sprawy');
            return;
        }
        
        // Pobierz dane sprawy
        let caseData = null;
        try {
            const caseResponse = await window.api.request(`/cases/${this.currentCaseId}`);
            caseData = caseResponse.case;
        } catch (error) {
            console.error('❌ Błąd pobierania danych sprawy:', error);
        }
        
        // Pobierz dane klienta (dla opiekuna klienta)
        let clientData = null;
        if (caseData?.client_id) {
            try {
                const clientResponse = await window.api.request(`/clients/${caseData.client_id}`);
                clientData = clientResponse.client;
            } catch (error) {
                console.error('❌ Błąd pobierania danych klienta:', error);
            }
        }
        
        // Pobierz listę użytkowników
        let users = [];
        try {
            const response = await window.api.request('/users');
            const allUsers = response.users || [];
            
            // Filtruj tylko:
            // 1. Mecenas prowadzący sprawy (cases.assigned_to / lawyer_id)
            // 2. Opiekun sprawy (cases.case_manager_id)
            // 3. Dodatkowy opiekun sprawy (cases.additional_caretaker)
            // 4. Opiekun klienta (clients.assigned_to / case_manager_id)
            // 5. Recepcja + Admin (role = 'reception' lub 'admin')
            const relevantUserIds = new Set();
            
            if (caseData?.assigned_to) {
                relevantUserIds.add(caseData.assigned_to);
            }
            if (caseData?.lawyer_id) {
                relevantUserIds.add(caseData.lawyer_id);
            }
            if (caseData?.case_manager_id) {
                relevantUserIds.add(caseData.case_manager_id);
            }
            if (caseData?.additional_caretaker) {
                relevantUserIds.add(caseData.additional_caretaker);
            }
            if (clientData?.assigned_to) {
                relevantUserIds.add(clientData.assigned_to);
            }
            if (clientData?.case_manager_id) {
                relevantUserIds.add(clientData.case_manager_id);
            }
            
            users = allUsers.filter(u => 
                relevantUserIds.has(u.id) || u.role === 'reception' || u.role === 'admin'
            );
            
            console.log(`✅ Przefiltrowano do ${users.length} użytkowników związanych ze sprawą`);
            console.log('   - Mecenas (assigned_to):', caseData?.assigned_to);
            console.log('   - Mecenas (lawyer_id):', caseData?.lawyer_id);
            console.log('   - Opiekun sprawy (case_manager_id):', caseData?.case_manager_id);
            console.log('   - Dodatkowy opiekun (additional_caretaker):', caseData?.additional_caretaker);
            console.log('   - Opiekun klienta:', clientData?.assigned_to);
            console.log('   - Filtr ról: reception + admin');
        } catch (error) {
            console.error('❌ Błąd pobierania użytkowników:', error);
        }
        
        const modal = document.createElement('div');
        modal.id = 'addTaskModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 95%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 25px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">➕ Dodaj zadanie</h2>
                </div>
                
                <form id="addTaskForm" style="padding: 30px;">
                    <!-- Tytuł -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Tytuł zadania *</label>
                        <input type="text" name="title" required style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-size: 1rem;
                        " placeholder="np. Przygotować pozew">
                    </div>
                    
                    <!-- Opis -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Opis</label>
                        <textarea name="description" rows="4" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-size: 1rem;
                            resize: vertical;
                        " placeholder="Szczegóły zadania..."></textarea>
                    </div>
                    
                    <!-- Przypisz do -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Przypisz do</label>
                        <select name="assigned_to" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                            <option value="">Nie przypisano</option>
                            ${users.map(u => `
                                <option value="${u.id}">${this.escapeHtml(u.name)} (${this.escapeHtml(u.email)})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                        <!-- Priorytet -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Priorytet</label>
                            <select name="priority" style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                font-size: 1rem;
                            ">
                                <option value="low">Niski</option>
                                <option value="medium" selected>Średni</option>
                                <option value="high">Wysoki</option>
                            </select>
                        </div>
                        
                        <!-- Termin -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Termin</label>
                            <input type="date" name="due_date" style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                font-size: 1rem;
                            ">
                        </div>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="submit" style="
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            ✓ Dodaj zadanie
                        </button>
                        <button type="button" onclick="tasksModule.closeModal('addTaskModal')" style="
                            padding: 12px 30px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">
                            ✕ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submit
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask(e.target);
        });
    }
    
    // =====================================
    // ZAPIS ZADANIA
    // =====================================
    async saveTask(form) {
        const formData = new FormData(form);
        
        const data = {
            case_id: this.currentCaseId,
            title: formData.get('title'),
            description: formData.get('description') || null,
            assigned_to: formData.get('assigned_to') || null,
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null
        };
        
        try {
            console.log('📤 Wysyłam zadanie:', data);
            
            const response = await window.api.request('/tasks', {
                method: 'POST',
                body: data
            });
            
            console.log('✅ Zadanie zapisane:', response);
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('task:created', response);
            }
            
            // Zamknij modal
            this.closeModal('addTaskModal');
            
            // Odśwież listę
            await this.showTasksList(this.currentCaseId);
            
            // Komunikat ukryty - lista zadań odświeżona automatycznie
            // alert(`✅ Zadanie "${data.title}" dodane!`);
            
        } catch (error) {
            console.error('❌ Błąd zapisu zadania:', error);
            alert(`❌ Błąd: ${error.message}`);
        }
    }
    
    // =====================================
    // ZMIANA STATUSU
    // =====================================
    async toggleTaskStatus(taskId, isChecked) {
        const newStatus = isChecked ? 'done' : 'todo';
        
        try {
            await window.api.request(`/tasks/${taskId}/status`, {
                method: 'PATCH',
                body: { status: newStatus }
            });
            
            console.log(`✅ Status zadania ${taskId} zmieniony na ${newStatus}`);
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('task:statusChanged', { taskId, status: newStatus });
            }
            
            // Odśwież listę
            await this.showTasksList(this.currentCaseId);
            
        } catch (error) {
            console.error('❌ Błąd zmiany statusu:', error);
            alert(`❌ Błąd: ${error.message}`);
        }
    }
    
    async markInProgress(taskId) {
        try {
            await window.api.request(`/tasks/${taskId}/status`, {
                method: 'PATCH',
                body: { status: 'in_progress' }
            });
            
            console.log(`✅ Zadanie ${taskId} w toku`);
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('task:statusChanged', { taskId, status: 'in_progress' });
            }
            
            // Odśwież listę
            await this.showTasksList(this.currentCaseId);
            
        } catch (error) {
            console.error('❌ Błąd:', error);
            alert(`❌ Błąd: ${error.message}`);
        }
    }
    
    // =====================================
    // USUWANIE ZADANIA
    // =====================================
    async deleteTask(taskId) {
        if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            return;
        }
        
        try {
            await window.api.request(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            console.log(`✅ Zadanie ${taskId} usunięte`);
            
            // Odśwież listę
            await this.showTasksList(this.currentCaseId);
            
        } catch (error) {
            console.error('❌ Błąd usuwania:', error);
            alert(`❌ Błąd: ${error.message}`);
        }
    }
    
    // =====================================
    // LOAD TASKS
    // =====================================
    async loadCaseTasks(caseId) {
        await this.showTasksList(caseId);
    }
    
    // =====================================
    // POMOCNICZE
    // =====================================
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Utwórz globalną instancję
const tasksModule = new TasksModule();
window.tasksModule = tasksModule;

console.log('%c✅ Tasks Module v1.0 loaded!', 'background: #3B82F6; color: white; font-size: 14px; font-weight: bold; padding: 8px;');
