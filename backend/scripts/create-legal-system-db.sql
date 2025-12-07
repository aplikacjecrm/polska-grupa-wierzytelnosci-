-- 🗄️ ROZSZERZONA STRUKTURA BAZY - KOMPLETNY SYSTEM PRAWNY

-- ============================================================
-- TABELA 1: AKTY PRAWNE (podstawowa)
-- ============================================================
CREATE TABLE IF NOT EXISTS legal_acts_extended (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,                  -- KC, KPC, KK, KP...
    title TEXT NOT NULL,                 -- Kodeks cywilny
    full_title TEXT,                     -- Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny
    journal_ref TEXT,                    -- Dz.U. 1964 nr 16 poz. 93
    date_enacted DATE,                   -- 1964-04-23
    date_in_force DATE,                  -- Data wejścia w życie
    isap_url TEXT,                       -- Link do ISAP
    status TEXT DEFAULT 'active',        -- active, repealed, superseded
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA 2: ARTYKUŁY (szczegółowa struktura)
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_id INTEGER NOT NULL,
    article_number TEXT NOT NULL,        -- 444, 444^1, 555a
    title TEXT,                          -- Tytuł artykułu (jeśli jest)
    content_full TEXT NOT NULL,          -- Pełna treść artykułu
    status TEXT DEFAULT 'active',        -- active, repealed, amended
    version_date DATE,                   -- Data wersji (dla historii)
    effective_from DATE,                 -- Od kiedy obowiązuje
    effective_to DATE,                   -- Do kiedy obowiązywał
    is_current BOOLEAN DEFAULT 1,        -- Czy aktualna wersja
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (act_id) REFERENCES legal_acts_extended(id)
);

CREATE INDEX idx_articles_number ON articles(article_number, act_id);
CREATE INDEX idx_articles_current ON articles(is_current, act_id);

-- ============================================================
-- TABELA 3: PARAGRAFY (hierarchia)
-- ============================================================
CREATE TABLE IF NOT EXISTS paragraphs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    paragraph_number TEXT NOT NULL,      -- 1, 2, 3...
    content TEXT NOT NULL,               -- Treść paragrafu
    sort_order INTEGER,                  -- Kolejność
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE INDEX idx_paragraphs_article ON paragraphs(article_id);

-- ============================================================
-- TABELA 4: PUNKTY (hierarchia głębsza)
-- ============================================================
CREATE TABLE IF NOT EXISTS points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paragraph_id INTEGER NOT NULL,
    point_number TEXT NOT NULL,          -- 1, 2, 3...
    content TEXT NOT NULL,
    sort_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paragraph_id) REFERENCES paragraphs(id)
);

-- ============================================================
-- TABELA 5: LITERY (najgłębsza hierarchia)
-- ============================================================
CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point_id INTEGER NOT NULL,
    letter TEXT NOT NULL,                -- a, b, c...
    content TEXT NOT NULL,
    sort_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES points(id)
);

-- ============================================================
-- TABELA 6: ZMIANY W USTAWACH (nowelizacje)
-- ============================================================
CREATE TABLE IF NOT EXISTS amendments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,         -- Artykuł który zmieniono
    amending_act_title TEXT NOT NULL,    -- Ustawa zmieniająca
    amending_act_ref TEXT,               -- Dz.U. 2020 poz. 123
    change_date DATE NOT NULL,           -- Data zmiany
    effective_date DATE,                 -- Data wejścia w życie
    change_type TEXT,                    -- amended, added, repealed
    old_content TEXT,                    -- Stara treść
    new_content TEXT,                    -- Nowa treść
    reason TEXT,                         -- Powód zmiany
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE INDEX idx_amendments_article ON amendments(article_id);
CREATE INDEX idx_amendments_date ON amendments(change_date);

-- ============================================================
-- TABELA 7: ORZECZENIA (TK, SN, NSA...)
-- ============================================================
CREATE TABLE IF NOT EXISTS court_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court_type TEXT NOT NULL,            -- TK, SN, NSA, SA, SO
    case_number TEXT NOT NULL,           -- K 1/20, III CZP 45/19
    decision_date DATE NOT NULL,
    publication_ref TEXT,                -- Dz.U. lub OTK
    summary TEXT,                        -- Streszczenie
    full_text TEXT,                      -- Pełna treść
    legal_basis TEXT,                    -- Podstawa prawna
    keywords TEXT,                       -- Słowa kluczowe
    url TEXT,                            -- Link do orzeczenia
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_decisions_court ON court_decisions(court_type);
CREATE INDEX idx_decisions_date ON court_decisions(decision_date);

