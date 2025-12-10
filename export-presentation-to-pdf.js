const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function exportPresentationToPDF() {
    console.log('🚀 Rozpoczynam eksport prezentacji do PDF...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Ustawienia strony dla prezentacji (16:9 landscape)
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
        
        // Poczekaj chwilę na załadowanie wszystkiego
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Pobierz liczbę slajdów
        const totalSlides = await page.evaluate(() => {
            return document.querySelectorAll('.slide').length;
        });
        
        console.log(`📊 Znaleziono ${totalSlides} slajdów`);
        
        // Katalog na PDF
        const outputDir = path.join(__dirname, 'prezentacja-pdf');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Eksportuj każdy slajd jako osobną stronę
        console.log('📸 Generuję slajdy...');
        
        for (let i = 0; i < totalSlides; i++) {
            console.log(`   Slajd ${i + 1}/${totalSlides}...`);
            
            // Aktywuj konkretny slajd
            await page.evaluate((slideIndex) => {
                const slides = document.querySelectorAll('.slide');
                slides.forEach((slide, index) => {
                    slide.classList.remove('active');
                    if (index === slideIndex) {
                        slide.classList.add('active');
                    }
                });
            }, i);
            
            // Poczekaj na animacje
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Teraz eksportuj cały dokument jako jeden PDF
        console.log('💾 Zapisuję do PDF...');
        const pdfPath = path.join(outputDir, 'Prezentacja-Federacja-AiT-PKP.pdf');
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            landscape: true,
            printBackground: true,
            preferCSSPageSize: false,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });
        
        console.log(`✅ Prezentacja zapisana jako PDF: ${pdfPath}`);
        console.log(`📂 Folder: ${outputDir}`);
        
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
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Eksport nie powiódł się:', error);
        process.exit(1);
    });
