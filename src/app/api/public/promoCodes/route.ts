import { NextResponse } from "next/server";
import { validateAndApplyPromoCode } from '@/services/order/promoCode.service';

export async function POST(req: Request) {
  try {
    const { code, orderAmount } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, discount: 0, error: "Invalid code" }, { status: 400 });
    }

    // Use service to validate promo code
    const result = await validateAndApplyPromoCode(code.trim(), orderAmount || 0);

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        discountType: undefined,
        error: result.error
      }, { status: 200 });
    }

    // Return validated promo
    return NextResponse.json({
      valid: true,
      id: result.promo!.id,
      discount: result.promo!.discount,
      discountType: result.promo!.discountType,
      maxDiscount: result.promo!.maxDiscount
    }, { status: 200 });
  } catch {
    return NextResponse.json({ valid: false, discount: 0, error: "Server error" }, { status: 500 });
  }
}
