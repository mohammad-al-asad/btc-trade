import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { trade, margin, leverage, btcCurrentPrice } = await req.json();

    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication Failed" },
        { status: 401 }
      );

    const asset = await prisma.asset.findFirst({
      where: {
        userId: user.id,
        assetName: "USDT",
      },
    });

    if (asset!.amount?.toFixed(2) < margin) {
      return NextResponse.json({ error: "Balance Mismatch" }, { status: 400 });
    }

    await prisma.futureTrade.create({
      data: {
        trade,
        margin,
        leverage,
        entryUSDT: btcCurrentPrice,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return Response.json({ message: "Order Created" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Trade Failed" }, { status: 500 });
  }
};
