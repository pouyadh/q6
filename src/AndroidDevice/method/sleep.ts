import { AndroidDeviceContext } from "../types.js";
export default function sleep(this:AndroidDeviceContext, seconds:number): void {
    const ms = seconds * 1000;
    const start = Date.now();
    while (Date.now() - start < ms) {
        // Busy wait
    }
}