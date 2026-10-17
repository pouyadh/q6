/* cspell:words scrcpy */
import { app, Tray, Menu, nativeImage, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import singleInstance from './util/singleInstance.js';
import getTrayContextMenu from './AndroidDevice/static/getTrayContextMenu.js';
import AndroidDevice from './AndroidDevice/AndroidDevice.js';


let tray: Electron.Tray | null = null;

const showTrayContextMenu = async () => {
  try {
    tray?.popUpContextMenu(await getTrayContextMenu());
  } catch (error) {
    console.error('Failed to refresh Android device tray menu:', error);
  }
};

singleInstance(showTrayContextMenu);


// @ts-ignore
app.on('window-all-closed', (e: Electron.Event) => e.preventDefault());

(async () => {

  await app.whenReady();
  const iconPath = path.join(__dirname, '../tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('Android Device');
  tray.on('click', () => void showTrayContextMenu());
  tray.on('right-click', () => void showTrayContextMenu());
  
})();