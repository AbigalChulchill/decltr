import { CompilerError } from "./../types";

const compilerError = (ce: CompilerError) => {
  console.error("Compiler Error: ", ce.compiler);
  console.error("Human Error: ", ce.human);
  console.error("SOLUTIONS:\n\n");
  ce.solutions.forEach((solution) => console.error(solution));
};

export default compilerError;

export const defineDecltrApp =
  "try defining an application component in your source file like so:\n\nconst App = async () => {};\n\n";

export const exportDefaultApp =
  "try exporting an application component in your source file like so:\n\nexport default [COMPONENT_NAME];\n\n";

export const decltrAppUsingConst =
  "try declaring your application component via const like so:\n\nconst App = async () => {};\n\n";

export const decltrAppUsingDestructuring =
  "try using destructuring for your application component's first arguments like so:\n\nconst App = async ({ ticker, RSI, MACD }) => {};\n\n";

export const addImplementationForIndicator =
  "try adding an the indicator to the src/indicators.ts file. you can read more about this @ https://www.decltr.com/custom_indicators\n\n";

export const fixTypoForIndicator =
  "fix a typo for the indicator. you can read a list of default supported indicators @ https://www.decltr.com/indicators\n\n";

export const removeCircularIndicatorDependency =
  "circular dependencies can be done by calling the implementation of the indicators and using a cache to avoid redundant calls or avoid using custom dependencies and only use the decltr indicators. you can learn more about circular dependencies here @ https://www.decltr.com/circular_indicator_dependencies";
