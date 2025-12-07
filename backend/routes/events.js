const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { generateEventCode } = require('../utils/code-generator');
const { logEmployeeActivity } = require('../utils/employee-activity');

const router = express.Router();

// Pobierz wydarzenia
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { case_id, client_id, from_date, to_date } = req.query;

  let query = `SELECT e.*, 
                      u.name as created_by_name,
                      c.case_number,
                      COALESCE(cl.company_name, cl.first_name || ' ' || cl.last_name) as client_name
               FROM events e 
               LEFT JOIN users u ON e.created_by = u.id 
               LEFT JOIN cases c ON e.case_id = c.id
               LEFT JOIN clients cl ON c.client_id = cl.id
               WHERE 1=1`;
  const params = [];

  // KLUCZOWE: Klient widzi tylko swoje wydarzenia (po client_id)
  if (userRole === 'client') {
    query += ' AND e.client_id IN (SELECT id FROM clients WHERE user_id = ?)';
    params.push(userId);
  }

  if (case_id) {
    query += ' AND e.case_id = ?';
    params.push(case_id);
  }

  if (client_id) {
    query += ' AND e.client_id = ?';
    params.push(client_id);
  }

  if (from_date) {
    query += ' AND e.start_date >= ?';
    params.push(from_date);
  }

  if (to_date) {
    query += ' AND e.start_date <= ?';
    params.push(to_date);
  }

  query += ' ORDER BY e.start_date ASC';

  db.all(query, params, (err, events) => {
    if (err) {
      console.error('Błąd pobierania wydarzeń:', err);
      return res.status(500).json({ error: 'Błąd pobierania wydarzeń: ' + err.message });
    }

    // Dodaj aliasy dla kompatybilności
    const eventsWithAlias = events.map(e => {
      // Parse extra_fields z JSON jeśli istnieje
      let parsedExtraFields = null;
      if (e.extra_fields) {
        try {
          parsedExtraFields = JSON.parse(e.extra_fields);
        } catch (err) {
          console.warn('Błąd parsowania extra_fields:', err);
        }
      }
      
      return {
        ...e,
        event_date: e.start_date,
        extra_data: parsedExtraFields  // Alias: extra_data = extra_fields
      };
    });

    res.json({ events: eventsWithAlias });
  });
});

// Pobierz wydarzenia dla konkretnej sprawy
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `SELECT e.*, 
                        u.name as created_by_name,
                        c.case_number,
                        COALESCE(cl.company_name, cl.first_name || ' ' || cl.last_name) as client_name
                 FROM events e 
                 LEFT JOIN users u ON e.created_by = u.id 
                 LEFT JOIN cases c ON e.case_id = c.id
                 LEFT JOIN clients cl ON c.client_id = cl.id
                 WHERE e.case_id = ?
                 ORDER BY e.start_date ASC`;
  
  db.all(query, [caseId], (err, events) => {
    if (err) {
      console.error('Błąd pobierania wydarzeń:', err);
      return res.status(500).json({ error: 'Błąd pobierania wydarzeń' });
    }
    
    // Dodaj aliasy dla kompatybilności
    const eventsWithAlias = events.map(e => {
      // Parse extra_fields z JSON jeśli istnieje
      let parsedExtraFields = null;
      if (e.extra_fields) {
        try {
          parsedExtraFields = JSON.parse(e.extra_fields);
        } catch (err) {
          console.warn('Błąd parsowania extra_fields:', err);
        }
      }
      
      return {
        ...e,
        event_date: e.start_date,
        extra_data: parsedExtraFields  // Alias: extra_data = extra_fields
      };
    });
    
    res.json({ events: eventsWithAlias });
  });
});

