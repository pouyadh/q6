import { execSync } from "node:child_process";

export default class ADB {
    static getDevices() {
        return execSync('adb devices -l')
        .toString()
        .split('\r\n')
        .filter((v,i) => { return v.length > 0 && i % 2 === 1; })
        .map((v) => {
            const x = v.split(' ').filter(v => v.length);
            const serial = x[0];
            const state = x[1];
            let model = x.find(v => v.startsWith('model'));
            if (model) model = model.split(":")[1]
            return { serial, state, model }
        });
    }
}