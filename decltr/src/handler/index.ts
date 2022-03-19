import compilerError, {
  addImplementationForIndicator,
  fixTypoForIndicator,
} from "./compilerError";
import { indicatorsPath } from "../env";
import createHandler from "./createHandler";
import getAppParams from "./getAppParams";
import Import from "../Import";

const handler = async () => {
  const appParams = await getAppParams();
  const indicatorHashMap = Import(indicatorsPath);
  appParams.forEach((param) => {
    if (!indicatorHashMap[param]) {
      compilerError({
        compiler: `default indicatorHashMap doesn't have a indicator called ${param} yet is used within the component.`,
        human: `the indicator ${param} was used but isn't implemented. try doing:\n\n`,
        solutions: [addImplementationForIndicator, fixTypoForIndicator],
      });
      process.exit(1);
    }
  });
  await createHandler(appParams);
};

export default handler;
