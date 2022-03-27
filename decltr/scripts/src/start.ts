import http from "http";

import chokidar from "chokidar";
import express from "express";
import morgan from "morgan";
import ws from "ws";

import { updateApp, validateDevEventSchema } from "./startUtils";
import { publicDir, srcDir } from "./env";

import { DecltrDevEvent } from "../../lib/src/types";

const nodeVersion = parseInt(process.versions.node.split(".")[0]);
if (nodeVersion < 14) {
  console.error(
    `You're running this script with a version of node not supported. Minimum is node14, got node${nodeVersion}.\n\nTRY (IF YOU HAVE NVM INSTALLED):\n\nnvm use node\n\nAfter updating node you may have to reinstall deps like esbuild due to version specific compilers. For this use:\n\nrm -r node_modules && yarn\n\n`
  );
  process.exit(1);
}

const srcWatcher = chokidar.watch(srcDir, { ignoreInitial: true });

const webApp = express();
webApp.use(morgan("dev"));
webApp.use("/", express.static(publicDir));
const httpServer = http.createServer(webApp);
const wsServer = new ws.WebSocket.Server({
  clientTracking: false,
  noServer: true,
});

httpServer.on("upgrade", (req, socket, head) =>
  wsServer.handleUpgrade(req, socket, head, (ws, wsReq) =>
    wsServer.emit("connection", ws, wsReq)
  )
);

wsServer.on("connection", (ws) => {
  let event: DecltrDevEvent | null = null;

  const listener = () =>
    event &&
    updateApp(event)
      .then((res) =>
        ws.send(JSON.stringify(res), (err) => err && ws.emit("error", err))
      )
      .catch((err) => ws.emit("error", err));

  srcWatcher.on("change", listener);

  ws.on("message", (ev) => {
    try {
      event = JSON.parse(ev.toString("utf-8"));
      validateDevEventSchema(event);
      listener();
    } catch (err) {
      ws.emit("error", err);
    }
  });

  ws.on("error", (err) => {
    ws.close();
    console.error("WS /error 400", err);
  });

  ws.on("close", () => {
    srcWatcher.removeListener("change", listener);
    ws.removeAllListeners();
    console.log("WS /close 200");
  });

  console.log("WS /open 200");
});

httpServer.listen(3000, () => console.log("Listening on port 3000!"));
