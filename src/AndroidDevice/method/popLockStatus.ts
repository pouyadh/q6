import { AndroidDeviceContext, LockStatus } from "../types.js";
export default function popLockStatus(this:AndroidDeviceContext): LockStatus {
    let newLockStatus = this.lockStatusStack.pop();
    if (!newLockStatus || newLockStatus == 'Unknown') newLockStatus = 'Unlocked'
    return this.setLockStatus(newLockStatus);
}