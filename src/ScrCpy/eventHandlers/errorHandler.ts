import { ScrCpyContext } from "../types.js";

export default function errorHandler(
    this:ScrCpyContext,
    err:Error
): void {
    console.log(err);
}