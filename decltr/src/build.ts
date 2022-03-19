import fs from "fs";

import { build } from "esbuild";
import archiver from "archiver";

import handler from "./handler";
import {
  indexPath,
  serverfulPath,
  serverlessZipPath,
  tsconfigPath,
} from "./env";

export const buildProduction = async () => {
  await handler();

  await build({
    bundle: true,
    entryPoints: [indexPath],
    format: "cjs",
    legalComments: "external",
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    outfile: serverfulPath,
    platform: "node",
    sourcemap: "linked",
    target: "node14",
    treeShaking: true,
    tsconfig: tsconfigPath,
    write: true,
  });

  await new Promise((res, rej) => {
    const output = fs.createWriteStream(serverlessZipPath);
    const archive = archiver("zip", {
      zlib: { level: 6 },
    });

    archive.on("warning", (err) => rej(err));

    archive.on("error", (err) => rej(err));

    archive.on("close", () => res(undefined));

    archive.pipe(output);

    archive.append(fs.createReadStream(serverfulPath), { name: "index.js" });

    archive.finalize();
  });
};

buildProduction();
