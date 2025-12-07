const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { ROLES } = require('../middleware/permissions');

const router = express.Router();

// Pobierz klientów (filtrowanie według roli)
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { search, status } = req.query;
  const userId = req.user.userId || req.user.id;
  const userRole = req.user.user_role || req.user.role;
  
  console.log('👥 Pobieranie klientów dla:', { userId, userRole });
  
  let query = '';
  const params = [];
  
  // Filtrowanie według roli
  if (userRole === ROLES.ADMIN || userRole === ROLES.RECEPTION) {
    // Admin i recepcja widzą WSZYSTKICH klientów
    query = 'SELECT c.* FROM clients c WHERE (c.status IS NULL OR c.status != "deleted")';
    console.log('👑 Admin/Recepcja - WSZYSCY klienci (bez filtrowania)');
  } else if (userRole === ROLES.LAWYER) {
    // Mecenas widzi klientów ze swoich spraw
    query = `
      SELECT DISTINCT c.* FROM clients c
      JOIN cases ca ON ca.client_id = c.id
      WHERE (c.status IS NULL OR c.status != "deleted")
      AND ca.assigned_to = ?
    `;
    params.push(userId);
    console.log('👔 Mecenas - klienci ze spraw assigned_to');
  } else if (userRole === ROLES.CASE_MANAGER) {
    // Opiekun sprawy widzi klientów ze swoich spraw
    query = `
      SELECT DISTINCT c.* FROM clients c
      JOIN cases ca ON ca.client_id = c.id
      WHERE (c.status IS NULL OR c.status != "deleted")
      AND ca.additional_caretaker = ?
    `;
    params.push(userId);
    console.log('📋 Opiekun sprawy - klienci ze spraw additional_caretaker');
  } else if (userRole === ROLES.CLIENT_MANAGER) {
    // Opiekun klienta widzi swoich klientów
    query = `
      SELECT c.* FROM clients c
      WHERE (c.status IS NULL OR c.status != "deleted")
      AND c.assigned_to = ?
    `;
    params.push(userId);
    console.log('👥 Opiekun klienta - klienci assigned_to');
  } else {
    // Fallback - pokaż wszystkich (na wszelki wypadek)
    query = 'SELECT c.* FROM clients c WHERE (c.status IS NULL OR c.status != "deleted")';
    console.log('⚠️ Nieznana rola - pokazuję wszystkich klientów');
  }

  // Dodaj warunki wyszukiwania
  if (search) {
    query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.company_name LIKE ? OR c.email LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  if (status) {
    query += ` AND c.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY c.created_at DESC`;

  console.log('📊 Query:', query);
  console.log('📊 Params:', params);

  db.all(query, params, (err, clients) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: 'Błąd pobierania klientów' });
    }
    console.log(`✅ Znaleziono ${clients.length} klientów dla roli: ${userRole}`);
    res.json({ clients });
  });
});

