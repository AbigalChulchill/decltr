import path from "path";

import env from "env-var";
import dotenv from "dotenv";
dotenv.config();

export const cwd = process.cwd();

const isStart = process.argv[2] === "start";

// Source
export const srcDir = path.resolve(cwd, "./src");
export const appPath = path.resolve(cwd, "./src/App.ts");
export const tsconfigPath = path.resolve(cwd, "./tsconfig.json");

// Build
export const buildDir = path.resolve(cwd, "./build");
export const indexPath = path.resolve(cwd, "./build/index.ts");
export const serverfulPath = path.resolve(cwd, "./build/serverfull.js");
export const serverlessPath = path.resolve(cwd, "./build/serverless.js");
export const serverlessZipPath = path.resolve(cwd, "./build/serverless.zip");

// __dirname
export const indicatorsPath = path.resolve(
  __dirname,
  "./handler/indicators.js"
);

// production or development
export const envSetting: "production" | "development" = isStart
  ? "development"
  : "production";

// env vars
export const KRAKEN_API_KEY = env.get("KRAKEN_API_KEY").required().asString();
export const KRAKEN_PRIVATE_KEY = env
  .get("KRAKEN_PRIVATE_KEY")
  .required()
  .asString();
