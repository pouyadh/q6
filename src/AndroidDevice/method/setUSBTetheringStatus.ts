import { AndroidDeviceContext, RequestStatus, Status } from "../types.js";
export default function setUSBTetheringStatus(this:AndroidDeviceContext, status: RequestStatus): Status {
    const currentStatus = this.getUSBTetheringStatus();
    if (currentStatus == 'Unknown') {
        console.log('USB Tethering status is unknown');
        return 'Unknown';
    } else if (status != 'Toggle' && currentStatus == status) {
        console.log(`USB Tethering is already ${status}`);
        return currentStatus;
    } else {
        this.pushLockStatusAndUnlock();
        if (status == 'Toggle') {
            status = currentStatus == 'Enabled' ? 'Disabled' : 'Enabled';
        }
        console.log(`Setting USB tethering to ${status}...`);
        this.adbShell(`service call connectivity 34 i32 ${status=='Enabled'?'1':'0'} s16 text`);
        this.sleep(2);
        let newStatus = this.getUSBTetheringStatus();
        console.log(`USB Tethering is ${newStatus}`);
        this.popLockStatus();
        return newStatus;
    }
}