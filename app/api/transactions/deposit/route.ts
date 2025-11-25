import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session:any = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, paymentMethod = 'CARD' } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (amount > 100000) { // Limit deposit to $100,000
      return NextResponse.json(
        { error: 'Deposit amount exceeds maximum limit' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        type: 'DEPOSIT',
        amount: amount,
        status: 'COMPLETED', // In real app, this would be PENDING until payment confirmation
        description: `Deposit via ${paymentMethod}`,
        userId: session.user.id,
      }
    });

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        balance: { increment: amount }
      },
      select: {
        id: true,
        balance: true,
        username: true,
        email: true
      }
    });

    return NextResponse.json({
      message: 'Deposit successful',
      transaction,
      newBalance: updatedUser.balance
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}