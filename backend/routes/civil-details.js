const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// ========== GET - Pobierz szczegóły sprawy cywilnej ==========
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;

  db.get(
    `SELECT * FROM case_civil_details WHERE case_id = ?`,
    [caseId],
    (err, details) => {
      if (err) {
        console.error('❌ Błąd pobierania szczegółów cywilnych:', err);
        return res.status(500).json({ error: 'Błąd pobierania danych' });
      }
      
      res.json({ details: details || null });
    }
  );
});

// ========== POST/PUT - Zapisz/Aktualizuj szczegóły sprawy cywilnej ==========
router.post('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  const data = req.body;

  // Sprawdź czy rekord już istnieje
  db.get(
    `SELECT id FROM case_civil_details WHERE case_id = ?`,
    [caseId],
    (err, existing) => {
      if (err) {
        console.error('❌ Błąd sprawdzania rekordu:', err);
        return res.status(500).json({ error: 'Błąd sprawdzania danych' });
      }

      if (existing) {
        // UPDATE
        db.run(
          `UPDATE case_civil_details SET
            civil_category = ?,
            contract_type = ?,
            contract_parties = ?,
            contract_date = ?,
            contract_terms = ?,
            contract_executed = ?,
            unmet_obligations = ?,
            penalties_provided = ?,
            penalty_amount = ?,
            penalty_terms = ?,
            claim_basis = ?,
            principal_amount = ?,
            interest_amount = ?,
            payment_demands_sent = ?,
            debtor_objections = ?,
            limitation_period_check = ?,
            incident_description = ?,
            incident_date = ?,
            incident_location = ?,
            witnesses_present = ?,
            police_report = ?,
            property_damaged = ?,
            property_value = ?,
            repair_receipts = ?,
            expert_valuation = ?,
            injuries_description = ?,
            medical_documentation = ?,
            treatment_costs = ?,
            lost_income = ?,
            disability_period = ?,
            property_dispute_type = ?,
            legal_title = ?,
            land_register_number = ?,
            notarial_acts = ?,
            joint_use_details = ?,
            previous_court_cases = ?,
            warranty_guarantee_details = ?,
            consumer_claims = ?,
            additional_notes = ?,
            documents_checklist = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE case_id = ?`,
          [
            data.civil_category,
            data.contract_type, data.contract_parties, data.contract_date, 
            data.contract_terms, data.contract_executed, data.unmet_obligations,
            data.penalties_provided, data.penalty_amount, data.penalty_terms,
            data.claim_basis, data.principal_amount, data.interest_amount,
            data.payment_demands_sent, data.debtor_objections, data.limitation_period_check,
            data.incident_description, data.incident_date, data.incident_location,
            data.witnesses_present, data.police_report,
            data.property_damaged, data.property_value, data.repair_receipts, data.expert_valuation,
            data.injuries_description, data.medical_documentation, data.treatment_costs,
            data.lost_income, data.disability_period,
            data.property_dispute_type, data.legal_title, data.land_register_number,
            data.notarial_acts, data.joint_use_details, data.previous_court_cases,
            data.warranty_guarantee_details, data.consumer_claims,
            data.additional_notes, JSON.stringify(data.documents_checklist || []),
            caseId
          ],
          (err) => {
            if (err) {
              console.error('❌ Błąd aktualizacji:', err);
              return res.status(500).json({ error: 'Błąd aktualizacji' });
            }
            res.json({ success: true, message: 'Zaktualizowano szczegóły sprawy cywilnej' });
          }
        );
      } else {
        // INSERT
        db.run(
          `INSERT INTO case_civil_details (
            case_id, civil_category,
            contract_type, contract_parties, contract_date, contract_terms, 
            contract_executed, unmet_obligations, penalties_provided, 
            penalty_amount, penalty_terms,
            claim_basis, principal_amount, interest_amount, payment_demands_sent,
            debtor_objections, limitation_period_check,
            incident_description, incident_date, incident_location, witnesses_present, police_report,
            property_damaged, property_value, repair_receipts, expert_valuation,
            injuries_description, medical_documentation, treatment_costs, lost_income, disability_period,
            property_dispute_type, legal_title, land_register_number, notarial_acts,
            joint_use_details, previous_court_cases,
            warranty_guarantee_details, consumer_claims,
            additional_notes, documents_checklist
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            caseId, data.civil_category,
            data.contract_type, data.contract_parties, data.contract_date, 
            data.contract_terms, data.contract_executed, data.unmet_obligations,
            data.penalties_provided, data.penalty_amount, data.penalty_terms,
            data.claim_basis, data.principal_amount, data.interest_amount,
            data.payment_demands_sent, data.debtor_objections, data.limitation_period_check,
            data.incident_description, data.incident_date, data.incident_location,
            data.witnesses_present, data.police_report,
            data.property_damaged, data.property_value, data.repair_receipts, data.expert_valuation,
            data.injuries_description, data.medical_documentation, data.treatment_costs,
            data.lost_income, data.disability_period,
            data.property_dispute_type, data.legal_title, data.land_register_number,
            data.notarial_acts, data.joint_use_details, data.previous_court_cases,
            data.warranty_guarantee_details, data.consumer_claims,
            data.additional_notes, JSON.stringify(data.documents_checklist || [])
          ],
          (err) => {
            if (err) {
              console.error('❌ Błąd dodawania:', err);
              return res.status(500).json({ error: 'Błąd dodawania danych' });
            }
            res.json({ success: true, message: 'Dodano szczegóły sprawy cywilnej' });
          }
        );
      }
    }
  );
});

module.exports = router;
