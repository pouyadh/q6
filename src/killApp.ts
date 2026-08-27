import { execSync } from "node:child_process";

export default function killApp(name:string) {
  if (!name.endsWith('.exe')) name = name + '.exe';
  try {
    const cmd = process.platform === 'win32'
      ? `taskkill /F /IM ${name}`  // /F = force kill
      : `pkill -x "${name}"`;      // -x = exact match
      
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}