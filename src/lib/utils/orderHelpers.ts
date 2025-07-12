import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";

export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            user: true, // Include user details
            address: true, // Include address details
            items: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function getOrderById(orderId: string) {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true, // Include user details
            address: true, // Include address details
            items: {
                include: { product: true }
            }
        }
    });
}

export async function updateOrderStatus(orderId: string, status: string) {
    return prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus }
    });
}

export async function createOrder({ userId, addressId, items, promoCodeId, tax, surcharges, deliveryCharges, discount }: {
    userId: string;
    addressId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    promoCodeId?: string;
    tax?: number;
    surcharges?: number;
    deliveryCharges?: number;
    discount?: number;
}) {
    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        + (tax || 0)
        + (surcharges || 0)
        + (deliveryCharges || 0)
        - (discount || 0);
    return prisma.order.create({
        data: {
            userId,
            addressId,
            promoCodeId,
            total,
            tax,
            surcharges,
            deliveryCharges,
            discount,
            status: "PENDING",
            items: {
                create: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        },
        include: {
            items: true
        }
    });
}
