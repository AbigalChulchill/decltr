import fs from "fs";

import archiver from "archiver";

const zipFile = async (inputFile: string, outFile: string) => {
  return await new Promise<void>((res, rej) => {
    const output = fs.createWriteStream(outFile);
    const archive = archiver("zip", {
      zlib: { level: 6 },
    });

    archive.on("warning", (err) => rej(err));

    archive.on("error", (err) => rej(err));

    archive.on("close", () => res(undefined));

    archive.pipe(output);

    archive.append(fs.createReadStream(inputFile), { name: "index.js" });

    archive.finalize();
  });
};

export default zipFile;
