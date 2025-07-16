import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/utils/orderHelpers";

export async function POST(req: NextRequest) {
    try {
        const { userId, addressId, items, promoCodeId, deliveryDate } = await req.json();
        if (!userId || !addressId || !Array.isArray(items) || items.length === 0 || deliveryDate === undefined || deliveryDate === null) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await createOrder({ userId, addressId, items, promoCodeId, deliveryDate });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
