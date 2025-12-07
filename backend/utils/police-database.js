/**
 * BAZA DANYCH KOMEND POLICJI W POLSCE
 * Źródło: https://www.policja.pl
 * Data: 07.11.2024
 */

const POLICE_DATABASE = {
  // ==================== KOMENDY WOJEWÓDZKIE (16) ====================
  
  kw_warszawa: {
    id: 'kw_warszawa',
    name: 'Komenda Wojewódzka Policji w Warszawie',
    shortName: 'KWP Warszawa',
    type: 'wojewodzka',
    city: 'Warszawa',
    voivodeship: 'mazowieckie',
    address: 'ul. Nowolipie 2, 00-150 Warszawa',
    phone: '(22) 603 11 11',
    email: 'kwp.warszawa@policja.gov.pl',
    website: 'https://warszawa.policja.gov.pl'
  },
  
  kw_krakow: {
    id: 'kw_krakow',
    name: 'Komenda Wojewódzka Policji w Krakowie',
    shortName: 'KWP Kraków',
    type: 'wojewodzka',
    city: 'Kraków',
    voivodeship: 'małopolskie',
    address: 'ul. Mogilska 109, 31-571 Kraków',
    phone: '(12) 615 45 55',
    email: 'kwp.krakow@policja.gov.pl',
    website: 'https://krakow.policja.gov.pl'
  },
  
  kw_wroclaw: {
    id: 'kw_wroclaw',
    name: 'Komenda Wojewódzka Policji we Wrocławiu',
    shortName: 'KWP Wrocław',
    type: 'wojewodzka',
    city: 'Wrocław',
    voivodeship: 'dolnośląskie',
    address: 'ul. Podwale 31-33, 50-040 Wrocław',
    phone: '(71) 344 74 00',
    email: 'kwp.wroclaw@policja.gov.pl',
    website: 'https://wroclaw.policja.gov.pl'
  },
  
  kw_poznan: {
    id: 'kw_poznan',
    name: 'Komenda Wojewódzka Policji w Poznaniu',
    shortName: 'KWP Poznań',
    type: 'wojewodzka',
    city: 'Poznań',
    voivodeship: 'wielkopolskie',
    address: 'ul. Kochanowskiego 2a, 60-844 Poznań',
    phone: '(61) 841 57 00',
    email: 'kwp.poznan@policja.gov.pl',
    website: 'https://poznan.policja.gov.pl'
  },
  
  kw_gdansk: {
    id: 'kw_gdansk',
    name: 'Komenda Wojewódzka Policji w Gdańsku',
    shortName: 'KWP Gdańsk',
    type: 'wojewodzka',
    city: 'Gdańsk',
    voivodeship: 'pomorskie',
    address: 'ul. Okopowa 15, 80-819 Gdańsk',
    phone: '(58) 326 65 00',
    email: 'kwp.gdansk@policja.gov.pl',
    website: 'https://gdansk.policja.gov.pl'
  },
  
  kw_katowice: {
    id: 'kw_katowice',
    name: 'Komenda Wojewódzka Policji w Katowicach',
    shortName: 'KWP Katowice',
    type: 'wojewodzka',
    city: 'Katowice',
    voivodeship: 'śląskie',
    address: 'ul. Lompy 19, 40-038 Katowice',
    phone: '(32) 209 21 00',
    email: 'kwp.katowice@policja.gov.pl',
    website: 'https://katowice.policja.gov.pl'
  },
  
  kw_lodz: {
    id: 'kw_lodz',
    name: 'Komenda Wojewódzka Policji w Łodzi',
    shortName: 'KWP Łódź',
    type: 'wojewodzka',
    city: 'Łódź',
    voivodeship: 'łódzkie',
    address: 'ul. Lutomierska 108/112, 91-048 Łódź',
    phone: '(42) 665 71 11',
    email: 'kwp.lodz@policja.gov.pl',
    website: 'https://lodz.policja.gov.pl'
  },
  
  kw_lublin: {
    id: 'kw_lublin',
    name: 'Komenda Wojewódzka Policji w Lublinie',
    shortName: 'KWP Lublin',
    type: 'wojewodzka',
    city: 'Lublin',
    voivodeship: 'lubelskie',
    address: 'ul. Grenadierów 3, 20-331 Lublin',
    phone: '(81) 535 21 11',
    email: 'kwp.lublin@policja.gov.pl',
    website: 'https://lublin.policja.gov.pl'
  },
  
  kw_szczecin: {
    id: 'kw_szczecin',
    name: 'Komenda Wojewódzka Policji w Szczecinie',
    shortName: 'KWP Szczecin',
    type: 'wojewodzka',
    city: 'Szczecin',
    voivodeship: 'zachodniopomorskie',
    address: 'ul. Małopolska 47, 70-515 Szczecin',
    phone: '(91) 439 31 11',
    email: 'kwp.szczecin@policja.gov.pl',
    website: 'https://szczecin.policja.gov.pl'
  },
  
  kw_bialystok: {
    id: 'kw_bialystok',
    name: 'Komenda Wojewódzka Policji w Białymstoku',
    shortName: 'KWP Białystok',
    type: 'wojewodzka',
    city: 'Białystok',
    voivodeship: 'podlaskie',
    address: 'ul. Sienkiewicza 65, 15-005 Białystok',
    phone: '(85) 869 01 11',
    email: 'kwp.bialystok@policja.gov.pl',
    website: 'https://bialystok.policja.gov.pl'
  },
  
  kw_bydgoszcz: {
    id: 'kw_bydgoszcz',
    name: 'Komenda Wojewódzka Policji w Bydgoszczy',
    shortName: 'KWP Bydgoszcz',
    type: 'wojewodzka',
    city: 'Bydgoszcz',
    voivodeship: 'kujawsko-pomorskie',
    address: 'ul. Powstańców Wielkopolskich 7, 85-090 Bydgoszcz',
    phone: '(52) 341 26 11',
    email: 'kwp.bydgoszcz@policja.gov.pl',
    website: 'https://bydgoszcz.policja.gov.pl'
  },
  
  kw_kielce: {
    id: 'kw_kielce',
    name: 'Komenda Wojewódzka Policji w Kielcach',
    shortName: 'KWP Kielce',
    type: 'wojewodzka',
    city: 'Kielce',
    voivodeship: 'świętokrzyskie',
    address: 'ul. Seminaryjska 12, 25-372 Kielce',
    phone: '(41) 340 21 11',
    email: 'kwp.kielce@policja.gov.pl',
    website: 'https://kielce.policja.gov.pl'
  },
  
  kw_olsztyn: {
    id: 'kw_olsztyn',
    name: 'Komenda Wojewódzka Policji w Olsztynie',
    shortName: 'KWP Olsztyn',
    type: 'wojewodzka',
    city: 'Olsztyn',
    voivodeship: 'warmińsko-mazurskie',
    address: 'ul. Partyzantów 6/8, 10-521 Olsztyn',
    phone: '(89) 522 21 11',
    email: 'kwp.olsztyn@policja.gov.pl',
    website: 'https://olsztyn.policja.gov.pl'
  },
  
  kw_opole: {
    id: 'kw_opole',
    name: 'Komenda Wojewódzka Policji w Opolu',
    shortName: 'KWP Opole',
    type: 'wojewodzka',
    city: 'Opole',
    voivodeship: 'opolskie',
    address: 'ul. Kościuszki 102, 45-062 Opole',
    phone: '(77) 443 21 11',
    email: 'kwp.opole@policja.gov.pl',
    website: 'https://opole.policja.gov.pl'
  },
  
  kw_rzeszow: {
    id: 'kw_rzeszow',
    name: 'Komenda Wojewódzka Policji w Rzeszowie',
    shortName: 'KWP Rzeszów',
    type: 'wojewodzka',
    city: 'Rzeszów',
    voivodeship: 'podkarpackie',
    address: 'ul. Dąbrowskiego 30, 35-036 Rzeszów',
    phone: '(17) 866 21 11',
    email: 'kwp.rzeszow@policja.gov.pl',
    website: 'https://rzeszow.policja.gov.pl'
  },
  
  kw_gorzow: {
    id: 'kw_gorzow',
    name: 'Komenda Wojewódzka Policji w Gorzowie Wielkopolskim',
    shortName: 'KWP Gorzów Wlkp.',
    type: 'wojewodzka',
    city: 'Gorzów Wielkopolski',
    voivodeship: 'lubuskie',
    address: 'ul. Podmiejska 17a, 66-400 Gorzów Wielkopolski',
    phone: '(95) 738 21 11',
    email: 'kwp.gorzow@policja.gov.pl',
    website: 'https://gorzow.policja.gov.pl'
  },
  
  // ==================== KOMENDY MIEJSKIE - WARSZAWA ====================
  
  km_warszawa_srodmiescie: {
    id: 'km_warszawa_srodmiescie',
    name: 'Komenda Rejonowa Policji Warszawa I - Śródmieście',
    shortName: 'KRP Warszawa I',
    type: 'miejska',
    city: 'Warszawa',
    district: 'Śródmieście',
    voivodeship: 'mazowieckie',
    address: 'ul. Wilcza 21, 00-544 Warszawa',
    phone: '(22) 603 11 40',
    email: 'krp1.warszawa@policja.gov.pl',
    website: 'https://warszawa.policja.gov.pl'
  },
  
  km_warszawa_mokotow: {
    id: 'km_warszawa_mokotow',
    name: 'Komenda Rejonowa Policji Warszawa III - Mokotów',
    shortName: 'KRP Warszawa III',
    type: 'miejska',
    city: 'Warszawa',
    district: 'Mokotów',
    voivodeship: 'mazowieckie',
    address: 'ul. Rakowiecka 17a, 02-517 Warszawa',
    phone: '(22) 603 13 00',
    email: 'krp3.warszawa@policja.gov.pl',
    website: 'https://warszawa.policja.gov.pl'
  },
  
  km_warszawa_praga: {
    id: 'km_warszawa_praga',
    name: 'Komenda Rejonowa Policji Warszawa IV - Praga Południe',
    shortName: 'KRP Warszawa IV',
    type: 'miejska',
    city: 'Warszawa',
    district: 'Praga-Południe',
    voivodeship: 'mazowieckie',
    address: 'ul. Grenadierów 77, 04-062 Warszawa',
    phone: '(22) 603 14 00',
    email: 'krp4.warszawa@policja.gov.pl',
    website: 'https://warszawa.policja.gov.pl'
  },
  
  // ==================== KOMENDY MIEJSKIE - KRAKÓW ====================
  
  km_krakow_centrum: {
    id: 'km_krakow_centrum',
    name: 'Komenda Rejonowa Policji Kraków Centrum',
    shortName: 'KRP Kraków Centrum',
    type: 'miejska',
    city: 'Kraków',
    district: 'Centrum',
    voivodeship: 'małopolskie',
    address: 'ul. Mogilska 109, 31-571 Kraków',
    phone: '(12) 615 22 00',
    email: 'krp.krakow-centrum@policja.gov.pl',
    website: 'https://krakow.policja.gov.pl'
  },
  
  km_krakow_podgorze: {
    id: 'km_krakow_podgorze',
    name: 'Komenda Rejonowa Policji Kraków Podgórze',
    shortName: 'KRP Kraków Podgórze',
    type: 'miejska',
    city: 'Kraków',
    district: 'Podgórze',
    voivodeship: 'małopolskie',
    address: 'ul. Limanowskiego 54, 30-553 Kraków',
    phone: '(12) 615 24 00',
    email: 'krp.krakow-podgorze@policja.gov.pl',
    website: 'https://krakow.policja.gov.pl'
  },
  
  // ==================== KOMENDY MIEJSKIE - WROCŁAW ====================
  
  km_wroclaw_fabryczna: {
    id: 'km_wroclaw_fabryczna',
    name: 'Komenda Rejonowa Policji Wrocław-Fabryczna',
    shortName: 'KRP Wrocław-Fabryczna',
    type: 'miejska',
    city: 'Wrocław',
    district: 'Fabryczna',
    voivodeship: 'dolnośląskie',
    address: 'ul. Gwiaździsta 66, 53-413 Wrocław',
    phone: '(71) 344 74 40',
    email: 'krp.wroclaw-fabryczna@policja.gov.pl',
    website: 'https://wroclaw.policja.gov.pl'
  },
  
  km_wroclaw_srodmiescie: {
    id: 'km_wroclaw_srodmiescie',
    name: 'Komenda Rejonowa Policji Wrocław-Śródmieście',
    shortName: 'KRP Wrocław-Śródmieście',
    type: 'miejska',
    city: 'Wrocław',
    district: 'Śródmieście',
    voivodeship: 'dolnośląskie',
    address: 'ul. Podwale 31-33, 50-040 Wrocław',
    phone: '(71) 344 74 20',
    email: 'krp.wroclaw-srodmiescie@policja.gov.pl',
    website: 'https://wroclaw.policja.gov.pl'
  },
  
  km_wroclaw_krzyki: {
    id: 'km_wroclaw_krzyki',
    name: 'Komenda Rejonowa Policji Wrocław-Krzyki',
    shortName: 'KRP Wrocław-Krzyki',
    type: 'miejska',
    city: 'Wrocław',
    district: 'Krzyki',
    voivodeship: 'dolnośląskie',
    address: 'ul. Borowska 213, 50-558 Wrocław',
    phone: '(71) 344 74 60',
    email: 'krp.wroclaw-krzyki@policja.gov.pl',
    website: 'https://wroclaw.policja.gov.pl'
  }
};

// Eksport
module.exports = { POLICE_DATABASE };
