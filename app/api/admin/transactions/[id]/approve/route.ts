/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: transactionId } = await params;

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

    // Get current BTC price from Binance
    const btcResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    const btcData = await btcResponse.json();
    const currentBtcPrice = parseFloat(btcData.price);

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          include: {
            assets: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: "Transaction already processed" },
        { status: 400 }
      );
    }

    // Update transaction based on type
    if (transaction.type === "DEPOSIT") {
      // For deposit: user sends BTC, we credit USDT (amount * btcPrice)
      const btcAsset = transaction.user.assets.find(
        (asset) => asset.assetName === "BTC"
      );
      const usdtAsset = transaction.user.assets.find(
        (asset) => asset.assetName === "USDT"
      );

      if (!btcAsset || !usdtAsset) {
        return NextResponse.json(
          { error: "User assets not found" },
          { status: 400 }
        );
      }

      // Calculate USDT equivalent
      const usdtAmount = transaction.amount * currentBtcPrice;

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: "COMPLETED",
          },
        }),
        // Increase USDT balance
        prisma.asset.update({
          where: { id: usdtAsset.id },
          data: {
            amount: {
              increment: usdtAmount,
            },
          },
        }),
      ]);

      return NextResponse.json({
        message: "Deposit approved successfully",
        transactionId,
        conversion: {
          btcAmount: transaction.amount,
          usdtAmount,
          btcPrice: currentBtcPrice,
        },
      });

    } else if (transaction.type === "WITHDRAWAL") {
      // For withdrawal: user requests USDT, we debit BTC (amount / btcPrice)
      const btcAsset = transaction.user.assets.find(
        (asset) => asset.assetName === "BTC"
      );
      const usdtAsset = transaction.user.assets.find(
        (asset) => asset.assetName === "USDT"
      );

      if (!btcAsset || !usdtAsset) {
        return NextResponse.json(
          { error: "User assets not found" },
          { status: 400 }
        );
      }

      // Calculate BTC equivalent
      const btcAmount = transaction.amount / currentBtcPrice;

      // Check if user has enough BTC
      if (+btcAsset.amount < btcAmount) {
        return NextResponse.json(
          { error: "Insufficient BTC balance for withdrawal" },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: "COMPLETED",
          },
        }),
        // Decrease BTC balance
        prisma.asset.update({
          where: { id: btcAsset.id },
          data: {
            amount: {
              decrement: btcAmount,
            },
          },
        }),
      ]);

      return NextResponse.json({
        message: "Withdrawal approved successfully",
        transactionId,
        conversion: {
          usdtAmount: transaction.amount,
          btcAmount,
          btcPrice: currentBtcPrice,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid transaction type" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Approve transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}