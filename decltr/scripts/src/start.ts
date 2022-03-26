import chokidar from "chokidar";

import { checkAppParams, compileLocalApp } from "./compiler";
import { appPath, srcDir } from "./env";
import { getIndicatorObjsRuntime, importFresh } from "./startUtils";

const nodeVersion = parseInt(process.versions.node.split(".")[0]);
if (nodeVersion < 14) {
  console.error(
    `You're running this script with a version of node not supported. Minimum is node14, got node${nodeVersion}.\n\nTRY (IF YOU HAVE NVM INSTALLED):\n\nnvm use node\n\nAfter updating node you may have to reinstall deps like esbuild due to version specific compilers. For this use:\n\nrm -r node_modules && yarn\n\n`
  );
  process.exit(1);
}

const srcWatcher = chokidar.watch(srcDir, { ignoreInitial: true });

srcWatcher.on("change", async () => {
  try {
    const appParams = await compileLocalApp();
    checkAppParams(appParams);

    const indicatorObjs = await getIndicatorObjsRuntime(appParams);

    const App = importFresh<any>(appPath);

    const results = indicatorObjs.map((indicatorObj) =>
      App(indicatorObj, { pair: "ADAUSD", profit: ".01", volume: "20" })
    );

    console.log(results);
  } catch (err) {
    console.error(err);
  }
});
