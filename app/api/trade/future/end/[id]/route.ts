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

    // 4️⃣ BASIC VALUES (USDT-BASED)
    const entryPrice = Number(trade.entryUSDT);
    const margin = Number(trade.margin);
    const leverage = Number(trade.leverage);

    // 5️⃣ PRICE CHANGE (MARKET DIRECTION)
    const priceChange =
      (currentBTCPrice - entryPrice) / entryPrice;

    // 6️⃣ PNL (LONG BY DEFAULT)
    let pnl = priceChange * leverage * margin;

    // 7️⃣ INVERT FOR SHORT
    if (trade.trade === "SHORT") {
      pnl = -pnl;
    }

    // 8️⃣ PREPARE UPDATE DATA
    const tradeUpdateData: Prisma.FutureTradeUpdateInput = {
      status: "ENDED",
      profit: 0,
      loss: 0,
    };

    if (pnl > 0) {
      tradeUpdateData.profit = pnl;
    } else if (pnl < 0) {
      tradeUpdateData.loss = Math.abs(pnl);
    }

    // 9️⃣ FIND USDT ASSET
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

    // 🔟 UPDATE BALANCE (NEGATIVE pnl REDUCES BALANCE)
    await prisma.asset.update({
      where: { id: usdtAsset.id },
      data: {
        amount: {
          increment: pnl,
        },
      },
    });

    // 1️⃣1️⃣ UPDATE TRADE
    await prisma.futureTrade.update({
      where: { id: trade.id },
      data: tradeUpdateData,
    });

    return NextResponse.json(
      {
        message: "Trade closed successfully",
        pnl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CLOSE TRADE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
