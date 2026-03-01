import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError, logInfo, logWarn } from "@/lib/logger"

// DELETE /api/public/addresses/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }
  try {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      logWarn(req.logger, { endpoint: 'DELETE /api/public/addresses/[id]', action: 'address_not_found', addressId: id });
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    const userWithDefault = await prisma.user.findFirst({ where: { defaultAddressId: id } });
    if (userWithDefault) {
      logWarn(req.logger, { endpoint: 'DELETE /api/public/addresses/[id]', action: 'cannot_delete_default_address', addressId: id });
      return NextResponse.json({ error: "Cannot delete default address. Please set another address as default first." }, { status: 400 });
    }
    await prisma.address.update({
      where: { id },
      data: { isDeleted: true },
    });
    logInfo(req.logger, { endpoint: 'DELETE /api/public/addresses/[id]', action: 'address_deleted', addressId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(req.logger, error, { endpoint: 'DELETE /api/public/addresses/[id]', action: 'address_delete_failed' });
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
