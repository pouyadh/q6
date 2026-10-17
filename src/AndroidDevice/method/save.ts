import { AndroidDeviceContext } from "../types.js";
import path from 'node:path'
import fs from 'node:fs'
export default function save(this:AndroidDeviceContext) {
    const filePath = path.join(__dirname,`../save/${this.serial}.json`);
    const data = JSON.stringify({ PIN: this.PIN });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, data);
}