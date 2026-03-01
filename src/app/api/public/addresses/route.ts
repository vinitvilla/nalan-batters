import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { logError, logInfo } from "@/lib/logger"

// Create a new address and set as default for user
export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

  try {
    const { userId, street, unit, city, province, country, postal } = await req.json();

    if (!userId || !street || !city || !province || !country || !postal) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check for existing deleted address
    const existing = await prisma.address.findFirst({
      where: {
        userId,
        street,
        city,
        province,
        country,
        postal,
        isDeleted: true,
      },
    });
    if (existing) {
      const restored = await prisma.address.update({
        where: { id: existing.id },
        data: { isDeleted: false, unit },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: restored.id },
      });
      logInfo(req.logger, { action: 'address_restored', addressId: restored.id, userId });
      return NextResponse.json({ address: restored, restored: true });
    }

    const address = await prisma.address.create({
      data: { userId, street, unit, city, province, country, postal },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { defaultAddressId: address.id },
    });
    logInfo(req.logger, { action: 'address_created', addressId: address.id, userId });
    return NextResponse.json({ address });
  } catch (error) {
    logError(req.logger, error, { action: 'address_create_failed' });
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
