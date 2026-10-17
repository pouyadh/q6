import { spawnWithWrapper } from "ctrlc-wrapper";
import { ScrCpyContext } from "../types.js";
export default function disconnect(
    this:ScrCpyContext,
    code?:number
): void {
    console.log(`scrcpy closed${code?` with code ${code}`:''}`)
    this.autoReconnect = false;
    this.cleanupReadline(this.readlineOut!);
    this.cleanupReadline(this.readlineErr!);
    this.process?.sendCtrlC();
}