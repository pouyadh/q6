import { AndroidDeviceContext, LockStatus } from "../types.js";
export default function getLockStatus(this:AndroidDeviceContext): LockStatus {
    const output = this.adbShell('dumpsys window policy');
    if (!output) return 'Unknown';
    // Method 1: KeyguardStateMonitor.mIsShowing (most reliable for LG)
    let match = output.match(/KeyguardStateMonitor[\s\S]*?mIsShowing=(\w+)/);
    if (match) return (match[1] === 'true' ? 'Locked' : 'Unlocked');
    // Method 2: KeyguardStateMonitor.mInputRestricted
    match = output.match(/mInputRestricted=(\w+)/);
    if (match) return (match[1] === 'true' ? 'Locked' : 'Unlocked');
    // Method 3: isStatusBarKeyguard
    match = output.match(/isStatusBarKeyguard=(\w+)/);
    if (match) return (match[1] === 'true' ? 'Locked' : 'Unlocked');
    // Method 4: KeyguardServiceDelegate.showing
    match = output.match(/KeyguardServiceDelegate[\s\S]*?showing=(\w+)/);
    if (match) return (match[1] === 'true' ? 'Locked' : 'Unlocked');
    return 'Unknown'; // Unknown
}