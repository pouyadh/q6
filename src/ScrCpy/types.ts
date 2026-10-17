import { WrapperChildProcessWithoutNullStreams } from "ctrlc-wrapper";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import readline from 'node:readline'

export interface ScrCpyContext {
    process : WrapperChildProcessWithoutNullStreams | null;
    readlineOut : readline.Interface | null;
    readlineErr : readline.Interface | null;
    autoReconnect : boolean;
    serial : string;
    isConnected : boolean;
    isRunning: () => boolean;
    errorHandler: (err:Error) => void;
    connectionStatusChangeHandler : (() => void) | null;
    cleanupReadline: (readline:readline.Interface) => void;
    disconnect: () => void;
    readlineOutLineEventHandler: (data:string) => void;
    readlineErrLineEventHandler: (data:string) => void;
    processCloseEventHandler: (code:number) => void;
    attachEventHandlers: () => void;
    detachEventHandlers: () => void;
    run: (restartIfRunning:boolean,serial:string) => boolean | Error;
}