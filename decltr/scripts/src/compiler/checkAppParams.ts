import { indicatorsPath } from "../env";

const checkAppParams = (appParams: Array<string>) => {
  const indicatorImport = require(indicatorsPath);

  for (const appParam of appParams) {
    if (!indicatorImport[appParam]) {
      throw new Error(
        `indicator ${appParam} referenced in component but not implemented in ${indicatorsPath}`
      );
    }
  }
};

export default checkAppParams;
