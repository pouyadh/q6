import { execSync } from 'node:child_process';

export default function isAppRunning(name:string) {
    try {
        const cmd = process.platform === 'win32'
            ? `tasklist /FI "IMAGENAME eq ${name}"`
            : `pgrep -x "${name}"`;

        const output = execSync(cmd, { encoding: 'utf8' });
    return output.includes(name);
    } catch {
        return false;
    }
}