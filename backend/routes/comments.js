const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { canAccessCase, canViewInternalNotes, ROLES } = require('../middleware/permissions');
const { logEmployeeActivity } = require('../utils/employee-activity');
const uploadConfig = require('../config/uploads');

const router = express.Router();

// Konfiguracja multer dla PDF (używa centralnej konfiguracji)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = uploadConfig.paths.comments();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Dozwolone typy plików
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Niedozwolony typ pliku. Dozwolone: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT'));
    }
  }
});

// Pobierz komentarze do sprawy
router.get('/case/:caseId', verifyToken, canAccessCase, canViewInternalNotes, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  const canViewInternal = req.canViewInternal;

  let query = `
    SELECT cc.id,
           cc.case_id,
           cc.user_id,
           cc.parent_comment_id,
           cc.comment,
           cc.is_internal,
           cc.is_internal as internal,
           cc.created_at,
           u.name as author_name,
           u.name as user_name,
           u.email as author_email,
           u.role as user_role
    FROM case_comments cc
    LEFT JOIN users u ON cc.user_id = u.id
    WHERE cc.case_id = ?
  `;

  // Klienci nie widzą wewnętrznych komentarzy
  if (!canViewInternal) {
    query += ` AND cc.is_internal = 0`;
  }

  query += ` ORDER BY cc.created_at DESC`; // Nowe komentarze u góry

  db.all(query, [caseId], (err, comments) => {
    if (err) {
      console.error('❌ Błąd pobierania komentarzy:', err);
      return res.status(500).json({ error: 'Błąd pobierania komentarzy' });
    }
    
    // Pobierz załączniki dla tej sprawy (comment_attachment) z obu tabel
    db.all(
      `SELECT 
        d.id, 
        d.comment_id, 
        d.document_number,
        NULL as attachment_code,
        d.title, 
        d.filename, 
        d.filepath as file_path,
        d.file_type, 
        d.file_size, 
        d.uploaded_at
       FROM documents d
       WHERE d.case_id = ? AND d.category = 'comment_attachment'
       
       UNION ALL
       
       SELECT 
        a.id,
        a.entity_id as comment_id,
        NULL as document_number,
        a.attachment_code,
        a.title,
        a.file_name as filename,
        a.file_path,
        a.file_type,
        a.file_size,
        a.uploaded_at
       FROM attachments a
       WHERE a.case_id = ? AND a.entity_type = 'comment' AND a.category = 'comment_attachment'
       
       ORDER BY uploaded_at DESC`,
      [caseId, caseId],
      (docErr, attachments) => {
        if (docErr) {
          console.error('❌ Błąd pobierania załączników:', docErr);
          attachments = [];
        }
        
        // Przypisz załączniki do komentarzy
        comments.forEach(comment => {
          comment.attachments = attachments.filter(att => att.comment_id === comment.id);
        });
        
        console.log('✅ Zwracam komentarze dla sprawy', caseId, ':', comments.length);
        console.log('📎 Załączniki znalezione:', attachments.length);
        res.json({ comments });
      }
    );
  });
});

// Dodaj komentarz do sprawy (BEZ pliku - zwykły JSON)
router.post('/', verifyToken, canAccessCase, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { case_id, comment, is_internal, parent_comment_id } = req.body;

  if (!case_id || !comment) {
    return res.status(400).json({ error: 'case_id i comment są wymagane' });
  }

  // Klienci nie mogą tworzyć wewnętrznych komentarzy
  const internal = (userRole === ROLES.CLIENT) ? 0 : (is_internal || 0);
  
  console.log('💾 Zapisuję komentarz:', {
    case_id,
    userId,
    comment: comment.substring(0, 30),
    internal,
    parent_comment_id: parent_comment_id || null
  });

  db.run(
    `INSERT INTO case_comments (case_id, user_id, comment, is_internal, parent_comment_id)
     VALUES (?, ?, ?, ?, ?)`,
    [case_id, userId, comment, internal, parent_comment_id || null],
    function(err) {
      if (err) {
        console.error('❌ Błąd dodawania komentarza:', err);
        return res.status(500).json({ error: 'Błąd dodawania komentarza' });
      }

      const commentId = this.lastID;
      console.log('✅ Komentarz zapisany z ID:', commentId);
      
      // 📊 LOGUJ DO HISTORII SPRAWY
      logEmployeeActivity({
        userId: userId,
        actionType: 'comment_added',
        actionCategory: 'comment',
        description: internal ? `Dodano komentarz wewnętrzny` : `Dodano komentarz`,
        caseId: case_id
      });
      
      // Wyślij powiadomienie
      sendCommentNotification(db, case_id, userId, userRole, comment);

      res.json({ success: true, commentId: commentId });
    }
  );
});

