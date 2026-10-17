import { spawn } from "node:child_process";
import { ScrCpyContext } from "../types.js";
import { spawnWithWrapper } from "ctrlc-wrapper";
export default function run(
    this:ScrCpyContext,
    restartIfRunning:boolean = false,
    serial:string = ""
): boolean {
    if (serial) this.serial = serial;
        if (this.isRunning() && !restartIfRunning) {
            console.log('scrcpy is already running...');
            this.isConnected = true;
            return true;
        }
        this.disconnect();
        try {
            this.process = spawnWithWrapper(`scrcpy`,[
                '--power-off-on-close',
                '--verbosity=debug',
                `--serial=${this.serial}`
            ]);
            this.process.once('spawn',()=> {
                console.error('scrcpy is running ...');
                this.attachEventHandlers();
                this.isConnected = true;
            });
            this.process.on('error',(err)=>{
                console.error('running scrcpy failed.');
                console.log('Error occurred while starting scrcpy:', err);
                this.detachEventHandlers();
                this.isConnected = false;
            });
            return true;
        } catch (err) {
            console.log('Error occurred while starting scrcpy:', err);
            this.isConnected = false;
            return false;
        }
    }