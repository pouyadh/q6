import { spawn , ChildProcessWithoutNullStreams } from "node:child_process";
import readline from "node:readline";
import delay from "../delay.js";
import killApp from "../killApp.js";

/* cspell:words scrcpy */

export default class ScrCpy {
    static process : ChildProcessWithoutNullStreams | null = null ;
    static readlineOut : readline.Interface | null = null ;
    static readlineErr : readline.Interface | null = null ;
    static isRunning() {
        return this.process && this.process.exitCode === null && !this.process.killed;
    }
    static async run(restartIfRunning:boolean = false) {
        if (this .isRunning() && !restartIfRunning) {
            console.log('scrcpy is already running...');
            return;
        }
        killApp('scrcpy');
        await delay(1000);
        try {
            return await new Promise<void>((res,rej) => {
                this.process = spawn('scrcpy',['--power-off-on-close','--verbosity=debug']);
                this.readlineOut = readline.createInterface({
                    input: this.process.stdout,
                    crlfDelay: Infinity
                });
                this.readlineErr = readline.createInterface({
                    input: this.process.stderr,
                    crlfDelay: Infinity
                });
                this.process.on('spawn',()=> {
                    console.error('scrcpy is running ...');
                    res();
                });
                this.process.on('error',(err)=>{
                    console.error('running scrcpy failed.');
                    rej(err);
                })
                this.process.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    this .close();
                });
            });
        } catch (err) {
            return err;
        }
    }
    static close() {
        if (this .readlineOut) {
            this.readlineOut.removeAllListeners();
            this.readlineOut.close();
        }
        if (this .readlineErr) {
            this.readlineErr.removeAllListeners();
            this.readlineErr.close();  
        }
        if (this .isRunning()) {
            killApp('scrcpy');
            console.log('killed.');
        }
    }
}