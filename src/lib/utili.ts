import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import Binance from "node-binance-api";
import { prisma } from "./prisma";
import { getModifiedBtc } from "./clientUtility";
import { getBtcModifyData } from "./queries";
export const getCurrentUser = async () => {
  const session: any = await getServerSession(authOptions);
  return session?.user || null;
};

export const getCurrentPrice = async () => {
  const binance = new Binance();
  const ticker = await binance.prices("BTCUSDT");

  const adjustment = await getBtcModifyData();
  return Number(getModifiedBtc(adjustment, ticker.BTCUSDT.toString()));
};

export const futureTradeAutoCancel = async () => {
  try {
    const trades = await prisma.futureTrade.findMany({
      where: {
        status: "RUNNING",
      },
    });

    const currenntBTCPrice = await getCurrentPrice();

    trades.map(async (trade) => {
      const priceMovement =
        ((+currenntBTCPrice.toFixed(4) - +Number(trade.entryUSDT).toFixed(4)) /
          +Number(trade.entryUSDT).toFixed(4)) *
        100;

      const diffrentOfMargin =
        ((trade.leverage * Math.abs(priceMovement)) / 100) * +trade.margin;
      if (priceMovement != 0) {
        if (trade.trade == "LONG") {
          if (priceMovement < 0) {
            if (diffrentOfMargin >= +trade.margin.toFixed(10)) {
              await prisma.futureTrade.update({
                where: { id: trade.id },
                data: {
                  loss: trade.margin,
                  status: "CANCELLED",
                },
              });
            }
          }
        } else if (trade.trade == "SHORT") {
          if (priceMovement > 0) {
            if (diffrentOfMargin >= +trade.margin.toFixed(10)) {
              await prisma.futureTrade.update({
                where: {
                  id: trade.id,
                },
                data: {
                  loss: trade.margin,
                  status: "CANCELLED",
                },
              });
            }
          }
        }
      }
    });
  } catch (error) {}
};
