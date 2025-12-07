/**
 * Seed Data Generator for Employee Dashboard HR
 * Generuje przykładowe dane: aktywności, logowania, zadania, oceny
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/kancelaria.db');

// Helper: Random date w ostatnich N dniach
function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

// Helper: Random choice
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Random integer
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedEmployeeData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        reject(err);
        return;
      }
      
      console.log('✅ Połączono z bazą danych');
      
      // Pobierz wszystkich pracowników (nie klientów)
      db.all(`
        SELECT id, name, user_role 
        FROM users 
        WHERE user_role IN ('admin', 'lawyer', 'client_manager', 'case_manager', 'reception')
      `, async (err, employees) => {
        if (err) {
          console.error('❌ Błąd pobierania pracowników:', err);
          reject(err);
          return;
        }
        
        console.log(`📊 Znaleziono ${employees.length} pracowników`);
        
        if (employees.length === 0) {
          console.log('⚠️ Brak pracowników do wygenerowania danych testowych');
          db.close();
          resolve();
          return;
        }
        
        let completed = 0;
        const total = employees.length * 4; // 4 types of data per employee
        
        // Dla każdego pracownika generuj dane
        employees.forEach(emp => {
          // 1. AKTYWNOŚCI (20-50 na pracownika)
          const activityCount = randomInt(20, 50);
          const activityTypes = [
            { type: 'case_update', category: 'case', desc: 'Zaktualizowano sprawę #' },
            { type: 'document_upload', category: 'document', desc: 'Dodano dokument do sprawy #' },
            { type: 'client_call', category: 'communication', desc: 'Rozmowa telefoniczna z klientem' },
            { type: 'meeting', category: 'meeting', desc: 'Spotkanie w sprawie #' },
            { type: 'email_sent', category: 'communication', desc: 'Wysłano email do klienta' },
            { type: 'note_added', category: 'note', desc: 'Dodano notatkę do sprawy #' },
            { type: 'task_completed', category: 'task', desc: 'Ukończono zadanie' }
          ];
          
          for (let i = 0; i < activityCount; i++) {
            const activity = randomChoice(activityTypes);
            const caseId = randomInt(1, 10);
            
            db.run(`
              INSERT INTO employee_activity_logs (
                user_id, action_type, action_category, description, 
                related_case_id, created_at
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
              emp.id,
              activity.type,
              activity.category,
              activity.desc + caseId,
              caseId,
              randomDate(30)
            ]);
          }
          completed++;
          console.log(`✅ [${completed}/${total}] Aktywności dla: ${emp.name}`);
          
          // 2. LOGOWANIA (15-30 sesji)
          const sessionCount = randomInt(15, 30);
          for (let i = 0; i < sessionCount; i++) {
            const loginTime = new Date(randomDate(30));
            const duration = randomInt(1800, 28800); // 30min - 8h
            const logoutTime = new Date(loginTime.getTime() + duration * 1000);
            
            db.run(`
              INSERT INTO login_sessions (
                user_id, login_time, logout_time, duration_seconds, 
                ip_address, user_agent, device_type
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              emp.id,
              loginTime.toISOString(),
              logoutTime.toISOString(),
              duration,
              `192.168.1.${randomInt(10, 250)}`,
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              randomChoice(['desktop', 'laptop', 'mobile', 'tablet'])
            ]);
          }
          completed++;
          console.log(`✅ [${completed}/${total}] Logowania dla: ${emp.name}`);
          
          // 3. ZADANIA (5-15 zadań)
          const taskCount = randomInt(5, 15);
          const taskTitles = [
            'Przygotuj dokumenty do sprawy',
            'Skontaktuj się z klientem',
            'Złóż pismo do sądu',
            'Przeanalizuj akta sprawy',
            'Przygotuj opinion prawną',
            'Zorganizuj spotkanie z klientem',
            'Zaktualizuj status sprawy',
            'Przygotuj umowę zlecenia',
            'Sprawdź terminy procesowe'
          ];
          const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
          const priorities = ['low', 'medium', 'high'];
          
          for (let i = 0; i < taskCount; i++) {
            const status = randomChoice(statuses);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + randomInt(-5, 15));
            
            db.run(`
              INSERT INTO employee_tasks (
                assigned_to, assigned_by, title, description, 
                priority, due_date, case_id, status, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              emp.id,
              1, // admin assigns
              randomChoice(taskTitles),
              'Szczegółowy opis zadania i wymagane działania...',
              randomChoice(priorities),
              dueDate.toISOString(),
              randomInt(1, 10),
              status,
              randomDate(30)
            ]);
          }
          completed++;
          console.log(`✅ [${completed}/${total}] Zadania dla: ${emp.name}`);
          
          // 4. OCENY (2-5 ocen)
          const reviewCount = randomInt(2, 5);
          const reviewTypes = ['quarterly', 'annual', 'project', 'performance'];
          const strengths = [
            'Doskonała znajomość prawa cywilnego',
            'Wysoka punktualność i zaangażowanie',
            'Świetna komunikacja z klientami',
            'Profesjonalizm w przygotowywaniu dokumentów',
            'Dobra organizacja czasu pracy'
          ];
          const weaknesses = [
            'Czasami brak inicjatywy',
            'Wymaga poprawy w zarządzaniu czasem',
            'Potrzebuje więcej samodzielności',
            'Należy poprawić dokumentację spraw'
          ];
          const recommendations = [
            'Szkolenie z zakresu nowych przepisów',
            'Udział w konferencji branżowej',
            'Warsztaty z komunikacji z klientem',
            'Kurs zaawansowany z prawa rodzinnego'
          ];
          
          for (let i = 0; i < reviewCount; i++) {
            db.run(`
              INSERT INTO employee_reviews (
                user_id, reviewer_id, review_type, rating, 
                strengths, weaknesses, recommendations, status, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              emp.id,
              1, // admin reviews
              randomChoice(reviewTypes),
              randomInt(3, 5), // 3-5 stars
              randomChoice(strengths),
              randomChoice(weaknesses),
              randomChoice(recommendations),
              'completed',
              randomDate(90)
            ]);
          }
          completed++;
          console.log(`✅ [${completed}/${total}] Oceny dla: ${emp.name}`);
        });
        
        // Poczekaj chwilę na zakończenie wszystkich insertów
        setTimeout(() => {
          console.log('\n🎉 SEED DATA - GOTOWE!');
          console.log('═'.repeat(50));
          console.log(`📊 Wygenerowano dane dla ${employees.length} pracowników:`);
          console.log(`   - Aktywności: ~${employees.length * 35} wpisów`);
          console.log(`   - Logowania: ~${employees.length * 22} sesji`);
          console.log(`   - Zadania: ~${employees.length * 10} zadań`);
          console.log(`   - Oceny: ~${employees.length * 3} ocen`);
          console.log('═'.repeat(50));
          
          db.close();
          resolve();
        }, 2000);
      });
    });
  });
}

// Run seed
console.log('🌱 Uruchamiam generator Seed Data...\n');
seedEmployeeData()
  .then(() => {
    console.log('\n✅ Zakończono pomyślnie!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Błąd:', err);
    process.exit(1);
  });
