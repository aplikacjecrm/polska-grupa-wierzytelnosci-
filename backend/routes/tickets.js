const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { getDatabase } = require('../database/init');

// Pobierz wszystkie tickety
router.get('/', (req, res) => {
    const query = `
        SELECT t.*, u.name as requester_name, u.email as requester_email
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
    `;
    
    db.all(query, [], (err, tickets) => {
        if (err) {
            console.error('❌ Błąd pobierania ticketów:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ tickets });
    });
});

// Pobierz tickety użytkownika
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    const query = `
        SELECT * FROM tickets
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;
    
    db.all(query, [userId], (err, tickets) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ tickets });
    });
});

// Utwórz nowy ticket
router.post('/', (req, res) => {
    const { user_id, ticket_type, title, department, details, priority } = req.body;
    
    const ticketNumber = `TICKET-${Date.now().toString().slice(-8)}`;
    
    const query = `
        INSERT INTO tickets (ticket_number, user_id, ticket_type, title, department, details, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Nowy')
    `;
    
    db.run(query, [ticketNumber, user_id, ticket_type, title, department, JSON.stringify(details), priority || 'normal'], function(err) {
        if (err) {
            console.error('❌ Błąd tworzenia ticketu:', err);
            return res.status(500).json({ error: err.message });
        }
        
        const ticketId = this.lastID;
        
        // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD
        const activityDb = getDatabase();
        activityDb.run(`
          INSERT INTO employee_activity_logs (
            user_id, action_type, action_category, description
          ) VALUES (?, ?, ?, ?)
        `, [
          user_id,
          'ticket_created',
          'ticket',
          `Utworzono ticket: ${title} (${ticketNumber})`
        ], (logErr) => {
          if (logErr) console.error('⚠️ Błąd logowania aktywności:', logErr);
          else console.log('📊 Aktywność ticketu zalogowana do HR dashboard');
        });
        
        res.json({
            success: true,
            ticket: {
                id: ticketId,
                ticket_number: ticketNumber,
                status: 'Nowy'
            }
        });
    });
});

// Zaktualizuj status ticketu
router.put('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    
    const query = `
        UPDATE tickets 
        SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(query, [status, admin_note, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// Statystyki ticketów
router.get('/stats', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM tickets',
        new: "SELECT COUNT(*) as count FROM tickets WHERE status = 'Nowy'",
        inProgress: "SELECT COUNT(*) as count FROM tickets WHERE status = 'W realizacji'",
        completed: "SELECT COUNT(*) as count FROM tickets WHERE status = 'Zakończony'",
        byDepartment: 'SELECT department, COUNT(*) as count FROM tickets GROUP BY department'
    };
    
    const stats = {};
    
    db.get(queries.total, [], (err, row) => {
        stats.total = row?.count || 0;
        
        db.get(queries.new, [], (err, row) => {
            stats.new = row?.count || 0;
            
            db.get(queries.inProgress, [], (err, row) => {
                stats.inProgress = row?.count || 0;
                
                db.get(queries.completed, [], (err, row) => {
                    stats.completed = row?.count || 0;
                    
                    db.all(queries.byDepartment, [], (err, rows) => {
                        stats.byDepartment = rows || [];
                        res.json(stats);
                    });
                });
            });
        });
    });
});

module.exports = router;
