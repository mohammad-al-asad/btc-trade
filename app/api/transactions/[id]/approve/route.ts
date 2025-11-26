/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions);
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { role: true, id: true }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = params.id;

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          include: {
            assets: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    // Update transaction based on type
    if (transaction.type === 'DEPOSIT') {
      // For deposit, add to user's USDT balance (assets[1])
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'COMPLETED',
          }
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            assets: {
              update: {
                where: { 
                  id: transaction.user.assets[1].id // USDT asset
                },
                data: {
                  amount: {
                    increment: transaction.amount
                  }
                }
              }
            }
          }
        })
      ]);
    } else if (transaction.type === 'WITHDRAWAL') {
      // For withdrawal, ensure user has sufficient balance and deduct
      const usdtAsset = transaction.user.assets.find(asset => 
        asset.assetName === 'USDT'
      );

      if (!usdtAsset || +usdtAsset.amount < transaction.amount) {
        return NextResponse.json(
          { error: 'Insufficient balance for withdrawal' },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'COMPLETED',
          }
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            assets: {
              update: {
                where: { 
                  id: usdtAsset.id
                },
                data: {
                  amount: {
                    decrement: transaction.amount
                  }
                }
              }
            }
          }
        })
      ]);
    }

    return NextResponse.json({
      message: 'Transaction approved successfully',
      transactionId
    });

  } catch (error) {
    console.error('Approve transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}