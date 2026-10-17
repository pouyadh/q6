import { AndroidDeviceContext } from "../types.js";
export default function tapHome(this:AndroidDeviceContext,tapCount:number = 1): void {
    for (let i=1;i<=tapCount;i++) {
        this.adbShell("input keyevent KEYCODE_BACK");
        this.sleep(0.5);
    }
}