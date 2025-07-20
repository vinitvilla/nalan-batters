import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/utils/orderHelpers";

export async function POST(req: NextRequest) {
    try {
        const { userId, addressId, items, promoCodeId, deliveryDate, orderType } = await req.json();
        
        // Basic validation
        if (!userId || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // For delivery orders, validate address and delivery date
        if (orderType === 'DELIVERY') {
            if (!addressId) {
                return NextResponse.json({ error: "Address is required for delivery orders" }, { status: 400 });
            }
            if (!deliveryDate) {
                return NextResponse.json({ error: "Delivery date is required for delivery orders" }, { status: 400 });
            }
            
            // Validate delivery date format and ensure it's not in the past
            const date = new Date(deliveryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (isNaN(date.getTime())) {
                return NextResponse.json({ error: "Invalid delivery date format" }, { status: 400 });
            }
            
            if (date < today) {
                return NextResponse.json({ error: "Delivery date cannot be in the past" }, { status: 400 });
            }
        }

        // For pickup orders, address is optional but still validate if provided
        if (orderType === 'PICKUP' && !addressId) {
            return NextResponse.json({ error: "Address is required for pickup confirmation" }, { status: 400 });
        }

        const order = await createOrder({ 
            userId, 
            addressId, 
            items, 
            promoCodeId, 
            deliveryDate, 
            orderType: orderType || 'DELIVERY' 
        });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
