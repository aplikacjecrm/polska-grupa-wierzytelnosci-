// 🏢 BAZA POLSKICH TOWARZYSTW UBEZPIECZENIOWYCH
// Aktualizacja: 2025-11-08
// Największe TU w Polsce z pełnymi danymi kontaktowymi

window.polishInsuranceCompanies = [
    {
        id: 'pzu',
        name: 'PZU S.A.',
        fullName: 'Powszechny Zakład Ubezpieczeń S.A.',
        logo: '🔴',
        headquarters: {
            address: 'Al. Jana Pawła II 24, 00-133 Warszawa',
            city: 'Warszawa',
            postal: '00-133'
        },
        contact: {
            phone: '801 102 102',
            phoneAlt: '22 566 56 56',
            email: 'info@pzu.pl',
            website: 'https://www.pzu.pl',
            claimsHotline: '801 102 102',
            claimsEmail: 'szkody@pzu.pl'
        },
        claimsDepartment: {
            name: 'Departament Likwidacji Szkód',
            phone: '801 102 102',
            email: 'likwidacja@pzu.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: '9:00-14:00'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe', 'Zdrowotne', 'Życiowe'],
        marketShare: '35%',
        averageClaimTime: '30-45 dni',
        rating: 4.2,
        notes: 'Największe TU w Polsce. Długi czas likwidacji, ale wypłacają zgodnie z prawem.'
    },
    {
        id: 'warta',
        name: 'Warta S.A.',
        fullName: 'WARTA Towarzystwo Ubezpieczeń S.A.',
        logo: '🟢',
        headquarters: {
            address: 'ul. Chmielna 85/87, 00-805 Warszawa',
            city: 'Warszawa',
            postal: '00-805'
        },
        contact: {
            phone: '22 543 00 00',
            phoneAlt: '801 44 88 22',
            email: 'warta@warta.pl',
            website: 'https://www.warta.pl',
            claimsHotline: '801 44 88 22',
            claimsEmail: 'szkody.komunikacyjne@warta.pl'
        },
        claimsDepartment: {
            name: 'Centrum Likwidacji Szkód',
            phone: '801 44 88 22',
            email: 'szkody@warta.pl',
            hoursWeekday: '7:00-22:00',
            hoursSaturday: '8:00-20:00',
            hoursSunday: '9:00-17:00'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe', 'Assistance'],
        marketShare: '8%',
        averageClaimTime: '25-35 dni',
        rating: 4.1,
        notes: 'Szybka likwidacja szkód komunikacyjnych. Dobry kontakt.'
    },
    {
        id: 'ergo_hestia',
        name: 'Ergo Hestia',
        fullName: 'ERGO Hestia S.A.',
        logo: '🔵',
        headquarters: {
            address: 'ul. Hestii 1, 81-731 Sopot',
            city: 'Sopot',
            postal: '81-731'
        },
        contact: {
            phone: '58 555 55 55',
            phoneAlt: '801 107 107',
            email: 'kontakt@ergohestia.pl',
            website: 'https://www.ergohestia.pl',
            claimsHotline: '58 555 66 66',
            claimsEmail: 'szkody@ergohestia.pl'
        },
        claimsDepartment: {
            name: 'Departament Szkód',
            phone: '58 555 66 66',
            email: 'likwidacja.szkod@ergohestia.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: '9:00-15:00'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe', 'Zdrowotne'],
        marketShare: '7%',
        averageClaimTime: '28-40 dni',
        rating: 4.0,
        notes: 'Solidne TU. Wymaga kompletnej dokumentacji.'
    },
    {
        id: 'generali',
        name: 'Generali',
        fullName: 'Generali Towarzystwo Ubezpieczeń S.A.',
        logo: '🦁',
        headquarters: {
            address: 'ul. Postępu 15B, 02-676 Warszawa',
            city: 'Warszawa',
            postal: '02-676'
        },
        contact: {
            phone: '22 543 47 00',
            phoneAlt: '801 102 103',
            email: 'biuro.obslugi.klienta@generali.pl',
            website: 'https://www.generali.pl',
            claimsHotline: '22 543 47 01',
            claimsEmail: 'szkody@generali.pl'
        },
        claimsDepartment: {
            name: 'Centrum Szkód',
            phone: '801 120 120',
            email: 'centrum.szkod@generali.pl',
            hoursWeekday: '8:00-20:00',
            hoursSaturday: '9:00-16:00'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe', 'Życiowe'],
        marketShare: '6%',
        averageClaimTime: '30-45 dni',
        rating: 3.9,
        notes: 'Międzynarodowe TU. Profesjonalna obsługa.'
    },
    {
        id: 'allianz',
        name: 'Allianz',
        fullName: 'Allianz Polska S.A.',
        logo: '🔷',
        headquarters: {
            address: 'ul. Inflancka 4B, 00-189 Warszawa',
            city: 'Warszawa',
            postal: '00-189'
        },
        contact: {
            phone: '22 313 00 00',
            phoneAlt: '801 600 800',
            email: 'biuro@allianz.pl',
            website: 'https://www.allianz.pl',
            claimsHotline: '22 313 23 23',
            claimsEmail: 'szkody.komunikacyjne@allianz.pl'
        },
        claimsDepartment: {
            name: 'Dział Likwidacji Szkód',
            phone: '22 313 23 23',
            email: 'likwidacja@allianz.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe', 'Życiowe'],
        marketShare: '5%',
        averageClaimTime: '35-50 dni',
        rating: 3.8,
        notes: 'Wymagające TU. Często stosują redukcje.'
    },
    {
        id: 'link4',
        name: 'Link4',
        fullName: 'Link4 Towarzystwo Ubezpieczeń S.A.',
        logo: '🟡',
        headquarters: {
            address: 'ul. Inflancka 4B, 00-189 Warszawa',
            city: 'Warszawa',
            postal: '00-189'
        },
        contact: {
            phone: '22 444 44 44',
            phoneAlt: '801 900 900',
            email: 'kontakt@link4.pl',
            website: 'https://www.link4.pl',
            claimsHotline: '22 444 44 55',
            claimsEmail: 'szkody@link4.pl'
        },
        claimsDepartment: {
            name: 'Centrum Szkód',
            phone: '22 444 44 55',
            email: 'centrum.szkod@link4.pl',
            hoursWeekday: '8:00-20:00',
            hoursSaturday: '9:00-15:00'
        },
        types: ['OC', 'AC', 'NNW'],
        marketShare: '4%',
        averageClaimTime: '25-35 dni',
        rating: 4.3,
        notes: 'Szybka likwidacja online. Dobre ceny.'
    },
    {
        id: 'compensa',
        name: 'Compensa',
        fullName: 'Compensa Towarzystwo Ubezpieczeń S.A.',
        logo: '🟠',
        headquarters: {
            address: 'Al. Jerozolimskie 162, 02-342 Warszawa',
            city: 'Warszawa',
            postal: '02-342'
        },
        contact: {
            phone: '22 501 65 00',
            phoneAlt: '801 888 388',
            email: 'info@compensavie.pl',
            website: 'https://www.compensa.pl',
            claimsHotline: '801 888 388',
            claimsEmail: 'szkody@compensa.pl'
        },
        claimsDepartment: {
            name: 'Dział Szkód',
            phone: '801 888 388',
            email: 'likwidacja.szkod@compensa.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: '9:00-14:00'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe', 'Życiowe'],
        marketShare: '3%',
        averageClaimTime: '30-40 dni',
        rating: 3.7,
        notes: 'TU Grupy Vienna. Standardowa obsługa.'
    },
    {
        id: 'uniqa',
        name: 'Uniqa',
        fullName: 'UNIQA Towarzystwo Ubezpieczeń S.A.',
        logo: '🔴',
        headquarters: {
            address: 'ul. Chłodna 51, 00-867 Warszawa',
            city: 'Warszawa',
            postal: '00-867'
        },
        contact: {
            phone: '22 599 95 22',
            phoneAlt: '801 091 091',
            email: 'uniqa@uniqa.pl',
            website: 'https://www.uniqa.pl',
            claimsHotline: '22 599 95 55',
            claimsEmail: 'szkody@uniqa.pl'
        },
        claimsDepartment: {
            name: 'Centrum Likwidacji',
            phone: '801 091 091',
            email: 'likwidacja@uniqa.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe'],
        marketShare: '3%',
        averageClaimTime: '30-45 dni',
        rating: 3.9,
        notes: 'Austriackie TU. Rzetelna likwidacja.'
    },
    {
        id: 'wiener',
        name: 'Wiener',
        fullName: 'Wiener Towarzystwo Ubezpieczeń S.A.',
        logo: '🟣',
        headquarters: {
            address: 'ul. Przasnyska 6B, 01-756 Warszawa',
            city: 'Warszawa',
            postal: '01-756'
        },
        contact: {
            phone: '22 528 88 00',
            phoneAlt: '801 888 388',
            email: 'kontakt@wiener.pl',
            website: 'https://www.wiener.pl',
            claimsHotline: '22 528 88 88',
            claimsEmail: 'szkody@wiener.pl'
        },
        claimsDepartment: {
            name: 'Departament Szkód',
            phone: '22 528 88 88',
            email: 'likwidacja.szkod@wiener.pl',
            hoursWeekday: '8:00-17:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe'],
        marketShare: '2%',
        averageClaimTime: '35-45 dni',
        rating: 3.6,
        notes: 'TU Grupy Vienna. Wymaga dokładności.'
    },
    {
        id: 'interrisk',
        name: 'InterRisk',
        fullName: 'InterRisk Towarzystwo Ubezpieczeń S.A.',
        logo: '🟢',
        headquarters: {
            address: 'Al. Jerozolimskie 162, 02-342 Warszawa',
            city: 'Warszawa',
            postal: '02-342'
        },
        contact: {
            phone: '22 576 66 00',
            phoneAlt: '801 888 388',
            email: 'info@interrisk.pl',
            website: 'https://www.interrisk.pl',
            claimsHotline: '22 576 66 66',
            claimsEmail: 'szkody@interrisk.pl'
        },
        claimsDepartment: {
            name: 'Biuro Szkód',
            phone: '22 576 66 66',
            email: 'likwidacja@interrisk.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: '9:00-14:00'
        },
        types: ['OC', 'AC', 'NNW'],
        marketShare: '2%',
        averageClaimTime: '28-38 dni',
        rating: 3.8,
        notes: 'TU Grupy Vienna. Szybka likwidacja małych szkód.'
    },
    {
        id: 'axa',
        name: 'AXA',
        fullName: 'AXA Towarzystwo Ubezpieczeń i Reasekuracji S.A.',
        logo: '🔵',
        headquarters: {
            address: 'ul. Chłodna 51, 00-867 Warszawa',
            city: 'Warszawa',
            postal: '00-867'
        },
        contact: {
            phone: '22 555 00 00',
            phoneAlt: '801 102 102',
            email: 'axa@axa.pl',
            website: 'https://www.axa.pl',
            claimsHotline: '22 555 11 11',
            claimsEmail: 'szkody@axa.pl'
        },
        claimsDepartment: {
            name: 'Centrum Szkód',
            phone: '22 555 11 11',
            email: 'centrum.szkod@axa.pl',
            hoursWeekday: '8:00-20:00',
            hoursSaturday: '9:00-16:00'
        },
        types: ['OC', 'AC', 'NNW', 'Zdrowotne', 'Życiowe'],
        marketShare: '2%',
        averageClaimTime: '30-45 dni',
        rating: 3.9,
        notes: 'Międzynarodowy koncern. Profesjonalna obsługa.'
    },
    {
        id: 'proama',
        name: 'Proama',
        fullName: 'Proama Towarzystwo Ubezpieczeń S.A.',
        logo: '🟡',
        headquarters: {
            address: 'ul. Skarbka z Gór 44, 03-287 Warszawa',
            city: 'Warszawa',
            postal: '03-287'
        },
        contact: {
            phone: '22 517 44 00',
            phoneAlt: '801 333 444',
            email: 'biuro@proama.pl',
            website: 'https://www.proama.pl',
            claimsHotline: '22 517 44 44',
            claimsEmail: 'szkody@proama.pl'
        },
        claimsDepartment: {
            name: 'Dział Likwidacji',
            phone: '22 517 44 44',
            email: 'likwidacja@proama.pl',
            hoursWeekday: '8:00-17:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe'],
        marketShare: '1%',
        averageClaimTime: '35-50 dni',
        rating: 3.5,
        notes: 'Małe TU. Długi czas likwidacji.'
    },
    {
        id: 'hdi',
        name: 'HDI',
        fullName: 'HDI Asekuracja Towarzystwo Ubezpieczeń S.A.',
        logo: '🔴',
        headquarters: {
            address: 'ul. Wołoska 22A, 02-675 Warszawa',
            city: 'Warszawa',
            postal: '02-675'
        },
        contact: {
            phone: '22 333 88 00',
            phoneAlt: '801 000 444',
            email: 'hdi@hdi.pl',
            website: 'https://www.hdi.pl',
            claimsHotline: '22 333 88 88',
            claimsEmail: 'szkody@hdi.pl'
        },
        claimsDepartment: {
            name: 'Departament Likwidacji',
            phone: '22 333 88 88',
            email: 'likwidacja.szkod@hdi.pl',
            hoursWeekday: '8:00-18:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'Majątkowe', 'Odpowiedzialności'],
        marketShare: '1%',
        averageClaimTime: '30-40 dni',
        rating: 3.7,
        notes: 'Niemieckie TU. Specjalizacja w OC firm.'
    },
    {
        id: 'gothaer',
        name: 'Gothaer',
        fullName: 'Gothaer Towarzystwo Ubezpieczeń S.A.',
        logo: '🟢',
        headquarters: {
            address: 'ul. Wołoska 22A, 02-675 Warszawa',
            city: 'Warszawa',
            postal: '02-675'
        },
        contact: {
            phone: '22 482 82 00',
            phoneAlt: '801 888 666',
            email: 'kontakt@gothaer.pl',
            website: 'https://www.gothaer.pl',
            claimsHotline: '22 482 82 82',
            claimsEmail: 'szkody@gothaer.pl'
        },
        claimsDepartment: {
            name: 'Biuro Likwidacji Szkód',
            phone: '22 482 82 82',
            email: 'likwidacja@gothaer.pl',
            hoursWeekday: '8:00-17:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'NNW', 'Majątkowe'],
        marketShare: '1%',
        averageClaimTime: '35-45 dni',
        rating: 3.6,
        notes: 'Niemieckie TU. Solidna likwidacja.'
    },
    {
        id: 'trasti',
        name: 'Trasti',
        fullName: 'Trasti Towarzystwo Ubezpieczeń S.A.',
        logo: '🟣',
        headquarters: {
            address: 'ul. Inflancka 4B, 00-189 Warszawa',
            city: 'Warszawa',
            postal: '00-189'
        },
        contact: {
            phone: '22 541 03 00',
            phoneAlt: '801 600 800',
            email: 'kontakt@trasti.pl',
            website: 'https://www.trasti.pl',
            claimsHotline: '22 541 03 03',
            claimsEmail: 'szkody@trasti.pl'
        },
        claimsDepartment: {
            name: 'Dział Szkód',
            phone: '22 541 03 03',
            email: 'likwidacja.szkod@trasti.pl',
            hoursWeekday: '8:00-17:00',
            hoursSaturday: 'Zamknięte'
        },
        types: ['OC', 'AC', 'Cargo', 'Flotowe'],
        marketShare: '1%',
        averageClaimTime: '30-40 dni',
        rating: 3.5,
        notes: 'Specjalizacja w flotach i cargo.'
    }
];

// Funkcje pomocnicze
window.getInsuranceCompany = function(id) {
    return window.polishInsuranceCompanies.find(company => company.id === id);
};

window.searchInsuranceCompanies = function(query) {
    const q = query.toLowerCase();
    return window.polishInsuranceCompanies.filter(company => 
        company.name.toLowerCase().includes(q) ||
        company.fullName.toLowerCase().includes(q)
    );
};

window.getInsuranceCompaniesByType = function(type) {
    return window.polishInsuranceCompanies.filter(company => 
        company.types.includes(type)
    );
};

window.getTopInsuranceCompanies = function(limit = 5) {
    return window.polishInsuranceCompanies
        .sort((a, b) => parseFloat(b.marketShare) - parseFloat(a.marketShare))
        .slice(0, limit);
};

console.log('✅ Baza' + window.polishInsuranceCompanies.length + ' towarzystw ubezpieczeniowych załadowana!');
