// TYMCZASOWY endpoint do utworzenia pierwszego admina
// USUŃ PO UŻYCIU!

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/db');
const fs = require('fs');
const fs = require('fs');
const path = require('path');

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

// POST /api/setup/reset-volume-db
// Usuwa bazę z volume, żeby wymusić kopiowanie z seed przy restarcie
router.post('/reset-volume-db', async (req, res) => {
    try {
        const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';
        
        if (!isRailway) {
            return res.status(400).json({ error: 'Ten endpoint działa tylko na Railway!' });
        }
        
        const volumeDbPath = '/app/data/komunikator.db';
        
        if (fs.existsSync(volumeDbPath)) {
            fs.unlinkSync(volumeDbPath);
            res.json({
                success: true,
                message: 'Baza volume usunięta! Zrestartuj aplikację na Railway, a seed database zostanie skopiowany.'
            });
        } else {
            res.json({
                success: true,
                message: 'Baza volume nie istnieje - seed zostanie skopiowany przy następnym starcie.'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
