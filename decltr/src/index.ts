import crypto from "crypto";

import needle from "needle";
import { stringify } from "qs";

import { KrakenOrderResponse, Order } from "./types";

export const placeOrder = async (
  order: Order,
  KRAKEN_API_KEY: string,
  KRAKEN_PRIVATE_KEY: string
) => {
  const path = "/0/private/AddOrder";
  const url = "https://api.kraken.com/0/private/AddOrder";
  const nonce = new Date().getTime();

  const payload = { nonce, ...order };
  const message = stringify(payload);
  const secret_buffer = Buffer.from(KRAKEN_PRIVATE_KEY, "base64");
  const hash = crypto.createHash("sha256");
  const hmac = crypto.createHmac("sha512", secret_buffer);
  const hash_digest = hash.update(nonce + message).digest("binary");
  const apiSign = hmac.update(path + hash_digest, "binary").digest("base64");

  const headers = {
    "API-Key": KRAKEN_API_KEY,
    "API-Sign": apiSign,
    "User-Agent": "decltr",
  };

  return await needle("post", url, message, { headers }).then(
    (res) => res.body as KrakenOrderResponse
  );
};

export const useAWSSecret = async (
  AWS_SECRET_NAME: string,
  AWS_SECRET_REGION: string
): Promise<any> =>
  new Promise((res, rej) => {
    const AWS = require("aws-sdk");
    const client = new AWS.SecretsManager({
      region: AWS_SECRET_REGION,
    });

    client.getSecretValue(
      { SecretId: AWS_SECRET_NAME },
      (err: any, data: any) => {
        if (err) {
          rej(err);
          return;
        }
        if ("SecretString" in data) {
          res(JSON.parse(data.SecretString));
          return;
        }
        res(
          JSON.parse(Buffer.from(data.SecretBinary, "base64").toString("ascii"))
        );
      }
    );
  });

export * from "./types";
export * from "./handler/indicators";
