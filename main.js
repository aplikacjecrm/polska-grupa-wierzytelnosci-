const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
// Backend wyłączony - uruchom osobno: node backend/server.js
// const { startBackendServer } = require(path.join(__dirname, 'backend', 'server'));

let mainWindow;
let backendServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#1a1a2e',
    show: true
  });

  // Debug: informacja o ładowaniu
  console.log('📱 Creating window...');
  console.log('📂 Loading:', path.join(__dirname, 'frontend', 'index.html'));

  // Menu aplikacji
  const menuTemplate = [
    {
      label: 'Plik',
      submenu: [
        {
          label: 'Nowa wiadomość',
          accelerator: 'Ctrl+N',
          click: () => mainWindow.webContents.send('new-message')
        },
        { type: 'separator' },
        {
          label: 'Wyloguj',
          click: () => mainWindow.webContents.send('logout')
        },
        { type: 'separator' },
        {
          label: 'Zakończ',
          accelerator: 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Widok',
      submenu: [
        {
          label: 'Poczta',
          accelerator: 'Ctrl+1',
          click: () => mainWindow.webContents.send('switch-view', 'mail')
        },
        {
          label: 'Czat',
          accelerator: 'Ctrl+2',
          click: () => mainWindow.webContents.send('switch-view', 'chat')
        },
        { type: 'separator' },
        { role: 'reload', label: 'Odśwież' },
        { role: 'toggleDevTools', label: 'Narzędzia deweloperskie' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pełny ekran' }
      ]
    },
    {
      label: 'Pomoc',
      submenu: [
        {
          label: 'O aplikacji',
          click: () => mainWindow.webContents.send('show-about')
        },
        {
          label: 'Dokumentacja',
          click: () => require('electron').shell.openExternal('https://e-pgw.pl/kontakt')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile('frontend/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Tymczasowo wyłączone - backend wymaga konfiguracji
  // backendServer = await startBackendServer();
  console.log('⚠️  Backend wyłączony - uruchom osobno: node backend/server.js');
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendServer) {
      backendServer.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendServer) {
    backendServer.close();
  }
});

// IPC Handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

ipcMain.on('toggle-devtools', () => {
  mainWindow.webContents.toggleDevTools();
});
