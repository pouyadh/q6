import ScrCpy from "../ScrCpy.js";
import { ScrCpyContext } from "../types.js";

export default function processCloseEventHandler(
    this: ScrCpyContext,
    code?: number
) {
    console.log(`child process exited with code ${code}`);
    this.cleanupReadline(this.readlineOut!);
    this.cleanupReadline(this.readlineErr!);
    this.isConnected = false;
    if (!this.autoReconnect) return;
    setTimeout(() => { this.run(false,this.serial); },1000);
}