// Pobierz klientów pracownika według jego roli (dedykowane dla dashboardów)
router.get('/my-clients', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId || req.user.id;
  const userRole = req.user.user_role || req.user.role;
  
  console.log('👥 Pobieranie moich klientów dla:', { userId, userRole });
  
  let query = '';
  const params = [];
  
  // Filtrowanie według roli (identyczna logika jak w /clients)
  if (userRole === ROLES.ADMIN || userRole === ROLES.RECEPTION) {
    // Admin i recepcja widzą WSZYSTKICH klientów
    query = 'SELECT c.* FROM clients c WHERE (c.status IS NULL OR c.status != "deleted")';
    console.log('👑 Admin/Recepcja - WSZYSCY klienci (bez filtrowania)');
  } else if (userRole === ROLES.LAWYER) {
    query = `
      SELECT DISTINCT c.* FROM clients c
      JOIN cases ca ON ca.client_id = c.id
      WHERE (c.status IS NULL OR c.status != "deleted")
      AND ca.assigned_to = ?
    `;
    params.push(userId);
    console.log('👔 Mecenas - klienci ze spraw assigned_to');
  } else if (userRole === ROLES.CASE_MANAGER) {
    query = `
      SELECT DISTINCT c.* FROM clients c
      JOIN cases ca ON ca.client_id = c.id
      WHERE (c.status IS NULL OR c.status != "deleted")
      AND ca.additional_caretaker = ?
    `;
    params.push(userId);
    console.log('📋 Opiekun sprawy - klienci ze spraw additional_caretaker');
  } else if (userRole === ROLES.CLIENT_MANAGER) {
    query = `
      SELECT c.* FROM clients c
      WHERE (c.status IS NULL OR c.status != "deleted")
      AND c.assigned_to = ?
    `;
    params.push(userId);
    console.log('👥 Opiekun klienta - klienci assigned_to');
  } else {
    // Fallback - pokaż wszystkich (na wszelki wypadek)
    query = 'SELECT c.* FROM clients c WHERE (c.status IS NULL OR c.status != "deleted")';
    console.log('⚠️ Nieznana rola - pokazuję wszystkich klientów');
  }
  
  query += ` ORDER BY c.created_at DESC`;
  
  db.all(query, params, (err, clients) => {
    if (err) {
      console.error('❌ Błąd pobierania klientów:', err);
      return res.status(500).json({ error: 'Błąd pobierania klientów' });
    }
    
    console.log(`✅ Znaleziono ${clients.length} klientów dla ${userRole}`);
    // Zwróć klientów + rolę (konsystencja z /cases/my-cases)
    res.json({ clients: clients || [], user_role: userRole });
  });
});

