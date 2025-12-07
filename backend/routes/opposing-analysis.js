// ==========================================
// MODUŁ ANALIZY STRONY PRZECIWNEJ - SPRINT 1 MVP
// Guided Workflow + Evidence Bank + AI Analysis
// ==========================================

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const companyLookup = require('../utils/company-lookup');
const path = require('path');
const fs = require('fs');

// Upewnij się że folder uploads istnieje
const uploadsDir = path.join(__dirname, '../uploads/opposing_evidence/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Utworzono folder:', uploadsDir);
}

// Konfiguracja uploadów
const upload = multer({ 
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ==========================================
// 1. PODSTAWOWE OPERACJE CRUD
// ==========================================

// GET - Pobierz dane przeciwnika dla sprawy
router.get('/case/:caseId', async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  try {
    const opposing = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM opposing_party WHERE case_id = ?', [caseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!opposing) {
      return res.json({ opposing: null, exists: false });
    }
    
    // Pobierz powiązane dane
    const [witnesses, evidence, checklist, social, cases] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_witnesses WHERE opposing_party_id = ?', [opposing.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_evidence WHERE opposing_party_id = ? ORDER BY created_at DESC', [opposing.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_checklist WHERE opposing_party_id = ? ORDER BY step_number', [opposing.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_social WHERE opposing_party_id = ?', [opposing.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_cases WHERE opposing_party_id = ? ORDER BY date DESC', [opposing.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      })
    ]);
    
    res.json({
      opposing,
      witnesses,
      evidence,
      checklist,
      social,
      previousCases: cases,
      exists: true
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania danych przeciwnika:', error);
    res.status(500).json({ error: 'Błąd pobierania danych' });
  }
});

// POST - Rozpocznij analizę (utwórz rekord)
router.post('/case/:caseId/start', async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  const { name, party_type } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nazwa przeciwnika jest wymagana' });
  }
  
  try {
    // Sprawdź czy już istnieje
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM opposing_party WHERE case_id = ?', [caseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existing) {
      return res.json({ opposingId: existing.id, message: 'Analiza już istnieje' });
    }
    
    // Utwórz nowy rekord
    const opposingId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO opposing_party (case_id, name, party_type, analysis_status) VALUES (?, ?, ?, 'in_progress')`,
        [caseId, name, party_type || 'individual'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Utwórz checklist (7 kroków)
    const steps = [
      'Podstawowa identyfikacja',
      'Flash check finansowy',
      'Social Media Scan',
      'Historia sądowa',
      'Taktyki procesowe',
      'Pełnomocnik prawny',
      'Podsumowanie i AI'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO opposing_party_checklist (opposing_party_id, step_number, step_name) VALUES (?, ?, ?)',
          [opposingId, i + 1, steps[i]],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    console.log(`✅ Rozpoczęto analizę przeciwnika: ${name} (ID: ${opposingId})`);
    res.json({ success: true, opposingId, message: 'Analiza rozpoczęta' });
    
  } catch (error) {
    console.error('❌ Błąd rozpoczynania analizy:', error);
    res.status(500).json({ error: 'Błąd rozpoczynania analizy' });
  }
});

// PUT - Aktualizuj dane przeciwnika
router.put('/:opposingId', async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  const data = req.body;
  
  console.log('📝 PUT /opposing-analysis/' + opposingId, 'Data:', data);
  
  try {
    const fields = [];
    const values = [];
    
    // Dozwolone kolumny w tabeli opposing_party (po migracji)
    const allowedFields = [
      // Podstawowe
      'name', 'party_type', 'nip', 'regon', 'krs', 'pesel', 'address', 'phone', 'email', 'notes',
      // Krok 2: Finansowe
      'financial_capital', 'financial_status', 'financial_debt', 'financial_krd', 'financial_notes',
      // Krok 3: Social Media
      'social_profiles', 'social_reputation', 'social_notes',
      // Krok 4: Historia
      'history_cases_count', 'history_outcome', 'history_notes',
      // Krok 5: Taktyki
      'tactics_style', 'tactic_delays', 'tactic_motions', 'tactic_settlement', 
      'tactic_witnesses', 'tactic_evidence', 'tactics_notes',
      // Krok 6: Pełnomocnik
      'lawyer_name', 'lawyer_firm', 'lawyer_phone', 'lawyer_email', 
      'lawyer_experience', 'lawyer_aggressiveness', 'lawyer_notes',
      // Krok 7: Podsumowanie
      'summary_notes',
      // Workflow
      'analysis_status', 'workflow_step', 'workflow_completed',
      // Stare pola (zachowane dla kompatybilności)
      'debt_amount', 'risk_level', 'litigation_style', 'win_rate', 
      'swot_weaknesses', 'swot_strengths', 'chance_of_winning'
    ];
    
    // Dynamiczne budowanie zapytania UPDATE - tylko dozwolone kolumny
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Brak danych do aktualizacji' });
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(opposingId);
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE opposing_party SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`✅ Zaktualizowano dane przeciwnika ID: ${opposingId}`);
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Błąd aktualizacji:', error);
    res.status(500).json({ error: 'Błąd aktualizacji' });
  }
});

// ==========================================
// 2. GUIDED WORKFLOW - CHECKLIST
// ==========================================

// POST - Oznacz krok jako wykonany
router.post('/:opposingId/checklist/:stepNumber', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { opposingId, stepNumber } = req.params;
  const { checked, notes } = req.body;
  
  try {
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE opposing_party_checklist 
         SET checked = ?, notes = ?, checked_at = CURRENT_TIMESTAMP 
         WHERE opposing_party_id = ? AND step_number = ?`,
        [checked ? 1 : 0, notes || null, opposingId, stepNumber],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Aktualizuj workflow_step w głównej tabeli
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE opposing_party SET workflow_step = ? WHERE id = ?',
        [stepNumber, opposingId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Błąd aktualizacji checklisty:', error);
    res.status(500).json({ error: 'Błąd aktualizacji checklisty' });
  }
});

