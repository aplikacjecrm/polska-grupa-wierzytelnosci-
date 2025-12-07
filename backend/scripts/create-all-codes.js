// 📁 GENERATOR PLIKÓW DLA WSZYSTKICH AKTÓW PRAWNYCH

const fs = require('fs');
const path = require('path');

// ============================================================
// KOMPLETNA LISTA AKTÓW PRAWNYCH W POLSCE
// ============================================================

const LEGAL_ACTS = {
    // ========== KODEKSY (11) ==========
    'KODEKSY': {
        'KC': {
            name: 'Kodeks cywilny',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093',
            priority: 1
        },
        'KPC': {
            name: 'Kodeks postępowania cywilnego',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296',
            priority: 2
        },
        'KK': {
            name: 'Kodeks karny',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553',
            priority: 3
        },
        'KPK': {
            name: 'Kodeks postępowania karnego',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970890555',
            priority: 4
        },
        'KP': {
            name: 'Kodeks pracy',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141',
            priority: 5
        },
        'KRO': {
            name: 'Kodeks rodzinny i opiekuńczy',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640090059',
            priority: 6
        },
        'KSH': {
            name: 'Kodeks spółek handlowych',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20000941037',
            priority: 7
        },
        'KPA': {
            name: 'Kodeks postępowania administracyjnego',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19600300168',
            priority: 8
        },
        'KW': {
            name: 'Kodeks wykroczeń',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19710120114',
            priority: 9
        },
        'KKW': {
            name: 'Kodeks karny wykonawczy',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970900557',
            priority: 10
        },
        'KKS': {
            name: 'Kodeks karny skarbowy',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19990101116',
            priority: 11
        }
    },
    
    // ========== PROCEDURY SĄDOWE (3) ==========
    'PROCEDURY': {
        'PPSA': {
            name: 'Prawo o postępowaniu przed sądami administracyjnymi',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20020531532',
            priority: 12
        },
        'PKC': {
            name: 'Prawo o postępowaniu przed Trybunałem Konstytucyjnym',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20151000001',
            priority: 13
        },
        'PSP': {
            name: 'Prawo o ustroju sądów powszechnych',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010980001',
            priority: 14
        }
    },
    
    // ========== KODEKSY SPECJALNE (5) ==========
    'SPECJALNE': {
        'KW_WYBORCZY': {
            name: 'Kodeks wyborczy',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20110210112',
            priority: 15
        },
        'KM': {
            name: 'Kodeks morski',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010380001',
            priority: 16
        },
        'PRD': {
            name: 'Prawo o ruchu drogowym',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970980602',
            priority: 17
        },
        'LOTNICZE': {
            name: 'Prawo lotnicze',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20020130128',
            priority: 18
        },
        'MORSKIE': {
            name: 'Prawo morskie',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20020470414',
            priority: 19
        }
    },
    
    // ========== PRAWO GOSPODARCZE (10) ==========
    'GOSPODARCZE': {
        'DG': {
            name: 'Prawo działalności gospodarczej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20181000001',
            priority: 20
        },
        'UOKIK': {
            name: 'Ustawa o ochronie konkurencji i konsumentów',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20070500331',
            priority: 21
        },
        'BANKOWE': {
            name: 'Prawo bankowe',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19971400001',
            priority: 22
        },
        'UPADLOSCIOWE': {
            name: 'Prawo upadłościowe',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20030600535',
            priority: 23
        },
        'RESTRUKTURYZACYJNE': {
            name: 'Prawo restrukturyzacyjne',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20150000001',
            priority: 24
        },
        'WLASNOSC_PRZEMYSLOWA': {
            name: 'Prawo własności przemysłowej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010490508',
            priority: 25
        },
        'AUTORSKIE': {
            name: 'Prawo autorskie i prawa pokrewne',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19940240083',
            priority: 26
        },
        'ZAMOWIENIA': {
            name: 'Prawo zamówień publicznych',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20190002019',
            priority: 27
        },
        'PODATKOWE': {
            name: 'Ordynacja podatkowa',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970001137',
            priority: 28
        },
        'VAT': {
            name: 'Ustawa o VAT',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20040540535',
            priority: 29
        }
    },
    
    // ========== PRAWO NIERUCHOMOŚCI (5) ==========
    'NIERUCHOMOSCI': {
        'KSIEGI_WIECZYSTE': {
            name: 'Ustawa o księgach wieczystych i hipotece',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19820190147',
            priority: 30
        },
        'GOSPODARKA_NIERUCHOMOSCIAMI': {
            name: 'Ustawa o gospodarce nieruchomościami',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19971150741',
            priority: 31
        },
        'OCHRONA_LOKATOROW': {
            name: 'Ustawa o ochronie praw lokatorów',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010710733',
            priority: 32
        },
        'PRAWO_BUDOWLANE': {
            name: 'Prawo budowlane',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19940890414',
            priority: 33
        },
        'PLANOWANIE_PRZESTRZENNE': {
            name: 'Ustawa o planowaniu i zagospodarowaniu przestrzennym',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20030800717',
            priority: 34
        }
    },
    
    // ========== PRAWO RODZINNE I SOCJALNE (8) ==========
    'SOCJALNE': {
        'ALIMENTY': {
            name: 'Ustawa o pomocy osobom uprawnionym do alimentów',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20070001907',
            priority: 35
        },
        'SWIADCZENIA_RODZINNE': {
            name: 'Ustawa o świadczeniach rodzinnych',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20031390001',
            priority: 36
        },
        'UBEZPIECZENIA_SPOLECZNE': {
            name: 'Ustawa o systemie ubezpieczeń społecznych',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19981370887',
            priority: 37
        },
        'EMERYTURA': {
            name: 'Ustawa o emeryturach i rentach',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19981621118',
            priority: 38
        },
        'PRZECIWDZIALANIE_PRZEMOCY': {
            name: 'Ustawa o przeciwdziałaniu przemocy w rodzinie',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20052181493',
            priority: 39
        },
        'OPIEKA_NAD_DZIECMI': {
            name: 'Ustawa o wspieraniu rodziny i systemie pieczy zastępczej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20110000149',
            priority: 40
        },
        'POMOC_SPOLECZNA': {
            name: 'Ustawa o pomocy społecznej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20040640593',
            priority: 41
        },
        'REHABILITACJA': {
            name: 'Ustawa o rehabilitacji zawodowej i społecznej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970001230',
            priority: 42
        }
    },
    
    // ========== OCHRONA DANYCH I PRYWATNOŚĆ (3) ==========
    'DANE': {
        'RODO_PL': {
            name: 'Ustawa o ochronie danych osobowych',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20180001000',
            priority: 43
        },
        'CYBERBEZPIECZENSTWO': {
            name: 'Ustawa o krajowym systemie cyberbezpieczeństwa',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20180001560',
            priority: 44
        },
        'E_USLUGI': {
            name: 'Ustawa o świadczeniu usług drogą elektroniczną',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20021440001',
            priority: 45
        }
    },
    
    // ========== PRAWO MEDYCZNE (4) ==========
    'MEDYCZNE': {
        'ZAWODY_MEDYCZNE': {
            name: 'Ustawa o zawodach lekarza i lekarza dentysty',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19961360857',
            priority: 46
        },
        'PRAWA_PACJENTA': {
            name: 'Ustawa o prawach pacjenta i Rzeczniku Praw Pacjenta',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20082340001',
            priority: 47
        },
        'NFZ': {
            name: 'Ustawa o świadczeniach opieki zdrowotnej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20040210164',
            priority: 48
        },
        'ZAWODY_PIELEGNIARKI': {
            name: 'Ustawa o zawodach pielęgniarki i położnej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20110000174',
            priority: 49
        }
    },
    
    // ========== SAMORZĄD I ADMINISTRACJA (5) ==========
    'SAMORZAD': {
        'SAMORZAD_GMINNY': {
            name: 'Ustawa o samorządzie gminnym',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19900160095',
            priority: 50
        },
        'SAMORZAD_POWIATOWY': {
            name: 'Ustawa o samorządzie powiatowym',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19980910578',
            priority: 51
        },
        'SAMORZAD_WOJEWODZTWA': {
            name: 'Ustawa o samorządzie województwa',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19980910576',
            priority: 52
        },
        'SLUZBACYWILNA': {
            name: 'Ustawa o służbie cywilnej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20080000227',
            priority: 53
        },
        'DOSTEP_DO_INFORMACJI': {
            name: 'Ustawa o dostępie do informacji publicznej',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010001112',
            priority: 54
        }
    },
    
    // ========== OCHRONA ŚRODOWISKA (4) ==========
    'SRODOWISKO': {
        'PRAWO_OCHRONY_SRODOWISKA': {
            name: 'Prawo ochrony środowiska',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010620627',
            priority: 55
        },
        'ODPADY': {
            name: 'Ustawa o odpadach',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20130000021',
            priority: 56
        },
        'PRAWO_WODNE': {
            name: 'Prawo wodne',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20170001566',
            priority: 57
        },
        'LASY': {
            name: 'Ustawa o lasach',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19910101443',
            priority: 58
        }
    },
    
    // ========== EDUKACJA (3) ==========
    'EDUKACJA': {
        'PRAWO_OSWIATOWE': {
            name: 'Prawo oświatowe',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20170001148',
            priority: 59
        },
        'SZKOLNICTWO_WYZSZE': {
            name: 'Prawo o szkolnictwie wyższym i nauce',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20180001668',
            priority: 60
        },
        'KARTA_NAUCZYCIELA': {
            name: 'Karta Nauczyciela',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19820000261',
            priority: 61
        }
    }
};

