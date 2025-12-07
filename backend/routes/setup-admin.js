// TYMCZASOWY endpoint do utworzenia pierwszego admina
// USUŃ PO UŻYCIU!

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');

// POST /api/setup/create-admin
router.post('/create-admin', async (req, res) => {
    try {
        // Sprawdź czy już jest jakiś użytkownik
        db.get('SELECT COUNT(*) as count FROM users', async (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (result.count > 0) {
                return res.status(400).json({ 
                    error: 'Użytkownicy już istnieją! Ten endpoint działa tylko dla pustej bazy.' 
                });
            }
            
            // Utwórz admina
            const email = 'admin@pro-meritum.pl';
            const password = 'admin123';
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run(`
                INSERT INTO users (email, password, role, name, active)
                VALUES (?, ?, ?, ?, ?)
            `, [email, hashedPassword, 'admin', 'Administrator', 1], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                res.json({
                    success: true,
                    message: 'Admin utworzony!',
                    credentials: {
                        email: email,
                        password: 'admin123'
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
