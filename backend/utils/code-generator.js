// Uniwersalny generator kodów dla wszystkich elementów systemu

const { getDatabase } = require('../database/init');

/**
 * Mapowanie typów spraw na kody
 */
const CASE_TYPE_CODES = {
  'civil': 'CYW',
  'criminal': 'KAR',
  'family': 'ROD',
  'commercial': 'GOS',
  'administrative': 'ADM',
  'labor': 'PRA',
  'traffic': 'DRG',
  'international': 'MIE',
  'special': 'SPE',
  'other': 'INN'
};

/**
 * Pobierz dane sprawy i klienta
 */
async function getCaseData(caseId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        c.*,
        cl.first_name,
        cl.last_name
       FROM cases c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.id = ?`,
      [caseId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

/**
 * Generuj inicjały z imienia i nazwiska
 */
function generateInitials(firstName, lastName) {
  const first = (firstName || 'X').charAt(0).toUpperCase();
  const last = (lastName || 'X').charAt(0).toUpperCase();
  return `${first}${last}`;
}

/**
 * Policz elementy danego typu dla sprawy
 */
async function countElements(tableName, caseId, entityType = null) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    let query = `SELECT COUNT(*) as count FROM ${tableName} WHERE `;
    let params = [];
    
    // Różne tabele mają różne nazwy kolumn
    if (tableName === 'case_witnesses' || tableName === 'witness_testimonies' || tableName === 'case_evidence' || tableName === 'events') {
      query += 'case_id = ?';
      params = [caseId];
    } else if (tableName === 'attachments') {
      query += 'entity_type = ? AND entity_id IN (SELECT id FROM case_witnesses WHERE case_id = ?)';
      params = [entityType, caseId];
    } else {
      query += 'case_id = ?';
      params = [caseId];
    }
    
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
}

/**
 * GENERATOR GŁÓWNY - Uniwersalny kod
 * 
 * @param {string} elementType - Typ elementu (witness, document, evidence, event, cost, note)
 * @param {string} subType - Podtyp (np. POZ, ZDJ, ROZ)
 * @param {number} caseId - ID sprawy
 * @param {object} options - Dodatkowe opcje
 * @returns {Promise<object>} - Obiekt z kodem i metadanymi
 */
async function generateCode(elementType, subType, caseId, options = {}) {
  try {
    // 1. Pobierz dane sprawy
    const caseData = await getCaseData(caseId);
    
    if (!caseData) {
      throw new Error(`Sprawa o ID ${caseId} nie istnieje`);
    }
    
    // 2. Przygotuj składniki kodu
    const caseTypeCode = CASE_TYPE_CODES[caseData.case_type] || 'INN';
    const initials = generateInitials(caseData.first_name, caseData.last_name);
    
    // Usuń prefiks typu sprawy z case_number (np. "GOS/AA01/001" -> "AA01/001")
    let fullCaseNumber = caseData.case_number || 'SP-001/2025';
    const parts = fullCaseNumber.split('/');
    if (parts.length >= 3 && parts[0] === caseTypeCode) {
      // Jeśli case_number zawiera już prefiks typu (np. GOS/AA01/001), usuń go
      fullCaseNumber = parts.slice(1).join('/');
    }
    
    // 3. Policz istniejące elementy tego typu
    let count = 0;
    let prefix = '';
    
    switch (elementType) {
      case 'witness':
        prefix = 'ŚW';
        count = await countElements('case_witnesses', caseId);
        break;
        
      case 'document':
        prefix = `DOK/${subType}`;
        count = await countElements('attachments', caseId, 'document');
        break;
        
      case 'evidence':
        prefix = 'DOW';
        count = await countElements('case_evidence', caseId);
        break;
        
      case 'testimony':
        prefix = `ZEZ/${subType}`;
        count = await countElements('witness_testimonies', options.witnessId);
        break;
        
      case 'recording':
        // Nagrania dla konkretnego świadka
        prefix = 'NAG';
        count = await countElements('attachments', caseId, 'witness');
        break;
        
      case 'event':
        prefix = subType; // ROZ, SPO, TER, etc.
        count = await countElements('events', caseId);
        break;
        
      case 'cost':
        prefix = `KOS/${subType}`;
        count = await countElements('attachments', caseId, 'cost');
        break;
        
      case 'note':
        prefix = subType || 'NOT';
        count = await countElements('attachments', caseId, 'note');
        break;
        
      default:
        throw new Error(`Nieznany typ elementu: ${elementType}`);
    }
    
    // 4. Wygeneruj numer
    const elementNumber = String(count + 1).padStart(3, '0');
    
    // 5. Złóż kod
    let code;
    if (elementType === 'recording') {
      // NAG/001 - krótszy format dla nagrań
      code = `${prefix}/${elementNumber}`;
    } else if (elementType === 'witness') {
      // ŚW/[numer_sprawy]/[nr_porządkowy] - prosty format dla świadków
      code = `${prefix}/${fullCaseNumber}/${elementNumber}`;
    } else if (elementType === 'event') {
      // ROZ/[typ_sprawy]/[numer_sprawy]/[nr] - prosty format dla wydarzeń (BEZ inicjałów!)
      code = `${prefix}/${caseTypeCode}/${fullCaseNumber}/${elementNumber}`;
    } else {
      // Pełny format dla pozostałych (dokumenty, dowody, notatki)
      code = `${prefix}/${caseTypeCode}/${initials}/${fullCaseNumber}/${elementNumber}`;
    }
    
    console.log(`✅ Wygenerowano kod: ${code}`);
    
    return {
      code,
      prefix,
      caseTypeCode,
      initials,
      fullCaseNumber,
      elementNumber,
      elementType,
      subType
    };
    
  } catch (error) {
    console.error(`❌ Błąd generowania kodu:`, error);
    throw error;
  }
}

/**
 * POMOCNICZE FUNKCJE - Generatory dla konkretnych typów
 */

async function generateWitnessCode(caseId) {
  return generateCode('witness', null, caseId);
}

async function generateDocumentCode(caseId, documentType) {
  // documentType: POZ, ODP, WNI, WYR, etc.
  return generateCode('document', documentType, caseId);
}

async function generateEvidenceCode(caseId, evidenceType) {
  // evidenceType: DOK, ZDJ, VID, AUD, EKS, etc.
  return generateCode('evidence', evidenceType, caseId);
}

async function generateTestimonyCode(caseId, witnessId, testimonyType) {
  // testimonyType: PIS, UST, NAG
  return generateCode('testimony', testimonyType, caseId, { witnessId });
}

async function generateRecordingCode(caseId, witnessId) {
  return generateCode('recording', null, caseId, { witnessId });
}

async function generateEventCode(caseId, eventType) {
  // eventType: ROZ, SPO, TER, MED, NEG, etc.
  return generateCode('event', eventType, caseId);
}

async function generateCostCode(caseId, costType) {
  // costType: OPL, WYD, FAK, HON, etc.
  return generateCode('cost', costType, caseId);
}

async function generateNoteCode(caseId, noteType = 'NOT') {
  // noteType: NOT, MEM, STR, ANA, RAP
  return generateCode('note', noteType, caseId);
}

/**
 * PARSOWANIE KODU - Odczyt informacji z kodu
 */
function parseCode(code) {
  const parts = code.split('/');
  
  if (parts.length < 2) {
    return { valid: false, error: 'Nieprawidłowy format kodu' };
  }
  
  // Nagrania (NAG/001)
  if (parts[0] === 'NAG' && parts.length === 2) {
    return {
      valid: true,
      elementType: 'recording',
      prefix: 'NAG',
      elementNumber: parts[1]
    };
  }
  
  // Pełny format (PREFIX/TYP/INI/SPRAWA/NR)
  if (parts.length >= 5) {
    return {
      valid: true,
      prefix: parts[0],
      caseTypeCode: parts[1],
      initials: parts[2],
      caseNumber: `${parts[3]}/${parts[4]}`,
      elementNumber: parts[5] || '001'
    };
  }
  
  return { valid: false, error: 'Nierozpoznany format kodu' };
}

module.exports = {
  generateCode,
  generateWitnessCode,
  generateDocumentCode,
  generateEvidenceCode,
  generateTestimonyCode,
  generateRecordingCode,
  generateEventCode,
  generateCostCode,
  generateNoteCode,
  parseCode,
  CASE_TYPE_CODES
};
