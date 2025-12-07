/**
 * HR - Dokumenty (Documents) Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const uploadConfig = require('../config/uploads');

// Konfiguracja multer (używa centralnej konfiguracji)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = uploadConfig.paths.employeeDocuments();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${req.params.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Lista dokumentów
router.get('/:userId/list', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const documents = await new Promise((resolve, reject) => {
      db.all(`
        SELECT d.*, u.name as uploaded_by_name
        FROM employee_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.employee_id = ?
        ORDER BY d.uploaded_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('❌ Error listing documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload dokumentu
router.post('/:userId/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { document_type, title, issue_date, expiry_date, issuer, create_ticket } = req.body;
    
    if (!document_type || !title) {
      return res.status(400).json({ error: 'document_type i title są wymagane' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Plik jest wymagany' });
    }
    
    const db = getDatabase();
    const filePath = req.file.path.replace(/\\/g, '/'); // Windows path fix
    
    // Jeśli pracownik przesyła dokument przez ticket (np. dyplom, certyfikat)
    let ticketId = null;
    if (create_ticket === 'true' || create_ticket === true) {
      const ticketTitle = `Nowy dokument: ${title}`;
      const ticketDetails = `
Typ dokumentu: ${document_type}
Nazwa pliku: ${req.file.originalname}
${issue_date ? `Data wystawienia: ${new Date(issue_date).toLocaleDateString('pl-PL')}` : ''}
${expiry_date ? `Ważny do: ${new Date(expiry_date).toLocaleDateString('pl-PL')}` : ''}
${issuer ? `Wystawca: ${issuer}` : ''}

Plik został przesłany i oczekuje na weryfikację.
      `.trim();
      
      const ticketNumber = `DOC-${userId}-${Date.now()}`;
      
      ticketId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO tickets (user_id, ticket_number, ticket_type, title, details, department, priority, status, created_at)
          VALUES (?, ?, 'dokument', ?, ?, 'HR', 'low', 'Nowy', CURRENT_TIMESTAMP)
        `, [userId, ticketNumber, ticketTitle, ticketDetails], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    }
    
    const docId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_documents 
        (employee_id, document_type, title, file_path, file_name, file_size, mime_type, issue_date, expiry_date, issuer, uploaded_by, ticket_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, document_type, title, filePath, req.file.originalname, req.file.size, req.file.mimetype, issue_date, expiry_date, issuer, req.user.userId, ticketId],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    res.json({
      success: true,
      document_id: docId,
      ticket_id: ticketId,
      file_name: req.file.originalname,
      message: ticketId ? 'Dokument przesłany jako ticket - oczekuje weryfikacji' : 'Dokument przesłany pomyślnie'
    });
    
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// CV Routes - MUSZĄ BYĆ PRZED /:docId routes!
// =============================================

// Podgląd CV ze starego systemu (employee_profiles.cv_file_url)
router.get('/cv/:userId/preview', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT cv_file_url FROM employee_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!profile || !profile.cv_file_url) {
      return res.status(404).json({ error: 'CV nie znalezione' });
    }
    
    // CV jest w root/uploads/cv/, nie w backend/uploads/
    const cvPath = path.join(__dirname, '..', '..', profile.cv_file_url);
    
    if (!fs.existsSync(cvPath)) {
      console.error('❌ CV file not found:', cvPath);
      return res.status(404).json({ error: 'Plik CV nie istnieje na serwerze' });
    }
    
    const ext = path.extname(cvPath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="cv${ext}"`);
    res.sendFile(path.resolve(cvPath));
    
  } catch (error) {
    console.error('❌ Error previewing CV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pobierz CV ze starego systemu
router.get('/cv/:userId/download', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT cv_file_url FROM employee_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!profile || !profile.cv_file_url) {
      return res.status(404).json({ error: 'CV nie znalezione' });
    }
    
    // CV jest w root/uploads/cv/, nie w backend/uploads/
    const cvPath = path.join(__dirname, '..', '..', profile.cv_file_url);
    
    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({ error: 'Plik CV nie istnieje na serwerze' });
    }
    
    res.download(cvPath, `CV_pracownik_${userId}${path.extname(cvPath)}`);
    
  } catch (error) {
    console.error('❌ Error downloading CV:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// Document Routes (z dynamicznym :docId)
// =============================================

// Pobierz dokument
router.get('/:docId/download', verifyToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const db = getDatabase();
    
    const doc = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_documents WHERE id = ?', [docId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!doc) {
      return res.status(404).json({ error: 'Dokument nie znaleziony' });
    }
    
    // Sprawdź czy plik istnieje
    if (!fs.existsSync(doc.file_path)) {
      console.error('❌ File not found:', doc.file_path);
      return res.status(404).json({ error: 'Plik nie istnieje na serwerze' });
    }
    
    res.download(doc.file_path, doc.file_name);
  } catch (error) {
    console.error('❌ Error downloading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Podgląd dokumentu (inline)
router.get('/:docId/preview', verifyToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const db = getDatabase();
    
    const doc = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_documents WHERE id = ?', [docId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!doc) {
      return res.status(404).json({ error: 'Dokument nie znaleziony' });
    }
    
    // Sprawdź czy plik istnieje
    if (!fs.existsSync(doc.file_path)) {
      console.error('❌ File not found:', doc.file_path);
      return res.status(404).json({ error: 'Plik nie istnieje na serwerze' });
    }
    
    // Ustaw nagłówki dla podglądu inline
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    
    // Wyślij plik
    res.sendFile(path.resolve(doc.file_path));
  } catch (error) {
    console.error('❌ Error previewing document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dokumenty oczekujące na weryfikację (HR Panel)
router.get('/pending', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    const documents = await new Promise((resolve, reject) => {
      db.all(`
        SELECT d.*, u.name as employee_name, u.email as employee_email
        FROM employee_documents d
        LEFT JOIN users u ON d.employee_id = u.id
        WHERE d.is_verified = 0 OR d.is_verified IS NULL
        ORDER BY d.uploaded_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('❌ Error getting pending documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Zweryfikuj dokument (HR)
router.post('/:docId/verify', verifyToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_documents 
        SET is_verified = 1, verified_by = ?, verified_at = datetime('now')
        WHERE id = ?
      `, [req.user.userId, docId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Dokument zweryfikowany' });
  } catch (error) {
    console.error('❌ Error verifying document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Wygasające dokumenty (HR)
router.get('/expiring', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    const documents = await new Promise((resolve, reject) => {
      db.all(`
        SELECT d.*, u.name as employee_name
        FROM employee_documents d
        LEFT JOIN users u ON d.employee_id = u.id
        WHERE d.expiry_date IS NOT NULL
          AND d.expiry_date <= date('now', '+30 days')
        ORDER BY d.expiry_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('❌ Error getting expiring documents:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
