import { MACDOutput } from "technicalindicators/declarations/moving_averages/MACD";

// start types for decltr platform
export interface DecltrEvent {
  pair: string;
  volume: string;
  profit: string;
}

export type FC = (indicators: Indicators, event: DecltrEvent) => Order | null;
// end types from decltr platform

// start types for kraken
export interface Order {
  /**
   * userref is an optional user-specified integer id that can be associated with any number of orders. Many clients choose a userref corresponding to a unique integer id generated by their systems (e.g. a timestamp). However, because we don't enforce uniqueness on our side, it can also be used to easily group orders by pair, side, strategy, etc. This allows clients to more readily cancel or query information about orders in a particular group, with fewer API calls by using userref instead of our txid, where supported.
   */
  userref?: string;
  /**
   * Order type
   */
  ordertype:
    | "market"
    | "limit"
    | "stop-loss"
    | "take-profit"
    | "stop-loss-limit"
    | "take-profit-limit"
    | "settle-position";
  /**
   * Order direction (buy/sell)
   */
  type: "buy" | "sell";
  /**
   * Order quantity in terms of the base asset Note: Volume can be specified as 0 for closing margin orders to automatically fill the requisite quantity.
   */
  volume?: string;
  /**
   * Asset pair id or altname
   */
  pair: string;
  /**
   * Limit price for limit orders
   * Trigger price for stop-loss, stop-loss-limit, take-profit and take-profit-limit orders
   */
  price?: string;
  /**
   * Limit price for stop-loss-limit and take-profit-limit orders
   */
  price2?: string;
  /**
   * Price signal used to trigger stop-loss, stop-loss-limit, take-profit and take-profit-limit orders.
   * Note: Either price or price2 can be preceded by +, -, or # to specify the order price as an offset relative to the last traded price. + adds the amount to, and - subtracts the amount from the last traded price. # will either add or subtract the amount to the last traded price, depending on the direction and order type used. Relative prices can be suffixed with a % to signify the relative amount as a percentage.
   */
  trigger?: "index" | "last";
  /**
   * Amount of leverage desired (default = none)
   */
  leverage?: string;
  /**
   * post post-only order (available when ordertype = limit)
   * fcib prefer fee in base currency (default if selling)
   * fciq prefer fee in quote currency (default if buying, mutually exclusive with fcib)
   * nompp disable market price protection for market orders
   */
  oflags?: "post" | "fcib" | "fciq" | "nompp";
  /**
   * Time-in-force of the order to specify how long it should remain in the order book before being cancelled. GTC (Good-'til-cancelled) is default if the parameter is omitted. IOC (immediate-or-cancel) will immediately execute the amount possible and cancel any remaining balance rather than resting in the book. GTD (good-'til-date), if specified, must coincide with a desired expiretm.
   */
  timeinforce?: "GTC" | "IOC" | "GTD";
  /**
   * Scheduled start time. Can be specified as an absolute timestamp or as a number of seconds in the future.
   * 0 now (default)
   * +\<n\> schedule start time seconds from now
   * \<n\> = unix timestamp of start time
   */
  starttm?: string;
  /**
   * Expiration time
   * 0 no expiration (default)
   * +\<n\> = expire seconds n from now, minimum 5 seconds
   * \<n\> = unix timestamp åof expiration time
   */
  expiretm?: string;
  /**
   * Conditional close part of an order.
   */
  close?: {
    /**
     * Conditional close order type.
     * Note: Conditional close orders are triggered by execution of the primary order in the same quantity and opposite direction, but once triggered are independent orders that may reduce or increase net position.
     */
    ordertype?:
      | "limit"
      | "stop-loss"
      | "take-profit"
      | "stop-loss-limit"
      | "take-profit-limit";
    /**
     * Conditional close order price
     */
    price?: string;
    /**
     * Conditional close order price2
     */
    price2?: string;
  };
  /**
   * RFC3339 timestamp (e.g. 2021-04-01T00:18:45Z) after which the matching engine should reject the new order request, in presence of latency or order queueing. min now() + 2 seconds, max now() + 60 seconds.
   */
  deadline?: string;
  /**
   * Validate inputs only. Do not submit order.
   */
  validate?: boolean;
}

