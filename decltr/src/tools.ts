import { buildProduction } from "./build";
import { envSetting } from "./env";

const main = async () => {
  if (envSetting === "production") {
    await buildProduction();
  }
};

main();
