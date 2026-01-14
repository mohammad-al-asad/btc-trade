import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    // 1️⃣ AUTH
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication Error" },
        { status: 401 }
      );
    }

    // 2️⃣ FIND TRADE
    const tradeId = (await context.params).id;
    const trade = await prisma.futureTrade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    if (trade.status !== "RUNNING") {
      return NextResponse.json(
        { error: "Trade already closed or canceled" },
        { status: 400 }
      );
    }

    // 3️⃣ GET CURRENT BTC PRICE
    const { searchParams } = new URL(req.url);
    const currentBTCPrice = Number(searchParams.get("btcPrice"));

    if (!currentBTCPrice || currentBTCPrice <= 0) {
      return NextResponse.json({ error: "Invalid BTC price" }, { status: 400 });
    }

    // 4️⃣ CALCULATIONS (USDT-based)
    const entryPrice = Number(trade.entryUSDT);
    const margin = Number(trade.margin);
    const leverage = Number(trade.leverage);

    const priceMovementPercent =
      ((currentBTCPrice - entryPrice) / entryPrice) * 100;

    const pnl = (Math.abs(priceMovementPercent) * leverage * margin) / 100;

    let finalBalanceChange = 0;

    const tradeUpdateData: Prisma.FutureTradeUpdateInput = {
      status: "ENDED",
    };

    // 5️⃣ LONG / SHORT LOGIC
    if (trade.trade === "LONG") {
      if (priceMovementPercent > 0) {
        // PROFIT
        finalBalanceChange = pnl;
        tradeUpdateData.profit = pnl;
      } else {
        // LOSS
        finalBalanceChange = Math.max(pnl, 0);
        tradeUpdateData.loss = pnl;
      }
    }

    if (trade.trade === "SHORT") {
      if (priceMovementPercent < 0) {
        // PROFIT
        finalBalanceChange = pnl;
        tradeUpdateData.profit = pnl;
      } else {
        // LOSS
        finalBalanceChange = Math.max(pnl, 0);
        tradeUpdateData.loss = pnl;
      }
    }

    // 6️⃣ FIND USDT ASSET
    const usdtAsset = await prisma.asset.findFirst({
      where: {
        userId: user.id,
        assetName: "USDT",
      },
    });

    if (!usdtAsset) {
      return NextResponse.json(
        { error: "USDT wallet not found" },
        { status: 404 }
      );
    }

    // 7️⃣ UPDATE USDT BALANCE
    await prisma.asset.update({
      where: { id: usdtAsset.id },
      data: {
        amount: {
          increment: finalBalanceChange,
        },
      },
    });
    console.log(tradeUpdateData);
    console.log("finalBalanceChange: ",finalBalanceChange);

    // 8️⃣ UPDATE TRADE
    await prisma.futureTrade.update({
      where: { id: trade.id },
      data: tradeUpdateData,
    });

    return NextResponse.json(
      { message: "Trade closed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
