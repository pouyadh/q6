import ScrCpy from "../../ScrCpy/ScrCpy.js";
import { AndroidDeviceContext, ScreenStatus } from "../types.js";
export default function setScreen(this:AndroidDeviceContext,status:ScreenStatus) {
    if (this.scrcpy && (this.scrcpy.isConnected || this.scrcpy.isRunning())) {
        this.scrcpy.disconnect();
    } else {
        this.scrcpy.run(true,this.serial);
    }
}