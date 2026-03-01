import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getOrderById, updateOrderStatus } from "@/lib/utils/orderHelpers";
import { logError, logInfo, logWarn } from "@/lib/logger"

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const adminCheck = await requireAdmin(req);
        if (adminCheck instanceof NextResponse) return adminCheck;

        const { orderId } = await params;
        const order = await getOrderById(orderId);
        if (!order) {
            logWarn(req.logger, { action: 'order_not_found', orderId });
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        logInfo(req.logger, { action: 'order_fetched', orderId });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        logError(req.logger, err, { action: 'order_fetch_failed' });
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
        logInfo(req.logger, { action: 'order_status_updated', orderId, newStatus: status });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        logError(req.logger, err, { action: 'order_status_update_failed' });
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
        logInfo(req.logger, { action: 'order_soft_deleted', orderId });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        logError(req.logger, err, { action: 'order_delete_failed' });
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
    }
}
