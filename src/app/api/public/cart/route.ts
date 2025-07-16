import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartItem {
  productId?: string;
  id?: string;
  quantity: number;
}

// Fetch cart for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { 
      items: { 
        include: { product: true },
        where: {
          product: { isDelete: false }
        }
      } 
    },
  });
  return NextResponse.json({ cart });
}

// Upsert or merge cart for a user
export async function POST(req: NextRequest) {
  const { userId, items, merge } = await req.json();
  if (!userId || !Array.isArray(items)) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Fetch existing cart
  const existingCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  let mergedItems = items;
  if (merge && existingCart) {
    // Merge logic: combine quantities for same productId
    const map = new Map();
    for (const item of [...existingCart.items, ...items]) {
      if (map.has(item.productId)) {
        map.set(item.productId, {
          ...item,
          quantity: map.get(item.productId).quantity + item.quantity,
        });
      } else {
        map.set(item.productId, { ...item });
      }
    }
    mergedItems = Array.from(map.values());
  }

  // Upsert cart and items
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {
      items: {
        deleteMany: {},
        create: mergedItems.map((item: CartItem) => ({
          productId: item.productId || item.id!,
          quantity: item.quantity,
        })),
      },
    },
    create: {
      userId,
      items: {
        create: mergedItems.map((item: CartItem) => ({
          productId: item.productId || item.id!,
          quantity: item.quantity,
        })),
      },
    },
    include: { 
      items: { 
        include: { product: true },
        where: {
          product: { isDelete: false }
        }
      } 
    },
  });
  return NextResponse.json({ cart });
}