// ==========================================
// 3. EVIDENCE BANK - UPLOAD & PASTE
// ==========================================

// POST - Upload pliku (screenshot, dokument)
router.post('/:opposingId/evidence/upload', verifyToken, upload.single('file'), async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  const { title, description, evidence_type, tags, source_url } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Brak pliku' });
  }
  
  try {
    const fileType = req.file.mimetype;
    const filePath = `/uploads/opposing_evidence/${req.file.filename}`;
    
    const evidenceId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO opposing_party_evidence 
         (opposing_party_id, evidence_type, title, description, file_path, file_type, tags, source_url, captured_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [opposingId, evidence_type || 'screenshot', title, description, filePath, fileType, tags, source_url],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    console.log(`✅ Dodano dowód ID: ${evidenceId}`);
    res.json({ success: true, evidenceId, filePath });
    
  } catch (error) {
    console.error('❌ Błąd uploadu dowodu:', error);
    res.status(500).json({ error: 'Błąd uploadu' });
  }
});

// POST - Wklej tekst (z posta social media)
router.post('/:opposingId/evidence/paste', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  const { text, title, source_url, evidence_type } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Brak tekstu' });
  }
  
  try {
    const evidenceId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO opposing_party_evidence 
         (opposing_party_id, evidence_type, title, description, ocr_text, source_url, captured_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [opposingId, evidence_type || 'text_paste', title || 'Wklejony tekst', '', text, source_url],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    console.log(`✅ Dodano tekst ID: ${evidenceId}`);
    res.json({ success: true, evidenceId });
    
  } catch (error) {
    console.error('❌ Błąd zapisu tekstu:', error);
    res.status(500).json({ error: 'Błąd zapisu tekstu' });
  }
});

