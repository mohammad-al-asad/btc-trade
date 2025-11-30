import { prisma } from "@/src/lib/prisma";
import { futureTradeAutoCancel, getCurrentPrice } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const UPDATE = async (req: NextRequest) => {
  try {
    await futureTradeAutoCancel();
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Interval server Error" },
      { status: 500 }
    );
  }
};
