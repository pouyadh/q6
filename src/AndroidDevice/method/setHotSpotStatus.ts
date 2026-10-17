import { AndroidDeviceContext, RequestStatus, Status } from "../types.js";
export default function setHotSpotStatus(this:AndroidDeviceContext,status: RequestStatus): Status {
    const currentStatus = this.getHotSpotStatus();
    if (currentStatus == 'Unknown') {
        console.error('Current hotspot status is unkown');
        return 'Unknown';
    } else if (status != 'Toggle' && status == currentStatus) {
        console.log(`The hotspot is already ${status}`);
        return status;
    } else {
        this.pushLockStatusAndUnlock();
        this.adbShell("am start -n com.android.settings/.Settings\$TetherSettingsActivity") // Tethering Screen
        this.tap(600,1250,0.1);    //   Network Settings
        this.tap(579, 219,0.1);    //   Tap on tethering
        this.tap(970, 600,0.1);    //   Tap on Wi-Fi hotspot
        if (currentStatus == 'Disabled') {
            this.tap(844, 1317,0.1);    //   Tap on Turn on
            this.tap(850, 1227,0.1);   //   Tap on use
        }
        this.tapHome(3);
        this.popLockStatus();
        return this.getHotSpotStatus();
    }
}