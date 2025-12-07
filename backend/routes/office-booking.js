const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// Inicjalizacja tabel rezerwacji biura
const initOfficeBookingTables = () => {
  const db = getDatabase();
  
  // Tabela zasobów biurowych (biurka, sale)
  db.run(`
    CREATE TABLE IF NOT EXISTS office_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'desk' lub 'conference_room'
      capacity INTEGER DEFAULT 1,
      location TEXT DEFAULT 'Gwiazdzista 6/5, Wrocław',
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('❌ Błąd tworzenia tabeli office_resources:', err);
    } else {
      // Dodaj domyślne zasoby jeśli tabela jest pusta
      db.get('SELECT COUNT(*) as count FROM office_resources', (err, row) => {
        if (!err && row && row.count === 0) {
          const resources = [
            ['Biurko 1', 'desk', 1, 'Gwiazdzista 6/5, Wrocław', 'Stanowisko do obsługi klientów'],
            ['Biurko 2', 'desk', 1, 'Gwiazdzista 6/5, Wrocław', 'Stanowisko do obsługi klientów'],
            ['Biurko 3', 'desk', 1, 'Gwiazdzista 6/5, Wrocław', 'Stanowisko do obsługi klientów'],
            ['Sala konferencyjna', 'conference_room', 6, 'Gwiazdzista 6/5, Wrocław', 'Sala na spotkania do 6 osób']
          ];
          
          resources.forEach(([name, type, capacity, location, description]) => {
            db.run(
              'INSERT INTO office_resources (name, type, capacity, location, description) VALUES (?, ?, ?, ?, ?)',
              [name, type, capacity, location, description]
            );
          });
          console.log('✅ Dodano domyślne zasoby biurowe');
        }
      });
      console.log('✅ Tabela office_resources gotowa');
    }
  });
  
  // Tabela rezerwacji
  db.run(`
    CREATE TABLE IF NOT EXISTS office_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      purpose TEXT,
      status TEXT DEFAULT 'confirmed', -- confirmed, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES office_resources(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('❌ Błąd tworzenia tabeli office_bookings:', err);
    } else {
      console.log('✅ Tabela office_bookings gotowa');
    }
  });
};

setTimeout(initOfficeBookingTables, 2500);

// Pobierz wszystkie zasoby biurowe
router.get('/resources', async (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM office_resources WHERE is_active = 1 ORDER BY type, name',
    (err, resources) => {
      if (err) {
        console.error('❌ Błąd pobierania zasobów:', err);
        return res.status(500).json({ error: 'Błąd pobierania zasobów' });
      }
      
      res.json({ resources: resources || [] });
    }
  );
});

// Pobierz rezerwacje na dany dzień
router.get('/bookings/:date', async (req, res) => {
  const db = getDatabase();
  const { date } = req.params;
  
  db.all(
    `SELECT b.*, r.name as resource_name, r.type as resource_type, r.capacity,
            u.name as user_name, u.email as user_email
     FROM office_bookings b
     JOIN office_resources r ON b.resource_id = r.id
     JOIN users u ON b.user_id = u.id
     WHERE b.date = ? AND b.status = 'confirmed'
     ORDER BY r.type, r.name, b.start_time`,
    [date],
    (err, bookings) => {
      if (err) {
        console.error('❌ Błąd pobierania rezerwacji:', err);
        return res.status(500).json({ error: 'Błąd pobierania rezerwacji' });
      }
      
      res.json({ bookings: bookings || [] });
    }
  );
});

// Pobierz rezerwacje użytkownika
router.get('/my-bookings/:userId', async (req, res) => {
  const db = getDatabase();
  const { userId } = req.params;
  
  db.all(
    `SELECT b.*, r.name as resource_name, r.type as resource_type, r.capacity
     FROM office_bookings b
     JOIN office_resources r ON b.resource_id = r.id
     WHERE b.user_id = ? AND b.status = 'confirmed' AND b.date >= date('now')
     ORDER BY b.date, b.start_time`,
    [userId],
    (err, bookings) => {
      if (err) {
        console.error('❌ Błąd pobierania rezerwacji:', err);
        return res.status(500).json({ error: 'Błąd pobierania rezerwacji' });
      }
      
      res.json({ bookings: bookings || [] });
    }
  );
});

// Sprawdź dostępność zasobu
router.get('/availability/:resourceId/:date', async (req, res) => {
  const db = getDatabase();
  const { resourceId, date } = req.params;
  
  // Pobierz wszystkie rezerwacje na dany dzień dla danego zasobu
  db.all(
    `SELECT start_time, end_time, user_id, u.name as user_name
     FROM office_bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.resource_id = ? AND b.date = ? AND b.status = 'confirmed'
     ORDER BY start_time`,
    [resourceId, date],
    (err, bookings) => {
      if (err) {
        console.error('❌ Błąd sprawdzania dostępności:', err);
        return res.status(500).json({ error: 'Błąd sprawdzania dostępności' });
      }
      
      // Generuj sloty czasowe (co godzinę od 8:00 do 18:00)
      const slots = [];
      for (let hour = 8; hour < 18; hour++) {
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
        
        // Sprawdź czy slot jest zajęty
        const booking = bookings.find(b => {
          const bStart = b.start_time.substring(0, 5);
          const bEnd = b.end_time.substring(0, 5);
          return (startTime >= bStart && startTime < bEnd) || (endTime > bStart && endTime <= bEnd);
        });
        
        slots.push({
          start_time: startTime,
          end_time: endTime,
          available: !booking,
          booked_by: booking ? booking.user_name : null
        });
      }
      
      res.json({ slots, bookings: bookings || [] });
    }
  );
});

