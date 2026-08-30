import { app, Tray, Menu, nativeImage } from 'electron';
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import readline from "node:readline";
import killApp from './killApp.js';
import delay from './delay.js';
import path from 'node:path';

/* cspell:words scrcpy */

class ScrCpy {
    static process : ChildProcessWithoutNullStreams | null = null ;
    static readlineOut : readline.Interface | null = null ;
    static readlineErr : readline.Interface | null = null ;
    static isRunning() {
        return this.process && this.process.exitCode === null && !this.process.killed;
    }
    static async run(restartIfRunning:boolean = false) {
        if (this .isRunning() && !restartIfRunning) {
            console.log('scrcpy is already running...');
            return;
        }
        killApp('scrcpy');
        await delay(1000);
        try {
            return await new Promise<void>((res,rej) => {
                this.process = spawn('scrcpy',['--power-off-on-close','--verbosity=debug']);
                this.readlineOut = readline.createInterface({
                    input: this.process.stdout,
                    crlfDelay: Infinity
                });
                this.readlineErr = readline.createInterface({
                    input: this.process.stderr,
                    crlfDelay: Infinity
                });
                this.process.on('spawn',()=> {
                    console.error('scrcpy is running ...');
                    res();
                });
                this.process.on('error',(err)=>{
                    console.error('running scrcpy failed.');
                    rej(err);
                })
                this.process.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    this .close();
                });
            });
        } catch (err) {
            return err;
        }
    }
    static close() {
        if (this .readlineOut) {
            this.readlineOut.removeAllListeners();
            this.readlineOut.close();
        }
        if (this .readlineErr) {
            this.readlineErr.removeAllListeners();
            this.readlineErr.close();  
        }
        if (this .isRunning()) {
            killApp('scrcpy');
            console.log('killed.');
        }
    }
}

class Q6 {
    static isConnected = false;
    static _autoReconnect = false;
    static async connect(autoReconnect:boolean = false) {
        this._autoReconnect = autoReconnect;
        const scrcpyError = await ScrCpy.run();
        if (scrcpyError) {
            console.log(scrcpyError);
            return;
        }
        ScrCpy.readlineOut?.on('line',(data) => {
            if (data == '[server] INFO: Device: [LGE] lge LG-M700 (Android 8.1.0)') this .setIsConnected(true);
            if (data == 'DEBUG: User requested to quit') this ._autoReconnect = false;
            console.log('🟢',data);
        })
        ScrCpy.readlineErr?.on('line',(data)=>{
            if (data == 'WARN: Device disconnected') this .setIsConnected(false);
            console.error('🔴',data);
        })
        ScrCpy.process?.once('exit',(code) => {
            this .setIsConnected(false);
            ScrCpy.close();
            if (this._autoReconnect) this .connect(this ._autoReconnect);
        })
    }
    static setIsConnected(isConnected:boolean) {
        this.isConnected = isConnected;
        this.onConnectionStatusChanged?.(this .isConnected);
    }
    static onConnectionStatusChanged : ((isConnected:boolean)=>void) | null = null;
    static disconnect() {
        this ._autoReconnect = false ;
        ScrCpy.close();
    }
}



let tray : Tray | null = null;

app.whenReady().then(() => {
    const iconPath = path.join(__dirname, '../tray.png');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip('Q6');
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