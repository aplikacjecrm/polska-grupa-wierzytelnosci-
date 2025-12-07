const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { generateEvidenceCode } = require('../utils/code-generator');
const { logEmployeeActivity } = require('../utils/employee-activity');

// === GENEROWANIE KODU DOWODU ===
// WAŻNE: Specyficzne route MUSZĄ być PRZED parametrycznymi!

router.post('/generate-code', verifyToken, async (req, res) => {
  const { case_id } = req.body;
  
  if (!case_id) {
    return res.status(400).json({ error: 'case_id jest wymagane' });
  }
  
  try {
    console.log('🔢 Generuję kod dowodu dla sprawy:', case_id);
    const result = await generateEvidenceCode(case_id, null);
    console.log('✅ Wygenerowano kod dowodu:', result.code);
    
    res.json({ 
      success: true, 
      evidence_code: result.code,
      case_type_code: result.caseTypeCode,
      initials: result.initials,
      full_case_number: result.fullCaseNumber,
      evidence_number: result.elementNumber
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania kodu dowodu:', error);
    res.status(500).json({ error: 'Błąd generowania kodu dowodu: ' + error.message });
  }
});

// === POBIERZ DOWODY SPRAWY (z route param) ===
// MUSI być PRZED /:id aby /case/:caseId nie był traktowany jako /:id

router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `
    SELECT e.*, 
           u.name as created_by_name,
           d.filename as document_name,
           w.first_name || ' ' || w.last_name as witness_name
    FROM case_evidence e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN documents d ON e.document_id = d.id
    LEFT JOIN case_witnesses w ON e.witness_id = w.id
    WHERE e.case_id = ?
    ORDER BY e.created_at DESC
  `;
  
  db.all(query, [caseId], (err, evidence) => {
    if (err) {
      console.error('❌ Błąd pobierania dowodów:', err);
      return res.status(500).json({ error: 'Błąd pobierania dowodów' });
    }
    
    if (evidence && evidence.length > 0) {
      let completed = 0;
      
      evidence.forEach(item => {
        // Licz załączniki z tabeli attachments
        const attachCountQuery = `
          SELECT COUNT(*) as count 
          FROM attachments 
          WHERE entity_type = 'evidence' AND entity_id = ?
        `;
        
        // Licz zlinkowane dokumenty z tabeli evidence_document_links
        const linkedCountQuery = `
          SELECT COUNT(*) as count 
          FROM evidence_document_links 
          WHERE evidence_id = ?
        `;
        
        db.get(attachCountQuery, [item.id], (err2, attachResult) => {
          const attachCount = (!err2 && attachResult) ? attachResult.count : 0;
          
          db.get(linkedCountQuery, [item.id], (err3, linkedResult) => {
            const linkedCount = (!err3 && linkedResult) ? linkedResult.count : 0;
            
            // Suma załączników + zlinkowanych dokumentów
            item.attachments_count = attachCount + linkedCount;
            
            completed++;
            if (completed === evidence.length) {
              const mappedEvidence = evidence.map(e => ({
                ...e,
                title: e.name,
                date_acquired: e.obtained_date
              }));
              console.log(`✅ Zwrócono ${evidence.length} dowodów dla sprawy ${caseId}`);
              res.json({ evidence: mappedEvidence });
            }
          });
        });
      });
    } else {
      console.log(`✅ Brak dowodów dla sprawy ${caseId}`);
      res.json({ evidence: [] });
    }
  });
});

// === POBIERZ POJEDYNCZY DOWÓD ===
// MUSI być PO /case/:caseId

