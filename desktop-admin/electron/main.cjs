const { app, BrowserWindow } = require('electron');
const path = require('node:path');
app.setPath('userData', path.resolve(__dirname, '../../.data/electron'));
app.whenReady().then(async () => {
  await require('./local-index.cjs').init();
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  require('./photo-import.cjs').register(win);
  require('./cloud-import.cjs').register(win);
  require('./print.cjs').register(win);
  await win.loadFile(path.join(__dirname, '../dist/index.html'));
  if (process.argv.includes('--smoke-test')) {
    console.log('ELECTRON_SMOKE_OK');
    app.quit();
  }
});
app.on('window-all-closed', () => app.quit());
