import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { startOfMonth } from 'date-fns';
import { logError, logInfo, logWarn } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const monthStart = startOfMonth(new Date());

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
        createdAt: { gte: monthStart }
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
        createdAt: { gte: monthStart }
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

    logInfo(request.logger, { action: 'billing_metrics_fetched', totalOrders, monthlyRevenue: metrics.monthlyRevenue });
    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error) {
    logError(request.logger, error, { action: 'billing_metrics_fetch_failed' });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { action, orderId } = body;

    logInfo(request.logger, { action: 'billing_action_requested', billingAction: action, orderId });

    switch (action) {
      case 'refund':
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
          }
        });

        logInfo(request.logger, { action: 'refund_processed', orderId, orderStatus: order.status });
        return NextResponse.json({
          success: true,
          message: 'Refund processed successfully',
          order
        });

      default:
        logWarn(request.logger, { action: 'invalid_billing_action', billingAction: action });
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logError(request.logger, error, { action: 'billing_action_failed' });
    return NextResponse.json(
      { success: false, error: 'Failed to process billing action' },
      { status: 500 }
    );
  }
}