// Pobierz listę mecenasów (prawników)
router.get('/lawyers/list', verifyToken, (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT id, name, email, role FROM users 
     WHERE role IN ('admin', 'lawyer') AND is_active = 1
     ORDER BY name ASC`,
    [],
    (err, lawyers) => {
      if (err) {
        console.error('Błąd pobierania mecenasów:', err);
        return res.status(500).json({ error: 'Błąd pobierania listy mecenasów' });
      }
      res.json({ lawyers });
    }
  );
});

// Pobierz jednego klienta (Z KONTROLĄ DOSTĘPU)
router.get('/:id', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId || req.user.id;
  const userRole = req.user.user_role || req.user.role;

  console.log('🔍 Pobieranie klienta:', { clientId: id, userId, userRole });

  // Pobierz klienta
  db.get(
    `SELECT c.*, 
            u.name as assigned_to_name, u.email as assigned_to_email,
            u2.name as updated_by_name
     FROM clients c
     LEFT JOIN users u ON c.assigned_to = u.id
     LEFT JOIN users u2 ON c.updated_by = u2.id
     WHERE c.id = ?`, 
    [id], 
    async (err, client) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania klienta' });
      }
      if (!client) {
        return res.status(404).json({ error: 'Klient nie znaleziony' });
      }
      
      // KONTROLA DOSTĘPU
      let hasAccess = false;
      
      if (userRole === ROLES.ADMIN || userRole === ROLES.RECEPTION) {
        // Admin i recepcja - zawsze dostęp
        hasAccess = true;
        console.log('✅ Admin/Recepcja - ma dostęp');
      } else if (userRole === ROLES.CLIENT_MANAGER && client.assigned_to === userId) {
        // Opiekun klienta - jeśli jest assigned_to
        hasAccess = true;
        console.log('✅ Opiekun klienta - ma dostęp (assigned_to)');
      } else if (userRole === ROLES.LAWYER || userRole === ROLES.CASE_MANAGER) {
        // Mecenas lub opiekun sprawy - sprawdź czy ma sprawę tego klienta
        const hasCase = await new Promise((resolve) => {
          let query = '';
          if (userRole === ROLES.LAWYER) {
            query = 'SELECT id FROM cases WHERE client_id = ? AND assigned_to = ?';
          } else {
            query = 'SELECT id FROM cases WHERE client_id = ? AND (additional_caretaker = ? OR case_manager_id = ?)';
          }
          
          const params = userRole === ROLES.LAWYER ? [id, userId] : [id, userId, userId];
          
          db.get(query, params, (err, row) => {
            if (err || !row) resolve(false);
            else resolve(true);
          });
        });
        
        if (hasCase) {
          hasAccess = true;
          console.log(`✅ ${userRole} - ma dostęp (ma sprawę klienta)`);
        }
      }
      
      if (!hasAccess) {
        console.log('❌ Brak dostępu do klienta');
        return res.status(403).json({ error: 'Brak dostępu do tego klienta' });
      }
      
      res.json({ client });
    }
  );
});

// Dodaj klienta
router.post('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const {
    first_name, last_name, company_name, email, phone, pesel, nip,
    address_street, address_city, address_postal, address_country, notes, assigned_to
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Imię i nazwisko są wymagane' });
  }

  db.run(
    `INSERT INTO clients (
      first_name, last_name, company_name, email, phone, pesel, nip,
      address_street, address_city, address_postal, address_country, notes, assigned_to, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, company_name, email, phone, pesel, nip,
     address_street, address_city, address_postal, address_country || 'Polska', notes, assigned_to || null, userId],
    function(err) {
      if (err) {
        console.error('Błąd dodawania klienta:', err);
        return res.status(500).json({ error: 'Błąd dodawania klienta' });
      }
      
      const clientId = this.lastID;
      const clientName = company_name || `${first_name} ${last_name}`;
      
      // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD
      db.run(`
        INSERT INTO employee_activity_logs (
          user_id, action_type, action_category, description, related_client_id
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        userId,
        'client_created',
        'client',
        `Utworzono klienta: ${clientName}`,
        clientId
      ], (logErr) => {
        if (logErr) {
          console.error('⚠️ Błąd logowania aktywności:', logErr);
        } else {
          console.log('📊 Aktywność utworzenia klienta zalogowana do HR dashboard');
        }
      });
      
      res.json({ success: true, clientId: clientId });
    }
  );
});

// Aktualizuj klienta
router.put('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId || req.user.id;
  const {
    first_name, last_name, company_name, email, phone, pesel, nip,
    address_street, address_city, address_postal, address_country, notes, status, assigned_to
  } = req.body;

  db.run(
    `UPDATE clients SET
      first_name = ?, last_name = ?, company_name = ?, email = ?, phone = ?,
      pesel = ?, nip = ?, address_street = ?, address_city = ?, address_postal = ?,
      address_country = ?, notes = ?, status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
    WHERE id = ?`,
    [first_name, last_name, company_name, email, phone, pesel, nip,
     address_street, address_city, address_postal, address_country, notes, status, assigned_to || null, userId, id],
    function(err) {
      if (err) {
        console.error('Błąd aktualizacji klienta:', err);
        return res.status(500).json({ error: 'Błąd aktualizacji klienta' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Klient nie znaleziony' });
      }
      
      const clientName = company_name || `${first_name} ${last_name}`;
      
      // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD
      db.run(`
        INSERT INTO employee_activity_logs (
          user_id, action_type, action_category, description, related_client_id, created_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        userId,
        'client_updated',
        'client',
        `Zaktualizowano dane klienta: ${clientName}`,
        id
      ], (logErr) => {
        if (logErr) {
          console.error('⚠️ Błąd logowania aktywności:', logErr);
        } else {
          console.log('📊 Aktywność aktualizacji klienta zalogowana');
        }
      });
      
      res.json({ success: true, message: 'Dane klienta zostały zaktualizowane' });
    }
  );
});

