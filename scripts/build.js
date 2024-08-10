import { exec as _exec } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import * as esbuild from "esbuild";
import clear from "./clear.js";

const exec = command => new Promise((resolve, reject) =>
    _exec(command, (error, stdout, stderr) =>
        error ? reject(error) : resolve(stdout + stderr))
);
const copy = (from, to) => createReadStream(from).pipe(createWriteStream(to));

clear();

await exec("mkdocs build");
copy('./src/webgl-less.html', './site/webgl-less.html');
await esbuild.build({
    entryPoints: [ "./src/index.js" ],
    bundle: true,
    minify: true,
    outfile: './site/assets/javascripts/home.js',
});
