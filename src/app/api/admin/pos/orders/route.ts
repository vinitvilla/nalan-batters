import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch recent orders (last 100) with store pickup addresses
    const orders = await prisma.order.findMany({
      where: {
        address: {
          street: 'STORE_PICKUP'
        },
        isDelete: false
      },
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
      take: 100
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
      data: transformedOrders
    });

  } catch (error) {
    console.error('POS orders fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch POS orders'
    }, { status: 500 });
  }
}
