import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@/generated/prisma";
import { logError, logInfo, logWarn } from "@/lib/logger"

const assignDriverSchema = z.object({
  orderId: z.string(),
  driverId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, driverId } = assignDriverSchema.parse(body);

    logInfo(request.logger, { endpoint: 'POST /api/admin/orders/assign', action: 'driver_assignment_requested', orderId, driverId });

    // Verify driver exists and has DRIVER role
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== UserRole.DRIVER) {
      logWarn(request.logger, { endpoint: 'POST /api/admin/orders/assign', action: 'invalid_driver', driverId });
      return NextResponse.json(
        { error: "Invalid driver" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { driverId },
      include: { driver: true },
    });

    logInfo(request.logger, { endpoint: 'POST /api/admin/orders/assign', action: 'driver_assigned', orderId, driverId, driverName: driver.fullName });
    return NextResponse.json(order);
  } catch (error) {
    logError(request.logger, error, { endpoint: 'POST /api/admin/orders/assign', action: 'driver_assignment_failed' });
    return NextResponse.json(
      { error: "Failed to assign driver" },
      { status: 500 }
    );
  }
}
