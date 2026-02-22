import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { formatPhoneNumber, getPhoneVariations } from '@/lib/utils/phoneUtils';
import { getAllConfigs, parseChargeConfig } from '@/services/config/config.service';
import { calculateOrderCharges, calculateDiscountAmount, calculateOrderTotal } from '@/services/order/orderCalculation.service';
import { validatePromoById, incrementPromoUsage } from '@/services/order/promoCode.service';
import type { PosSaleRequest, PosSaleResponse } from '@/types';

const MAX_ORDER_NUMBER_ATTEMPTS = 20;

async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
    let orderNumber = '';
    for (let i = 0; i < 5; i++) {
      orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existingOrder = await tx.order.findUnique({
      where: { orderNumber }
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }

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

    // Determine user ID based on whether we have an existing user
    let userId: string;

    if (saleData.customer?.userId && saleData.customer?.isExistingUser) {
      userId = saleData.customer.userId;
    } else if (saleData.customer?.phone) {
      const standardizedPhone = formatPhoneNumber(saleData.customer.phone);

      if (!standardizedPhone) {
        throw new Error('Invalid phone number format');
      }

      const phoneVariations = getPhoneVariations(saleData.customer.phone);
      let user = await prisma.user.findFirst({
        where: {
          phone: {
            in: phoneVariations
          }
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: standardizedPhone,
            fullName: saleData.customer.name || `${standardizedPhone}`,
            role: 'USER'
          }
        });
      } else if (user.phone !== standardizedPhone) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phone: standardizedPhone }
        });
      }

      userId = user.id;
    } else {
      const walkInUser = await prisma.user.findFirst({
        where: {
          phone: 'WALK_IN_CUSTOMER',
          role: 'USER'
        }
      });

      if (!walkInUser) {
        return NextResponse.json<PosSaleResponse>({
          success: false,
          error: 'Walk-in customer user not configured. Please contact support.'
        }, { status: 500 });
      }

      userId = walkInUser.id;
    }

    // Use the system-wide pickup address for POS orders
    const storeAddress = await prisma.address.findFirst({
      where: {
        id: 'pickup-location-default'
      }
    });

    if (!storeAddress) {
      return NextResponse.json<PosSaleResponse>({
        success: false,
        error: 'Store pickup location not configured. Please contact support.'
      }, { status: 500 });
    }

    // Server-side calculation using shared services
    const configs = await getAllConfigs();
    const chargeConfig = parseChargeConfig(configs);

    const subtotal = saleData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // POS orders are always PICKUP with no delivery charge
    const charges = calculateOrderCharges(subtotal, chargeConfig, false, 'PICKUP');

    // Handle promo code if provided
    let discount = 0;
    let promoSnapshot: { id: string; code: string; discount: number; discountType: 'PERCENTAGE' | 'VALUE' } | null = null;
    if (saleData.promoCodeId) {
      const promoResult = await validatePromoById(saleData.promoCodeId, subtotal);
      if (promoResult.valid && promoResult.promo) {
        discount = calculateDiscountAmount(
          subtotal,
          promoResult.promo.discountType,
          promoResult.promo.discount,
          promoResult.promo.maxDiscount
        );
        promoSnapshot = {
          id: promoResult.promo.id,
          code: promoResult.promo.code,
          discount: promoResult.promo.discount,
          discountType: promoResult.promo.discountType,
        };
      }
    } else if (saleData.discount > 0) {
      // Manual discount from POS (no promo code)
      discount = saleData.discount;
    }

    const totals = calculateOrderTotal(subtotal, charges, discount, chargeConfig.taxPercent.percent);

    // Atomic transaction: validate stock, create order, decrement stock
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock before creating order
      for (const item of saleData.items) {
        const product = await tx.product.findFirst({
          where: { id: item.id, isActive: true, isDelete: false }
        });
        if (!product) throw new Error(`Product not found: ${item.id}`);
        if (item.quantity > product.stock) throw new Error(`Insufficient stock for ${product.name}`);
      }

      const orderNumber = await generateOrderNumber(tx);

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: storeAddress.id,
          orderType: 'POS',
          paymentMethod: saleData.paymentMethod.toUpperCase() as 'CASH' | 'CARD',
          subtotal,
          total: totals.finalTotal,
          tax: charges.tax,
          taxRate: chargeConfig.taxPercent.waive ? 0 : chargeConfig.taxPercent.percent,
          discount: discount > 0 ? discount : null,
          ...(promoSnapshot && {
            promoCode: { connect: { id: promoSnapshot.id } },
            promoCodeCode: promoSnapshot.code,
            promoDiscount: promoSnapshot.discount,
            promoDiscountType: promoSnapshot.discountType,
          }),
          status: 'DELIVERED',
          convenienceCharges: charges.convenienceCharge,
          deliveryCharges: 0,
          items: {
            create: saleData.items.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });

      for (const item of saleData.items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Increment promo usage if a promo code was applied
      if (promoSnapshot && discount > 0) {
        await incrementPromoUsage(promoSnapshot.id);
      }

      return created;
    });

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

    let errorMessage = 'Failed to process POS sale';
    if (error instanceof Error) {
      errorMessage = error.message;

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
