import { build } from "esbuild";
import fs from "fs-extra";

import checkAppParams from "./checkAppParams";
import createHandlerCode from "./createHandlerCode";
import getAppParams from "./getAppParams";
import zipFile from "./zipFile";

import {
  appPath,
  buildDir,
  buildLocalDir,
  buildSLSDir,
  handlerTSPath,
  handlerJSPath,
  localAppJSPath,
  tsconfigPath,
  zipPath,
} from "../env";

const compiler = async () => {
  await fs.ensureDir(buildDir);
  await fs.ensureDir(buildSLSDir);
  await fs.ensureDir(buildLocalDir);

  const appParams = await getAppParams();
  checkAppParams(appParams);
  const handlerCode = createHandlerCode(appParams);
  await fs.promises.writeFile(handlerTSPath, handlerCode, "utf-8");

  await build({
    bundle: true,
    entryPoints: [handlerTSPath],
    external: ["aws-sdk"],
    format: "cjs",
    legalComments: "linked",
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    outfile: handlerJSPath,
    platform: "node",
    target: "node14",
    treeShaking: true,
    tsconfig: tsconfigPath,
    write: true,
  });

  await zipFile(handlerJSPath, zipPath);
};

export default compiler;

export const compileLocalApp = async () => {
  const [_, appParams] = await Promise.all([
    build({
      bundle: true,
      entryPoints: [appPath],
      external: ["aws-sdk"],
      format: "cjs",
      legalComments: "linked",
      minify: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      outfile: localAppJSPath,
      platform: "node",
      target: "node14",
      treeShaking: true,
      tsconfig: tsconfigPath,
      write: true,
    }),
    getAppParams(),
  ]);

  return appParams;
};
