import { AndroidDeviceContext, Status } from "../types.js";
export default function getBatteryLevel(this:AndroidDeviceContext): number {
    let level = +this.adbShell('dumpsys battery | findstr level').trim().split(':')[1].trim();
    return level;
}