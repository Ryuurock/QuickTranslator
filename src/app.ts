import path from 'path';
import { app, Tray, clipboard } from 'electron';

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

// Don't quit app when closing any spawned windows
app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

app.on('ready', () => {
  start();
});

app.dock.hide();
