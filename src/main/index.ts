/// <reference path="../../typings/interface.d.ts" />

import path from 'path';
import { autoUpdater } from 'electron-updater';
import qs from 'query-string';
import fs from 'fs';
import md5 from 'md5';
import axios from 'axios';
import { is } from 'electron-util';
import { app, Tray, clipboard, BrowserWindow, ipcMain, Notification, Menu, dialog, BrowserWindowConstructorOptions, shell, systemPreferences } from 'electron';
import { THEME_COLOR_CHANGE } from '../common/event';

autoUpdater
  .on('download-progress', (e) => {
    console.log('progress', e);
  })
  .on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  })

const API_PATH = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

const userConfigPath = `${app.getPath('userData')}/config.json`;

let userConfig: IUserConfig = {};
let setIntervalTimer: number;
let tray: Tray;

let retryCount = 0;

enum ShowType {
  MENUBAR = 'menuBar',
  NOTIFICATION = 'notification',
}

enum WindowTitle {
  EditConfig = '编辑配置信息',
}

const ErrorText: {
  [key in string]: {
    title: string,
    message?: string,
  }
} = {
  52002: {
    title: '系统错误',
  },
  52003: {
    title: '未授权用户',
    message: '检查您的 appid 是否正确，或者服务是否开通',
  },
  54003: {
    title: '访问频率受限',
    message: '您的请求频率过快，请降低翻译请求频率',
  },
  58002: {
    title: '服务当前已关闭',
    message: '请前往管理控制台开启服务',
  },
  90107: {
    title: '认证未通过或未生效',
    message: '请前往百度翻译开放平台查看认证进度',
  },
};

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

function start() {
  app.dock.hide();
  let curClipboard = clipboard.readText().trim();

  clearInterval(setIntervalTimer);

  setIntervalTimer = setInterval(() => {
    const newClipboardText = clipboard.readText().trim();
    if (newClipboardText !== curClipboard) {
      curClipboard = newClipboardText;
      retryCount = 0;
      baiduTranslate(newClipboardText, (result) => {
        if (userConfig.showType === ShowType.NOTIFICATION) {
          new Notification({
            title: '翻译结果',
            body: result,
            silent: false,
          }).show();
        } else {
          tray.setTitle(result.length > 15 ? `${result.substr(0, 15)}...` : result);
        }
      });
    }
  }, 500);
}

/**
 * 翻译
 * @param conditionText 待翻译文本
 */
async function baiduTranslate(conditionText: string, callback: (trans_result: string) => void) {
  const { appId, token } = userConfig;
  const salt = Date.now();
  const sign = md5(`${appId}${conditionText}${salt}${token}`);
  console.time('用时')
  const data = await axios.get<IBaiduResponse>(`${API_PATH}?q=${encodeURIComponent(conditionText)}&from=auto&to=zh&appid=${appId}&salt=${salt}&sign=${sign}`)
    .then(({ data }) => data);
  console.timeEnd('用时')

  const { error_code, trans_result }  = data;

  if (!error_code) {
    trans_result && callback(trans_result.map(({ dst }) => dst).join('').replace(/\n/g, ''));
  } else {
    const error = ErrorText[error_code];
    if (error) {
      const messageBox = dialog.showMessageBox({
        title: error.title,
        message: error.message || '',
        type: 'error'
      });
      if (error_code === '52003') {
        messageBox.then(() => {
          showDialog({ param: userConfig });
        });
      }
    }

    if (error_code === '52001' && retryCount < 3) {
      // 翻译超时，重试
      baiduTranslate(conditionText, callback);
      retryCount += 1;
    }
  }
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
      nodeIntegration: true
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

    window.webContents.openDevTools();

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
      BrowserWindow.fromWebContents(_.sender).close();
      start();
    })
    .on('react-did-mounted', (_) => {
      const currentWindow = BrowserWindow.fromWebContents(_.sender);
      currentWindow.show();
      currentWindow.focus();
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
