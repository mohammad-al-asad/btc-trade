/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getCurrentPrice } from "@/src/lib/utili";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const transactionId = (await context.params).id;

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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/btc-modify`
    );
    const { modifyData } = await res.json();

    const price = await getCurrentPrice();

    const btcModifyFloat = parseFloat(modifyData.adjustment);
    let currentBtcPrice: number;
    if (btcModifyFloat < 0) {
      currentBtcPrice = price - Math.abs(btcModifyFloat);
    } else {
      currentBtcPrice = btcModifyFloat + price;
    }

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
      if (transaction.currency == "USD") {
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
                increment: transaction.amount,
              },
            },
          }),
        ]);
        return NextResponse.json({
          message: "Deposit approved successfully",
          transactionId,
          conversion: {
            usdtAmount: transaction.amount,
          },
        });
      } else {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: "COMPLETED",
            },
          }),
          // Increase USDT balance
          prisma.asset.update({
            where: { id: btcAsset.id },
            data: {
              amount: {
                increment: transaction.amount,
              },
            },
          }),
        ]);        
        return NextResponse.json({
          message: "Deposit approved successfully",
          transactionId,
          conversion: {
            btcAmount: transaction.amount,
            btcPrice: currentBtcPrice,
          },
        });
      }
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

      // Check if user has enough BTC
      if (+usdtAsset.amount < transaction.amount) {
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
          where: { id: usdtAsset.id },
          data: {
            amount: {
              decrement: transaction.amount,
            },
          },
        }),
      ]);

      return NextResponse.json({
        message: "Withdrawal approved successfully",
        transactionId,
        usdtAmount: transaction.amount,
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
