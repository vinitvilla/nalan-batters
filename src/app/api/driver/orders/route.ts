import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { UserRole } from "@/generated/prisma";
import logger, { logError, logInfo, logWarn } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logWarn(request.logger, { endpoint: 'GET /api/driver/orders', action: 'auth_failed', reason: 'missing_auth_header' });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!user || user.role !== UserRole.DRIVER) {
      logWarn(request.logger, { endpoint: 'GET /api/driver/orders', action: 'auth_failed', reason: 'not_driver', uid });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: {
        driverId: user.id,
        status: {
          not: "DELIVERED",
        },
      },
      include: {
        address: true,
        user: {
          select: {
            fullName: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        deliveryDate: "asc",
      },
    });

    logInfo(request.logger, { endpoint: 'GET /api/driver/orders', action: 'driver_orders_fetched', driverId: user.id, orderCount: orders.length });
    return NextResponse.json(orders);
  } catch (error) {
    logError(request.logger, error, { endpoint: 'GET /api/driver/orders', action: 'driver_orders_fetch_failed' });
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