// Utwórz rezerwację
router.post('/book', async (req, res) => {
  const db = getDatabase();
  const { resource_id, user_id, date, start_time, end_time, purpose } = req.body;
  
  if (!resource_id || !user_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Brak wymaganych danych' });
  }
  
  // Sprawdź czy rezerwacja jest minimum 12 godzin przed terminem
  const bookingDateTime = new Date(`${date}T${start_time}:00`);
  const now = new Date();
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilBooking < 12) {
    return res.status(400).json({ 
      error: 'Rezerwację można złożyć minimum 12 godzin przed terminem. Skontaktuj się z biurem w pilnych przypadkach.' 
    });
  }
  
  // Sprawdź czy nie ma konfliktu
  db.get(
    `SELECT id FROM office_bookings 
     WHERE resource_id = ? AND date = ? AND status = 'confirmed'
     AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
    [resource_id, date, end_time, start_time, end_time, start_time, start_time, end_time],
    (err, existing) => {
      if (err) {
        console.error('❌ Błąd sprawdzania konfliktu:', err);
        return res.status(500).json({ error: 'Błąd sprawdzania dostępności' });
      }
      
      if (existing) {
        return res.status(409).json({ error: 'Ten termin jest już zarezerwowany' });
      }
      
      // Utwórz rezerwację
      db.run(
        `INSERT INTO office_bookings (resource_id, user_id, date, start_time, end_time, purpose)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [resource_id, user_id, date, start_time, end_time, purpose || ''],
        function(err) {
          if (err) {
            console.error('❌ Błąd tworzenia rezerwacji:', err);
            return res.status(500).json({ error: 'Błąd tworzenia rezerwacji' });
          }
          
          // Zaktualizuj grafik pracy na "praca" (w biurze) dla tego dnia
          db.run(
            `INSERT INTO work_schedule (user_id, date, status, start_time, end_time, break_minutes, notes, auto_generated)
             VALUES (?, ?, 'praca', ?, ?, 40, ?, 0)
             ON CONFLICT(user_id, date) DO UPDATE SET 
               status = 'praca',
               start_time = excluded.start_time,
               end_time = excluded.end_time,
               notes = excluded.notes,
               updated_at = CURRENT_TIMESTAMP`,
            [user_id, date, start_time, end_time, `🏢 Rezerwacja biura: ${purpose || 'Praca w biurze'}`],
            (scheduleErr) => {
              if (scheduleErr) {
                console.error('⚠️ Błąd aktualizacji grafiku:', scheduleErr);
              } else {
                console.log(`✅ Grafik zaktualizowany: user=${user_id}, date=${date}, status=praca`);
              }
            }
          );
          
          res.json({ 
            success: true, 
            message: 'Rezerwacja utworzona pomyślnie',
            booking_id: this.lastID 
          });
        }
      );
    }
  );
});

// Anuluj rezerwację
router.delete('/cancel/:bookingId', async (req, res) => {
  const db = getDatabase();
  const { bookingId } = req.params;
  const userId = req.query.user_id;
  
  // Sprawdź czy rezerwacja należy do użytkownika
  db.get(
    'SELECT * FROM office_bookings WHERE id = ?',
    [bookingId],
    (err, booking) => {
      if (err) {
        console.error('❌ Błąd pobierania rezerwacji:', err);
        return res.status(500).json({ error: 'Błąd anulowania rezerwacji' });
      }
      
      if (!booking) {
        return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
      }
      
      // Anuluj rezerwację
      db.run(
        'UPDATE office_bookings SET status = ? WHERE id = ?',
        ['cancelled', bookingId],
        (err) => {
          if (err) {
            console.error('❌ Błąd anulowania rezerwacji:', err);
            return res.status(500).json({ error: 'Błąd anulowania rezerwacji' });
          }
          
          // Przywróć grafik na "zdalna"
          db.run(
            `UPDATE work_schedule SET status = 'zdalna', notes = 'Anulowano rezerwację biura'
             WHERE user_id = ? AND date = ?`,
            [booking.user_id, booking.date]
          );
          
          res.json({ success: true, message: 'Rezerwacja anulowana' });
        }
      );
    }
  );
});

// Pobierz podsumowanie na dany dzień (ile biurek/sal zajętych)
router.get('/summary/:date', async (req, res) => {
  const db = getDatabase();
  const { date } = req.params;
  
  db.all(
    `SELECT r.id, r.name, r.type, r.capacity,
            COUNT(DISTINCT b.id) as bookings_count,
            GROUP_CONCAT(DISTINCT u.name) as booked_by
     FROM office_resources r
     LEFT JOIN office_bookings b ON r.id = b.resource_id AND b.date = ? AND b.status = 'confirmed'
     LEFT JOIN users u ON b.user_id = u.id
     WHERE r.is_active = 1
     GROUP BY r.id
     ORDER BY r.type, r.name`,
    [date],
    (err, summary) => {
      if (err) {
        console.error('❌ Błąd pobierania podsumowania:', err);
        return res.status(500).json({ error: 'Błąd pobierania podsumowania' });
      }
      
      const desks = summary.filter(s => s.type === 'desk');
      const rooms = summary.filter(s => s.type === 'conference_room');
      
      res.json({
        date,
        desks: {
          total: desks.length,
          booked: desks.filter(d => d.bookings_count > 0).length,
          available: desks.filter(d => d.bookings_count === 0).length,
          details: desks
        },
        conference_rooms: {
          total: rooms.length,
          booked: rooms.filter(r => r.bookings_count > 0).length,
          available: rooms.filter(r => r.bookings_count === 0).length,
          details: rooms
        }
      });
    }
  );
});

module.exports = router;
