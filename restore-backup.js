/**
 * 🔄 PRZYWRACANIE BACKUPU APLIKACJI KANCELARII
 * 
 * Przywraca aplikację z wybranego backupu.
 * 
 * Użycie:
 * node restore-backup.js [nazwa-folderu-backupu]
 * 
 * Jeśli nie podano nazwy, wyświetli listę dostępnych backupów.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🔄 === PRZYWRACANIE BACKUPU APLIKACJI === 🔄\n');

const appDir = __dirname;
const parentDir = path.dirname(appDir);
const backupRootDir = path.join(parentDir, 'backups');

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
function copyDirectory(source, target) {
    try {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source);
        let copiedFiles = 0;

        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);

            const stats = fs.statSync(sourcePath);

            if (stats.isDirectory()) {
                const result = copyDirectory(sourcePath, targetPath);
                copiedFiles += result;
            } else {
                if (copyFile(sourcePath, targetPath)) {
                    copiedFiles++;
                }
            }
        }

        return copiedFiles;
    } catch (error) {
        console.error(`❌ Błąd kopiowania folderu ${source}:`, error.message);
        return 0;
    }
}

// Funkcja do usuwania folderu rekurencyjnie
function removeDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Błąd usuwania folderu ${dirPath}:`, error.message);
        return false;
    }
}

// Funkcja do listowania backupów
function listBackups() {
    if (!fs.existsSync(backupRootDir)) {
        console.log('❌ Brak folderu backupów!\n');
        return [];
    }

    const items = fs.readdirSync(backupRootDir);
    const backups = items.filter(item => {
        const itemPath = path.join(backupRootDir, item);
        return fs.statSync(itemPath).isDirectory() && item.startsWith('backup_');
    }).sort().reverse(); // Najnowsze na górze

    return backups;
}

// Funkcja do wyświetlania informacji o backupie
function showBackupInfo(backupName) {
    const infoPath = path.join(backupRootDir, backupName, 'backup-info.json');
    if (fs.existsSync(infoPath)) {
        try {
            const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
            console.log(`\n   📅 Data: ${info.date}`);
            console.log(`   📊 Pliki: ${info.total}`);
            if (info.note) {
                console.log(`   📝 Notatka: ${info.note}`);
            }
        } catch (error) {
            console.log('   ⚠️  Brak szczegółowych informacji');
        }
    }
}

// Główna funkcja przywracania
async function restoreBackup(backupName) {
    const backupDir = path.join(backupRootDir, backupName);

    if (!fs.existsSync(backupDir)) {
        console.error(`❌ Backup nie istnieje: ${backupName}\n`);
        return false;
    }

    console.log(`📁 Przywracam backup: ${backupName}`);
    showBackupInfo(backupName);
    console.log();

    // Potwierdź operację
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise((resolve) => {
        rl.question('⚠️  To nadpisze obecną aplikację! Kontynuować? (tak/nie): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'tak') {
        console.log('\n❌ Przywracanie anulowane.\n');
        return false;
    }

    console.log('\n🔄 Rozpoczynam przywracanie...\n');

    let totalCopied = 0;

    // Przywróć frontend
    if (fs.existsSync(path.join(backupDir, 'frontend'))) {
        console.log('🎨 Przywracam frontend...');
        removeDirectory(path.join(appDir, 'frontend'));
        const copied = copyDirectory(
            path.join(backupDir, 'frontend'),
            path.join(appDir, 'frontend')
        );
        console.log(`   ✅ Przywrócono: ${copied} plików\n`);
        totalCopied += copied;
    }

    // Przywróć backend
    if (fs.existsSync(path.join(backupDir, 'backend'))) {
        console.log('⚙️  Przywracam backend...');
        removeDirectory(path.join(appDir, 'backend'));
        const copied = copyDirectory(
            path.join(backupDir, 'backend'),
            path.join(appDir, 'backend')
        );
        console.log(`   ✅ Przywrócono: ${copied} plików\n`);
        totalCopied += copied;
    }

    // Przywróć pliki konfiguracyjne
    console.log('📄 Przywracam pliki konfiguracyjne...');
    const configFiles = [
        'package.json',
        'package-lock.json',
        'server.js',
        '.env',
        'README.md'
    ];

    let configCount = 0;
    for (const file of configFiles) {
        const sourcePath = path.join(backupDir, file);
        const targetPath = path.join(appDir, file);
        if (fs.existsSync(sourcePath)) {
            if (copyFile(sourcePath, targetPath)) {
                configCount++;
            }
        }
    }
    console.log(`   ✅ Przywrócono: ${configCount} plików\n`);
    totalCopied += configCount;

    // Przywróć bazę danych
    console.log('💾 Przywracam bazę danych...');
    const dbFiles = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
    
    let dbCount = 0;
    for (const dbFile of dbFiles) {
        const sourcePath = path.join(backupDir, dbFile);
        const targetPath = path.join(appDir, dbFile);
        if (copyFile(sourcePath, targetPath)) {
            const stats = fs.statSync(sourcePath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`   ✅ ${dbFile} (${sizeInMB} MB)`);
            dbCount++;
        }
    }
    totalCopied += dbCount;

    // Podsumowanie
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 BACKUP PRZYWRÓCONY POMYŚLNIE! 🎉');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 Przywrócono: ${totalCopied} plików`);
    console.log(`📁 Z backupu: ${backupName}`);
    console.log('\n💡 Uruchom ponownie serwer, aby zastosować zmiany.\n');

    return true;
}

// Main
(async () => {
    const backupName = process.argv[2];

    if (!backupName) {
        // Wyświetl listę backupów
        const backups = listBackups();

        if (backups.length === 0) {
            console.log('❌ Nie znaleziono żadnych backupów!\n');
            console.log('💡 Utwórz backup używając: node create-backup.js\n');
            process.exit(1);
        }

        console.log('📦 Dostępne backupy:\n');
        backups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup}`);
            showBackupInfo(backup);
            console.log();
        });

        console.log('\n💡 Aby przywrócić backup, użyj:');
        console.log('   node restore-backup.js [nazwa-backupu]\n');
        console.log('Przykład:');
        console.log(`   node restore-backup.js ${backups[0]}\n`);
        process.exit(0);
    }

    // Przywróć wybrany backup
    const success = await restoreBackup(backupName);
    process.exit(success ? 0 : 1);
})();