router.get('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const evidenceId = req.params.id;
  
  console.log(`🔍 GET /api/evidence/${evidenceId} - Pobieranie dowodu...`);
  
  const query = `
    SELECT e.*, 
           c.case_number,
           c.title as case_title
    FROM case_evidence e
    LEFT JOIN cases c ON e.case_id = c.id
    WHERE e.id = ?
  `;
  
  db.get(query, [evidenceId], (err, evidence) => {
    if (err) {
      console.error('❌ Błąd pobierania dowodu:', err);
      return res.status(500).json({ error: 'Błąd pobierania dowodu' });
    }
    
    if (!evidence) {
      console.warn(`⚠️ Dowód o ID ${evidenceId} nie znaleziony w bazie`);
      return res.status(404).json({ error: 'Dowód nie znaleziony' });
    }
    
    // Pobierz załączniki
    db.all(
      `SELECT id, file_name as filename, file_path, file_type as mimetype, file_size as filesize, uploaded_at as created_at, uploaded_by, title, attachment_code 
       FROM attachments 
       WHERE entity_type = 'evidence' AND entity_id = ?`,
      [evidenceId],
      (attachErr, attachments) => {
        if (attachErr) {
          console.error('❌ Błąd pobierania załączników:', attachErr);
          evidence.attachments = [];
        } else {
          evidence.attachments = attachments || [];
          console.log(`📎 Znaleziono ${evidence.attachments.length} załączników dla dowodu ${evidenceId}`);
        }
        
        // Pobierz zlinkowane dokumenty
        db.all(
          `SELECT 
            edl.id as link_id,
            edl.document_id,
            edl.attachment_id,
            edl.linked_at,
            COALESCE(d.file_name, d.title, a.file_name, a.title) as filename,
            COALESCE(d.file_type, a.file_type) as mimetype,
            COALESCE(d.file_size, a.file_size) as filesize,
            a.attachment_code,
            CASE WHEN edl.document_id IS NOT NULL THEN 'document' ELSE 'attachment' END as source_type
           FROM evidence_document_links edl
           LEFT JOIN documents d ON edl.document_id = d.id
           LEFT JOIN attachments a ON edl.attachment_id = a.id
           WHERE edl.evidence_id = ?`,
          [evidenceId],
          (linkErr, linkedDocs) => {
            evidence.linkedDocuments = linkedDocs || [];
            console.log(`🔗 Znaleziono ${evidence.linkedDocuments.length} zlinkowanych dokumentów dla dowodu ${evidenceId}`);
            if (linkedDocs && linkedDocs.length > 0) {
              console.log('   Pierwszy link:', JSON.stringify(linkedDocs[0]));
            }
            
            // Pobierz historię zmian
            db.all(
              `SELECT h.*, u.name as changed_by_name 
               FROM evidence_history h 
               LEFT JOIN users u ON h.changed_by = u.id 
               WHERE h.evidence_id = ? 
               ORDER BY h.changed_at DESC`,
              [evidenceId],
              (histErr, history) => {
                evidence.history = history || [];
                
                console.log(`✅ Zwrócono dowód ${evidenceId}: ${evidence.evidence_code} (${evidence.attachments.length} załączników, ${evidence.linkedDocuments.length} linków)`);
                res.json({ evidence });
              }
            );
          }
        );
      }
    );
  });
});

// === POBIERZ DOWODY SPRAWY (z query param) ===

router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const caseId = req.query.case_id;
  
  if (!caseId) {
    return res.status(400).json({ error: 'case_id jest wymagane' });
  }
  
  const query = `
    SELECT e.*, 
           u.name as created_by_name,
           d.filename as document_name,
           w.first_name || ' ' || w.last_name as witness_name
    FROM case_evidence e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN documents d ON e.document_id = d.id
    LEFT JOIN case_witnesses w ON e.witness_id = w.id
    WHERE e.case_id = ?
    ORDER BY e.created_at DESC
  `;
  
  db.all(query, [caseId], (err, evidence) => {
    if (err) {
      console.error('❌ Błąd pobierania dowodów:', err);
      return res.status(500).json({ error: 'Błąd pobierania dowodów' });
    }
    
    // Dla każdego dowodu pobierz liczbę załączników
    if (evidence && evidence.length > 0) {
      let completed = 0;
      
      evidence.forEach(item => {
        const attachCountQuery = `
          SELECT COUNT(*) as count 
          FROM attachments 
          WHERE entity_type = 'evidence' AND entity_id = ?
        `;
        
        db.get(attachCountQuery, [item.id], (err2, result) => {
          if (!err2 && result) {
            item.attachments_count = result.count;
          } else {
            item.attachments_count = 0;
          }
          
          completed++;
          if (completed === evidence.length) {
            // Mapuj nazwy pól dla kompatybilności z frontendem
            const mappedEvidence = evidence.map(e => ({
              ...e,
              title: e.name,  // Frontend używa 'title'
              date_acquired: e.obtained_date  // Frontend używa 'date_acquired'
            }));
            console.log(`✅ Zwrócono ${evidence.length} dowodów dla sprawy ${caseId}`);
            res.json({ evidence: mappedEvidence });
          }
        });
      });
    } else {
      console.log(`✅ Brak dowodów dla sprawy ${caseId}`);
      res.json({ evidence: [] });
    }
  });
});

