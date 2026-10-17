import { execSync } from 'node:child_process';
import AndroidDevice from '../AndroidDevice.js';
export default function getDeviceBySerial(this: AndroidDevice, serial:string) : AndroidDevice | undefined {
    return AndroidDevice.getAllDevices().find(d => d.serial == serial);
}