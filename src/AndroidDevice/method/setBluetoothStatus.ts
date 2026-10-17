import { AndroidDeviceContext, RequestStatus, Status } from "../types.js";
import sleep from "./sleep.js";
export default function setBluetoothStatus(this:AndroidDeviceContext,status:RequestStatus): Status {
    const currentStatus = this.getBluetoothStatus();
    if (currentStatus == 'Unknown') {
        console.log ("Current Bluetooth status is unknown");
        return 'Unknown';
    }
    if (status == currentStatus) {
        console.log(`Bluetooth is already ${status}`);
        return status;
    } else {
        this.pushLockStatusAndUnlock();
        this.adbShell("am start -a android.settings.WIRELESS_SETTINGS");
        this.sleep(1);
        this.tap(975,704,0.5);
        this.sleep(0.5);
        this.tapHome(3);
        this.popLockStatus();
    }
    return this.getBluetoothStatus();
}