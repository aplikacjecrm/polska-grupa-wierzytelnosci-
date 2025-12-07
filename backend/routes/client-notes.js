const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// GET /api/clients/:id/notes - Pobierz notatki o kliencie
router.get('/:id/notes', verifyToken, (req, res) => {
    try {
        const clientId = req.params.id;
        const db = getDatabase();
        
        const notes = db.prepare(
            `SELECT 
                cn.id, cn.client_id, cn.content, cn.created_at, cn.updated_at,
                u.id as author_id, u.first_name, u.last_name
            FROM client_notes cn
            LEFT JOIN users u ON cn.author_id = u.id
            WHERE cn.client_id = ?
            ORDER BY cn.created_at DESC`
        ).all(clientId);
        
        // Format author name
        const formattedNotes = notes.map(note => ({
            ...note,
            author: `${note.first_name} ${note.last_name}`
        }));
        
        res.json({ success: true, notes: formattedNotes });
    } catch (error) {
        console.error('Error fetching client notes:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/clients/:id/notes - Dodaj notatkę o kliencie
router.post('/:id/notes', verifyToken, (req, res) => {
    try {
        const clientId = req.params.id;
        const { content } = req.body;
        const userId = req.user.id; // Z middleware auth
        const db = getDatabase();
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: 'Treść notatki jest wymagana!' });
        }
        
        const result = db.prepare(
            `INSERT INTO client_notes (client_id, content, author_id) 
            VALUES (?, ?, ?)`
        ).run(clientId, content.trim(), userId);
        
        // Pobierz dodaną notatkę z danymi autora
        const note = db.prepare(
            `SELECT 
                cn.id, cn.client_id, cn.content, cn.created_at,
                u.first_name, u.last_name
            FROM client_notes cn
            LEFT JOIN users u ON cn.author_id = u.id
            WHERE cn.id = ?`
        ).get(result.lastInsertRowid);
        
        res.json({ 
            success: true, 
            message: 'Notatka została dodana!',
            note: {
                ...note,
                author: `${note.first_name} ${note.last_name}`
            }
        });
    } catch (error) {
        console.error('Error adding client note:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/clients/:id/notes/:noteId - Edytuj notatkę
router.put('/:id/notes/:noteId', verifyToken, (req, res) => {
    try {
        const { id, noteId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const db = getDatabase();
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: 'Treść notatki jest wymagana!' });
        }
        
        // Sprawdź czy notatka należy do tego klienta i czy user jest autorem
        const note = db.prepare(
            'SELECT author_id FROM client_notes WHERE id = ? AND client_id = ?'
        ).get(noteId, id);
        
        if (!note) {
            return res.status(404).json({ success: false, message: 'Notatka nie znaleziona!' });
        }
        
        if (note.author_id !== userId) {
            return res.status(403).json({ success: false, message: 'Brak uprawnień do edycji tej notatki!' });
        }
        
        db.prepare(
            "UPDATE client_notes SET content = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(content.trim(), noteId);
        
        res.json({ success: true, message: 'Notatka została zaktualizowana!' });
    } catch (error) {
        console.error('Error updating client note:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/clients/:id/notes/:noteId - Usuń notatkę
router.delete('/:id/notes/:noteId', verifyToken, (req, res) => {
    try {
        const { id, noteId } = req.params;
        const userId = req.user.id;
        const db = getDatabase();
        
        // Sprawdź czy notatka należy do tego klienta i czy user jest autorem
        const note = db.prepare(
            'SELECT author_id FROM client_notes WHERE id = ? AND client_id = ?'
        ).get(noteId, id);
        
        if (!note) {
            return res.status(404).json({ success: false, message: 'Notatka nie znaleziona!' });
        }
        
        if (note.author_id !== userId) {
            return res.status(403).json({ success: false, message: 'Brak uprawnień do usunięcia tej notatki!' });
        }
        
        db.prepare('DELETE FROM client_notes WHERE id = ?').run(noteId);
        
        res.json({ success: true, message: 'Notatka została usunięta!' });
    } catch (error) {
        console.error('Error deleting client note:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
