import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

// Create a new address and set as default for user
export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

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
    // Restore the address
    const restored = await prisma.address.update({
      where: { id: existing.id },
      data: { isDeleted: false, unit },
    });
    // Set as default for user
    await prisma.user.update({
      where: { id: userId },
      data: { defaultAddressId: restored.id },
    });
    return NextResponse.json({ address: restored, restored: true });
  }

  // Create address
  const address = await prisma.address.create({
    data: { userId, street, unit, city, province, country, postal },
  });
  // Set as default for user
  await prisma.user.update({
    where: { id: userId },
    data: { defaultAddressId: address.id },
  });
  return NextResponse.json({ address });
}
