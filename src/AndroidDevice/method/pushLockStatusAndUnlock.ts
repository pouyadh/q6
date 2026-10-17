import { AndroidDeviceContext, LockStatus } from "../types.js";
export default function pushLockStatusAndUnlock(this:AndroidDeviceContext): LockStatus {
    this.lockStatusStack.push(this.getLockStatus());
    return this.setLockStatus('Unlocked');
}