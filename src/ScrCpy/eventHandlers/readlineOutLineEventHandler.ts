import { ScrCpyContext } from "../types.js";
export default function readlineOutLineEventHandler(
    this:ScrCpyContext,
    data:string
): void {
    if (data.startsWith('[server] INFO: Device:')) {
        this.connectionStatusChangeHandler?.();
        this.isConnected = true;
    } else if (data == 'DEBUG: Server terminated') {
        this.connectionStatusChangeHandler?.();
        this.isConnected = false;
    }
    if (data == 'DEBUG: User requested to quit') this.autoReconnect = false;
    console.log('🟢',data);
}