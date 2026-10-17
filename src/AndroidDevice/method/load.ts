import { AndroidDeviceContext } from "../types.js";
import path from 'node:path'
import fs from 'node:fs'
export default function load(this:AndroidDeviceContext) {
    const filePath = path.join(__dirname,`../save/${this.serial}.json`);
    if (!fs.existsSync(filePath)) return null;
    const savedContent = JSON.parse(fs.readFileSync(filePath).toString());
    this.PIN = savedContent.PIN;
    return savedContent;
}