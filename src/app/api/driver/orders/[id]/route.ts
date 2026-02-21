import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { z } from "zod";
import { UserRole } from "@/generated/prisma";

const updateStatusSchema = z.object({
  status: z.enum(["DELIVERED", "PENDING", "CONFIRMED", "SHIPPED", "CANCELLED"]),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!user || user.role !== UserRole.DRIVER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    // Verify order belongs to driver
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order || order.driverId !== user.id) {
      return NextResponse.json({ error: "Order not found or not assigned to you" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
