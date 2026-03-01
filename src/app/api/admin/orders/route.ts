import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getAllOrders, createOrder, getOrdersPaginated } from "@/lib/utils/orderHelpers";
import { logError, logInfo } from "@/lib/logger"

export async function GET(req: NextRequest) {
    try {
        const adminCheck = await requireAdmin(req);
        if (adminCheck instanceof NextResponse) return adminCheck;

        const { searchParams } = new URL(req.url);

        // Check if pagination is requested OR if deliveryDate filter is used
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const deliveryDate = searchParams.get('deliveryDate');

        // If pagination parameters are provided OR deliveryDate filter is used, use paginated query
        if (page || limit || deliveryDate) {
            const paginatedResult = await getOrdersPaginated({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 1000, // Use higher default limit for delivery date filtering
                search: searchParams.get('search') || undefined,
                status: searchParams.get('status') || undefined,
                deliveryType: searchParams.get('orderType') || undefined,
                paymentMethod: searchParams.get('paymentMethod') || undefined,
                startDate: searchParams.get('startDate') || undefined,
                endDate: searchParams.get('endDate') || undefined,
                deliveryDate: deliveryDate || undefined,
                sortBy: searchParams.get('sortBy') || undefined,
                sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
            });

            logInfo(req.logger, { action: 'orders_fetched_paginated', page: page || 1, total: paginatedResult.pagination?.totalCount });
            return NextResponse.json(paginatedResult);
        }

        // Fallback to original behavior for backward compatibility
        const orders = await getAllOrders();
        logInfo(req.logger, { action: 'orders_fetched_all', count: orders.length });
        return NextResponse.json({ orders });
    } catch (err: unknown) {
        logError(req.logger, err, { action: 'orders_fetch_failed' });
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 401 });
    }
}

// Optionally, implement POST for creating orders (not needed for admin panel)
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);
        const data = await req.json();
        const order = await createOrder(data);
        logInfo(req.logger, { action: 'order_created', orderId: order.id, orderNumber: order.orderNumber });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        logError(req.logger, err, { action: 'order_create_failed' });
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
    }
}
