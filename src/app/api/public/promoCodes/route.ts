import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import moment from 'moment';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, discount: 0, error: "Invalid code" }, { status: 400 });
    }
    // Use moment.js for current time
    const now = moment().toDate();

    const promo = await prisma.promoCode.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
        isDeleted: false,
        expiresAt: { gte: now },
      },
    });
    if (!promo) {
      return NextResponse.json({ valid: false, discount: 0, discountType: undefined }, { status: 200 });
    }
    return NextResponse.json({ valid: true, id: promo.id, discount: Number(promo.discount), discountType: promo.discountType }, { status: 200 });
  } catch {
    return NextResponse.json({ valid: false, discount: 0, error: "Server error" }, { status: 500 });
  }
}
