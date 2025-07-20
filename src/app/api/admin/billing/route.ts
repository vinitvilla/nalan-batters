import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import moment from 'moment';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you'd verify the user has billing permissions here
    
    // Get billing metrics
    const totalOrders = await prisma.order.count({
      where: { isDelete: false }
    });

    const totalRevenue = await prisma.order.aggregate({
      where: { 
        isDelete: false,
        status: { not: 'CANCELLED' }
      },
      _sum: { total: true }
    });

    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        isDelete: false,
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: moment().startOf('month').toDate()
        }
      },
      _sum: { total: true }
    });

    const pendingOrders = await prisma.order.aggregate({
      where: {
        isDelete: false,
        status: 'PENDING'
      },
      _sum: { total: true }
    });

    const cancelledOrders = await prisma.order.aggregate({
      where: {
        isDelete: false,
        status: 'CANCELLED',
        createdAt: {
          gte: moment().startOf('month').toDate()
        }
      },
      _sum: { total: true }
    });

    const metrics = {
      totalRevenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
      monthlyRevenue: monthlyRevenue._sum.total ? Number(monthlyRevenue._sum.total) : 0,
      pendingPayments: pendingOrders._sum.total ? Number(pendingOrders._sum.total) : 0,
      refundsIssued: cancelledOrders._sum.total ? Number(cancelledOrders._sum.total) : 0,
      averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.total ? Number(totalRevenue._sum.total) / totalOrders : 0) : 0,
      totalOrders
    };

    return NextResponse.json({ 
      success: true,
      metrics 
    });

  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, amount, reason } = body;

    switch (action) {
      case 'refund':
        // Process refund logic here
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'CANCELLED',
            // Add refund tracking fields as needed
          }
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Refund processed successfully',
          order 
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Billing action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process billing action' },
      { status: 500 }
    );
  }
}