// Przypisz mecenasa do klienta
router.patch('/:id/assign', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { assigned_to } = req.body;

  db.run(
    `UPDATE clients SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [assigned_to || null, id],
    function(err) {
      if (err) {
        console.error('Błąd przypisywania mecenasa:', err);
        return res.status(500).json({ error: 'Błąd przypisywania mecenasa' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Klient nie znaleziony' });
      }
      res.json({ success: true, message: 'Mecenas został przypisany' });
    }
  );
});

// Usuń klienta (soft delete) - wymaga hasła administratora
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const adminPassword = req.headers['x-admin-password'];

  console.log('DELETE /clients/:id called');
  console.log('Client ID:', id);
  console.log('User role:', req.user.role);
  console.log('Admin password provided:', adminPassword);
  console.log('Expected password: Proadmin');
  console.log('Password match:', adminPassword === 'Proadmin');

  // Sprawdź czy użytkownik to admin
  if (req.user.role !== 'admin') {
    console.log('Access denied - not admin');
    return res.status(403).json({ error: 'Brak uprawnień - tylko administrator może usuwać klientów' });
  }

  // Sprawdź hasło administratora
  if (adminPassword !== 'Proadmin') {
    console.log('Invalid admin password - rejecting request');
    return res.status(401).json({ error: 'Nieprawidłowe hasło administratora' });
  }

  console.log('🗑️ Deleting client and associated cases...');
  console.log('🔍 Client ID:', id);
  
  // Najpierw oznacz wszystkie sprawy klienta jako usunięte
  console.log('📋 Executing: UPDATE cases SET status = deleted WHERE client_id =', id);
  db.run(
    `UPDATE cases SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE client_id = ?`,
    [id],
    function(casesErr) {
      if (casesErr) {
        console.error('❌ Error deleting cases:', casesErr);
        // Kontynuuj mimo błędu - klient i tak zostanie usunięty
      } else {
        console.log('✅ Cases deleted successfully! Count:', this.changes);
        if (this.changes === 0) {
          console.log('⚠️ WARNING: No cases were deleted! Client has no cases or client_id mismatch');
        }
      }
      
      // Następnie usuń klienta
      db.run(
        `UPDATE clients SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Błąd usuwania klienta' });
          }
          if (this.changes === 0) {
            console.log('Client not found');
            return res.status(404).json({ error: 'Klient nie znaleziony' });
          }
          console.log('Client deleted successfully');
          res.json({ success: true });
        }
      );
    }
  );
});

// Wyczyść usuniętych klientów z bazy (HARD DELETE) - tylko admin
router.delete('/purge/deleted', verifyToken, (req, res) => {
  const db = getDatabase();
  const adminPassword = req.headers['x-admin-password'];

  console.log('PURGE /clients/purge/deleted called');
  console.log('User role:', req.user.role);
  console.log('Admin password provided:', adminPassword);
  console.log('Expected password: Proadmin');
  console.log('Password match:', adminPassword === 'Proadmin');

  // Sprawdź czy użytkownik to admin
  if (req.user.role !== 'admin') {
    console.log('Access denied - not admin');
    return res.status(403).json({ error: 'Brak uprawnień - tylko administrator może czyścić bazę' });
  }

  // Sprawdź hasło administratora
  if (adminPassword !== 'Proadmin') {
    console.log('Invalid admin password - rejecting request');
    return res.status(401).json({ error: 'Nieprawidłowe hasło administratora' });
  }

  console.log('Purging deleted clients...');
  db.run(
    `DELETE FROM clients WHERE status = 'deleted'`,
    [],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Błąd czyszczenia bazy' });
      }
      console.log('Deleted clients purged:', this.changes);
      res.json({ success: true, deletedCount: this.changes });
    }
  );
});

// Pobierz sprawy klienta
router.get('/:id/cases', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  db.all(
    `SELECT c.*, u.name as assigned_to_name
     FROM cases c
     LEFT JOIN users u ON c.assigned_to = u.id
     WHERE c.client_id = ?
     ORDER BY c.created_at DESC`,
    [id],
    (err, cases) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania spraw' });
      }
      res.json({ cases });
    }
  );
});

// Pobierz notatki klienta (zarówno o kliencie jak i ze spraw)
router.get('/:id/notes', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  console.log('📥 Pobieranie notatek dla klienta:', id);

  // Pobierz notatki bezpośrednio o kliencie (client_id, bez case_id)
  db.all(
    `SELECT n.*, NULL as case_title, u.name as author_name, n.created_at
     FROM notes n
     LEFT JOIN users u ON n.created_by = u.id
     WHERE n.client_id = ? AND n.case_id IS NULL
     ORDER BY n.created_at DESC`,
    [id],
    (err, clientNotes) => {
      if (err) {
        console.error('Error fetching client notes:', err);
        return res.status(500).json({ error: 'Błąd pobierania notatek' });
      }

      // Pobierz notatki ze spraw klienta
      db.all(
        `SELECT n.*, c.title as case_title, u.name as author_name, n.created_at
         FROM notes n
         JOIN cases c ON n.case_id = c.id
         LEFT JOIN users u ON n.created_by = u.id
         WHERE c.client_id = ?
         ORDER BY n.created_at DESC`,
        [id],
        (err, caseNotes) => {
          if (err) {
            console.error('Error fetching case notes:', err);
            return res.status(500).json({ error: 'Błąd pobierania notatek' });
          }

          // Połącz obie listy i posortuj po dacie
          const allNotes = [...(clientNotes || []), ...(caseNotes || [])];
          allNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          console.log('📥 Znaleziono notatek:', allNotes.length);
          res.json({ notes: allNotes });
        }
      );
    }
  );
});

