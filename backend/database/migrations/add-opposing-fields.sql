-- ==========================================
-- MIGRACJA: Dodanie brakujących pól do opposing_party
-- Data: 2025-11-09
-- Wersja: 1.0
-- ==========================================

-- KROK 2: Flash Check Finansowy
ALTER TABLE opposing_party ADD COLUMN financial_capital REAL;
ALTER TABLE opposing_party ADD COLUMN financial_debt BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN financial_krd BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN financial_notes TEXT;

-- KROK 3: Social Media Scan
ALTER TABLE opposing_party ADD COLUMN social_profiles TEXT;
ALTER TABLE opposing_party ADD COLUMN social_reputation TEXT;
ALTER TABLE opposing_party ADD COLUMN social_notes TEXT;

-- KROK 4: Historia Sądowa
ALTER TABLE opposing_party ADD COLUMN history_cases_count INTEGER;
ALTER TABLE opposing_party ADD COLUMN history_outcome TEXT;
ALTER TABLE opposing_party ADD COLUMN history_notes TEXT;

-- KROK 5: Taktyki Procesowe
ALTER TABLE opposing_party ADD COLUMN tactics_style TEXT;
ALTER TABLE opposing_party ADD COLUMN tactic_delays BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN tactic_motions BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN tactic_settlement BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN tactic_witnesses BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN tactic_evidence BOOLEAN DEFAULT 0;
ALTER TABLE opposing_party ADD COLUMN tactics_notes TEXT;

-- KROK 6: Pełnomocnik (uzupełnienie)
ALTER TABLE opposing_party ADD COLUMN lawyer_phone TEXT;
ALTER TABLE opposing_party ADD COLUMN lawyer_email TEXT;
ALTER TABLE opposing_party ADD COLUMN lawyer_aggressiveness TEXT;
ALTER TABLE opposing_party ADD COLUMN lawyer_notes TEXT;

-- KROK 7: Podsumowanie
ALTER TABLE opposing_party ADD COLUMN summary_notes TEXT;

-- ==========================================
-- MIGRACJA: Dodanie pól do clients (dla firm)
-- ==========================================

ALTER TABLE clients ADD COLUMN regon TEXT;
ALTER TABLE clients ADD COLUMN krs TEXT;
ALTER TABLE clients ADD COLUMN company_type TEXT;

-- ==========================================
-- MIGRACJA: Integracja z innymi modułami
-- ==========================================

-- Dodaj flagę do świadków (nasi vs. przeciwnika)
ALTER TABLE case_witnesses ADD COLUMN is_opposing BOOLEAN DEFAULT 0;
ALTER TABLE case_witnesses ADD COLUMN opposing_party_id INTEGER;

-- Dodaj relację do dowodów
ALTER TABLE case_evidence ADD COLUMN opposing_party_id INTEGER;

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_witnesses_opposing ON case_witnesses(is_opposing);
CREATE INDEX IF NOT EXISTS idx_witnesses_opposing_party ON case_witnesses(opposing_party_id);
CREATE INDEX IF NOT EXISTS idx_evidence_opposing_party ON case_evidence(opposing_party_id);
