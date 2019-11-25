import path from 'path';
import fs from 'fs';
import { is } from 'electron-util';
import { app, Tray, clipboard, dialog, BrowserWindow } from 'electron';

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
  const userConfigPath = `${app.getPath('userData')}/config.json`;
  if (!fs.existsSync(userConfigPath)) {
    const window = new BrowserWindow({
      show: true,
      width: 380,
      height: 240,
      webPreferences: {
        nodeIntegration: true
      }
    });

    window.loadURL(is.development ? `http://127.0.0.1:${process.env.PORT || 1212}/dist/` : '');

    window.webContents.on('did-finish-load', () => {
      window.show();
      window.focus();
    });
  }
}

// Don't quit app when closing any spawned windows
app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

app.on('ready', () => {
  checkConfig();
  start();
});

// app.dock.hide();
