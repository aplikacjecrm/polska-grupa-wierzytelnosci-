const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// Inicjalizacja tabeli grafiku pracy
const initWorkScheduleTable = () => {
  const db = getDatabase();
  if (!db) {
    console.log('⏳ Baza danych nie gotowa, ponawiam za 1s...');
    setTimeout(initWorkScheduleTable, 1000);
    return;
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS work_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT DEFAULT 'praca',
      start_time TIME DEFAULT '09:00',
      end_time TIME DEFAULT '17:00',
      break_minutes INTEGER DEFAULT 40,
      notes TEXT,
      auto_generated BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('❌ Błąd tworzenia tabeli work_schedule:', err);
    } else {
      console.log('✅ Tabela work_schedule gotowa');
    }
  });
};

setTimeout(initWorkScheduleTable, 2000);

// Statusy grafiku
const SCHEDULE_STATUSES = {
  'praca': { label: 'W pracy', color: '#4CAF50', icon: '🏢' },
  'zdalna': { label: 'Praca zdalna', color: '#2196F3', icon: '🏠' },
  'urlop': { label: 'Urlop', color: '#FF9800', icon: '🏖️' },
  'choroba': { label: 'Zwolnienie L4', color: '#F44336', icon: '🏥' },
  'wolne': { label: 'Dzień wolny', color: '#9C27B0', icon: '📅' },
  'nieobecny': { label: 'Nieobecny', color: '#757575', icon: '❌' },
  'delegacja': { label: 'Delegacja', color: '#00BCD4', icon: '✈️' }
};

