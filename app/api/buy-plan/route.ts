/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getCurrentPrice } from "@/src/lib/utili";
import { use } from "react";

export async function POST(request: NextRequest) {
  const { amount, planType } = await request.json();
  try {
    const session: any = await getServerSession(authOptions);

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      include: {
        assets: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usdtAsset = user.assets.find((asset) => asset.assetName === "USDT");

    if (!usdtAsset) {
      return NextResponse.json(
        { error: "User assets not found" },
        { status: 400 }
      );
    }

    if (usdtAsset.amount < amount) {
      return NextResponse.json({ error: "Not enough usdt" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.asset.update({
        where: { id: usdtAsset.id },
        data: {
          amount: {
            decrement: amount,
          },
        },
      }),
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: {
            create: {
              type: planType,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Plan purchased sucessfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
