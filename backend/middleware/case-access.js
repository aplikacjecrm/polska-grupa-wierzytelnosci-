// Middleware do sprawdzania dostępu do sprawy z hasłem
const { getDatabase } = require('../database/init');
const { ROLES } = require('./permissions');

/**
 * Generuje UNIKALNE hasło dostępu do sprawy - NIE ZMIENIA SIĘ!
 * Format: ABC-123 (3 litery + 3 cyfry)
 * Hasło jest generowane na podstawie numeru sprawy i jest zawsze takie samo dla tej sprawy
 */
function generateCasePassword(caseNumber) {
  console.log('🔐 BACKEND: Generowanie hasła dla numeru sprawy:', caseNumber);
  
  // Użyj numeru sprawy jako seed
  const cleanNumber = caseNumber.replace(/[^0-9]/g, '');
  let seed = 0;
  
  // Dodaj wartość ASCII każdego znaku z pełnego numeru sprawy
  for (let i = 0; i < caseNumber.length; i++) {
    seed += caseNumber.charCodeAt(i) * (i + 1);
  }
  
  console.log('  📊 Seed po ASCII:', seed);
  
  // Dodaj wartość numeryczną
  seed += parseInt(cleanNumber || '1', 10) * 1337;
  
  console.log('  📊 Seed końcowy:', seed);
  
  // Generuj 3 litery (A-Z) używając seed
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lettersPart = '';
  let hash1 = seed;
  for (let i = 0; i < 3; i++) {
    hash1 = (hash1 * 1103515245 + 12345) & 0x7fffffff;
    lettersPart += letters[hash1 % 26];
  }
  
  // Generuj 3 cyfry (0-9) używając seed
  let digitsPart = '';
  let hash2 = seed * 7919;
  for (let i = 0; i < 3; i++) {
    hash2 = (hash2 * 1103515245 + 12345) & 0x7fffffff;
    digitsPart += (hash2 % 10).toString();
  }
  
  const password = `${lettersPart}-${digitsPart}`;
  console.log('  ✅ BACKEND: Wygenerowane hasło:', password);
  
  return password;
}

/**
 * Generuje aktualne hasło dla sprawy (do wyświetlenia)
 * Używane w szczegółach sprawy
 */
function getCurrentCasePassword(caseNumber) {
  return generateCasePassword(caseNumber);
}

/**
 * Sprawdza czy użytkownik ma dostęp do sprawy na podstawie roli
 */
function hasRoleBasedAccess(userId, userRole, caseData) {
  console.log('🔍 hasRoleBasedAccess sprawdza:', {
    userId,
    userRole,
    'caseData.assigned_to': caseData.assigned_to,
    'caseData.case_manager_id': caseData.case_manager_id,
    'caseData.additional_caretaker': caseData.additional_caretaker,
    'caseData.created_by': caseData.created_by,
    'userId === assigned_to': parseInt(userId) === parseInt(caseData.assigned_to),
    'userId === case_manager_id': parseInt(userId) === parseInt(caseData.case_manager_id),
    'userId === additional_caretaker': parseInt(userId) === parseInt(caseData.additional_caretaker),
    'userId === created_by': parseInt(userId) === parseInt(caseData.created_by)
  });
  
  // Admin - zawsze ma dostęp
  if (userRole === ROLES.ADMIN) {
    console.log('✅ ADMIN - ma dostęp');
    return true;
  }
  
  // Recepcja - zawsze ma dostęp
  if (userRole === ROLES.RECEPTION) {
    console.log('✅ RECEPTION - ma dostęp');
    return true;
  }
  
  // Mecenas - jeśli jest assigned_to
  if (userRole === ROLES.LAWYER && parseInt(caseData.assigned_to) === parseInt(userId)) {
    console.log('✅ LAWYER assigned_to - ma dostęp');
    return true;
  }
  
  // Opiekun sprawy - jeśli jest additional_caretaker lub case_manager_id
  if (userRole === ROLES.CASE_MANAGER) {
    if (parseInt(caseData.additional_caretaker) === parseInt(userId) || parseInt(caseData.case_manager_id) === parseInt(userId)) {
      console.log('✅ CASE_MANAGER - ma dostęp');
      return true;
    }
  }
  
  // Opiekun klienta - jeśli klient jest assigned_to tego użytkownika
  if (userRole === ROLES.CLIENT_MANAGER) {
    console.log('🔍 CLIENT_MANAGER - sprawdzam klienta...');
    return 'check_client'; // Specjalny flag
  }
  
  // Utworzyciel sprawy - zawsze ma dostęp
  if (parseInt(caseData.created_by) === parseInt(userId)) {
    console.log('✅ CREATOR - ma dostęp');
    return true;
  }
  
  console.log('❌ NIE MA DOSTĘPU na podstawie roli');
  return false;
}