// DELETE - Usuń dowód
router.delete('/evidence/:evidenceId', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { evidenceId } = req.params;
  
  try {
    // Pobierz ścieżkę pliku
    const evidence = await new Promise((resolve, reject) => {
      db.get('SELECT file_path FROM opposing_party_evidence WHERE id = ?', [evidenceId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Usuń plik fizyczny
    if (evidence && evidence.file_path) {
      const fullPath = path.join(__dirname, '..', evidence.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    // Usuń z bazy
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM opposing_party_evidence WHERE id = ?', [evidenceId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ Usunięto dowód ID: ${evidenceId}`);
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Błąd usuwania dowodu:', error);
    res.status(500).json({ error: 'Błąd usuwania' });
  }
});

// ==========================================
// 4. AI ANALYSIS
// ==========================================

// POST - Analizuj tekst (red flags, sentiment)
router.post('/:opposingId/analyze/text', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  const { text, evidenceId } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Brak tekstu do analizy' });
  }
  
  try {
    // MOCK AI ANALYSIS - W przyszłości OpenAI
    const analysis = mockAIAnalysis(text);
    
    // Zapisz analizę do dowodu jeśli podano evidenceId
    if (evidenceId) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE opposing_party_evidence 
           SET ai_analysis = ?, red_flags = ?, sentiment = ? 
           WHERE id = ?`,
          [JSON.stringify(analysis), JSON.stringify(analysis.redFlags), analysis.sentiment, evidenceId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    res.json({ success: true, analysis });
    
  } catch (error) {
    console.error('❌ Błąd analizy AI:', error);
    res.status(500).json({ error: 'Błąd analizy' });
  }
});

// POST - Generuj pełny raport AI
router.post('/:opposingId/generate-report', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  
  try {
    // Pobierz wszystkie dane
    const [opposing, evidence, witnesses, cases] = await Promise.all([
      new Promise((resolve, reject) => {
        db.get('SELECT * FROM opposing_party WHERE id = ?', [opposingId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_evidence WHERE opposing_party_id = ?', [opposingId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_witnesses WHERE opposing_party_id = ?', [opposingId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM opposing_party_cases WHERE opposing_party_id = ?', [opposingId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      })
    ]);
    
    // MOCK AI REPORT - W przyszłości OpenAI
    const report = generateMockReport(opposing, evidence, witnesses, cases);
    
    res.json({ success: true, report });
    
  } catch (error) {
    console.error('❌ Błąd generowania raportu:', error);
    res.status(500).json({ error: 'Błąd generowania raportu' });
  }
});

// ==========================================
// 5. SOCIAL MEDIA TRACKING
// ==========================================

// POST - Dodaj profil social media
router.post('/:opposingId/social', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  const { platform, profile_url, username } = req.body;
  
  if (!platform || !profile_url) {
    return res.status(400).json({ error: 'Platforma i URL są wymagane' });
  }
  
  try {
    const socialId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO opposing_party_social (opposing_party_id, platform, profile_url, username, last_checked) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [opposingId, platform, profile_url, username],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    console.log(`✅ Dodano profil ${platform} ID: ${socialId}`);
    res.json({ success: true, socialId });
    
  } catch (error) {
    console.error('❌ Błąd dodawania profilu:', error);
    res.status(500).json({ error: 'Błąd dodawania profilu' });
  }
});

// ==========================================
// POMOCNICZE FUNKCJE - MOCK AI
// ==========================================

function mockAIAnalysis(text) {
  const lowerText = text.toLowerCase();
  const redFlags = [];
  
  // Detekcja red flags
  if (lowerText.includes('nie zapłac') || lowerText.includes('nie płac')) {
    redFlags.push({ type: 'payment_refusal', severity: 'high', text: 'Odmowa płatności' });
  }
  if (lowerText.includes('groź') || lowerText.includes('grożę')) {
    redFlags.push({ type: 'threats', severity: 'critical', text: 'Groźby' });
  }
  if (lowerText.includes('nic nie udowod')) {
    redFlags.push({ type: 'denial', severity: 'medium', text: 'Zaprzeczanie faktom' });
  }
  if (lowerText.includes('zobaczymy w sądzie') || lowerText.includes('do sądu')) {
    redFlags.push({ type: 'litigation_threat', severity: 'medium', text: 'Groźba procesowa' });
  }
  
  // Sentiment analysis (prosty)
  let sentiment = 'neutral';
  const negativeWords = ['nie', 'groź', 'oszust', 'kłam', 'krzywda'];
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (negativeCount > 2) sentiment = 'negative';
  else if (negativeCount > 0) sentiment = 'somewhat_negative';
  
  return {
    redFlags,
    sentiment,
    summary: `Wykryto ${redFlags.length} potencjalnych red flags. Sentiment: ${sentiment}.`,
    recommendations: redFlags.length > 0 
      ? ['Zachowaj jako dowód charakteru strony', 'Przygotuj się na agresywną obronę']
      : ['Brak poważnych ostrzeżeń w tekście']
  };
}

function generateMockReport(opposing, evidence, witnesses, cases) {
  const wonCases = cases.filter(c => c.outcome === 'won').length;
  const lostCases = cases.filter(c => c.outcome === 'lost').length;
  const totalCases = cases.length;
  
  const winRate = totalCases > 0 ? Math.round((wonCases / totalCases) * 100) : 0;
  
  // Analiza dowodów
  const redFlagsCount = evidence.filter(e => e.red_flags && JSON.parse(e.red_flags).length > 0).length;
  
  return {
    summary: {
      name: opposing.name,
      chanceOfWinning: opposing.chance_of_winning || 50,
      riskLevel: opposing.risk_level || 'unknown',
      winRate: winRate
    },
    strengths: [
      'Doświadczony pełnomocnik',
      'Stabilna sytuacja finansowa'
    ],
    weaknesses: [
      'Brak pełnej dokumentacji',
      `${redFlagsCount} red flags w social media`,
      'Historia przegranych spraw'
    ],
    recommendations: [
      'Zaatakuj brak dokumentacji',
      'Użyj dowodów z social media',
      'Przygotuj się na agresywną taktykę'
    ],
    keyQuestions: [
      'Dlaczego brakuje dokumentu X?',
      'Jak wyjaśnia Pan post z dnia Y?',
      'Czy potwierdza Pan zadłużenie Z?'
    ],
    metrics: {
      evidenceCount: evidence.length,
      witnessCount: witnesses.length,
      previousCases: totalCases,
      redFlags: redFlagsCount
    }
  };
}

// ==========================================
// 10. AUTO-LOOKUP NIP/KRS/REGON
// ==========================================

// GET - Lookup danych firmy po NIP/KRS/REGON
router.get('/lookup/:type/:value', async (req, res) => {
  const { type, value } = req.params;
  
  console.log(`🔍 ENDPOINT: Lookup ${type} = ${value}`);
  
  try {
    let lookupData = null;
    
    switch(type) {
      case 'nip':
        console.log('📡 ENDPOINT: Wywołuję lookupByNIP...');
        lookupData = await companyLookup.lookupByNIP(value);
        console.log('📥 ENDPOINT: lookupByNIP zwrócił:', lookupData ? 'DANE' : 'NULL');
        break;
      case 'krs':
        lookupData = companyLookup.lookupByKRS(value);
        break;
      case 'regon':
        lookupData = await companyLookup.lookupByREGON(value);
        break;
      default:
        return res.status(400).json({ error: 'Nieprawidłowy typ lookup' });
    }
    
    if (lookupData) {
      console.log('✅ ENDPOINT: Mam dane, mapuję...');
      // Mapuj na pola opposing_party
      const mappedData = companyLookup.mapToOpposingFields(lookupData);
      console.log('📤 ENDPOINT: Zwracam zmapowane dane');
      res.json({ success: true, data: mappedData });
    } else {
      console.log('❌ ENDPOINT: Brak danych - zwracam error');
      res.json({ success: false, message: 'Nie znaleziono danych' });
    }
    
  } catch (error) {
    console.error(`❌ Błąd lookup ${type}:`, error);
    res.status(500).json({ error: 'Błąd pobierania danych' });
  }
});

// ==========================================
// STARE FUNKCJE LOOKUP USUNIĘTE
// Używamy teraz: utils/company-lookup.js
// ==========================================

// ==========================================
// DELETE - Usuń analizę (cascade delete)
// ==========================================

router.delete('/:opposingId', async (req, res) => {
  const db = getDatabase();
  const { opposingId } = req.params;
  
  console.log(`🗑️ Usuwanie analizy ID: ${opposingId}`);
  
  try {
    // Usuń checklist
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM opposing_party_checklist WHERE opposing_party_id = ?', [opposingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('  ✅ Usunięto checklist');
    
    // Usuń evidence
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM opposing_party_evidence WHERE opposing_party_id = ?', [opposingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('  ✅ Usunięto evidence');
    
    // Usuń social media
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM opposing_party_social WHERE opposing_party_id = ?', [opposingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('  ✅ Usunięto social media');
    
    // Usuń główny rekord
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM opposing_party WHERE id = ?', [opposingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('  ✅ Usunięto główny rekord');
    
    console.log(`✅ Analiza ID ${opposingId} całkowicie usunięta`);
    res.json({ success: true, message: 'Analiza usunięta' });
    
  } catch (error) {
    console.error('❌ Błąd usuwania analizy:', error);
    res.status(500).json({ error: 'Błąd usuwania analizy' });
  }
});

module.exports = router;
