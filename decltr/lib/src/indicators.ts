import needle from "needle";
import { rsi, macd } from "technicalindicators";
import { MACDOutput } from "technicalindicators/declarations/moving_averages/MACD";

import {
  AssetPair,
  Indicator,
  KrakenAssetPair,
  KrakenOHLC,
  KrakenTicker,
  OHLCDependent,
  Ticker,
  TOHLCVVC,
} from "./types";

export const assetPair: Indicator<AssetPair> = async ({ pair }) => {
  const url = `https://api.kraken.com/0/public/AssetPairs?pair=${pair}`;

  const data = await needle("get", url).then(
    (res) => res.body as KrakenAssetPair
  );

  if (data.error.length > 0) {
    throw new Error(data.error.join(", "));
  }

  return data.result[pair];
};

export const ticker: Indicator<Ticker> = async ({ pair }) => {
  const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;

  const data = await needle("get", url).then((res) => res.body as KrakenTicker);

  if (data.error.length > 0) {
    throw new Error(data.error.join(", "));
  }

  return data.result[pair];
};

export const OHLC: Indicator<TOHLCVVC[]> = async ({ pair }) => {
  const url = `https://api.kraken.com/0/public/OHLC?pair=${pair}`;

  const data = await needle("get", url).then((res) => res.body as KrakenOHLC);

  if (data.error.length > 0) {
    throw new Error(data.error.join(", "));
  }

  return data.result[pair];
};

export const RSI: Indicator<Array<number>> = async (_, OHLC) => {
  return rsi({
    values: OHLC.map((ohlc) => parseFloat(ohlc[4])),
    period: 14,
  });
};

export const RSI_OHLC: OHLCDependent = true;

export const MACD: Indicator<Array<MACDOutput>> = async (_, OHLC) => {
  return macd({
    values: OHLC.map((TOHLCVVC) => parseFloat(TOHLCVVC[4])),
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 3,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
};

export const MACD_OHLC: OHLCDependent = true;
