import { NextRequest, NextResponse } from "next/server";
import { validateAndApplyPromoCode } from '@/services/order/promoCode.service';
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, discount: 0, error: "Invalid code" }, { status: 400 });
    }

    // 2. Calculate orderAmount from the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: authUser.uid },
      include: {
        items: {
          include: { product: true },
          where: { product: { isDelete: false } },
        },
      },
    });

    const orderAmount = cart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) ?? 0;

    // 3. Use service to validate promo code
    const result = await validateAndApplyPromoCode(code.trim(), orderAmount);

    if (!result.valid) {
      logInfo(req.logger, { action: 'promo_code_validation_failed', code: code.trim(), reason: result.error });
      return NextResponse.json({
        valid: false,
        discount: 0,
        discountType: undefined,
        error: result.error
      }, { status: 200 });
    }

    logInfo(req.logger, { action: 'promo_code_validated', code: code.trim(), discount: result.promo!.discount, discountType: result.promo!.discountType });
    // Return validated promo
    return NextResponse.json({
      valid: true,
      id: result.promo!.id,
      discount: result.promo!.discount,
      discountType: result.promo!.discountType,
      maxDiscount: result.promo!.maxDiscount,
      minOrderAmount: result.promo!.minOrderAmount
    }, { status: 200 });
  } catch (error) {
    logError(req.logger, error, { action: 'promo_code_validation_error' });
    return NextResponse.json({ valid: false, discount: 0, error: "Server error" }, { status: 500 });
  }
}