// Upload pliku do komentarza (osobny endpoint)
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const { case_id, comment_id } = req.body;
  const file = req.file;

  console.log('🔥 /comments/upload called');
  console.log('📦 Body:', req.body);
  console.log('📁 File:', file ? file.originalname : 'BRAK');
  console.log('🔢 case_id:', case_id, 'type:', typeof case_id);
  console.log('💬 comment_id:', comment_id, 'type:', typeof comment_id);

  if (!file) {
    console.error('❌ Brak pliku!');
    return res.status(400).json({ success: false, error: 'Brak pliku' });
  }

  if (!case_id) {
    console.error('❌ Brak case_id!', 'Body:', JSON.stringify(req.body));
    return res.status(400).json({ success: false, error: 'Brak case_id' });
  }

  console.log('📎 Upload pliku:', file.originalname, 'do sprawy:', case_id);

  // Pobierz case_number i client_id ze sprawy
  db.get('SELECT case_number, client_id FROM cases WHERE id = ?', [case_id], (caseErr, caseData) => {
    if (caseErr || !caseData) {
      console.error('❌ Błąd pobierania sprawy:', caseErr);
      return res.status(500).json({ success: false, error: 'Błąd pobierania sprawy' });
    }

    // Znajdź ostatni numer dokumentu dla tej sprawy
    db.get(
      `SELECT document_number FROM documents 
       WHERE case_id = ? AND document_number LIKE 'DOK/${caseData.case_number}/%'
       ORDER BY id DESC LIMIT 1`,
      [case_id],
      (numErr, lastDoc) => {
        // Wygeneruj kolejny numer
        let nextNumber = 1;
        if (lastDoc && lastDoc.document_number) {
          const parts = lastDoc.document_number.split('/');
          const lastNum = parseInt(parts[parts.length - 1]) || 0;
          nextNumber = lastNum + 1;
        }
        
        const paddedNumber = String(nextNumber).padStart(3, '0');
        const documentNumber = `DOK/${caseData.case_number}/${paddedNumber}`;
        
        console.log('📋 Generuję numer dokumentu:', documentNumber);
        
        // Zapisz dokument z comment_id
        db.run(
          `INSERT INTO documents (document_number, case_id, client_id, comment_id, title, filename, filepath, file_type, file_size, category, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            documentNumber,
            case_id,
            caseData.client_id,
            comment_id || null,
            file.originalname,
            file.filename,
            file.path,
            file.mimetype,
            file.size,
            'comment_attachment',
            userId
          ],
          function(docErr) {
            if (docErr) {
              console.error('❌ Błąd zapisywania dokumentu:', docErr);
              return res.status(500).json({ success: false, error: 'Błąd zapisywania dokumentu' });
            }

            console.log('✅ Plik zapisany jako dokument ID:', this.lastID, 'numer:', documentNumber);
            res.json({ 
              success: true, 
              documentId: this.lastID,
              documentNumber: documentNumber,
              filename: file.originalname
            });
          }
        );
      }
    );
  });
});

// Usuń komentarz (tylko własne lub admin/lawyer z hasłem)
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const adminPassword = req.headers['x-admin-password'];

  console.log('DELETE /comments/:id called');
  console.log('Comment ID:', id);
  console.log('User role:', userRole);
  console.log('Admin password provided:', adminPassword ? 'YES' : 'NO');

  // Sprawdź czy użytkownik może usunąć komentarz
  db.get('SELECT * FROM case_comments WHERE id = ?', [id], (err, comment) => {
    if (err) {
      console.error('Błąd pobierania komentarza:', err);
      return res.status(500).json({ error: 'Błąd pobierania komentarza' });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Komentarz nie znaleziony' });
    }

    // Sprawdź hasło administratora
    if (adminPassword !== 'Proadmin') {
      console.log('Invalid admin password - rejecting request');
      return res.status(401).json({ error: 'Nieprawidłowe hasło administratora' });
    }

    // Można usunąć własny komentarz lub jeśli jest się adminem/prawnikiem
    if (comment.user_id === userId || [ROLES.ADMIN, ROLES.LAWYER].includes(userRole)) {
      // Usuń również wszystkie odpowiedzi na ten komentarz (CASCADE)
      db.run('DELETE FROM case_comments WHERE id = ? OR parent_comment_id = ?', [id, id], function(err) {
        if (err) {
          console.error('Błąd usuwania komentarza:', err);
          return res.status(500).json({ error: 'Błąd usuwania komentarza' });
        }
        console.log('✅ Usunięto komentarz i odpowiedzi:', this.changes);
        res.json({ success: true, message: 'Komentarz został usunięty' });
      });
    } else {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia komentarza' });
    }
  });
});

// Funkcja wysyłająca powiadomienia o nowym komentarzu
function sendCommentNotification(db, caseId, commenterId, commenterRole, comment) {
  // Pobierz sprawę i klienta
  db.get(
    `SELECT c.*, cl.first_name, cl.last_name, u.id as client_user_id
     FROM cases c
     LEFT JOIN clients cl ON c.client_id = cl.id
     LEFT JOIN users u ON u.client_id = cl.id
     WHERE c.id = ?`,
    [caseId],
    (err, caseData) => {
      if (err || !caseData) return;

      // Jeśli komentarz dodał klient, powiadom pracowników
      if (commenterRole === ROLES.CLIENT) {
        db.all(
          `SELECT id FROM users WHERE role IN ('admin', 'lawyer', 'assistant') AND is_active = 1`,
          [],
          (err, staff) => {
            if (err || !staff) return;

            staff.forEach(user => {
              db.run(
                `INSERT INTO notifications (user_id, title, message, type, related_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                  user.id,
                  'Nowy komentarz klienta',
                  `Klient dodał komentarz do sprawy ${caseData.case_number}`,
                  'comment',
                  caseId
                ]
              );
            });
          }
        );
      }
      // Jeśli komentarz dodał pracownik, powiadom klienta
      else if (caseData.client_user_id) {
        db.run(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            caseData.client_user_id,
            'Nowy komentarz do sprawy',
            `Dodano komentarz do sprawy ${caseData.case_number}`,
            'comment',
            caseId
          ]
        );
      }
    }
  );
}

module.exports = router;
