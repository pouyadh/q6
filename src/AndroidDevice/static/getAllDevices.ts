import { execSync } from 'node:child_process';
import AndroidDevice from '../AndroidDevice.js';
export default function getAllDevices() {
    return execSync('adb devices -l')
    .toString()
    .split('\r\n')
    .filter((v,i) => { return v.length > 0 && i % 2 === 1; })
    .map((v) => {
        const x = v.split(' ').filter(v => v.length);
        const serial = x[0] || '?';
        const status = x[1] || '?';
        const product = x.find(v => v.startsWith('product:'))?.split(':')[1] || '?';
        const model = x.find(v => v.startsWith('model:'))?.split(':')[1] || '?';
        const device = x.find(v => v.startsWith('device:'))?.split(':')[1] || '?';
        const transportID = x.find(v => v.startsWith('transport_id:'))?.split(':')[1] || '?';

        const alreadyExistingDevice = AndroidDevice.devices.find((d,i) => serial === d.serial);
        if (alreadyExistingDevice) {
            alreadyExistingDevice.status = status;
            alreadyExistingDevice.product = product;
            alreadyExistingDevice.model = model;
            alreadyExistingDevice.device = device;
            alreadyExistingDevice.transportID = transportID;
            return alreadyExistingDevice;
        } else {
            return new AndroidDevice({serial,status,product,model,device,transportID,PIN: "", name: ""});
        }
    });
}