export const getActualBtcPrice = async () => {
  const res = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
  );
  const data = await res.json();
  return Number(data.price);
};
