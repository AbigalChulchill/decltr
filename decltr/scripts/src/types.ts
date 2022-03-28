import { Node } from "acorn";
import { MACDOutput } from "technicalindicators/declarations/moving_averages/MACD";

import {
  AssetPair,
  DecltrEvent,
  Order,
  Ticker,
  TOHLCVVC,
} from "../../lib/src/types";

export interface AcornNode extends Node {
  body?: Array<AcornNode>;
  specifiers?: Array<AcornNode>;
  exported?: AcornNode;
  name?: string;
  local?: AcornNode;
  id?: AcornNode;
  declarations?: Array<AcornNode>;
  init?: AcornNode;
  params?: Array<AcornNode>;
  properties?: Array<AcornNode>;
  key?: AcornNode;
}

export interface HashMap {
  [key: string]: any;
}

export interface DecltrDevEvent extends DecltrEvent {
  /**
   * The start time of the graph in dev tools
   */
  startTime: number;
  /**
   * The end time of the graph in dev tools
   */
  endTime: number;
}

export interface Indicators_DEV {
  assetPair?: AssetPair;
  ticker: Ticker;
  RSI?: Array<number>;
  OHLC?: Array<TOHLCVVC>;
  MACD?: Array<MACDOutput>;
}

export type Fetcher_DEV = (
  event: DecltrDevEvent,
  opts: Fetcher_DEV_opts
) => Promise<Array<Indicators_DEV>>;

export type Indicator_DEV<T> = (
  event: DecltrDevEvent,
  OHLC: Array<TOHLCVVC>
) => Promise<T>;

export interface Fetcher_DEV_opts {
  needsOHLC: boolean;
  needsAssetPair: boolean;
}
export interface DecltrDevResult {
  price: string;
  App: Order | null;
}
