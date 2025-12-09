const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const uploadConfig = require('../config/uploads');

const router = express.Router();

// Konfiguracja multer dla załączników (używa centralnej konfiguracji)
const attachmentsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = uploadConfig.paths.attachments();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = path.extname(sanitizedName);
      cb(null, `attachment-${uniqueSuffix}${ext}`);
    } catch (error) {
      console.error('❌ Błąd generowania nazwy pliku:', error);
      cb(error);
    }
  }
});

const uploadAttachment = multer({
  storage: attachmentsStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Prefixy typów załączników
const ATTACHMENT_TYPE_PREFIXES = {
  'witness': 'SWI',           // Świadek
  'civil_detail': 'CYW',      // Szczegóły cywilne
  'criminal_detail': 'KAR',   // Szczegóły karne
  'scenario': 'SCE',          // Scenariusz
  'opposing_party': 'STR',    // Strona przeciwna
  'evidence': 'DOW',          // Dowód
  'certificate': 'ZAS',       // Zaświadczenie
  'testimony': 'ZEZ',         // Zeznanie
  'general': 'OGL'            // Ogólny
};

// POST /attachments/upload - Upload załącznika
router.post('/upload', verifyToken, uploadAttachment.single('file'), async (req, res) => {
  console.log('📎 ATTACHMENTS: Upload request received');
  
  const db = getDatabase();
  const { entity_type, entity_id, case_id, title, description, category } = req.body;
  const userId = req.user.userId;

  if (!req.file) {
    console.error('❌ BRAK PLIKU!');
    return res.status(400).json({ error: 'Plik jest wymagany' });
  }

  if (!title) {
    console.error('❌ BRAK TITLE!');
    return res.status(400).json({ error: 'Tytuł jest wymagany' });
  }

  if (!entity_type) {
    console.error('❌ BRAK entity_type!');
    return res.status(400).json({ error: 'Typ encji jest wymagany' });
  }

  if (!case_id) {
    console.error('❌ BRAK case_id!');
    return res.status(400).json({ error: 'ID sprawy jest wymagane' });
  }

  console.log('📎 Dodawanie załącznika:', {
    entity_type,
    entity_id,
    case_id,
    title,
    category
  });

  try {
    // 1. Pobierz dane sprawy (dla numeracji)
    const caseData = await new Promise((resolve, reject) => {
      db.get('SELECT case_number FROM cases WHERE id = ?', [case_id], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('Sprawa nie znaleziona'));
        else resolve(row);
      });
    });

    // 2. Generuj kod załącznika: ZAL/[NR_SPRAWY]/[TYP]/XXX
    const caseNumber = caseData.case_number || 'BRAK';
    const typePrefix = ATTACHMENT_TYPE_PREFIXES[entity_type] || 'OGL';
    const prefix = `ZAL/${caseNumber}/${typePrefix}/`;

    // 3. Znajdź ostatni numer załącznika tego typu
    const lastAttachment = await new Promise((resolve, reject) => {
      db.get(
        `SELECT attachment_code FROM attachments 
         WHERE case_id = ? AND attachment_code LIKE ?
         ORDER BY attachment_code DESC LIMIT 1`,
        [case_id, `${prefix}%`],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    let nextNumber = 1;
    if (lastAttachment && lastAttachment.attachment_code) {
      const lastNumberPart = lastAttachment.attachment_code.split('/').pop();
      nextNumber = parseInt(lastNumberPart) + 1;
    }

    const attachmentCode = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    console.log('📋 Wygenerowany kod załącznika:', attachmentCode);

    // 4. Wczytaj plik jako base64 (dla Railway - pliki na dysku są efemeralne)
    const fileData = fs.readFileSync(req.file.path, { encoding: 'base64' });
    console.log('📦 Plik wczytany jako base64:', fileData.length, 'znaków');

    // 5. Zapisz załącznik do bazy (z base64 data)
    console.log('💾 Próbuję zapisać załącznik do bazy...');
    
    const attachmentId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO attachments (
          case_id, entity_type, entity_id, attachment_code, title, description,
          file_name, file_path, file_size, file_type, file_data, category, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          case_id,
          entity_type,
          entity_id || null,
          attachmentCode,
          title,
          description || null,
          req.file.originalname,
          req.file.path,
          req.file.size,
          req.file.mimetype,
          fileData,  // Base64 data
          category || 'general',
          userId
        ],
        function(err) {
          if (err) {
            console.error('❌❌❌ BŁĄD ZAPISU DO BAZY:', err);
            reject(err);
          } else {
            console.log('✅✅✅ Załącznik dodany do bazy:', attachmentCode, '(ID:', this.lastID + ') z file_data');
            resolve(this.lastID);
          }
        }
      );
    });
    
    // 6. Usuń plik z dysku po zapisaniu do bazy (opcjonalnie - oszczędność miejsca)
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Plik usunięty z dysku (zapisany w bazie jako base64)');
    }

    res.json({
      success: true,
      attachmentId: attachmentId,
      attachmentCode: attachmentCode,
      message: 'Załącznik został dodany'
    });

  } catch (error) {
    console.error('❌ BŁĄD OGÓLNY:', error);
    
    // Usuń plik jeśli zapis do bazy się nie powiódł
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      error: 'Błąd dodawania załącznika: ' + error.message 
    });
  }
});

