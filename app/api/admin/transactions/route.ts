/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.transaction.count({ where });

    // Get counts for different statuses
    const pendingCount = await prisma.transaction.count({ 
      where: { status: 'PENDING' } 
    });
    const depositCount = await prisma.transaction.count({ 
      where: { type: 'DEPOSIT', status: 'PENDING' } 
    });
    const withdrawalCount = await prisma.transaction.count({ 
      where: { type: 'WITHDRAWAL', status: 'PENDING' } 
    });

    return NextResponse.json({
      transactions,
      counts: {
        total,
        pending: pendingCount,
        pendingDeposits: depositCount,
        pendingWithdrawals: withdrawalCount
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin transactions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}