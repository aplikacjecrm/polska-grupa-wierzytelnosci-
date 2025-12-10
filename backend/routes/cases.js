const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { canAccessCase, canModifyCase, canViewInternalNotes, ROLES } = require('../middleware/permissions');
const { logEmployeeActivity } = require('../utils/employee-activity');
const { generateCasePassword, checkCaseAccess, verifyPassword } = require('../middleware/case-access');
const uploadConfig = require('../config/uploads');

const router = express.Router();

// DEBUG: Log ALL requests to cases router
router.use((req, res, next) => {
  console.log('🌟🌟🌟 CASES ROUTER - Incoming request:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    params: req.params
  });
  next();
});

// Konfiguracja multer dla dokumentów spraw (używa centralnej konfiguracji)
const caseDocumentsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = uploadConfig.paths.caseDocuments();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Dekoduj nazwę pliku z UTF-8 (naprawia polskie znaki)
      let originalName = file.originalname;
      try {
        originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      } catch (e) {
        console.log('⚠️ Nie udało się zdekodować nazwy pliku, używam oryginalnej');
      }
      // Zapisz oryginalną nazwę do późniejszego użycia
      file.decodedOriginalname = originalName;
      const ext = path.extname(originalName);
      cb(null, `case-${req.params.id}-${uniqueSuffix}${ext}`);
    } catch (error) {
      console.error('❌ Błąd generowania nazwy pliku:', error);
      cb(error);
    }
  }
});

