const Import = <T = any>(fn: string) => {
  delete require.cache[require.resolve(fn)];
  return require(fn) as T;
};

export default Import;
