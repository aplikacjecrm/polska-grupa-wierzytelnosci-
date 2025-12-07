const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { generateNoteCode } = require('../utils/code-generator');

const router = express.Router();

// Dodaj notatkę
router.post('/', verifyToken, async (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const { case_id, client_id, title, content, note_type, is_important } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Treść notatki jest wymagana' });
  }

  try {
    // Generuj kod notatki jeśli jest case_id
    let noteCode = null;
    if (case_id) {
      console.log('📝 NOWY SYSTEM: Generuję kod notatki dla sprawy:', case_id);
      const result = await generateNoteCode(case_id, note_type || 'NOT');
      noteCode = result.code;
      console.log('✅ NOWY SYSTEM: Wygenerowano kod notatki:', noteCode);
    }

    db.run(
      `INSERT INTO notes (case_id, client_id, note_code, title, content, note_type, is_important, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [case_id, client_id, noteCode, title, content, note_type || 'general', is_important || 0, userId],
      function(err) {
        if (err) {
          console.error('❌ Błąd dodawania notatki:', err);
          return res.status(500).json({ error: 'Błąd dodawania notatki' });
        }
        console.log('✅ Notatka dodana z ID:', this.lastID, 'i kodem:', noteCode);
        res.json({ success: true, noteId: this.lastID, note_code: noteCode });
      }
    );
  } catch (error) {
    console.error('❌ Błąd generowania kodu notatki:', error);
    return res.status(500).json({ error: 'Błąd generowania kodu notatki: ' + error.message });
  }
});

// Pobierz notatki dla sprawy
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;

  console.log('📝 Pobieranie notatek dla sprawy:', caseId);

  db.all(
    `SELECT n.*, u.name as author_name
     FROM notes n
     LEFT JOIN users u ON n.created_by = u.id
     WHERE n.case_id = ?
     ORDER BY n.is_important DESC, n.created_at DESC`,
    [caseId],
    (err, notes) => {
      if (err) {
        console.error('❌ Błąd pobierania notatek:', err);
        return res.status(500).json({ error: 'Błąd pobierania notatek' });
      }
      console.log('✅ Znaleziono notatek:', notes.length);
      res.json({ notes: notes || [] });
    }
  );
});

// Aktualizuj notatkę
router.put('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { title, content, note_type, is_important } = req.body;

  db.run(
    `UPDATE notes SET title = ?, content = ?, note_type = ?, is_important = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, content, note_type, is_important, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji notatki' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notatka nie znaleziona' });
      }
      res.json({ success: true });
    }
  );
});

// Usuń notatkę
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Błąd usuwania notatki' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notatka nie znaleziona' });
    }
    res.json({ success: true });
  });
});

// GET /notes/:id/comments - Pobierz komentarze do notatki
router.get('/:id/comments', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  console.log('💬 Pobieranie komentarzy dla notatki:', id);

  db.all(
    `SELECT nc.*, u.name as author_name
     FROM note_comments nc
     LEFT JOIN users u ON nc.user_id = u.id
     WHERE nc.note_id = ?
     ORDER BY nc.created_at ASC`,
    [id],
    (err, comments) => {
      if (err) {
        console.error('Error fetching note comments:', err);
        return res.status(500).json({ error: 'Błąd pobierania komentarzy' });
      }
      console.log('💬 Znaleziono komentarzy:', comments.length);
      res.json({ comments: comments || [] });
    }
  );
});

// POST /notes/:id/comments - Dodaj komentarz do notatki
router.post('/:id/comments', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user.userId;

  console.log('💾 Dodawanie komentarza do notatki:', id);

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Treść komentarza jest wymagana' });
  }

  db.run(
    `INSERT INTO note_comments (note_id, user_id, comment)
     VALUES (?, ?, ?)`,
    [id, userId, comment.trim()],
    function(err) {
      if (err) {
        console.error('❌ Error saving comment:', err);
        return res.status(500).json({ error: 'Błąd zapisywania komentarza' });
      }
      console.log('✅ Comment saved with ID:', this.lastID);
      res.json({ success: true, commentId: this.lastID });
    }
  );
});

module.exports = router;
