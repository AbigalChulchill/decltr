from decltr_py.types import Indicators, OrderOrNone


def App(indicators: Indicators) -> OrderOrNone:
    ticker = indicators['ticker']

    ask = float(ticker['a'][0])
    vwap = float(ticker['p'][1])

    if (vwap >= ask):
        return None

    return {
        'pair': 'ADAUSD',
        'volume': 20,
        'price': ticker.a[0],
        'type': 'buy',
        'ordertype': 'limit',
        'close': {
            'ordertype': 'limit',
            'price': str(ask * 1.1)
        },
        'expiretm': '+5',
        'oflags': 'post'
    }
