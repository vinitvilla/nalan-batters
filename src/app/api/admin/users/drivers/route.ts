import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma";

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

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
