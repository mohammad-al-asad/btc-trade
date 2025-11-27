/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }>}
) {
  const { id: transactionId } =  await context.params;
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

    const transaction = await prisma.transaction.update({
      where: {
        id: transactionId,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found or already processed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Transaction rejected successfully",
      transactionId,
    });
  } catch (error) {
    console.error("Reject transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
