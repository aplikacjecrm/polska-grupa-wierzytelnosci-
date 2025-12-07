const express = require('express');
const router = express.Router();
// Używaj głównej bazy danych z init.js (data/komunikator.db) zamiast db.js (backend/database/kancelaria.db)
const { getDatabase } = require('../database/init');
const db = getDatabase();

// =====================================
// AUTOMATYCZNE TWORZENIE TABELI TICKETS
// =====================================
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_number VARCHAR(50) UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            ticket_type VARCHAR(50) NOT NULL,
            title TEXT NOT NULL,
            department VARCHAR(100) NOT NULL,
            details TEXT,
            priority VARCHAR(20) DEFAULT 'normal',
            status VARCHAR(50) DEFAULT 'Nowy',
            admin_note TEXT,
            hr_approved INTEGER DEFAULT 0,
            hr_approved_by INTEGER,
            hr_approved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Błąd tworzenia tabeli tickets:', err);
        else console.log('✅ Tabela tickets gotowa');
    });

    // Indeksy - po utworzeniu tabeli
    db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department)`);
    
    // Migracja - dodaj kolumny hr_approved jeśli nie istnieją
    db.run(`ALTER TABLE tickets ADD COLUMN hr_approved INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });
    db.run(`ALTER TABLE tickets ADD COLUMN hr_approved_by INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });
    db.run(`ALTER TABLE tickets ADD COLUMN hr_approved_at DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });
});

// Pobierz wszystkie tickety
router.get('/', (req, res) => {
    // Najpierw sprawdź czy tabela users istnieje
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", [], (err, row) => {
        let query;
        if (row) {
            // Jeśli users istnieje, użyj JOIN
            query = `
                SELECT t.*, u.name as requester_name, u.email as requester_email
                FROM tickets t
                LEFT JOIN users u ON t.user_id = u.id
                ORDER BY t.created_at DESC
            `;
        } else {
            // Jeśli users nie istnieje, pobierz tylko tickety
            query = `
                SELECT *, 'N/A' as requester_name, 'N/A' as requester_email
                FROM tickets
                ORDER BY created_at DESC
            `;
        }
    
        db.all(query, [], (err, tickets) => {
            if (err) {
                console.error('❌ Błąd pobierania ticketów:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ tickets });
        });
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

// Zatwierdzenie ticketu przez HR
router.put('/:id/hr-approve', (req, res) => {
    const { id } = req.params;
    const { approved, hr_user_id } = req.body;
    
    const query = `
        UPDATE tickets 
        SET hr_approved = ?, 
            hr_approved_by = ?, 
            hr_approved_at = CURRENT_TIMESTAMP,
            status = CASE WHEN ? = 1 THEN 'W realizacji' ELSE 'Odrzucony' END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(query, [approved ? 1 : 0, hr_user_id, approved ? 1 : 0, id], function(err) {
        if (err) {
            console.error('❌ Błąd zatwierdzania przez HR:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Ticket ${id} ${approved ? 'zatwierdzony' : 'odrzucony'} przez HR`);
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
