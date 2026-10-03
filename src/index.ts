import { app, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import ADB from './ADB/index.js';
import Q6 from './Q6/index.js';
import AndroidDevice from './AndroidDevice/index.js';


/* cspell:words scrcpy */
let tray : Tray | null = null;
app.whenReady().then(() => {
    const iconPath = path.join(__dirname, '../tray.png');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip('Android Device');
    const andriodDevice = new AndroidDevice("5731")
    function setTrayContextMenu() {
        let contextMenu : Electron.Menu;
        if (Q6.isConnected) {
            contextMenu = Menu.buildFromTemplate([
                { label: 'Disconnect', click: () => { Q6.disconnect() } },
                { label: 'Quit', click: () => { Q6.disconnect(); app.quit(); } }
            ]);
        } else {
            contextMenu = Menu.buildFromTemplate([
                
                { label: 'Connect', click: () => { Q6.connect() } },
                { label: 'Connect (Auto Reconnect)', click: () => { Q6.connect(true) } },
                { type: 'separator' },
                { label: 'Quit', click: () => { app.quit(); } }
            ]);
        }
        if (contextMenu) tray?.setContextMenu(contextMenu);
    }
    setTrayContextMenu();
    Q6.onConnectionStatusChanged = function (isConnected:boolean) {
        setTrayContextMenu();
    }

    // Click event
    tray.on('click', () => {
        Q6.connect();
    });
});

