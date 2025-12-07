/**
 * CRON JOB: Generowanie raportów miesięcznych
 * 
 * Uruchamia się automatycznie ostatniego dnia miesiąca o 23:55
 * Generuje raporty dla wszystkich aktywnych pracowników
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/kancelaria.db');

/**
 * Generuje raport miesięczny dla pracownika
 */
async function generateReportForEmployee(db, userId, year, month) {
  return new Promise(async (resolve, reject) => {
    console.log(`📊 Generuję raport dla user_id=${userId}, ${year}-${String(month).padStart(2, '0')}`);
    
    try {
      // 1. Pobierz czas pracy
      const workTimeStats = await new Promise((res, rej) => {
        db.get(`
          SELECT 
            COUNT(*) as total_login_sessions,
            SUM(CASE 
              WHEN logout_time IS NOT NULL 
              THEN (julianday(logout_time) - julianday(login_time)) * 24 
              ELSE 0 
            END) as total_work_hours,
            AVG(CASE 
              WHEN logout_time IS NOT NULL 
              THEN (julianday(logout_time) - julianday(login_time)) * 24 
              ELSE 0 
            END) as avg_session_duration
          FROM login_sessions
          WHERE user_id = ?
            AND strftime('%Y', login_time) = ?
            AND strftime('%m', login_time) = ?
        `, [userId, String(year), String(month).padStart(2, '0')], (err, row) => {
          if (err) rej(err);
          else res(row || {});
        });
      });
      
      // 2. Pobierz statystyki spraw
      const casesStats = await new Promise((res, rej) => {
        db.get(`
          SELECT COUNT(*) as total_cases
          FROM cases
          WHERE (assigned_to = ? OR additional_caretaker = ?)
        `, [userId, userId], (err, row) => {
          if (err) rej(err);
          else res(row || { total_cases: 0 });
        });
      });
      
      // 3. Pobierz statystyki klientów
      const clientsStats = await new Promise((res, rej) => {
        db.get(`
          SELECT COUNT(DISTINCT c.id) as total_clients
          FROM clients c
          LEFT JOIN cases ca ON c.id = ca.client_id
          WHERE c.assigned_to = ? OR ca.assigned_to = ? OR ca.additional_caretaker = ?
        `, [userId, userId, userId], (err, row) => {
          if (err) rej(err);
          else res(row || { total_clients: 0 });
        });
      });
      
      // 4. Pobierz statystyki zadań
      const tasksStats = await new Promise((res, rej) => {
        db.get(`
          SELECT 
            COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
          FROM employee_tasks
          WHERE assigned_to = ?
            AND strftime('%Y', created_at) = ?
            AND strftime('%m', created_at) = ?
        `, [userId, String(year), String(month).padStart(2, '0')], (err, row) => {
          if (err) rej(err);
          else res(row || { total_tasks: 0, completed_tasks: 0 });
        });
      });
      
      // 5. Pobierz średnią ocen (z obsługą błędów)
      const reviewsStats = await new Promise((res) => {
        db.get(`
          SELECT AVG(rating) as avg_rating
          FROM employee_reviews
          WHERE user_id = ?
            AND strftime('%Y', created_at) = ?
            AND strftime('%m', created_at) = ?
        `, [userId, String(year), String(month).padStart(2, '0')], (err, row) => {
          if (err) {
            console.warn('⚠️ Tabela employee_reviews niedostępna, używam 0');
            res({ avg_rating: 0 });
          } else {
            res(row || { avg_rating: 0 });
          }
        });
      });
      
      // 6. Pobierz szczegóły logowań (ostatnie 50)
      const workTimeDetails = await new Promise((res, rej) => {
        db.all(`
          SELECT login_time, logout_time, ip_address, duration_seconds
          FROM login_sessions
          WHERE user_id = ?
            AND strftime('%Y', login_time) = ?
            AND strftime('%m', login_time) = ?
          ORDER BY login_time DESC
          LIMIT 50
        `, [userId, String(year), String(month).padStart(2, '0')], (err, rows) => {
          if (err) rej(err);
          else res(rows || []);
        });
      });
      
      // 7. Pobierz podsumowanie aktywności
      const activitySummary = await new Promise((res, rej) => {
        db.all(`
          SELECT 
            action_category,
            COUNT(*) as count
          FROM employee_activity_logs
          WHERE user_id = ?
            AND strftime('%Y', created_at) = ?
            AND strftime('%m', created_at) = ?
          GROUP BY action_category
          ORDER BY count DESC
        `, [userId, String(year), String(month).padStart(2, '0')], (err, rows) => {
          if (err) rej(err);
          else res(rows || []);
        });
      });
      
      // 8. Zapisz raport
      db.run(`
        INSERT OR REPLACE INTO monthly_reports (
          user_id, report_year, report_month,
          total_work_hours, total_login_sessions, avg_session_duration,
          total_cases, total_clients,
          completed_tasks, total_tasks,
          avg_rating,
          work_time_details, activity_summary,
          status, generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', datetime('now', 'localtime'))
      `, [
        userId, year, month,
        workTimeStats.total_work_hours || 0,
        workTimeStats.total_login_sessions || 0,
        workTimeStats.avg_session_duration || 0,
        casesStats.total_cases || 0,
        clientsStats.total_clients || 0,
        tasksStats.completed_tasks || 0,
        tasksStats.total_tasks || 0,
        reviewsStats.avg_rating || 0,
        JSON.stringify(workTimeDetails),
        JSON.stringify(activitySummary)
      ], (err) => {
        if (err) {
          console.error(`❌ Błąd zapisu raportu dla user_id=${userId}:`, err);
          reject(err);
        } else {
          console.log(`✅ Raport zapisany dla user_id=${userId}`);
          resolve();
        }
      });
      
    } catch (error) {
      console.error(`❌ Błąd generowania raportu dla user_id=${userId}:`, error);
      reject(error);
    }
  });
}

/**
 * Generuje raporty dla wszystkich aktywnych pracowników
 */
async function generateMonthlyReports(targetYear, targetMonth) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        reject(err);
        return;
      }
      
      console.log('✅ Połączono z bazą danych');
      
      // Pobierz wszystkich aktywnych użytkowników (nie klientów)
      db.all(`
        SELECT id, name, email, user_role
        FROM users
        WHERE user_role != 'client'
          AND status = 'online' OR status = 'offline'
        ORDER BY id
      `, async (err, users) => {
        if (err) {
          console.error('❌ Błąd pobierania użytkowników:', err);
          db.close();
          reject(err);
          return;
        }
        
        console.log(`📋 Znaleziono ${users.length} pracowników do przetworzenia`);
        
        // Generuj raporty sekwencyjnie
        try {
          for (const user of users) {
            await generateReportForEmployee(db, user.id, targetYear, targetMonth);
          }
          
          db.close((err) => {
            if (err) {
              console.error('❌ Błąd zamykania bazy:', err);
              reject(err);
            } else {
              console.log('✅ Wszystkie raporty wygenerowane!');
              resolve();
            }
          });
        } catch (error) {
          db.close();
          reject(error);
        }
      });
    });
  });
}

// Uruchom ręcznie lub z cron
if (require.main === module) {
  // Domyślnie generuj raport za poprzedni miesiąc
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  
  console.log(`🚀 Generuję raporty miesięczne za ${targetYear}-${String(targetMonth).padStart(2, '0')}...\n`);
  
  generateMonthlyReports(targetYear, targetMonth)
    .then(() => {
      console.log('\n✅ Wszystko gotowe!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Generowanie raportów nie powiodło się:', err);
      process.exit(1);
    });
}

module.exports = { generateMonthlyReports };
