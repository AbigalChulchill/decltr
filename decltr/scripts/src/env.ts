import path from "path";

const cwd = process.cwd();

// decltr directory
export const indicatorsPath = path.resolve(
  cwd,
  "./decltr/lib/dist/indicators.js"
);

// src directory
export const appPath = path.resolve(cwd, "./src/App.ts");

// build directory
export const buildDir = path.resolve(cwd, "./build");
export const handlerPath = path.resolve(cwd, "./build/handler.ts");