export interface KrakenOrderResponse {
  error: Array<string>;
  result: {
    descr: {
      order: string;
      close: string;
    };
    txid: Array<string>;
  };
}

export interface Ticker {
  /**
   * Ask [price, whole lot volume, lot volume]
   */
  a: Array<string>;
  /**
   * Bid [price, whole lot volume, lot volume]
   */
  b: Array<string>;
  /**
   * Last trade closed [price, lot volume]
   */
  c: Array<string>;
  /**
   * Volume [today, last 24 hours]
   */
  v: Array<string>;
  /**
   * Volume weighted average price [today, last 24 hours]
   */
  p: Array<string>;
  /**
   * Number of trades [today, last 24 hours]
   */
  t: Array<number>;
  /**
   * Low [today, last 24 hours]
   */
  l: Array<string>;
  /**
   * High [today, last 24 hours]
   */
  h: Array<string>;
  /**
   * Today's opening price
   */
  o: string;
}

export type TOHLCVVC = [
  /**
   * time
   */
  number,
  /**
   * open
   */
  string,
  /**
   * high
   */ string,
  /**
   * low
   */
  string,
  /**
   * close
   */
  string,
  /**
   * vwap
   */
  string,
  /**
   * volume
   */
  string,
  /**
   * count
   */
  number
];

export interface KrakenTicker {
  error: Array<string>;
  result: {
    [key: string]: Ticker;
  };
}

export interface KrakenOHLC {
  error: Array<string>;
  result: {
    [key: string]: Array<TOHLCVVC>;
  };
}

export interface AssetPair {
  /**
   * Alternate pair name
   */
  altname: string;
  /**
   * WebSocket pair name (if available)
   */
  wsname: string;
  /**
   * Asset class of base component
   */
  aclass_base: string;
  /**
   * Asset ID of base component
   */
  base: string;
  /**
   * Asset class of quote component
   */
  aclass_quote: string;
  /**
   * Asset ID of quote component
   */
  quote: string;
  /**
   * @deprecated Volume lot size
   */
  lot: string;
  /**
   * Scaling decimal places for pair
   */
  pair_decimals: number;
  /**
   * Scaling decimal places for volume
   */
  lot_decimals: number;
  /**
   * Amount to multiply lot volume by to get currency volume
   */
  lot_multiplier: number;
  /**
   * Array of leverage amounts available when buying
   */
  leverage_buy: Array<number>;
  /**
   * Array of leverage amounts available when selling
   */
  leverage_sell: Array<number>;
  /**
   * Fee schedule array in [<volume>, <percent fee>] tuples
   */
  fees: Array<Array<number>>;
  /**
   * Maker fee schedule array in [<volume>, <percent fee>] tuples (if on maker/taker)
   */
  fees_maker: Array<Array<number>>;
  /**
   * Volume discount currency
   */
  fee_volume_currency: string;
  /**
   * Margin call level
   */
  margin_call: number;
  /**
   * Stop-out/liquidation margin level
   */
  margin_stop: number;
  /**
   * Minimum order size (in terms of base currency)
   */
  ordermin: string;
}

export interface KrakenAssetPair {
  error: Array<string>;
  result: {
    [key: string]: AssetPair;
  };
}
// end types for kraken

// start types for indicators
export type Indicator<T> = (
  event: DecltrEvent,
  OHLC: Array<TOHLCVVC>
) => Promise<T>;

export interface Indicators {
  assetPair: AssetPair;
  ticker: Ticker;
  RSI: Array<number>;
  OHLC: Array<TOHLCVVC>;
  MACD: Array<MACDOutput>;
}

export type OHLCDependent = boolean | undefined;
// end types for indicators
