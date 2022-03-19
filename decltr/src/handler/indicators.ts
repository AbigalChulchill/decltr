import axios from "axios";
import { rsi } from "technicalindicators";

import { TOHLCVVC } from "../types";

import {
  AssetPair,
  OHLCDependent,
  Indicator,
  KrakenAssetPair,
  KrakenOHLC,
  KrakenTicker,
  Ticker,
} from "../types";

export const OHLC: Indicator<TOHLCVVC[]> = async ({ pair }) => {
  const url = "https://api.kraken.com/0/public/OHLC";
  const params = { pair };

  const { data } = await axios.get<KrakenOHLC>(url, { params });
  return data.result[pair];
};

export const ticker: Indicator<Ticker> = async ({ pair }) => {
  const url = "https://api.kraken.com/0/public/Ticker";
  const params = { pair };

  const { data } = await axios.get<KrakenTicker>(url, { params });
  return data.result[pair];
};

export const RSI: Indicator<Array<number>> = async (_, OHLC) => {
  return rsi({
    values: OHLC.map((ohlc) => parseFloat(ohlc[4])),
    period: 14,
  });
};
// Indicate If There Are Any Dependencies
export const RSI_OHLC: OHLCDependent = true;

export const assetPair: Indicator<AssetPair> = async ({ pair }) => {
  const url = "https://api.kraken.com/0/public/AssetPairs";
  const params = { pair };

  const { data } = await axios.get<KrakenAssetPair>(url, { params });
  return data.result[pair];
};