const uploadCaseDocument = multer({
  storage: caseDocumentsStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Pobierz sprawy pracownika według jego roli i uprawnień
router.get('/my-cases', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId || req.user.id;
  const userRole = req.user.user_role || req.user.role;
  
  console.log('📂 Pobieranie spraw dla:', { userId, userRole });
  
  let query = `
    SELECT DISTINCT c.*, cl.first_name, cl.last_name, cl.company_name, u.name as assigned_to_name
    FROM cases c
    LEFT JOIN clients cl ON c.client_id = cl.id
    LEFT JOIN users u ON c.assigned_to = u.id
    WHERE c.status != 'deleted'
  `;
  const params = [];
  
  if (userRole === ROLES.ADMIN) {
    // Admin widzi wszystkie sprawy
    console.log('👑 Admin - wszystkie sprawy');
  } else if (userRole === ROLES.LAWYER) {
    // Mecenas widzi sprawy gdzie jest assigned_to
    query += ` AND c.assigned_to = ?`;
    params.push(userId);
    console.log('👔 Mecenas - sprawy assigned_to');
  } else if (userRole === ROLES.CASE_MANAGER) {
    // Opiekun sprawy widzi sprawy gdzie jest additional_caretaker
    query += ` AND c.additional_caretaker = ?`;
    params.push(userId);
    console.log('📋 Opiekun sprawy - sprawy additional_caretaker');
  } else if (userRole === ROLES.CLIENT_MANAGER) {
    // Opiekun klienta widzi sprawy swoich klientów
    query += ` AND cl.assigned_to = ?`;
    params.push(userId);
    console.log('👥 Opiekun klienta - sprawy klientów assigned_to');
  } else if (userRole === ROLES.RECEPTION) {
    // Recepcja widzi wszystkie sprawy (ale bez szczegółów - to obsłużymy we frontendzie)
    console.log('📞 Recepcja - wszystkie sprawy (bez szczegółów)');
  } else if (userRole === ROLES.CLIENT) {
    // Klient widzi tylko swoje sprawy
    query += ` AND (
      c.client_id IN (SELECT client_id FROM users WHERE id = ?)
      OR c.id IN (SELECT case_id FROM case_access WHERE user_id = ?)
    )`;
    params.push(userId, userId);
    console.log('🤝 Klient - tylko swoje sprawy');
  }
  
  query += ` ORDER BY c.created_at DESC`;
  
  db.all(query, params, (err, cases) => {
    if (err) {
      console.error('❌ Błąd pobierania spraw:', err);
      return res.status(500).json({ error: 'Błąd pobierania spraw' });
    }
    
    console.log(`✅ Znaleziono ${cases ? cases.length : 0} spraw dla ${userRole}`);
    res.json({ cases: cases || [], user_role: userRole });
  });
});

// Pobierz wszystkie sprawy
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { search, status, client_id } = req.query;
  const userId = req.user.userId;
  const userRole = req.user.role;

  let query = `
    SELECT DISTINCT c.*, cl.first_name, cl.last_name, cl.company_name, u.name as assigned_to_name
    FROM cases c
    LEFT JOIN clients cl ON c.client_id = cl.id
    LEFT JOIN users u ON c.assigned_to = u.id
    WHERE c.status != 'deleted'
  `;
  const params = [];

  // Filtrowanie według roli
  if (userRole === ROLES.CLIENT) {
    // Klienci widzą tylko swoje sprawy
    query += ` AND (
      c.client_id IN (SELECT client_id FROM users WHERE id = ?)
      OR c.id IN (SELECT case_id FROM case_access WHERE user_id = ?)
    )`;
    params.push(userId, userId);
  } else if (userRole === ROLES.LAWYER) {
    // Mecenas widzi swoje sprawy
    query += ` AND c.assigned_to = ?`;
    params.push(userId);
  } else if (userRole === ROLES.CASE_MANAGER) {
    // Opiekun sprawy widzi swoje sprawy
    query += ` AND c.additional_caretaker = ?`;
    params.push(userId);
  } else if (userRole === ROLES.CLIENT_MANAGER) {
    // Opiekun klienta widzi sprawy swoich klientów
    query += ` AND cl.assigned_to = ?`;
    params.push(userId);
  }
  // Admin i recepcja widzą wszystkie sprawy (brak filtra)

  if (search) {
    query += ` AND (c.title LIKE ? OR c.case_number LIKE ? OR c.description LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (status) {
    query += ` AND c.status = ?`;
    params.push(status);
  }

  if (client_id) {
    query += ` AND c.client_id = ?`;
    params.push(client_id);
  }

  query += ` ORDER BY c.created_at DESC`;

  console.log('📊 Executing query:', query);
  console.log('📊 With params:', params);

  // sqlite3 używa CALLBACK API
  db.all(query, params, (err, cases) => {
    if (err) {
      console.error('❌ Error fetching cases:', err);
      return res.status(500).json({ error: 'Błąd pobierania spraw' });
    }
    
    console.log('📊 Found cases:', cases ? cases.length : 0);
    console.log('📊 Cases array:', Array.isArray(cases));
    console.log('📊 First case:', cases ? cases[0] : null);
    res.json({ cases: cases || [] });
  });
});

// Pobierz listę personelu (MUSI BYĆ PRZED /:id !)
router.get('/staff/list', verifyToken, (req, res) => {
  const db = getDatabase();
  
  console.log('👥 Pobieranie listy personelu...');
  
  db.all(
    `SELECT id, name, email, user_role, initials
     FROM users
     WHERE user_role IN ('lawyer', 'case_manager', 'client_manager') AND is_active = 1
     ORDER BY user_role, name`,
    [],
    (err, staff) => {
      if (err) {
        console.error('❌ Błąd pobierania personelu:', err);
        return res.status(500).json({ error: 'Błąd pobierania personelu' });
      }
      
      const lawyers = staff.filter(s => s.user_role === 'lawyer');
      const caseManagers = staff.filter(s => s.user_role === 'case_manager');
      const clientManagers = staff.filter(s => s.user_role === 'client_manager');
      
      console.log('✅ Znaleziono:', {
        lawyers: lawyers.length,
        case_managers: caseManagers.length,
        client_managers: clientManagers.length
      });
      
      res.json({ 
        lawyers, 
        case_managers: caseManagers,
        client_managers: clientManagers
      });
    }
  );
});

// Generuj numer sprawy - POST (z body)
router.post('/generate-number', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { client_id, case_type: case_subtype } = req.body;

  console.log('🔢 POST /generate-number otrzymał:', { client_id, case_subtype });

  if (!client_id || !case_subtype) {
    return res.status(400).json({ error: 'client_id i case_type są wymagane' });
  }

  try {
    // Pobierz dane klienta
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT first_name, last_name, company_name FROM clients WHERE id = ?', [client_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!client) {
      return res.status(404).json({ error: 'Nie znaleziono klienta' });
    }

    // Generuj inicjały
    const firstName = client.first_name || '';
    const lastName = client.last_name || client.company_name || '';
    const baseInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'XX';
    
    const clientsWithSameInitials = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id FROM clients 
         WHERE substr(upper(first_name), 1, 1) || substr(upper(COALESCE(last_name, company_name, '')), 1, 1) = ?
         AND id <= ?
         ORDER BY id ASC`,
        [baseInitials, client_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    const clientIndex = clientsWithSameInitials.findIndex(row => row.id === parseInt(client_id)) + 1;
    const initials = `${baseInitials}${clientIndex.toString().padStart(2, '0')}`;

    // Skróty podtypów spraw
    const subtypePrefixes = {
      'compensation': 'ODS', 'contract': 'UMO', 'family': 'ROD', 'property': 'MAJ',
      'inheritance': 'SPA', 'debt': 'DLU', 'assault': 'POB', 'theft': 'KRA',
      'fraud': 'OSZ', 'traffic': 'DRO', 'drugs': 'NAR', 'building': 'BUD',
      'tax': 'POD', 'zoning': 'ZAG', 'business': 'GOS', 'bankruptcy': 'UPA',
      'restructuring': 'RES', 'international': 'MIE', 'european': 'EUR',
      'arbitration': 'ARB', 'maritime': 'MOR', 'energy': 'ENE', 
      'renewable': 'OZE', 'aviation': 'LOT', 'it': 'INF', 'other': 'INN'
    };
    const typeCode = subtypePrefixes[case_subtype] || 'INN';

    // Znajdź najwyższy numer
    const allCases = await new Promise((resolve, reject) => {
      db.all(
        `SELECT case_number FROM cases 
         WHERE case_number LIKE ?`,
        [`${typeCode}/${initials}/%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    let nextNumber = 1;
    if (allCases.length > 0) {
      const numbers = allCases.map(row => {
        const parts = row.case_number.split('/');
        return parseInt(parts[parts.length - 1]) || 0;
      });
      const maxNumber = Math.max(...numbers);
      nextNumber = maxNumber + 1;
    }

    const caseNumber = `${typeCode}/${initials}/${String(nextNumber).padStart(3, '0')}`;
    console.log('✅ Wygenerowano numer sprawy:', caseNumber);
    
    res.json({ caseNumber });
  } catch (error) {
    console.error('❌ Błąd generowania numeru sprawy:', error);
    res.status(500).json({ error: 'Błąd generowania numeru sprawy' });
  }
});

// Generuj numer sprawy - GET (z parametrami URL) - STARY ENDPOINT
router.get('/generate-number/:clientId/:caseType', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { clientId: client_id, caseType: case_subtype } = req.params;

  if (!client_id || !case_subtype) {
    return res.status(400).json({ error: 'client_id i case_type są wymagane' });
  }

  try {
    // Pobierz dane klienta
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT first_name, last_name, company_name FROM clients WHERE id = ?', [client_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!client) {
      return res.status(404).json({ error: 'Nie znaleziono klienta' });
    }

    // Generuj inicjały
    const firstName = client.first_name || '';
    const lastName = client.last_name || client.company_name || '';
    const baseInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'XX';
    
    // ZAWSZE dodaj numer sekwencyjny do inicjałów (od 01)
    const clientsWithSameInitials = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id FROM clients 
         WHERE substr(upper(first_name), 1, 1) || substr(upper(COALESCE(last_name, company_name, '')), 1, 1) = ?
         AND id <= ?
         ORDER BY id ASC`,
        [baseInitials, client_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    // Dodaj numer sekwencyjny (zawsze, nawet dla pierwszego klienta)
    const clientIndex = clientsWithSameInitials.findIndex(row => row.id === parseInt(client_id)) + 1;
    const initials = `${baseInitials}${clientIndex.toString().padStart(2, '0')}`;
    console.log(`📌 SPRAWY: Klient ${client_id} → inicjały ${baseInitials} → z numerem: ${initials} (pozycja ${clientIndex}/${clientsWithSameInitials.length})`);

    // Skróty podtypów spraw (dla numeracji)
    const subtypePrefixes = {
      'compensation': 'ODS',
      'contract': 'UMO',
      'family': 'ROD',
      'property': 'MAJ',
      'inheritance': 'SPA',
      'debt': 'DLU',
      'assault': 'POB',
      'theft': 'KRA',
      'fraud': 'OSZ',
      'traffic': 'DRO',
      'drugs': 'NAR',
      'building': 'BUD',
      'tax': 'POD',
      'zoning': 'ZAG',
      'business': 'GOS',
      'bankruptcy': 'UPA',
      'restructuring': 'RES',
      'international': 'MIE',
      'european': 'EUR',
      'arbitration': 'ARB',
      'maritime': 'MOR',
      'energy': 'ENE',
      'renewable': 'OZE',
      'aviation': 'LOT',
      'it': 'INF',
      'other': 'INN'
    };
    const typeCode = subtypePrefixes[case_subtype] || 'INN';

    // Znajdź NAJWYŻSZY numer dla tego typu sprawy (globalnie, nie tylko dla klienta)
    const allCases = await new Promise((resolve, reject) => {
      db.all(
        `SELECT case_number FROM cases 
         WHERE case_number LIKE ?`,
        [`${typeCode}/${initials}/%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    let nextNumber = 1;
    if (allCases.length > 0) {
      // Wyciągnij wszystkie numery i znajdź MAX numerycznie
      const numbers = allCases.map(row => {
        const parts = row.case_number.split('/');
        return parseInt(parts[parts.length - 1]) || 0;
      });
      const maxNumber = Math.max(...numbers);
      nextNumber = maxNumber + 1;
    }

    // Format: CYW/JK/001 (typ/inicjały/3-cyfrowy numer)
    const caseNumber = `${typeCode}/${initials}/${String(nextNumber).padStart(3, '0')}`;
    
    res.json({ caseNumber });
  } catch (error) {
    console.error('Błąd generowania numeru sprawy:', error);
    res.status(500).json({ error: 'Błąd generowania numeru sprawy' });
  }
});

// Usuń sprawę (soft delete) - wymaga hasła administratora
// MUSI BYĆ PRZED GET /:id żeby nie było konfliktu!
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const adminPassword = req.headers['x-admin-password'];

  console.log('DELETE /cases/:id called');
  console.log('Case ID:', id);
  console.log('User role:', req.user.role);
  console.log('Admin password provided:', adminPassword);

  // Sprawdź czy użytkownik to admin
  if (req.user.role !== 'admin') {
    console.log('Access denied - not admin');
    return res.status(403).json({ error: 'Brak uprawnień - tylko administrator może usuwać sprawy' });
  }

  // Sprawdź hasło administratora
  if (adminPassword !== 'Proadmin') {
    console.log('Invalid admin password - rejecting request');
    return res.status(401).json({ error: 'Nieprawidłowe hasło administratora' });
  }

  console.log('🗑️ Deleting case...');
  console.log('🔍 Case ID:', id);

  db.run(
    `UPDATE cases SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Błąd usuwania sprawy' });
      }
      if (this.changes === 0) {
        console.log('Case not found');
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      console.log('✅ Case deleted successfully');
      res.json({ success: true });
    }
  );
});

// Pobierz jedną sprawę (MUSI BYĆ PO /generate-number i DELETE!)
// 🔐 UŻYWA checkCaseAccess - wymaga hasła dla nieuprawnionych!
router.get('/:id', verifyToken, checkCaseAccess, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  db.get(
    `SELECT c.*, 
            cl.first_name, cl.last_name, cl.company_name, cl.email, cl.phone,
            u.name as assigned_to_name, 
            u.initials as assigned_to_initials,
            cm.name as case_manager_name,
            cm.initials as case_manager_initials,
            client_caretaker.name as client_caretaker_name,
            additional_caretaker.name as additional_caretaker_name,
            creator.name as created_by_name
     FROM cases c
     LEFT JOIN clients cl ON c.client_id = cl.id
     LEFT JOIN users u ON c.assigned_to = u.id
     LEFT JOIN users cm ON c.case_manager_id = cm.id
     LEFT JOIN users client_caretaker ON cl.assigned_to = client_caretaker.id
     LEFT JOIN users additional_caretaker ON c.additional_caretaker = additional_caretaker.id
     LEFT JOIN users creator ON c.created_by = creator.id
     WHERE c.id = ?`,
    [id],
    (err, caseData) => {
      if (err) {
        console.error('Error fetching case:', err);
        return res.status(500).json({ error: 'Błąd pobierania sprawy' });
      }
      if (!caseData) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      
      // 🔐 Dodaj info o metodzie dostępu (z middleware)
      res.json({ 
        case: caseData,
        access_info: req.caseAccess  // {granted: true, method: 'role'|'password'}
      });
    }
  );
});

// Dodaj sprawę
router.post('/', verifyToken, canModifyCase, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const userInitials = req.user.initials || 'XX';
  const {
    client_id, case_number, title, description, case_type, case_subtype, priority,
    court_name, court_signature, opposing_party, value_amount, value_currency, assigned_to,
    additional_caretaker,
    case_manager_id,  // Opiekun sprawy (dla prowizji)
    // Prokuratura
    prosecutor_id, prosecutor_office, prosecutor_name, prosecutor_address,
    prosecutor_phone, prosecutor_email, prosecutor_website, indictment_number, auxiliary_prosecutor,
    // Policja
    police_id, investigation_authority, police_case_number,
    police_address, police_phone, police_email, police_website,
    // HASŁO DOSTĘPU (opcjonalne - jeśli nie podane, generujemy automatycznie)
    access_password
  } = req.body;

  if (!client_id || !case_number || !title || !case_type) {
    return res.status(400).json({ error: 'Wymagane pola: client_id, case_number, title, case_type' });
  }
  
  // Generuj hasło dostępu do sprawy
  const generatedPassword = access_password || generateCasePassword(case_number, userInitials);
  
  console.log('🆕 Dodawanie sprawy:', {
    case_number,
    access_password: generatedPassword,
    police_id,
    investigation_authority
  });

  db.run(
    `INSERT INTO cases (
      client_id, case_number, title, description, case_type, case_subtype, priority,
      court_name, court_signature, opposing_party, value_amount, value_currency,
      assigned_to, case_manager_id, additional_caretaker, created_by,
      prosecutor_id, prosecutor_office, prosecutor_name, prosecutor_address,
      prosecutor_phone, prosecutor_email, prosecutor_website, indictment_number, auxiliary_prosecutor,
      police_id, investigation_authority, police_case_number,
      police_address, police_phone, police_email, police_website,
      access_password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [client_id, case_number, title, description, case_type, case_subtype, priority || 'medium',
     court_name, court_signature, opposing_party, value_amount, value_currency || 'PLN',
     assigned_to, case_manager_id, additional_caretaker, userId,
     prosecutor_id, prosecutor_office, prosecutor_name, prosecutor_address,
     prosecutor_phone, prosecutor_email, prosecutor_website, indictment_number, auxiliary_prosecutor,
     police_id, investigation_authority, police_case_number,
     police_address, police_phone, police_email, police_website,
     generatedPassword],
    function(err) {
      if (err) {
        console.error('❌❌❌ BŁĄD DODAWANIA SPRAWY:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error code:', err.code);
        
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Numer sprawy już istnieje' });
        }
        return res.status(500).json({ error: 'Błąd dodawania sprawy: ' + err.message });
      }
      
      const caseId = this.lastID;
      console.log('✅ Sprawa dodana! ID:', caseId, '🔑 Hasło:', generatedPassword);
      
      // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD
      db.run(`
        INSERT INTO employee_activity_logs (
          user_id, action_type, action_category, description,
          related_case_id, related_client_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        'case_created',
        'case',
        `Utworzono sprawę: ${title} (${case_number})`,
        caseId,
        client_id
      ], (logErr) => {
        if (logErr) {
          console.error('⚠️ Błąd logowania aktywności:', logErr);
        } else {
          console.log('📊 Aktywność zalogowana do HR dashboard');
        }
      });
      
      // 💬 WYŚLIJ NOTYFIKACJĘ NA CZAT FIRMOWY (TODO - będzie w kolejnym kroku)
      // sendFirmChatNotification(caseId, case_number, generatedPassword, userId);
      
      res.json({ 
        success: true, 
        caseId: caseId,
        access_password: generatedPassword  // Zwróć hasło do frontendu
      });
    }
  );
});

// Aktualizuj sprawę
router.put('/:id', verifyToken, canModifyCase, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const {
    title, description, case_type, case_subtype, status, priority,
    court_type, court_name, court_signature, court_department, judge_name, referent,
    court_id, court_address, court_phone, court_email, court_website, court_coordinates,
    prosecutor_id, prosecutor_office, prosecutor_name, prosecutor_address, 
    prosecutor_phone, prosecutor_email, prosecutor_website,
    indictment_number, auxiliary_prosecutor, investigation_authority, police_case_number,
    police_id, police_address, police_phone, police_email, police_website,
    opposing_party, value_amount, value_currency, assigned_to, case_manager_id, additional_caretaker,
    case_number
  } = req.body;
  
  console.log('📝 Aktualizacja sprawy:', id);
  if (court_id) {
    console.log('🏛️ Przypisano sąd z bazy:', court_id);
  }
  if (prosecutor_id) {
    console.log('🔍 Przypisano prokuraturę z bazy:', prosecutor_id);
  }
  if (police_id) {
    console.log('🚔 Przypisano komendę policji z bazy:', police_id);
  }

  db.run(
    `UPDATE cases SET
      title = ?, description = ?, case_type = ?, case_subtype = ?, status = ?, priority = ?,
      court_type = ?, court_name = ?, court_signature = ?, court_department = ?, judge_name = ?, referent = ?,
      court_id = ?, court_address = ?, court_phone = ?, court_email = ?, court_website = ?, court_coordinates = ?,
      prosecutor_id = ?, prosecutor_office = ?, prosecutor_name = ?, prosecutor_address = ?,
      prosecutor_phone = ?, prosecutor_email = ?, prosecutor_website = ?,
      indictment_number = ?, auxiliary_prosecutor = ?, investigation_authority = ?, police_case_number = ?,
      police_id = ?, police_address = ?, police_phone = ?, police_email = ?, police_website = ?,
      opposing_party = ?, value_amount = ?, value_currency = ?, assigned_to = ?, case_manager_id = ?, additional_caretaker = ?,
      case_number = COALESCE(?, case_number),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [title, description, case_type, case_subtype, status, priority,
     court_type, court_name, court_signature, court_department, judge_name, referent,
     court_id, court_address, court_phone, court_email, court_website, court_coordinates,
     prosecutor_id, prosecutor_office, prosecutor_name, prosecutor_address,
     prosecutor_phone, prosecutor_email, prosecutor_website,
     indictment_number, auxiliary_prosecutor, investigation_authority, police_case_number,
     police_id, police_address, police_phone, police_email, police_website,
     opposing_party, value_amount, value_currency, assigned_to, case_manager_id, additional_caretaker, case_number, id],
    function(err) {
      if (err) {
        console.error('Błąd aktualizacji sprawy:', err);
        return res.status(500).json({ error: 'Błąd aktualizacji sprawy: ' + err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      console.log('✅ Sprawa zaktualizowana!');
      
      // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD - używamy helpera
      const userId = req.user.userId || req.user.id;
      
      // Zbierz informacje o tym co zostało zmienione
      const changedFields = [];
      if (title) changedFields.push('tytuł');
      if (description) changedFields.push('opis');
      if (status) changedFields.push('status');
      if (priority) changedFields.push('priorytet');
      if (court_name || court_id) changedFields.push('sąd');
      if (prosecutor_name || prosecutor_id) changedFields.push('prokuratura');
      if (judge_name) changedFields.push('sędzia');
      if (assigned_to) changedFields.push('mecenas');
      if (case_manager_id) changedFields.push('opiekun');
      if (opposing_party) changedFields.push('strona przeciwna');
      if (value_amount) changedFields.push('wartość sprawy');
      
      const changesDesc = changedFields.length > 0 
        ? ` (zmieniono: ${changedFields.join(', ')})`
        : '';
      
      logEmployeeActivity({
        userId,
        actionType: 'case_updated',
        actionCategory: 'case',
        description: `Zaktualizowano szczegóły sprawy: ${title || 'ID ' + id}${changesDesc}`,
        caseId: id
      });
      
      res.json({ success: true });
    }
  );
});

// Usuń sprawę (tylko admin)
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userRole = req.user.role;
  const adminPassword = req.headers['x-admin-password'];

  // Sprawdź czy użytkownik to admin
  if (userRole !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Brak uprawnień - tylko administrator może usuwać sprawy' });
  }

  // Sprawdź hasło administratora
  if (adminPassword !== 'Proadmin') {
    return res.status(403).json({ error: 'Nieprawidłowe hasło administratora' });
  }

  // Usuń sprawę
  db.run(`DELETE FROM cases WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Błąd usuwania sprawy' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    // Usuń powiązane dane (cascade delete)
    db.run(`DELETE FROM notes WHERE case_id = ?`, [id]);
    db.run(`DELETE FROM documents WHERE case_id = ?`, [id]);
    db.run(`DELETE FROM events WHERE case_id = ?`, [id]);
    db.run(`DELETE FROM case_access WHERE case_id = ?`, [id]);
    
    res.json({ success: true, message: 'Sprawa została usunięta' });
  });
});

// Zamknij sprawę
router.post('/:id/close', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  db.run(
    `UPDATE cases SET status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd zamykania sprawy' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      res.json({ success: true });
    }
  );
});

// Przejmij sprawę
router.post('/:id/assign', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { lawyer_id, case_manager_id } = req.body;
  
  console.log('🎯 Przypisywanie sprawy:', id, '→ Mecenas:', lawyer_id, 'Opiekun:', case_manager_id);
  
  if (!lawyer_id) {
    return res.status(400).json({ error: 'lawyer_id jest wymagane' });
  }
  
  // Sprawdź czy mecenas istnieje i jest aktywny
  db.get(
    `SELECT id, name, user_role FROM users WHERE id = ? AND user_role = 'lawyer' AND is_active = 1`,
    [lawyer_id],
    (err, lawyer) => {
      if (err) {
        console.error('❌ Błąd sprawdzania mecenasa:', err);
        return res.status(500).json({ error: 'Błąd sprawdzania mecenasa' });
      }
      if (!lawyer) {
        return res.status(404).json({ error: 'Mecenas nie znaleziony lub nieaktywny' });
      }
      
      // Jeśli podano opiekuna, sprawdź go też
      if (case_manager_id) {
        db.get(
          `SELECT id, name, user_role FROM users WHERE id = ? AND user_role = 'case_manager' AND is_active = 1`,
          [case_manager_id],
          (err, manager) => {
            if (err) {
              console.error('❌ Błąd sprawdzania opiekuna:', err);
              return res.status(500).json({ error: 'Błąd sprawdzania opiekuna' });
            }
            if (!manager) {
              return res.status(404).json({ error: 'Opiekun nie znaleziony lub nieaktywny' });
            }
            
            // Przypisz obu
            assignCase(db, id, lawyer_id, case_manager_id, res);
          }
        );
      } else {
        // Przypisz tylko mecenasa
        assignCase(db, id, lawyer_id, null, res);
      }
    }
  );
});

// Helper do przypisywania sprawy
function assignCase(db, caseId, lawyerId, managerId, res) {
  db.run(
    `UPDATE cases 
     SET assigned_to = ?, 
         case_manager_id = ?, 
         status = 'in_progress',
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [lawyerId, managerId, caseId],
    function(err) {
      if (err) {
        console.error('❌ Błąd przypisywania sprawy:', err);
        return res.status(500).json({ error: 'Błąd przypisywania sprawy' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      
      console.log('✅ Sprawa przypisana:', caseId, '→ Mecenas:', lawyerId, 'Opiekun:', managerId);
      
      // 📊 LOGUJ PRZEJĘCIE SPRAWY - mecenas
      logEmployeeActivity({
        userId: lawyerId,
        actionType: 'case_taken_over',
        actionCategory: 'case',
        description: `Przejęto sprawę ID ${caseId}`,
        caseId: caseId
      });
      
      // 📊 LOGUJ PRZEJĘCIE SPRAWY - opiekun (jeśli jest)
      if (managerId) {
        logEmployeeActivity({
          userId: managerId,
          actionType: 'case_assigned_manager',
          actionCategory: 'case',
          description: `Przypisano jako opiekun sprawy ID ${caseId}`,
          caseId: caseId
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Sprawa została przypisana',
        assigned_to: lawyerId,
        case_manager_id: managerId,
        status: 'in_progress'
      });
    }
  );
}

// Oddaj sprawę
router.post('/:id/unassign', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  console.log('↩️ Oddawanie sprawy:', id);
  
  db.run(
    `UPDATE cases 
     SET assigned_to = NULL, 
         case_manager_id = NULL, 
         status = 'open',
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('❌ Błąd oddawania sprawy:', err);
        return res.status(500).json({ error: 'Błąd oddawania sprawy' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      
      console.log('✅ Sprawa oddana:', id);
      
      // 📊 LOGUJ ODDANIE SPRAWY
      const userId = req.user.userId || req.user.id;
      logEmployeeActivity({
        userId,
        actionType: 'case_handed_over',
        actionCategory: 'case',
        description: `Oddano sprawę ID ${id}`,
        caseId: id
      });
      
      res.json({ 
        success: true, 
        message: 'Sprawa została oddana i jest dostępna dla innych',
        status: 'open'
      });
    }
  );
});

// Pobierz notatki sprawy
router.get('/:id/notes', verifyToken, canAccessCase, canViewInternalNotes, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const canViewInternal = req.canViewInternal;

  let query = `
    SELECT n.*, u.name as created_by_name
    FROM notes n
    LEFT JOIN users u ON n.created_by = u.id
    WHERE n.case_id = ?
  `;

  // Klienci nie widzą wewnętrznych notatek
  if (!canViewInternal) {
    query += ` AND (n.note_type != 'internal' OR n.note_type IS NULL)`;
  }

  query += ` ORDER BY n.created_at DESC`;

  db.all(query, [id], (err, notes) => {
    if (err) {
      return res.status(500).json({ error: 'Błąd pobierania notatek' });
    }
    res.json({ notes });
  });
});

// Historia zmian sprawy (timeline z employee_activity_logs)
router.get('/:id/history', verifyToken, canAccessCase, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 200;

  db.all(
    `
    SELECT l.*, u.name as user_name, u.user_role
    FROM employee_activity_logs l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.related_case_id = ?
    ORDER BY l.created_at DESC
    LIMIT ?
    `,
    [id, limit],
    (err, rows) => {
      if (err) {
        console.error('❌ Błąd pobierania historii sprawy:', err);
        return res.status(500).json({ error: 'Błąd pobierania historii sprawy' });
      }

      res.json({ history: rows || [] });
    }
  );
});

// Wyszukaj dokument po numerze (globalnie) - MUSI BYĆ PRZED /:id/documents
router.get('/search-documents', verifyToken, (req, res) => {
  const db = getDatabase();
  const { q } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json({ error: 'Zapytanie musi mieć minimum 3 znaki' });
  }

  db.all(
    `SELECT d.*, u.name as uploaded_by_name, c.case_number, c.title as case_title,
            cl.first_name, cl.last_name
     FROM documents d
     LEFT JOIN users u ON d.uploaded_by = u.id
     LEFT JOIN cases c ON d.case_id = c.id
     LEFT JOIN clients cl ON d.client_id = cl.id
     WHERE d.document_number LIKE ? OR d.title LIKE ? OR d.filename LIKE ?
     ORDER BY d.uploaded_at DESC
     LIMIT 50`,
    [`%${q}%`, `%${q}%`, `%${q}%`],
    (err, documents) => {
      if (err) {
        console.error('Error searching documents:', err);
        return res.status(500).json({ error: 'Błąd wyszukiwania dokumentów' });
      }
      res.json({ documents, count: documents.length });
    }
  );
});

// Pobierz wydarzenia sprawy
router.get('/:id/events', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  db.all(
    `SELECT e.*, u.name as created_by_name
     FROM events e
     LEFT JOIN users u ON e.created_by = u.id
     WHERE e.case_id = ?
     ORDER BY e.start_date ASC`,
    [id],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania wydarzeń' });
      }
      res.json({ events });
    }
  );
});

// PATCH /cases/:id/status - Zmień status sprawy
router.patch('/:id/status', verifyToken, canModifyCase, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status } = req.body;

  console.log('🔄 Zmiana statusu sprawy:', id, '→', status);

  if (!status || !['open', 'in_progress', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Nieprawidłowy status. Dopuszczalne: open, in_progress, closed' });
  }

  // Jeśli zamykamy sprawę, ustaw closed_at
  const closedAt = status === 'closed' ? 'CURRENT_TIMESTAMP' : 'NULL';

  db.run(
    `UPDATE cases 
     SET status = ?, 
         closed_at = ${closedAt}, 
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [status, id],
    function(err) {
      if (err) {
        console.error('❌ Error updating case status:', err);
        return res.status(500).json({ error: 'Błąd zmiany statusu' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      
      console.log('✅ Status sprawy zmieniony:', id, '→', status);
      res.json({ success: true, status });
    }
  );
});

// GET /documents/:id - Pobierz pojedynczy dokument (uniwersalny endpoint)
router.get('/documents/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  console.log('📄 Pobieranie dokumentu/załącznika:', id);
  
  // Najpierw sprawdź w documents
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
    if (err) {
      console.error('❌ Błąd pobierania:', err);
      return res.status(500).json({ error: 'Błąd pobierania' });
    }
    
    if (doc && doc.filepath && fs.existsSync(doc.filepath)) {
      console.log('✅ Znaleziono w documents:', doc.filename);
      return res.sendFile(doc.filepath);
    }
    
    // Jeśli nie ma w documents, sprawdź w attachments
    db.get('SELECT * FROM attachments WHERE id = ?', [id], (err2, att) => {
      if (err2) {
        console.error('❌ Błąd pobierania z attachments:', err2);
        return res.status(500).json({ error: 'Błąd pobierania' });
      }
      
      if (!att) {
        return res.status(404).json({ error: 'Dokument nie znaleziony' });
      }
      
      if (!fs.existsSync(att.file_path)) {
        return res.status(404).json({ error: 'Plik nie istnieje' });
      }
      
      console.log('✅ Znaleziono w attachments:', att.file_name);
      res.sendFile(att.file_path);
    });
  });
});

// GET /cases/:id/documents - Pobierz dokumenty sprawy (documents + attachments)
router.get('/:id/documents', verifyToken, canAccessCase, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  console.log('📄📄📄 POBIERANIE DOKUMENTÓW SPRAWY:', id);
  console.log('📄📄📄 ROUTE HIT!');
  
  // Pobierz zarówno documents jak i attachments
  db.all(
    `SELECT 
      d.id,
      d.case_id,
      d.document_number,
      NULL as attachment_code,
      d.title,
      d.description,
      d.category,
      d.filename,
      d.filepath as file_path,
      d.file_size,
      d.file_type,
      NULL as file_data,
      d.uploaded_at,
      d.uploaded_at as upload_date,
      d.uploaded_at as created_at,
      d.uploaded_by,
      u.name as uploaded_by_name,
      'document' as source_type
     FROM documents d
     LEFT JOIN users u ON d.uploaded_by = u.id
     WHERE d.case_id = ?
     
     UNION ALL
     
     SELECT 
      a.id,
      a.case_id,
      NULL as document_number,
      a.attachment_code,
      a.title,
      a.description,
      a.category,
      a.file_name as filename,
      a.file_path,
      a.file_size,
      a.file_type,
      a.file_data,
      a.uploaded_at,
      a.uploaded_at as upload_date,
      a.uploaded_at as created_at,
      a.uploaded_by,
      u.name as uploaded_by_name,
      'attachment' as source_type
     FROM attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.case_id = ?
     
     UNION ALL
     
     SELECT 
      wd.id,
      wd.case_id,
      wd.document_code as document_number,
      wd.document_code as attachment_code,
      wd.title,
      wd.description,
      'świadek' as category,
      wd.file_name as filename,
      wd.file_path,
      wd.file_size,
      wd.file_type,
      wd.file_data,
      wd.uploaded_at,
      wd.uploaded_at as upload_date,
      wd.uploaded_at as created_at,
      wd.uploaded_by,
      u.name as uploaded_by_name,
      'witness_document' as source_type
     FROM witness_documents wd
     LEFT JOIN users u ON wd.uploaded_by = u.id
     WHERE wd.case_id = ?
     
     ORDER BY uploaded_at DESC`,
    [id, id, id],
    (err, documents) => {
      if (err) {
        console.error('❌ Błąd pobierania dokumentów:', err);
        return res.status(500).json({ error: 'Błąd pobierania dokumentów' });
      }
      
      console.log(`✅ Znaleziono ${documents.length} dokumentów+załączników dla sprawy ${id}`);
      
      // DEBUG: Pokaż co zwracamy
      if (documents.length > 0) {
        console.log('🔍 PIERWSZY DOKUMENT Z BAZY:');
        console.log('  - id:', documents[0].id);
        console.log('  - title:', documents[0].title);
        console.log('  - attachment_code:', documents[0].attachment_code);
        console.log('  - document_number:', documents[0].document_number);
        console.log('  - source_type:', documents[0].source_type);
        
        // Pokaż ile każdego typu
        const byType = documents.reduce((acc, d) => {
          acc[d.source_type] = (acc[d.source_type] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 DOKUMENTY WEDŁUG TYPU:', byType);
        console.log('🔍 witness_document count:', byType.witness_document || 0);
      }
      
      res.json({ documents: documents || [] });
    }
  );
});

// POST /cases/:id/documents - Dodaj dokument do sprawy (ASYNC/AWAIT)
router.post('/:id/documents', (req, res, next) => {
  console.log('🔵🔵🔵 REQUEST DOTARŁ DO ENDPOINTU! POST /cases/' + req.params.id + '/documents');
  console.log('🔵 Method:', req.method);
  console.log('🔵 URL:', req.url);
  console.log('🔵 Headers Authorization:', req.headers.authorization ? 'JEST' : 'BRAK');
  next();
}, verifyToken, canModifyCase, (req, res, next) => {
  console.log('🟡🟡🟡 PO verifyToken i canModifyCase');
  console.log('🟡 User:', req.user);
  next();
}, uploadCaseDocument.single('file'), async (req, res) => {
  console.log('🟢🟢🟢 PO MULTER - REQ.FILE:', !!req.file);
  
  const db = getDatabase();
  const { id } = req.params;
  const { title, description, category } = req.body;
  const userId = req.user.userId;

  console.log('📎 RECEIVED REQUEST TO ADD DOCUMENT:', {
    caseId: id,
    hasFile: !!req.file,
    title,
    description,
    category,
    userId
  });

  if (!req.file) {
    console.error('❌ BRAK PLIKU!');
    return res.status(400).json({ error: 'Plik jest wymagany' });
  }

  if (!title) {
    console.error('❌ BRAK TITLE!');
    return res.status(400).json({ error: 'Tytuł jest wymagany' });
  }

  console.log('📎 Dodawanie dokumentu do sprawy:', id);
  console.log('File:', req.file);

  try {
    // 1. Pobierz dane sprawy (client_id)
    const caseData = await new Promise((resolve, reject) => {
      db.get('SELECT client_id FROM cases WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('Sprawa nie znaleziona'));
        else resolve(row);
      });
    });

    // 2. Pobierz dane sprawy dla numeracji
    const caseInfo = await new Promise((resolve, reject) => {
      db.get(
        `SELECT c.case_number, cl.first_name, cl.last_name
         FROM cases c
         LEFT JOIN clients cl ON c.client_id = cl.id
         WHERE c.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        }
      );
    });

    // 3. Generuj numer dokumentu z kategorią
    const caseNumber = caseInfo.case_number || 'BRAK';
    const categoryPrefix = category || 'INN'; // Domyślnie INN jeśli brak kategorii
    const prefix = `DOK/${categoryPrefix}/${caseNumber}/`;

    console.log('📋 Prefix dokumentu z kategorią:', prefix);

    // 4. Znajdź ostatni numer dokumentu dla tej kategorii
    const lastDoc = await new Promise((resolve, reject) => {
      db.get(
        `SELECT document_number FROM documents 
         WHERE case_id = ? AND document_number LIKE ?
         ORDER BY document_number DESC LIMIT 1`,
        [id, `${prefix}%`],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    let nextNumber = 1;
    if (lastDoc && lastDoc.document_number) {
      const lastNumberPart = lastDoc.document_number.split('/').pop();
      nextNumber = parseInt(lastNumberPart) + 1;
    }

    const documentCode = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    console.log('📋 Wygenerowany numer dokumentu:', documentCode);

    // 5. Zapisz dokument - użyj zdekodowanej nazwy pliku (polskie znaki)
    const decodedFilename = req.file.decodedOriginalname || req.file.originalname;
    console.log('💾 Próbuję zapisać dokument do bazy...', {
      documentCode,
      caseId: id,
      clientId: caseData.client_id,
      title,
      fileName: decodedFilename,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });

    const documentId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO documents (
          document_number, case_id, client_id, title, description, 
          filename, filepath, file_size, file_type, category,
          uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          documentCode,
          id,
          caseData.client_id,
          title,
          description || null,
          decodedFilename,
          req.file.path,
          req.file.size,
          req.file.mimetype,
          category || 'general',
          userId
        ],
        function(err) {
          if (err) {
            console.error('❌❌❌ BŁĄD ZAPISU DO BAZY:', err);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error code:', err.code);
            reject(err);
          } else {
            console.log('✅✅✅ Dokument dodany do bazy:', documentCode, '(ID:', this.lastID + ')');
            resolve(this.lastID);
          }
        }
      );
    });

    // 6. Zwróć sukces
    res.json({
      success: true,
      documentId: documentId,
      documentCode: documentCode,
      message: 'Dokument został dodany'
    });

  } catch (error) {
    console.error('❌ BŁĄD OGÓLNY:', error);
    
    if (error.message === 'Sprawa nie znaleziona') {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Błąd dodawania dokumentu: ' + error.message 
    });
  }
});

// GET /cases/:id/witnesses - Pobierz świadków sprawy Z ZEZNANIAMI
router.get('/:id/witnesses', verifyToken, canAccessCase, async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  console.log(`📋 Pobieranie świadków dla sprawy ${id}...`);
  
  try {
    // Pobierz świadków
    const witnesses = await new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, 
               u.name as created_by_name
        FROM case_witnesses w
        LEFT JOIN users u ON w.created_by = u.id
        WHERE w.case_id = ?
        ORDER BY w.created_at DESC
      `;
      
      db.all(query, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Dla każdego świadka pobierz jego zeznania
    for (const witness of witnesses) {
      const testimonies = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM witness_testimonies 
           WHERE witness_id = ? 
           ORDER BY testimony_date DESC`,
          [witness.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
      
      witness.testimonies_count = testimonies.length;
      
      // Dodaj najnowsze zeznanie jako pola główne (dla kompatybilności)
      if (testimonies.length > 0) {
        const latest = testimonies[0];
        witness.testimony = latest.testimony_content;
        witness.oral_testimony = latest.testimony_type === 'oral' ? latest.testimony_content : null;
      }
    }
    
    console.log(`✅ Znaleziono ${witnesses.length} świadków z zeznaniami`);
    res.json({ witnesses });
    
  } catch (err) {
    console.error('❌ Błąd pobierania świadków:', err);
    res.status(500).json({ error: 'Błąd pobierania świadków' });
  }
});

// GET /cases/:id/documents/:docId/download - Pobierz dokument (obsługuje documents, attachments, witness_documents)
router.get('/:id/documents/:docId/download', verifyToken, canAccessCase, async (req, res) => {
  const db = getDatabase();
  const { id, docId } = req.params;
  const isView = req.query.view === 'true';

  try {
    // Szukaj w documents
    let document = await new Promise((resolve, reject) => {
      db.get('SELECT *, "document" as source_type FROM documents WHERE id = ? AND case_id = ?', [docId, id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Jeśli nie znaleziono, szukaj w attachments
    if (!document) {
      document = await new Promise((resolve, reject) => {
        db.get('SELECT *, "attachment" as source_type FROM attachments WHERE id = ? AND case_id = ?', [docId, id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    // Jeśli nie znaleziono, szukaj w witness_documents
    if (!document) {
      document = await new Promise((resolve, reject) => {
        db.get('SELECT *, "witness_document" as source_type FROM witness_documents WHERE id = ? AND case_id = ?', [docId, id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    if (!document) {
      return res.status(404).json({ error: 'Dokument nie znaleziony' });
    }

    const fileName = document.filename || document.file_name;
    const filePath = document.filepath || document.file_path;
    const mimeType = document.file_type || document.mimetype || 'application/octet-stream';
    const disposition = isView ? 'inline' : 'attachment';
    
    // PRIORITET 1: Sprawdź czy mamy base64 data w bazie (dla witness_documents i attachments)
    if (document.file_data) {
      console.log('📦 Używam base64 z bazy dla dokumentu:', fileName);
      const buffer = Buffer.from(document.file_data, 'base64');
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(fileName)}"`);
      
      return res.send(buffer);
    }
    
    // PRIORITET 2: Sprawdź czy plik istnieje na dysku (fallback dla starych dokumentów)
    if (filePath && fs.existsSync(filePath)) {
      console.log('📁 Używam pliku z dysku:', filePath);
      res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Type', mimeType);
      
      return res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Błąd wysyłania pliku' });
          }
        }
      });
    }
    
    // Brak pliku zarówno w bazie jak i na dysku
    console.error('❌ Plik nie znaleziony ani w bazie ani na dysku:', fileName);
    return res.status(404).json({ error: 'Plik nie znaleziony na serwerze' });
    
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Błąd pobierania dokumentu' });
  }
});

// GET /cases/staff/list - Pobierz listę personelu (mecenasów i opiekunów)
router.get('/staff/list', verifyToken, async (req, res) => {
  const db = getDatabase();
  
  console.log('👥 Pobieranie listy personelu...');
  
  try {
    // Pobierz mecenasów (lawyer)
    const lawyers = await new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, email, initials, user_role
        FROM users 
        WHERE user_role = 'lawyer' AND is_active = 1
        ORDER BY name ASC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz opiekunów klienta (client_manager)
    const client_managers = await new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, email, initials, user_role
        FROM users 
        WHERE user_role = 'client_manager' AND is_active = 1
        ORDER BY name ASC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz opiekunów sprawy (case_manager)
    const case_managers = await new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, email, initials, user_role
        FROM users 
        WHERE user_role = 'case_manager' AND is_active = 1
        ORDER BY name ASC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log(`✅ Znaleziono ${lawyers.length} mecenasów, ${client_managers.length} opiekunów klienta i ${case_managers.length} opiekunów sprawy`);
    
    res.json({
      lawyers,
      client_managers,
      case_managers,
      total: lawyers.length + client_managers.length + case_managers.length
    });
    
  } catch (err) {
    console.error('❌ Błąd pobierania listy personelu:', err);
    res.status(500).json({ error: 'Błąd pobierania listy personelu' });
  }
});

// =============================================
// SYSTEM HASEŁ DOSTĘPU DO SPRAW
// =============================================

// POST /api/cases/verify-password - Weryfikuj hasło dostępu do sprawy
router.post('/verify-password', verifyToken, verifyPassword);

// GET /api/cases/:id/with-password - Pobierz sprawę z weryfikacją hasła
router.get('/:id/with-password', verifyToken, checkCaseAccess, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  // Jeśli checkCaseAccess przepuścił, pobierz dane sprawy
  db.get(
    `SELECT c.*, 
            cl.first_name, cl.last_name, cl.company_name, cl.email, cl.phone,
            u.name as assigned_to_name, 
            u.initials as assigned_to_initials,
            cm.name as case_manager_name,
            cm.initials as case_manager_initials,
            client_caretaker.name as client_caretaker_name,
            additional_caretaker.name as additional_caretaker_name,
            creator.name as created_by_name
     FROM cases c
     LEFT JOIN clients cl ON c.client_id = cl.id
     LEFT JOIN users u ON c.assigned_to = u.id
     LEFT JOIN users cm ON c.case_manager_id = cm.id
     LEFT JOIN users client_caretaker ON cl.assigned_to = client_caretaker.id
     LEFT JOIN users additional_caretaker ON c.additional_caretaker = additional_caretaker.id
     LEFT JOIN users creator ON c.created_by = creator.id
     WHERE c.id = ?`,
    [id],
    (err, caseData) => {
      if (err) {
        console.error('Error fetching case:', err);
        return res.status(500).json({ error: 'Błąd pobierania sprawy' });
      }
      if (!caseData) {
        return res.status(404).json({ error: 'Sprawa nie znaleziona' });
      }
      
      // Dodaj info o metodzie dostępu
      res.json({ 
        case: caseData,
        access_info: req.caseAccess  // {granted: true, method: 'role' | 'password'}
      });
    }
  );
});

module.exports = router;