// === DODAJ DOWÓD ===

router.post('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const {
    case_id,
    evidence_code,
    evidence_type,
    name,
    description,
    obtained_date,
    obtained_from,
    obtained_method,
    presented_by,
    against_party,
    significance,
    credibility_score,
    admissibility,
    status,
    document_id,
    witness_id,
    storage_location,
    physical_condition,
    expert_analysis,
    strengths,
    weaknesses,
    usage_strategy,
    notes,
    // Nowe pola
    source_url,
    social_profile,
    social_platform,
    related_emails,
    related_phones,
    circumstantial_type,
    circumstantial_strength,
    circumstantial_connections,
    alternative_explanations,
    // Zeznanie (tylko ID powiązania)
    testimony_id,
    // Załączniki
    attachments,
    // Dokumenty z systemu (tylko ID - linkowanie bez kopiowania)
    systemDocIds,
    // Załączniki zeznania (ID załączników do zlinkowania)
    testimonyAttachmentIds
  } = req.body;
  
  console.log('📥 POST /evidence - Otrzymane dane:');
  console.log('   - case_id:', case_id);
  console.log('   - name:', name);
  console.log('   - attachments:', attachments ? `${attachments.length} sztuk` : 'brak');
  console.log('   - systemDocIds:', systemDocIds);
  console.log('   - testimonyAttachmentIds:', testimonyAttachmentIds);
  console.log('   - req.body keys:', Object.keys(req.body));
  if (attachments && attachments.length > 0) {
    attachments.forEach((a, i) => {
      console.log(`   - Załącznik ${i+1}: ${a.filename} (${a.size || a.filesize} bytes)`);
    });
  }
  
  if (!case_id || !name || !evidence_type) {
    return res.status(400).json({ error: 'Nazwa, typ i sprawa są wymagane' });
  }
  
  db.run(
    `INSERT INTO case_evidence (
      case_id, evidence_code, evidence_type, name, description,
      obtained_date, obtained_from, obtained_method,
      presented_by, against_party,
      significance, credibility_score, admissibility, status,
      document_id, witness_id,
      storage_location, physical_condition, expert_analysis,
      strengths, weaknesses, usage_strategy, notes,
      source_url, social_profile, social_platform, related_emails, related_phones,
      circumstantial_type, circumstantial_strength, circumstantial_connections, alternative_explanations,
      testimony_id,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      case_id, evidence_code, evidence_type, name, description,
      obtained_date, obtained_from, obtained_method,
      presented_by, against_party,
      significance || 'supporting', credibility_score || 5, admissibility || 'pending', status || 'secured',
      document_id, witness_id,
      storage_location, physical_condition, expert_analysis,
      strengths, weaknesses, usage_strategy, notes,
      source_url, social_profile, social_platform, related_emails, related_phones,
      circumstantial_type, circumstantial_strength, circumstantial_connections, alternative_explanations,
      testimony_id,
      userId
    ],
    function(err) {
      if (err) {
        console.error('❌ Błąd dodawania dowodu:', err);
        return res.status(500).json({ error: 'Błąd dodawania dowodu: ' + err.message });
      }
      
      const evidenceId = this.lastID;
      
      // Dodaj wpis do historii dowodu
      db.run(
        `INSERT INTO evidence_history (evidence_id, action, changed_by, notes)
         VALUES (?, 'created', ?, 'Dowód utworzony')`,
        [evidenceId, userId]
      );
      
      // 📊 LOGUJ DO HISTORII SPRAWY
      logEmployeeActivity({
        userId: userId,
        actionType: 'evidence_added',
        actionCategory: 'evidence',
        description: `Dodano dowód: ${name} (${evidence_type})`,
        caseId: case_id
      });
      
      // Zapisz załączniki jeśli są
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        console.log(`📎 Zapisuję ${attachments.length} załączników do dowodu ${evidenceId}...`);
        
        attachments.forEach((attachment, index) => {
          const attachCode = `ATT/EVI/${evidenceId}/${index + 1}`;
          const fileName = attachment.filename || `załącznik_${index + 1}`;
          
          db.run(
            `INSERT INTO attachments (
              case_id, entity_type, entity_id, attachment_code, title, file_name, file_path,
              file_size, file_type, file_data, mimetype, filename, filesize, uploaded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              case_id,   // case_id
              'evidence',
              evidenceId,
              attachCode,
              fileName,  // title
              fileName,  // file_name
              `evidence/${evidenceId}/${fileName}`,  // file_path (wirtualna ścieżka)
              attachment.size || attachment.filesize || 0,
              attachment.mimetype || 'application/octet-stream',
              attachment.data,
              attachment.mimetype || 'application/octet-stream',
              fileName,  // filename
              attachment.size || attachment.filesize || 0,
              userId
            ],
            (attachErr) => {
              if (attachErr) {
                console.error(`❌ Błąd zapisywania załącznika ${fileName}:`, attachErr);
              } else {
                console.log(`✅ Załącznik ${fileName} zapisany (${attachCode})`);
              }
            }
          );
        });
      }
      
      // Linkowanie dokumentów z systemu (tylko relacja, bez duplikowania)
      if (systemDocIds && Array.isArray(systemDocIds) && systemDocIds.length > 0) {
        console.log(`🔗 Linkuję ${systemDocIds.length} dokumentów z systemu do dowodu ${evidenceId}...`);
        
        systemDocIds.forEach((docId) => {
          db.get('SELECT * FROM documents WHERE id = ?', [docId], (docErr, doc) => {
            if (!docErr && doc) {
              db.run(
                `INSERT OR IGNORE INTO evidence_document_links (evidence_id, document_id, linked_by) VALUES (?, ?, ?)`,
                [evidenceId, docId, userId],
                (linkErr) => {
                  if (linkErr) console.error(`❌ Błąd linkowania dokumentu:`, linkErr);
                  else console.log(`✅ Dokument ${doc.file_name || doc.title} zlinkowany do dowodu ${evidenceId}`);
                }
              );
            } else {
              db.get('SELECT * FROM attachments WHERE id = ?', [docId], (attErr, att) => {
                if (!attErr && att) {
                  db.run(
                    `INSERT OR IGNORE INTO evidence_document_links (evidence_id, attachment_id, linked_by) VALUES (?, ?, ?)`,
                    [evidenceId, docId, userId],
                    (linkErr) => {
                      if (linkErr) console.error(`❌ Błąd linkowania załącznika:`, linkErr);
                      else console.log(`✅ Załącznik ${att.file_name || att.filename} zlinkowany do dowodu ${evidenceId}`);
                    }
                  );
                }
              });
            }
          });
        });
      }
      
      // Linkowanie załączników zeznania
      if (testimonyAttachmentIds && Array.isArray(testimonyAttachmentIds) && testimonyAttachmentIds.length > 0) {
        console.log(`📎 Linkuję ${testimonyAttachmentIds.length} załączników zeznania do dowodu ${evidenceId}...`);
        console.log('   IDs:', testimonyAttachmentIds);
        
        testimonyAttachmentIds.forEach((attId) => {
          const attachmentId = parseInt(attId, 10);
          console.log(`   Szukam załącznika ID: ${attachmentId}`);
          
          db.get('SELECT * FROM attachments WHERE id = ?', [attachmentId], (attErr, att) => {
            if (attErr) {
              console.error(`❌ Błąd szukania załącznika ${attachmentId}:`, attErr);
              return;
            }
            if (!att) {
              console.warn(`⚠️ Załącznik ${attachmentId} nie znaleziony w bazie`);
              return;
            }
            
            console.log(`   Znaleziono załącznik: ${att.file_name || att.title}`);
            db.run(
              `INSERT OR IGNORE INTO evidence_document_links (evidence_id, attachment_id, linked_by) VALUES (?, ?, ?)`,
              [evidenceId, attachmentId, userId],
              function(linkErr) {
                if (linkErr) {
                  console.error(`❌ Błąd linkowania załącznika zeznania:`, linkErr);
                } else {
                  console.log(`✅ Załącznik zeznania ${att.file_name || att.title} zlinkowany do dowodu ${evidenceId}, lastID: ${this.lastID}, changes: ${this.changes}`);
                }
              }
            );
          });
        });
      } else {
        console.log('📎 Brak załączników zeznania do zlinkowania');
      }
      
      console.log('✅ Dowód dodany:', evidenceId);
      res.json({ 
        success: true, 
        evidence_id: evidenceId,
        message: 'Dowód dodany pomyślnie',
        attachments_count: attachments ? attachments.length : 0,
        docs_linked: systemDocIds ? systemDocIds.length : 0,
        testimony_attachments_linked: testimonyAttachmentIds ? testimonyAttachmentIds.length : 0
      });
    }
  );
});

