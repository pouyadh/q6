import ScrCpy from "../ScrCpy/ScrCpy.js";
import { ScrCpyContext } from "../ScrCpy/types.js";
import getFullNetworkState from "./method/getFullNetworkState.js";

export type ToggleStatus = 'Enabled' | 'Disabled' | 'Unknown'
export type LocationMode = 'off' | 'device' | 'battery' | 'high' | 'unknown'
export type Status = 'Enabled' | 'Disabled' | 'Unknown';
export type RequestStatus = 'Enabled' | 'Disabled' | 'Toggle';
export type LockStatus = 'Locked' | 'Unlocked' | 'Unknown';
export type RequestLockStatus = Exclude<LockStatus,'Unknown'>;
export type ScreenStatus = 'Opened' | 'Closed' | 'Unknown';
export type AndriodDeviceInfo = {
    
    serial: string;
    status: string;
    product: string;
    model: string;
    device: string;
    transportID: string;
    name: string;

}

export interface AndroidDeviceContext {
    serial: string;
    status: string;
    product: string;
    model: string;
    device: string;
    transportID: string;
    name: string;
    PIN: string;
    lockStatusStack : LockStatus[];
    scrcpy: ScrCpy;
    wifi: { radioOn: boolean | null; connected: boolean; ssid: string | null }
    mobileData: { enabled: boolean | null; connected: boolean; networkType: string | null }
    airplaneMode: { enabled: boolean | null }
    bluetooth: { radioOn: boolean | null }
    nfc: { radioOn: boolean | null }
    location: { enabled: boolean | null; mode: LocationMode }
    tethering: { wifiHotspot: ToggleStatus; usb: ToggleStatus; bluetooth: ToggleStatus }
    latencyMs: number,
    adbShell:(command:string) => string
    sleep:(seconds:number) => void;
    tap:(x:number, y:number, delay: number) => void;
    tapHome:(tapCount:number) => void;
    pushLockStatusAndUnlock:() => LockStatus;
    popLockStatus:() => LockStatus;
    getLockStatus:() => LockStatus;
    setLockStatus:(status: RequestLockStatus) => Promise<LockStatus>;
    getUSBTetheringStatus:() => Status;
    setUSBTetheringStatus:(status: RequestStatus) => Status;
    getBluetoothStatus:() => Status;
    setBluetoothStatus:( status: RequestStatus) => Status;
    getWifiStatus:() => Status;
    setWiFiStatus:(status: RequestStatus) => Status;
    getHotSpotStatus:() => Status;
    setHotSpotStatus:(status: RequestStatus) => Status;
    getMobileDataStatus:() => Status;
    setMobileDataStatus:(status: RequestStatus) => Status;
    setScreen:(status:ScreenStatus) => void;
    getPINFromUser: () => Promise<string> | string;
    getTrayContextMenu: () => Promise<Electron.Menu>;
    getFullNetworkState: (this:AndroidDeviceContext, opts: AdbOptions) => Promise<FullNetworkState>;
    load: (this:AndroidDeviceContext) => void;
    save: (this:AndroidDeviceContext) => void;
}


export interface FullNetworkState {
  wifi: { radioOn: boolean | null; connected: boolean; ssid: string | null }
  mobileData: { enabled: boolean | null; connected: boolean; networkType: string | null }
  airplaneMode: { enabled: boolean | null }
  bluetooth: { radioOn: boolean | null }
  nfc: { radioOn: boolean | null }
  location: { enabled: boolean | null; mode: LocationMode }
  tethering: { wifiHotspot: ToggleStatus; usb: ToggleStatus; bluetooth: ToggleStatus }
  latencyMs: number
}

export interface AdbOptions {
  adbPath?: string
  serial?: string
  timeoutMs?: number
  debug?: boolean
}