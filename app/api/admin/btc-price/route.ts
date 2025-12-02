/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getModifiedBtc } from "@/src/lib/clientUtility";
import { getCurrentPrice } from "@/src/lib/utili";

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

    if (adjustment != 0 && (!adjustment || typeof adjustment !== "number")) {
      return NextResponse.json(
        { error: "Valid adjustment amount is required" },
        { status: 400 }
      );
    }

    // Get current BTC price from Binance
    const price = await getCurrentPrice();
    const newPrice = getModifiedBtc(adjustment.toString(), price.toString());

    // Record the price adjustment
    await prisma.priceAdjustment.create({
      data: {
        adjustment: adjustment,
      },
    });

    return NextResponse.json({
      message: "BTC price adjusted successfully",
      previousPrice: price,
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
    const currentPrice = await getCurrentPrice();

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
