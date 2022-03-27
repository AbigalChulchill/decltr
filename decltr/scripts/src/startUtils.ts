import { checkAppParams, compileLocalApp } from "./compiler";
import { indicatorsPath, localAppJSPath } from "./env";

import { fetch_DEV } from "../../lib/src/indicators_DEV";
import { DecltrDevEvent, DecltrDevResult } from "../../lib/src/types";

export const importFresh = <T = any>(
  filePath: string,
  dontUseDefaultExport?: boolean
) => {
  delete require.cache[require.resolve(filePath)];
  const im = require(filePath);

  if (dontUseDefaultExport) {
    return im as T;
  }
  return im.default as T;
};

export const getIndicatorObjsRuntime = async (
  appParams: Array<string>,
  event: DecltrDevEvent
) => {
  const indicatorImport = require(indicatorsPath);

  const needsOHLC =
    appParams.includes("OHLC") ||
    appParams.some((pm) => indicatorImport[pm + "_OHLC"]);
  const needsAssetPair = appParams.includes("assetPair");

  return await fetch_DEV(event, { needsOHLC, needsAssetPair });
};

export const updateApp = async (event: DecltrDevEvent) => {
  const appParams = await compileLocalApp();
  checkAppParams(appParams);

  const indicatorObjs = await getIndicatorObjsRuntime(appParams, event);

  const App = importFresh<any>(localAppJSPath);

  const results = indicatorObjs.map((indicator) => ({
    price: indicator.ticker.a[0],
    App: App(indicator, event),
  })) as Array<DecltrDevResult>;

  return results;
};

export const validateDevEventSchema = (event: any) => {
  // improve this with types
  // problem is, ts gets real mad
  // when indexing, fuck you ts let
  // me index everything with string!

  const schema = {
    pair: "string",
    volume: "string",
    profit: "string",
    startTime: "number",
    endTime: "number",
  } as any;

  for (const elem in schema) {
    if (typeof event[elem] !== schema[elem]) {
      console.info(event);
      throw new Error(
        `Decltr Dev Event Recieved Doesn't Match Schema. Expected Key ${elem} To Be Of Type ${
          schema[elem]
        } But Got ${event[elem]} of type ${typeof event[
          elem
        ]}. The event has been logged above for debugging reasons`
      );
    }
  }
};
