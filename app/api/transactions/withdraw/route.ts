import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, walletAddress } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        assets: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.assets[1].amount < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    if (amount < 100) {
      // Minimum withdrawal
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $100" },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: "WITHDRAWAL",
        amount: amount,
        status: "PENDING", // Withdrawals need manual approval in real app
        description: `Withdrawal to ${walletAddress}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "Withdrawal request submitted",
      transaction,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
