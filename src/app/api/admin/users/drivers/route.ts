import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma";
import logger, { logError, logInfo } from "@/lib/logger"

export async function GET() {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: UserRole.DRIVER,
        isDelete: false,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
      },
    });

    logInfo(logger, { endpoint: 'GET /api/admin/users/drivers', action: 'drivers_fetched', count: drivers.length });
    return NextResponse.json(drivers);
  } catch (error) {
    logError(logger, error, { endpoint: 'GET /api/admin/users/drivers', action: 'drivers_fetch_failed' });
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
