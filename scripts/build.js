import { exec as _exec } from "node:child_process";
import * as esbuild from "esbuild";
import clear from "./clear.js";

const exec = command => new Promise((resolve, reject) =>
    _exec(command, (error, stdout, stderr) =>
        error ? reject(error) : resolve(stdout + stderr))
);

clear();

await exec("mkdocs build");
await esbuild.build({
    entryPoints: [ "./src/index.js" ],
    target: [ "chrome58", "firefox57", "safari11", "edge16" ],
    bundle: true,
    minify: true,
    outfile: 'site/assets/javascripts/main.js',
});
