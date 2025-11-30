/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { role: true, id: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adjustment } = await request.json();
    if (adjustment != 0) {
      if (!adjustment || typeof adjustment !== "number") {
        return NextResponse.json(
          { error: "Valid adjustment amount is required" },
          { status: 400 }
        );
      }
    }

    // Get current BTC price from Binance
    const btcResponse = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );
    const btcData = await btcResponse.json();
    const currentPrice = parseFloat(btcData.price);

    const adjustmentFloat = parseFloat(adjustment.toString());
    let newPrice: number;

    if (adjustmentFloat < 0) {
      newPrice = currentPrice - Math.abs(adjustmentFloat);
    } else {
      newPrice = adjustmentFloat + currentPrice;
    }

    // Record the price adjustment
    await prisma.priceAdjustment.create({
      data: {
        adjustment: adjustment,
      },
    });

    return NextResponse.json({
      message: "BTC price adjusted successfully",
      previousPrice: currentPrice,
      newPrice: newPrice,
      adjustment: adjustment,
    });
  } catch (error) {
    console.error("BTC price adjustment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const adjustments = await prisma.priceAdjustment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        adjustment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get current BTC price
    const btcResponse = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );
    const btcData = await btcResponse.json();
    const currentPrice = parseFloat(btcData.price);

    return NextResponse.json({
      currentPrice,
      adjustments,
    });
  } catch (error) {
    console.error("BTC price fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
