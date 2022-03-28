import chalk from "chalk";

import { checkAppParams, compileLocalApp } from "../compiler";
import { indicatorsPath, localAppJSPath } from "../env";

import { DecltrDevEvent, DecltrDevResult, HashMap } from "../types";
import { fetch_DEV } from "./indicators";

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
  const schema: HashMap = {
    pair: "string",
    volume: "string",
    profit: "string",
    startTime: "number",
    endTime: "number",
  };

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

  const currDate = new Date(event.startTime);
  currDate.setSeconds(0);
  currDate.setMilliseconds(0);
  const mins = currDate.getMinutes();
  const nearestFive = Math.floor(mins / 5) * 5;
  const diff = mins - nearestFive;
  event.startTime = event.startTime - diff * 60 * 1000;
};

export const logger = (method: string, route: string) => {
  const start = new Date().getTime();
  return (status: number, reason?: string) => {
    const end = new Date().getTime();
    const ms = end - start;
    const timerDisplay =
      ms < 500
        ? chalk.green
        : ms < 1000
        ? chalk.blue
        : ms < 1500
        ? chalk.yellow
        : chalk.red;
    const crayon =
      status === 200 ? chalk.green : status >= 400 ? chalk.red : chalk.blue;
    console.log(
      method,
      route,
      crayon(status),
      "-",
      timerDisplay(`${ms}ms`),
      `- ${reason ? reason : ""}`
    );
  };
};

export * from "./indicators";
