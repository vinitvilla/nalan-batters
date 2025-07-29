import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getAllOrders, createOrder, getOrdersPaginated } from "@/lib/utils/orderHelpers";

export async function GET(req: NextRequest) {
    try {
        const adminCheck = await requireAdmin(req);
        if (adminCheck instanceof NextResponse) return adminCheck;
        
        const { searchParams } = new URL(req.url);
        
        // Check if pagination is requested
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        
        // If pagination parameters are provided, use paginated query
        if (page || limit) {
            const paginatedResult = await getOrdersPaginated({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 25,
                search: searchParams.get('search') || undefined,
                status: searchParams.get('status') || undefined,
                orderType: searchParams.get('orderType') || undefined,
                paymentMethod: searchParams.get('paymentMethod') || undefined,
                startDate: searchParams.get('startDate') || undefined,
                endDate: searchParams.get('endDate') || undefined,
                sortBy: searchParams.get('sortBy') || undefined,
                sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
            });
            
            return NextResponse.json(paginatedResult);
        }
        
        // Fallback to original behavior for backward compatibility
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
