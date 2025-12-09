const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { generateWitnessCode, generateRecordingCode, generateTestimonyCode } = require('../utils/code-generator');
const { logEmployeeActivity } = require('../utils/employee-activity');

// === GENEROWANIE KODU ŚWIADKA (NOWY SYSTEM v1.0) ===

router.post('/generate-code', verifyToken, async (req, res) => {
  const { case_id } = req.body;
  
  if (!case_id) {
    return res.status(400).json({ error: 'case_id jest wymagane' });
  }
  
  try {
    console.log('🔢 NOWY SYSTEM: Generuję kod świadka dla sprawy:', case_id);
    
    // Użyj nowego generatora
    const result = await generateWitnessCode(case_id);
    
    console.log('✅ NOWY SYSTEM: Wygenerowano kod świadka:', result.code);
    
    res.json({ 
      success: true, 
      witness_code: result.code,
      // Dodatkowe metadane dla kompatybilności
      case_type_code: result.caseTypeCode,
      initials: result.initials,
      full_case_number: result.fullCaseNumber,
      witness_number: result.elementNumber
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania kodu świadka:', error);
    res.status(500).json({ error: 'Błąd generowania kodu świadka: ' + error.message });
  }
});

// === GENEROWANIE KODU ZEZNANIA ===

router.post('/generate-testimony-code', verifyToken, async (req, res) => {
  const { case_id, witness_id, testimony_type } = req.body;
  
  if (!case_id || !witness_id) {
    return res.status(400).json({ error: 'case_id i witness_id są wymagane' });
  }
  
  try {
    console.log('🔢 Generuję kod zeznania dla świadka:', witness_id, 'typ:', testimony_type);
    
    // Użyj generatora zeznań
    const result = await generateTestimonyCode(case_id, witness_id, testimony_type || 'UST');
    
    console.log('✅ Wygenerowano kod zeznania:', result.code);
    
    res.json({ 
      success: true, 
      testimony_code: result.code,
      case_type_code: result.caseTypeCode,
      initials: result.initials,
      full_case_number: result.fullCaseNumber,
      testimony_number: result.elementNumber
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania kodu zeznania:', error);
    res.status(500).json({ error: 'Błąd generowania kodu zeznania: ' + error.message });
  }
});

// === POBIERZ ŚWIADKÓW SPRAWY ===

// GET / z query param ?case_id=X (dla kompatybilności z frontendem)
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { case_id } = req.query;
  
  if (!case_id) {
    return res.status(400).json({ error: 'Brak case_id' });
  }
  
  const query = `
    SELECT w.*, 
           u.name as created_by_name,
           (SELECT COUNT(*) FROM witness_testimonies WHERE witness_id = w.id) as testimonies_count
    FROM case_witnesses w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.case_id = ?
    ORDER BY w.created_at DESC
  `;
  
  db.all(query, [case_id], (err, witnesses) => {
    if (err) {
      console.error('❌ Błąd pobierania świadków:', err);
      return res.status(500).json({ error: 'Błąd pobierania świadków' });
    }
    
    res.json({ witnesses: witnesses || [] });
  });
});

// GET /case/:caseId (alternatywna ścieżka)
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `
    SELECT w.*, 
           u.name as created_by_name,
           (SELECT COUNT(*) FROM witness_testimonies WHERE witness_id = w.id) as testimonies_count
    FROM case_witnesses w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.case_id = ?
    ORDER BY w.created_at DESC
  `;
  
  db.all(query, [caseId], (err, witnesses) => {
    if (err) {
      console.error('❌ Błąd pobierania świadków:', err);
      return res.status(500).json({ error: 'Błąd pobierania świadków' });
    }
    
    res.json({ witnesses: witnesses || [] });
  });
});

// === POBIERZ POJEDYNCZEGO ŚWIADKA ===

