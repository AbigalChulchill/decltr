import needle from "needle";

import { Fetcher_DEV, Indicator_DEV } from "../types";

import { assetPair, MACD, RSI } from "../../../lib/src/indicators";
import { KrakenOHLC, Ticker, TOHLCVVC } from "../../../lib/src/types";

export const fetch_DEV: Fetcher_DEV = async (event, opts) => {
  const [tickers, assetPairs, ohlcs] = await Promise.all([
    ticker_DEV(event, []),
    opts.needsAssetPair ? assetPair(event, []) : undefined,
    opts.needsOHLC ? OHLC_DEV(event, []) : undefined,
  ]);

  if (ohlcs && tickers.length > ohlcs.length) {
    tickers.length = ohlcs.length;
  } else if (ohlcs && ohlcs.length > tickers.length) {
    ohlcs.length = tickers.length;
  }

  if (opts.needsOHLC) {
    return tickers.map((ticker) => {
      // ts ignore is ok here, if opts.needsOHLC is true, ohlcs is guaranteed to be of type ohlc due to it being the condition from above.
      // @ts-ignore
      const MACDRes = MACD(event, ohlcs);
      // @ts-ignore
      const RSIRes = RSI(event, ohlcs);

      return {
        ticker,
        assetPair: assetPairs,
        OHLC: ohlcs,
        MACD: MACDRes,
        RSI: RSIRes,
      };
    });
  }

  return tickers.map((ticker) => ({
    ticker,
    assetPair: assetPairs,
  }));
};

export const ticker_DEV: Indicator_DEV<Array<Ticker>> = async ({
  pair,
  startTime,
}) => {
  const url = `https://us-east-1.aws.data.mongodb-api.com/app/decltr-yidsu/endpoint/get_tickers?pair=${pair}&since=${startTime}`;

  const data = await needle("get", url)
    .then((res) => {
      if (res.body.err) {
        throw new Error(res.body.err);
      }
      return res;
    })
    .then((res) => res.body as Array<any>);

  const tickers = data.map((rawTicker) => rawTicker[pair] as Ticker);

  if (tickers.length === 0) {
    throw new Error(
      `there were no tickers inside response. this could be due to a typo in the pair ${pair}, or there are no tickers since ${startTime}, or it is not being scrapped by the decltr mongodb server`
    );
  }

  return tickers;
};

export const OHLC_DEV: Indicator_DEV<Array<TOHLCVVC>> = async ({
  pair,
  startTime,
}) => {
  const url = `https://api.kraken.com/0/public/OHLC?pair=${pair}&since=${Math.floor(
    startTime / 1000
  )}`;

  const data = await needle("get", url).then((res) => res.body as KrakenOHLC);

  if (data.error.length > 0) {
    throw new Error(data.error.join(", "));
  }

  return data.result[pair];
};
