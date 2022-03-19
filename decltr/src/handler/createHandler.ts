import fs from "fs";

import {
  indexPath,
  indicatorsPath,
  KRAKEN_API_KEY,
  KRAKEN_PRIVATE_KEY,
} from "../env";

const createHandler = async (appParams: Array<string>) => {
  let handler = `
  import App from '../src/App';
  import { placeOrder } from '../decltr/src/index';

  export const handler = async (event) => {
    const order = App({}, event);
    if (!order) {
      return null;
    }
    return await placeOrder(order, "${KRAKEN_API_KEY}", "${KRAKEN_PRIVATE_KEY}");
  };
  `;
  if (appParams.length > 0) {
    const finalIndex = appParams.length - 1;
    let needsOHLC = false;

    const parallelFetches = appParams.reduce((prev, appParam, i) => {
      const isOHLCDep = require(indicatorsPath)[appParam + "_OHLC"];
      needsOHLC = isOHLCDep ? true : needsOHLC;
      return (
        prev +
        `${appParam}(event, ${isOHLCDep ? "ohlc" : "[]"})${
          i < finalIndex ? ", " : ""
        }`
      );
    }, "");

    const imports = appParams.reduce(
      (prev, appParam) => prev + ", " + appParam,
      needsOHLC ? ", OHLC" : ""
    );

    const indicatorObj = appParams.reduce((prev, appParam, i) => {
      return prev + `${appParam}: indicatorArray[${i}],\n`;
    }, "");

    handler = `
    import App from '../src/App';
    import { placeOrder${imports} } from '../decltr/src/index';
  
    export const handler = async (event) => {
      ${needsOHLC ? "const ohlc = await OHLC(event, [])" : ""}
      const indicatorArray = await Promise.all([${parallelFetches}]);
      const indicators = {
        ${indicatorObj}
      };
      const order = App(indicators, event);
      if (!order) {
        return null;
      }
      return await placeOrder(order, "${KRAKEN_API_KEY}", "${KRAKEN_PRIVATE_KEY}");
    };
    `;
  }

  await fs.promises.writeFile(indexPath, handler, "utf-8");
};

export default createHandler;
