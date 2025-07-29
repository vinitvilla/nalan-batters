import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getOrderById, updateOrderStatus } from "@/lib/utils/orderHelpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const adminCheck = await requireAdmin(req);
        if (adminCheck instanceof NextResponse) return adminCheck;

        const { orderId } = await params;
        const order = await getOrderById(orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 401 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const adminCheck = await requireAdmin(req);
        if (adminCheck instanceof NextResponse) return adminCheck;

        const { orderId } = await params;
        const { status } = await req.json();
        const order = await updateOrderStatus(orderId, status);
        return NextResponse.json({ order });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const adminCheck = await requireAdmin(req);
        if (adminCheck instanceof NextResponse) return adminCheck;

        const { orderId } = await params;
        const { softDeleteOrder } = await import("@/lib/utils/orderHelpers");
        const order = await softDeleteOrder(orderId);
        return NextResponse.json({ order });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
    }
}