router.get('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  const query = `
    SELECT w.*, 
           u.name as created_by_name,
           c.case_number,
           (SELECT COUNT(*) FROM witness_testimonies WHERE witness_id = w.id) as testimonies_count
    FROM case_witnesses w
    LEFT JOIN users u ON w.created_by = u.id
    LEFT JOIN cases c ON w.case_id = c.id
    WHERE w.id = ?
  `;
  
  db.get(query, [id], (err, witness) => {
    if (err) {
      console.error('❌ Błąd pobierania świadka:', err);
      return res.status(500).json({ error: 'Błąd pobierania świadka' });
    }
    
    if (!witness) {
      return res.status(404).json({ error: 'Świadek nie znaleziony' });
    }
    
    // Pobierz zeznania świadka
    const testimoniesQuery = `
      SELECT * FROM witness_testimonies 
      WHERE witness_id = ? 
      ORDER BY testimony_date DESC
    `;
    
    db.all(testimoniesQuery, [id], (err2, testimonies) => {
      if (err2) {
        console.error('❌ Błąd pobierania zeznań:', err2);
        witness.testimonies = [];
      } else {
        witness.testimonies = testimonies || [];
      }
      
      res.json({ witness });
    });
  });
});

// === DODAJ ŚWIADKA ===

router.post('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const {
    case_id,
    witness_code,
    first_name,
    last_name,
    side,
    relation_to_case,
    contact_phone,
    contact_email,
    address,
    reliability_score,
    notes
  } = req.body;
  
  if (!case_id || !first_name || !last_name) {
    return res.status(400).json({ error: 'Imię, nazwisko i sprawa są wymagane' });
  }
  
  db.run(
    `INSERT INTO case_witnesses (
      case_id, witness_code, first_name, last_name, side, relation_to_case,
      contact_phone, contact_email, address, reliability_score, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      case_id, witness_code, first_name, last_name, side || 'neutral', relation_to_case || 'neutral',
      contact_phone, contact_email, address, reliability_score || 5, notes, userId
    ],
    function(err) {
      if (err) {
        console.error('❌ Błąd dodawania świadka:', err);
        return res.status(500).json({ error: 'Błąd dodawania świadka' });
      }
      
      const witnessId = this.lastID;
      console.log('✅ Dodano świadka:', witnessId);
      
      // 📊 LOGUJ DO HISTORII SPRAWY
      logEmployeeActivity({
        userId: userId,
        actionType: 'witness_added',
        actionCategory: 'witness',
        description: `Dodano świadka: ${first_name} ${last_name} (${side})`,
        caseId: case_id
      });
      
      res.json({ success: true, witnessId: witnessId });
    }
  );
});

// === AKTUALIZUJ ŚWIADKA ===

router.put('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const {
    first_name,
    last_name,
    relation_to_case,
    contact_phone,
    contact_email,
    address,
    reliability_score,
    notes,
    status
  } = req.body;
  
  db.run(
    `UPDATE case_witnesses SET
      first_name = ?, last_name = ?, relation_to_case = ?,
      contact_phone = ?, contact_email = ?, address = ?,
      reliability_score = ?, notes = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      first_name, last_name, relation_to_case,
      contact_phone, contact_email, address,
      reliability_score, notes, status, id
    ],
    function(err) {
      if (err) {
        console.error('❌ Błąd aktualizacji świadka:', err);
        return res.status(500).json({ error: 'Błąd aktualizacji świadka' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Świadek nie znaleziony' });
      }
      
      // 📊 LOGUJ EDYCJĘ DO HISTORII SPRAWY
      const userId = req.user.userId;
      db.get('SELECT case_id FROM case_witnesses WHERE id = ?', [id], (err, witness) => {
        if (!err && witness) {
          logEmployeeActivity({
            userId: userId,
            actionType: 'witness_updated',
            actionCategory: 'witness',
            description: `Zaktualizowano świadka: ${first_name} ${last_name}`,
            caseId: witness.case_id
          });
        }
      });
      
      res.json({ success: true });
    }
  );
});

// === WYCOFAJ ŚWIADKA ===

router.post('/:id/withdraw', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { reason } = req.body;
  
  db.run(
    `UPDATE case_witnesses SET
      status = 'withdrawn',
      withdrawal_date = CURRENT_TIMESTAMP,
      withdrawal_reason = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [reason, id],
    function(err) {
      if (err) {
        console.error('❌ Błąd wycofania świadka:', err);
        return res.status(500).json({ error: 'Błąd wycofania świadka' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Świadek nie znaleziony' });
      }
      
      console.log('✅ Wycofano świadka:', id);
      res.json({ success: true });
    }
  );
});