// === AKTUALIZUJ DOWÓD ===

router.put('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const { id } = req.params;
  const {
    evidence_type,
    name,
    description,
    obtained_date,
    obtained_from,
    obtained_method,
    presented_by,
    against_party,
    significance,
    credibility_score,
    admissibility,
    status,
    presented_date,
    court_decision,
    document_id,
    witness_id,
    storage_location,
    physical_condition,
    expert_analysis,
    strengths,
    weaknesses,
    usage_strategy,
    notes,
    // Nowe pola
    source_url,
    social_profile,
    social_platform,
    related_emails,
    related_phones,
    circumstantial_type,
    circumstantial_strength,
    circumstantial_connections,
    alternative_explanations,
    testimony_id,
    // Załączniki
    attachments,
    // Dokumenty z systemu (tylko ID - linkowanie bez kopiowania)
    systemDocIds
  } = req.body;
  
  // Najpierw pobierz stare wartości
  db.get('SELECT * FROM case_evidence WHERE id = ?', [id], (err, oldEvidence) => {
    if (err || !oldEvidence) {
      return res.status(404).json({ error: 'Dowód nie znaleziony' });
    }
    
    db.run(
      `UPDATE case_evidence SET
        evidence_type = ?, name = ?, description = ?,
        obtained_date = ?, obtained_from = ?, obtained_method = ?,
        presented_by = ?, against_party = ?,
        significance = ?, credibility_score = ?, admissibility = ?, status = ?,
        presented_date = ?, court_decision = ?,
        document_id = ?, witness_id = ?,
        storage_location = ?, physical_condition = ?, expert_analysis = ?,
        strengths = ?, weaknesses = ?, usage_strategy = ?, notes = ?,
        source_url = ?, social_profile = ?, social_platform = ?,
        related_emails = ?, related_phones = ?,
        circumstantial_type = ?, circumstantial_strength = ?,
        circumstantial_connections = ?, alternative_explanations = ?,
        testimony_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        evidence_type, name, description,
        obtained_date, obtained_from, obtained_method,
        presented_by, against_party,
        significance, credibility_score, admissibility, status,
        presented_date, court_decision,
        document_id, witness_id,
        storage_location, physical_condition, expert_analysis,
        strengths, weaknesses, usage_strategy, notes,
        source_url, social_profile, social_platform,
        related_emails, related_phones,
        circumstantial_type, circumstantial_strength,
        circumstantial_connections, alternative_explanations,
        testimony_id,
        id
      ],
      function(err) {
        if (err) {
          console.error('❌ Błąd aktualizacji dowodu:', err);
          return res.status(500).json({ error: 'Błąd aktualizacji dowodu' });
        }
        
        // Zapisz zmiany do historii
        if (oldEvidence.status !== status) {
          db.run(
            `INSERT INTO evidence_history (evidence_id, action, field_changed, old_value, new_value, changed_by)
             VALUES (?, 'status_changed', 'status', ?, ?, ?)`,
            [id, oldEvidence.status, status, userId]
          );
        }
        
        // Zapisz nowe załączniki jeśli są
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
          console.log(`📎 Zapisuję ${attachments.length} nowych załączników do dowodu ${id}...`);
          
          attachments.forEach((attachment, index) => {
            const attachCode = `ATT/EVI/${id}/${Date.now()}_${index + 1}`;
            const fileName = attachment.filename || `załącznik_${index + 1}`;
            
            db.run(
              `INSERT INTO attachments (
                case_id, entity_type, entity_id, attachment_code, title, file_name, file_path,
                file_size, file_type, file_data, mimetype, filename, filesize, uploaded_by
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                oldEvidence.case_id,  // case_id z dowodu
                'evidence',
                id,
                attachCode,
                fileName,  // title
                fileName,  // file_name
                `evidence/${id}/${fileName}`,  // file_path (wirtualna)
                attachment.size || attachment.filesize || 0,
                attachment.mimetype || 'application/octet-stream',
                attachment.data,
                attachment.mimetype || 'application/octet-stream',
                fileName,  // filename
                attachment.size || attachment.filesize || 0,
                userId
              ],
              (attachErr) => {
                if (attachErr) {
                  console.error(`❌ Błąd zapisywania załącznika ${fileName}:`, attachErr);
                } else {
                  console.log(`✅ Załącznik ${fileName} zapisany (${attachCode})`);
                }
              }
            );
          });
        }
        
        // Linkowanie dokumentów z systemu (tylko relacja, bez duplikowania)
        if (systemDocIds && Array.isArray(systemDocIds) && systemDocIds.length > 0) {
          console.log(`🔗 Linkuję ${systemDocIds.length} dokumentów z systemu do dowodu ${id}...`);
          
          systemDocIds.forEach((docId) => {
            // Sprawdź czy to dokument czy attachment
            db.get('SELECT * FROM documents WHERE id = ?', [docId], (docErr, doc) => {
              if (!docErr && doc) {
                // To jest dokument - zapisz tylko link
                db.run(
                  `INSERT OR IGNORE INTO evidence_document_links (evidence_id, document_id, linked_by) VALUES (?, ?, ?)`,
                  [id, docId, userId],
                  (linkErr) => {
                    if (linkErr) console.error(`❌ Błąd linkowania dokumentu:`, linkErr);
                    else console.log(`✅ Dokument ${doc.file_name || doc.title} zlinkowany do dowodu ${id}`);
                  }
                );
              } else {
                // Sprawdź czy to attachment
                db.get('SELECT * FROM attachments WHERE id = ?', [docId], (attErr, att) => {
                  if (!attErr && att) {
                    db.run(
                      `INSERT OR IGNORE INTO evidence_document_links (evidence_id, attachment_id, linked_by) VALUES (?, ?, ?)`,
                      [id, docId, userId],
                      (linkErr) => {
                        if (linkErr) console.error(`❌ Błąd linkowania załącznika:`, linkErr);
                        else console.log(`✅ Załącznik ${att.file_name || att.filename} zlinkowany do dowodu ${id}`);
                      }
                    );
                  } else {
                    console.error(`❌ Dokument/załącznik ${docId} nie znaleziony`);
                  }
                });
              }
            });
          });
        }
        
        // 📊 LOGUJ EDYCJĘ DO HISTORII SPRAWY
        logEmployeeActivity({
          userId: userId,
          actionType: 'evidence_updated',
          actionCategory: 'evidence',
          description: `Zaktualizowano dowód: ${name || oldEvidence.name}`,
          caseId: oldEvidence.case_id
        });
        
        console.log('✅ Dowód zaktualizowany:', id);
        res.json({ 
          success: true, 
          message: 'Dowód zaktualizowany pomyślnie',
          attachments_added: attachments ? attachments.length : 0,
          docs_linked: systemDocIds ? systemDocIds.length : 0
        });
      }
    );
  });
});

