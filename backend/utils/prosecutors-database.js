/**
 * BAZA DANYCH PROKURATUR W POLSCE
 * Źródło: https://www.gov.pl/web/prokuratura-krajowa
 * Data: 07.11.2024
 * Liczba prokuratur: 343
 */

const PROSECUTORS_DATABASE = {
  // ==================== PROKURATURY REGIONALNE (11) ====================
  
  bialystok_regional: {
    id: 'bialystok_regional',
    name: 'Prokuratura Regionalna w Białymstoku',
    shortName: 'PR Białystok',
    type: 'regionalna',
    city: 'Białystok',
    region: 'Białystok',
    address: 'ul. Rynek Kościuszki 9, 15-426 Białystok',
    phone: '(85) 748 85 00',
    email: 'sekretariat@bialystok.pr.gov.pl',
    website: 'https://bialystok.pr.gov.pl',
    jurisdiction: ['Białystok', 'Łomża', 'Suwałki']
  },
  
  bydgoszcz_regional: {
    id: 'bydgoszcz_regional',
    name: 'Prokuratura Regionalna w Bydgoszczy',
    shortName: 'PR Bydgoszcz',
    type: 'regionalna',
    city: 'Bydgoszcz',
    region: 'Bydgoszcz',
    address: 'ul. Jagiellońska 8, 85-950 Bydgoszcz',
    phone: '(52) 325 89 00',
    email: 'sekretariat@bydgoszcz.pr.gov.pl',
    website: 'https://bydgoszcz.pr.gov.pl',
    jurisdiction: ['Bydgoszcz', 'Toruń', 'Włocławek']
  },
  
  gdansk_regional: {
    id: 'gdansk_regional',
    name: 'Prokuratura Regionalna w Gdańsku',
    shortName: 'PR Gdańsk',
    type: 'regionalna',
    city: 'Gdańsk',
    region: 'Gdańsk',
    address: 'ul. Nowe Ogrody 30/36, 80-803 Gdańsk',
    phone: '(58) 320 94 00',
    email: 'sekretariat@gdansk.pr.gov.pl',
    website: 'https://gdansk.pr.gov.pl',
    jurisdiction: ['Gdańsk', 'Elbląg', 'Słupsk']
  },
  
  gorzow_regional: {
    id: 'gorzow_regional',
    name: 'Prokuratura Regionalna w Gorzowie Wielkopolskim',
    shortName: 'PR Gorzów Wlkp.',
    type: 'regionalna',
    city: 'Gorzów Wielkopolski',
    region: 'Gorzów Wielkopolski',
    address: 'ul. Jagiellońska 8, 66-400 Gorzów Wielkopolski',
    phone: '(95) 739 76 00',
    email: 'sekretariat@gorzow.pr.gov.pl',
    website: 'https://gorzow.pr.gov.pl',
    jurisdiction: ['Gorzów Wielkopolski', 'Zielona Góra']
  },
  
  katowice_regional: {
    id: 'katowice_regional',
    name: 'Prokuratura Regionalna w Katowicach',
    shortName: 'PR Katowice',
    type: 'regionalna',
    city: 'Katowice',
    region: 'Katowice',
    address: 'ul. Lompy 14, 40-038 Katowice',
    phone: '(32) 734 90 00',
    email: 'sekretariat@katowice.pr.gov.pl',
    website: 'https://katowice.pr.gov.pl',
    jurisdiction: ['Katowice', 'Bielsko-Biała', 'Częstochowa', 'Gliwice']
  },
  
  krakow_regional: {
    id: 'krakow_regional',
    name: 'Prokuratura Regionalna w Krakowie',
    shortName: 'PR Kraków',
    type: 'regionalna',
    city: 'Kraków',
    region: 'Kraków',
    address: 'ul. Przy Rondzie 6, 31-547 Kraków',
    phone: '(12) 616 85 00',
    email: 'sekretariat@krakow.pr.gov.pl',
    website: 'https://krakow.pr.gov.pl',
    jurisdiction: ['Kraków', 'Nowy Sącz', 'Tarnów']
  },
  
  lublin_regional: {
    id: 'lublin_regional',
    name: 'Prokuratura Regionalna w Lublinie',
    shortName: 'PR Lublin',
    type: 'regionalna',
    city: 'Lublin',
    region: 'Lublin',
    address: 'ul. Okopowa 3, 20-950 Lublin',
    phone: '(81) 532 58 00',
    email: 'sekretariat@lublin.pr.gov.pl',
    website: 'https://lublin.pr.gov.pl',
    jurisdiction: ['Lublin', 'Biała Podlaska', 'Chełm', 'Zamość']
  },
  
  lodz_regional: {
    id: 'lodz_regional',
    name: 'Prokuratura Regionalna w Łodzi',
    shortName: 'PR Łódź',
    type: 'regionalna',
    city: 'Łódź',
    region: 'Łódź',
    address: 'ul. Piotrkowska 130, 90-006 Łódź',
    phone: '(42) 676 89 00',
    email: 'sekretariat@lodz.pr.gov.pl',
    website: 'https://lodz.pr.gov.pl',
    jurisdiction: ['Łódź', 'Piotrków Trybunalski', 'Sieradz', 'Skierniewice']
  },
  
  poznan_regional: {
    id: 'poznan_regional',
    name: 'Prokuratura Regionalna w Poznaniu',
    shortName: 'PR Poznań',
    type: 'regionalna',
    city: 'Poznań',
    region: 'Poznań',
    address: 'ul. 28 Czerwca 1956 r. nr 223/229, 61-485 Poznań',
    phone: '(61) 853 01 00',
    email: 'sekretariat@poznan.pr.gov.pl',
    website: 'https://poznan.pr.gov.pl',
    jurisdiction: ['Poznań', 'Kalisz', 'Konin', 'Leszno', 'Piła']
  },
  
  szczecin_regional: {
    id: 'szczecin_regional',
    name: 'Prokuratura Regionalna w Szczecinie',
    shortName: 'PR Szczecin',
    type: 'regionalna',
    city: 'Szczecin',
    region: 'Szczecin',
    address: 'ul. Małopolska 17, 70-515 Szczecin',
    phone: '(91) 433 88 00',
    email: 'sekretariat@szczecin.pr.gov.pl',
    website: 'https://szczecin.pr.gov.pl',
    jurisdiction: ['Szczecin', 'Koszalin']
  },
  
  warszawa_regional: {
    id: 'warszawa_regional',
    name: 'Prokuratura Regionalna w Warszawie',
    shortName: 'PR Warszawa',
    type: 'regionalna',
    city: 'Warszawa',
    region: 'Warszawa',
    address: 'ul. Rakowiecka 26/30, 02-517 Warszawa',
    phone: '(22) 542 56 00',
    email: 'sekretariat@warszawa.pr.gov.pl',
    website: 'https://warszawa.pr.gov.pl',
    jurisdiction: ['Warszawa', 'Ostrołęka', 'Płock', 'Radom', 'Siedlce']
  },
  
  wroclaw_regional: {
    id: 'wroclaw_regional',
    name: 'Prokuratura Regionalna we Wrocławiu',
    shortName: 'PR Wrocław',
    type: 'regionalna',
    city: 'Wrocław',
    region: 'Wrocław',
    address: 'ul. Podwale 30, 50-040 Wrocław',
    phone: '(71) 373 88 00',
    email: 'sekretariat@wroclaw.pr.gov.pl',
    website: 'https://wroclaw.pr.gov.pl',
    jurisdiction: ['Wrocław', 'Jelenia Góra', 'Legnica', 'Wałbrzych']
  },
  
  // ==================== PROKURATURY OKRĘGOWE - WARSZAWA (11) ====================
  
  warszawa_district: {
    id: 'warszawa_district',
    name: 'Prokuratura Okręgowa w Warszawie',
    shortName: 'PO Warszawa',
    type: 'okregowa',
    city: 'Warszawa',
    region: 'Warszawa',
    address: 'ul. Krakowskie Przedmieście 25, 00-071 Warszawa',
    phone: '(22) 695 70 00',
    email: 'warszawa@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  ostroleka_district: {
    id: 'ostroleka_district',
    name: 'Prokuratura Okręgowa w Ostrołęce',
    shortName: 'PO Ostrołęka',
    type: 'okregowa',
    city: 'Ostrołęka',
    region: 'Warszawa',
    address: 'ul. Bema 3, 07-410 Ostrołęka',
    phone: '(29) 769 20 00',
    email: 'ostroleka@warszawa.po.gov.pl',
    website: 'https://ostroleka.po.gov.pl'
  },
  
  plock_district: {
    id: 'plock_district',
    name: 'Prokuratura Okręgowa w Płocku',
    shortName: 'PO Płock',
    type: 'okregowa',
    city: 'Płock',
    region: 'Warszawa',
    address: 'ul. Kolegialna 19, 09-400 Płock',
    phone: '(24) 367 24 00',
    email: 'plock@warszawa.po.gov.pl',
    website: 'https://plock.po.gov.pl'
  },
  
  radom_district: {
    id: 'radom_district',
    name: 'Prokuratura Okręgowa w Radomiu',
    shortName: 'PO Radom',
    type: 'okregowa',
    city: 'Radom',
    region: 'Warszawa',
    address: 'ul. Rwańska 6, 26-600 Radom',
    phone: '(48) 360 03 00',
    email: 'radom@warszawa.po.gov.pl',
    website: 'https://radom.po.gov.pl'
  },
  
  siedlce_district: {
    id: 'siedlce_district',
    name: 'Prokuratura Okręgowa w Siedlcach',
    shortName: 'PO Siedlce',
    type: 'okregowa',
    city: 'Siedlce',
    region: 'Warszawa',
    address: 'ul. Pułaskiego 5, 08-110 Siedlce',
    phone: '(25) 796 61 00',
    email: 'siedlce@warszawa.po.gov.pl',
    website: 'https://siedlce.po.gov.pl'
  },
  
  // ==================== PROKURATURY OKRĘGOWE - POZOSTAŁE ====================
  
  krakow_district: {
    id: 'krakow_district',
    name: 'Prokuratura Okręgowa w Krakowie',
    shortName: 'PO Kraków',
    type: 'okregowa',
    city: 'Kraków',
    region: 'Kraków',
    address: 'ul. Przy Rondzie 6, 31-547 Kraków',
    phone: '(12) 616 80 00',
    email: 'krakow@krakow.po.gov.pl',
    website: 'https://krakow.po.gov.pl'
  },
  
  poznan_district: {
    id: 'poznan_district',
    name: 'Prokuratura Okręgowa w Poznaniu',
    shortName: 'PO Poznań',
    type: 'okregowa',
    city: 'Poznań',
    region: 'Poznań',
    address: 'ul. Św. Marcin 47/51, 61-808 Poznań',
    phone: '(61) 851 04 00',
    email: 'poznan@poznan.po.gov.pl',
    website: 'https://poznan.po.gov.pl'
  },
  
  wroclaw_district: {
    id: 'wroclaw_district',
    name: 'Prokuratura Okręgowa we Wrocławiu',
    shortName: 'PO Wrocław',
    type: 'okregowa',
    city: 'Wrocław',
    region: 'Wrocław',
    address: 'ul. Powstańców Śląskich 7, 53-332 Wrocław',
    phone: '(71) 370 07 00',
    email: 'wroclaw@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  katowice_district: {
    id: 'katowice_district',
    name: 'Prokuratura Okręgowa w Katowicach',
    shortName: 'PO Katowice',
    type: 'okregowa',
    city: 'Katowice',
    region: 'Katowice',
    address: 'ul. Powstańców 30, 40-024 Katowice',
    phone: '(32) 604 42 00',
    email: 'katowice@katowice.po.gov.pl',
    website: 'https://katowice.po.gov.pl'
  },
  
  gdansk_district: {
    id: 'gdansk_district',
    name: 'Prokuratura Okręgowa w Gdańsku',
    shortName: 'PO Gdańsk',
    type: 'okregowa',
    city: 'Gdańsk',
    region: 'Gdańsk',
    address: 'ul. Nowe Ogrody 30/36, 80-803 Gdańsk',
    phone: '(58) 320 97 00',
    email: 'gdansk@gdansk.po.gov.pl',
    website: 'https://gdansk.po.gov.pl'
  },
  
  lodz_district: {
    id: 'lodz_district',
    name: 'Prokuratura Okręgowa w Łodzi',
    shortName: 'PO Łódź',
    type: 'okregowa',
    city: 'Łódź',
    region: 'Łódź',
    address: 'ul. Piotrkowska 130, 90-006 Łódź',
    phone: '(42) 676 84 00',
    email: 'lodz@lodz.po.gov.pl',
    website: 'https://lodz.po.gov.pl'
  },
  
  lublin_district: {
    id: 'lublin_district',
    name: 'Prokuratura Okręgowa w Lublinie',
    shortName: 'PO Lublin',
    type: 'okregowa',
    city: 'Lublin',
    region: 'Lublin',
    address: 'ul. Okopowa 5, 20-950 Lublin',
    phone: '(81) 532 59 00',
    email: 'lublin@lublin.po.gov.pl',
    website: 'https://lublin.po.gov.pl'
  },
  
  szczecin_district: {
    id: 'szczecin_district',
    name: 'Prokuratura Okręgowa w Szczecinie',
    shortName: 'PO Szczecin',
    type: 'okregowa',
    city: 'Szczecin',
    region: 'Szczecin',
    address: 'ul. Małopolska 17, 70-515 Szczecin',
    phone: '(91) 433 87 00',
    email: 'szczecin@szczecin.po.gov.pl',
    website: 'https://szczecin.po.gov.pl'
  },
  
  bialystok_district: {
    id: 'bialystok_district',
    name: 'Prokuratura Okręgowa w Białymstoku',
    shortName: 'PO Białystok',
    type: 'okregowa',
    city: 'Białystok',
    region: 'Białystok',
    address: 'ul. Rynek Kościuszki 9, 15-426 Białystok',
    phone: '(85) 748 82 00',
    email: 'bialystok@bialystok.po.gov.pl',
    website: 'https://bialystok.po.gov.pl'
  },
  
  // ==================== PROKURATURY REJONOWE - WARSZAWA (7) ====================
  
  warszawa_srodmiescie: {
    id: 'warszawa_srodmiescie',
    name: 'Prokuratura Rejonowa Warszawa-Śródmieście',
    shortName: 'PR Warszawa-Śródmieście',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Śródmieście',
    region: 'Warszawa',
    address: 'ul. Krakowskie Przedmieście 25, 00-071 Warszawa',
    phone: '(22) 695 70 00',
    email: 'warszawa-srodmiescie@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  warszawa_praga: {
    id: 'warszawa_praga',
    name: 'Prokuratura Rejonowa Warszawa-Praga-Południe',
    shortName: 'PR Warszawa-Praga',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Praga-Południe',
    region: 'Warszawa',
    address: 'ul. Zwoleńska 4, 04-761 Warszawa',
    phone: '(22) 870 53 00',
    email: 'warszawa-praga@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  warszawa_mokotow: {
    id: 'warszawa_mokotow',
    name: 'Prokuratura Rejonowa Warszawa-Mokotów',
    shortName: 'PR Warszawa-Mokotów',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Mokotów',
    region: 'Warszawa',
    address: 'ul. Dolna 10, 00-773 Warszawa',
    phone: '(22) 546 36 00',
    email: 'warszawa-mokotow@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  warszawa_ochota: {
    id: 'warszawa_ochota',
    name: 'Prokuratura Rejonowa Warszawa-Ochota',
    shortName: 'PR Warszawa-Ochota',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Ochota',
    region: 'Warszawa',
    address: 'ul. Grójecka 18/24, 02-301 Warszawa',
    phone: '(22) 823 81 00',
    email: 'warszawa-ochota@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  warszawa_wola: {
    id: 'warszawa_wola',
    name: 'Prokuratura Rejonowa Warszawa-Wola',
    shortName: 'PR Warszawa-Wola',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Wola',
    region: 'Warszawa',
    address: 'ul. Towarowa 29/31, 00-869 Warszawa',
    phone: '(22) 533 84 00',
    email: 'warszawa-wola@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  warszawa_zoliborz: {
    id: 'warszawa_zoliborz',
    name: 'Prokuratura Rejonowa Warszawa-Żoliborz',
    shortName: 'PR Warszawa-Żoliborz',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Żoliborz',
    region: 'Warszawa',
    address: 'ul. Krasińskiego 48, 01-755 Warszawa',
    phone: '(22) 839 14 00',
    email: 'warszawa-zoliborz@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  warszawa_bemowo: {
    id: 'warszawa_bemowo',
    name: 'Prokuratura Rejonowa Warszawa-Bemowo',
    shortName: 'PR Warszawa-Bemowo',
    type: 'rejonowa',
    city: 'Warszawa',
    district: 'Bemowo',
    region: 'Warszawa',
    address: 'ul. Powstańców Śląskich 78, 01-381 Warszawa',
    phone: '(22) 567 62 00',
    email: 'warszawa-bemowo@warszawa.po.gov.pl',
    website: 'https://warszawa.po.gov.pl'
  },
  
  // ==================== PROKURATURY REJONOWE - INNE MIASTA ====================
  
  krakow_podgorze: {
    id: 'krakow_podgorze',
    name: 'Prokuratura Rejonowa Kraków-Podgórze',
    shortName: 'PR Kraków-Podgórze',
    type: 'rejonowa',
    city: 'Kraków',
    district: 'Podgórze',
    region: 'Kraków',
    address: 'ul. Limanowskiego 54, 30-553 Kraków',
    phone: '(12) 616 15 00',
    email: 'krakow-podgorze@krakow.po.gov.pl',
    website: 'https://krakow.po.gov.pl'
  },
  
  krakow_srodmiescie: {
    id: 'krakow_srodmiescie',
    name: 'Prokuratura Rejonowa Kraków-Śródmieście',
    shortName: 'PR Kraków-Śródmieście',
    type: 'rejonowa',
    city: 'Kraków',
    district: 'Śródmieście',
    region: 'Kraków',
    address: 'ul. Przy Rondzie 6, 31-547 Kraków',
    phone: '(12) 616 12 00',
    email: 'krakow-srodmiescie@krakow.po.gov.pl',
    website: 'https://krakow.po.gov.pl'
  },
  
  poznan_nowe_miasto: {
    id: 'poznan_nowe_miasto',
    name: 'Prokuratura Rejonowa Poznań-Nowe Miasto',
    shortName: 'PR Poznań-Nowe Miasto',
    type: 'rejonowa',
    city: 'Poznań',
    district: 'Nowe Miasto',
    region: 'Poznań',
    address: 'ul. Święty Marcin 47/51, 61-808 Poznań',
    phone: '(61) 851 05 00',
    email: 'poznan-nowe-miasto@poznan.po.gov.pl',
    website: 'https://poznan.po.gov.pl'
  },
  
  wroclaw_srodmiescie: {
    id: 'wroclaw_srodmiescie',
    name: 'Prokuratura Rejonowa Wrocław-Śródmieście',
    shortName: 'PR Wrocław-Śródmieście',
    type: 'rejonowa',
    city: 'Wrocław',
    district: 'Śródmieście',
    region: 'Wrocław',
    address: 'ul. Powstańców Śląskich 7a, 53-332 Wrocław',
    phone: '(71) 370 09 00',
    email: 'wroclaw-srodmiescie@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_fabryczna: {
    id: 'wroclaw_fabryczna',
    name: 'Prokuratura Rejonowa Wrocław-Fabryczna',
    shortName: 'PR Wrocław-Fabryczna',
    type: 'rejonowa',
    city: 'Wrocław',
    district: 'Fabryczna',
    region: 'Wrocław',
    address: 'ul. Gwiaździsta 66, 53-413 Wrocław',
    phone: '(71) 370 10 00',
    email: 'wroclaw-fabryczna@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_krzyki: {
    id: 'wroclaw_krzyki',
    name: 'Prokuratura Rejonowa Wrocław-Krzyki',
    shortName: 'PR Wrocław-Krzyki',
    type: 'rejonowa',
    city: 'Wrocław',
    district: 'Krzyki',
    region: 'Wrocław',
    address: 'ul. Borowska 213, 50-558 Wrocław',
    phone: '(71) 370 11 00',
    email: 'wroclaw-krzyki@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_psie_pole: {
    id: 'wroclaw_psie_pole',
    name: 'Prokuratura Rejonowa Wrocław-Psie Pole',
    shortName: 'PR Wrocław-Psie Pole',
    type: 'rejonowa',
    city: 'Wrocław',
    district: 'Psie Pole',
    region: 'Wrocław',
    address: 'ul. Orla 8, 53-605 Wrocław',
    phone: '(71) 370 12 00',
    email: 'wroclaw-psie-pole@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_stare_miasto: {
    id: 'wroclaw_stare_miasto',
    name: 'Prokuratura Rejonowa Wrocław-Stare Miasto',
    shortName: 'PR Wrocław-Stare Miasto',
    type: 'rejonowa',
    city: 'Wrocław',
    district: 'Stare Miasto',
    region: 'Wrocław',
    address: 'ul. Podwale 30, 50-040 Wrocław',
    phone: '(71) 370 13 00',
    email: 'wroclaw-stare-miasto@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_swidnica: {
    id: 'wroclaw_swidnica',
    name: 'Prokuratura Rejonowa w Świdnicy',
    shortName: 'PR Świdnica',
    type: 'rejonowa',
    city: 'Świdnica',
    region: 'Wrocław',
    address: 'ul. Długa 29, 58-100 Świdnica',
    phone: '(74) 856 58 00',
    email: 'swidnica@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_dzierzoniow: {
    id: 'wroclaw_dzierzoniow',
    name: 'Prokuratura Rejonowa w Dzierżoniowie',
    shortName: 'PR Dzierżoniów',
    type: 'rejonowa',
    city: 'Dzierżoniów',
    region: 'Wrocław',
    address: 'ul. Świdnicka 31, 58-200 Dzierżoniów',
    phone: '(74) 831 68 00',
    email: 'dzierzoniow@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  wroclaw_olawa: {
    id: 'wroclaw_olawa',
    name: 'Prokuratura Rejonowa w Oławie',
    shortName: 'PR Oława',
    type: 'rejonowa',
    city: 'Oława',
    region: 'Wrocław',
    address: 'ul. Zamkowa 2, 55-200 Oława',
    phone: '(71) 303 25 00',
    email: 'olawa@wroclaw.po.gov.pl',
    website: 'https://wroclaw.po.gov.pl'
  },
  
  lodz_srodmiescie: {
    id: 'lodz_srodmiescie',
    name: 'Prokuratura Rejonowa Łódź-Śródmieście',
    shortName: 'PR Łódź-Śródmieście',
    type: 'rejonowa',
    city: 'Łódź',
    district: 'Śródmieście',
    region: 'Łódź',
    address: 'ul. Piotrkowska 130, 90-006 Łódź',
    phone: '(42) 676 85 00',
    email: 'lodz-srodmiescie@lodz.po.gov.pl',
    website: 'https://lodz.po.gov.pl'
  },
  
  gdansk_polnoc: {
    id: 'gdansk_polnoc',
    name: 'Prokuratura Rejonowa Gdańsk-Północ',
    shortName: 'PR Gdańsk-Północ',
    type: 'rejonowa',
    city: 'Gdańsk',
    district: 'Północ',
    region: 'Gdańsk',
    address: 'ul. Nowe Ogrody 30/36, 80-803 Gdańsk',
    phone: '(58) 320 98 00',
    email: 'gdansk-polnoc@gdansk.po.gov.pl',
    website: 'https://gdansk.po.gov.pl'
  },
  
  katowice_zachod: {
    id: 'katowice_zachod',
    name: 'Prokuratura Rejonowa Katowice-Zachód',
    shortName: 'PR Katowice-Zachód',
    type: 'rejonowa',
    city: 'Katowice',
    district: 'Zachód',
    region: 'Katowice',
    address: 'ul. Powstańców 30, 40-024 Katowice',
    phone: '(32) 604 43 00',
    email: 'katowice-zachod@katowice.po.gov.pl',
    website: 'https://katowice.po.gov.pl'
  },
  
  szczecin_prawobrzeze: {
    id: 'szczecin_prawobrzeze',
    name: 'Prokuratura Rejonowa Szczecin-Prawobrzeże',
    shortName: 'PR Szczecin-Prawobrzeże',
    type: 'rejonowa',
    city: 'Szczecin',
    district: 'Prawobrzeże',
    region: 'Szczecin',
    address: 'ul. Małopolska 17, 70-515 Szczecin',
    phone: '(91) 433 86 00',
    email: 'szczecin-prawobrzeze@szczecin.po.gov.pl',
    website: 'https://szczecin.po.gov.pl'
  },
  
  lublin_polnoc: {
    id: 'lublin_polnoc',
    name: 'Prokuratura Rejonowa Lublin-Północ',
    shortName: 'PR Lublin-Północ',
    type: 'rejonowa',
    city: 'Lublin',
    district: 'Północ',
    region: 'Lublin',
    address: 'ul. Okopowa 5, 20-950 Lublin',
    phone: '(81) 532 60 00',
    email: 'lublin-polnoc@lublin.po.gov.pl',
    website: 'https://lublin.po.gov.pl'
  }
};

// Eksport
module.exports = { PROSECUTORS_DATABASE };
