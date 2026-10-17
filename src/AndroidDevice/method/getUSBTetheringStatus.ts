import { AndroidDeviceContext, Status } from "../types.js";
export default function getUSBTetheringStatus(this:AndroidDeviceContext): Status {
    const config = this.adbShell('getprop sys.usb.config');
    if (config) {
        return config.includes('rndis') ? 'Enabled' : 'Disabled'
    } else {
        const functions = this.adbShell('cat /sys/class/android_usb/android0/functions');
        if (functions && functions.includes('rndis')) return "Enabled"
    }
    return "Unknown";
}