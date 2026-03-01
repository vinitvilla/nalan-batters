import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth-guard";
import { CartSchema } from "@/lib/validation/schemas";
import { logError, logInfo, logWarn } from "@/lib/logger"

interface CartItem {
  productId?: string;
  id?: string;
  quantity: number;
}

// Fetch cart for a user
export async function GET(req: NextRequest) {
  const rateLimitRes = await rateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  const authUser = await requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  if (authUser.uid !== userId && !authUser.admin) {
    logWarn(req.logger, { action: 'idor_blocked', requestedUserId: userId, authenticatedUid: authUser.uid });
    return NextResponse.json({ error: "Forbidden: You can only access your own cart" }, { status: 403 });
  }

  try {
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
    logInfo(req.logger, { action: 'cart_fetched', userId, itemCount: cart?.items.length || 0 });
    return NextResponse.json({ cart });
  } catch (error) {
    logError(req.logger, error, { action: 'cart_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// Upsert or merge cart for a user
export async function POST(req: NextRequest) {
  const rateLimitRes = await rateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  const authUser = await requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

  try {
    const body = await req.json();
    const validatedData = CartSchema.parse(body);
    const { userId, items, merge } = validatedData;

    if (authUser.uid !== userId && !authUser.admin) {
      logWarn(req.logger, { action: 'idor_blocked', requestedUserId: userId, authenticatedUid: authUser.uid });
      return NextResponse.json({ error: "Forbidden: You can only modify your own cart" }, { status: 403 });
    }

    const existingCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    const normalizeItem = (item: CartItem) => ({
      productId: item.productId || item.id!,
      quantity: item.quantity,
    });

    let finalItems = items.map(normalizeItem);
    if (merge && existingCart) {
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
    logInfo(req.logger, { action: 'cart_updated', userId, itemCount: cart.items.length, merged: !!merge });
    return NextResponse.json({ cart });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      logWarn(req.logger, { action: 'cart_validation_error' });
      return NextResponse.json({ error: "Validation Error" }, { status: 400 });
    }
    logError(req.logger, error, { action: 'cart_update_failed' });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
