import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@/generated/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET: List all promo codes
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const promos = await prisma.promoCode.findMany();
    return NextResponse.json(promos);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

// POST: Create a new promo code
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { discountType, code, ...rest } = body;
    const promo = await prisma.promoCode.create({
      data: {
        ...rest,
        code: code.trim().toUpperCase(),
        discountType: discountType === DiscountType.PERCENTAGE ? DiscountType.PERCENTAGE : DiscountType.VALUE
      }
    });
    return NextResponse.json(promo);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create promo code" + err }, { status: 500 });
  }
}

// PUT: Update a promo code
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing promo code id" }, { status: 400 });
    const { discountType, code, ...rest } = body;
    const promo = await prisma.promoCode.update({
      where: { id: body.id },
      data: {
        ...rest,
        code: code.trim().toUpperCase(),
        discountType: discountType === DiscountType.PERCENTAGE ? DiscountType.PERCENTAGE : DiscountType.VALUE
      }
    });
    return NextResponse.json(promo);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

// DELETE: Delete a promo code
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing promo code id" }, { status: 400 });
    await prisma.promoCode.update({ where: { id: body.id }, data: { isDeleted: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