// Pobierz grafik dla danego miesiąca
router.get('/month/:year/:month', async (req, res) => {
  const db = getDatabase();
  try {
    const { year, month } = req.params;
    const departmentFilter = req.query.department;
    
    // Generuj daty dla całego miesiąca
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    // Pobierz wszystkich aktywnych pracowników
    let usersQuery = `SELECT id, name, email, role, user_role FROM users WHERE is_active = 1`;
    usersQuery += ` ORDER BY name`;
    
    const users = await new Promise((resolve, reject) => {
      db.all(usersQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz istniejący grafik
    const scheduleQuery = `
      SELECT ws.*, u.name as user_name 
      FROM work_schedule ws
      JOIN users u ON ws.user_id = u.id
      WHERE ws.date BETWEEN ? AND ?
      ORDER BY ws.date, u.name
    `;
    
    const existingSchedule = await new Promise((resolve, reject) => {
      db.all(scheduleQuery, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz urlopy zatwierdzone
    const vacationsQuery = `
      SELECT employee_id as user_id, start_date, end_date, vacation_type, status
      FROM employee_vacations
      WHERE status = 'approved' 
      AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?))
    `;
    
    const vacations = await new Promise((resolve, reject) => {
      db.all(vacationsQuery, [startDate, endDate, startDate, endDate, startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz wnioski o pracę zdalną (zatwierdzone)
    const remoteQuery = `
      SELECT t.user_id, t.details, t.status
      FROM tickets t
      WHERE t.ticket_type = 'praca_zdalna' 
      AND t.status = 'Zakończony'
      AND t.hr_approved = 1
    `;
    
    const remoteWork = await new Promise((resolve, reject) => {
      db.all(remoteQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Generuj pełny grafik z automatycznym uzupełnieniem
    const fullSchedule = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (const user of users) {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(dateStr).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Sprawdź czy jest już wpis w grafiku
        let existingEntry = existingSchedule.find(s => s.user_id === user.id && s.date === dateStr);
        
        // Sprawdź urlopy
        const vacation = vacations.find(v => 
          v.user_id === user.id && 
          dateStr >= v.start_date && 
          dateStr <= v.end_date
        );
        
        // Sprawdź pracę zdalną
        const remote = remoteWork.find(r => {
          if (r.user_id !== user.id) return false;
          try {
            const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
            return details.date === dateStr;
          } catch { return false; }
        });
        
        // Domyślnie praca zdalna (oprócz weekendów)
        let status = 'zdalna';
        let autoGenerated = true;
        
        if (existingEntry) {
          status = existingEntry.status;
          autoGenerated = existingEntry.auto_generated;
        } else if (vacation) {
          status = vacation.vacation_type === 'sick' ? 'choroba' : 'urlop';
        } else if (isWeekend) {
          status = 'wolne';
        }
        // Jeśli nie ma wpisu i nie jest weekend - domyślnie zdalna
        
        fullSchedule.push({
          user_id: user.id,
          user_name: user.name,
          department: user.user_role || user.role || '',
          position: '',
          date: dateStr,
          day_of_week: dayOfWeek,
          is_weekend: isWeekend,
          status: status,
          status_info: SCHEDULE_STATUSES[status] || SCHEDULE_STATUSES['praca'],
          start_time: existingEntry?.start_time || '09:00',
          end_time: existingEntry?.end_time || '17:00',
          break_minutes: existingEntry?.break_minutes || 40,
          notes: existingEntry?.notes || '',
          auto_generated: autoGenerated,
          id: existingEntry?.id || null
        });
      }
    }
    
    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      users: users,
      schedule: fullSchedule,
      statuses: SCHEDULE_STATUSES
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania grafiku:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pobierz grafik dla konkretnego dnia
router.get('/day/:date', async (req, res) => {
  const db = getDatabase();
  try {
    const { date } = req.params;
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Pobierz wszystkich pracowników
    const users = await new Promise((resolve, reject) => {
      db.all(`SELECT id, name, email, role, user_role FROM users WHERE is_active = 1 ORDER BY name`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz grafik na ten dzień
    const schedule = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM work_schedule WHERE date = ?`, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz urlopy na ten dzień
    const vacations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT employee_id as user_id, vacation_type FROM employee_vacations 
        WHERE status = 'approved' AND ? BETWEEN start_date AND end_date
      `, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz pracę zdalną na ten dzień
    const remoteWork = await new Promise((resolve, reject) => {
      db.all(`
        SELECT user_id, details FROM tickets 
        WHERE ticket_type = 'praca_zdalna' AND status = 'Zakończony' AND hr_approved = 1
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Generuj status dla każdego pracownika
    const daySchedule = users.map(user => {
      const existing = schedule.find(s => s.user_id === user.id);
      const vacation = vacations.find(v => v.user_id === user.id);
      const remote = remoteWork.find(r => {
        if (r.user_id !== user.id) return false;
        try {
          const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
          return details.date === date;
        } catch { return false; }
      });
      
      // Domyślnie praca zdalna
      let status = 'zdalna';
      if (existing) {
        status = existing.status;
      } else if (vacation) {
        status = vacation.vacation_type === 'sick' ? 'choroba' : 'urlop';
      } else if (isWeekend) {
        status = 'wolne';
      }
      // Jeśli nie ma wpisu i nie jest weekend - domyślnie zdalna
      
      return {
        user_id: user.id,
        user_name: user.name,
        department: user.user_role || user.role || '',
        position: '',
        date: date,
        status: status,
        status_info: SCHEDULE_STATUSES[status],
        start_time: existing?.start_time || '09:00',
        end_time: existing?.end_time || '17:00',
        break_minutes: existing?.break_minutes || 40,
        notes: existing?.notes || '',
        is_weekend: isWeekend
      };
    });
    
    // Statystyki dnia
    const stats = {
      total: users.length,
      atWork: daySchedule.filter(s => s.status === 'praca').length,
      remote: daySchedule.filter(s => s.status === 'zdalna').length,
      vacation: daySchedule.filter(s => s.status === 'urlop').length,
      sick: daySchedule.filter(s => s.status === 'choroba').length,
      absent: daySchedule.filter(s => ['nieobecny', 'wolne'].includes(s.status)).length
    };
    
    res.json({
      success: true,
      date: date,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      schedule: daySchedule,
      stats: stats,
      statuses: SCHEDULE_STATUSES
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania grafiku dnia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Aktualizuj/dodaj wpis w grafiku
router.put('/entry', async (req, res) => {
  const db = getDatabase();
  try {
    const { user_id, date, status, start_time, end_time, break_minutes, notes } = req.body;
    
    if (!user_id || !date || !status) {
      return res.status(400).json({ success: false, error: 'Brak wymaganych pól' });
    }
    
    // Sprawdź czy wpis już istnieje
    const existing = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM work_schedule WHERE user_id = ? AND date = ?`, [user_id, date], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existing) {
      // Aktualizuj
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE work_schedule 
          SET status = ?, start_time = ?, end_time = ?, break_minutes = ?, notes = ?, 
              auto_generated = 0, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [status, start_time || '09:00', end_time || '17:00', break_minutes || 40, notes || '', existing.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Dodaj nowy
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO work_schedule (user_id, date, status, start_time, end_time, break_minutes, notes, auto_generated)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `, [user_id, date, status, start_time || '09:00', end_time || '17:00', break_minutes || 40, notes || ''], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({ success: true, message: 'Grafik zaktualizowany' });
    
  } catch (error) {
    console.error('❌ Błąd aktualizacji grafiku:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Masowa aktualizacja grafiku
router.put('/bulk', async (req, res) => {
  const db = getDatabase();
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ success: false, error: 'Brak wpisów do aktualizacji' });
    }
    
    for (const entry of entries) {
      const { user_id, date, status, start_time, end_time, break_minutes, notes } = entry;
      
      const existing = await new Promise((resolve, reject) => {
        db.get(`SELECT id FROM work_schedule WHERE user_id = ? AND date = ?`, [user_id, date], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (existing) {
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE work_schedule 
            SET status = ?, start_time = ?, end_time = ?, break_minutes = ?, notes = ?, 
                auto_generated = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [status, start_time || '09:00', end_time || '17:00', break_minutes || 40, notes || '', existing.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO work_schedule (user_id, date, status, start_time, end_time, break_minutes, notes, auto_generated)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
          `, [user_id, date, status, start_time || '09:00', end_time || '17:00', break_minutes || 40, notes || ''], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    res.json({ success: true, message: `Zaktualizowano ${entries.length} wpisów` });
    
  } catch (error) {
    console.error('❌ Błąd masowej aktualizacji:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pobierz grafik dla konkretnego pracownika
router.get('/user/:userId/:year/:month', async (req, res) => {
  const db = getDatabase();
  try {
    const { userId, year, month } = req.params;
    
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    // Pobierz dane pracownika
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, email, role, user_role FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Pracownik nie znaleziony' });
    }
    
    // Pobierz grafik
    const schedule = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM work_schedule WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date`, 
        [userId, startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz urlopy
    const vacations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT start_date, end_date, vacation_type FROM employee_vacations 
        WHERE employee_id = ? AND status = 'approved' 
        AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?))
      `, [userId, startDate, endDate, startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Generuj pełny miesiąc
    const daysInMonth = new Date(year, month, 0).getDate();
    const fullSchedule = [];
    let workDays = 0;
    let workHours = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(dateStr).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const existing = schedule.find(s => s.date === dateStr);
      const vacation = vacations.find(v => dateStr >= v.start_date && dateStr <= v.end_date);
      
      // Domyślnie praca zdalna
      let status = 'zdalna';
      if (existing) {
        status = existing.status;
      } else if (vacation) {
        status = vacation.vacation_type === 'sick' ? 'choroba' : 'urlop';
      } else if (isWeekend) {
        status = 'wolne';
      }
      // Jeśli nie ma wpisu i nie jest weekend - domyślnie zdalna
      
      const startTime = existing?.start_time || '09:00';
      const endTime = existing?.end_time || '17:00';
      const breakMins = existing?.break_minutes || 40;
      
      // Oblicz godziny pracy (przerwa jest gratis od pracodawcy - nie odejmujemy)
      if (status === 'praca' || status === 'zdalna') {
        workDays++;
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const totalMins = (endH * 60 + endM) - (startH * 60 + startM);
        workHours += totalMins / 60;
      }
      
      fullSchedule.push({
        date: dateStr,
        day_of_week: dayOfWeek,
        is_weekend: isWeekend,
        status: status,
        status_info: SCHEDULE_STATUSES[status],
        start_time: startTime,
        end_time: endTime,
        break_minutes: breakMins,
        notes: existing?.notes || ''
      });
    }
    
    res.json({
      success: true,
      user: user,
      year: parseInt(year),
      month: parseInt(month),
      schedule: fullSchedule,
      summary: {
        work_days: workDays,
        work_hours: Math.round(workHours * 10) / 10,
        vacation_days: fullSchedule.filter(s => s.status === 'urlop').length,
        sick_days: fullSchedule.filter(s => s.status === 'choroba').length,
        remote_days: fullSchedule.filter(s => s.status === 'zdalna').length
      },
      statuses: SCHEDULE_STATUSES
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania grafiku pracownika:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pobierz listę działów
router.get('/departments', async (req, res) => {
  const db = getDatabase();
  try {
    const departments = await new Promise((resolve, reject) => {
      db.all(`SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != '' ORDER BY department`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows?.map(r => r.department) || []);
      });
    });
    
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
