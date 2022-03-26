import { indicatorsPath } from "../env";

const createHandlerCode = (appParams: Array<string>) => {
  if (appParams.length === 0) {
    return `
    import { placeOrder } from "../decltr/lib/src";
    import App from "../src/App";
    
    export const handler = async (event) => {
      const order = App();

      if (!order) {
        return order;
      }
      
      return await placeOrder(order); 
    };
    `;
  }

  const indicatorsImport = require(indicatorsPath);

  const imports = appParams.join(", ");

  const ohlcDeps = appParams.filter(
    (appParam) => indicatorsImport[appParam + "_OHLC"]
  );
  const nonDeps = appParams.filter(
    (appParam) => !indicatorsImport[appParam + "_OHLC"]
  );
  // const ohlcRaw = appParams.some((appParam) => appParam === "OHLC");

  if (ohlcDeps.length === 0) {
    const indicatorsArr = `const indicatorsArr = await Promise.all([
      ${nonDeps.join("(event, []), ") + "(event, [])"}
    ])`;
    const order = `const order = App({
      ${nonDeps.reduce(
        (prev, appParam, i) => `${prev}${appParam}: indicatorsArr[${i}],\n`,
        ""
      )}
    })`;

    return `
    import { placeOrder, ${imports} } from "../decltr/lib/src";
    import App from "../src/App";
    
    export const handler = async (event) => {
      ${indicatorsArr};
      ${order};

      if (!order) {
        return order;
      }
      
      return await placeOrder(order); 
    };
    `;
  }

  const nonDepsWithoutOHLC = nonDeps.filter((appParam) => appParam !== "OHLC");

  const nonDepsIndicatorArr =
    nonDepsWithoutOHLC.join("(event, []), ") +
    (nonDepsWithoutOHLC.length > 0 ? "(event, [])" : "");
  // const depsIndicatorsArr = `OHLC(event, []).then(ohlc => Promise.all([
  //   ${ohlcDeps.join("(event, ohlc), ") + "(event, ohlc)"}
  // ]))`

  const indicatorsArr = `const indicatorsArr = await Promise.all(${nonDepsIndicatorArr})`;

  const order = "";

  return `
  import { placeOrder, ${imports} } from "../decltr/lib/src";
  import App from "../src/App";

  export const handler = async () => {
    ${indicatorsArr};
    ${order}

    if (!order) {
      return order;
    }
    
    return await placeOrder(order); 
  };
  `;
};

export default createHandlerCode;
