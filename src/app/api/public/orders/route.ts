import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/utils/orderHelpers";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { OrderSchema } from "@/lib/validation/schemas";
import { parse, isValid, startOfDay, isBefore } from "date-fns";

export async function POST(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    try {
        const body = await req.json();
        const result = OrderSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation Error", details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const { userId, addressId, items, promoCodeId, deliveryDate, deliveryType } = result.data;

        // For delivery orders, validate address and delivery date
        if (deliveryType === 'DELIVERY') {
            if (!addressId) {
                return NextResponse.json({ error: "Address is required for delivery orders" }, { status: 400 });
            }
            if (!deliveryDate) {
                return NextResponse.json({ error: "Delivery date is required for delivery orders" }, { status: 400 });
            }

            // Validate delivery date format and ensure it's not in the past
            const date = parse(deliveryDate, 'yyyy-MM-dd', new Date());
            const today = startOfDay(new Date());

            if (!isValid(date)) {
                return NextResponse.json({ error: "Invalid delivery date format" }, { status: 400 });
            }

            if (isBefore(date, today)) {
                return NextResponse.json({ error: "Delivery date cannot be in the past" }, { status: 400 });
            }
        }

        // For pickup orders, use the system pickup address
        let finalAddressId = addressId;
        if (deliveryType === 'PICKUP') {
            const pickupAddress = await prisma.address.findFirst({
                where: { id: 'pickup-location-default' }
            });

            if (!pickupAddress) {
                return NextResponse.json({
                    error: "Pickup location not configured. Please contact support."
                }, { status: 500 });
            }

            finalAddressId = pickupAddress.id;
        }

        const order = await createOrder({
            userId,
            addressId: finalAddressId!,
            items,
            promoCodeId: promoCodeId || undefined,
            deliveryDate,
            orderType: (deliveryType || 'DELIVERY') as 'PICKUP' | 'DELIVERY',
        });
        return NextResponse.json({ order });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
