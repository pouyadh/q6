import { AndroidDeviceContext, RequestStatus, Status } from "../types.js";
export default function setMobileDataStatus(this:AndroidDeviceContext,status: RequestStatus): Status {
    const currentStatus = this.getMobileDataStatus();
    let _result : Status = 'Unknown';
    if (currentStatus == 'Unknown') {
        console.log('The current state of mobile data is unknown');
        _result = 'Unknown';
    } else if (currentStatus == status) {
        console.log(`WiFi is already ${status}`)
        return status;
    } else {
        this.pushLockStatusAndUnlock();
        this.adbShell('am start -a android.settings.WIRELESS_SETTINGS');
        this.sleep(0.5);
        this.tap(1000,900,0.5);
        if (currentStatus == 'Enabled') this.tap(880,1100,0.5);
        this.tapHome(3);
        this.popLockStatus();    
    }
    this.popLockStatus();
    return _result;
}