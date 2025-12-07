/**
 * PROSTY EDYTOR RICH TEXT - Pogrubienie, Podkreślenie, Kolory
 */

window.RichTextEditor = {
    /**
     * Inicjalizuje edytor dla textarea
     * @param {string} textareaId - ID textarea do zamiany na edytor
     * @param {string} initialValue - Początkowa wartość (może zawierać HTML)
     */
    init: function(textareaId, initialValue = '') {
        const textarea = document.getElementById(textareaId);
        if (!textarea) {
            console.warn('❌ Nie znaleziono textarea:', textareaId);
            return;
        }

        // SPRAWDŹ CZY EDYTOR JUŻ ZOSTAŁ ZAINICJALIZOWANY
        if (textarea.dataset.richTextInitialized === 'true') {
            console.log('⚠️ Rich Text Editor już zainicjalizowany dla:', textareaId);
            return;
        }
        
        // Oznacz jako zainicjalizowany
        textarea.dataset.richTextInitialized = 'true';

        // Ukryj oryginalne textarea (będzie używane do zapisu)
        textarea.style.display = 'none';
        
        // Ustaw wartość początkową
        textarea.value = initialValue;

        // Stwórz kontener edytora
        const editorContainer = document.createElement('div');
        editorContainer.className = 'rich-text-editor-container';
        editorContainer.style.cssText = `
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            background: white;
        `;

        // Toolbar z przyciskami
        const toolbar = document.createElement('div');
        toolbar.className = 'rich-text-toolbar';
        toolbar.style.cssText = `
            background: #f5f5f5;
            padding: 8px;
            border-bottom: 1px solid #ddd;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        `;

        // Przycisk BOLD
        const boldBtn = this.createToolbarButton('B', 'Pogrubienie', () => {
            document.execCommand('bold', false, null);
            editor.focus();
        });
        boldBtn.style.fontWeight = 'bold';

        // Przycisk UNDERLINE
        const underlineBtn = this.createToolbarButton('U', 'Podkreślenie', () => {
            document.execCommand('underline', false, null);
            editor.focus();
        });
        underlineBtn.style.textDecoration = 'underline';

        // Przycisk ITALIC
        const italicBtn = this.createToolbarButton('I', 'Kursywa', () => {
            document.execCommand('italic', false, null);
            editor.focus();
        });
        italicBtn.style.fontStyle = 'italic';

        // Color picker
        const colorGroup = document.createElement('div');
        colorGroup.style.cssText = 'display: flex; gap: 4px; align-items: center; border-left: 1px solid #ccc; padding-left: 8px;';
        
        const colorLabel = document.createElement('span');
        colorLabel.textContent = '🎨 Kolor:';
        colorLabel.style.cssText = 'font-size: 0.85rem; color: #666;';
        
        const predefinedColors = [
            { name: 'Czarny', value: '#000000' },
            { name: 'Niebieski', value: '#3498db' },
            { name: 'Czerwony', value: '#e74c3c' },
            { name: 'Zielony', value: '#27ae60' },
            { name: 'Pomarańczowy', value: '#f39c12' },
            { name: 'Fioletowy', value: '#9b59b6' }
        ];

        predefinedColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.type = 'button';
            colorBtn.title = color.name;
            colorBtn.style.cssText = `
                width: 28px;
                height: 28px;
                border: 2px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                background: ${color.value};
                transition: all 0.2s;
            `;
            colorBtn.onmouseover = () => {
                colorBtn.style.transform = 'scale(1.1)';
                colorBtn.style.borderColor = '#1a2332';
            };
            colorBtn.onmouseout = () => {
                colorBtn.style.transform = 'scale(1)';
                colorBtn.style.borderColor = '#ddd';
            };
            colorBtn.onclick = () => {
                document.execCommand('foreColor', false, color.value);
                editor.focus();
            };
            colorGroup.appendChild(colorBtn);
        });

        // Font Size Selector
        const fontSizeGroup = document.createElement('div');
        fontSizeGroup.style.cssText = 'display: flex; gap: 4px; align-items: center; border-left: 1px solid #ccc; padding-left: 8px;';
        
        const fontSizeLabel = document.createElement('span');
        fontSizeLabel.textContent = '📏 Rozmiar:';
        fontSizeLabel.style.cssText = 'font-size: 0.85rem; color: #666;';
        
        const fontSizeSelect = document.createElement('select');
        fontSizeSelect.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
            cursor: pointer;
            background: white;
        `;
        
        const fontSizes = [
            { label: '12px', value: '1' },      // font size 1 = ~10px
            { label: '14px', value: '2' },      // font size 2 = ~13px  
            { label: '16px', value: '3' },      // font size 3 = 16px (default)
            { label: '20px', value: '4' },      // font size 4 = ~18px
            { label: '24px', value: '5' },      // font size 5 = ~24px
            { label: '32px', value: '6' }       // font size 6 = ~32px
        ];
        
        fontSizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size.value;
            option.textContent = size.label;
            if (size.value === '3') option.selected = true; // 16px default
            fontSizeSelect.appendChild(option);
        });
        
        fontSizeSelect.onchange = (e) => {
            document.execCommand('fontSize', false, e.target.value);
            editor.focus();
        };
        
        fontSizeGroup.appendChild(fontSizeLabel);
        fontSizeGroup.appendChild(fontSizeSelect);

        toolbar.appendChild(boldBtn);
        toolbar.appendChild(underlineBtn);
        toolbar.appendChild(italicBtn);
        toolbar.appendChild(fontSizeGroup);
        toolbar.appendChild(colorLabel);
        toolbar.appendChild(colorGroup);

        // Edytor (contenteditable div)
        const editor = document.createElement('div');
        editor.contentEditable = 'true';
        editor.className = 'rich-text-editor';
        editor.innerHTML = initialValue || '';
        editor.style.cssText = `
            min-height: 120px;
            max-height: 400px;
            overflow-y: auto;
            padding: 14px;
            font-size: 1rem;
            line-height: 1.6;
            color: #1a2332;
            outline: none;
        `;
        editor.setAttribute('placeholder', 'Wpisz opis sprawy...');

        // Placeholder styling
        const style = document.createElement('style');
        style.textContent = `
            .rich-text-editor:empty:before {
                content: attr(placeholder);
                color: #999;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);

        // Synchronizuj zawartość z textarea przy każdej zmianie
        editor.addEventListener('input', () => {
            textarea.value = editor.innerHTML;
        });

        // 🔍 AUTOMATYCZNE WYKRYWANIE ROZMIARU CZCIONKI
        const updateFontSizeSelect = () => {
            try {
                const selection = window.getSelection();
                if (!selection || !selection.anchorNode) return;
                
                // Znajdź element z czcionką
                let node = selection.anchorNode;
                if (node.nodeType === Node.TEXT_NODE) {
                    node = node.parentElement;
                }
                
                // Sprawdź czy mamy element font z size
                let fontElement = node;
                while (fontElement && fontElement !== editor) {
                    if (fontElement.tagName === 'FONT' && fontElement.size) {
                        fontSizeSelect.value = fontElement.size;
                        return;
                    }
                    fontElement = fontElement.parentElement;
                }
                
                // Fallback: użyj queryCommandValue
                const currentSize = document.queryCommandValue('fontSize');
                if (currentSize && fontSizeSelect) {
                    fontSizeSelect.value = currentSize;
                } else {
                    // Domyślny rozmiar
                    fontSizeSelect.value = '3'; // 16px
                }
            } catch (e) {
                // Ignoruj błędy - nie krytyczne
                console.debug('Błąd wykrywania rozmiaru czcionki:', e);
            }
        };

        // Aktualizuj rozmiar przy kliknięciu w edytor
        editor.addEventListener('click', updateFontSizeSelect);
        editor.addEventListener('mouseup', updateFontSizeSelect);
        editor.addEventListener('keyup', updateFontSizeSelect);
        editor.addEventListener('focus', updateFontSizeSelect);
        
        // Aktualizuj rozmiar przy zmianie zaznaczenia
        document.addEventListener('selectionchange', () => {
            // Sprawdź czy zaznaczenie jest w naszym edytorze
            const selection = window.getSelection();
            if (selection && selection.anchorNode && editor.contains(selection.anchorNode)) {
                updateFontSizeSelect();
            }
        });

        // Składamy edytor
        editorContainer.appendChild(toolbar);
        editorContainer.appendChild(editor);

        // Wstaw edytor zamiast textarea
        textarea.parentNode.insertBefore(editorContainer, textarea);

        console.log('✅ Zainicjowano Rich Text Editor dla:', textareaId);
    },

    createToolbarButton: function(text, title, onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.title = title;
        btn.style.cssText = `
            padding: 6px 12px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.95rem;
            transition: all 0.2s;
        `;
        btn.onmouseover = () => {
            btn.style.background = '#e8f4f8';
            btn.style.borderColor = '#3498db';
        };
        btn.onmouseout = () => {
            btn.style.background = 'white';
            btn.style.borderColor = '#ddd';
        };
        btn.onclick = (e) => {
            e.preventDefault();
            onClick();
        };
        return btn;
    }
};

console.log('📝 Rich Text Editor załadowany');
