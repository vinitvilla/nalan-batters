import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@/generated/prisma";

const assignDriverSchema = z.object({
  orderId: z.string(),
  driverId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, driverId } = assignDriverSchema.parse(body);

    // Verify driver exists and has DRIVER role
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== UserRole.DRIVER) {
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

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error assigning driver:", error);
    return NextResponse.json(
      { error: "Failed to assign driver" },
      { status: 500 }
    );
  }
}
