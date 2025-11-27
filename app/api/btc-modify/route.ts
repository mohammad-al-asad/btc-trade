/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const modifyData = await prisma.priceAdjustment.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "Price Adjustment Fetch successful",
      modifyData,
    });
  } catch (error) {
    console.error("Price Adjustment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
