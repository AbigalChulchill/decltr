import { decltrLibSrc, appPath, indicatorsPath } from "../env";

interface Struct {
  ohlcDeps: Array<string>;
  freeDeps: Array<string>;
  ohlcRaw: Boolean;
}

const createHandlerCode = (appParams: Array<string>) => {
  let imports = "";
  let body = "";

  if (appParams.length === 0) {
    imports = "placeOrder";
    body = "const order = App({}, event);";
  } else {
    const indicatorImport = require(indicatorsPath);
    const ohlcDeps = appParams.filter((pm) => indicatorImport[pm + "_OHLC"]);
    const freeDeps = appParams.filter(
      (pm) => pm !== "OHLC" && !indicatorImport[pm + "_OHLC"]
    );
    const ohlcRaw = appParams.some((pm) => pm === "OHLC");

    const struct: Struct = {
      ohlcDeps,
      freeDeps,
      ohlcRaw,
    };

    imports = getImports(struct);
    body = getBody(struct);
  }

  return `
    import { ${imports} } from "${decltrLibSrc}";
    import App from "${appPath.split(".ts")[0]}";
    
    export const handler = async (event) => {
      ${body}

      if (!order) {
        return order;
      }
      
      return await placeOrder(order); 
    };
    `;
};

export default createHandlerCode;

const getImports = (struct: Struct) => {
  let imports = "placeOrder";

  if (struct.freeDeps.length > 0) {
    imports += ", " + struct.freeDeps.join(", ");
  }

  if (struct.ohlcDeps.length > 0) {
    imports += ", " + struct.ohlcDeps.join(", ");
  }

  if (struct.ohlcRaw || struct.ohlcDeps.length > 0) {
    imports += ", OHLC";
  }

  return imports;
};

const getIndicatorObj = (struct: Struct) => {
  let indicatorObj = "";

  if (struct.freeDeps.length > 0) {
    indicatorObj += struct.freeDeps.reduce(
      (prev, pm, i) => prev + `${pm}: indicatorArr[${i}],\n`,
      ""
    );
  }
  if (struct.ohlcDeps.length === 0 && struct.ohlcRaw) {
    indicatorObj += `OHLC: indicatorArr[${struct.freeDeps.length}]`;
  }
  if (struct.ohlcDeps.length > 0 && !struct.ohlcRaw) {
    if (struct.ohlcDeps.length === 1) {
      indicatorObj += `${struct.ohlcDeps[0]}: indicatorArr[${struct.freeDeps.length}]`;
    } else {
      indicatorObj += struct.ohlcDeps.reduce(
        (prev, pm, i) =>
          prev + `${pm}: indicatorArr[${struct.freeDeps.length}][${i}],\n`,
        ""
      );
    }
  }
  if (struct.ohlcDeps.length > 0 && struct.ohlcRaw) {
    indicatorObj += struct.ohlcDeps.reduce(
      (prev, pm, i) =>
        prev + `${pm}: indicatorArr[${struct.freeDeps.length}][${i}],\n`,
      ""
    );
    indicatorObj += `OHLC: indicatorArr[${struct.freeDeps.length}][${struct.ohlcDeps.length}],\n`;
  }

  return indicatorObj;
};

const getBody = (struct: Struct) => {
  let indicatorArr = "";

  if (struct.freeDeps.length > 0) {
    indicatorArr += struct.freeDeps.join("(event, []), ") + "(event, [])";
  }
  if (struct.ohlcDeps.length === 0 && struct.ohlcRaw) {
    indicatorArr += (indicatorArr === "" ? "" : ", ") + "OHLC(event, [])";
  }
  if (struct.ohlcDeps.length > 0 && !struct.ohlcRaw) {
    if (struct.ohlcDeps.length === 1) {
      indicatorArr +=
        (indicatorArr === "" ? "" : ", ") +
        `OHLC(event, []).then(ohlc => ${struct.ohlcDeps[0]}(event, ohlc))`;
    } else {
      const ohlcIndicatorArr =
        struct.ohlcDeps.join("(event, ohlc), ") + "(event, ohlc)";
      indicatorArr +=
        (indicatorArr === "" ? "" : ", ") +
        `OHLC(event, []).then(ohlc => Promise.all([
      ${ohlcIndicatorArr}
    ]))`;
    }
  }
  if (struct.ohlcDeps.length > 0 && struct.ohlcRaw) {
    const ohlcIndicatorArr =
      struct.ohlcDeps.join("(event, ohlc), ") + "(event, ohlc)";
    indicatorArr +=
      (indicatorArr === "" ? "" : ", ") +
      `OHLC(event, []).then(ohlc => Promise.all([
      ${ohlcIndicatorArr}, ohlc
    ]))`;
  }

  const indicatorObj = getIndicatorObj(struct);

  return `const indicatorArr = await Promise.all([
    ${indicatorArr}
  ]);
  const indicatorObj = {
    ${indicatorObj}
  };
  const order = App(indicatorObj, event);
  `;
};