/**
 * Middleware sprawdzający dostęp do sprawy
 * Jeśli użytkownik NIE ma dostępu na podstawie roli, wymaga hasła
 */
async function checkCaseAccess(req, res, next) {
  const db = getDatabase();
  const caseId = parseInt(req.params.id);
  const userId = parseInt(req.user.userId || req.user.id);
  const userRole = req.user.user_role || req.user.role;
  
  // Pobierz hasło z nagłówka (jeśli podane)
  const providedPassword = req.headers['x-case-password'];
  
  console.log('🔐🔐🔐 checkCaseAccess - START:', {
    caseId,
    userId,
    userRole,
    hasPassword: !!providedPassword
  });
  
  // Pobierz dane sprawy
  db.get('SELECT * FROM cases WHERE id = ?', [caseId], async (err, caseData) => {
    if (err) {
      console.error('❌ Błąd pobierania sprawy:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    
    if (!caseData) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    console.log('📋 Dane sprawy:', {
      case_number: caseData.case_number,
      assigned_to: caseData.assigned_to,
      case_manager_id: caseData.case_manager_id,
      additional_caretaker: caseData.additional_caretaker,
      created_by: caseData.created_by
    });
    
    // Sprawdź dostęp na podstawie roli
    let roleAccess = hasRoleBasedAccess(userId, userRole, caseData);
    console.log('🔍 roleAccess wynik:', roleAccess);
    
    // Specjalna obsługa dla CLIENT_MANAGER
    if (roleAccess === 'check_client') {
      const clientAccess = await new Promise((resolve) => {
        db.get('SELECT assigned_to FROM clients WHERE id = ?', [caseData.client_id], (err, client) => {
          if (err || !client) resolve(false);
          else resolve(client.assigned_to === userId);
        });
      });
      
      if (clientAccess) {
        req.caseAccess = { granted: true, method: 'role' };
        return next();
      }
    }
    
    // Jeśli ma dostęp na podstawie roli - przepuść
    if (roleAccess === true) {
      req.caseAccess = { granted: true, method: 'role' };
      return next();
    }
    
    // 🔐 NOWE: Sprawdź uprawnienia w tabeli case_permissions
    console.log(`🔍 Sprawdzam uprawnienia dla userId=${userId} (type: ${typeof userId}), caseId=${caseId} (type: ${typeof caseId})`);
    
    // NAJPIERW sprawdź wszystkie uprawnienia w bazie dla tej sprawy (DEBUG)
    const allPermissions = await new Promise((resolve) => {
      db.all(
        `SELECT * FROM case_permissions WHERE case_id = ?`,
        [caseId],
        (err, rows) => {
          if (err) {
            console.error('❌ Błąd pobierania wszystkich uprawnień:', err);
            resolve([]);
          } else {
            console.log(`📋 Wszystkie uprawnienia dla sprawy ${caseId}:`, rows);
            resolve(rows || []);
          }
        }
      );
    });
    
    const permission = await new Promise((resolve) => {
      db.get(
        `SELECT * FROM case_permissions 
         WHERE case_id = ? AND user_id = ? AND revoked_at IS NULL
         ORDER BY granted_at DESC LIMIT 1`,
        [caseId, userId],
        (err, row) => {
          if (err) {
            console.error('❌ Błąd sprawdzania uprawnień:', err);
            resolve(null);
          } else {
            console.log(`🔍 Znalezione uprawnienie dla userId=${userId}:`, row);
            console.log(`🔍 SQL params:`, { caseId, userId });
            resolve(row);
          }
        }
      );
    });
    
    // Jeśli ma uprawnienie stałe
    if (permission && permission.permission_type === 'permanent') {
      console.log(`✅ Użytkownik ${userId} ma STAŁY dostęp do sprawy ${caseId}`);
      req.caseAccess = { granted: true, method: 'permission_permanent', permission_id: permission.id };
      return next();
    }
    
    // Jeśli ma uprawnienie czasowe - sprawdź czy nie wygasło
    if (permission && permission.permission_type === 'temporary') {
      const expiresAt = new Date(permission.expires_at);
      const now = new Date();
      
      if (expiresAt > now) {
        console.log(`✅ Użytkownik ${userId} ma CZASOWY dostęp do sprawy ${caseId} (wygasa: ${expiresAt})`);
        req.caseAccess = { granted: true, method: 'permission_temporary', permission_id: permission.id, expires_at: expiresAt };
        return next();
      } else {
        console.log(`⏰ Dostęp czasowy użytkownika ${userId} do sprawy ${caseId} WYGASŁ`);
        // Nie blokuj - dalej może użyć hasła
      }
    }
    
    // Jeśli NIE ma dostępu - sprawdź hasło
    if (!providedPassword) {
      console.log(`🔒 Użytkownik ${userId} (${userRole}) NIE ma dostępu do sprawy ${caseId} - brak hasła`);
      return res.status(403).json({ 
        error: 'Brak dostępu do sprawy',
        requiresPassword: true,
        message: 'Ta sprawa nie jest przypisana do Ciebie. Wprowadź hasło dostępu aby zobaczyć szczegóły.'
      });
    }
    
    // Sprawdź hasło - UNIKALNE dla każdej sprawy
    const currentPassword = getCurrentCasePassword(caseData.case_number);
    console.log(`🔐 SPRAWDZANIE HASŁA:`);
    console.log(`  📋 Numer sprawy: ${caseData.case_number}`);
    console.log(`  ✅ Wygenerowane hasło: ${currentPassword}`);
    console.log(`  🔑 Podane przez użytkownika: ${providedPassword}`);
    console.log(`  🎯 Czy pasuje: ${providedPassword === currentPassword}`);
    
    if (providedPassword === currentPassword) {
      console.log(`✅ Użytkownik ${userId} uzyskał dostęp do sprawy ${caseId} przez hasło`);
      req.caseAccess = { granted: true, method: 'password' };
      
      // Zaloguj dostęp przez hasło (opcjonalne - do audytu)
      db.run(
        `INSERT INTO case_access_log (case_id, user_id, access_method, created_at) VALUES (?, ?, 'password', datetime('now'))`,
        [caseId, userId],
        (err) => {
          if (err) console.error('⚠️ Błąd logowania dostępu:', err);
        }
      );
      
      return next();
    }
    
    // Hasło niepoprawne
    console.log(`❌ Użytkownik ${userId} podał niepoprawne hasło do sprawy ${caseId}`);
    return res.status(403).json({ 
      error: 'Niepoprawne hasło dostępu',
      requiresPassword: true
    });
  });
}

/**
 * Sprawdza czy hasło jest poprawne (bez middleware, do weryfikacji)
 */
function verifyPassword(req, res) {
  const db = getDatabase();
  const { caseId, password } = req.body;
  
  if (!caseId || !password) {
    return res.status(400).json({ error: 'Brak wymaganych danych' });
  }
  
  db.get('SELECT id, access_password FROM cases WHERE id = ?', [caseId], (err, caseData) => {
    if (err) {
      console.error('❌ Błąd weryfikacji hasła:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    
    if (!caseData) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    if (caseData.access_password === password) {
      return res.json({ valid: true, message: 'Hasło poprawne' });
    } else {
      return res.status(403).json({ valid: false, error: 'Niepoprawne hasło' });
    }
  });
}

module.exports = {
  generateCasePassword,
  getCurrentCasePassword,
  hasRoleBasedAccess,
  checkCaseAccess,
  verifyPassword
};
