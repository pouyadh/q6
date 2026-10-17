// src/main/android/network.ts
//
// Ultra-fast Android network state probe.
//
// Architecture:
//   • ONE persistent `adb shell` process (singleton, reused forever)
//   • ONE round-trip per poll
//   • Regex-based parsing (survives trailing-newline quirks)
//   • Location cached 30s
//   • Tethering derived from `ip -o link show up` interface names
//
// Steady-state on Windows USB: ~150-200 ms.
// ─────────────────────────────────────────────────────────────────────────────

import { spawn, ChildProcess } from 'node:child_process'
import { AndroidDeviceContext } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type ToggleStatus = 'Enabled' | 'Disabled' | 'Unknown'
export type LocationMode = 'off' | 'device' | 'battery' | 'high' | 'unknown'

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

// ─────────────────────────────────────────────────────────────────────────────
// Persistent ADB shell (singleton)
// ─────────────────────────────────────────────────────────────────────────────

const SENTINEL = '__@@DONE@@__'

class AdbSession {
  private proc: ChildProcess
  private buf = ''
  private queue: Array<{
    resolve: (v: string) => void
    reject: (e: Error) => void
    timer: NodeJS.Timeout
    startedAt: number
    label: string
  }> = []
  private closed = false

  get isClosed(): boolean {
    return this.closed
  }