// === USUŃ ŚWIADKA ===

router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;
  
  // Najpierw pobierz dane świadka do logowania
  db.get('SELECT first_name, last_name, case_id FROM case_witnesses WHERE id = ?', [id], (err, witness) => {
    if (err || !witness) {
      return res.status(404).json({ error: 'Świadek nie znaleziony' });
    }
    
    const witnessName = `${witness.first_name} ${witness.last_name}`;
    const caseId = witness.case_id;
    
    // Usuń zeznania
    db.run('DELETE FROM witness_testimonies WHERE witness_id = ?', [id], (err) => {
      if (err) {
        console.error('❌ Błąd usuwania zeznań:', err);
        return res.status(500).json({ error: 'Błąd usuwania zeznań' });
      }
      
      // Potem usuń świadka
      db.run('DELETE FROM case_witnesses WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('❌ Błąd usuwania świadka:', err);
          return res.status(500).json({ error: 'Błąd usuwania świadka' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Świadek nie znaleziony' });
        }
        
        // 📊 LOGUJ USUNIĘCIE DO HISTORII SPRAWY
        logEmployeeActivity({
          userId: userId,
          actionType: 'witness_deleted',
          actionCategory: 'witness',
          description: `Usunięto świadka: ${witnessName}`,
          caseId: caseId
        });
        
        console.log('✅ Usunięto świadka:', id);
        res.json({ success: true });
      });
    });
  });
});

// ================================================
// ENDPOINTY DLA ZEZNAŃ ŚWIADKÓW
// ================================================

// Pobierz zeznania świadka
router.get('/:witnessId/testimonies', verifyToken, (req, res) => {
  const db = getDatabase();
  const { witnessId } = req.params;
  
  console.log('📝 Pobieranie zeznań świadka:', witnessId);
  
  db.all(
    `SELECT t.*, u.name as recorded_by_name
     FROM witness_testimonies t
     LEFT JOIN users u ON t.recorded_by = u.id
     WHERE t.witness_id = ?
     ORDER BY t.testimony_date DESC, t.version_number DESC`,
    [witnessId],
    (err, testimonies) => {
      if (err) {
        console.error('❌ Błąd pobierania zeznań:', err);
        return res.status(500).json({ error: 'Błąd pobierania zeznań' });
      }
      res.json({ testimonies: testimonies || [] });
    }
  );
});

