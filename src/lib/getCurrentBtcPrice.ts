import { getModifiedBtc } from "./clientUtility";
import { getBtcModifyData } from "./queries";

export const getCurrentBtcPrice = async () => {
  const res = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
  );
  const data = await res.json();

  const adjustment = await getBtcModifyData();
    console.log(
    "adjustment",
    adjustment,
    "price",
    data,
    "modify",
    getModifiedBtc(adjustment, data.price)
  );
  return Number(getModifiedBtc(adjustment, data.price));
};