/**
 * 🔒 BACKUP APLIKACJI KANCELARII
 * 
 * Tworzy pełną kopię zapasową aplikacji:
 * - Wszystkie pliki frontend i backend
 * - Baza danych SQLite
 * - Konfiguracja
 * 
 * Backup zapisywany w folderze: ../backups/
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 === TWORZENIE BACKUPU APLIKACJI === 🔒\n');

// Funkcja do tworzenia timestampu
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Funkcja do kopiowania pliku
function copyFile(source, target) {
    try {
        const targetDir = path.dirname(target);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(source, target);
        return true;
    } catch (error) {
        console.error(`❌ Błąd kopiowania ${source}:`, error.message);
        return false;
    }
}

// Funkcja do kopiowania folderu rekurencyjnie
function copyDirectory(source, target, excludeDirs = []) {
    try {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source);
        let copiedFiles = 0;
        let skippedFiles = 0;

        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);

            // Sprawdź czy folder jest wykluczony
            if (excludeDirs.includes(item)) {
                console.log(`⏭️  Pomijam folder: ${item}`);
                skippedFiles++;
                continue;
            }

            const stats = fs.statSync(sourcePath);

            if (stats.isDirectory()) {
                const result = copyDirectory(sourcePath, targetPath, excludeDirs);
                copiedFiles += result.copied;
                skippedFiles += result.skipped;
            } else {
                if (copyFile(sourcePath, targetPath)) {
                    copiedFiles++;
                } else {
                    skippedFiles++;
                }
            }
        }

        return { copied: copiedFiles, skipped: skippedFiles };
    } catch (error) {
        console.error(`❌ Błąd kopiowania folderu ${source}:`, error.message);
        return { copied: 0, skipped: 0 };
    }
}

// Główna funkcja backupu
async function createBackup() {
    const timestamp = getTimestamp();
    const appDir = __dirname;
    const parentDir = path.dirname(appDir);
    const backupRootDir = path.join(parentDir, 'backups');
    const backupDir = path.join(backupRootDir, `backup_${timestamp}`);

    console.log(`📁 Folder aplikacji: ${appDir}`);
    console.log(`💾 Folder backupu: ${backupDir}\n`);

    // Utwórz folder backupów
    if (!fs.existsSync(backupRootDir)) {
        fs.mkdirSync(backupRootDir, { recursive: true });
        console.log('✅ Utworzono folder backupów\n');
    }

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Lista folderów do wykluczenia z backupu
    const excludeDirs = ['node_modules', 'backups', '.git'];

    console.log('📦 Kopiuję pliki aplikacji...\n');
    
    // Kopiuj frontend
    console.log('🎨 Frontend...');
    const frontendResult = copyDirectory(
        path.join(appDir, 'frontend'),
        path.join(backupDir, 'frontend'),
        excludeDirs
    );
    console.log(`   ✅ Skopiowano: ${frontendResult.copied} plików\n`);

    // Kopiuj backend
    console.log('⚙️  Backend...');
    const backendResult = copyDirectory(
        path.join(appDir, 'backend'),
        path.join(backupDir, 'backend'),
        excludeDirs
    );
    console.log(`   ✅ Skopiowano: ${backendResult.copied} plików\n`);

    // Kopiuj pliki główne (package.json, server.js, itp.)
    console.log('📄 Pliki konfiguracyjne...');
    const configFiles = [
        'package.json',
        'package-lock.json',
        'server.js',
        '.env',
        'README.md'
    ];

    let configCount = 0;
    for (const file of configFiles) {
        const sourcePath = path.join(appDir, file);
        const targetPath = path.join(backupDir, file);
        if (fs.existsSync(sourcePath)) {
            if (copyFile(sourcePath, targetPath)) {
                configCount++;
            }
        }
    }
    console.log(`   ✅ Skopiowano: ${configCount} plików\n`);

    // Kopiuj bazę danych
    console.log('💾 Baza danych...');
    const dbFiles = [
        'database.db',
        'komunikator.db',
        'kancelaria.db'
    ];

    let dbCount = 0;
    for (const dbFile of dbFiles) {
        const sourcePath = path.join(appDir, dbFile);
        const targetPath = path.join(backupDir, dbFile);
        if (fs.existsSync(sourcePath)) {
            if (copyFile(sourcePath, targetPath)) {
                const stats = fs.statSync(sourcePath);
                const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                console.log(`   ✅ ${dbFile} (${sizeInMB} MB)`);
                dbCount++;
            }
        }
    }
    console.log();

    // Stwórz plik info o backupie
    const backupInfo = {
        timestamp: timestamp,
        date: new Date().toLocaleString('pl-PL'),
        files: {
            frontend: frontendResult.copied,
            backend: backendResult.copied,
            config: configCount,
            database: dbCount
        },
        total: frontendResult.copied + backendResult.copied + configCount + dbCount,
        excludedDirs: excludeDirs,
        note: 'Backup przed dalszymi zmianami - aplikacja działa poprawnie na tym etapie'
    };

    fs.writeFileSync(
        path.join(backupDir, 'backup-info.json'),
        JSON.stringify(backupInfo, null, 2)
    );

    // Podsumowanie
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 BACKUP ZAKOŃCZONY POMYŚLNIE! 🎉');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📅 Data: ${backupInfo.date}`);
    console.log(`📁 Lokalizacja: ${backupDir}`);
    console.log(`\n📊 Statystyki:`);
    console.log(`   Frontend:      ${backupInfo.files.frontend} plików`);
    console.log(`   Backend:       ${backupInfo.files.backend} plików`);
    console.log(`   Konfiguracja:  ${backupInfo.files.config} plików`);
    console.log(`   Bazy danych:   ${backupInfo.files.database} plików`);
    console.log(`   ─────────────────────────────────`);
    console.log(`   RAZEM:         ${backupInfo.total} plików`);
    console.log('\n💡 Aby przywrócić backup, skopiuj pliki z folderu:');
    console.log(`   ${backupDir}`);
    console.log('   z powrotem do folderu aplikacji.\n');
    
    // Wyświetl rozmiar backupu
    try {
        const { execSync } = require('child_process');
        // Dla Windows użyj robocopy do obliczenia rozmiaru (w KB)
        // Dla prostoty, policzymy ręcznie
        let totalSize = 0;
        
        function getDirectorySize(dirPath) {
            let size = 0;
            try {
                const items = fs.readdirSync(dirPath);
                for (const item of items) {
                    const itemPath = path.join(dirPath, item);
                    const stats = fs.statSync(itemPath);
                    if (stats.isDirectory()) {
                        size += getDirectorySize(itemPath);
                    } else {
                        size += stats.size;
                    }
                }
            } catch (error) {
                // Ignoruj błędy
            }
            return size;
        }
        
        totalSize = getDirectorySize(backupDir);
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        console.log(`📦 Rozmiar backupu: ${sizeInMB} MB\n`);
    } catch (error) {
        // Ignoruj błędy obliczania rozmiaru
    }

    return backupDir;
}

// Uruchom backup
createBackup().catch(error => {
    console.error('\n❌ BŁĄD PODCZAS TWORZENIA BACKUPU:');
    console.error(error);
    process.exit(1);
});
