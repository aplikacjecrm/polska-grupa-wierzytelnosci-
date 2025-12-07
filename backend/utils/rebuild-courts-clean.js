/**
 * PRZEBUDOWA PLIKU courts-database.js Z CZYSTYMI DANYMI
 * Naprawia wszystkie błędy składniowe związane z wieloliniowymi wartościami
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️ PRZEBUDOWA BAZY SĄDÓW...\n');

// Wczytaj oryginalny JSON
const jsonPath = path.join(__dirname, 'courts-imported.json');
const courtsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📥 Wczytano ${Object.keys(courtsData).length} sądów z JSON\n`);

// Funkcja do escapowania stringów (usuwa znaki nowej linii, tabulatory, etc.)
function cleanString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\n/g, ' ')  // Zamień enter na spację
    .replace(/\r/g, '')   // Usuń \r
    .replace(/\t/g, ' ')  // Zamień tab na spację
    .replace(/'/g, "\\'") // Escape apostrofy
    .replace(/\s+/g, ' ') // Zamień wielokrotne spacje na pojedynczą
    .trim();              // Usuń spacje z początku i końca
}

// Header pliku JS
let jsOutput = `/**
 * BAZA DANYCH SĄDÓW POWSZECHNYCH W POLSCE
 * Źródło: https://dane.gov.pl/pl/dataset/985,lista-sadow-powszechnych
 * Data importu: ${new Date().toLocaleDateString('pl-PL')}
 * Liczba sądów: ${Object.keys(courtsData).length}
 * 
 * UWAGA: Automatycznie wygenerowane - wszystkie wartości są escaped
 */

const COURTS_DATABASE = {\n`;

// Konwertuj każdy sąd z czyszczeniem stringów
Object.entries(courtsData).forEach(([id, court], index) => {
  const isLast = index === Object.keys(courtsData).length - 1;
  
  jsOutput += `  '${id}': {\n`;
  jsOutput += `    id: '${id}',\n`;
  jsOutput += `    name: '${cleanString(court.name)}',\n`;
  jsOutput += `    shortName: '${cleanString(court.shortName)}',\n`;
  jsOutput += `    type: '${court.type}',\n`;
  jsOutput += `    city: '${cleanString(court.city)}',\n`;
  jsOutput += `    address: '${cleanString(court.address)}',\n`;
  jsOutput += `    phone: '${cleanString(court.phone)}',\n`;
  jsOutput += `    email: '${cleanString(court.email)}',\n`;
  jsOutput += `    website: '${cleanString(court.website)}',\n`;
  jsOutput += `    coordinates: null, // TODO: Geocoding\n`;
  jsOutput += `    departments: [],\n`;
  jsOutput += `    suggestedFor: ['civil', 'criminal', 'family', 'labor', 'commercial']\n`;
  jsOutput += `  }${isLast ? '\n' : ',\n\n'}`;
  
  // Progress
  if ((index + 1) % 50 === 0) {
    console.log(`   Przetworzono ${index + 1} sądów...`);
  }
});

jsOutput += `};\n\n`;

// Dodaj funkcje pomocnicze
jsOutput += `// ============================================================
// FUNKCJE POMOCNICZE
// ============================================================

/**
 * Pobierz sąd po ID
 */
function getCourtById(courtId) {
  return COURTS_DATABASE[courtId] || null;
}

/**
 * Pobierz wszystkie sądy danego typu
 */
function getCourtsByType(type) {
  return Object.values(COURTS_DATABASE).filter(court => court.type === type);
}

/**
 * Pobierz wszystkie sądy w mieście
 */
function getCourtsByCity(city) {
  return Object.values(COURTS_DATABASE).filter(court => 
    court.city.toLowerCase().includes(city.toLowerCase())
  );
}

/**
 * Wyszukaj sądy po nazwie
 */
function searchCourts(query) {
  const lowerQuery = query.toLowerCase();
  return Object.values(COURTS_DATABASE).filter(court =>
    court.name.toLowerCase().includes(lowerQuery) ||
    court.city.toLowerCase().includes(lowerQuery) ||
    court.address.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Pobierz listę wszystkich sądów
 */
function getAllCourts() {
  return Object.values(COURTS_DATABASE);
}

/**
 * Pobierz listę miast z sądami
 */
function getCitiesWithCourts() {
  const cities = new Set();
  Object.values(COURTS_DATABASE).forEach(court => {
    if (court.city) cities.add(court.city);
  });
  return Array.from(cities).sort();
}

/**
 * Zasugeruj sądy dla danego typu sprawy
 */
function suggestCourtsForCaseType(caseType, city = null) {
  let courts = Object.values(COURTS_DATABASE);
  
  // Filtruj po typie sprawy (jeśli określono)
  if (caseType) {
    courts = courts.filter(court => 
      court.suggestedFor && court.suggestedFor.includes(caseType)
    );
  }
  
  // Filtruj po mieście (jeśli określono)
  if (city) {
    courts = courts.filter(court => 
      court.city.toLowerCase().includes(city.toLowerCase())
    );
  }
  
  return courts;
}

// ============================================================
// EKSPORT
// ============================================================

module.exports = {
  COURTS_DATABASE,
  getCourtById,
  getCourtsByType,
  getCourtsByCity,
  searchCourts,
  getAllCourts,
  getCitiesWithCourts,
  suggestCourtsForCaseType
};
`;

// Zapisz plik
const outputPath = path.join(__dirname, 'courts-database.js');
fs.writeFileSync(outputPath, jsOutput, 'utf-8');

console.log(`\n✅ Przebudowano plik: ${outputPath}`);
console.log(`📦 Wielkość: ${(jsOutput.length / 1024).toFixed(2)} KB\n`);

// Test ładowania
console.log('🔄 Testowanie poprawności składniowej...\n');

try {
  delete require.cache[outputPath];
  const courtsDb = require(outputPath);
  
  console.log(`✅ Plik ładuje się poprawnie!`);
  console.log(`📊 Liczba sądów: ${Object.keys(courtsDb.COURTS_DATABASE).length}`);
  console.log(`📋 Przykładowy sąd:`);
  const firstCourt = Object.values(courtsDb.COURTS_DATABASE)[0];
  console.log(`   Nazwa: ${firstCourt.name}`);
  console.log(`   Miasto: ${firstCourt.city}`);
  console.log(`   Telefon: ${firstCourt.phone}`);
  console.log(`\n🎉 PRZEBUDOWA ZAKOŃCZONA SUKCESEM!\n`);
  
} catch (err) {
  console.error('❌ Błąd ładowania pliku:');
  console.error(err.message);
  console.error(err.stack);
  console.error('\n❌ PRZEBUDOWA NIE POWIODŁA SIĘ\n');
  process.exit(1);
}
