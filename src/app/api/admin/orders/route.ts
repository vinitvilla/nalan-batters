import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getAllOrders, createOrder } from "@/lib/utils/orderHelpers";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);
        const orders = await getAllOrders();
        return NextResponse.json({ orders });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 401 });
    }
}

// Optionally, implement POST for creating orders (not needed for admin panel)
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);
        const data = await req.json();
        const order = await createOrder(data);
        return NextResponse.json({ order });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
    }
}
