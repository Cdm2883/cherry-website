import fs from "node:fs";
import paths from "node:path";
import { fileURLToPath } from "node:url";

export default function clear() {
    deletePathForce("./site")
}

function deletePathForce(path) {
    if (!fs.existsSync(path)) return;
    if (fs.lstatSync(path).isFile()) return fs.unlinkSync(path);
    fs.readdirSync(path)
        .map(name => paths.resolve(path, name))
        .forEach(deletePathForce);
    fs.rmdirSync(path);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) clear();
