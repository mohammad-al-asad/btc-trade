import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
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

    return NextResponse.json(
      {
        payload: {
          usdt: userAssets!.find((userAsset) => userAsset.assetName == "USDT"),
          btc: userAssets!.find((userAsset) => userAsset.assetName == "BTC"),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