-- ============================================================
-- TABELA 8: POWIĄZANIA: Orzeczenia ↔ Artykuły
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    relationship_type TEXT,              -- interprets, invalidates, confirms
    notes TEXT,
    FOREIGN KEY (decision_id) REFERENCES court_decisions(id),
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- ============================================================
-- TABELA 9: INTERPRETACJE (ministerialne, KNF, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS interpretations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issuing_authority TEXT NOT NULL,    -- Minister, KNF, GIF...
    document_number TEXT,
    issue_date DATE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    full_text TEXT,
    legal_basis TEXT,                    -- Artykuły których dotyczy
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA 10: POWIĄZANIA: Interpretacje ↔ Artykuły
-- ============================================================
CREATE TABLE IF NOT EXISTS interpretation_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interpretation_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    notes TEXT,
    FOREIGN KEY (interpretation_id) REFERENCES interpretations(id),
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- ============================================================
-- TABELA 11: OBWIESZCZENIA (teksty jednolite)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_id INTEGER NOT NULL,
    announcement_date DATE NOT NULL,
    journal_ref TEXT NOT NULL,           -- Dz.U. 2023 poz. 1234
    announced_by TEXT,                   -- Marszałek Sejmu
    description TEXT,                    -- Tekst jednolity
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (act_id) REFERENCES legal_acts_extended(id)
);

-- ============================================================
-- TABELA 12: PRZEPISY WPROWADZAJĄCE
-- ============================================================
CREATE TABLE IF NOT EXISTS implementing_provisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_id INTEGER NOT NULL,
    provision_number TEXT,               -- Art. 1, 2, 3...
    content TEXT NOT NULL,
    effective_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (act_id) REFERENCES legal_acts_extended(id)
);

-- ============================================================
-- TABELA 13: ODNOŚNIKI (odsyłacze między artykułami)
-- ============================================================
CREATE TABLE IF NOT EXISTS cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_article_id INTEGER NOT NULL,  -- Artykuł źródłowy
    target_article_id INTEGER NOT NULL,  -- Artykuł docelowy
    reference_type TEXT,                 -- refers_to, modifies, repeals
    context TEXT,                        -- Kontekst odniesienia
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_article_id) REFERENCES articles(id),
    FOREIGN KEY (target_article_id) REFERENCES articles(id)
);

-- ============================================================
-- WIDOKI DLA ŁATWEGO DOSTĘPU
-- ============================================================

-- Widok: Aktualne artykuły z pełną hierarchią
CREATE VIEW IF NOT EXISTS v_current_articles AS
SELECT 
    a.id,
    la.code,
    la.title as act_title,
    a.article_number,
    a.content_full,
    a.effective_from,
    COUNT(DISTINCT p.id) as paragraph_count,
    COUNT(DISTINCT pt.id) as point_count
FROM articles a
JOIN legal_acts_extended la ON a.act_id = la.id
LEFT JOIN paragraphs p ON a.id = p.article_id
LEFT JOIN points pt ON p.id = pt.paragraph_id
WHERE a.is_current = 1 AND a.status = 'active'
GROUP BY a.id;

-- Widok: Historia zmian artykułu
CREATE VIEW IF NOT EXISTS v_article_history AS
SELECT 
    a.article_number,
    a.version_date,
    a.content_full,
    am.change_type,
    am.amending_act_title,
    am.effective_date
FROM articles a
LEFT JOIN amendments am ON a.id = am.article_id
ORDER BY a.article_number, a.version_date DESC;

-- ============================================================
-- INDEKSY WYDAJNOŚCIOWE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, is_current);
CREATE INDEX IF NOT EXISTS idx_amendments_effective ON amendments(effective_date);
CREATE INDEX IF NOT EXISTS idx_decisions_basis ON court_decisions(legal_basis);