// Policz wszystkie
let totalCount = 0;
Object.values(LEGAL_ACTS).forEach(category => {
    totalCount += Object.keys(category).length;
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log(`║         📚 GENERATOR ${String(totalCount).padStart(2)} AKTÓW PRAWNYCH 📚                    ║`);
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const TEMP_DIR = path.join(__dirname, '../temp');

let created = 0;
let existing = 0;

Object.entries(LEGAL_ACTS).forEach(([categoryName, codes]) => {
    console.log(`\n📁 ${categoryName}:\n`);
    
    Object.entries(codes).forEach(([code, config]) => {
        const filePath = path.join(TEMP_DIR, `${code}-full.txt`);
        
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${code.padEnd(25)} - już istnieje`);
            existing++;
        } else {
            const template = `===============================================
TUTAJ WKLEJ CAŁY TEKST: ${config.name.toUpperCase()}
===============================================

Źródło: ${config.url}

Priorytet: ${config.priority}

Jak skopiować:
1. Otwórz link powyżej
2. Kliknij "Tekst" lub skopiuj PDF
3. Zaznacz cały tekst (Ctrl+A)
4. Skopiuj (Ctrl+C)
5. USUŃ TEN TEKST
6. Wklej tutaj pełny tekst (Ctrl+V)
7. Zapisz (Ctrl+S)
8. Uruchom: node backend/scripts/import-single-code.js ${code}

===============================================
WKLEJ PONIŻEJ (usuń tę linię i wklej tekst)
===============================================
`;
            
            fs.writeFileSync(filePath, template, 'utf-8');
            console.log(`   ✨ ${code.padEnd(25)} - utworzony`);
            created++;
        }
    });
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║                     ✅ GOTOWE! ✅                            ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log(`║  Utworzono:  ${String(created).padStart(3)} nowych plików                            ║`);
console.log(`║  Istniało:   ${String(existing).padStart(3)} plików                                  ║`);
console.log(`║  RAZEM:      ${String(totalCount).padStart(3)} aktów prawnych!                         ║`);
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('📋 Pliki znajdują się w: backend/temp/\n');
console.log('💡 Zalecana kolejność wklejania (priorytet):\n');

// Sortuj po priorytecie
const allActs = [];
Object.values(LEGAL_ACTS).forEach(category => {
    Object.entries(category).forEach(([code, config]) => {
        allActs.push({ code, ...config });
    });
});

allActs.sort((a, b) => a.priority - b.priority);

allActs.slice(0, 15).forEach(act => {
    console.log(`   ${String(act.priority).padStart(2)}. ${act.code.padEnd(25)} - ${act.name}`);
});

console.log('\n   ...i ${totalCount - 15} innych\n');
