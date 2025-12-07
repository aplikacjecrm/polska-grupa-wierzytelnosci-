/**
 * SKRYPT IMPORTU DANYCH SĄDÓW Z OFICJALNYCH PLIKÓW
 * Źródło: https://dane.gov.pl/pl/dataset/985,lista-sadow-powszechnych
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Funkcja do normalizacji nazw sądów (dla kluczy ID)
function normalizeCourtId(name) {
  return name
    .replace(/Sąd\s+(Apelacyjny|Okręgowy|Rejonowy)\s+/gi, '')
    .replace(/\s+w\s+/gi, '_')
    .replace(/\s+dla\s+/gi, '_')
    .replace(/\s+-\s+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Funkcja do określenia typu sądu
function getCourtType(name) {
  if (name.includes('Apelacyjny')) return 'apelacyjny';
  if (name.includes('Okręgowy')) return 'okręgowy';
  if (name.includes('Rejonowy')) return 'rejonowy';
  return 'unknown';
}

// Funkcja do wyodrębnienia miasta z nazwy sądu
function getCityFromName(name) {
  const match = name.match(/w\s+([A-ZĆŁŚŹŻ][a-ząćęłńóśźż-]+(?:\s+[A-ZĆŁŚŹŻ][a-ząćęłńóśźż-]+)*)/);
  return match ? match[1] : '';
}

console.log('🏛️ IMPORT DANYCH SĄDÓW - START\n');

// ============================================================
// KROK 1: WCZYTAJ DANE TELEADRESOWE
// ============================================================
console.log('📋 KROK 1: Wczytywanie danych teleadresowych...');

const teleadresoweFile = path.join(__dirname, 'Dane_teleadresowe_sądów_-_sierpień_2025_r.xlsx');
const workbookTele = XLSX.readFile(teleadresoweFile);
const sheetNameTele = workbookTele.SheetNames[0];
const worksheetTele = workbookTele.Sheets[sheetNameTele];
const dataTele = XLSX.utils.sheet_to_json(worksheetTele);

console.log(`✅ Wczytano ${dataTele.length} rekordów z danych teleadresowych\n`);

// Przykładowy wiersz (aby zobaczyć strukturę)
console.log('📄 Przykładowy wiersz (pierwsze 3 kolumny):');
if (dataTele.length > 0) {
  const firstRow = dataTele[0];
  const keys = Object.keys(firstRow).slice(0, 5);
  keys.forEach(key => {
    console.log(`   ${key}: ${firstRow[key]}`);
  });
  console.log('');
}

// ============================================================
// KROK 2: WCZYTAJ STRUKTURĘ SĄDÓW (hierarchia)
// ============================================================
console.log('📋 KROK 2: Wczytywanie struktury sądów...');

const strukturaFile = path.join(__dirname, 'struktura_sądów_powszechnych_luty_2025_r..xls');
const workbookStruktura = XLSX.readFile(strukturaFile);
const sheetNameStruktura = workbookStruktura.SheetNames[0];
const worksheetStruktura = workbookStruktura.Sheets[sheetNameStruktura];
const dataStruktura = XLSX.utils.sheet_to_json(worksheetStruktura);

console.log(`✅ Wczytano ${dataStruktura.length} rekordów ze struktury\n`);

// ============================================================
// KROK 3: WCZYTAJ WŁAŚCIWOŚĆ MIEJSCOWĄ
// ============================================================
console.log('📋 KROK 3: Wczytywanie właściwości miejscowej...');

const wlasciwoscFile = path.join(__dirname, 'właściwość_sądów_powszechnych_luty_2025_r.xls');
const workbookWlasciwosc = XLSX.readFile(wlasciwoscFile);
const sheetNameWlasciwosc = workbookWlasciwosc.SheetNames[0];
const worksheetWlasciwosc = workbookWlasciwosc.Sheets[sheetNameWlasciwosc];
const dataWlasciwosc = XLSX.utils.sheet_to_json(worksheetWlasciwosc);

console.log(`✅ Wczytano ${dataWlasciwosc.length} rekordów z właściwości miejscowej\n`);

// ============================================================
// KROK 4: PRZETWARZANIE I ŁĄCZENIE DANYCH
// ============================================================
console.log('🔄 KROK 4: Przetwarzanie i łączenie danych...\n');

const courtsDatabase = {};
let processedCount = 0;

// Przetwórz dane teleadresowe (główne źródło)
dataTele.forEach((row, index) => {
  // Znajdź kolumnę z nazwą sądu (może mieć różne nazwy)
  const possibleNameKeys = Object.keys(row).filter(key => 
    key.toLowerCase().includes('nazwa') || 
    key.toLowerCase().includes('sąd') ||
    key === '__EMPTY' // Pierwsza kolumna w niektórych plikach
  );
  
  const nameKey = possibleNameKeys[0];
  const courtName = row[nameKey];
  
  if (!courtName || typeof courtName !== 'string') return;
  
  // Generuj ID
  const courtId = normalizeCourtId(courtName);
  const courtType = getCourtType(courtName);
  // Użyj miasta z kolumny "Miejscowość" zamiast wyciągać z nazwy
  const city = row['Miejscowość'] || getCityFromName(courtName);
  
  // Pobierz dane - BEZPOŚREDNIE MAPOWANIE KOLUMN Z EXCEL!
  const street = row['Ulica'] || '';
  const postalCode = row['Kod pocztowy'] || '';
  const cityName = row['Miejscowość'] || '';
  
  // Złóż pełny adres
  let fullAddress = '';
  if (street && postalCode && cityName) {
    fullAddress = `${street}, ${postalCode} ${cityName}`;
  } else if (street && cityName) {
    fullAddress = `${street}, ${cityName}`;
  } else if (street) {
    fullAddress = street;
  }
  
  const phone = (row['Telefon '] || row['Telefon'] || '').toString().trim();
  const email = (row['E-mail  '] || row['E-mail'] || row['Email'] || '').toString().trim();
  
  const address = fullAddress;
  
  // Wygeneruj poprawną stronę WWW z emaila (np. xxx@warszawa.sr.gov.pl → https://warszawa.sr.gov.pl)
  let website = '';
  if (email && email.includes('@')) {
    const domain = email.split('@')[1];
    if (domain) {
      website = `https://${domain}`;
    }
  }
  // Fallback: użyj miasta w mianowniku
  if (!website && city) {
    const cityNormalized = city.toLowerCase()
      .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
      .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
      .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
      .replace(/\s+/g, '-');
    const typePrefix = courtType === 'rejonowy' ? 'sr' : courtType === 'okregowy' ? 'so' : 'sa';
    website = `https://${cityNormalized}.${typePrefix}.gov.pl`;
  }
  
  // Utwórz obiekt sądu
  courtsDatabase[courtId] = {
    id: courtId,
    name: courtName,
    shortName: courtName.replace('Sąd ', 'S').replace('Rejonowy', 'R').replace('Okręgowy', 'O').replace('Apelacyjny', 'A'),
    type: courtType,
    city: city,
    address: address || '',
    phone: phone || '',
    email: email || '',
    website: website,
    coordinates: null, // Będzie uzupełnione geocodingiem
    departments: [],
    suggestedFor: []
  };
  
  processedCount++;
  
  // Log co 50 sądów
  if (processedCount % 50 === 0) {
    console.log(`   Przetworzono ${processedCount} sądów...`);
  }
});

console.log(`\n✅ Przetworzono łącznie ${processedCount} sądów\n`);

// ============================================================
// KROK 5: ZAPISZ DO PLIKU JSON (na początek)
// ============================================================
console.log('💾 KROK 5: Zapisywanie do pliku JSON...\n');

const outputPath = path.join(__dirname, 'courts-imported.json');
fs.writeFileSync(outputPath, JSON.stringify(courtsDatabase, null, 2), 'utf-8');

console.log(`✅ Zapisano do: ${outputPath}`);
console.log(`📊 Łączna liczba sądów: ${Object.keys(courtsDatabase).length}\n`);

// Statystyki
const stats = {
  apelacyjne: 0,
  okregowe: 0,
  rejonowe: 0,
  withEmail: 0,
  withPhone: 0,
  withWebsite: 0
};

Object.values(courtsDatabase).forEach(court => {
  if (court.type === 'apelacyjny') stats.apelacyjne++;
  if (court.type === 'okręgowy') stats.okregowe++;
  if (court.type === 'rejonowy') stats.rejonowe++;
  if (court.email) stats.withEmail++;
  if (court.phone) stats.withPhone++;
  if (court.website) stats.withWebsite++;
});

console.log('📊 STATYSTYKI:');
console.log(`   Sądy Apelacyjne: ${stats.apelacyjne}`);
console.log(`   Sądy Okręgowe: ${stats.okregowe}`);
console.log(`   Sądy Rejonowe: ${stats.rejonowe}`);
console.log(`   Z emailem: ${stats.withEmail}`);
console.log(`   Z telefonem: ${stats.withPhone}`);
console.log(`   Z stroną WWW: ${stats.withWebsite}`);

console.log('\n🎉 IMPORT ZAKOŃCZONY SUKCESEM!\n');
console.log('📝 NASTĘPNE KROKI:');
console.log('   1. Sprawdź plik courts-imported.json');
console.log('   2. Jeśli dane wyglądają OK, uruchom skrypt konwersji do JS');
console.log('   3. Opcjonalnie: dodaj geocoding dla współrzędnych GPS\n');
