import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/utili";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication Failed" },
        { status: 401 }
      );
    const trades = await prisma.futureTrade.findMany({
      where: { userId: user.id, status: { not: "RUNNING" } },
      orderBy: {
        createAt: "desc",
      },
    });

    return NextResponse.json({ payload: { trades } });
  } catch (error) {}
};
