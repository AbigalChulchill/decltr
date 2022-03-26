// import { Indicators } from "../../lib/src/types";

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
  appParams: Array<string>
): Promise<Array<any>> => {
  console.log("getting indicator objs for", appParams.join(", "));
  // const indicatorImport = require(indicatorsPath);
  // const ohlcDeps = appParams.filter((pm) => indicatorImport[pm + "_OHLC"]);
  // const freeDeps = appParams.filter(
  //   (pm) => pm !== "OHLC" && !indicatorImport[pm + "_OHLC"]
  // );
  // const ohlcRaw = appParams.includes("OHLC");

  /*
  HEY YOU"RE GONNA NEED A DEV IMPL
  OF INDICATORS. NOTICE HOW HERE,
  WE COULD TRY JUST USING THE 
  PRODUCTION VERSIONS, BUT WE CAN"T,
  SPECIFY THE TIME TO GET THE DATA...
  */

  return [];
};
