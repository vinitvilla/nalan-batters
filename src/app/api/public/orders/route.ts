import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/utils/orderHelpers";

export async function POST(req: NextRequest) {
    try {
        const { userId, addressId, items, promoCodeId } = await req.json();
        if (!userId || !addressId || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        // Optionally, validate user session/auth here
        const order = await createOrder({ userId, addressId, items, promoCodeId });
        return NextResponse.json({ order });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
