import AndroidDevice from '../AndroidDevice.js';
import { AndroidDeviceContext, LockStatus, RequestLockStatus } from '../types.js';
export default async function setLockStatus(this:AndroidDeviceContext, lockStatus:RequestLockStatus): Promise<LockStatus> {
    const delay = 0.01;
    if (!this.serial) {
        console.log('No active Device');
        return 'Unknown';
    }
    const oldLockStatus = this.getLockStatus();
    if (oldLockStatus == 'Unknown' ) {
        console.log('Device lock status is unknown');
        return 'Unknown';
    } else if (oldLockStatus == lockStatus ) {
        console.log(`Device is already ${lockStatus}.`);
        return lockStatus;
    }

    if (lockStatus == 'Locked') {

        console.log('Locking the device...');
        this.adbShell('input keyevent KEYCODE_POWER');
        this.sleep(delay);
        const newLockStatus = this.getLockStatus();
        console.log(`=> Device is ${newLockStatus}`);
        return newLockStatus;

    } else if (lockStatus == 'Unlocked') {
        console.log(`Unlock pin [${this.PIN}]`);
        if (!this.PIN || this.PIN.length!= 4)  {
            console.log(`Unlock failed, PIN: ${this.PIN}. No or wrong PIN.`);
            this.getPINFromUser();
            return 'Locked';
        }
        console.log('Unlocking device...');
        this.adbShell('input keyevent KEYCODE_WAKEUP');
        this.sleep(delay);
        this.adbShell('input keyevent KEYCODE_MENU');
        this.sleep(delay);
        this.adbShell(`input text ${this.PIN}`);
        this.adbShell('input keyevent KEYCODE_ENTER');
        this.sleep(delay * 5);
        const newLockStatus = this.getLockStatus();
        console.log(`=> Device is ${newLockStatus}`);
        return newLockStatus;

    }

    console.log('Something went wrong');
    return 'Unknown';
}