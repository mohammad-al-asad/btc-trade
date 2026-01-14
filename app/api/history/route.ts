/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication Error" },
        { status: 401 }
      );
    }

    const trades = await prisma.futureTrade.findMany({
      where: {
        userId: user.id,
        status: "RUNNING",
      },
      orderBy: {
        createAt: "desc",
      },
    });

    const { searchParams } = new URL(req.url);
    const currentBTCPrice = Number(searchParams.get("btcPrice"));

    if (!currentBTCPrice) {
      return NextResponse.json(
        { error: "BTC price missing" },
        { status: 400 }
      );
    }

    const modifiedTrades = trades.map((trade: any) => {
      const priceChangePercent =
        (currentBTCPrice - trade.entryUSDT) / trade.entryUSDT;

      const pnl =
        priceChangePercent * trade.leverage * trade.margin;

      trade.growth = priceChangePercent * 100; // %

      trade.profit = 0;
      trade.loss = 0;

      if (trade.trade === "LONG") {
        if (pnl > 0) trade.profit = pnl;
        else trade.loss = Math.abs(pnl);
      }

      if (trade.trade === "SHORT") {
        if (pnl < 0) trade.profit = Math.abs(pnl);
        else trade.loss = pnl;
      }

      // margin stays USDT — DO NOT TOUCH
      return trade;
    });

    return NextResponse.json(
      { payload: { trades: modifiedTrades } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Future PnL Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
