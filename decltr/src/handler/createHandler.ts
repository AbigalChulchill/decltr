import {
  AWS_SECRET_NAME,
  AWS_SECRET_REGION,
  indicatorsPath,
  envTarget,
  KRAKEN_API_KEY,
  KRAKEN_PRIVATE_KEY,
} from "../env";

const createHandler = (appParams: Array<string>): string => {
  const getAPIKeysServerfull = `${JSON.stringify(
    KRAKEN_API_KEY
  )}, ${JSON.stringify(KRAKEN_PRIVATE_KEY)}`;

  const constantImports = `placeOrder${
    envTarget === "serverless" ? ", useAWSSecret" : ""
  }`;

  const appImportLine = `import App from '../src/App';`;
  let importDepsLine = `import { ${constantImports} } from '../decltr/src/index';`;
  const handlerLine = `  export const handler = async (event) => {\ntry{`;
  let callDepsLine = ``;
  let indicatorsObjLine = ``;
  let callAppLine = `const order = App({}, event);`;
  const placeOrderLine = `if (!order) {
    return null;
  }
  ${
    envTarget === "serverless"
      ? `const { KRAKEN_API_KEY, KRAKEN_PRIVATE_KEY } = await useAWSSecret(${JSON.stringify(
          AWS_SECRET_NAME
        )}, ${JSON.stringify(AWS_SECRET_REGION)})`
      : ""
  };
  return await placeOrder(order, ${
    envTarget === "serverfull"
      ? getAPIKeysServerfull
      : "KRAKEN_API_KEY, KRAKEN_PRIVATE_KEY"
  });
  } catch (err) {
    console.error(err.message);
  }
}`;

  // no params
  if (appParams.length === 0) {
    return [
      appImportLine,
      importDepsLine,
      handlerLine,
      callAppLine,
      placeOrderLine,
    ].join("\n");
  }
  const indicatorsImport = require(indicatorsPath);

  const hasOHLCRaw = appParams.some((appParam) => appParam === "OHLC");
  const OHLCDeps = appParams.filter(
    (appParam) => indicatorsImport[appParam + "_OHLC"]
  );
  const nonOHLCDeps = appParams.filter(
    (appParam) => !indicatorsImport[appParam + "_OHLC"]
  );

  // no ohlc based params
  if (OHLCDeps.length === 0) {
    importDepsLine = `import { ${constantImports}, ${appParams.join(
      ", "
    )} } from '../decltr/src/index';`;
    callDepsLine = `const indicatorArr = await Promise.all([${appParams.join(
      "(event, []), "
    )}(event, [])]);`;
    indicatorsObjLine = `const indicators = {${appParams.reduce(
      (prev, appParam, i) => prev + `\n${appParam}: indicatorArr[${i}],`,
      ""
    )}}`;
    callAppLine = `const order = App(indicators, event);`;
    return [
      appImportLine,
      importDepsLine,
      handlerLine,
      callDepsLine,
      indicatorsObjLine,
      callAppLine,
      placeOrderLine,
    ].join("\n");
  }

  // only ohlc based params
  if (nonOHLCDeps.length === 0 || (hasOHLCRaw && nonOHLCDeps.length === 1)) {
    importDepsLine = `import { ${constantImports}, ${appParams.join(
      ", "
    )} } from '../decltr/src/index';`;
    callDepsLine = `const ohlc = await OHLC(event, []);\nconst indicatorArr = await Promise.all([${OHLCDeps.join(
      "(event, ohlc), "
    )}(event, ohlc)]);`;
    indicatorsObjLine =
      `const indicators = {${OHLCDeps.reduce(
        (prev, appParam, i) => prev + `\n${appParam}: indicatorArr[${i}],`,
        ""
      )}` + (hasOHLCRaw ? "ohlc};" : "};");
    callAppLine = `const order = App(indicators, event);`;
    return [
      appImportLine,
      importDepsLine,
      handlerLine,
      callDepsLine,
      indicatorsObjLine,
      callAppLine,
      placeOrderLine,
    ].join("\n");
  }

  // mixed

  importDepsLine = `import { ${constantImports}, ${appParams.join(", ")}${
    !hasOHLCRaw && OHLCDeps.length > 0 ? ", OHLC" : ""
  } } from '../decltr/src/index';`;
  const nonOHLCDepsWithoutOHLC = nonOHLCDeps.filter(
    (appParam) => appParam !== "OHLC"
  );
  const parallizedOHLC =
    OHLCDeps.length > 1
      ? `OHLC(event, []).then(ohlc => Promise.all([${OHLCDeps.join(
          "(event, ohlc), "
        )}(event, ohlc), ${hasOHLCRaw ? "ohlc" : ""}]))`
      : `OHLC(event, []).then(ohlc => ${OHLCDeps[0]}(event, ohlc))`;

  callDepsLine = `const indicatorArr = await Promise.all([${nonOHLCDepsWithoutOHLC.join(
    "(event, []), "
  )}(event, []), ${parallizedOHLC}])`;
  indicatorsObjLine = `const indicators = {
    ${nonOHLCDepsWithoutOHLC.reduce(
      (prev, appParam, i) => prev + `\n${appParam}: indicatorArr[${i}],`,
      ""
    )}
    ${
      OHLCDeps.length > 1
        ? OHLCDeps.reduce(
            (prev, appParam, i) =>
              prev +
              `\n${appParam}: indicatorArr[${nonOHLCDepsWithoutOHLC.length}][${i}],`,
            ""
          )
        : `${OHLCDeps[0]}: indicatorArr[${nonOHLCDepsWithoutOHLC.length}]`
    }
    ${
      hasOHLCRaw
        ? `OHLC: indicatorArr[${nonOHLCDepsWithoutOHLC.length}][${OHLCDeps.length}]`
        : ""
    }
  }`;
  callAppLine = `const order = App(indicators, event);`;

  return [
    appImportLine,
    importDepsLine,
    handlerLine,
    callDepsLine,
    indicatorsObjLine,
    callAppLine,
    placeOrderLine,
  ].join("\n");

  return "";
};

export default createHandler;
