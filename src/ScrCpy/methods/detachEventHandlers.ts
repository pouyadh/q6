import { ScrCpyContext } from "../types.js";
export default function detachEventHandlers(
    this:ScrCpyContext
): void {
    this.readlineOut?.removeAllListeners();
    this.readlineErr?.removeAllListeners();
}