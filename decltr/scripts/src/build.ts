import compiler from "./compiler";

compiler()
  .then(console.log)
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
