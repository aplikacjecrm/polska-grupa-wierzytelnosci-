-- ============================================
-- MIGRACJA 007: Integracja HR z Ticketami
-- Data: 2025-11-25
-- Dodaje powiązania między HR a systemem ticketów
-- ============================================

-- Dodaj kolumnę ticket_id do employee_vacations
ALTER TABLE employee_vacations ADD COLUMN ticket_id INTEGER REFERENCES tickets(id);

-- Dodaj kolumnę ticket_id do employee_training (szkolenia przez tickety)
ALTER TABLE employee_training ADD COLUMN ticket_id INTEGER REFERENCES tickets(id);

-- Dodaj kolumnę ticket_id do employee_documents (dokumenty przez tickety)
ALTER TABLE employee_documents ADD COLUMN ticket_id INTEGER REFERENCES tickets(id);

-- Indeksy dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_vacations_ticket ON employee_vacations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_training_ticket ON employee_training(ticket_id);
CREATE INDEX IF NOT EXISTS idx_documents_ticket ON employee_documents(ticket_id);

-- Dodaj kategorie HR do tabeli tickets (jeśli nie istnieją)
-- Kategorie ticketów:
-- 'hr_vacation' - Wnioski urlopowe
-- 'hr_training' - Wnioski o szkolenie
-- 'hr_document' - Prośby o dokumenty
-- 'hr_benefit' - Wnioski o benefity
-- 'hr_salary' - Sprawy wynagrodzeń
