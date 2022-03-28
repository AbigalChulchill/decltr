import http from "http";

import chokidar from "chokidar";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import ws from "ws";

import { publicDir, srcDir } from "./env";
import apiRoutes from "./routes/apiRoutes";
import { DecltrDevEvent } from "./types";
import { logger, updateApp, validateDevEventSchema } from "./start-utils";

const nodeVersion = parseInt(process.versions.node.split(".")[0]);
if (nodeVersion < 14) {
  console.error(
    `You're running this script with a version of node not supported. Minimum is node14, got node${nodeVersion}.\n\nTRY (IF YOU HAVE NVM INSTALLED):\n\nnvm use node\n\nAfter updating node you may have to reinstall deps like esbuild due to version specific compilers. For this use:\n\nrm -r node_modules && yarn\n\n`
  );
  process.exit(1);
}

const srcWatcher = chokidar.watch(srcDir, { ignoreInitial: true });

const webApp = express();
webApp.use(cors());
webApp.use(morgan("dev"));
webApp.use("/api", apiRoutes);
webApp.use("/dev-tools", express.static(publicDir));
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

  const listener = () => {
    const log = logger("decltr", "/app");

    if (!event) {
      log(204, "No event");
      return;
    }
    updateApp(event)
      .then((res) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(res), (err) => {
            if (err) {
              log(400, err.message);
              ws.emit("error", err);
              return;
            }
            log(200, "response sent");
          });
          return;
        }
        log(400, "ws is closed!");
      })
      .catch((err) => {
        log(400, err.message);
        ws.emit("error", err);
      });
  };

  srcWatcher.on("change", listener);

  ws.on("message", (ev) => {
    const log = logger("ws", "/msg");
    try {
      event = JSON.parse(ev.toString("utf-8"));
      validateDevEventSchema(event);
      listener();
      log(200);
    } catch (err) {
      log(400, err.message);
      ws.emit("error", err);
    }
  });

  ws.on("error", () => ws.close());

  ws.on("close", () => {
    const log = logger("ws", "/close");
    srcWatcher.removeListener("change", listener);
    ws.removeAllListeners();
    log(200, "- all listeners cleaned");
  });

  logger("ws", "/open")(200, "- ws open");
});

httpServer.listen(3000, () => console.log("Listening on port 3000!"));
