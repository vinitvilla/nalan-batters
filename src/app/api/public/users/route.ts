import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });
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
    return NextResponse.json({
      user
    });
}

export async function POST(req: NextRequest) {
    const { id: uid, phone, fullName } = await req.json();
    // lets create new user if not exists
    if (!uid || !phone || !fullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    const { phone, fullName } = await req.json();
    if (!phone || !fullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const user = await prisma.user.update({
        where: { 
          phone,
        },
        data: { fullName },
    });
    return NextResponse.json({ user });
}
