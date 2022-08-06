/// <reference path="../../typings/interface.d.ts" />

import path from 'path';
import { autoUpdater } from 'electron-updater';
import qs from 'query-string';
import fs from 'fs';
import { is } from 'electron-util';
import { app, Tray, clipboard, BrowserWindow, ipcMain, Notification, Menu, dialog, BrowserWindowConstructorOptions, shell, systemPreferences } from 'electron';
import { THEME_COLOR_CHANGE } from '../common/event';
import { baiduTranslate } from './platform/baidu';
import { chineseCharacterReg, letterReg } from './platform/utils';
import { tencentTranslator } from './platform/tencent';

autoUpdater
  .on('download-progress', (e) => {
    console.log('progress', e);
  })
  .on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  })


const userConfigPath = `${app.getPath('userData')}/config.json`;

let userConfig: IUserConfig = {};
let setIntervalTimer: NodeJS.Timeout;
let tray: Tray;

enum ShowType {
  MENUBAR = 'menuBar',
  NOTIFICATION = 'notification',
}

enum WindowTitle {
  EditConfig = '编辑配置信息',
}


function initTray() {
  tray = new Tray(path.join(__dirname, is.development ? '../..' : '..', '/resources/tray/iconTemplate.png'));

  tray
    .on('click', () => {
      console.log('click')
    })
    .on('right-click', () => {
      console.log('right-click')
    })

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
    { label: '修改APP ID', click: () => {
      showDialog({ param: userConfig });
    } },
    { type: 'separator' },
    {
      label: '检查更新', click: (e) => {
        autoUpdater.checkForUpdates();
        autoUpdater
          .once('update-not-available', (e) => {
            dialog.showMessageBox({ message: '暂时没有可用的更新。' });
          })
          .once('update-available', (e) => {
            dialog.showMessageBox({ message: '检测到更新，自动下载中，下载完成将自动重启应用。' });
          })
      }
    },
    { label: '反馈', click: () => {
      shell.openExternal('https://github.com/Ryuurock/QuickTranslator/issues')
    } },
    { label: '帮助', click: () => {
      dialog.showMessageBox({ message: '通过不停读取剪切板监听变化来翻译文本。\n展示方式有菜单栏和系统通知。\n使用系统通知记得关闭通知音哦。' });
    } },
    { type: 'separator' },
    { label: '退出', click: () => {
      app.quit();
    } }
  ])
  tray.setContextMenu(contextMenu);
}

let curClipboard = '';

function start() {
  app.dock.hide();

  clearInterval(setIntervalTimer);

  setIntervalTimer = global.setInterval(() => {
    const newClipboardText = clipboard.readText().trim();
    if (newClipboardText.length > 25 || /[{}\[\]!@#$%^&*()+=;?/]/.test(newClipboardText)) {
      return;
    }

    const letter = newClipboardText.match(letterReg);
    const chineseCharacter = newClipboardText.match(chineseCharacterReg);

    if (newClipboardText !== curClipboard && (letter || chineseCharacter)) {
      curClipboard = newClipboardText;

      tencentTranslator(newClipboardText, userConfig)
        .then((result) => {
          if (userConfig.showType === ShowType.NOTIFICATION) {
            new Notification({
              title: '翻译结果',
              body: result,
              silent: false,
            }).show();
          } else {
            tray.setTitle(result.length > 20 ? `${result.substring(0, 20)}...` : result);
          }
        });
    }
  }, 500);
}


function showDialog(param?: { path?: string, param?: any }, windowOption?: BrowserWindowConstructorOptions) {
  const defaultParam = Object.assign({}, {
    path: '/',
    param: {},
  }, param);

  const defaultWindowOption: BrowserWindowConstructorOptions = {
    show: false,
    width: 498,
    height: 242,
    resizable: false,
    title: WindowTitle.EditConfig,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    vibrancy: 'under-window',
    fullscreen: false,
    ...windowOption
  };

  const maybeCreated = BrowserWindow.getAllWindows().find((win) => win.getTitle() === defaultWindowOption.title)

  if (maybeCreated) {
    maybeCreated.show();
    maybeCreated.focus();
  } else {
    const window = new BrowserWindow(defaultWindowOption);

    // window.setAlwaysOnTop(true);

    // window.webContents.openDevTools();

    const path = is.development ? `http://127.0.0.1:${process.env.PORT || 1212}` : `file://${__dirname}/index.html`;

    window.loadURL(`${path}#${defaultParam.path}?${qs.stringify(defaultParam.param)}`);

    window.on('close', () => {
      if (!fs.existsSync(userConfigPath)) {
        app.quit();
      }
    });
  }

}

function checkConfig() {
  try {
    userConfig = JSON.parse(fs.readFileSync(userConfigPath).toString());
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
      BrowserWindow.fromWebContents(_.sender)?.close();
      start();
    })
    .on('react-did-mounted', (_) => {
      const currentWindow = BrowserWindow.fromWebContents(_.sender);
      currentWindow?.show();
      currentWindow?.focus();
      _.returnValue = systemPreferences.getAccentColor();
    });
}

function startWatchThemeColor() {
  let oldColor = '';
  setInterval(() => {
    const newColor = systemPreferences.getAccentColor();
    if (oldColor !== newColor) {
      oldColor = newColor;
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(THEME_COLOR_CHANGE, newColor);
      });
    }
  }, 1e3);
}

app
  // Don't quit app when closing any spawned windows
  .on('window-all-closed', (e: Event) => {
    e.preventDefault();
  })
  .on('ready', () => {
    checkConfig();
    initTray();
    initIpcMain();
    startWatchThemeColor();

    if (!is.development) {
      autoUpdater.checkForUpdates();
    }
  });
