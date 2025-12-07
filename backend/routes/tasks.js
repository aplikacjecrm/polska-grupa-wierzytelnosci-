const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const { logEmployeeActivity } = require('../utils/employee-activity');

// =====================================
// GET /api/tasks
// Wszystkie zadania z filtrami
// =====================================
router.get('/', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { status, priority, assigned_to, case_id, overdue } = req.query;
    
    let sql = `
        SELECT 
            t.*,
            c.case_number,
            c.title as case_title,
            u_assigned.name as assigned_to_name,
            u_created.name as created_by_name
        FROM case_tasks t
        LEFT JOIN cases c ON t.case_id = c.id
        LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
        LEFT JOIN users u_created ON t.created_by = u_created.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
        sql += ` AND t.status = ?`;
        params.push(status);
    }
    
    if (priority) {
        sql += ` AND t.priority = ?`;
        params.push(priority);
    }
    
    if (assigned_to) {
        sql += ` AND t.assigned_to = ?`;
        params.push(assigned_to);
    }
    
    if (case_id) {
        sql += ` AND t.case_id = ?`;
        params.push(case_id);
    }
    
    if (overdue === 'true') {
        sql += ` AND t.status != 'done' AND t.due_date < datetime('now')`;
    }
    
    sql += ` ORDER BY 
        CASE t.priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
        END,
        t.due_date ASC,
        t.created_at DESC
    `;
    
    db.all(sql, params, (err, tasks) => {
        if (err) {
            console.error('❌ Błąd pobierania zadań:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log(`✅ Pobrano ${tasks.length} zadań`);
        res.json({ success: true, tasks });
    });
});

// =====================================
// GET /api/tasks/case/:caseId
// Zadania dla konkretnej sprawy
// =====================================
router.get('/case/:caseId', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { caseId } = req.params;
    
    const sql = `
        SELECT 
            t.*,
            u_assigned.name as assigned_to_name,
            u_assigned.email as assigned_to_email,
            u_created.name as created_by_name
        FROM case_tasks t
        LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
        LEFT JOIN users u_created ON t.created_by = u_created.id
        WHERE t.case_id = ?
        ORDER BY 
            CASE t.status 
                WHEN 'todo' THEN 1 
                WHEN 'in_progress' THEN 2 
                WHEN 'done' THEN 3 
            END,
            CASE t.priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
            END,
            t.due_date ASC
    `;
    
    db.all(sql, [caseId], (err, tasks) => {
        if (err) {
            console.error('❌ Błąd pobierania zadań sprawy:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log(`✅ Pobrano ${tasks.length} zadań dla sprawy ${caseId}`);
        res.json({ success: true, tasks });
    });
});

// =====================================
// GET /api/tasks/:id
// Szczegóły pojedynczego zadania
// =====================================
router.get('/:id', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    const sql = `
        SELECT 
            t.*,
            c.case_number,
            c.title as case_title,
            u_assigned.name as assigned_to_name,
            u_assigned.email as assigned_to_email,
            u_created.name as created_by_name
        FROM case_tasks t
        LEFT JOIN cases c ON t.case_id = c.id
        LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
        LEFT JOIN users u_created ON t.created_by = u_created.id
        WHERE t.id = ?
    `;
    
    db.get(sql, [id], (err, task) => {
        if (err) {
            console.error('❌ Błąd pobierania zadania:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (!task) {
            return res.status(404).json({ success: false, error: 'Zadanie nie znalezione' });
        }
        
        console.log(`✅ Pobrano zadanie ${id}`);
        res.json({ success: true, task });
    });
});

// =====================================
// POST /api/tasks
// Dodaj nowe zadanie
// =====================================
router.post('/', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { case_id, title, description, assigned_to, priority, due_date } = req.body;
    
    console.log('📋 req.user:', req.user);
    console.log('📋 req.body:', req.body);
    
    const created_by = req.user?.id || 1; // Fallback na user ID 1 jeśli brak req.user
    
    // Walidacja
    if (!case_id || !title) {
        return res.status(400).json({ 
            success: false, 
            error: 'case_id i title są wymagane' 
        });
    }
    
    const sql = `
        INSERT INTO case_tasks (
            case_id, title, description, assigned_to, 
            priority, due_date, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        case_id,
        title,
        description || null,
        assigned_to || null,
        priority || 'medium',
        due_date || null,
        created_by
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('❌ Błąd tworzenia zadania:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        const taskId = this.lastID;
        
        console.log(`✅ Zadanie ${taskId} utworzone dla sprawy ${case_id}`);
        
        // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD - używamy helpera
        const activityDescription = `Utworzono zadanie w sprawie ${case_id || '-'}: ${title}`;

        // 1) Mecenas przypisany do zadania
        if (assigned_to) {
            logEmployeeActivity({
                userId: assigned_to,
                actionType: 'task_created_case',
                actionCategory: 'task',
                description: activityDescription,
                caseId: case_id || null,
                taskId
            });
        }

        // 2) Twórca zadania (jeśli inny niż assigned_to)
        if (!assigned_to || assigned_to !== created_by) {
            logEmployeeActivity({
                userId: created_by,
                actionType: 'task_created_case',
                actionCategory: 'task',
                description: activityDescription,
                caseId: case_id || null,
                taskId
            });
        }
        
        // Pobierz pełne dane zadania
        db.get(`
            SELECT 
                t.*,
                u_assigned.name as assigned_to_name,
                u_created.name as created_by_name
            FROM case_tasks t
            LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
            LEFT JOIN users u_created ON t.created_by = u_created.id
            WHERE t.id = ?
        `, [taskId], (err, task) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            // Emit event przez Socket.IO (jeśli dostępne)
            if (global.io && assigned_to) {
                global.io.to(assigned_to).emit('task:assigned', {
                    taskId,
                    title,
                    case_id,
                    assigned_to_name: task.assigned_to_name
                });
            }
            
            res.status(201).json({ 
                success: true, 
                taskId,
                task,
                message: 'Zadanie utworzone' 
            });
        });
    });
});

