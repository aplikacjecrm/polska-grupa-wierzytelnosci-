const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function exportPresentationToPDF() {
    console.log('🚀 Rozpoczynam eksport prezentacji do PDF (wersja do druku)...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Ustawienia strony dla prezentacji - pełny rozmiar HD a potem skalujemy do A4
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
        
        // Ukryj przyciski nawigacyjne i licznik - NIE SĄ POTRZEBNE W PDF
        await page.evaluate(() => {
            const controls = document.querySelector('.controls');
            const counter = document.querySelector('.slide-counter');
            if (controls) controls.style.display = 'none';
            if (counter) counter.style.display = 'none';
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
        console.log('📸 Generuję slajdy do druku...');
        
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
            
            // Poczekaj dłużej na pełne renderowanie i ukrycie poprzednich
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // Zapisz ten slajd jako osobny PDF w formacie A4 landscape
            const slidePdfPath = path.join(tempDir, `slide-${i + 1}.pdf`);
            
            await page.pdf({
                path: slidePdfPath,
                format: 'A4',
                landscape: true,
                printBackground: true,
                preferCSSPageSize: false,
                scale: 0.7, // Skalowanie aby treść HD zmieściła się na A4
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
        const finalPdfPath = path.join(outputDir, 'Prezentacja-Federacja-AiT-PKP-DRUK.pdf');
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
        console.log('🖨️  PDF gotowy do druku na standardowych drukarkach A4!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Eksport nie powiódł się:', error);
        process.exit(1);
    });
