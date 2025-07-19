import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface PosSaleRequest {
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  customer?: {
    phone?: string;
    name?: string;
    email?: string;
  };
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  receivedAmount?: number;
  change?: number;
}

export async function POST(request: NextRequest) {
  try {
    const saleData: PosSaleRequest = await request.json();

    // For walk-in customers, we'll create a special user or use anonymous order
    let userId: string;
    
    if (saleData.customer?.phone) {
      // Try to find existing user by phone
      let user = await prisma.user.findUnique({
        where: { phone: saleData.customer.phone }
      });

      if (!user) {
        // Create new user for walk-in customer
        user = await prisma.user.create({
          data: {
            phone: saleData.customer.phone,
            fullName: saleData.customer.name || `Walk-in Customer ${saleData.customer.phone}`,
            role: 'USER'
          }
        });
      }
      userId = user.id;
    } else {
      // For anonymous walk-in customers, use a special system user or create one
      let walkInUser = await prisma.user.findFirst({
        where: { 
          phone: 'WALK_IN_CUSTOMER',
          role: 'USER'
        }
      });

      if (!walkInUser) {
        walkInUser = await prisma.user.create({
          data: {
            phone: 'WALK_IN_CUSTOMER',
            fullName: 'Walk-in Customer',
            role: 'USER'
          }
        });
      }
      userId = walkInUser.id;
    }

    // Create a default address for POS orders (store address)
    let storeAddress = await prisma.address.findFirst({
      where: { 
        userId: userId,
        street: 'STORE_PICKUP'
      }
    });

    if (!storeAddress) {
      storeAddress = await prisma.address.create({
        data: {
          userId: userId,
          street: 'STORE_PICKUP',
          city: 'Store Location',
          province: 'ON',
          country: 'Canada',
          postal: 'M1M1M1'
        }
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: userId,
        addressId: storeAddress.id,
        orderType: 'PICKUP',
        paymentMethod: saleData.paymentMethod.toUpperCase() as 'CASH' | 'CARD',
        total: saleData.total,
        tax: saleData.tax,
        discount: saleData.discount > 0 ? saleData.discount : null,
        status: 'CONFIRMED', // POS sales are immediately confirmed
        convenienceCharges: 0, // No convenience charges for in-store pickup
        deliveryCharges: 0,    // No delivery charges for in-store pickup
        items: {
          create: saleData.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Update product stock
    for (const item of saleData.items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        total: order.total,
        paymentMethod: saleData.paymentMethod,
        timestamp: order.createdAt
      }
    });

  } catch (error) {
    console.error('POS sale creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process POS sale'
    }, { status: 500 });
  }
}