// Dodaj zeznanie świadka
router.post('/:witnessId/testimonies', verifyToken, (req, res) => {
  const db = getDatabase();
  const { witnessId } = req.params;
  const userId = req.user.userId;
  const {
    testimony_date,
    testimony_type,
    testimony_content,
    credibility_assessment
  } = req.body;
  
  console.log('📝 Dodawanie zeznania świadka:', witnessId);
  
  if (!testimony_content || !testimony_date) {
    return res.status(400).json({ error: 'Treść zeznania i data są wymagane' });
  }
  
  // Sprawdź czy świadek istnieje
  db.get('SELECT id FROM case_witnesses WHERE id = ?', [witnessId], (err, witness) => {
    if (err || !witness) {
      return res.status(404).json({ error: 'Świadek nie znaleziony' });
    }
    
    // Pobierz numer wersji (kolejne zeznanie tego świadka)
    db.get(
      'SELECT MAX(version_number) as max_version FROM witness_testimonies WHERE witness_id = ?',
      [witnessId],
      (err, result) => {
        const nextVersion = (result && result.max_version) ? result.max_version + 1 : 1;
        
        db.run(
          `INSERT INTO witness_testimonies (
            witness_id, testimony_date, testimony_type, testimony_content,
            version_number, credibility_assessment, recorded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            witnessId,
            testimony_date,
            testimony_type || 'written',
            testimony_content,
            nextVersion,
            credibility_assessment || null,
            userId
          ],
          function(err) {
            if (err) {
              console.error('❌ Błąd zapisywania zeznania:', err);
              return res.status(500).json({ error: 'Błąd zapisywania zeznania' });
            }
            
            console.log('✅ Zeznanie dodane, ID:', this.lastID);
            res.json({
              success: true,
              testimony_id: this.lastID,
              version_number: nextVersion
            });
          }
        );
      }
    );
  });
});

// Oznacz zeznanie jako wycofane
router.post('/:witnessId/testimonies/:testimonyId/retract', verifyToken, (req, res) => {
  const db = getDatabase();
  const { testimonyId } = req.params;
  const { retraction_reason } = req.body;
  
  console.log('❌ Wycofywanie zeznania:', testimonyId);
  
  db.run(
    `UPDATE witness_testimonies
     SET is_retracted = 1, retraction_date = CURRENT_TIMESTAMP, retraction_reason = ?
     WHERE id = ?`,
    [retraction_reason || null, testimonyId],
    function(err) {
      if (err) {
        console.error('❌ Błąd wycofywania zeznania:', err);
        return res.status(500).json({ error: 'Błąd wycofywania zeznania' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Zeznanie nie znalezione' });
      }
      
      console.log('✅ Zeznanie wycofane');
      res.json({ success: true });
    }
  );
});

// === ZAPISZ ZEZNANIE PISEMNE JAKO ZAŁĄCZNIK TXT ===

router.post('/:witnessId/testimonies/:testimonyId/save-as-txt', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { witnessId, testimonyId } = req.params;
  const userId = req.user.userId;
  const fs = require('fs');
  const path = require('path');
  
  console.log('📄 Zapisywanie zeznania pisemnego jako TXT:', testimonyId);
  
  try {
    // 1. Pobierz zeznanie
    const testimony = await new Promise((resolve, reject) => {
      db.get(
        `SELECT t.*, w.first_name, w.last_name, w.case_id, w.witness_code
         FROM witness_testimonies t
         LEFT JOIN case_witnesses w ON t.witness_id = w.id
         WHERE t.id = ? AND t.witness_id = ?`,
        [testimonyId, witnessId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!testimony) {
      return res.status(404).json({ error: 'Zeznanie nie znalezione' });
    }
    
    // 2. Pobierz numer sprawy
    const caseData = await new Promise((resolve, reject) => {
      db.get('SELECT case_number FROM cases WHERE id = ?', [testimony.case_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // 3. Wygeneruj kod załącznika (ZAL/...)
    const caseNumber = caseData.case_number || 'BRAK';
    const prefix = `ZAL/${caseNumber}/SWI/`;
    
    const lastAttachment = await new Promise((resolve, reject) => {
      db.get(
        `SELECT attachment_code FROM attachments 
         WHERE case_id = ? AND attachment_code LIKE ?
         ORDER BY attachment_code DESC LIMIT 1`,
        [testimony.case_id, `${prefix}%`],
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
    console.log('📋 Kod załącznika:', attachmentCode);
    
    // 4. Stwórz plik TXT
    const uploadDir = path.join(__dirname, '../uploads/attachments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Zamień "/" na "_" w nazwie pliku (bezpieczeństwo)
    const safeAttachmentCode = attachmentCode.replace(/\//g, '_');
    const filename = `${safeAttachmentCode}_v${testimony.version_number}_${Date.now()}.txt`;
    const filepath = path.join(uploadDir, filename);
    
    // Określ typ zeznania
    let testimonyTypeLabel = 'Inne';
    if (testimony.testimony_type === 'written') {
      testimonyTypeLabel = 'Pisemne';
    } else if (testimony.testimony_type === 'oral') {
      testimonyTypeLabel = 'Ustne (transkrypcja)';
    } else if (testimony.testimony_type === 'recorded') {
      testimonyTypeLabel = 'Nagranie';
    }
    
    // Treść pliku
    const fileContent = `
ZEZNANIE ŚWIADKA
================

Kod załącznika: ${attachmentCode}
Świadek: ${testimony.first_name} ${testimony.last_name}
Kod świadka: ${testimony.witness_code}
Data zeznania: ${new Date(testimony.testimony_date).toLocaleString('pl-PL')}
Typ zeznania: ${testimonyTypeLabel}
Wersja: ${testimony.version_number}

--------------------------------------------------------------------------------

TREŚĆ ZEZNANIA:

${testimony.testimony_content}

--------------------------------------------------------------------------------

${testimony.credibility_assessment ? `
OCENA WIARYGODNOŚCI:
${testimony.credibility_assessment}
` : ''}

${testimony.is_retracted ? `
⚠️ WYCOFANE
Data wycofania: ${new Date(testimony.retraction_date).toLocaleString('pl-PL')}
Powód: ${testimony.retraction_reason}
` : ''}

Data zapisu: ${new Date().toLocaleString('pl-PL')}
`;
    
    fs.writeFileSync(filepath, fileContent, 'utf8');
    console.log('✅ Plik TXT zapisany:', filepath);
    
    // 5. Dodaj załącznik do bazy
    const attachmentId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO attachments (
          case_id, entity_type, entity_id, attachment_code, title, description,
          file_name, file_path, file_size, file_type, category, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testimony.case_id,
          'witness',
          witnessId,
          attachmentCode,
          `Zeznanie pisemne - ${testimony.first_name} ${testimony.last_name} v${testimony.version_number}`,
          `Zeznanie z dnia ${new Date(testimony.testimony_date).toLocaleDateString('pl-PL')}`,
          filename,
          filepath,
          Buffer.byteLength(fileContent, 'utf8'),
          'text/plain',
          'zeznanie',
          userId
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    console.log('✅ Załącznik dodany do bazy, ID:', attachmentId);
    
    res.json({
      success: true,
      attachment_id: attachmentId,
      attachment_code: attachmentCode,
      filename: filename
    });
    
  } catch (error) {
    console.error('❌ Błąd zapisywania zeznania jako TXT:', error);
    res.status(500).json({ error: 'Błąd zapisywania zeznania: ' + error.message });
  }
});

// === GENEROWANIE NUMERU NAGRANIA ZEZNANIA (NOWY SYSTEM v1.0) ===

router.post('/:id/generate-recording-code', verifyToken, async (req, res) => {
  const db = getDatabase();
  const witnessId = req.params.id;
  
  try {
    console.log('🎙️ NOWY SYSTEM: Generuję numer nagrania dla świadka:', witnessId);
    
    // Pobierz case_id świadka
    const witness = await new Promise((resolve, reject) => {
      db.get(
        `SELECT w.*, c.id as case_id 
         FROM case_witnesses w 
         LEFT JOIN cases c ON w.case_id = c.id 
         WHERE w.id = ?`,
        [witnessId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!witness) {
      return res.status(404).json({ error: 'Świadek nie znaleziony' });
    }
    
    // Użyj nowego generatora
    const result = await generateRecordingCode(witness.case_id, witnessId);
    
    console.log('✅ NOWY SYSTEM: Wygenerowano numer nagrania:', result.code);
    
    res.json({ 
      success: true, 
      recording_code: result.code,
      recording_number: result.elementNumber,
      witness_code: witness.witness_code
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania numeru nagrania:', error);
    res.status(500).json({ error: 'Błąd generowania numeru nagrania: ' + error.message });
  }
});

// === POBIERZ ZEZNANIA ŚWIADKA (dla modułu dowodów) ===

router.get('/:id/testimonies', verifyToken, (req, res) => {
  const db = getDatabase();
  const witnessId = req.params.id;
  
  const query = `
    SELECT id, testimony_code, testimony_type, testimony_date, content, created_at
    FROM witness_testimonies
    WHERE witness_id = ?
    ORDER BY testimony_date DESC, created_at DESC
  `;
  
  db.all(query, [witnessId], (err, testimonies) => {
    if (err) {
      console.error('❌ Błąd pobierania zeznań świadka:', err);
      return res.status(500).json({ error: 'Błąd pobierania zeznań' });
    }
    
    console.log(`✅ Pobrano ${testimonies ? testimonies.length : 0} zeznań świadka ${witnessId}`);
    res.json({ testimonies: testimonies || [] });
  });
});

// ================================================
// ENDPOINTY DLA DOKUMENTÓW ŚWIADKÓW
// ================================================

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Konfiguracja uploadu dla dokumentów świadków
const witnessDocsStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/witness-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `witness_${req.params.id}_${uniqueSuffix}${ext}`);
  }
});

const witnessDocsUpload = multer({ 
  storage: witnessDocsStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Upload dokumentów świadka
router.post('/:id/documents', verifyToken, witnessDocsUpload.array('documents', 10), async (req, res) => {
  const db = getDatabase();
  const witnessId = req.params.id;
  const userId = req.user.userId;
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Brak plików do uploadu' });
  }
  
  console.log(`📎 Upload ${files.length} dokumentów dla świadka ${witnessId}`);
  
  try {
    // Pobierz dane świadka
    const witness = await new Promise((resolve, reject) => {
      db.get(
        'SELECT w.*, c.case_number FROM case_witnesses w LEFT JOIN cases c ON w.case_id = c.id WHERE w.id = ?',
        [witnessId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!witness) {
      // Usuń uploady files
      files.forEach(f => fs.unlinkSync(f.path));
      return res.status(404).json({ error: 'Świadek nie znaleziony' });
    }
    
    const uploadedDocs = [];
    
    for (const file of files) {
      // Wygeneruj kod dokumentu w formacie: DOK/SWI/ZEZ/{case_number}/{witness_short}/{seq}
      // witness_code to np. "SW/DLU/TS01/001/006" - weź tylko ostatnią część (006)
      const witnessShortCode = witness.witness_code.split('/').pop();
      const prefix = `DOK/SWI/ZEZ/${witness.case_number}/${witnessShortCode}/`;
      
      // Pobierz ostatni numer dokumentu dla tego świadka
      const lastDoc = await new Promise((resolve, reject) => {
        db.get(
          `SELECT document_code FROM witness_documents 
           WHERE witness_id = ? AND document_code LIKE ?
           ORDER BY document_code DESC LIMIT 1`,
          [witnessId, `${prefix}%`],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      let nextNumber = 1;
      if (lastDoc && lastDoc.document_code) {
        const lastNumberPart = lastDoc.document_code.split('/').pop();
        nextNumber = parseInt(lastNumberPart) + 1;
      }
      
      const documentCode = `${prefix}${String(nextNumber).padStart(3, '0')}`;
      console.log('📋 Kod dokumentu świadka:', documentCode);
      
      // Wczytaj plik jako base64 (dla Railway - pliki efemeralne)
      const fileData = fs.readFileSync(file.path, { encoding: 'base64' });
      console.log('📦 Plik wczytany jako base64:', fileData.length, 'znaków');
      
      const docId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO witness_documents (
            witness_id, case_id, document_code, file_name, file_path, file_size, file_type,
            file_data, document_type, title, uploaded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            witnessId,
            witness.case_id,
            documentCode,
            file.originalname,
            file.path,
            file.size,
            file.mimetype,
            fileData,  // Base64 data
            'general',
            file.originalname,
            userId
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      
      // Usuń plik z dysku po zapisaniu do bazy
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log('🗑️ Plik usunięty z dysku (zapisany w bazie jako base64)');
      }
      
      uploadedDocs.push({
        id: docId,
        document_code: documentCode,
        filename: file.originalname,
        size: file.size
      });
      
      console.log(`✅ Dokument zapisany: ${file.originalname} (ID: ${docId}, Kod: ${documentCode})`);
    }
    
    // Loguj aktywność
    logEmployeeActivity({
      userId: userId,
      actionType: 'witness_documents_added',
      actionCategory: 'witness',
      description: `Dodano ${files.length} dokumentów do świadka: ${witness.first_name} ${witness.last_name}`,
      caseId: witness.case_id
    });
    
    res.json({
      success: true,
      count: uploadedDocs.length,
      documents: uploadedDocs
    });
    
  } catch (error) {
    console.error('❌ Błąd uploadu dokumentów świadka:', error);
    // Usuń pliki w przypadku błędu
    files.forEach(f => {
      try { fs.unlinkSync(f.path); } catch(e) {}
    });
    res.status(500).json({ error: 'Błąd uploadu dokumentów: ' + error.message });
  }
});

// Pobierz dokumenty świadka
router.get('/:id/documents', verifyToken, (req, res) => {
  const db = getDatabase();
  const witnessId = req.params.id;
  
  db.all(
    `SELECT wd.*, u.name as uploaded_by_name
     FROM witness_documents wd
     LEFT JOIN users u ON wd.uploaded_by = u.id
     WHERE wd.witness_id = ?
     ORDER BY wd.uploaded_at DESC`,
    [witnessId],
    (err, documents) => {
      if (err) {
        console.error('❌ Błąd pobierania dokumentów świadka:', err);
        return res.status(500).json({ error: 'Błąd pobierania dokumentów' });
      }
      
      console.log(`✅ Pobrano ${documents ? documents.length : 0} dokumentów świadka ${witnessId}`);
      res.json({ documents: documents || [] });
    }
  );
});

// Pobierz/podejrzyj pojedynczy dokument świadka
router.get('/:witnessId/documents/:docId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { docId } = req.params;
  const isView = req.query.view === 'true';
  
  db.get(
    'SELECT * FROM witness_documents WHERE id = ?',
    [docId],
    (err, doc) => {
      if (err) {
        console.error('❌ Błąd pobierania dokumentu:', err);
        return res.status(500).json({ error: 'Błąd pobierania dokumentu' });
      }
      
      if (!doc) {
        return res.status(404).json({ error: 'Dokument nie znaleziony' });
      }
      
      // PRIORITET 1: Sprawdź czy mamy base64 data w bazie
      if (doc.file_data) {
        console.log('📦 Używam base64 z bazy dla dokumentu:', doc.file_name);
        const buffer = Buffer.from(doc.file_data, 'base64');
        const disposition = isView ? 'inline' : 'attachment';
        
        res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(doc.file_name)}"`);
        
        return res.send(buffer);
      }
      
      // PRIORITET 2: Sprawdź czy plik istnieje na dysku (fallback dla starych plików)
      if (fs.existsSync(doc.file_path)) {
        console.log('📁 Używam pliku z dysku:', doc.file_path);
        const disposition = isView ? 'inline' : 'attachment';
        res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(doc.file_name)}"`);
        res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
        
        return res.sendFile(doc.file_path, (err) => {
          if (err) {
            console.error('❌ Błąd wysyłania pliku:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Błąd pobierania pliku' });
            }
          }
        });
      }
      
      // Brak pliku zarówno w bazie jak i na dysku
      console.error('❌ Plik nie znaleziony ani w bazie ani na dysku:', doc.file_name);
      return res.status(404).json({ error: 'Plik nie znaleziony na serwerze' });
    }
  );
});

