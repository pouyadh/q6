import { execSync } from 'node:child_process';
import { AndroidDeviceContext } from '../types.js';
export default function adbShell(this:AndroidDeviceContext, command:string): string {
    if (!this.serial) {
        console.log("No active device");
        return "";
    }
    try {
        return execSync(
        `adb -s ${this.serial} shell ${command}`,
        { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, windowsHide: true, timeout: 15000 }).trim();
    } catch (err) {
        if (err instanceof Error) {
            console.log("ADB Shell Error:" , err.message);
        }
        return "";
    }
}