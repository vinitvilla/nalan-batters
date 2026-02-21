import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

    // Only allow users to look up their own data (or admins)
    if (authUser.phone_number !== phone && !authUser.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findFirst({
      where: {
        phone,
        isDelete: false
      },
      include: {
        addresses: {
          where: { isDeleted: false },
        },
        defaultAddress: true,
        cart: {
          include: {
            items: {
              include: {
                product: true,
              },
              where: {
                product: { isDelete: false }
              }
            },
          },
        },
      },
    });
    return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id: uid, phone, fullName } = await req.json();
    if (!uid || !phone || !fullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Ensure the authenticated user matches the phone being registered
    if (authUser.phone_number !== phone && !authUser.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let user = await prisma.user.findFirst({
      where: {
        phone,
        isDelete: false
      }
    });
    if (!user) {
      user = await prisma.user.create({ data: { phone, fullName, id: uid } });
    }
    return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { phone, fullName } = await req.json();
    if (!phone || !fullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Only allow users to update their own data (or admins)
    if (authUser.phone_number !== phone && !authUser.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.update({
        where: { phone },
        data: { fullName },
    });
    return NextResponse.json({ user });
}
