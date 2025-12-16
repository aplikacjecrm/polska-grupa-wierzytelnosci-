const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const db = getDatabase();

// Pobierz ankietę dla sprawy
router.get('/cases/:caseId/questionnaire', (req, res) => {
    const { caseId } = req.params;
    
    db.get(`
        SELECT * FROM case_questionnaires 
        WHERE case_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `, [caseId], (err, questionnaire) => {
        if (err) {
            console.error('❌ Błąd pobierania ankiety:', err);
            return res.status(500).json({ error: 'Błąd pobierania ankiety' });
        }
        
        res.json({ questionnaire: questionnaire || null });
    });
});

// Zapisz/aktualizuj ankietę
router.post('/cases/:caseId/questionnaire', (req, res) => {
    const { caseId } = req.params;
    const { questionnaire_type, answers, completed } = req.body;
    
    // Sprawdź czy ankieta już istnieje
    db.get(`
        SELECT id FROM case_questionnaires 
        WHERE case_id = ? AND questionnaire_type = ?
    `, [caseId, questionnaire_type], (err, existing) => {
        if (err) {
            console.error('❌ Błąd sprawdzania ankiety:', err);
            return res.status(500).json({ error: 'Błąd sprawdzania ankiety' });
        }
        
        if (existing) {
            // Update
            db.run(`
                UPDATE case_questionnaires 
                SET answers = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [answers, completed ? 1 : 0, existing.id], (updateErr) => {
                if (updateErr) {
                    console.error('❌ Błąd aktualizacji ankiety:', updateErr);
                    return res.status(500).json({ error: 'Błąd aktualizacji ankiety' });
                }
                
                console.log(`✅ Zaktualizowano ankietę ID: ${existing.id}`);
                res.json({ success: true, id: existing.id, action: 'updated' });
            });
        } else {
            // Insert
            db.run(`
                INSERT INTO case_questionnaires 
                (case_id, questionnaire_type, answers, completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [caseId, questionnaire_type, answers, completed ? 1 : 0], function(insertErr) {
                if (insertErr) {
                    console.error('❌ Błąd zapisu ankiety:', insertErr);
                    return res.status(500).json({ error: 'Błąd zapisu ankiety' });
                }
                
                console.log(`✅ Utworzono ankietę ID: ${this.lastID}`);
                res.json({ success: true, id: this.lastID, action: 'created' });
            });
        }
    });
});

// Usuń ankietę
router.delete('/cases/:caseId/questionnaire/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(`DELETE FROM case_questionnaires WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('❌ Błąd usuwania ankiety:', err);
            return res.status(500).json({ error: 'Błąd usuwania ankiety' });
        }
        
        console.log(`✅ Usunięto ankietę ID: ${id}`);
        res.json({ success: true });
    });
});

module.exports = router;
