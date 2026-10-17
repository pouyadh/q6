import { AndroidDeviceContext, RequestStatus, Status } from "../types.js";
import sleep from "./sleep.js";
export default function setWiFiStatus(this:AndroidDeviceContext,status:RequestStatus): Status {
    const currentStatus = this.getWifiStatus();
    if (currentStatus == 'Unknown') {
        console.log('WiFi status is unknown')
        return 'Unknown';
    } else if (currentStatus == status) {
        console.log(`WiFi is already ${status}`)
        return status;
    } else {
        this.pushLockStatusAndUnlock();
        this.adbShell("am start -a android.settings.WIFI_SETTINGS");
        this.sleep(0.5);
        this.tap(975,250,0.5);
        this.sleep(0.5);
        this.tapHome(3);
        this.popLockStatus();
        return this.getWifiStatus(); 
    }
}