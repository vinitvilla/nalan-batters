import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, discount: 0, error: "Invalid code" }, { status: 400 });
    }
    // Find promo in DB (case-insensitive)
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
        expiresAt: { gte: new Date() },
      },
    });
    if (!promo) {
      return NextResponse.json({ valid: false, discount: 0 }, { status: 200 });
    }
    return NextResponse.json({ valid: true, discount: Number(promo.discount) }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ valid: false, discount: 0, error: "Server error" }, { status: 500 });
  }
}
