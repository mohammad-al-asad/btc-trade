import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        whiteList: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10, // Last 10 transactions for quick overview
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
