import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { initializeDatabase } from './db';
import { registerBooksHandlers } from './ipc/books';
import { registerProgressHandlers } from './ipc/progress';
import { registerNotesHandlers } from './ipc/notes';
import { registerFilesHandlers } from './ipc/files';
import { registerSettingsHandlers } from './ipc/settings';
import { registerStatsHandlers } from './ipc/stats';
import { registerShelfHandlers } from './ipc/shelves';
import { initializeVault } from './services/vault';

let mainWindow: BrowserWindow | null = null;

// Check if running in development by looking for Vite dev server
const isDev = !app.isPackaged;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'ShelfSpace',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for better-sqlite3
    },
  });

  // Remove menu bar in production
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }

  if (isDev) {
    // Load from Vite dev server
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Load from built files
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Auto-updater configuration and event handlers
function setupAutoUpdater(): void {
  if (isDev) {
    console.log('Auto-updater disabled in development mode');
    return;
  }

  // Configure auto-updater
  autoUpdater.autoDownload = false; // Let user choose when to download
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates on app start
  autoUpdater.checkForUpdates();

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000);

  // Event: Update available
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info);
    }
  });

  // Event: Update not available
  autoUpdater.on('update-not-available', () => {
    console.log('App is up to date');
  });

  // Event: Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
  });

  // Event: Download progress
  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-progress', progress);
    }
  });

  // Event: Error
  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', error.message);
    }
  });
}

async function initialize(): Promise<void> {
  // Initialize database
  await initializeDatabase();
  
  // Initialize book vault directory
  await initializeVault();
  
  // Register IPC handlers
  registerBooksHandlers(ipcMain);
  registerProgressHandlers(ipcMain);
  registerNotesHandlers(ipcMain);
  registerFilesHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerStatsHandlers(ipcMain);
  registerShelfHandlers();
  
  // Register update IPC handlers
  ipcMain.handle('check-for-updates', async () => {
    if (!isDev) {
      return await autoUpdater.checkForUpdates();
    }
    return null;
  });

  ipcMain.handle('download-update', async () => {
    if (!isDev) {
      return await autoUpdater.downloadUpdate();
    }
    return null;
  });

  ipcMain.handle('install-update', () => {
    if (!isDev) {
      autoUpdater.quitAndInstall();
    }
  });
}

app.whenReady().then(async () => {
  await initialize();
  await createWindow();
  
  // Setup auto-updater after window is created
  setupAutoUpdater();

  app.on('activate', async () => {
    // macOS: re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // macOS: apps stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