// GET /attachments - Pobierz załączniki
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { entity_type, entity_id, case_id } = req.query;

  let query = `
    SELECT a.*, u.name as uploaded_by_name
    FROM attachments a
    LEFT JOIN users u ON a.uploaded_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (case_id) {
    query += ' AND a.case_id = ?';
    params.push(case_id);
  }

  if (entity_type) {
    query += ' AND a.entity_type = ?';
    params.push(entity_type);
  }

  if (entity_id) {
    query += ' AND a.entity_id = ?';
    params.push(entity_id);
  }

  query += ' ORDER BY a.uploaded_at DESC';

  db.all(query, params, (err, attachments) => {
    if (err) {
      console.error('Błąd pobierania załączników:', err);
      return res.status(500).json({ error: 'Błąd pobierania załączników' });
    }

    res.json({ attachments: attachments || [] });
  });
});

// GET /attachments/case/:caseId - Pobierz wszystkie załączniki sprawy
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;

  db.all(
    `SELECT a.*, u.name as uploaded_by_name
     FROM attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.case_id = ?
     ORDER BY a.uploaded_at DESC`,
    [caseId],
    (err, attachments) => {
      if (err) {
        console.error('Błąd pobierania załączników:', err);
        return res.status(500).json({ error: 'Błąd pobierania załączników' });
      }

      res.json({ attachments: attachments || [] });
    }
  );
});

// GET /attachments/:id/download - Pobierz plik załącznika
router.get('/:id/download', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const forceDownload = req.query.download === 'true';

  db.get(
    'SELECT * FROM attachments WHERE id = ?',
    [id],
    (err, attachment) => {
      if (err) {
        console.error('Błąd pobierania załącznika:', err);
        return res.status(500).json({ error: 'Błąd pobierania załącznika' });
      }

      if (!attachment) {
        return res.status(404).json({ error: 'Załącznik nie znaleziony' });
      }

      // Jeśli to jest link do dokumentu - pobierz dane ze źródła
      if (attachment.source_document_id) {
        console.log('🔗 Załącznik linkowany do dokumentu:', attachment.source_document_id);
        return db.get('SELECT * FROM documents WHERE id = ?', [attachment.source_document_id], (docErr, doc) => {
          if (docErr || !doc) {
            return res.status(404).json({ error: 'Źródłowy dokument nie znaleziony' });
          }
          // Użyj danych z dokumentu
          const mimeType = doc.file_type || 'application/octet-stream';
          if (doc.file_data) {
            const buffer = Buffer.from(doc.file_data, 'base64');
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('Content-Disposition', forceDownload ? `attachment; filename="${doc.file_name}"` : `inline; filename="${doc.file_name}"`);
            return res.send(buffer);
          }
          // Spróbuj z pliku na dysku
          if (doc.file_path && fs.existsSync(doc.file_path)) {
            return res.download(doc.file_path, doc.file_name);
          }
          return res.status(404).json({ error: 'Plik dokumentu nie znaleziony' });
        });
      }

      // Jeśli to jest link do innego załącznika - pobierz dane ze źródła
      if (attachment.source_attachment_id) {
        console.log('🔗 Załącznik linkowany do załącznika:', attachment.source_attachment_id);
        return db.get('SELECT * FROM attachments WHERE id = ?', [attachment.source_attachment_id], (attErr, sourceAtt) => {
          if (attErr || !sourceAtt) {
            return res.status(404).json({ error: 'Źródłowy załącznik nie znaleziony' });
          }
          // Użyj danych ze źródłowego załącznika
          const mimeType = sourceAtt.file_type || sourceAtt.mimetype || 'application/octet-stream';
          if (sourceAtt.file_data) {
            const buffer = Buffer.from(sourceAtt.file_data, 'base64');
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('Content-Disposition', forceDownload ? `attachment; filename="${sourceAtt.file_name}"` : `inline; filename="${sourceAtt.file_name}"`);
            return res.send(buffer);
          }
          // Spróbuj z pliku na dysku
          if (sourceAtt.file_path && fs.existsSync(sourceAtt.file_path)) {
            return res.download(sourceAtt.file_path, sourceAtt.file_name);
          }
          return res.status(404).json({ error: 'Plik załącznika nie znaleziony' });
        });
      }

      // PRIORITET 1: Sprawdź czy mamy base64 data w bazie (dla nowych załączników)
      if (attachment.file_data) {
        console.log('📦 Używam base64 z bazy dla załącznika:', attachment.file_name);
        const mimeType = attachment.file_type || attachment.mimetype || 'application/octet-stream';
        const buffer = Buffer.from(attachment.file_data, 'base64');
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', buffer.length);
        if (forceDownload) {
          res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
        } else {
          res.setHeader('Content-Disposition', `inline; filename="${attachment.file_name}"`);
        }
        return res.send(buffer);
      }
      
      // PRIORITET 2: Sprawdź różne możliwe lokalizacje pliku na dysku (fallback dla starych załączników)
      const possiblePaths = [
        attachment.file_path,
        path.join(__dirname, '..', attachment.file_path),
        path.join(__dirname, '../uploads/attachments', path.basename(attachment.file_path)),
        path.join(__dirname, '../uploads', attachment.file_path)
      ];
      
      let foundPath = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }
      
      if (!foundPath) {
        console.error('❌ Plik nie znaleziony ani w bazie ani na dysku. Próbowane ścieżki:', possiblePaths);
        return res.status(404).json({ error: 'Plik nie został znaleziony na serwerze' });
      }
      
      console.log('📁 Używam pliku z dysku:', foundPath);
      
      filePath = foundPath;

      console.log('📎 Wysyłam plik z dysku:', attachment.file_name, 'Type:', attachment.file_type);

      // Dla audio/wideo - pozwól na inline viewing (chyba że wymuszono download)
      const isMedia = attachment.file_type && (
        attachment.file_type.startsWith('audio/') || 
        attachment.file_type.startsWith('video/')
      );

      if (isMedia && !forceDownload) {
        // Streaming z obsługą Range requests (szybsze ładowanie wideo)
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        if (range) {
          // Obsługa Range request - streaming częściowy
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = (end - start) + 1;
          
          console.log(`📹 Streaming wideo: ${start}-${end}/${fileSize} (${(chunkSize/1024/1024).toFixed(2)} MB)`);
          
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': attachment.file_type,
            'Content-Disposition': `inline; filename="${attachment.file_name}"`
          });
          
          const readStream = fs.createReadStream(filePath, { start, end });
          readStream.pipe(res);
        } else {
          // Pełny plik (pierwszy request)
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': attachment.file_type,
            'Accept-Ranges': 'bytes',
            'Content-Disposition': `inline; filename="${attachment.file_name}"`
          });
          
          const readStream = fs.createReadStream(filePath);
          readStream.pipe(res);
        }
      } else {
        // Download dla innych plików
        res.download(filePath, attachment.file_name, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Błąd wysyłania pliku' });
            }
          }
        });
      }
    }
  );
});

// DELETE /attachments/:id - Usuń załącznik
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  // Najpierw pobierz ścieżkę pliku
  db.get('SELECT file_path FROM attachments WHERE id = ?', [id], (err, attachment) => {
    if (err) {
      return res.status(500).json({ error: 'Błąd pobierania załącznika' });
    }

    if (!attachment) {
      return res.status(404).json({ error: 'Załącznik nie znaleziony' });
    }

    // Usuń z bazy
    db.run('DELETE FROM attachments WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania załącznika' });
      }

      // Usuń plik z dysku
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }

      res.json({ success: true, message: 'Załącznik został usunięty' });
    });
  });
});

module.exports = router;
