from typing import TypedDict, Union, List, Dict, Any
from enum import Enum


class OrderType(Enum):
    market = "market"
    limit = "limit"
    stop_loss = "stop-loss"
    take_profit = "take-profit"
    stop_loss_limit = "stop-loss-limit"
    take_profit_limit = "take-profit-limit"
    settle_position = "settle-position"


class Type(Enum):
    buy = "buy"
    sell = "sell"


class Trigger(Enum):
    index = "index"
    last = "last"


class OFlags(Enum):
    post: "post"
    fcib: "fcib"
    fciq:  "fciq"
    nompp: "nompp"


class TimeInForce(Enum):
    GTC: "GTC"
    IOC: "IOC"
    GTD: "GTD"


class Close(TypedDict):
    '''
     * Conditional close order type.
     * Note: Conditional close orders are triggered by execution of the primary order in the same quantity and opposite direction, but once triggered are independent orders that may reduce or increase net position.
     '''
    ordertype: Union[None, OrderType]
    '''
     * Conditional close order price
     '''
    price: Union[str, None]
    '''
     * Conditional close order price2
     '''
    price2: Union[str, None]


class Order(TypedDict):
    '''
    userref is an optional user-specified integer id that can be associated with any number of orders. Many clients choose a userref corresponding to a unique integer id generated by their systems (e.g. a timestamp). However, because we don't enforce uniqueness on our side, it can also be used to easily group orders by pair, side, strategy, etc. This allows clients to more readily cancel or query information about orders in a particular group, with fewer API calls by using userref instead of our txid, where supported.
    '''
    userref: str
    '''
   * Order type
    '''
    ordertype: OrderType
    '''
   * Order direction (buy/sell)
   '''
    type: Type
    '''
   * Order quantity in terms of the base asset Note: Volume can be specified as 0 for closing margin orders to automatically fill the requisite quantity.
   '''
    volume: Union[str, None]
    '''
   * Asset pair id or altname
   '''
    pair: str
    '''
   * Limit price for limit orders
   * Trigger price for stop-loss, stop-loss-limit, take-profit and take-profit-limit orders
   '''
    price:  Union[str, None]
    '''
   * Limit price for stop-loss-limit and take-profit-limit orders
   '''
    price2:  Union[str, None]
    '''
   * Price signal used to trigger stop-loss, stop-loss-limit, take-profit and take-profit-limit orders.
   * Note: Either price or price2 can be preceded by +, -, or # to specify the order price as an offset relative to the last traded price. + adds the amount to, and - subtracts the amount from the last traded price. # will either add or subtract the amount to the last traded price, depending on the direction and order type used. Relative prices can be suffixed with a % to signify the relative amount as a percentage.
   '''
    trigger: Trigger
    '''
   * Amount of leverage desired (default = none)
   '''
    leverage:  Union[str, None]
    '''
   * post post-only order (available when ordertype = limit)
   * fcib prefer fee in base currency (default if selling)
   * fciq prefer fee in quote currency (default if buying, mutually exclusive with fcib)
   * nompp disable market price protection for market orders
   '''
    oflags: Union[OFlags, None]
    '''
   * Time-in-force of the order to specify how long it should remain in the order book before being cancelled. GTC (Good-'til-cancelled) is default if the parameter is omitted. IOC (immediate-or-cancel) will immediately execute the amount possible and cancel any remaining balance rather than resting in the book. GTD (good-'til-date), if specified, must coincide with a desired expiretm.
   '''
    timeinforce: Union[TimeInForce, None]
    '''
   * Scheduled start time. Can be specified as an absolute timestamp or as a number of seconds in the future.
   * 0 now (default)
   * +\<n\> schedule start time seconds from now
   * \<n\> = unix timestamp of start time
   '''
    starttm: Union[str, None]
    '''
   * Expiration time
   * 0 no expiration (default)
   * +\<n\> = expire seconds n from now, minimum 5 seconds
   * \<n\> = unix timestamp åof expiration time
   '''
    expiretm: Union[str, None]
    '''
   * Conditional close part of an order.
   '''
    close: Union[Close, None]
    '''
  * RFC3339 timestamp (e.g. 2021-04-01T00:18:45Z) after which the matching engine should reject the new order request, in presence of latency or order queueing. min now() + 2 seconds, max now() + 60 seconds.
  '''
    deadline: Union[str, None]
    '''
  * Validate inputs only. Do not submit order.
  '''
    validate: Union[bool, None]


class KrakenOrderResultDecr(TypedDict):
    order: str
    close: str


class KrakenOrderResult(TypedDict):
    decr: KrakenOrderResultDecr
    txid: List[str]


class KrakenOrderResponse(TypedDict):
    error: List[str]
    result: KrakenOrderResult


class Ticker(TypedDict):
    '''
    * Ask [price, whole lot volume, lot volume]
    '''
    a: List[str]
    '''
    * Bid [price, whole lot volume, lot volume]
    '''
    b: List[str]
    '''
    * Last trade closed [price, lot volume]
    '''
    c: List[str]
    '''
    * Volume [today, last 24 hours]
    '''
    v: List[str]
    '''
    * Volume weighted average price [today, last 24 hours]
    '''
    p: List[str]
    '''
    * Number of trades [today, last 24 hours]
    '''
    t: List[int]
    '''
    * Low [today, last 24 hours]
    '''
    l: List[str]
    '''
    * High [today, last 24 hours]
    '''
    h: List[str]
    '''
    * Today's opening price
    '''
    o: str


TOHLCVVC = List[Union[str, int]]


class KrakenTicker(TypedDict):
    error: List[str]
    result:  Dict[str, Ticker]


class KrakenOHLC(TypedDict):
    error: List[str]
    result: Dict[str, List[TOHLCVVC]]


class AssetPair(TypedDict):
    '''
     * Alternate pair name
     '''
    altname: str
    '''
   * WebSocket pair name (if available)
   '''
    wsname: str
    '''
   * Asset class of base component
   '''
    aclass_base: str
    '''
   * Asset ID of base component
   '''
    base: str
    '''
   * Asset class of quote component
   '''
    aclass_quote: str
    '''
   * Asset ID of quote component
   '''
    quote: str
    '''
   * @deprecated Volume lot size
   '''
    lot: str
    '''
   * Scaling decimal places for pair
   '''
    pair_decimals: int
    '''
   * Scaling decimal places for volume
   '''
    lot_decimals: int
    '''
   * Amount to multiply lot volume by to get currency volume
   '''
    lot_multiplier: int
    '''
   * Array of leverage amounts available when buying
   '''
    leverage_buy: List[int]
    '''
   * Array of leverage amounts available when selling
   '''
    leverage_sell: List[int]
    '''
   * Fee schedule array in [<volume>, <percent fee>] tuples
   '''
    fees: List[List[int]]
    '''
   * Maker fee schedule array in [<volume>, <percent fee>] tuples (if on maker/taker)
   '''
    fees_maker: List[List[int]]
    '''
   * Volume discount currency
   '''
    fee_volume_currency: str
    '''
   * Margin call level
   '''
    margin_call: int
    '''
   * Stop-out/liquidation margin level
   '''
    margin_stop: int
    '''
   * Minimum order size (in terms of base currency)
   '''
    ordermin: str


class Indicators(TypedDict):
    assetPair: AssetPair
    ticker: Ticker
    RSI: List[int]
    OHLC: List[TOHLCVVC]
    MACD: List[Any]


OrderOrNone = Union[Order, None]
