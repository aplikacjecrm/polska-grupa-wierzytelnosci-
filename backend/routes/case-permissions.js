const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { ROLES } = require('../middleware/permissions');

const router = express.Router();

// 🔍 DEBUG: Sprawdź uprawnienia użytkownika do sprawy
router.get('/debug/:caseId/:userId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId, userId } = req.params;
  
  db.all(
    `SELECT * FROM case_permissions WHERE case_id = ? AND user_id = ?`,
    [caseId, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        caseId,
        userId,
        permissions: rows || [],
        count: rows ? rows.length : 0
      });
    }
  );
});

// Middleware - sprawdź czy użytkownik może modyfikować sprawę
function canModifyCase(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  // Admin, lawyer, case_manager mogą modyfikować
  if ([ROLES.ADMIN, ROLES.LAWYER, ROLES.CASE_MANAGER, ROLES.CLIENT_MANAGER].includes(userRole)) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień do modyfikacji sprawy' });
}

// Helper - sprawdź czy uprawnienie jest aktywne
function isPermissionActive(permission) {
  if (permission.revoked_at) return false;
  if (!permission.expires_at) return true; // stałe
  return new Date(permission.expires_at) > new Date();
}

// 1. 🔓 Nadaj dostęp jednorazowy (24h lub custom)
router.post('/:caseId/grant-temporary', verifyToken, canModifyCase, async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  const { user_id, hours = 24, notes } = req.body;
  const grantedBy = req.user.userId;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id jest wymagane' });
  }

  try {
    // Sprawdź czy użytkownik istnieje
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, email FROM users WHERE id = ?', [user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    // Sprawdź czy już ma aktywne uprawnienie
    const existing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM case_permissions 
         WHERE case_id = ? AND user_id = ? AND revoked_at IS NULL
         ORDER BY granted_at DESC LIMIT 1`,
        [caseId, user_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing && isPermissionActive(existing)) {
      return res.status(400).json({ 
        error: 'Użytkownik już ma aktywne uprawnienie do tej sprawy',
        existing_permission: existing
      });
    }

    // Oblicz czas wygaśnięcia
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Dodaj uprawnienie
    const permissionId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO case_permissions (case_id, user_id, permission_type, granted_by, expires_at, notes)
         VALUES (?, ?, 'temporary', ?, ?, ?)`,
        [caseId, user_id, grantedBy, expiresAt.toISOString(), notes || null],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`✅ Nadano dostęp czasowy: Sprawa ${caseId} → Użytkownik ${user_id} (${hours}h)`);

    res.json({
      success: true,
      message: 'Dostęp czasowy nadany pomyślnie',
      permission: {
        id: permissionId,
        case_id: caseId,
        user_id: user_id,
        user_name: user.name,
        user_email: user.email,
        permission_type: 'temporary',
        expires_at: expiresAt.toISOString(),
        hours: hours
      }
    });

  } catch (error) {
    console.error('❌ Błąd nadawania dostępu czasowego:', error);
    res.status(500).json({ error: 'Błąd nadawania dostępu' });
  }
});

// 2. 🔐 Nadaj dostęp stały
router.post('/:caseId/grant-permanent', verifyToken, canModifyCase, async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  const { user_id, notes } = req.body;
  const grantedBy = req.user.userId;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id jest wymagane' });
  }

  try {
    // Sprawdź czy użytkownik istnieje
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, email FROM users WHERE id = ?', [user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    // Sprawdź czy już ma aktywne uprawnienie stałe
    const existing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM case_permissions 
         WHERE case_id = ? AND user_id = ? AND permission_type = 'permanent' AND revoked_at IS NULL`,
        [caseId, user_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Użytkownik już ma stały dostęp do tej sprawy'
      });
    }

    // Dodaj uprawnienie
    const permissionId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO case_permissions (case_id, user_id, permission_type, granted_by, notes)
         VALUES (?, ?, 'permanent', ?, ?)`,
        [caseId, user_id, grantedBy, notes || null],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`✅ Nadano dostęp stały: Sprawa ${caseId} → Użytkownik ${user_id}`);

    res.json({
      success: true,
      message: 'Dostęp stały nadany pomyślnie',
      permission: {
        id: permissionId,
        case_id: caseId,
        user_id: user_id,
        user_name: user.name,
        user_email: user.email,
        permission_type: 'permanent'
      }
    });

  } catch (error) {
    console.error('❌ Błąd nadawania dostępu stałego:', error);
    res.status(500).json({ error: 'Błąd nadawania dostępu' });
  }
});

