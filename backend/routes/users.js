const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

// =====================================
// GET /api/users
// Lista użytkowników (do selectów)
// =====================================
router.get('/', authenticateToken, (req, res) => {
    const db = getDatabase();
    
    const sql = `
        SELECT 
            id,
            name,
            email,
            role
        FROM users
        WHERE is_active = 1
        ORDER BY name ASC
    `;
    
    db.all(sql, [], (err, users) => {
        if (err) {
            console.error('❌ Błąd pobierania użytkowników:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log(`✅ Pobrano ${users.length} użytkowników`);
        res.json({ success: true, users });
    });
});

// =====================================
// GET /api/users/:id
// Szczegóły użytkownika
// =====================================
router.get('/:id', authenticateToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    const sql = `
        SELECT 
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = ? AND is_active = 1
    `;
    
    db.get(sql, [id], (err, user) => {
        if (err) {
            console.error('❌ Błąd pobierania użytkownika:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'Użytkownik nie znaleziony' });
        }
        
        console.log(`✅ Pobrano użytkownika ${id}`);
        res.json({ success: true, user });
    });
});

module.exports = router;
