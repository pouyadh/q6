import { ScrCpyContext } from "../types.js";

export default function isRunning(this:ScrCpyContext) {
    console.log(this.process,this.process?.exitCode,!this.process?.killed,this.isConnected)
    return !!(
        this.process &&
        this.process.exitCode === null &&
        !this.process.killed
    );
}