import path from "path";

import env from "env-var";
import dotenv from "dotenv";
import minimist from "minimist";

dotenv.config();
const commandArgs = minimist(process.argv.slice(2));

const task = commandArgs["_"][0] as "start" | "build";
const isServerless = commandArgs.serverless as boolean;
const isServerfull = commandArgs.serverfull as boolean;

if (task !== "start" && task !== "build") {
  console.error(
    "expected first argument to be either start or build got:",
    task
  );
  process.exit(1);
}
if (isServerless && isServerfull) {
  console.error("expected either serverless or serverfull but got both", task);
  process.exit(1);
}

export const cwd = process.cwd();

// Source
export const srcDir = path.resolve(cwd, "./src");
export const appPath = path.resolve(cwd, "./src/App.ts");
export const tsconfigPath = path.resolve(cwd, "./tsconfig.json");

// Build
export const buildDir = path.resolve(cwd, "./build");
export const indexPath = path.resolve(cwd, "./build/index.ts");
export const serverfullPath = path.resolve(cwd, "./build/serverfull.js");
export const serverlessPath = path.resolve(cwd, "./build/serverless.js");
export const serverlessZipPath = path.resolve(cwd, "./build/serverless.zip");

// __dirname
export const indicatorsPath = path.resolve(
  __dirname,
  "./handler/indicators.js"
);

// development, production, serverless, serverfull
export const envSetting: "development" | "production" =
  task === "start" ? "development" : "production";
export const envTarget: "serverless" | "serverfull" | "development" =
  envSetting === "development"
    ? "development"
    : isServerless === undefined && isServerfull === undefined
    ? "serverless"
    : "serverfull";

// env vars
export const KRAKEN_API_KEY = env
  .get("KRAKEN_API_KEY")
  .required(envTarget === "serverfull")
  .asString();
export const KRAKEN_PRIVATE_KEY = env
  .get("KRAKEN_PRIVATE_KEY")
  .required(envTarget === "serverfull")
  .asString();

export const AWS_SECRET_NAME = env
  .get("AWS_SECRET_NAME")
  .required(envTarget === "serverless")
  .asString();
export const AWS_SECRET_REGION = env
  .get("AWS_SECRET_REGION")
  .required(envTarget === "serverless")
  .asString();
