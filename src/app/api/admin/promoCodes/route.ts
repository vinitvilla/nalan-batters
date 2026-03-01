import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@/generated/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { logError, logInfo } from "@/lib/logger"

// GET: List all promo codes
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const promos = await prisma.promoCode.findMany({
      where: { isDeleted: false }
    });
    logInfo(req.logger, { action: 'promo_codes_fetched', count: promos.length });
    return NextResponse.json(promos);
  } catch (error) {
    logError(req.logger, error, { action: 'promo_codes_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

// POST: Create a new promo code
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const body = await req.json();
    const { discountType, code, ...rest } = body;
    const promo = await prisma.promoCode.create({
      data: {
        ...rest,
        code: code.trim().toUpperCase(),
        discountType: discountType === DiscountType.PERCENTAGE ? DiscountType.PERCENTAGE : DiscountType.VALUE
      }
    });
    logInfo(req.logger, { action: 'promo_code_created', promoId: promo.id, code: promo.code });
    return NextResponse.json(promo);
  } catch (err) {
    logError(req.logger, err, { action: 'promo_code_create_failed' });
    return NextResponse.json({ error: "Failed to create promo code: " + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}

// PUT: Update a promo code
export async function PUT(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

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
    logInfo(req.logger, { action: 'promo_code_updated', promoId: promo.id, code: promo.code });
    return NextResponse.json(promo);
  } catch (error) {
    logError(req.logger, error, { action: 'promo_code_update_failed' });
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

// DELETE: Delete a promo code
export async function DELETE(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing promo code id" }, { status: 400 });
    await prisma.promoCode.update({ where: { id: body.id }, data: { isDeleted: true } });
    logInfo(req.logger, { action: 'promo_code_deleted', promoId: body.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(req.logger, error, { action: 'promo_code_delete_failed' });
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
