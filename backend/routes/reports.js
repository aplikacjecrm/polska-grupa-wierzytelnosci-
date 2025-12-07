const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const crypto = require('crypto');

// Generowanie unikalnego tokenu
function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generowanie kodu raportu
async function generateReportCode(caseId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    // Pobierz dane sprawy
    db.get('SELECT case_number FROM cases WHERE id = ?', [caseId], (err, caseData) => {
      if (err) {
        return reject(err);
      }
      
      if (!caseData) {
        return reject(new Error('Sprawa nie znaleziona'));
      }
      
      // Pobierz licznik raportów dla tej sprawy
      db.get(
        'SELECT COUNT(*) as count FROM event_reports WHERE case_id = ?',
        [caseId],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          
          const reportNumber = String(result.count + 1).padStart(3, '0');
          // Format: RAP/CYW/JK/001/001
          const reportCode = `RAP/${caseData.case_number}/${reportNumber}`;
          
          resolve(reportCode);
        }
      );
    });
  });
}

// POST /api/reports/generate - Generowanie raportu
router.post('/generate', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { eventId } = req.body;
  const userId = req.user?.id || 1; // Fallback do user ID 1 jeśli brak
  
  try {
    // Pobierz wydarzenie
    const event = await new Promise((resolve, reject) => {
      db.get(
        `SELECT e.*, c.case_number, c.id as case_id
         FROM events e
         LEFT JOIN cases c ON e.case_id = c.id
         WHERE e.id = ?`,
        [eventId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Wydarzenie nie znalezione' });
    }
    
    // Generuj kod raportu
    const reportCode = await generateReportCode(event.case_id);
    
    // Generuj token dostępu
    const accessToken = generateAccessToken();
    
    // Data wygaśnięcia (30 dni)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Przygotuj dane raportu (JSON)
    const reportData = JSON.stringify({
      event: {
        id: event.id,
        title: event.title,
        start_date: event.start_date,
        location: event.location,
        description: event.description,
        event_type: event.event_type,
        extra_data: event.extra_fields || event.extra_data
      },
      generated_at: new Date().toISOString()
    });
    
    // Zapisz raport do bazy
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO event_reports 
         (report_code, event_id, case_id, event_type, generated_by, report_data, access_token, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [reportCode, eventId, event.case_id, event.event_type, userId, reportData, accessToken, expiresAt.toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // URL do wyświetlania raportu
    const reportUrl = `${req.protocol}://${req.get('host')}/report-view?token=${accessToken}`;
    
    // URL kodu QR (mały - 150x150)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reportUrl)}`;
    
    console.log(`✅ Wygenerowano raport: ${reportCode}`);
    
    res.json({
      reportCode,
      accessToken,
      reportUrl,
      qrCodeUrl,
      expiresAt: expiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania raportu:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/view - Wyświetlanie raportu (z hasłem)
router.get('/view', async (req, res) => {
  const db = getDatabase();
  const { token, password } = req.query;
  
  if (!token) {
    return res.status(400).json({ error: 'Brak tokenu dostępu' });
  }
  
  try {
    // Pobierz raport
    const report = await new Promise((resolve, reject) => {
      db.get(
        `SELECT r.*, 
                e.title as event_title,
                e.start_date,
                e.location,
                e.description,
                e.extra_fields,
                c.case_number,
                c.title as case_title,
                c.case_type,
                u.name as generated_by_name
         FROM event_reports r
         LEFT JOIN events e ON r.event_id = e.id
         LEFT JOIN cases c ON r.case_id = c.id
         LEFT JOIN users u ON r.generated_by = u.id
         WHERE r.access_token = ?`,
        [token],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Raport nie znaleziony' });
    }
    
    // Sprawdź wygaśnięcie
    if (new Date(report.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Raport wygasł' });
    }
    
    // Sprawdź hasło
    if (password !== report.access_password) {
      return res.status(401).json({ error: 'Nieprawidłowe hasło' });
    }
    
    // Zaktualizuj licznik wyświetleń
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE event_reports 
         SET view_count = view_count + 1, 
             last_viewed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [report.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Pobierz pełne dane (świadkowie + zeznania, dowody, dokumenty) z obsługą błędów
    const witnesses = await new Promise((resolve) => {
      db.all(
        `SELECT w.*, 
                w.first_name || ' ' || w.last_name as full_name,
                w.phone as contact_phone,
                w.email as contact_email,
                w.address,
                w.relation_to_case,
                w.status,
                w.reliability_score,
                w.notes,
                w.oral_testimony,
                w.testimony as written_testimony
         FROM case_witnesses w 
         WHERE w.case_id = ? 
         ORDER BY w.created_at`,
        [report.case_id],
        (err, rows) => {
          if (err) {
            console.warn('⚠️ Tabela case_witnesses nie istnieje:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
    
    const evidence = await new Promise((resolve) => {
      db.all(
        `SELECT e.*,
                e.evidence_code,
                e.title,
                e.description,
                e.evidence_type as type,
                e.location as storage_location,
                e.file_path,
                e.notes
         FROM case_evidence e 
         WHERE e.case_id = ? 
         ORDER BY e.created_at`,
        [report.case_id],
        (err, rows) => {
          if (err) {
            console.warn('⚠️ Tabela case_evidence nie istnieje:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
    
    const documents = await new Promise((resolve) => {
      db.all(
        `SELECT d.*,
                d.file_code,
                d.document_code,
                d.code,
                d.title,
                d.category,
                d.filename,
                d.file_path,
                d.file_size,
                d.file_type,
                d.description
         FROM documents d 
         WHERE d.case_id = ? 
         ORDER BY d.created_at`,
        [report.case_id],
        (err, rows) => {
          if (err) {
            console.warn('⚠️ Błąd pobierania dokumentów:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
    
    // Pobierz WSZYSTKIE dodatkowe dane sprawy
    const caseDetails = await new Promise((resolve) => {
      db.get(
        `SELECT c.*,
                c.client_id,
                c.description as case_description,
                c.status,
                c.court_name,
                c.court_signature,
                c.prosecutor_office,
                c.investigation_authority,
                c.opposing_party,
                c.case_value,
                c.notes
         FROM cases c 
         WHERE c.id = ?`,
        [report.case_id],
        (err, row) => {
          if (err) {
            console.warn('⚠️ Błąd pobierania szczegółów sprawy:', err.message);
            resolve(null);
          } else {
            resolve(row);
          }
        }
      );
    });
    
    // Pobierz klienta
    const client = caseDetails && caseDetails.client_id ? await new Promise((resolve) => {
      db.get(
        'SELECT first_name, last_name, company_name, email, phone FROM clients WHERE id = ?',
        [caseDetails.client_id],
        (err, row) => {
          if (err) resolve(null);
          else resolve(row);
        }
      );
    }) : null;
    
    // Pobierz scenariusze
    const scenarios = await new Promise((resolve) => {
      db.all(
        'SELECT * FROM case_scenarios WHERE case_id = ? ORDER BY created_at',
        [report.case_id],
        (err, rows) => {
          if (err) resolve([]);
          else resolve(rows || []);
        }
      );
    });
    
    // Pobierz stronę przeciwną
    const opposingParty = await new Promise((resolve) => {
      db.get(
        'SELECT * FROM opposing_party_info WHERE case_id = ?',
        [report.case_id],
        (err, row) => {
          if (err) resolve(null);
          else resolve(row);
        }
      );
    });
    
    console.log(`👁️ Wyświetlono raport: ${report.report_code} (wyświetlenia: ${report.view_count + 1})`);
    console.log(`📊 Dane: Świadków: ${witnesses.length}, Dowodów: ${evidence.length}, Dokumentów: ${documents.length}`);
    
    res.json({
      reportCode: report.report_code,
      generatedAt: report.generated_at,
      expiresAt: report.expires_at,
      viewCount: report.view_count + 1,
      event: {
        title: report.event_title,
        eventCode: report.event_code,
        eventType: report.event_type,
        startDate: report.start_date,
        location: report.location,
        description: report.description,
        extraData: report.extra_fields
      },
      case: {
        caseNumber: report.case_number,
        title: report.case_title,
        caseType: report.case_type,
        description: caseDetails?.case_description,
        status: caseDetails?.status,
        courtName: caseDetails?.court_name,
        courtSignature: caseDetails?.court_signature,
        prosecutorOffice: caseDetails?.prosecutor_office,
        investigationAuthority: caseDetails?.investigation_authority,
        opposingPartyName: caseDetails?.opposing_party,
        caseValue: caseDetails?.case_value,
        notes: caseDetails?.notes
      },
      client: client ? {
        name: client.company_name || `${client.first_name} ${client.last_name}`,
        email: client.email,
        phone: client.phone
      } : null,
      witnesses: witnesses,
      evidence: evidence,
      documents: documents,
      scenarios: scenarios,
      opposingParty: opposingParty,
      aiRecommendations: report.ai_recommendations || null
    });
    
  } catch (error) {
    console.error('❌ Błąd wyświetlania raportu:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/search - Wyszukiwanie raportów
router.get('/search', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { q } = req.query;
  
  try {
    const reports = await new Promise((resolve, reject) => {
      db.all(
        `SELECT r.report_code, r.generated_at, r.view_count, r.expires_at,
                e.title as event_title,
                c.case_number
         FROM event_reports r
         LEFT JOIN events e ON r.event_id = e.id
         LEFT JOIN cases c ON r.case_id = c.id
         WHERE r.report_code LIKE ?
         ORDER BY r.generated_at DESC
         LIMIT 50`,
        [`%${q}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    res.json({ reports });
    
  } catch (error) {
    console.error('❌ Błąd wyszukiwania raportów:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports/:code/generate-ai - Generowanie AI rekomendacji
router.post('/:code/generate-ai', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { code } = req.params;
  
  try {
    // Pobierz raport z pełnymi danymi
    const report = await new Promise((resolve, reject) => {
      db.get(
        `SELECT r.*, 
                e.title as event_title,
                e.event_type,
                e.start_date,
                e.extra_fields,
                c.case_number,
                c.case_type
         FROM event_reports r
         LEFT JOIN events e ON r.event_id = e.id
         LEFT JOIN cases c ON r.case_id = c.id
         WHERE r.report_code = ?`,
        [code],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Raport nie znaleziony' });
    }
    
    // Pobierz świadków, dowody, dokumenty
    const witnesses = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM case_witnesses WHERE case_id = ?',
        [report.case_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    const evidence = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM case_evidence WHERE case_id = ?',
        [report.case_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    // Przygotuj prompt dla AI
    let extraData = {};
    try {
      extraData = report.extra_fields ? JSON.parse(report.extra_fields) : {};
    } catch (e) {}
    
    const aiPrompt = `Jesteś doświadczonym mecenasem. Przygotuj szczegółowe wskazówki do rozprawy.

DANE WYDARZENIA:
- Typ: ${report.event_type}
- Tytuł: ${report.event_title}
- Data: ${new Date(report.start_date).toLocaleDateString('pl-PL')}
- Typ sprawy: ${report.case_type}

ŚWIADKOWIE (${witnesses.length}):
${witnesses.map(w => `- ${w.first_name} ${w.last_name} (${w.witness_code})`).join('\n')}

DOWODY (${evidence.length}):
${evidence.map(e => `- ${e.title} (${e.evidence_code})`).join('\n')}

SZCZEGÓŁY ROZPRAWY:
${JSON.stringify(extraData, null, 2)}

Wygeneruj konkretne, praktyczne wskazówki w formacie:
1. ŚWIADKOWIE - jak się przygotować
2. DOWODY - co sprawdzić  
3. DOKUMENTY - co zabrać
4. STRATEGIA - główne argumenty

Formatuj w Markdown, używaj emoji.`;

    // Generuj z AI (jeśli dostępne)
    let aiRecommendations = `
🤖 WSKAZÓWKI PRZYGOTOWANIA

📋 **PODSTAWOWE INFORMACJE:**
- Typ rozprawy: ${report.event_type}
- Liczba świadków: ${witnesses.length}
- Liczba dowodów: ${evidence.length}

👥 **ŚWIADKOWIE:**
${witnesses.length > 0 ? witnesses.map((w, i) => `${i+1}. Skontaktuj się z ${w.first_name} ${w.last_name} (${w.witness_code})`).join('\n') : '- Brak świadków'}

📋 **DOWODY:**
${evidence.length > 0 ? evidence.map((e, i) => `${i+1}. Przygotuj ${e.title} (${e.evidence_code})`).join('\n') : '- Brak dowodów'}

📄 **DOKUMENTY:**
- Przygotuj 3 kopie wszystkich dokumentów
- Sprawdź oryginalność podpisów
- Uporządkuj chronologicznie

⚖️ **STRATEGIA:**
- Przygotuj główne argumenty
- Przewiduj kontrargumenty
- Miej plan B gotowy
`;
    
    // Zapisz rekomendacje
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE event_reports SET ai_recommendations = ? WHERE id = ?',
        [aiRecommendations, report.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`🤖 Wygenerowano AI rekomendacje dla: ${code}`);
    
    res.json({ 
      recommendations: aiRecommendations,
      prompt: aiPrompt // Debug
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania AI:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
