/**
 * Helper do automatycznego logowania aktywności pracowników
 * Używany w całym backendzie do spójnego zapisu do employee_activity_logs
 */

const { getDatabase } = require('../database/init');

/**
 * Loguje aktywność pracownika do tabeli employee_activity_logs
 * @param {Object} params - Parametry aktywności
 * @param {number} params.userId - ID użytkownika (pracownika)
 * @param {string} params.actionType - Typ akcji (np. 'task_created', 'case_assigned')
 * @param {string} params.actionCategory - Kategoria (np. 'task', 'case', 'client', 'event', 'payment')
 * @param {string} params.description - Opis akcji (widoczny w dashboardzie)
 * @param {number} [params.caseId] - ID powiązanej sprawy
 * @param {number} [params.clientId] - ID powiązanego klienta
 * @param {number} [params.taskId] - ID powiązanego zadania
 * @param {number} [params.eventId] - ID powiązanego wydarzenia
 * @param {number} [params.paymentId] - ID powiązanej płatności
 * @param {number} [params.documentId] - ID powiązanego dokumentu
 * @param {Object} [params.metadata] - Dodatkowe dane JSON
 */
function logEmployeeActivity({
  userId,
  actionType,
  actionCategory,
  description,
  caseId = null,
  clientId = null,
  taskId = null,
  eventId = null,
  paymentId = null,
  documentId = null,
  metadata = null
}) {
  // WALIDACJA: Sprawdź czy userId jest prawidłowe
  if (!userId || isNaN(userId)) {
    console.warn('⚠️ Pomijam logowanie aktywności - brak prawidłowego userId:', userId);
    return;
  }

  const db = getDatabase();

  // Najpierw sprawdź czy user istnieje
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('⚠️ Błąd sprawdzania użytkownika:', err);
      return;
    }

    if (!user) {
      console.warn(`⚠️ Pomijam logowanie aktywności - user ${userId} nie istnieje w bazie`);
      return;
    }

    // User istnieje, zapisz aktywność
    db.run(`
      INSERT INTO employee_activity_logs (
        user_id, action_type, action_category, description,
        related_case_id, related_client_id, related_task_id,
        related_event_id, related_payment_id, related_document_id,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      actionType,
      actionCategory,
      description,
      caseId,
      clientId,
      taskId,
      eventId,
      paymentId,
      documentId,
      metadata ? JSON.stringify(metadata) : null
    ], (err) => {
      if (err) {
        console.error('⚠️ Błąd logowania employee_activity_logs:', err);
      } else {
        console.log(`📊 HR Activity logged: ${actionType} for user ${userId}`);
      }
    });
  });
}

module.exports = { logEmployeeActivity };
