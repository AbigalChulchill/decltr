import { FC } from "../decltr/lib/src/types";

const App: FC = ({ assetPair, ticker }, { pair, volume, profit }) => {
  const ask = parseFloat(ticker.a[0]);
  const prf = parseFloat(profit);
  const vl = parseFloat(volume);
  const sellingPrice = (prf + ask * vl * 1.0026) / (vl * 0.9974);

  // asdasdf

  return {
    pair,
    volume: vl.toFixed(assetPair.pair_decimals),
    price: ticker.a[0],
    type: "buy",
    ordertype: "limit",
    close: {
      ordertype: "limit",
      price: sellingPrice.toFixed(assetPair.pair_decimals),
    },
    expiretm: "+5",
    oflags: "post",
  };
};

export default App;
