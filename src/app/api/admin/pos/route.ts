import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import moment from 'moment';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all active products with categories
    const products = await prisma.product.findMany({
      where: { 
        isDelete: false,
        isActive: true 
      },
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isDelete: false },
      orderBy: { name: 'asc' }
    });

    // Get configuration data for taxes and charges
    const configs = await prisma.config.findMany({
      where: { 
        isDelete: false,
        isActive: true,
        title: {
          in: ['convenienceCharge', 'taxPercent', 'deliveryCharge', 'freeDeliveryThreshold']
        }
      }
    });
    // Get active promo codes
    const promoCodes = await prisma.promoCode.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: moment().toDate() } }
        ]
      },
      orderBy: { code: 'asc' }
    });

    // Transform config data into a more usable format
    const configMap = configs.reduce((acc: Record<string, any>, config: any) => {
      acc[config.title] = config.value;
      return acc;
    }, {} as Record<string, any>);

    // Handle tax configuration with waive flag
    let taxRate = 0.13; // Default 13% HST
    let taxWaived = false;
    
    if (configMap.taxPercent) {
      const taxConfig = configMap.taxPercent;
      if (taxConfig && typeof taxConfig === 'object') {
        taxWaived = taxConfig.waive === true;
        taxRate = taxWaived ? 0 : (taxConfig.percent || 13) / 100;
      }
    }

    // Set default values if configs don't exist
    const posConfig = {
      taxRate: taxRate,
      taxWaived: taxWaived,
      convenienceCharge: parseFloat(configMap.convenienceCharge) || 2.50,
      deliveryCharge: parseFloat(configMap.deliveryCharge) || 5.00,
      freeDeliveryThreshold: parseFloat(configMap.freeDeliveryThreshold) || 50.00
    };

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        config: posConfig,
        promoCodes
      }
    });

  } catch (error) {
    console.error('POS data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch POS data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      customerName, 
      customerPhone, 
      total, 
      tax, 
      convenienceCharges, 
      deliveryCharges, 
      discount, 
      promoCodeId,
      paymentMethod 
    } = body;

    // Create a walk-in order (without address requirement)
    const order = await prisma.order.create({
      data: {
        // For walk-in customers, we'll need to handle user creation or use a default walk-in user
        userId: 'walk-in-user-id', // You'll need to create a default walk-in user
        addressId: 'walk-in-address-id', // You'll need a default walk-in address
        total: parseFloat(total),
        tax: tax ? parseFloat(tax) : null,
        convenienceCharges: convenienceCharges ? parseFloat(convenienceCharges) : null,
        deliveryCharges: deliveryCharges ? parseFloat(deliveryCharges) : null,
        discount: discount ? parseFloat(discount) : null,
        promoCodeId: promoCodeId || null,
        status: 'CONFIRMED', // Walk-in orders are immediately confirmed
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('POS order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
