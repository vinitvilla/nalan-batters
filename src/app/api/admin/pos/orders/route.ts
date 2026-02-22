import { NextRequest, NextResponse } from 'next/server';
import { Prisma, OrderStatus, PaymentMethod } from '@/generated/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';

    const skip = (page - 1) * limit;

    // Build where clause for POS orders specifically
    const whereClause: Prisma.OrderWhereInput = {
      orderType: 'POS', // Filter by order type POS (Point of Sale)
      isDelete: false
    };

    // Add search filter (only phone and order number for POS orders)
    if (search) {
      whereClause.OR = [
        { user: { phone: { contains: search } } },
        { orderNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status as OrderStatus;
    }

    // Add payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      whereClause.paymentMethod = paymentMethod as PaymentMethod;
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where: whereClause
    });

    // Fetch orders with pagination
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Transform data for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: parseFloat(order.total.toString()),
      tax: parseFloat(order.tax?.toString() || '0'),
      discount: order.discount ? parseFloat(order.discount.toString()) : null,
      status: order.status,
      orderType: order.orderType,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      user: {
        fullName: order.user.fullName,
        phone: order.user.phone
      },
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        product: {
          name: item.product.name
        }
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('POS orders fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch POS orders'
    }, { status: 500 });
  }
}
