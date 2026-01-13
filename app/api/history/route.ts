/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication Error" },
        { status: 401 }
      );

    const trades: any = await prisma.futureTrade.findMany({
      where: { userId: user.id, status: "RUNNING" },
      orderBy: {
        createAt: "desc",
      },
    });

    const { searchParams } = new URL(req.url);
    const currentBTCPrice = Number( searchParams.get("btcPrice"));
    console.log(currentBTCPrice);

    const modifiedTrades = trades.map((trade: any) => {
      const priceMovement =
        ((+currentBTCPrice.toFixed(4) - +Number(trade.entryUSDT).toFixed(4)) /
          +Number(trade.entryUSDT).toFixed(4)) *
        100;
      trade.growth = priceMovement;

      const profitOrLoss =
        ((trade.leverage * Math.abs(priceMovement)) / 100) * trade.margin;
      console.log(
        "profitOrLoss",
        profitOrLoss,
        "currentBTCPrice",
        currentBTCPrice
      );

      if (trade.trade == "LONG") {
        if (priceMovement > 0) {
          trade.profit = profitOrLoss * currentBTCPrice;
        } else if (priceMovement < 0) {
          trade.loss = profitOrLoss * currentBTCPrice;
        }
      } else if (trade.trade == "SHORT") {
        if (priceMovement > 0) {
          trade.loss = profitOrLoss * currentBTCPrice;
        } else if (priceMovement < 0) {
          trade.profit = profitOrLoss * currentBTCPrice;
        }
      }
      trade.margin = trade.margin * trade.entryUSDT;
      return trade;
    });

    return NextResponse.json(
      { payload: { trades: modifiedTrades } },
      { status: 200 }
    );
  } catch (error) {
    console.log("history: ", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
