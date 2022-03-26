import compiler from "./compiler";

const nodeVersion = parseInt(process.versions.node.split(".")[0]);
if (nodeVersion < 14) {
  console.error(
    `You're running this script with a version of node not supported. Minimum is node14, got node${nodeVersion}.\n\nTRY (IF YOU HAVE NVM INSTALLED):\n\nnvm use node\n\nAfter updating node you may have to reinstall deps like esbuild due to version specific compilers. For this use:\n\nrm -r node_modules && yarn\n\n`
  );
  process.exit(1);
}

compiler()
  .then(console.log)
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
