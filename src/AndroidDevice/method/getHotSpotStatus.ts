import { AndroidDeviceContext, Status } from "../types.js";

export default function getHotSpotStatus(this: AndroidDeviceContext): Status {
  const output = this.adbShell('dumpsys connectivity');
  if (!output) return 'Unknown';

  // ── Android 9+ : Tethering block
  //    "Upstream wanted: true"  /  "Current upstream interface: ap0"
  const upstreamWanted = output.match(/Upstream wanted:\s*(true|false)/i);
  const upstreamIface = output.match(/Current upstream interface:\s*(\S+)/i);

  if (upstreamWanted && upstreamIface) {
    const wanted = upstreamWanted[1].toLowerCase() === 'true';
    const iface = upstreamIface[1];
    const hasIface = iface && iface !== 'null';

    if (wanted && hasIface) return 'Enabled';
    if (!wanted && !hasIface) return 'Disabled';
  }

  // ── Android 7/8 legacy fallback (what you had)
  const legacy = output.match(/\b\w+\s*-\s*(\w+State)/);
  if (legacy) {
    if (legacy[1] === 'TetheredState') return 'Enabled';
    if (legacy[1] === 'AvailableState') return 'Disabled';
  }

  return 'Unknown';
}