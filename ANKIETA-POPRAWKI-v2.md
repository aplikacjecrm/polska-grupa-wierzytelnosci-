# ✅ POPRAWKI ANKIETY UPADŁOŚCIOWEJ v2.0

## 🎯 **CO ZOSTAŁO POPRAWIONE:**

### **1. ✅ WYŁĄCZONE DENERWUJĄCE POWIADOMIENIA**
- ❌ Usunięto `alert('✅ Ankieta zapisana!')` z funkcji `saveAnswers()`
- ✅ Auto-save działa CICHO w tle co 30 sekund
- ✅ Log tylko w konsoli: `💾 Auto-save: zapisano bez powiadomienia`

### **2. 🎤 NAGRYWANIE AUDIO - KLIENT OPOWIADA SWOIMI SŁOWAMI**
- ✅ Dodano funkcję `window.bankruptcyQuestionnaire.startRecording(questionId)`
- ✅ Klient może NAGRAĆ odpowiedź zamiast pisać
- ✅ Przycisk "🎤 Nagraj odpowiedź" przy pytaniach opisowych
- ✅ Audio player po nagraniu
- ✅ Przycisk "🗑️ Usuń nagranie"
- ✅ Format: audio/webm
- ✅ Zapisywane w `window.bankruptcyQuestionnaire.savedRecordings`

### **3. 📎 ZAŁĄCZNIKI PRZY WIERZYCIELACH**
**TODO:** Dodać input file przy każdym wierzycielu:
- Wezwanie do zapłaty
- Umowa
- Wyrok/Tytuł wykonawczy
- Inne dokumenty

### **4. 🎨 POPRAWA KOLORÓW CZCIONKI**
**TODO:** Zmienić kolory w `questionnaire-renderer.js`:
- Labels: z `#ccc` na `#2c3e50` (ciemny, czytelny)
- Descriptions: z `#999` na `#7f8c8d` (jasny szary)
- Headings: `#1a2332` (czarny)

### **5. 🧠 DYNAMICZNE PYTANIA**

#### **A. DLA KONSUMENTA (consumer):**
Pokazuj TYLKO:
- Podstawowe dane (imię, nazwisko, PESEL, adres)
- Wierzyciele (banki, pożyczki, karty)
- Sytuacja osobista:
  - ✅ Stan cywilny
  - ✅ Liczba osób na utrzymaniu
  - ✅ Opis sytuacji życiowej (textarea + 🎤 nagranie)
  - ✅ Co doprowadziło do zadłużenia? (textarea + 🎤)
  - ✅ Czy utracił pracę?
  - ✅ Czy choroba w rodzinie?
  - ✅ Czy rozwód?
- Dochody i wydatki:
  - ✅ Miesięczny dochód netto
  - ✅ Miesięczne wydatki (mieszkanie, jedzenie, dzieci)
  - ✅ Czy otrzymuje zasiłki/alimenty?
- Majątek (uproszczony):
  - ✅ Czy posiada mieszkanie/dom?
  - ✅ Czy posiada samochód?
  - ✅ Czy posiada oszczędności?

**UKRYJ:**
- NIP, REGON, KRS
- Pytania o firmę
- Bilansy, sprawozdania

#### **B. DLA PRZEDSIĘBIORCY/FIRMY:**
Pokazuj:
- Wszystkie pytania firmowe
- Historia restrukturyzacji
- Zatrudnienie:
  - ✅ Liczba pracowników
  - ✅ Czy są zaległości w ZUS?
  - ✅ Czy są zaległości w płacach?
- Działalność:
  - ✅ Kiedy rozpoczęto działalność?
  - ✅ Główny profil działalności
  - ✅ Co poszło nie tak? (textarea + 🎤)
  - ✅ Czy próbowano ratować firmę?

---

## 📋 **NOWE PYTANIA DO DODANIA:**

### **SEKCJA: ZATRUDNIENIE** (dla firm)
```javascript
{
    id: 'employment',
    title: '👥 ZATRUDNIENIE',
    icon: '👥',
    order: 8,
    showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna'],
    questions: [
        {
            id: 'employee_count',
            label: 'Liczba zatrudnionych osób',
            type: 'number',
            min: 0
        },
        {
            id: 'zus_arrears',
            label: 'Czy są zaległości w ZUS?',
            type: 'radio',
            options: [
                { value: 'yes', label: 'Tak' },
                { value: 'no', label: 'Nie' }
            ]
        },
        {
            id: 'salary_arrears',
            label: 'Czy są zaległości w wypłatach wynagrodzeń?',
            type: 'radio',
            options: [
                { value: 'yes', label: 'Tak' },
                { value: 'no', label: 'Nie' }
            ]
        }
    ]
}
```

