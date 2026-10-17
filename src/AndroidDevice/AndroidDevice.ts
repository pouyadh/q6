import adbShell from "./method/adbShell.js";
import getBluetoothStatus from "./method/getBluetoothStatus.js";
import getHotSpotStatus from "./method/getHotSpotStatus.js";
import getLockStatus from "./method/getLockStatus.js";
import getMobileDataStatus from "./method/getMobileDataStatus.js";
import getUSBTetheringStatus from "./method/getUSBTetheringStatus.js";
import getWifiStatus from "./method/getWifiStatus.js";
import popLockStatus from "./method/popLockStatus.js";
import pushLockStatusAndUnlock from "./method/pushLockStatusAndUnlock.js";
import setBluetoothStatus from "./method/setBluetoothStatus.js";
import setHotSpotStatus from "./method/setHotSpotStatus.js";
import setLockStatus from "./method/setLockStatus.js";
import setMobileDataStatus from "./method/setMobileDataStatus.js";
import setUSBTetheringStatus from "./method/setUSBTetheringStatus.js";
import setWiFiStatus from "./method/setWiFiStatus.js";
import sleep from "./method/sleep.js";
import tap from "./method/tap.js";
import tapHome from "./method/tapHome.js";
import { AndroidDeviceContext, LocationMode, LockStatus, ToggleStatus } from "./types.js";
import ScrCpy from "../ScrCpy/ScrCpy.js";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import readline from 'node:readline'
import getAllDevices from "./static/getAllDevices.js";
import setScreen from "./method/setScreen.js";
import getDeviceBySerial from "./static/getDeviceBySerial.js";
import getBatteryLevel from "./method/getBatteryLevel.js";
import getPINFromUser from "./method/getPINFromUser.js";
import getFullNetworkState from "./method/getFullNetworkState.js";
import getTrayContextMenu from "./static/getTrayContextMenu.js";
import load from "./method/load.js";
import save from "./method/save.js";

export default class AndroidDevice implements AndroidDeviceContext {

    // Static
    static devices: AndroidDevice[] = [];
    static getAllDevices = getAllDevices
    static getDeviceBySerial = getDeviceBySerial
    static getTrayContextMenu = getTrayContextMenu
    //static scrcpyList : { serial : string }[] = [];

    public serial: string;
    public status: string;
    public product: string;
    public model: string;
    public device: string;
    public transportID: string;
    public name: string;
    public PIN: string = "";
    public scrcpy: ScrCpy;
    public lockStatusStack: LockStatus[] = [];
    public wifi: { radioOn: boolean | null; connected: boolean; ssid: string | null } = { radioOn: null, connected: false, ssid: null };
    public mobileData: { enabled: boolean | null; connected: boolean; networkType: string | null } = { enabled: null, connected: false, networkType: null }
    public airplaneMode: { enabled: boolean | null } = { enabled: null };
    public bluetooth: { radioOn: boolean | null } = { radioOn: null }
    public nfc: { radioOn: boolean | null } = { radioOn: null }
    public location: { enabled: boolean | null; mode: LocationMode } = { enabled: null, mode: 'unknown' }
    public tethering: { wifiHotspot: ToggleStatus; usb: ToggleStatus; bluetooth: ToggleStatus } = { wifiHotspot: 'Unknown', usb: 'Unknown', bluetooth: 'Unknown' }
    public latencyMs: number = 0;
    public process: ChildProcessWithoutNullStreams | null = null;
    public readlineOut: readline.Interface | null = null;
    public readlineErr: readline.Interface | null = null;
    public autoReconnect: boolean = false;

    constructor(
        {
            serial, status, product,
            model, device, transportID,
            name, PIN
        }: {
            serial: string, status: string, product: string,
            model: string, device: string, transportID: string,
            name: string, PIN: string
        }
    ) {
        this.serial = serial;
        this.status = status;
        this.product = product;
        this.model = model;
        this.device = device;
        this.transportID = transportID;
        this.name = name;
        this.load();
        this.scrcpy = new ScrCpy(this.serial);
        AndroidDevice.devices.push(this);
    }


    adbShell = adbShell;
    getBluetoothStatus = getBluetoothStatus;
    getHotSpotStatus = getHotSpotStatus;
    getLockStatus = getLockStatus;
    getMobileDataStatus = getMobileDataStatus;
    getUSBTetheringStatus = getUSBTetheringStatus;
    getWifiStatus = getWifiStatus;
    setBluetoothStatus = setBluetoothStatus;
    setHotSpotStatus = setHotSpotStatus;
    setLockStatus = setLockStatus;
    setMobileDataStatus = setMobileDataStatus;
    setUSBTetheringStatus = setUSBTetheringStatus;
    setWiFiStatus = setWiFiStatus;
    popLockStatus = popLockStatus;
    pushLockStatusAndUnlock = pushLockStatusAndUnlock;
    sleep = sleep;
    tap = tap;
    tapHome = tapHome;
    setScreen = setScreen;
    getBatteryLevel = getBatteryLevel;
    getPINFromUser = getPINFromUser;
    getFullNetworkState = getFullNetworkState;
    getTrayContextMenu = getTrayContextMenu;
    save = save;
    load = load;

    
}

