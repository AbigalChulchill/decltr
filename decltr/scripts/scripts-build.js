const path = require("path");

const NodeResolve = require("@esbuild-plugins/node-resolve");
const { build } = require("esbuild");

const main = async () => {
  const cwd = process.cwd();
  const entryPoints = [
    path.resolve(cwd, "./decltr/scripts/src/start.ts"),
    path.resolve(cwd, "./decltr/scripts/src/build.ts"),
  ];
  const outdir = path.resolve(cwd, "./decltr/scripts/dist");

  const tsconfig = path.resolve(
    cwd,
    "./decltr/scripts/tsconfig.decltr-scripts.json"
  );

  await build({
    bundle: true,
    entryPoints,
    external: ["./node_modules"],
    format: "cjs",
    legalComments: "linked",
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    outdir,
    plugins: [
      NodeResolve.default({
        extensions: [".ts", ".js"],
        onResolved: (resolved) => {
          if (resolved.includes("node_modules")) {
            return {
              external: true,
            };
          }
          return resolved;
        },
      }),
    ],
    platform: "node",
    target: "node14",
    treeShaking: true,
    tsconfig,
    write: true,
  });
};

main();
