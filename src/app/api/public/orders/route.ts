import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/utils/orderHelpers";
import moment from 'moment';

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
            const date = moment(deliveryDate, 'YYYY-MM-DD');
            const today = moment().startOf('day');
            
            if (!date.isValid()) {
                return NextResponse.json({ error: "Invalid delivery date format" }, { status: 400 });
            }
            
            if (date.isBefore(today)) {
                return NextResponse.json({ error: "Delivery date cannot be in the past" }, { status: 400 });
            }
        }

        // For pickup orders, use the default pickup location address
        let finalAddressId = addressId;
        if (orderType === 'PICKUP') {
            finalAddressId = 'pickup-location-default';
        }

        const order = await createOrder({ 
            userId, 
            addressId: finalAddressId, 
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
