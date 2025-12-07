-- =====================================================
-- MODUŁ DOWODÓW - Kompletna struktura
-- =====================================================

CREATE TABLE IF NOT EXISTS case_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  evidence_code TEXT UNIQUE NOT NULL,
  
  -- Podstawowe informacje
  evidence_type TEXT NOT NULL, -- physical/document/testimony/expert/recording/photo/correspondence/protocol/other
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pochodzenie
  obtained_date DATE,
  obtained_from TEXT, -- Źródło: osoba/instytucja
  obtained_method TEXT, -- Sposób uzyskania: przeszukanie/wydanie/znalezienie/przekazanie
  
  -- Strony
  presented_by TEXT, -- our_side/opposing_side/court/third_party
  against_party TEXT, -- Przeciwko komu jest ten dowód
  
  -- Ocena
  significance TEXT, -- crucial/important/supporting/neutral
  credibility_score INTEGER DEFAULT 5, -- 1-10
  admissibility TEXT, -- admissible/contested/rejected/pending
  
  -- Status procesowy
  status TEXT DEFAULT 'secured', -- secured/catalogued/presented/accepted/rejected/challenged
  presented_date DATE, -- Kiedy przedstawiony w sądzie
  court_decision TEXT, -- Decyzja sądu o dopuszczeniu
  
  -- Powiązania
  document_id INTEGER, -- Powiązany dokument w systemie
  witness_id INTEGER, -- Powiązany świadek
  related_evidence_ids TEXT, -- JSON array z ID powiązanych dowodów
  
  -- Fizyczne przechowywanie
  storage_location TEXT, -- Gdzie fizycznie przechowywany
  physical_condition TEXT, -- Stan fizyczny dowodu
  chain_of_custody TEXT, -- JSON - historia posiadania dowodu
  
  -- Analiza
  expert_analysis TEXT, -- Czy była opinia biegłego
  technical_data TEXT, -- JSON - dane techniczne (dla nagrań, zdjęć)
  
  -- Notatki
  strengths TEXT, -- Mocne strony dowodu
  weaknesses TEXT, -- Słabości dowodu
  usage_strategy TEXT, -- Strategia wykorzystania
  notes TEXT,
  
  -- Metadata
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES case_documents(id),
  FOREIGN KEY (witness_id) REFERENCES case_witnesses(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON case_evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON case_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON case_evidence(status);
CREATE INDEX IF NOT EXISTS idx_evidence_significance ON case_evidence(significance);
CREATE INDEX IF NOT EXISTS idx_evidence_presented_by ON case_evidence(presented_by);

-- Tabela historii zmian dowodu
CREATE TABLE IF NOT EXISTS evidence_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- created/updated/status_changed/presented/challenged
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (evidence_id) REFERENCES case_evidence(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_evidence_history_evidence_id ON evidence_history(evidence_id);
