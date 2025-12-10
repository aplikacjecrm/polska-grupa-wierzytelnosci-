const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function exportPresentationToPDF() {
    console.log('🚀 Rozpoczynam eksport prezentacji do PDF (białe tło - oszczędność tuszu)...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Ustawienia strony dla prezentacji - pełny rozmiar HD
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2
        });
        
        // Ścieżka do pliku HTML
        const htmlPath = path.join(__dirname, 'prezentacja-federacja-ait-standalone.html');
        const fileUrl = `file://${htmlPath}`;
        
        console.log(`📄 Ładuję prezentację z: ${htmlPath}`);
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        // Zmiana stylów na białe tło i ciemne czcionki
        await page.evaluate(() => {
            // Ukryj przyciski nawigacyjne i licznik
            const controls = document.querySelector('.controls');
            const counter = document.querySelector('.slide-counter');
            if (controls) controls.style.display = 'none';
            if (counter) counter.style.display = 'none';
            
            // BIAŁE TŁO zamiast niebieskiego gradientu
            document.body.style.background = '#ffffff';
            document.body.style.color = '#1e3a5f'; // Ciemny niebieski tekst
            
            // Wszystkie slajdy - białe tło
            const slides = document.querySelectorAll('.slide');
            slides.forEach(slide => {
                slide.style.background = '#ffffff';
                slide.style.color = '#1e3a5f';
            });
            
            // Nagłówki H1 - ciemny niebieski zamiast złotego
            const h1Elements = document.querySelectorAll('h1');
            h1Elements.forEach(h1 => {
                h1.style.color = '#1e3a5f';
                h1.style.textShadow = 'none';
            });
            
            // Nagłówki H2 - ciemny niebieski z granatową ramką
            const h2Elements = document.querySelectorAll('h2');
            h2Elements.forEach(h2 => {
                h2.style.color = '#1e3a5f';
                h2.style.borderBottomColor = '#2c5282';
                h2.style.textShadow = 'none';
            });
            
            // Nagłówki H3 - ciemny niebieski
            const h3Elements = document.querySelectorAll('h3');
            h3Elements.forEach(h3 => {
                h3.style.color = '#2c5282';
            });
            
            // Paragrafy i listy - ciemny tekst
            const textElements = document.querySelectorAll('p, li');
            textElements.forEach(el => {
                el.style.color = '#333333';
            });
            
            // Wyróżnienia - szare tło zamiast złotego
            const highlights = document.querySelectorAll('.highlight');
            highlights.forEach(highlight => {
                highlight.style.background = '#f0f0f0';
                highlight.style.borderLeftColor = '#2c5282';
            });
            
            // Karty partnerów - szare tło
            const partnerCards = document.querySelectorAll('.partner-card');
            partnerCards.forEach(card => {
                card.style.background = '#f5f5f5';
                card.style.borderColor = '#2c5282';
            });
            
            // Statystyki - zielone pozostają ale na białym
            const statBoxes = document.querySelectorAll('.stat-box');
            statBoxes.forEach(box => {
                box.style.background = '#e8f5e9';
                box.style.borderColor = '#4CAF50';
            });
            
            // Kolumny - szare tło
            const columns = document.querySelectorAll('.column');
            columns.forEach(col => {
                col.style.background = '#f5f5f5';
                col.style.border = '1px solid #ddd';
            });
            
            // CTA - pozostaw zielone ale jaśniejsze
            const ctas = document.querySelectorAll('.cta');
            ctas.forEach(cta => {
                cta.style.background = '#4CAF50';
                cta.style.color = '#ffffff';
            });
            
            // Linki - ciemne
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                link.style.color = '#1e3a5f';
            });
            
            // Subtitle - ciemny niebieski
            const subtitles = document.querySelectorAll('.subtitle, .railway-subtitle');
            subtitles.forEach(sub => {
                sub.style.color = '#2c5282';
            });
            
            // Railway name - ciemny
            const railwayNames = document.querySelectorAll('.railway-name');
            railwayNames.forEach(name => {
                name.style.color = '#1e3a5f';
                name.style.textShadow = 'none';
            });
        });
        
        // Poczekaj chwilę na załadowanie wszystkiego
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Pobierz liczbę slajdów
        const totalSlides = await page.evaluate(() => {
            return document.querySelectorAll('.slide').length;
        });
        
        console.log(`📊 Znaleziono ${totalSlides} slajdów`);
        
        // Katalog tymczasowy na PDF
        const outputDir = path.join(__dirname, 'prezentacja-pdf');
        const tempDir = path.join(outputDir, 'temp');
        
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Tablica ścieżek do PDF
        const pdfPaths = [];
        
        // Eksportuj każdy slajd jako osobny PDF
        console.log('📸 Generuję slajdy do druku (białe tło)...');
        
        for (let i = 0; i < totalSlides; i++) {
            console.log(`   Slajd ${i + 1}/${totalSlides}...`);
            
            // Aktywuj konkretny slajd - CAŁKOWICIE ukryj pozostałe
            await page.evaluate((slideIndex) => {
                const slides = document.querySelectorAll('.slide');
                slides.forEach((slide, index) => {
                    slide.classList.remove('active');
                    if (index === slideIndex) {
                        // Pokaż TYLKO ten slajd
                        slide.classList.add('active');
                        slide.style.opacity = '1';
                        slide.style.visibility = 'visible';
                        slide.style.display = 'flex';
                        slide.style.zIndex = '1000';
                        slide.style.position = 'absolute';
                        slide.style.top = '0';
                        slide.style.left = '0';
                    } else {
                        // CAŁKOWICIE ukryj pozostałe slajdy
                        slide.style.opacity = '0';
                        slide.style.visibility = 'hidden';
                        slide.style.display = 'none';
                        slide.style.zIndex = '-1';
                    }
                });
            }, i);
            
            // Poczekaj dłużej na pełne renderowanie
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // Zapisz ten slajd jako osobny PDF w formacie A4 landscape
            const slidePdfPath = path.join(tempDir, `slide-${i + 1}.pdf`);
            
            await page.pdf({
                path: slidePdfPath,
                format: 'A4',
                landscape: true,
                printBackground: true,
                preferCSSPageSize: false,
                scale: 0.7,
                pageRanges: '1',
                margin: {
                    top: '5mm',
                    right: '5mm',
                    bottom: '5mm',
                    left: '5mm'
                }
            });
            
            pdfPaths.push(slidePdfPath);
        }
        
        console.log('📦 Łączę wszystkie slajdy w jeden PDF...');
        
        // Połącz wszystkie PDF w jeden
        const mergedPdf = await PDFDocument.create();
        
        for (const pdfPath of pdfPaths) {
            const pdfBytes = fs.readFileSync(pdfPath);
            const pdf = await PDFDocument.load(pdfBytes);
            const [page] = await mergedPdf.copyPages(pdf, [0]);
            mergedPdf.addPage(page);
        }
        
        // Zapisz scalony PDF
        const finalPdfPath = path.join(outputDir, 'Prezentacja-Federacja-AiT-PKP-BIALE-TLO.pdf');
        const pdfBytes = await mergedPdf.save();
        fs.writeFileSync(finalPdfPath, pdfBytes);
        
        // Usuń tymczasowe pliki
        console.log('🧹 Sprzątam pliki tymczasowe...');
        for (const pdfPath of pdfPaths) {
            fs.unlinkSync(pdfPath);
        }
        fs.rmdirSync(tempDir);
        
        console.log(`✅ Prezentacja zapisana jako PDF: ${finalPdfPath}`);
        console.log(`📂 Folder: ${outputDir}`);
        console.log(`📄 Liczba stron: ${totalSlides}`);
        console.log(`📐 Format: A4 Landscape (297 x 210 mm)`);
        console.log(`💡 Białe tło - oszczędność tuszu/tonera!`);
        
    } catch (error) {
        console.error('❌ Błąd podczas eksportu:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Uruchom eksport
exportPresentationToPDF()
    .then(() => {
        console.log('\n🎉 Eksport zakończony pomyślnie!');
        console.log('🖨️  PDF gotowy do druku - WERSJA EKONOMICZNA (białe tło)!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Eksport nie powiódł się:', error);
        process.exit(1);
    });
