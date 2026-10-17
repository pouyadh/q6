import { AndroidDeviceContext } from "../types.js";
export default function tap(
    this:AndroidDeviceContext,
    x:number,
    y:number,
    delay: number = 0.5
): void {
    this.adbShell(`input tap ${x} ${y}`);
    this.sleep(delay);
}