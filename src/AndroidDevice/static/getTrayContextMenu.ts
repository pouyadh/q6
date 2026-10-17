import { app, Menu, nativeImage } from "electron";
import getAllDevices from "./getAllDevices.js";
import path from "node:path";

export default async function getTrayContextMenu(): Promise<Menu> {
    
    const battery_icon = nativeImage.createFromPath(path.join(__dirname,'img','Battery.png'));
    const pin_icon = nativeImage.createFromPath(path.join(__dirname,'img','Pin.png'));
    const screen_icon = nativeImage.createFromPath(path.join(__dirname,'img','Screen.png'));
    const bluetooth_icon = nativeImage.createFromPath(path.join(__dirname,'img','Bluetooth.png'));
    const hotspot_icon = nativeImage.createFromPath(path.join(__dirname,'img','HotSpot.png'));
    const lock_icon = nativeImage.createFromPath(path.join(__dirname,'img','Lock.png'));
    const mobile_data_icon = nativeImage.createFromPath(path.join(__dirname,'img','Mobile Data.png'));
    const usb_tethering_icon = nativeImage.createFromPath(path.join(__dirname,'img','USB Tethering.png'));
    const wifi_icon = nativeImage.createFromPath(path.join(__dirname,'img','WiFi.png'));

    const allDevices = getAllDevices();
    for (const device of allDevices) {
        await device.getFullNetworkState();
        device.load();
    }
    //allDevices.forEach(d => d.getFullNetworkState());
    // const dateNowStart = Date.now();
    const mnu = Menu.buildFromTemplate([
        { label: "Android Device Tweak" , enabled: false },
        ...allDevices.map(d => {
            const device = d;
            return {
                label: d.model,
                submenu: [
                    { 
                        label: `Battery Level: ${ device.getBatteryLevel() }`, 
                        enabled: false,
                        icon: battery_icon
                    },
                    { 
                        label: `Set Pin (${ device.PIN })`, 
                        click: () => { device.getPINFromUser() },
                        icon: pin_icon
                    },
                    { 
                        label: device.scrcpy.isConnected ? 'Disconnect' : 'Show Screen', 
                        click: () => { device.setScreen(device.scrcpy.isRunning() ? 'Closed':'Opened') },
                        icon: screen_icon
                    },
                    { 
                        label: `Turn Bluetooth ${d.bluetooth.radioOn ? 'Off' : 'On'}`, 
                        click:() => { device.setBluetoothStatus('Toggle')},
                        icon: bluetooth_icon
                    },
                    { 
                        label: `Turn HotSpot ${d.tethering.wifiHotspot == 'Enabled' ? 'Off' : 'On'}`, 
                        click:() => { device.setHotSpotStatus('Toggle')},
                        icon: hotspot_icon
                    },
                    { 
                        label: `${d.getLockStatus() == 'Locked' ? 'Unlock' : 'Lock'} Device`, 
                        click:() => { device.setLockStatus(device.getLockStatus() == 'Locked' ? 'Unlocked' : 'Locked')},
                        icon: lock_icon
                    },
                    { 
                        label: `Turn Mobile Data ${d.mobileData.enabled ?'Off':'On'}`, 
                        click:() => { device.setMobileDataStatus('Toggle')},
                        icon: mobile_data_icon
                    },
                    { 
                        label: `Turn USB Tethering ${d.tethering.usb == 'Enabled' ?'Off':'On'}`, 
                        click:() => { device.setUSBTetheringStatus('Toggle')} ,
                        icon: usb_tethering_icon
                    },
                    { 
                        label: `Turn WiFi ${d.wifi.radioOn && !d.tethering.wifiHotspot ? 'Off' : 'On'}` , 
                        click:() => { device.setWiFiStatus('Toggle')} ,
                        icon: wifi_icon
                    },
                ] 
            };
        }),
        { type: 'separator' },
        { label: 'Quit', click: () => { app.quit(); } }
    ]);
    // console.log(Date.now() - dateNowStart);
    return mnu;
}