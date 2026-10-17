import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import readline from 'node:readline'
import { ScrCpyContext } from "./types.js";
import isRunning from './methods/isRunning.js'
import cleanupReadline from './methods/cleanupReadline.js'
import disconnect from './methods/disconnect.js'
import readlineOutLineEventHandler from './eventHandlers/readlineOutLineEventHandler.js'
import readlineErrLineEventHandler from './eventHandlers/readlineErrLineEventHandler.js'
import processCloseEventHandler from './eventHandlers/processCloseEventHandler.js'
import attachEventHandlers from './methods/attachEventHandlers.js'
import detachEventHandlers from './methods/detachEventHandlers.js'
import run from "./methods/run.js";
import errorHandler from "./eventHandlers/errorHandler.js";
import { WrapperChildProcessWithoutNullStreams } from "ctrlc-wrapper";

export default class ScrCpy implements ScrCpyContext {

    public process : WrapperChildProcessWithoutNullStreams | null = null ;
    public readlineOut : readline.Interface | null = null ;
    public readlineErr : readline.Interface | null = null ;
    public autoReconnect : boolean = false;
    public serial : string = "";
    public isConnected : boolean = false;
    constructor(serial:string) {
        this.serial = serial;
    }
    
    isRunning = isRunning;
    connectionStatusChangeHandler = () => {};
    errorHandler = errorHandler;
    cleanupReadline = cleanupReadline;
    disconnect = disconnect;
    readlineOutLineEventHandler = readlineOutLineEventHandler;
    readlineErrLineEventHandler = readlineErrLineEventHandler;
    processCloseEventHandler = processCloseEventHandler;
    attachEventHandlers = attachEventHandlers;
    detachEventHandlers = detachEventHandlers;
    run = run;
    
}