// Usuń dokument świadka
router.delete('/:witnessId/documents/:docId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { docId, witnessId } = req.params;
  const userId = req.user.userId;
  
  // Pobierz dane dokumentu
  db.get('SELECT * FROM witness_documents WHERE id = ? AND witness_id = ?', [docId, witnessId], (err, doc) => {
    if (err || !doc) {
      return res.status(404).json({ error: 'Dokument nie znaleziony' });
    }
    
    // Usuń plik fizyczny
    if (fs.existsSync(doc.file_path)) {
      try {
        fs.unlinkSync(doc.file_path);
        console.log('✅ Plik fizyczny usunięty:', doc.file_path);
      } catch (e) {
        console.error('⚠️ Nie można usunąć pliku fizycznego:', e);
      }
    }
    
    // Usuń z bazy
    db.run('DELETE FROM witness_documents WHERE id = ?', [docId], function(err) {
      if (err) {
        console.error('❌ Błąd usuwania dokumentu:', err);
        return res.status(500).json({ error: 'Błąd usuwania dokumentu' });
      }
      
      // Loguj
      logEmployeeActivity({
        userId: userId,
        actionType: 'witness_document_deleted',
        actionCategory: 'witness',
        description: `Usunięto dokument świadka: ${doc.file_name}`,
        caseId: doc.case_id
      });
      
      console.log('✅ Dokument usunięty:', docId);
      res.json({ success: true });
    });
  });
});

module.exports = router;