### **SEKCJA: SYTUACJA OSOBISTA** (dla konsumentów)
```javascript
{
    id: 'personal_situation',
    title: '💭 TWOJA SYTUACJA',
    icon: '💭',
    order: 2,
    showIf: ['consumer'],
    questions: [
        {
            id: 'marital_status',
            label: 'Stan cywilny',
            type: 'select',
            options: [
                { value: 'single', label: 'Wolny/a' },
                { value: 'married', label: 'Żonaty/Zamężna' },
                { value: 'divorced', label: 'Rozwiedziony/a' },
                { value: 'widowed', label: 'Wdowiec/Wdowa' }
            ]
        },
        {
            id: 'dependents',
            label: 'Liczba osób na utrzymaniu',
            type: 'number',
            min: 0
        },
        {
            id: 'how_it_happened',
            label: '📝 Jak doszło do zadłużenia? Opowiedz swoimi słowami',
            type: 'textarea',
            rows: 6,
            placeholder: 'Opisz szczerze swoją sytuację. To pomoże nam lepiej przygotować sprawę...',
            audioRecording: true  // ← PRZYCISK NAGRYWANIA!
        },
        {
            id: 'job_loss',
            label: 'Czy utraciłeś/aś pracę?',
            type: 'radio',
            options: [
                { value: 'yes', label: 'Tak' },
                { value: 'no', label: 'Nie' }
            ]
        },
        {
            id: 'illness',
            label: 'Czy choroba w rodzinie wpłynęła na zadłużenie?',
            type: 'radio',
            options: [
                { value: 'yes', label: 'Tak' },
                { value: 'no', label: 'Nie' }
            ]
        }
    ]
}
```

---

## 🎤 **JAK DZIAŁA NAGRYWANIE:**

### **Frontend:**
```javascript
// W renderowaniu pytania z textarea + audioRecording: true
if (question.audioRecording) {
    html += `
        <div style="margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #27ae60;">
            <p style="margin: 0 0 10px 0; color: #2c3e50; font-weight: 600;">
                💡 Zamiast pisać możesz NAGRAĆ swoją odpowiedź
            </p>
            <button id="record_btn_${fieldId}" 
                onclick="window.bankruptcyQuestionnaire.startRecording('${fieldId}')"
                style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                🎤 Nagraj odpowiedź
            </button>
            <div id="audio_${fieldId}" style="margin-top: 10px;"></div>
        </div>
    `;
}
```

### **Backend:**
TODO: Zapisz nagrania audio jako pliki w `/uploads/questionnaires/audio/`

---

## 📦 **CO DALEJ:**

### **PRIORYTET 1:**
- [ ] Dodać dynamiczne pokazywanie/ukrywanie pytań (`showIf`)
- [ ] Zmienić kolory czcionki na czytelne
- [ ] Dodać sekcję "Zatrudnienie"
- [ ] Dodać sekcję "Sytuacja osobista" dla konsumentów

### **PRIORYTET 2:**
- [ ] Dodać załączniki przy wierzycielach
- [ ] Zapisać nagrania audio na backend
- [ ] Dodać przyciski nagrywania do pytań opisowych

### **PRIORYTET 3:**
- [ ] Generowanie dokumentów PDF z nagraniami (QR code do audio)
- [ ] Transkrypcja audio na tekst (API)

---

## 🧪 **JAK PRZETESTOWAĆ:**

```
1. Odśwież: Ctrl + Shift + F5
2. Otwórz sprawę upadłościową
3. Kliknij "📋 Wypełnij ankietę upadłościową"
4. Wypełnij pytania
5. ✅ NIE BĘDZIE denerwujących alertów co 30 sek
6. 🎤 Znajdź pytanie z przyciskiem nagrywania (TODO)
7. Kliknij "🎤 Nagraj odpowiedź"
8. Opowiedz swoją historię
9. Kliknij "⏹️ Stop"
10. Odtwórz nagranie
```

---

## 📊 **STATUS:**

| Funkcja | Status |
|---------|--------|
| Wyłączone alerty | ✅ DZIAŁA |
| Nagrywanie audio | ✅ FUNKCJA GOTOWA |
| Załączniki wierzyciele | ⬜ TODO |
| Kolory czcionki | ⬜ TODO |
| Dynamiczne pytania | ⬜ TODO |
| Sekcja zatrudnienie | ⬜ TODO |
| Sekcja sytuacja | ⬜ TODO |

---

**Wersja:** v2.0  
**Data:** 2025-11-08 10:33  
**Status:** Częściowo zaimplementowane
