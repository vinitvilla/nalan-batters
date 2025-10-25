import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { formatPhoneNumber, getPhoneVariations } from '@/lib/utils/phoneUtils';
import type { PosSaleRequest, PosSaleResponse } from '@/types';

const prisma = new PrismaClient();

// Generate a unique 5-character alphanumeric order number
async function generateOrderNumber(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderNumber: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    orderNumber = '';
    for (let i = 0; i < 5; i++) {
      orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if this order number already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    });
    
    if (!existingOrder) {
      return orderNumber;
    }
    
    attempts++;
  } while (attempts < maxAttempts);
  
  throw new Error('Unable to generate unique order number');
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const saleData: PosSaleRequest = await request.json();
    
    // Validate required sale data
    if (!saleData.items || saleData.items.length === 0) {
      return NextResponse.json<PosSaleResponse>({
        success: false,
        error: 'No items in the sale'
      }, { status: 400 });
    }
    
    if (!saleData.paymentMethod || !['cash', 'card'].includes(saleData.paymentMethod)) {
      return NextResponse.json<PosSaleResponse>({
        success: false,
        error: 'Invalid payment method'
      }, { status: 400 });
    }
    
    if (typeof saleData.total !== 'number' || saleData.total <= 0) {
      return NextResponse.json<PosSaleResponse>({
        success: false,
        error: 'Invalid total amount'
      }, { status: 400 });
    }

    // Determine user ID based on whether we have an existing user
    let userId: string;
    
    if (saleData.customer?.userId && saleData.customer?.isExistingUser) {
      // Use the existing user ID that was found during lookup
      userId = saleData.customer.userId;
    } else if (saleData.customer?.phone) {
      // Standardize the phone number format
      const standardizedPhone = formatPhoneNumber(saleData.customer.phone);
      
      if (!standardizedPhone) {
        throw new Error('Invalid phone number format');
      }
      
      // Try to find existing user by any phone number variation
      const phoneVariations = getPhoneVariations(saleData.customer.phone);
      let user = await prisma.user.findFirst({
        where: { 
          phone: {
            in: phoneVariations
          }
        }
      });

      if (!user) {
        // Create new user for walk-in customer with standardized phone
        user = await prisma.user.create({
          data: {
            phone: standardizedPhone,
            fullName: saleData.customer.name || `${standardizedPhone}`,
            role: 'USER'
          }
        });
      } else if (user.phone !== standardizedPhone) {
        // Update existing user's phone to standardized format
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phone: standardizedPhone }
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

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        userId: userId,
        addressId: storeAddress.id,
        orderType: 'POS',
        paymentMethod: saleData.paymentMethod.toUpperCase() as 'CASH' | 'CARD',
        total: saleData.total,
        tax: saleData.tax,
        discount: saleData.discount > 0 ? saleData.discount : null,
        status: 'DELIVERED', // POS sales are immediately confirmed
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

    return NextResponse.json<PosSaleResponse>({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        paymentMethod: saleData.paymentMethod,
        timestamp: order.createdAt
      }
    });

  } catch (error) {
    console.error('POS sale creation error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to process POS sale';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific Prisma errors
      if (error.message.includes('orderNumber')) {
        errorMessage = 'Error generating unique order number. Please try again.';
      } else if (error.message.includes('phone')) {
        errorMessage = 'Invalid phone number format.';
      } else if (error.message.includes('stock')) {
        errorMessage = 'Insufficient stock for one or more items.';
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = 'Invalid product or customer data.';
      }
    }
    
    return NextResponse.json<PosSaleResponse>({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
