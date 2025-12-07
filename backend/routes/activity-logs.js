const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Zapisz log aktywności (login/logout)
router.post('/', (req, res) => {
    const { user_id, action, ip_address, user_agent, location } = req.body;
    
    const query = `
        INSERT INTO activity_logs (user_id, action, ip_address, user_agent, location)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [user_id, action, ip_address, user_agent, location], function(err) {
        if (err) {
            console.error('❌ Błąd zapisu logu:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Pobierz logi użytkownika
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const query = `
        SELECT * FROM activity_logs
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    `;
    
    db.all(query, [userId, limit], (err, logs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ logs });
    });
});

// Pobierz wszystkie logi (admin)
router.get('/all', (req, res) => {
    const { limit = 100, action } = req.query;
    
    let query = `
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
    `;
    
    const params = [];
    
    if (action) {
        query += ' WHERE al.action = ?';
        params.push(action);
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(limit);
    
    db.all(query, params, (err, logs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ logs });
    });
});

// Statystyki aktywności
router.get('/stats', (req, res) => {
    const queries = {
        todayLogins: `
            SELECT COUNT(*) as count 
            FROM activity_logs 
            WHERE action = 'login' 
            AND DATE(created_at) = DATE('now')
        `,
        activeUsers: `
            SELECT COUNT(DISTINCT user_id) as count
            FROM activity_logs
            WHERE action = 'login'
            AND DATE(created_at) = DATE('now')
        `,
        byHour: `
            SELECT strftime('%H', created_at) as hour, COUNT(*) as count
            FROM activity_logs
            WHERE action = 'login'
            AND DATE(created_at) = DATE('now')
            GROUP BY hour
            ORDER BY hour
        `,
        byUser: `
            SELECT u.name, u.email, COUNT(*) as login_count
            FROM activity_logs al
            JOIN users u ON al.user_id = u.id
            WHERE al.action = 'login'
            AND DATE(al.created_at) >= DATE('now', '-7 days')
            GROUP BY al.user_id
            ORDER BY login_count DESC
            LIMIT 10
        `
    };
    
    const stats = {};
    
    db.get(queries.todayLogins, [], (err, row) => {
        stats.todayLogins = row?.count || 0;
        
        db.get(queries.activeUsers, [], (err, row) => {
            stats.activeUsers = row?.count || 0;
            
            db.all(queries.byHour, [], (err, rows) => {
                stats.byHour = rows || [];
                
                db.all(queries.byUser, [], (err, rows) => {
                    stats.topUsers = rows || [];
                    res.json(stats);
                });
            });
        });
    });
});

// Raport godzin pracy użytkownika
router.get('/work-hours/:userId', (req, res) => {
    const { userId } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    const query = `
        SELECT 
            DATE(created_at) as date,
            MIN(CASE WHEN action = 'login' THEN created_at END) as first_login,
            MAX(CASE WHEN action = 'logout' THEN created_at END) as last_logout,
            COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count
        FROM activity_logs
        WHERE user_id = ?
        AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    `;
    
    db.all(query, [userId, dateFrom, dateTo], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ workHours: rows });
    });
});

module.exports = router;