// Generuj kod wydarzenia (NOWY SYSTEM NUMERACJI v1.0)
router.post('/generate-code', verifyToken, async (req, res) => {
  const { case_id, event_type } = req.body;

  if (!case_id) {
    return res.status(400).json({ error: 'ID sprawy jest wymagane' });
  }

  try {
    // Mapowanie typów wydarzeń na prefixy
    const eventTypePrefixes = {
      'negotiation': 'NEG',
      'court': 'ROZ',
      'meeting': 'SPO',
      'deadline': 'TER',
      'mediation': 'MED',
      'expertise': 'EKS',
      'document': 'DOK',
      'hearing': 'PRZ',
      'consultation': 'KON',
      'task': 'ZAD',
      'other': 'INN'
    };
    
    const eventSubType = eventTypePrefixes[event_type] || 'WYD';
    
    // Użyj nowego generatora
    const result = await generateEventCode(case_id, eventSubType);
    
    console.log(`✅ NOWY SYSTEM: Wygenerowano kod ${result.code} dla case_id=${case_id}`);
    
    res.json({ 
      eventCode: result.code,
      // Dodatkowe metadane dla kompatybilności
      prefix: result.prefix,
      caseTypeCode: result.caseTypeCode,
      initials: result.initials,
      fullCaseNumber: result.fullCaseNumber,
      elementNumber: result.elementNumber
    });
  } catch (error) {
    console.error('❌ Błąd generowania kodu wydarzenia:', error);
    res.status(500).json({ error: 'Błąd generowania kodu wydarzenia' });
  }
});

