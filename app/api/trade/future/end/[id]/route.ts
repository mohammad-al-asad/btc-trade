import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";
import { getCurrentPrice, getCurrentUser } from "@/src/lib/utili";
import { NodeNextResponse } from "next/dist/server/base-http/node";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication Error" },
        { status: 401 }
      );

    const tradeId = (await context.params).id;
    const trade = await prisma.futureTrade.findUnique({
      where: { id: tradeId },
    });
    if (!trade)
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });

    if (trade.status !== "RUNNING") {
      return NextResponse.json(
        { error: "Trade has already Canceled or Ended" },
        { status: 404 }
      );
    }

    const currentBTCPrice = await getCurrentPrice();

    const assetUpdateData: Prisma.AssetUpdateInput = {};
    const tradeUpdateData: Prisma.FutureTradeUpdateInput = {};

    const priceMovement =
      ((+currentBTCPrice.toFixed(4) - +Number(trade.entryUSDT).toFixed(4)) /
        +Number(trade.entryUSDT).toFixed(4)) *
      100;
    const profitOrLoss =
      ((trade.leverage * Math.abs(priceMovement)) / 100) * +trade.margin;

    tradeUpdateData.status = "ENDED";

    if (trade.trade == "LONG") {
      if (priceMovement > 0) {
        assetUpdateData.amount = {
          increment: profitOrLoss + +trade.margin,
        };
        tradeUpdateData.profit = profitOrLoss;
      } else if (priceMovement < 0) {
        assetUpdateData.amount = {
          increment: Math.max(+trade.margin - profitOrLoss, 0),
        };
        tradeUpdateData.loss = profitOrLoss;
      }
    } else if (trade.trade == "SHORT") {
      if (priceMovement > 0) {
        assetUpdateData.amount = {
          increment: Math.max(+trade.margin - profitOrLoss, 0),
        };
        tradeUpdateData.loss = profitOrLoss;
      } else if (priceMovement < 0) {
        assetUpdateData.amount = {
          increment: +trade.margin + profitOrLoss,
        };
        tradeUpdateData.profit = profitOrLoss;
      }
    }

    const asset = await prisma.asset.findFirst({
      where: {
        userId: user.id,
        assetName: "BTC",
      },
    });

    await prisma.asset.update({
      where: { id: asset!.id },
      data: assetUpdateData,
    });
    await prisma.futureTrade.update({
      where: { id: trade.id },
      data: tradeUpdateData,
    });

    return NextResponse.json({ message: "Trade Ended" }, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Interval server Error" },
      { status: 500 }
    );
  }
};