// =====================================
// PUT /api/tasks/:id
// Aktualizuj zadanie
// =====================================
router.put('/:id', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { title, description, assigned_to, priority, due_date, status } = req.body;
    
    const sql = `
        UPDATE case_tasks 
        SET 
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            assigned_to = COALESCE(?, assigned_to),
            priority = COALESCE(?, priority),
            due_date = COALESCE(?, due_date),
            status = COALESCE(?, status),
            updated_at = datetime('now')
        WHERE id = ?
    `;
    
    const params = [title, description, assigned_to, priority, due_date, status, id];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('❌ Błąd aktualizacji zadania:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Zadanie nie znalezione' });
        }
        
        console.log(`✅ Zadanie ${id} zaktualizowane`);
        
        // Emit event
        if (global.io) {
            global.io.emit('task:updated', { taskId: id });
        }
        
        res.json({ 
            success: true, 
            message: 'Zadanie zaktualizowane' 
        });
    });
});

// =====================================
// PATCH /api/tasks/:id/status
// Zmień status zadania
// =====================================
router.patch('/:id/status', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { status } = req.body;
    
    // Walidacja statusu
    if (!['todo', 'in_progress', 'done'].includes(status)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nieprawidłowy status. Dozwolone: todo, in_progress, done' 
        });
    }
    
    const completedAt = status === 'done' ? `datetime('now')` : 'NULL';
    
    const sql = `
        UPDATE case_tasks 
        SET 
            status = ?,
            completed_at = ${completedAt},
            updated_at = datetime('now')
        WHERE id = ?
    `;
    
    db.run(sql, [status, id], function(err) {
        if (err) {
            console.error('❌ Błąd zmiany statusu zadania:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Zadanie nie znalezione' });
        }
        
        console.log(`✅ Status zadania ${id} zmieniony na ${status}`);
        
        // Emit event
        if (global.io) {
            global.io.emit('task:statusChanged', { taskId: id, status });
            
            if (status === 'done') {
                global.io.emit('task:completed', { taskId: id });
            }
        }
        
        res.json({ 
            success: true, 
            status,
            message: `Status zmieniony na ${status}` 
        });
    });
});

// =====================================
// DELETE /api/tasks/:id
// Usuń zadanie
// =====================================
router.delete('/:id', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    db.run(`DELETE FROM case_tasks WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('❌ Błąd usuwania zadania:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Zadanie nie znalezione' });
        }
        
        console.log(`✅ Zadanie ${id} usunięte`);
        res.json({ success: true, message: 'Zadanie usunięte' });
    });
});

// =====================================
// GET /api/tasks/stats/overview
// Statystyki zadań
// =====================================
router.get('/stats/overview', authenticateToken, (req, res) => {
    const db = getDatabase();
    
    const sql = `
        SELECT 
            COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_count,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done_count,
            SUM(CASE WHEN status != 'done' AND due_date < datetime('now') THEN 1 ELSE 0 END) as overdue_count,
            SUM(CASE WHEN priority = 'high' AND status != 'done' THEN 1 ELSE 0 END) as high_priority_count
        FROM case_tasks
    `;
    
    db.get(sql, [], (err, stats) => {
        if (err) {
            console.error('❌ Błąd pobierania statystyk zadań:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log('✅ Statystyki zadań pobrane');
        res.json({ success: true, stats });
    });
});

module.exports = router;
