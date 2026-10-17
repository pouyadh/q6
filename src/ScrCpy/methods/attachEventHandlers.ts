import { ScrCpyContext } from "../types.js";
import readline from 'node:readline'
export default function attachEventHandlers(
    this:ScrCpyContext
): void {
    if (!this.process) return;
    this.readlineOut = readline.createInterface({
        input: this.process.stdout,
        crlfDelay: Infinity
    });
    this.readlineOut.on('line', this.readlineOutLineEventHandler.bind(this));
    this.readlineErr = readline.createInterface({
        input: this.process.stderr,
        crlfDelay: Infinity
    });
    this.readlineErr.on('line', this.readlineErrLineEventHandler.bind(this));
    this.process.once('close', this.processCloseEventHandler.bind(this));
    this.process.on('error', this.errorHandler.bind(this));
}