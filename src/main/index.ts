import path from 'path';
import fs from 'fs';
import { is } from 'electron-util';
import { app, Tray, clipboard, BrowserWindow, ipcMain, webContents } from 'electron';

const userConfigPath = `${app.getPath('userData')}/config.json`;

function start() {
  const tray = new Tray(path.join(process.cwd(), 'static/icon@3x.png'));
  let curClipboard = clipboard.readText().trim();

  setInterval(() => {
    const newclipboard = clipboard.readText().trim();
    if (newclipboard !== curClipboard) {
      curClipboard = newclipboard;
      tray.setTitle(Math.random() + '');
    }
  }, 500);
}

function checkConfig() {
  if (!fs.existsSync(userConfigPath)) {

    const window = new BrowserWindow({
      show: false,
      width: 498,
      height: 240,
      title: '提示',
      maximizable: false,
      minimizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    // window.webContents.openDevTools();

    window.loadURL(is.development ? `http://127.0.0.1:${process.env.PORT || 1212}/dist/` : '');

    window.on('close', () => {
      if (!fs.existsSync(userConfigPath)) {
        app.quit();
      }
    });
  }
}

function initIpcMain() {
  ipcMain
    .on('submit-type-token', (_, token) => {
      fs.writeFileSync(userConfigPath, JSON.stringify(token));
      BrowserWindow.fromWebContents(_.sender).close();
      app.dock.hide();
    })
    .on('react-did-mounted', (_) => {
      const currentWindow = BrowserWindow.fromWebContents(_.sender);
      currentWindow.show();
      currentWindow.focus();
    });
}

// Don't quit app when closing any spawned windows
app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

app.on('ready', () => {
  initIpcMain();
  checkConfig();
  start();
});
