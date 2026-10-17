import { BrowserWindow, ipcMain } from "electron";
import { AndroidDeviceContext } from "../types.js";
import AndroidDevice from "../AndroidDevice.js";
import fs from 'node:fs'
import path from 'node:path'

export default function getPINFromUser(this:AndroidDeviceContext) {
    this.load();
    return new Promise<string>((res,rej) => {
        const win = new BrowserWindow({
            width: 340,
            height: 150,
            resizable: false,
            webPreferences: { nodeIntegration: true, contextIsolation: false },
        });

        win.setMenuBarVisibility(false);
        win.loadURL('data:text/html,' + encodeURIComponent(`
            <body style="font-family:sans-serif;padding:12px;margin:0">
            <p style="font-size:12px;margin:0">Enter Pin for ${this.model} (${this.serial})</p><br>
            <input id="v" style="width:100%;box-sizing:border-box;padding:4px" type="password" value=${this.PIN || ''} autofocus onfocus="this.select()">

            <button id="toggleVisiblity" type="button" onclick="
            pw.type = pw.type === 'password' ? 'text' : 'password';
            this.textContent = pw.type === 'password' ? 'show' : 'hide';
            ">Toggle</button>

            <div style="margin-top:10px;text-align:right">
                <button onclick="cancel()">Cancel</button>
                <button onclick="ok()" style="margin-left:6px">OK</button>
            </div>
            <script>
                const { ipcRenderer } = require('electron');
                const ok = () => ipcRenderer.send('result', {  ...${JSON.stringify(this)}, PIN: document.getElementById('v').value });
                const cancel = () => ipcRenderer.send('result', null);
                document.getElementById('v').addEventListener('keydown', e => {
                if (e.key === 'Enter') ok();
                if (e.key === 'Escape') cancel();
                });
                    document.getElementById('toggleVisiblity').addEventListener('click', e => {
                        const v = document.getElementById('v');
                        v.type = v.type == 'password' ? 'text' : 'password';
                    })
            </script>
            </body>
        `));

        ipcMain.once('result', (_e, value) => {
            if (value === null) {
                console.log('User cancelled the pin entry.');
                rej(); win.close(); return;
            }
            this.PIN = value.PIN;
            this.save();
            win.close();
            res(value.PIN);
        });
    })
}
