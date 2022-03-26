import path from "path";

import dotenv from "dotenv";
import env from "env-var";
dotenv.config();

const cwd = process.cwd();

// decltr directory
export const decltrLibSrc = path.resolve(cwd, "./decltr/lib/src");
export const indicatorsPath = path.resolve(
  cwd,
  "./decltr/lib/dist/indicators.js"
);

// project directory
export const tsconfigPath = path.resolve(cwd, "./tsconfig.json");

// src directory
export const appPath = path.resolve(cwd, "./src/App.ts");
export const srcDir = path.resolve(cwd, "./src");

// build directory
export const buildDir = path.resolve(cwd, "./build");
export const zipPath = path.resolve(cwd, "./build/handler.zip");

// build/sls
export const buildSLSDir = path.resolve("./build/sls");
export const handlerTSPath = path.resolve(cwd, "./build/sls/handler.ts");
export const handlerJSPath = path.resolve(cwd, "./build/sls/handler.js");

// build/local
export const buildLocalDir = path.resolve(cwd, "./build/local");
export const localAppJSPath = path.resolve(cwd, "./build/local/App.js");

// API_KEYS
export const KRAKEN_API_KEY = env.get("KRAKEN_API_KEY").required().asString();
export const KRAKEN_PRIVATE_KEY = env
  .get("KRAKEN_PRIVATE_KEY")
  .required()
  .asString();