  constructor(
    adbPath: string,
    serial: string | undefined,
    private defaultTimeoutMs: number,
  ) {
    const args = serial ? ['-s', serial, 'shell'] : ['shell']
    this.proc = spawn(adbPath, args, {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this.proc.stdout!.setEncoding('utf8')
    this.proc.stdout!.on('data', (c) => this.onData(c))

    // Swallow stderr silently — device errors surface in stdout
    this.proc.stderr!.setEncoding('utf8')
    this.proc.stderr!.on('data', () => {})

    this.proc.on('error', (e) => {
      this.closed = true
      this.failAll(e)
    })
    this.proc.on('exit', (code) => {
      this.closed = true
      this.failAll(new Error(`adb exited ${code}`))
    })
  }

  private onData(chunk: string) {
    this.buf += chunk
    let idx: number
    while ((idx = this.buf.indexOf(SENTINEL)) !== -1) {
      const out = this.buf.slice(0, idx)
      this.buf = this.buf.slice(idx + SENTINEL.length)
      const req = this.queue.shift()
      if (req) {
        clearTimeout(req.timer)
        req.resolve(out)
      }
    }
  }

  private failAll(err: Error) {
    while (this.queue.length) {
      const r = this.queue.shift()!
      clearTimeout(r.timer)
      r.reject(err)
    }
  }

  run(cmd: string, timeoutMs = this.defaultTimeoutMs, label = 'cmd'): Promise<string> {
    if (this.closed) return Promise.reject(new Error('adb session closed'))
    return new Promise((resolve, reject) => {
      const startedAt = Date.now()
      const timer = setTimeout(() => {
        const i = this.queue.findIndex((r) => r.timer === timer)
        if (i !== -1) this.queue.splice(i, 1)
        reject(new Error(`adb ${label} timeout after ${timeoutMs}ms`))
      }, timeoutMs)
      this.queue.push({ resolve, reject, timer, startedAt, label })
      this.proc.stdin!.write(`${cmd}; echo ${SENTINEL}\n`)
    })
  }

  close() {
    this.closed = true
    try { this.proc.stdin!.end() } catch {}
    try { this.proc.kill() } catch {}
    this.failAll(new Error(' closed'))
  }
}

let singleton: AdbSession | null = null
let singletonKey = ''

function getSession(opts: AdbOptions): AdbSession {
  const key = `${opts.adbPath ?? 'adb'}|${opts.serial ?? ''}`
  if (!singleton || singleton.isClosed || singletonKey !== key) {
    singleton?.close()
    singleton = new AdbSession(
      opts.adbPath ?? 'adb',
      opts.serial,
      opts.timeoutMs ?? 5000,
    )
    singletonKey = key
  }
  return singleton
}

export function closeAllAdbSessions(): void {
  singleton?.close()
  singleton = null
  singletonKey = ''
}

export function resetAdbSession(): void {
  singleton?.close()
  singleton = null
  singletonKey = ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const toBool = (v: string | undefined): boolean | null =>
  v === '1' ? true : v === '0' ? false : null

// Location cache (refreshed every 30s)
let locationCache: { raw: string; ts: number } | null = null
const LOCATION_TTL_MS = 30_000

// ─────────────────────────────────────────────────────────────────────────────
// Tethering parser — from interface names
// ─────────────────────────────────────────────────────────────────────────────

function parseTetherFromIfaceNames(
  ifaceNames: string[],
  wifiRadioOn: boolean | null,
): { wifiHotspot: ToggleStatus; usb: ToggleStatus; bluetooth: ToggleStatus } {
  const has = (re: RegExp) => ifaceNames.some((i) => re.test(i))

  // Android moves wlan0 into AP mode when hotspot is on. Most ROMs do NOT
  // create a separate ap0/swlan0. So:
  //   • dedicated AP interface present → hotspot ON
  //   • wlan0 UP while Wi-Fi radio is OFF → wlan0 is the AP → hotspot ON
  //   • wlan0 UP while Wi-Fi radio is ON  → wlan0 is a client → hotspot OFF
  const wlanUp = has(/^wlan\d+$/)
  const dedicatedAp = has(/^(ap\d+|swlan\d+|softap\d+)$/)

  const wifiHotspot: ToggleStatus =
    dedicatedAp
      ? 'Enabled'
      : wlanUp && wifiRadioOn === false
        ? 'Enabled'
        : wlanUp && wifiRadioOn === true
          ? 'Disabled'
          : 'Disabled'

  return {
    wifiHotspot,
    usb: has(/^(rndis\d+|usb\d+)$/) ? 'Enabled' : 'Disabled',
    bluetooth: has(/^bt-pan$/) ? 'Enabled' : 'Disabled',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main probe
// ─────────────────────────────────────────────────────────────────────────────

export default async function getFullNetworkState(
  this: AndroidDeviceContext,
  opts: AdbOptions = {},
): Promise<FullNetworkState> {
  const debug = opts.debug ?? false
  const t0 = performance.now()

  const session = getSession(opts)
  const needLocation =
    !locationCache || Date.now() - locationCache.ts > LOCATION_TTL_MS

  // `echo;` (bare) inserts a clean newline between command outputs.
  // It's a shell builtin — zero cost — and prevents line-gluing.
  const batch = needLocation
    ? 'settings list global; echo; settings list secure; echo; getprop gsm.network.type; echo; ip -o link show up'
    : 'settings list global; echo; getprop gsm.network.type; echo; ip -o link show up'

  const raw = await session.run(batch, opts.timeoutMs, 'net-batch')
  const t1 = performance.now()
  if (debug) {
    console.log(`[net] run ${(t1 - t0).toFixed(1)} ms, ${raw.length} bytes, locationRefreshed=${needLocation}`)
  }

  // ── Parse via regex — survives trailing-newline quirks ──

  // 1) Settings: all `key=value` lines
  const settings: Record<string, string> = {}
  {
    const re = /^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/gm
    let m: RegExpExecArray | null
    while ((m = re.exec(raw)) !== null) {
      settings[m[1]] = m[2].trim()
    }
  }

  // 2) Network type: first line matching a cellular-type pattern
  const netTypeRaw =
    raw.match(
      /^(?:LTE|NR|HSPA|HSPAP|HSUPA|HSDPA|UMTS|TDSCDMA|CDMA|EVDO|1xRTT|EDGE|GPRS|GSM|IDEN|Unknown)(?:,[A-Za-z0-9]+)*$/m,
    )?.[0] ?? ''

  // 3) Interfaces: every `N: name:` occurrence
  const ifaceNames: string[] = []
  {
    const re = /^\d+:\s*([^:@\s]+)/gm
    let m: RegExpExecArray | null
    while ((m = re.exec(raw)) !== null) {
      ifaceNames.push(m[1])
    }
  }

  // 4) Location cache
  if (needLocation) {
    const locRaw = settings['location_mode'] ?? 'null'
    locationCache = { raw: locRaw, ts: Date.now() }
  }

  const g = (k: string) => settings[k] ?? 'null'

  // ── Radios
  const airplaneEnabled  = toBool(g('airplane_mode_on'))
  const wifiRadioOn      = toBool(g('wifi_on'))
  const mobileDataOn     = toBool(g('mobile_data'))
  const bluetoothRadioOn = toBool(g('bluetooth_on'))
  const nfcRadioOn       = toBool(g('nfc_on'))

  // ── Location (from cache)
  const locRaw = (locationCache?.raw ?? 'null').trim()
  const locationEnabled =
    locRaw === '0' ? false
    : locRaw === 'null' || locRaw === '' ? null
    : true
  const locMode: LocationMode =
    locRaw === '0' ? 'off' :
    locRaw === '1' ? 'device' :
    locRaw === '2' ? 'battery' :
    locRaw === '3' ? 'high' :
    'unknown'

  // ── Mobile network type
  const mobileNetworkType =
    netTypeRaw.split(',').map((s) => s.trim()).find((s) => s && s !== 'Unknown') ?? null
  const mobileConnected = mobileNetworkType !== null
  const mobileDataEnabled = mobileDataOn ?? mobileConnected

  // ── Wi-Fi
  const wifiConnected = wifiRadioOn === true

  // ── Tethering
  const tethering = parseTetherFromIfaceNames(ifaceNames, wifiRadioOn)

  const latencyMs = performance.now() - t0
  if (debug) {
    console.log(`[net] netType:`, netTypeRaw)
    console.log(`[net] ifaces:`, ifaceNames)
    console.log(`[net] total ${latencyMs.toFixed(1)} ms`)
  }

  this.wifi = { radioOn: wifiRadioOn, connected: wifiConnected, ssid: null };
  this.mobileData = { enabled: mobileDataEnabled, connected: mobileConnected, networkType: mobileNetworkType }
  this.airplaneMode = { enabled: airplaneEnabled },
  this.bluetooth = { radioOn : bluetoothRadioOn },
  this.nfc = { radioOn: nfcRadioOn },
  this.location = { enabled:locationEnabled, mode:locMode }
  this.tethering = tethering;
  this.latencyMs = latencyMs;
  
  return {
    wifi: { radioOn: wifiRadioOn, connected: wifiConnected, ssid: null },
    mobileData: {
      enabled: mobileDataEnabled,
      connected: mobileConnected,
      networkType: mobileNetworkType,
    },
    airplaneMode: { enabled: airplaneEnabled },
    bluetooth: { radioOn: bluetoothRadioOn },
    nfc: { radioOn: nfcRadioOn },
    location: { enabled: locationEnabled, mode: locMode },
    tethering,
    latencyMs,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SSID on demand (call only when Wi-Fi panel is visible)
// ─────────────────────────────────────────────────────────────────────────────

export async function getWifiSsid(opts: AdbOptions = {}): Promise<string | null> {
  try {
    const raw = await getSession(opts).run('cmd wifi status', opts.timeoutMs, 'ssid')
    const m = raw.match(/SSID[=:]\s*"?([^",\n]+)"?/)
    if (!m) return null
    const s = m[1].trim()
    if (!s || s === '<unknown ssid>' || s.startsWith('<') || s.startsWith('0x')) return null
    return s
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Warmup — spawns adb shell and primes caches
// ─────────────────────────────────────────────────────────────────────────────

export async function warmUpAdb(this: AndroidDeviceContext, opts: AdbOptions = {}): Promise<void> {
  try {
    await getSession(opts).run('true', 5000, 'warmup')
    await this.getFullNetworkState(opts)
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Watcher — polls on interval, emits only when data actually changes
// ─────────────────────────────────────────────────────────────────────────────

export interface NetworkWatcher {
  stop(): void
  refresh(): Promise<FullNetworkState>
}

export function watchNetworkState(
  this: AndroidDeviceContext,
  opts: AdbOptions & { intervalMs?: number },
  onUpdate: (state: FullNetworkState, changed: boolean) => void,
  onError?: (err: Error) => void,
): NetworkWatcher {
  const intervalMs = opts.intervalMs ?? 3000
  let stopped = false
  let lastJson = ''
  let current: FullNetworkState | null = null
  let timer: NodeJS.Timeout | null = null

  const poll = async (force = false) => {
    if (stopped) return
    try {
      const state = await this.getFullNetworkState(opts)
      current = state
      const { latencyMs, ...stable } = state
      const json = JSON.stringify(stable)
      const changed = json !== lastJson
      if (changed || force) {
        lastJson = json
        onUpdate(state, changed)
      }
    } catch (err: any) {
      onError?.(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const schedule = () => {
    if (stopped) return
    timer = setTimeout(async () => {
      await poll()
      schedule()
    }, intervalMs)
  }

  void poll(true).then(schedule)

  return {
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
    },
    async refresh() {
      await poll(true)
      return current!
    },
  }
}