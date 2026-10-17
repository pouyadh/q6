import { app, Tray } from "electron";

export default function (onSecoundInstance:()=>void) {
    const singleInstanceLock = app.requestSingleInstanceLock();
    if (!singleInstanceLock) {
        console.log('singleInstanceLock')
        app.quit();
    } else {
        app.on('second-instance', onSecoundInstance);
    }
}