// 3. ❌ Odbierz dostęp
router.post('/:caseId/revoke/:permissionId', verifyToken, canModifyCase, async (req, res) => {
  const db = getDatabase();
  const { caseId, permissionId } = req.params;
  const { reason } = req.body;
  const revokedBy = req.user.userId;

  try {
    // Sprawdź czy uprawnienie istnieje
    const permission = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM case_permissions WHERE id = ? AND case_id = ?',
        [permissionId, caseId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!permission) {
      return res.status(404).json({ error: 'Uprawnienie nie znalezione' });
    }

    if (permission.revoked_at) {
      return res.status(400).json({ error: 'Uprawnienie już odwołane' });
    }

    // Odwołaj uprawnienie
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE case_permissions 
         SET revoked_at = CURRENT_TIMESTAMP, revoked_by = ?, notes = ?
         WHERE id = ?`,
        [revokedBy, reason || permission.notes, permissionId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log(`✅ Odwołano dostęp: Permission ${permissionId}`);

    res.json({
      success: true,
      message: 'Dostęp odwołany pomyślnie'
    });

  } catch (error) {
    console.error('❌ Błąd odwoływania dostępu:', error);
    res.status(500).json({ error: 'Błąd odwoływania dostępu' });
  }
});

// 4. ⏱️ Przedłuż dostęp czasowy
router.post('/:caseId/extend/:permissionId', verifyToken, canModifyCase, async (req, res) => {
  const db = getDatabase();
  const { caseId, permissionId } = req.params;
  const { additional_hours = 24 } = req.body;

  try {
    // Pobierz uprawnienie
    const permission = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM case_permissions WHERE id = ? AND case_id = ?',
        [permissionId, caseId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!permission) {
      return res.status(404).json({ error: 'Uprawnienie nie znalezione' });
    }

    if (permission.permission_type !== 'temporary') {
      return res.status(400).json({ error: 'Można przedłużyć tylko dostęp czasowy' });
    }

    if (permission.revoked_at) {
      return res.status(400).json({ error: 'Nie można przedłużyć odwołanego uprawnienia' });
    }

    // Oblicz nowy czas wygaśnięcia
    const currentExpires = new Date(permission.expires_at);
    const now = new Date();
    const baseTime = currentExpires > now ? currentExpires : now;
    baseTime.setHours(baseTime.getHours() + additional_hours);

    // Aktualizuj
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE case_permissions SET expires_at = ? WHERE id = ?',
        [baseTime.toISOString(), permissionId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log(`✅ Przedłużono dostęp: Permission ${permissionId} (+${additional_hours}h)`);

    res.json({
      success: true,
      message: 'Dostęp przedłużony pomyślnie',
      new_expires_at: baseTime.toISOString()
    });

  } catch (error) {
    console.error('❌ Błąd przedłużania dostępu:', error);
    res.status(500).json({ error: 'Błąd przedłużania dostępu' });
  }
});

// 5. 📋 Lista uprawnień do sprawy
router.get('/:caseId/list', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;

  try {
    const permissions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          cp.*,
          u.name as user_name,
          u.email as user_email,
          u.user_role as user_role,
          granter.name as granted_by_name,
          revoker.name as revoked_by_name
         FROM case_permissions cp
         LEFT JOIN users u ON cp.user_id = u.id
         LEFT JOIN users granter ON cp.granted_by = granter.id
         LEFT JOIN users revoker ON cp.revoked_by = revoker.id
         WHERE cp.case_id = ?
         ORDER BY cp.granted_at DESC`,
        [caseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Dodaj status aktywności
    const enrichedPermissions = permissions.map(p => ({
      ...p,
      is_active: isPermissionActive(p),
      is_expired: p.expires_at && new Date(p.expires_at) < new Date(),
      is_revoked: !!p.revoked_at
    }));

    res.json({
      success: true,
      permissions: enrichedPermissions
    });

  } catch (error) {
    console.error('❌ Błąd pobierania uprawnień:', error);
    res.status(500).json({ error: 'Błąd pobierania uprawnień' });
  }
});

// 6. 📊 Historia dostępów (łącznie z logami hasła)
router.get('/:caseId/access-history', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;

  try {
    // Pobierz logi z case_access_log
    const accessLogs = await new Promise((resolve, reject) => {
      db.all(
        `SELECT cal.*, u.name as user_name, u.email as user_email
         FROM case_access_log cal
         LEFT JOIN users u ON cal.user_id = u.id
         WHERE cal.case_id = ?
         ORDER BY cal.created_at DESC`,
        [caseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Pobierz uprawnienia (nadane i odwołane)
    const permissions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          cp.*,
          u.name as user_name,
          granter.name as granted_by_name,
          revoker.name as revoked_by_name
         FROM case_permissions cp
         LEFT JOIN users u ON cp.user_id = u.id
         LEFT JOIN users granter ON cp.granted_by = granter.id
         LEFT JOIN users revoker ON cp.revoked_by = revoker.id
         WHERE cp.case_id = ?
         ORDER BY cp.granted_at DESC`,
        [caseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({
      success: true,
      access_logs: accessLogs,
      permissions: permissions,
      total_access_count: accessLogs.length,
      total_permissions_granted: permissions.length
    });

  } catch (error) {
    console.error('❌ Błąd pobierania historii:', error);
    res.status(500).json({ error: 'Błąd pobierania historii' });
  }
});

module.exports = router;
