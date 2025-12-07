/**
 * KONWERSJA ZAIMPORTOWANYCH DANYCH DO FORMATU JS
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 KONWERSJA JSON → JavaScript...\n');

// Wczytaj JSON
const inputPath = path.join(__dirname, 'courts-imported.json');
const courtsData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Header pliku JS
let jsOutput = `/**
 * BAZA DANYCH SĄDÓW POWSZECHNYCH W POLSCE
 * Źródło: https://dane.gov.pl/pl/dataset/985,lista-sadow-powszechnych
 * Data importu: ${new Date().toLocaleDateString('pl-PL')}
 * Liczba sądów: ${Object.keys(courtsData).length}
 */

const COURTS_DATABASE = {\n`;

// Konwertuj każdy sąd
Object.entries(courtsData).forEach(([id, court], index) => {
  const isLast = index === Object.keys(courtsData).length - 1;
  
  jsOutput += `  '${id}': {\n`;
  jsOutput += `    id: '${id}',\n`;
  jsOutput += `    name: '${court.name.replace(/'/g, "\\'")}',\n`;
  jsOutput += `    shortName: '${court.shortName.replace(/'/g, "\\'")}',\n`;
  jsOutput += `    type: '${court.type}',\n`;
  jsOutput += `    city: '${court.city}',\n`;
  jsOutput += `    address: '${court.address}',\n`;
  jsOutput += `    phone: '${court.phone}',\n`;
  jsOutput += `    email: '${court.email}',\n`;
  jsOutput += `    website: '${court.website}',\n`;
  jsOutput += `    coordinates: null, // TODO: Geocoding\n`;
  jsOutput += `    departments: [],\n`;
  jsOutput += `    suggestedFor: ['civil', 'criminal', 'family', 'labor', 'commercial']\n`;
  jsOutput += `  }${isLast ? '\n' : ',\n\n'}`;
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
  getCitiesWithCourts
};
`;

// Zapisz plik
const outputPath = path.join(__dirname, 'courts-database-imported.js');
fs.writeFileSync(outputPath, jsOutput, 'utf-8');

console.log(`✅ Zapisano do: ${outputPath}`);
console.log(`📊 Wygenerowano ${Object.keys(courtsData).length} obiektów sądów`);
console.log(`📦 Wielkość pliku: ${(jsOutput.length / 1024).toFixed(2)} KB\n`);

console.log('🎉 KONWERSJA ZAKOŃCZONA!\n');
console.log('📝 NASTĘPNE KROKI:');
console.log('   1. Sprawdź plik courts-database-imported.js');
console.log('   2. Zastąp nim obecny courts-database.js');
console.log('   3. Restart backendu (npm start)');
console.log('   4. Test w przeglądarce!\n');
