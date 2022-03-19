import crypto from "crypto";

import axios from "axios";
import { stringify } from "qs";

import { KrakenOrderResponse, Order } from "./types";

export const placeOrder = async (
  order: Order,
  KRAKEN_API_KEY: string,
  KRAKEN_PRIVATE_KEY: string
) => {
  const path = "/0/private/AddOrder";
  const url = "https://api.kraken.com/0/private/AddOrder";
  const nonce = new Date().getTime() / 1000;

  const payload = { nonce, ...order };
  const message = stringify(payload);
  const secret_buffer = Buffer.from(KRAKEN_API_KEY, "base64");
  const hash = crypto.createHash("sha256");
  const hmac = crypto.createHmac("sha512", secret_buffer);
  const hash_digest = hash.update(nonce + message).digest("binary");
  const apiSign = hmac.update(path + hash_digest, "binary").digest("base64");

  const headers = {
    "API-Key": KRAKEN_PRIVATE_KEY,
    "API-Sign": apiSign,
    "User-Agent": "decltr",
  };

  const { data } = await axios.post<KrakenOrderResponse>(url, payload, {
    headers,
  });

  return data;
};

export * from "./types";
export * from "./handler/indicators";
