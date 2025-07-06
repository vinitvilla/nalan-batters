import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";

export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
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

export async function createOrder({ userId, addressId, items, promoCodeId }: {
    userId: string;
    addressId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    promoCodeId?: string;
}) {
    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return prisma.order.create({
        data: {
            userId,
            addressId,
            promoCodeId,
            total,
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