// Pobierz pliki klienta (z client_files + documents)
router.get('/:id/files', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  // Pobierz pliki z client_files (pliki bez przypisania do sprawy)
  db.all(
    `SELECT 
      cf.id, cf.client_id, NULL as case_id,
      cf.original_name as title, cf.filename as file_name, cf.file_path,
      cf.file_size, cf.file_type, cf.category, cf.description,
      cf.uploaded_by, cf.uploaded_at,
      u.name as uploaded_by_name,
      NULL as case_title, NULL as case_number, NULL as document_code
    FROM client_files cf
    LEFT JOIN users u ON cf.uploaded_by = u.id
    WHERE cf.client_id = ?`,
    [id],
    (err, clientFiles) => {
      if (err) {
        console.error('Error fetching client_files:', err);
        return res.status(500).json({ error: 'Błąd pobierania plików' });
      }

      // Pobierz pliki z documents (pliki przypisane do spraw)
      db.all(
        `SELECT d.*, c.title as case_title, c.case_number, u.name as uploaded_by_name
         FROM documents d
         JOIN cases c ON d.case_id = c.id
         LEFT JOIN users u ON d.uploaded_by = u.id
         WHERE c.client_id = ?
         ORDER BY d.uploaded_at DESC`,
        [id],
        (err, caseFiles) => {
          if (err) {
            console.error('Error fetching documents:', err);
            return res.status(500).json({ error: 'Błąd pobierania plików' });
          }

          // Połącz obie listy
          const allFiles = [...(clientFiles || []), ...(caseFiles || [])];
          // Sortuj po dacie
          allFiles.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
          
          console.log('Files for client', id, ':', allFiles.length);
          res.json({ files: allFiles });
        }
      );
    }
  );
});

// USUNIĘTY STARY ENDPOINT - teraz obsługuje client-files.js
// router.post('/:id/files') - MOVED TO client-files.js

// Dodaj notatkę do klienta
router.post('/:id/notes', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  console.log('💾 Dodawanie notatki dla klienta:', id, 'od użytkownika:', userId);

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Treść notatki jest wymagana' });
  }

  // Dodaj notatkę do tabeli notes (bez case_id - notatka o kliencie, nie o sprawie)
  db.run(
    `INSERT INTO notes (client_id, content, note_type, created_by) 
     VALUES (?, ?, 'client', ?)`,
    [id, content.trim(), userId],
    function(err) {
      if (err) {
        console.error('❌ Error saving note:', err);
        return res.status(500).json({ error: 'Błąd zapisywania notatki' });
      }
      
      console.log('✅ Note saved with ID:', this.lastID);
      res.json({ success: true, noteId: this.lastID });
    }
  );
});

// PATCH /clients/:id/status - Zmień status klienta (aktywny/nieaktywny)
router.patch('/:id/status', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status } = req.body;

  console.log('🔄 Zmiana statusu klienta:', id, '→', status);

  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Nieprawidłowy status. Dopuszczalne: active, inactive' });
  }

  db.run(
    `UPDATE clients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, id],
    function(err) {
      if (err) {
        console.error('❌ Error updating client status:', err);
        return res.status(500).json({ error: 'Błąd zmiany statusu' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Klient nie znaleziony' });
      }
      
      console.log('✅ Status klienta zmieniony:', id, '→', status);
      res.json({ success: true, status });
    }
  );
});

module.exports = router;
