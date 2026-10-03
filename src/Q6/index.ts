import ScrCpy from "../ScrCpy/index.js";

export default class Q6 {
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