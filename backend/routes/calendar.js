/**
 * ========================================
 * CALENDAR ROUTES - Endpointy kalendarza
 * ========================================
 * 
 * Odpowiedzialny za:
 * - Pobieranie wydarzeń z kalendarzy użytkowników
 * - Synchronizację z zewnętrznymi kalendarzami (future)
 * - Zarządzanie wpisami kalendarza
 * 
 * Wersja: 1.0.0
 * Data: 2025-11-07
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

console.log('📅 Calendar Routes loaded');

/**
 * GET /api/calendar/events
 * Pobierz wszystkie wydarzenia z kalendarza użytkownika
 */
router.get('/events', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const { from_date, to_date, calendar_type } = req.query;

  console.log(`📅 Pobieranie wydarzeń kalendarza dla użytkownika ${userId}`);

  let query = `
    SELECT 
      e.*,
      ce.calendar_type,
      ce.visibility,
      ce.reminder_enabled,
      ce.reminder_minutes,
      ce.color,
      c.case_number,
      c.case_type,
      COALESCE(cl.company_name, cl.first_name || ' ' || cl.last_name) as client_name,
      u.name as created_by_name
    FROM calendar_entries ce
    INNER JOIN events e ON ce.event_id = e.id
    LEFT JOIN cases c ON e.case_id = c.id
    LEFT JOIN clients cl ON c.client_id = cl.id
    LEFT JOIN users u ON e.created_by = u.id
    WHERE ce.user_id = ?
  `;

  const params = [userId];

  // Filtry opcjonalne
  if (calendar_type) {
    query += ' AND ce.calendar_type = ?';
    params.push(calendar_type);
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
      console.error('❌ Błąd pobierania wydarzeń kalendarza:', err);
      return res.status(500).json({ error: 'Błąd pobierania wydarzeń kalendarza' });
    }

    // Parse extra_fields
    const eventsWithParsedData = events.map(event => {
      let extra_data = null;
      if (event.extra_fields) {
        try {
          extra_data = JSON.parse(event.extra_fields);
        } catch (e) {
          console.warn('Błąd parsowania extra_fields:', e);
        }
      }

      return {
        ...event,
        extra_data,
        event_date: event.start_date // Alias dla kompatybilności
      };
    });

    // Statystyki
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() + 7);

    const urgent = eventsWithParsedData.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate >= todayStart && eventDate < tomorrowStart;
    }).length;

    const upcoming = eventsWithParsedData.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate >= tomorrowStart && eventDate < weekStart;
    }).length;

    console.log(`✅ Zwrócono ${eventsWithParsedData.length} wydarzeń (pilne: ${urgent}, nadchodzące: ${upcoming})`);

    res.json({
      events: eventsWithParsedData,
      stats: {
        total: eventsWithParsedData.length,
        urgent,
        upcoming
      }
    });
  });
});

/**
 * GET /api/calendar/client/:clientId
 * Pobierz wydarzenia dla kalendarza klienta
 */
router.get('/client/:clientId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { clientId } = req.params;
  const userRole = req.user.role;
  const userId = req.user.userId;

  console.log(`📅 Pobieranie wydarzeń kalendarza klienta ${clientId}`);

  // Weryfikacja uprawnień
  if (userRole === 'client') {
    // Klient może zobaczyć tylko swój kalendarz
    db.get('SELECT user_id FROM clients WHERE id = ?', [clientId], (err, client) => {
      if (err || !client || client.user_id !== userId) {
        return res.status(403).json({ error: 'Brak dostępu' });
      }
      fetchClientEvents();
    });
  } else {
    // Lawyer/admin może zobaczyć wszystkie
    fetchClientEvents();
  }

  function fetchClientEvents() {
    const query = `
      SELECT 
        e.*,
        c.case_number,
        c.case_type,
        u.name as created_by_name
      FROM events e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.client_id = ?
      ORDER BY e.start_date ASC
    `;

    db.all(query, [clientId], (err, events) => {
      if (err) {
        console.error('❌ Błąd pobierania wydarzeń klienta:', err);
        return res.status(500).json({ error: 'Błąd pobierania wydarzeń' });
      }

      // Parse extra_fields i statystyki
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const eventsWithData = events.map(event => {
        let extra_data = null;
        if (event.extra_fields) {
          try {
            extra_data = JSON.parse(event.extra_fields);
          } catch (e) {
            console.warn('Błąd parsowania extra_fields:', e);
          }
        }

        const eventDate = new Date(event.start_date);
        const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

        return {
          ...event,
          extra_data,
          event_date: event.start_date,
          days_until: daysUntil,
          urgency: daysUntil < 0 ? 'past' : daysUntil <= 3 ? 'urgent' : 'upcoming'
        };
      });

      const urgent = eventsWithData.filter(e => e.urgency === 'urgent').length;
      const upcoming = eventsWithData.filter(e => e.urgency === 'upcoming').length;

      console.log(`✅ Zwrócono ${eventsWithData.length} wydarzeń klienta (pilne: ${urgent})`);

      res.json({
        events: eventsWithData,
        stats: {
          total: eventsWithData.length,
          urgent_count: urgent,
          upcoming_count: upcoming
        }
      });
    });
  }
});

/**
 * POST /api/calendar/entries/:eventId/add-user
 * Dodaj użytkownika do wydarzenia (kalendarz współdzielony)
 */
router.post('/entries/:eventId/add-user', verifyToken, (req, res) => {
  const db = getDatabase();
  const { eventId } = req.params;
  const { user_id, calendar_type, visibility } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id jest wymagane' });
  }

  console.log(`📅 Dodawanie użytkownika ${user_id} do wydarzenia ${eventId}`);

  db.run(
    `INSERT INTO calendar_entries (event_id, user_id, calendar_type, visibility, reminder_enabled, reminder_minutes)
     VALUES (?, ?, ?, ?, 1, 1440)`,
    [eventId, user_id, calendar_type || 'shared', visibility || 'shared'],
    function(err) {
      if (err) {
        console.error('❌ Błąd dodawania do kalendarza:', err);
        return res.status(500).json({ error: 'Błąd dodawania do kalendarza' });
      }

      console.log(`✅ Użytkownik ${user_id} dodany do wydarzenia ${eventId}`);
      res.json({ success: true, entryId: this.lastID });
    }
  );
});

/**
 * DELETE /api/calendar/entries/:entryId
 * Usuń wpis z kalendarza (nie usuwa wydarzenia, tylko widoczność w kalendarzu)
 */
router.delete('/entries/:entryId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { entryId } = req.params;
  const userId = req.user.userId;

  console.log(`📅 Usuwanie wpisu kalendarza ${entryId} dla użytkownika ${userId}`);

  // Sprawdź czy wpis należy do użytkownika
  db.get('SELECT * FROM calendar_entries WHERE id = ? AND user_id = ?', [entryId, userId], (err, entry) => {
    if (err) {
      console.error('❌ Błąd sprawdzania wpisu:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Wpis nie znaleziony' });
    }

    db.run('DELETE FROM calendar_entries WHERE id = ?', [entryId], (err) => {
      if (err) {
        console.error('❌ Błąd usuwania wpisu:', err);
        return res.status(500).json({ error: 'Błąd usuwania wpisu' });
      }

      console.log(`✅ Wpis ${entryId} usunięty z kalendarza użytkownika ${userId}`);
      res.json({ success: true });
    });
  });
});

module.exports = router;