// Dodaj wydarzenie
router.post('/', verifyToken, async (req, res) => {
  console.log('📥 POST /events - Request body:', JSON.stringify(req.body, null, 2));
  
  const db = getDatabase();
  const userId = req.user.userId;
  const { case_id, client_id, event_code, title, description, event_type, event_date, start_date, end_date, location, reminder_minutes, is_all_day, extra_fields, extra_data } = req.body;
  
  // Akceptuj zarówno extra_fields jak i extra_data (dla kompatybilności)
  const finalExtraData = extra_data || extra_fields;

  console.log('📊 Parsed values:', {
    case_id,
    client_id,
    event_code,
    title,
    description: description || '(BRAK - będzie NULL!)',
    location: location || '(BRAK - będzie NULL!)',
    event_type,
    event_date,
    start_date,
    userId
  });
  
  console.log('🔍🔍🔍 MEGA DEBUG DESCRIPTION:');
  console.log('   - description RAW:', JSON.stringify(description));
  console.log('   - typeof description:', typeof description);
  console.log('   - description === undefined:', description === undefined);
  console.log('   - description === null:', description === null);
  console.log('   - description === "":', description === '');
  console.log('   - description.length:', description?.length);
  console.log('   - Boolean(description):', Boolean(description));

  // Akceptuj zarówno event_date jak i start_date
  const finalDate = event_date || start_date;

  console.log('🔍🔍🔍 === ANALIZA DATY W BACKENDZIE === 🔍🔍🔍');
  console.log('📅 Final date (raw):', finalDate);
  console.log('📅 Typ finalDate:', typeof finalDate);
  
  // ✅ NAPRAWA STREFY CZASOWEJ: Konwertuj na UTC przed zapisem!
  let finalDateUTC = finalDate;
  if (finalDate) {
    const parsedDate = new Date(finalDate);
    console.log('🧪 new Date(finalDate):', parsedDate.toISOString());
    console.log('🧪 toString():', parsedDate.toString());
    
    // KLUCZOWE: Jeśli data NIE ma 'Z' na końcu, traktuj ją jako lokalny czas
    // i konwertuj na UTC (ISO 8601 format z 'Z')
    if (!finalDate.endsWith('Z') && !finalDate.match(/[+-]\d{2}:\d{2}$/)) {
      // To jest lokalny czas - konwertuj na UTC
      finalDateUTC = parsedDate.toISOString();
      console.log('🔄 Konwersja lokalny → UTC:', finalDate, '→', finalDateUTC);
    } else {
      // To już jest UTC lub ma offset - zostaw jak jest
      console.log('✅ Data już jest w UTC:', finalDate);
    }
  }
  
  console.log('💾 CO DOKŁADNIE ZAPISUJĘ DO BAZY (UTC):', finalDateUTC);

  if (!title || !event_type || !finalDate) {
    console.error('❌ Walidacja nie przeszła:', { title, event_type, finalDate });
    return res.status(400).json({ error: 'Tytuł, typ i data są wymagane' });
  }
  
  console.log('✅ Walidacja przeszła, zapisuję wydarzenie...');

  // KLUCZOWE: Jeśli podano case_id, automatycznie pobierz client_id ze sprawy!
  let finalClientId = client_id || null;
  
  if (case_id && !finalClientId) {
    // Pobierz client_id ze sprawy
    const caseData = await new Promise((resolve, reject) => {
      db.get('SELECT client_id FROM cases WHERE id = ?', [case_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (caseData && caseData.client_id) {
      finalClientId = caseData.client_id;
      console.log(`✅ Auto-przypisano client_id=${finalClientId} dla case_id=${case_id}`);
    }
  }

  // Stringify extra_data/extra_fields jeśli istnieją
  const extraFieldsJson = finalExtraData ? JSON.stringify(finalExtraData) : null;
  
  console.log('📦 Extra data to save:', extraFieldsJson ? extraFieldsJson.substring(0, 200) + '...' : 'null');

  // Konwertuj puste stringi na NULL dla lepszego wyświetlania
  const finalDescription = description && description.trim() !== '' ? description.trim() : null;
  const finalLocation = location && location.trim() !== '' ? location.trim() : null;
  
  console.log('💾 ZAPISUJĘ DO BAZY:');
  console.log('   - description:', finalDescription || '(NULL)');
  console.log('   - location:', finalLocation || '(NULL)');
  
  db.run(
    `INSERT INTO events (case_id, client_id, event_code, title, description, event_type, start_date, end_date, location, reminder_minutes, is_all_day, extra_fields, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [case_id || null, finalClientId, event_code || null, title, finalDescription, event_type, finalDateUTC, end_date || null, finalLocation, reminder_minutes || 60, is_all_day || 0, extraFieldsJson, userId],
    async function(err) {
      if (err) {
        console.error('Błąd dodawania wydarzenia:', err);
        return res.status(500).json({ error: 'Błąd dodawania wydarzenia: ' + err.message });
      }

      const eventId = this.lastID;
      console.log(`✅ Wydarzenie zapisane, ID: ${eventId}`);
      
      // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD
      db.run(`
        INSERT INTO employee_activity_logs (
          user_id, action_type, action_category, description,
          related_case_id, related_event_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        'event_created',
        'event',
        `Utworzono wydarzenie: ${title} (${event_type})`,
        case_id || null,
        eventId
      ], (logErr) => {
        if (logErr) {
          console.error('⚠️ Błąd logowania aktywności:', logErr);
        } else {
          console.log('📊 Aktywność utworzenia wydarzenia zalogowana do HR dashboard');
        }
      });
      
      // === AUTOMATYCZNE DODAWANIE DO KALENDARZA ===
      try {
        console.log('📅 Dodaję wydarzenie do kalendarzy...');
        
        // 1. Zawsze dodaj twórcę wydarzenia
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO calendar_entries (event_id, user_id, calendar_type, visibility, reminder_enabled, reminder_minutes)
             VALUES (?, ?, 'personal', 'private', 1, ?)`,
            [eventId, userId, reminder_minutes || 1440],
            (err) => {
              if (err) {
                console.error('❌ Błąd dodawania do kalendarza twórcy:', err);
                reject(err);
              } else {
                console.log(`✅ Dodano do kalendarza użytkownika ${userId}`);
                resolve();
              }
            }
          );
        });
        
        // 2. Jeśli sprawa przypisana, dodaj mecenasa i opiekuna
        if (case_id) {
          const caseData = await new Promise((resolve, reject) => {
            db.get('SELECT assigned_to, case_manager_id, client_id FROM cases WHERE id = ?', [case_id], (err, row) => {
              if (err) reject(err);
              else resolve(row || {});
            });
          });
          
          // Mecenas prowadzący
          if (caseData.assigned_to && caseData.assigned_to !== userId) {
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO calendar_entries (event_id, user_id, calendar_type, visibility, reminder_enabled, reminder_minutes)
                 VALUES (?, ?, 'case', 'shared', 1, ?)`,
                [eventId, caseData.assigned_to, reminder_minutes || 1440],
                (err) => {
                  if (err) {
                    console.error('❌ Błąd dodawania do kalendarza mecenasa:', err);
                    reject(err);
                  } else {
                    console.log(`✅ Dodano do kalendarza mecenasa ${caseData.assigned_to}`);
                    resolve();
                  }
                }
              );
            });
          }
          
          // Opiekun sprawy
          if (caseData.case_manager_id && caseData.case_manager_id !== userId) {
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO calendar_entries (event_id, user_id, calendar_type, visibility, reminder_enabled, reminder_minutes)
                 VALUES (?, ?, 'case', 'shared', 1, ?)`,
                [eventId, caseData.case_manager_id, reminder_minutes || 1440],
                (err) => {
                  if (err) {
                    console.error('❌ Błąd dodawania do kalendarza opiekuna:', err);
                    reject(err);
                  } else {
                    console.log(`✅ Dodano do kalendarza opiekuna ${caseData.case_manager_id}`);
                    resolve();
                  }
                }
              );
            });
          }
          
          // 3. Klient (jeśli ma konto użytkownika)
          if (finalClientId) {
            const clientUser = await new Promise((resolve, reject) => {
              db.get('SELECT user_id FROM clients WHERE id = ?', [finalClientId], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
              });
            });
            
            if (clientUser.user_id && clientUser.user_id !== userId) {
              await new Promise((resolve, reject) => {
                db.run(
                  `INSERT INTO calendar_entries (event_id, user_id, calendar_type, visibility, reminder_enabled, reminder_minutes)
                   VALUES (?, ?, 'client', 'private', 1, ?)`,
                  [eventId, clientUser.user_id, reminder_minutes || 1440],
                  (err) => {
                    if (err) {
                      console.error('❌ Błąd dodawania do kalendarza klienta:', err);
                      reject(err);
                    } else {
                      console.log(`✅ Dodano do kalendarza klienta ${clientUser.user_id}`);
                      resolve();
                    }
                  }
                );
              });
            }
          }
        }
        
        console.log('🎉 Wydarzenie dodane do wszystkich kalendarzy!');
        
      } catch (calendarError) {
        console.error('⚠️ Błąd synchronizacji z kalendarzem (nie krytyczny):', calendarError);
        // Nie przerywamy - wydarzenie zostało zapisane
      }
      
      res.json({ success: true, eventId: eventId, client_id: finalClientId });
    }
  );
});

// Pobierz pojedyncze wydarzenie
router.get('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  const query = `SELECT e.*, 
                        u.name as created_by_name,
                        c.case_number,
                        COALESCE(cl.company_name, cl.first_name || ' ' || cl.last_name) as client_name
                 FROM events e 
                 LEFT JOIN users u ON e.created_by = u.id 
                 LEFT JOIN cases c ON e.case_id = c.id
                 LEFT JOIN clients cl ON c.client_id = cl.id
                 WHERE e.id = ?`;
  
  db.get(query, [id], (err, event) => {
    if (err) {
      console.error('Błąd pobierania wydarzenia:', err);
      return res.status(500).json({ error: 'Błąd pobierania wydarzenia' });
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Wydarzenie nie znalezione' });
    }
    
    // Dodaj alias
    event.event_date = event.start_date;
    
    // Parse extra_fields z JSON
    let parsedExtraFields = null;
    if (event.extra_fields) {
      try {
        parsedExtraFields = JSON.parse(event.extra_fields);
        event.extra_fields = parsedExtraFields;
      } catch (e) {
        console.error('Błąd parsowania extra_fields:', e);
        event.extra_fields = null;
      }
    }
    
    // Dodaj alias extra_data dla kompatybilności z frontendem
    event.extra_data = parsedExtraFields;
    
    console.log(`✅ Zwracam wydarzenie ${id}:`);
    console.log(`   - title: ${event.title}`);
    console.log(`   - description: ${event.description || '(BRAK)'}`);
    console.log(`   - location: ${event.location || '(BRAK)'}`);
    console.log(`   - extra_data:`, parsedExtraFields ? JSON.stringify(parsedExtraFields).substring(0, 200) : 'null');
    console.log(`   - attachments w extra_data:`, parsedExtraFields?.attachments?.length || 0);
    
    res.json({ event });
  });
});

// Aktualizuj wydarzenie
router.put('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const {
    title, description, event_type, location, start_date, end_date,
    reminder_minutes, is_all_day, status, extra_fields, extra_data
  } = req.body;

  // Akceptuj zarówno extra_fields jak i extra_data (dla kompatybilności)
  const finalExtraData = extra_data || extra_fields;
  
  // Stringify extra_data jeśli istnieją
  const extraFieldsJson = finalExtraData ? JSON.stringify(finalExtraData) : null;
  
  console.log(`📝 Aktualizuję wydarzenie ${id}:`, { title, event_type, has_extra_data: !!finalExtraData });

  // ✅ NAPRAWA STREFY CZASOWEJ: Konwertuj daty na UTC przed zapisem!
  let startDateUTC = start_date;
  let endDateUTC = end_date;
  
  if (start_date && !start_date.endsWith('Z') && !start_date.match(/[+-]\d{2}:\d{2}$/)) {
    startDateUTC = new Date(start_date).toISOString();
    console.log('🔄 UPDATE - Konwersja start_date:', start_date, '→', startDateUTC);
  }
  
  if (end_date && !end_date.endsWith('Z') && !end_date.match(/[+-]\d{2}:\d{2}$/)) {
    endDateUTC = new Date(end_date).toISOString();
    console.log('🔄 UPDATE - Konwersja end_date:', end_date, '→', endDateUTC);
  }

  // Najpierw pobierz dane wydarzenia do logowania
  db.get('SELECT case_id, title as old_title FROM events WHERE id = ?', [id], (err, event) => {
    if (err || !event) {
      return res.status(404).json({ error: 'Wydarzenie nie znalezione' });
    }
    
    db.run(
      `UPDATE events SET
        title = ?, description = ?, event_type = ?, location = ?, start_date = ?,
        end_date = ?, reminder_minutes = ?, is_all_day = ?, status = ?, extra_fields = ?
      WHERE id = ?`,
      [title, description, event_type, location, startDateUTC, endDateUTC,
       reminder_minutes, is_all_day, status, extraFieldsJson, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Błąd aktualizacji wydarzenia' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Wydarzenie nie znalezione' });
        }
        
        // 📊 LOGUJ EDYCJĘ DO HISTORII SPRAWY
        const userId = req.user.userId;
        if (event.case_id) {
          logEmployeeActivity({
            userId: userId,
            actionType: 'event_updated',
            actionCategory: 'event',
            description: `Zaktualizowano wydarzenie: ${title || event.old_title}`,
            caseId: event.case_id,
            eventId: parseInt(id)
          });
        }
        
        res.json({ success: true });
      }
    );
  });
});

// Usuń wydarzenie
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;
  
  // Najpierw pobierz dane wydarzenia do logowania
  db.get('SELECT case_id, title FROM events WHERE id = ?', [id], (err, event) => {
    if (err || !event) {
      return res.status(404).json({ error: 'Wydarzenie nie znalezione' });
    }
    
    db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania wydarzenia' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Wydarzenie nie znalezione' });
      }
      
      // 📊 LOGUJ USUNIĘCIE DO HISTORII SPRAWY
      if (event.case_id) {
        logEmployeeActivity({
          userId: userId,
          actionType: 'event_deleted',
          actionCategory: 'event',
          description: `Usunięto wydarzenie: ${event.title}`,
          caseId: event.case_id
        });
      }
      
      res.json({ success: true });
    });
  });
});

module.exports = router;