// === USUŃ DOWÓD ===

router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;
  
  // Najpierw pobierz dane dowodu do logowania
  db.get('SELECT name, case_id FROM case_evidence WHERE id = ?', [id], (err, evidence) => {
    if (err || !evidence) {
      return res.status(404).json({ error: 'Dowód nie znaleziony' });
    }
    
    const evidenceName = evidence.name;
    const caseId = evidence.case_id;
    
    db.run('DELETE FROM case_evidence WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('❌ Błąd usuwania dowodu:', err);
        return res.status(500).json({ error: 'Błąd usuwania dowodu' });
      }
      
      // 📊 LOGUJ USUNIĘCIE DO HISTORII SPRAWY
      logEmployeeActivity({
        userId: userId,
        actionType: 'evidence_deleted',
        actionCategory: 'evidence',
        description: `Usunięto dowód: ${evidenceName}`,
        caseId: caseId
      });
      
      console.log('✅ Dowód usunięty:', id);
      res.json({ 
        success: true, 
        message: 'Dowód usunięty pomyślnie' 
      });
    });
  });
});

// === PRZEDSTAW DOWÓD W SĄDZIE ===

router.post('/:id/present', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const { id } = req.params;
  const { presented_date, notes } = req.body;
  
  db.run(
    `UPDATE case_evidence SET
      status = 'presented',
      presented_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [presented_date || new Date().toISOString().split('T')[0], id],
    function(err) {
      if (err) {
        console.error('❌ Błąd przedstawienia dowodu:', err);
        return res.status(500).json({ error: 'Błąd przedstawienia dowodu' });
      }
      
      // Dodaj wpis do historii
      db.run(
        `INSERT INTO evidence_history (evidence_id, action, changed_by, notes)
         VALUES (?, 'presented', ?, ?)`,
        [id, userId, notes || 'Dowód przedstawiony w sądzie']
      );
      
      console.log('✅ Dowód przedstawiony:', id);
      res.json({ 
        success: true, 
        message: 'Dowód oznaczony jako przedstawiony' 
      });
    }
  );
});

module.exports = router;
