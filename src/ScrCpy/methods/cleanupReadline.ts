import { ScrCpyContext } from "../types.js";
import readline from 'node:readline';
export default function cleanupReadline(
    this:ScrCpyContext,
    readline:readline.Interface
): void {
    if (readline) {
        readline.removeAllListeners();
        readline.close();
    }
}