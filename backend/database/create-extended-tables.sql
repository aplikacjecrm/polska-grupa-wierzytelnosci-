-- 📋 ROZSZERZONE TABELE DLA PEŁNEJ BAZY PRAWNEJ

-- Akty zmieniające (nowelizacje)
CREATE TABLE IF NOT EXISTS amending_acts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    effective_date DATE,
    journal_reference TEXT, -- np. "Dz.U. 2024 poz. 123"
    url TEXT,
    summary TEXT,
    affected_articles TEXT, -- JSON array ["Art. 1", "Art. 5"]
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Akty wykonawcze (rozporządzenia)
CREATE TABLE IF NOT EXISTS executive_acts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    based_on_article TEXT, -- "wydane na podstawie Art. 123 KC"
    journal_reference TEXT,
    url TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teksty jednolite
CREATE TABLE IF NOT EXISTS consolidated_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_code TEXT NOT NULL, -- 'KC', 'KPC', etc.
    date DATE NOT NULL,
    journal_reference TEXT NOT NULL,
    url TEXT,
    notes TEXT,
    is_current BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ogłoszenia tekstów ustaw
CREATE TABLE IF NOT EXISTS announced_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_code TEXT NOT NULL,
    announcement_date DATE NOT NULL,
    journal_reference TEXT,
    type TEXT, -- 'pierwotny', 'jednolity', 'zmiana'
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Interpretacje (podatkowe, prawne)
CREATE TABLE IF NOT EXISTS legal_interpretations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    interpreting_body TEXT, -- 'Minister Finansów', 'KNF', etc.
    related_articles TEXT, -- JSON array
    content TEXT,
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orzeczenia NSA (Naczelny Sąd Administracyjny)
CREATE TABLE IF NOT EXISTS nsa_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signature TEXT UNIQUE NOT NULL,
    decision_date DATE NOT NULL,
    decision_type TEXT,
    result TEXT,
    summary TEXT,
    full_text TEXT,
    judge_name TEXT,
    source_url TEXT,
    related_articles TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_amending_date ON amending_acts(date);
CREATE INDEX IF NOT EXISTS idx_executive_date ON executive_acts(date);
CREATE INDEX IF NOT EXISTS idx_consolidated_code ON consolidated_texts(act_code);
CREATE INDEX IF NOT EXISTS idx_nsa_signature ON nsa_decisions(signature);
CREATE INDEX IF NOT EXISTS idx_nsa_date ON nsa_decisions(decision_date);
