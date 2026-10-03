import { execSync } from "node:child_process";

export type Status = 'Enabled' | 'Disabled' | 'Unknown';
export type RequestStatus = 'Enabled' | 'Disabled' | 'Toggle';
export type LockStatus = 'Locked' | 'Unlocked' | 'Unknown';
export type RequestLockStatus = Exclude<LockStatus,'Unknown'>;

export class AndroidDevice {
    serial: string = "";
    status: string = "";
    name: string = "";
    pin: string = "1234";
    LockStatusStack : LockStatus[] = [];
    constructor(pin : string) {
        this.pin = pin;
    }

}

import './method/adbShell.js';
import './method/sleep.js';
import './method/tap.js';
import './method/tapHome.js';
import './method/pushLockStatusAndUnlock.js';
import './method/popLockStatus.js';
import './method/getLockStatus.js';
import './method/setLockStatus.js';
import './method/getUSBTetheringStatus.js';
import './method/setUSBTetheringStatus.js';
import './method/getBluetoothStatus.js';
import './method/setBluetooth.js';
import './method/getWifiStatus.js';
import './method/setWiFiStatus.js';
import './method/getHotSpotStatus.js';
import './method/setHotSpotStatus.js';
import './method/getMobileDataStatus.js';
import './method/setMobileDataStatus.js';


export interface AndroidDevice {
    adbShell(command:string): string | unknown;
    sleep(seconds:number): void;
    tap(x:number, y:number, delay: number): void;
    tapHome(tapCount:number): void;
    pushLockStatusAndUnlock(): LockStatus
    popLockStatus(): LockStatus;
    getLockStatus(): LockStatus;
    setLockStatus(status: LockStatus): boolean;
    getUSBTetheringStatus(): Status;
    setUSBTetheringStatus(status: RequestStatus): boolean;
    getBluetoothStatus(): Status;
    setBluetoothStatus( status: RequestStatus): boolean;
    getWifiStatus(): Status;
    setWiFiStatus(status: RequestStatus): boolean;
    getHotSpotStatus(): Status;
    setHotSpotStatus(status: RequestStatus): boolean;
    getMobileDataStatus(): Status;
    setMobileDataStatus(status: RequestStatus): boolean;
    screenConnect(): boolean;
    screenDisconnect(): boolean;
}


export default AndroidDevice;