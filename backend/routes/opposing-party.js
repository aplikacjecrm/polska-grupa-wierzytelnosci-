const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// === POBIERZ INFORMACJE O STRONIE PRZECIWNEJ ===

// GET / z query param ?case_id=X
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { case_id } = req.query;
  
  if (!case_id) {
    return res.status(400).json({ error: 'Brak case_id' });
  }
  
  const query = `
    SELECT op.*, 
           u.name as created_by_name,
           c.case_number
    FROM opposing_party_info op
    LEFT JOIN users u ON op.created_by = u.id
    LEFT JOIN cases c ON op.case_id = c.id
    WHERE op.case_id = ?
  `;
  
  db.get(query, [case_id], (err, opposingParty) => {
    if (err) {
      console.error('❌ Błąd pobierania strony przeciwnej:', err);
      return res.status(500).json({ error: 'Błąd pobierania strony przeciwnej' });
    }
    
    res.json({ opposingParty: opposingParty || null });
  });
});

// GET /case/:caseId (alternatywna ścieżka)
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `
    SELECT op.*, 
           u.name as created_by_name,
           c.case_number
    FROM opposing_party_info op
    LEFT JOIN users u ON op.created_by = u.id
    LEFT JOIN cases c ON op.case_id = c.id
    WHERE op.case_id = ?
  `;
  
  db.get(query, [caseId], (err, opposingParty) => {
    if (err) {
      console.error('❌ Błąd pobierania strony przeciwnej:', err);
      return res.status(500).json({ error: 'Błąd pobierania strony przeciwnej' });
    }
    
    res.json({ opposingParty: opposingParty || null });
  });
});

// === ZAPISZ/AKTUALIZUJ INFORMACJE O STRONIE PRZECIWNEJ ===

router.post('/case/:caseId', verifyToken, async (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const { caseId } = req.params;
  const {
    party_name,
    party_type,
    legal_representative,
    representative_contact,
    financial_situation,
    credibility_assessment,
    known_tactics,
    weaknesses,
    strengths,
    previous_cases,
    settlement_willingness,
    additional_info,
    ai_analysis
  } = req.body;
  
  if (!party_name) {
    return res.status(400).json({ error: 'Nazwa strony przeciwnej jest wymagana' });
  }
  
  // Sprawdź czy już istnieje
  const existing = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM opposing_party_info WHERE case_id = ?', [caseId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (existing) {
    // UPDATE
    db.run(
      `UPDATE opposing_party_info SET
        party_name = ?, party_type = ?, legal_representative = ?, representative_contact = ?,
        financial_situation = ?, credibility_assessment = ?, known_tactics = ?,
        weaknesses = ?, strengths = ?, previous_cases = ?,
        settlement_willingness = ?, additional_info = ?, ai_analysis = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE case_id = ?`,
      [
        party_name, party_type, legal_representative, representative_contact,
        financial_situation, credibility_assessment, known_tactics,
        weaknesses, strengths, previous_cases,
        settlement_willingness, additional_info, ai_analysis, caseId
      ],
      function(err) {
        if (err) {
          console.error('❌ Błąd aktualizacji:', err);
          return res.status(500).json({ error: 'Błąd aktualizacji' });
        }
        
        console.log('✅ Zaktualizowano stronę przeciwną');
        res.json({ success: true, updated: true });
      }
    );
  } else {
    // INSERT
    db.run(
      `INSERT INTO opposing_party_info (
        case_id, party_name, party_type, legal_representative, representative_contact,
        financial_situation, credibility_assessment, known_tactics,
        weaknesses, strengths, previous_cases,
        settlement_willingness, additional_info, ai_analysis, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caseId, party_name, party_type, legal_representative, representative_contact,
        financial_situation, credibility_assessment, known_tactics,
        weaknesses, strengths, previous_cases,
        settlement_willingness, additional_info, ai_analysis, userId
      ],
      function(err) {
        if (err) {
          console.error('❌ Błąd dodawania:', err);
          return res.status(500).json({ error: 'Błąd dodawania' });
        }
        
        console.log('✅ Dodano stronę przeciwną');
        res.json({ success: true, opposingPartyId: this.lastID });
      }
    );
  }
});

// === POBIERZ ŚWIADKÓW STRONY PRZECIWNEJ ===

router.get('/case/:caseId/witnesses', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `
    SELECT w.*, 
           (SELECT COUNT(*) FROM witness_testimonies WHERE witness_id = w.id) as testimonies_count
    FROM case_witnesses w
    WHERE w.case_id = ? AND w.side = 'opposing_side'
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

// === GENERUJ ANALIZĘ AI DLA STRONY PRZECIWNEJ ===

router.post('/case/:caseId/analyze', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  try {
    // Pobierz wszystkie dane sprawy
    const caseData = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM cases WHERE id = ?', [caseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Pobierz dane strony przeciwnej
    const opposingData = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM opposing_party_info WHERE case_id = ?', [caseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Pobierz świadków strony przeciwnej
    const witnesses = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM case_witnesses WHERE case_id = ? AND side = "opposing_side"', [caseId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Pobierz scenariusze
    const scenarios = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM case_scenarios WHERE case_id = ?', [caseId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Przygotuj dane dla AI
    const aiContext = {
      case: caseData,
      opposing_party: opposingData,
      opposing_witnesses: witnesses,
      scenarios: scenarios,
      analysis_type: 'opposing_party_strategy'
    };
    
    // Tu będzie integracja z AI - na razie zwróć strukturę
    res.json({ 
      success: true, 
      context: aiContext,
      message: 'Dane przygotowane dla analizy AI'
    });
    
  } catch (error) {
    console.error('❌ Błąd przygotowania analizy:', error);
    res.status(500).json({ error: 'Błąd przygotowania analizy' });
  }
});

module.exports = router;
