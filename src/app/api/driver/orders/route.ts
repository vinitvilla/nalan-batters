import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { UserRole } from "@/generated/prisma";

export async function GET(request: Request) {
  try {
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

    const orders = await prisma.order.findMany({
      where: {
        driverId: user.id,
        status: {
          not: "DELIVERED", // Show active orders. Maybe we want to show delivered too?
          // For now, let's show all or filter by query param.
          // Let's show active orders by default.
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

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching driver orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
