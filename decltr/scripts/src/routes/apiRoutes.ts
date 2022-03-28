import needle from "needle";
import express from "express";

const apiRoutes = express.Router();

apiRoutes.get("/AssetPairs", async (_, res) => {
  try {
    const url = "https://api.kraken.com/0/public/AssetPairs";

    const resp = await needle("get", url).then((res) => res.body);

    if (resp.error.length > 0) {
      throw new Error(JSON.stringify(resp.error.join(", ")));
    }

    res.status(200).json(Object.keys(resp.result));
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

export default apiRoutes;
