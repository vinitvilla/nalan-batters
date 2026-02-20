import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth-guard";
import { CartSchema } from "@/lib/validation/schemas";

interface CartItem {
  productId?: string;
  id?: string;
  quantity: number;
}

// Fetch cart for a user
export async function GET(req: NextRequest) {
  // 1. Rate Limit
  const rateLimitRes = await rateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  // 2. Auth Check
  const authUser = await requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  // 3. Authorization (IDOR Check)
  // Ensure the authenticated user is accessing their own cart
  // Note: authUser.uid is the Firebase UID. We assume userId param is also Firebase UID.
  if (authUser.uid !== userId && !authUser.admin) {
    return NextResponse.json({ error: "Forbidden: You can only access your own cart" }, { status: 403 });
  }

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
  // 1. Rate Limit
  const rateLimitRes = await rateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  // 2. Auth Check
  const authUser = await requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

  try {
    const body = await req.json();

    // 3. Validation
    const validatedData = CartSchema.parse(body);
    const { userId, items, merge } = validatedData;

    // 4. Authorization (IDOR Check)
    if (authUser.uid !== userId && !authUser.admin) {
      return NextResponse.json({ error: "Forbidden: You can only modify your own cart" }, { status: 403 });
    }

    // Fetch existing cart
    const existingCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    // Normalize items to always have productId
    const normalizeItem = (item: CartItem) => ({
      productId: item.productId || item.id!,
      quantity: item.quantity,
    });

    let finalItems = items.map(normalizeItem);
    if (merge && existingCart) {
      // Merge logic: combine quantities for same productId
      const map = new Map<string, { productId: string; quantity: number }>();
      for (const dbItem of existingCart.items) {
        map.set(dbItem.productId, { productId: dbItem.productId, quantity: dbItem.quantity });
      }
      for (const newItem of finalItems) {
        const existing = map.get(newItem.productId);
        if (existing) {
          map.set(newItem.productId, { productId: newItem.productId, quantity: existing.quantity + newItem.quantity });
        } else {
          map.set(newItem.productId, newItem);
        }
      }
      finalItems = Array.from(map.values());
    }

    // Upsert cart and items
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {
        items: {
          deleteMany: {},
          create: finalItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      create: {
        userId,
        items: {
          create: finalItems.map(item => ({
            productId: item.productId,
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
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: "Validation Error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
