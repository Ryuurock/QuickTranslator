/// <reference path="../../typings/interface.d.ts" />

import path from 'path';
import fs from 'fs';
import md5 from 'md5';
import axios from 'axios';
import { is } from 'electron-util';
import { app, Tray, clipboard, BrowserWindow, ipcMain, Notification, Menu } from 'electron';

const API_PATH = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

const userConfigPath = `${app.getPath('userData')}/config.json`;

let userConfig: IUserConfig = {};
let setIntervalTimer: NodeJS.Timeout;
let tray: Tray;

enum ShowType {
  MENUBAR = 'menuBar',
  NOTIFICATION = 'notification',
}

function initTray() {
  tray = new Tray(path.join(process.cwd(), 'static/icon@3x.png'));

  const menuBarType = userConfig.showType === undefined;

  const submenu = Menu.buildFromTemplate([
    {
      type: 'radio',
      label: '菜单栏',
      checked: menuBarType || userConfig.showType === ShowType.MENUBAR,
      click: () => {
        saveConfig({ showType: ShowType.MENUBAR });
      }
    },
    {
      type: 'radio',
      label: '系统通知',
      checked: !menuBarType && userConfig.showType === ShowType.NOTIFICATION,
      click: () => {
        saveConfig({ showType: ShowType.NOTIFICATION });
        tray.setTitle('');
      }
    }
  ]);

  const contextMenu = Menu.buildFromTemplate([
    { label: '翻译展示方式', submenu },
    { role: 'close', label: '退出' }
  ])
  tray.setContextMenu(contextMenu);
}

function start() {
  let curClipboard = clipboard.readText().trim();

  clearInterval(setIntervalTimer);

  setIntervalTimer = setInterval(() => {
    const newclipboard = clipboard.readText().trim();
    if (newclipboard !== curClipboard) {
      curClipboard = newclipboard;
      translate(newclipboard).then(({ trans_result }) => {
        if (trans_result) {
          const result = trans_result.map(({ dst }) => dst).join('').replace(/\n/g, '');
          if (userConfig.showType === ShowType.NOTIFICATION) {
            new Notification({
              title: '翻译结果',
              body: result,
              silent: false,
            }).show();
          } else {
            tray.setTitle(result.length > 15 ? `${result.substr(0, 15)}...` : result);
          }
        }
      });
    }
  }, 500);
}

/**
 * 翻译
 * @param conditionText 待翻译文本
 */
function translate(conditionText: string) {
  const { appId, token } = userConfig;
  const salt = Date.now();
  const sign = md5(`${appId}${conditionText}${salt}${token}`);
  return axios.get<IBaiduResponse>(`${API_PATH}?q=${encodeURIComponent(conditionText)}&from=auto&to=zh&appid=${appId}&salt=${salt}&sign=${sign}`)
    .then(({ data }) => data);
}

function showDialog() {
  const window = new BrowserWindow({
    show: false,
    width: 498,
    height: 242,
    resizable: false,
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

function checkConfig() {
  try {
    userConfig = require(userConfigPath);
    if (!userConfig.appId || !userConfig.token) {
      showDialog();
    } else {
      start();
    }
  } catch (e) {
    showDialog();
  }
}

function saveConfig(newConfig: IUserConfig) {
  Object.assign(userConfig, newConfig);
  fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
}

function initIpcMain() {
  ipcMain
    .on('submit-type-token', (_, token: IUserConfig) => {
      saveConfig(token);
      BrowserWindow.fromWebContents(_.sender).close();
      app.dock.hide();
      start();
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
  checkConfig();
  initTray();
  initIpcMain();
});
