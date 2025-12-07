// Migracja: Tabele szczegółów dla wszystkich typów spraw
const sqlite3 = require('sqlite3').verbose();

function runMigration(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Tworzę tabele szczegółów spraw...');

      // === SPRAWY CYWILNE ===
      db.run(`
        CREATE TABLE IF NOT EXISTS civil_case_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          
          -- Podtyp sprawy cywilnej
          civil_subtype VARCHAR(50),  -- ODS/UMO/ROD/MAJ/SPA/DLU
          
          -- ODSZKODOWANIA (ODS)
          incident_date DATE,
          incident_type VARCHAR(100),
          incident_location TEXT,
          material_damage DECIMAL(10,2),
          personal_injury BOOLEAN DEFAULT 0,
          injury_description TEXT,
          medical_costs DECIMAL(10,2),
          rehabilitation_costs DECIMAL(10,2),
          lost_earnings DECIMAL(10,2),
          pain_suffering_amount DECIMAL(10,2),
          
          -- Sprawca i ubezpieczenie
          perpetrator_name VARCHAR(255),
          perpetrator_insurance VARCHAR(255),
          insurance_policy_number VARCHAR(100),
          police_report_number VARCHAR(100),
          
          -- Roszczenia
          claimed_amount DECIMAL(10,2),
          court_awarded_amount DECIMAL(10,2),
          payment_deadline DATE,
          payment_status VARCHAR(50),
          
          -- UMOWY (UMO)
          contract_type VARCHAR(100),
          contract_date DATE,
          contract_value DECIMAL(10,2),
          contract_parties TEXT,
          breach_type VARCHAR(100),
          breach_date DATE,
          breach_description TEXT,
          penalty_clause BOOLEAN DEFAULT 0,
          penalty_amount DECIMAL(10,2),
          interest_rate DECIMAL(5,2),
          resolution_type VARCHAR(50),
          mediation_attempted BOOLEAN DEFAULT 0,
          arbitration_clause BOOLEAN DEFAULT 0,
          
          -- Dodatkowe dane (JSON)
          extra_data TEXT,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('❌ Błąd tworzenia civil_case_details:', err);
        else console.log('✅ civil_case_details');
      });

      // === SPRAWY KARNE ===
      db.run(`
        CREATE TABLE IF NOT EXISTS criminal_case_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          
          -- Podtyp sprawy karnej
          criminal_subtype VARCHAR(50),  -- POB/KRA/OSZ/DRO/NAR
          
          -- Czyn
          offense_date DATE,
          offense_location TEXT,
          offense_time TIME,
          offense_type VARCHAR(100),
          severity VARCHAR(50),
          weapons_used BOOLEAN DEFAULT 0,
          weapon_type VARCHAR(100),
          
          -- Ofiara
          victim_name VARCHAR(255),
          victim_injuries TEXT,
          medical_report_number VARCHAR(100),
          hospitalization_required BOOLEAN DEFAULT 0,
          hospital_days INTEGER,
          permanent_damage BOOLEAN DEFAULT 0,
          
          -- Oskarżony
          accused_plea VARCHAR(50),
          self_defense_claimed BOOLEAN DEFAULT 0,
          provocation_claimed BOOLEAN DEFAULT 0,
          alcohol_involved BOOLEAN DEFAULT 0,
          alcohol_level DECIMAL(3,2),
          drugs_involved BOOLEAN DEFAULT 0,
          drug_type VARCHAR(100),
          
          -- Postępowanie
          arrest_made BOOLEAN DEFAULT 0,
          detention VARCHAR(50),
          bail_amount DECIMAL(10,2),
          restraining_order BOOLEAN DEFAULT 0,
          
          -- Dowody
          surveillance_footage BOOLEAN DEFAULT 0,
          forensic_evidence BOOLEAN DEFAULT 0,
          witness_count INTEGER DEFAULT 0,
          expert_testimony BOOLEAN DEFAULT 0,
          
          -- KRADZIEŻE (KRA)
          theft_type VARCHAR(100),
          stolen_items TEXT,
          total_value DECIMAL(10,2),
          items_recovered BOOLEAN DEFAULT 0,
          recovery_value DECIMAL(10,2),
          forced_entry BOOLEAN DEFAULT 0,
          entry_method TEXT,
          alarm_system BOOLEAN DEFAULT 0,
          organized_crime BOOLEAN DEFAULT 0,
          repeat_offense BOOLEAN DEFAULT 0,
          previous_convictions INTEGER DEFAULT 0,
          
          -- DROGOWE (DRO)
          speed_limit INTEGER,
          recorded_speed INTEGER,
          speed_excess INTEGER,
          accident_caused BOOLEAN DEFAULT 0,
          injuries_caused BOOLEAN DEFAULT 0,
          fatalities INTEGER DEFAULT 0,
          property_damage DECIMAL(10,2),
          license_suspension BOOLEAN DEFAULT 0,
          suspension_period_months INTEGER,
          points_penalty INTEGER,
          fine_amount DECIMAL(10,2),
          
          -- Dodatkowe dane (JSON)
          extra_data TEXT,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('❌ Błąd tworzenia criminal_case_details:', err);
        else console.log('✅ criminal_case_details');
      });

      // === SPRAWY RODZINNE ===
      db.run(`
        CREATE TABLE IF NOT EXISTS family_case_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          
          -- Typ sprawy rodzinnej
          family_case_type VARCHAR(100),  -- rozwód/separacja/alimenty/opieka
          
          -- MAŁŻEŃSTWO
          marriage_date DATE,
          marriage_duration_years INTEGER,
          ceremony_type VARCHAR(50),
          marriage_certificate VARCHAR(100),
          
          -- SEPARACJA/ROZWÓD
          separation_date DATE,
          living_separately BOOLEAN DEFAULT 0,
          separation_duration_months INTEGER,
          reconciliation_attempted BOOLEAN DEFAULT 0,
          mediation_sessions INTEGER DEFAULT 0,
          
          petition_date DATE,
          fault_based BOOLEAN DEFAULT 0,
          at_fault_party VARCHAR(50),
          grounds TEXT,
          contested BOOLEAN DEFAULT 0,
          decree_date DATE,
          decree_final BOOLEAN DEFAULT 0,
          
          -- DZIECI (JSON array)
          children_data TEXT,
          children_count INTEGER DEFAULT 0,
          
          -- WŁADZA RODZICIELSKA
          parental_authority_type VARCHAR(50),
          primary_residence_with VARCHAR(50),
          decision_making VARCHAR(50),
          daily_care VARCHAR(50),
          restrictions BOOLEAN DEFAULT 0,
          restriction_reason TEXT,
          supervised_visits BOOLEAN DEFAULT 0,
          
          -- KONTAKTY
          visitation_schedule_type VARCHAR(50),
          custom_schedule TEXT,
          weekday_visits BOOLEAN DEFAULT 0,
          weekday_schedule TEXT,
          holiday_schedule TEXT,
          vacation_split VARCHAR(50),
          pickup_location TEXT,
          supervised_required BOOLEAN DEFAULT 0,
          interference_by_parent BOOLEAN DEFAULT 0,
          
          -- ALIMENTY NA DZIECI
          child_support_amount DECIMAL(10,2),
          child_support_per_child DECIMAL(10,2),
          payment_frequency VARCHAR(50),
          payment_day INTEGER,
          indexation BOOLEAN DEFAULT 0,
          arrears DECIMAL(10,2),
          enforcement_proceedings BOOLEAN DEFAULT 0,
          
          -- ALIMENTY NA MAŁŻONKA
          spousal_support_entitled BOOLEAN DEFAULT 0,
          spousal_support_amount DECIMAL(10,2),
          spousal_support_duration VARCHAR(50),
          spousal_support_start_date DATE,
          spousal_support_end_date DATE,
          
          -- PODZIAŁ MAJĄTKU
          property_division BOOLEAN DEFAULT 0,
          marital_property_value DECIMAL(10,2),
          property_regime VARCHAR(50),
          assets_data TEXT,
          debts_data TEXT,
          equalization_payment DECIMAL(10,2),
          payment_deadline DATE,
          
          -- PRZEMOC/BEZPIECZEŃSTWO
          domestic_violence BOOLEAN DEFAULT 0,
          violence_type VARCHAR(50),
          restraining_order BOOLEAN DEFAULT 0,
          restraining_order_number VARCHAR(100),
          child_abuse BOOLEAN DEFAULT 0,
          substance_abuse BOOLEAN DEFAULT 0,
          
          -- MIĘDZYNARODOWE
          international_element BOOLEAN DEFAULT 0,
          foreign_citizenship BOOLEAN DEFAULT 0,
          hague_convention BOOLEAN DEFAULT 0,
          child_abduction_risk VARCHAR(50),
          
          -- Dodatkowe dane (JSON)
          extra_data TEXT,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('❌ Błąd tworzenia family_case_details:', err);
        else console.log('✅ family_case_details');
      });

      // === SPRAWY GOSPODARCZE ===
      db.run(`
        CREATE TABLE IF NOT EXISTS commercial_case_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          
          -- Typ sprawy gospodarczej
          commercial_subtype VARCHAR(50),  -- GOS/UPA/RES
          
          -- STRONY BIZNESOWE
          plaintiff_company_name VARCHAR(255),
          plaintiff_tax_id VARCHAR(50),
          plaintiff_registry_number VARCHAR(100),
          plaintiff_legal_form VARCHAR(50),
          plaintiff_represented_by VARCHAR(255),
          
          defendant_company_name VARCHAR(255),
          defendant_tax_id VARCHAR(50),
          defendant_registry_number VARCHAR(100),
          defendant_legal_form VARCHAR(50),
          
          -- PRZEDMIOT SPORU
          dispute_subject TEXT,
          contract_number VARCHAR(100),
          contract_date DATE,
          contract_value DECIMAL(12,2),
          
          -- ROSZCZENIA
          claimed_amount DECIMAL(12,2),
          principal_amount DECIMAL(12,2),
          interest_amount DECIMAL(12,2),
          interest_rate DECIMAL(5,2),
          interest_type VARCHAR(50),
          penalty_amount DECIMAL(12,2),
          costs_claimed DECIMAL(12,2),
          
          -- ZABEZPIECZENIA
          provisional_measures BOOLEAN DEFAULT 0,
          measures_type VARCHAR(100),
          secured_amount DECIMAL(12,2),
          
          -- ARBITRAŻ
          arbitration_clause BOOLEAN DEFAULT 0,
          arbitration_court VARCHAR(255),
          arbitration_proceedings BOOLEAN DEFAULT 0,
          
          -- UPADŁOŚĆ (UPA)
          bankruptcy_type VARCHAR(50),
          bankruptcy_date DATE,
          creditors_count INTEGER,
          total_debt DECIMAL(12,2),
          assets_value DECIMAL(12,2),
          trustee_name VARCHAR(255),
          
          -- RESTRUKTURYZACJA (RES)
          restructuring_plan BOOLEAN DEFAULT 0,
          plan_approval_date DATE,
          payment_schedule TEXT,
          
          -- Dodatkowe dane (JSON)
          extra_data TEXT,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('❌ Błąd tworzenia commercial_case_details:', err);
        else console.log('✅ commercial_case_details');
      });

      // === SPRAWY ADMINISTRACYJNE ===
      db.run(`
        CREATE TABLE IF NOT EXISTS administrative_case_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          
          -- Typ sprawy administracyjnej
          admin_subtype VARCHAR(50),  -- BUD/POD/ZAG
          
          -- ORGAN
          authority_name VARCHAR(255),
          authority_address TEXT,
          authority_contact VARCHAR(255),
          
          -- DECYZJA
          decision_number VARCHAR(100),
          decision_date DATE,
          decision_type VARCHAR(100),
          decision_subject TEXT,
          
          -- ODWOŁANIE
          appeal_filed BOOLEAN DEFAULT 0,
          appeal_date DATE,
          appeal_deadline DATE,
          appeal_grounds TEXT,
          
          -- POSTĘPOWANIE
          first_instance_court VARCHAR(255),
          second_instance_court VARCHAR(255),
          case_stage VARCHAR(50),
          
          -- POZWOLENIA/ZGODY
          permit_type VARCHAR(100),
          permit_number VARCHAR(100),
          permit_issued BOOLEAN DEFAULT 0,
          permit_denied BOOLEAN DEFAULT 0,
          denial_reason TEXT,
          
          -- KARY/SANKCJE
          penalty_imposed BOOLEAN DEFAULT 0,
          penalty_type VARCHAR(100),
          penalty_amount DECIMAL(10,2),
          penalty_paid BOOLEAN DEFAULT 0,
          
          -- Dodatkowe dane (JSON)
          extra_data TEXT,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('❌ Błąd tworzenia administrative_case_details:', err);
        else console.log('✅ administrative_case_details');
      });

      // === ROZSZERZENIE ISTNIEJĄCYCH TABEL ===
      
      // Dodaj kody do attachments
      db.run(`
        ALTER TABLE attachments ADD COLUMN document_code VARCHAR(255)
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Błąd dodawania document_code:', err);
        } else {
          console.log('✅ attachments.document_code');
        }
      });

      // Dodaj kody do events
      db.run(`
        ALTER TABLE events ADD COLUMN event_code VARCHAR(255)
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Błąd dodawania event_code:', err);
        } else {
          console.log('✅ events.event_code');
        }
        
        console.log('✅ Migracja zakończona!');
        resolve();
      });
    });
  });
}

module.exports = { runMigration };

// Uruchom jeśli wywołane bezpośrednio
if (require.main === module) {
  const path = require('path');
  const dbPath = path.join(__dirname, '../../data/komunikator.db');
  const db = new sqlite3.Database(dbPath);
  
  runMigration(db)
    .then(() => {
      console.log('🎉 Migracja wykonana pomyślnie!');
      db.close();
    })
    .catch(err => {
      console.error('❌ Błąd migracji:', err);
      db.close();
      process.exit(1);
    });
}
