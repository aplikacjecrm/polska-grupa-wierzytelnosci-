// 📁 GENERATOR PUSTYCH PLIKÓW DLA KODEKSÓW

const fs = require('fs');
const path = require('path');

const CODES = {
    'KC': {
        name: 'Kodeksu Cywilnego',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093'
    },
    'KPC': {
        name: 'Kodeksu Postępowania Cywilnego',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296'
    },
    'KK': {
        name: 'Kodeksu Karnego',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553'
    },
    'KPK': {
        name: 'Kodeksu Postępowania Karnego',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970890555'
    },
    'KP': {
        name: 'Kodeksu Pracy',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141'
    },
    'KRO': {
        name: 'Kodeksu Rodzinnego i Opiekuńczego',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640090059'
    },
    'KSH': {
        name: 'Kodeksu Spółek Handlowych',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20000941037'
    },
    'KPA': {
        name: 'Kodeksu Postępowania Administracyjnego',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19600300168'
    }
};

const TEMP_DIR = path.join(__dirname, '../temp');

console.log('\n📁 Tworzę pliki dla kodeksów...\n');

Object.keys(CODES).forEach(code => {
    const config = CODES[code];
    const filePath = path.join(TEMP_DIR, `${code}-full.txt`);
    
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${code}-full.txt - już istnieje`);
    } else {
        const template = `===============================================
TUTAJ WKLEJ CAŁY TEKST ${config.name.toUpperCase()}
===============================================

Źródło: ${config.url}

Jak skopiować:
1. Otwórz link powyżej
2. Kliknij "Tekst" lub skopiuj PDF
3. Zaznacz cały tekst (Ctrl+A)
4. Skopiuj (Ctrl+C)
5. USUŃ TEN TEKST
6. Wklej tutaj pełny tekst ${code} (Ctrl+V)
7. Zapisz (Ctrl+S)
8. Uruchom: node backend/scripts/import-single-code.js ${code}

===============================================
WKLEJ PONIŻEJ (usuń tę linię i wklej tekst)
===============================================
`;
        
        fs.writeFileSync(filePath, template, 'utf-8');
        console.log(`✨ ${code}-full.txt - utworzony`);
    }
});

console.log('\n✅ Gotowe!\n');
console.log('📋 Pliki znajdują się w: backend/temp/\n');
console.log('💡 Teraz:');
console.log('   1. Otwórz plik (np. KC-full.txt)');
console.log('   2. Wklej cały tekst');
console.log('   3. Uruchom import\n');
