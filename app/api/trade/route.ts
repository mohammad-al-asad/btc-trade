import { AssetName } from "@/app/generated/prisma/enums";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { Decimal } from "@prisma/client/runtime/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Authentication Failed" },
        { status: 401 }
      );
    }

    const userAssets = await prisma.asset.findMany({
      where: {
        userId: user.id,
      },
    });

    const { amount, token, tradeAction, price } = await req.json();

    if (tradeAction == "SELL") {
      const btcAsset = userAssets.find(
        (asset) => asset.assetName == AssetName.BTC
      );
      console.log(amount / price, btcAsset!.amount);

      if (Decimal(amount / price) > btcAsset!.amount) {
        return NextResponse.json({ error: "BTC Mismatch" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.asset.update({
          where: {
            id: btcAsset!.id,
          },
          data: {
            amount: {
              decrement: amount / price,
            },
          },
        }),
        prisma.asset.update({
          where: {
            id: userAssets.find((asset) => asset.assetName == AssetName.USDT)!
              .id,
          },
          data: {
            amount: {
              increment: amount,
            },
          },
        }),
      ]);
    }

    if (tradeAction == "BUY") {
      const usdtAsset = userAssets.find(
        (asset) => asset.assetName == AssetName.USDT
      );

      if (Number(amount) > Number(usdtAsset!.amount.toFixed(2))) {
        return NextResponse.json({ error: "Not enogh token" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.asset.update({
          where: {
            id: usdtAsset!.id,
          },
          data: {
            amount: {
              decrement: amount,
            },
          },
        }),
        prisma.asset.update({
          where: {
            id: userAssets.find((asset) => asset.assetName == AssetName.BTC)!
              .id,
          },
          data: {
            amount: {
              increment: amount / price,
            },
          },
        }),
      ]);
    }

    return NextResponse.json({ payload: { price } }, { status: 200 });
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
