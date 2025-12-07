# 🚔 KOD DO DODANIA - Przycisk Ankiety Karnej

## GDZIE DODAĆ:
W tym samym miejscu gdzie masz przyciski dla:
- Ankiety upadłościowej
- Ankiety odszkodowawczej
- Ankiety windykacyjnej

## KOD DO WKLEJENIA:

```javascript
// ========================================
// ANKIETA KARNA - dla spraw POB/KRA/OSZ/DRO/NAR
// ========================================

// Sprawdź czy to sprawa karna
const isCriminal = window.isCriminalCase && (
    window.isCriminalCase(currentCase.case_type) || 
    window.isCriminalCase(currentCase.case_number)
);

if (isCriminal) {
    // Dodaj przycisk ankiety karnej
    quickActionsHTML += `
        <button 
            onclick="window.openCriminalQuestionnaire(${currentCase.id}, '${currentCase.case_number}')"
            style="
                width: 100%;
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.3s;
                margin-top: 8px;
                box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(231, 76, 60, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(231, 76, 60, 0.3)'"
        >
            🚔 Ankieta Karna
        </button>
    `;
}
```

## ALTERNATYWNY SPOSÓB (jeśli używasz createElement):

```javascript
if (isCriminal) {
    const criminalBtn = document.createElement('button');
    criminalBtn.textContent = '🚔 Ankieta Karna';
    criminalBtn.onclick = () => window.openCriminalQuestionnaire(currentCase.id, currentCase.case_number);
    criminalBtn.style.cssText = `
        width: 100%;
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.95rem;
        margin-top: 8px;
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
        transition: all 0.3s;
    `;
    criminalBtn.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
    };
    criminalBtn.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
    };
    
    quickActionsPanel.appendChild(criminalBtn);
}
```

## ROZPOZNAWANIE SPRAW KARNYCH:

System automatycznie rozpozna sprawę jako karną jeśli:

**Po typie:**
- `case_type === 'assault'` (Pobicie)
- `case_type === 'theft'` (Kradzież)
- `case_type === 'fraud'` (Oszustwo)
- `case_type === 'traffic'` (Drogowe)
- `case_type === 'drugs'` (Narkotyki)

**Po numerze sprawy:**
- `case_number` zaczyna się od `POB/`
- `case_number` zaczyna się od `KRA/`
- `case_number` zaczyna się od `OSZ/`
- `case_number` zaczyna się od `DRO/`
- `case_number` zaczyna się od `NAR/`

## PRZYKŁAD:

```javascript
// Dla sprawy: KRA/DK01/002
window.isCriminalCase('KRA/DK01/002') // → true
window.isCriminalCase('theft') // → true
window.isCriminalCase('KRA') // → true

// Po kliknięciu:
window.openCriminalQuestionnaire(123, 'KRA/DK01/002')
// → Otworzy ankietę karną dla sprawy #123
// → Rozpozna: 📊 Kradzież
// → Ustawi kategorię: property
```

## KONSOLA - DEBUG:

Po kliknięciu przycisku w konsoli zobaczysz:
```
🚔 Otwieranie ankiety karnej dla sprawy: 123 typ/numer: KRA/DK01/002
🔄 Rozpoznano prefix z numeru: KRA → theft
✅ Rozpoznano typ sprawy: 📊 Kradzież
📋 Domyślne przestępstwo: art278
📂 Kategoria: property
```

## KOLORY PRZYCISKÓW (dla spójności):

- 🚔 Ankieta Karna: `#e74c3c` (czerwony)
- 📉 Ankieta Upadłościowa: `#9b59b6` (fioletowy)
- 💰 Ankieta Odszkodowawcza: `#27ae60` (zielony)
- 📜 Ankieta Windykacyjna: `#f39c12` (pomarańczowy)
- 🔄 Ankieta Restrukturyzacyjna: `#3498db` (niebieski)
