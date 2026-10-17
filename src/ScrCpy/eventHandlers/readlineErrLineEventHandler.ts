import ScrCpy from "../ScrCpy.js";
import { ScrCpyContext } from "../types.js";

export default function readlineErrLineEventHandler(
    this:ScrCpyContext,
    data:string
): void {
    if (data == 'WARN: Device disconnected') {
        this.isConnected = false;
        this.connectionStatusChangeHandler?.();
    }
    console.error('🔴',data);
}