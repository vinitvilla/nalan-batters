import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getOrderById, updateOrderStatus } from "@/lib/utils/orderHelpers";

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        await requireAdmin(req);
        const order = await getOrderById(params.orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json({ order });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        await requireAdmin(req);
        const { status } = await req.json();
        const order = await updateOrderStatus(params.orderId, status);
        return NextResponse.json({ order });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
