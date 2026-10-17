import { AndroidDeviceContext, Status } from "../types.js";
export default function getBluetoothStatus(this:AndroidDeviceContext): Status {
    const result = this.adbShell('settings get global bluetooth_on');
    if (result?.endsWith('1')) return 'Enabled';
    if (result?.endsWith('0')) return 'Disabled';
    return 'Unknown';
}