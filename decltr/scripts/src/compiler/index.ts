import fs from "fs-extra";

import checkAppParams from "./checkAppParams";
import createHandlerCode from "./createHandlerCode";
import getAppParams from "./getAppParams";

import { buildDir, handlerPath } from "../env";

const compiler = async () => {
  const nodeVersion = parseInt(process.versions.node.split(".")[0]);
  if (nodeVersion < 14) {
    throw new Error(
      `You're running this script with a version of node not supported. Minimum is node14, got node${nodeVersion}.\n\nTRY (IF YOU HAVE NVM INSTALLED):\n\nnvm use node\n\nAfter updating node you may have to reinstall deps like esbuild due to version specific compilers. For this use:\n\nrm -r node_modules && yarn\n\n`
    );
  }

  const appParams = await getAppParams();
  checkAppParams(appParams);
  const handlerCode = createHandlerCode(appParams);
  await fs.ensureDir(buildDir);
  await fs.promises.writeFile(handlerPath, handlerCode, "utf-8");
};

export default compiler;
