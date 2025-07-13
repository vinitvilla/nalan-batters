import { prisma } from "@/lib/prisma";
import { DiscountType, OrderStatus } from "@/generated/prisma";

// --- Order Queries ---
export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            user: true,
            address: true,
            items: { include: { product: true } }
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function getOrderById(orderId: string) {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            address: true,
            items: { include: { product: true } }
        }
    });
}

export async function updateOrderStatus(orderId: string, status: string) {
    return prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus }
    });
}

// --- Helpers ---
/**
 * Validates order items and returns product details.
 */
async function validateOrderItems(items: Array<{ productId: string; quantity: number; price: number }>) {
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
    });
    if (products.length !== items.length) throw new Error("Invalid or inactive product(s)");
    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error("Product not found");
        if (item.quantity > product.stock) throw new Error(`Insufficient stock for ${product.name}`);
        if (Number(item.price) !== Number(product.price)) throw new Error(`Price mismatch for ${product.name}`);
    }
    return products;
}

/**
 * Returns config object mapped by title.
 */
async function getConfigObject() {
    const configArr = await prisma.config.findMany();
    return configArr.reduce((acc, curr) => {
        acc[curr.title] = curr;
        return acc;
    }, {} as Record<string, typeof configArr[number]>);
}

/**
 * Safely extracts a field from config value, with fallback and waive logic.
 */
function getConfigField(configObj: any, key: string, field: string, fallback: number) {
    const entry = configObj[key]?.value;
    if (entry && typeof entry === 'object') {
        if (entry.waive === true) return 0;
        if (field in entry) return Number(entry[field]);
    }
    return fallback;
}

/**
 * Calculates charges (tax, convenience, delivery) from config and subtotal.
 */
function calculateCharges(config: any, subtotal: number) {
    const taxPercentValue = getConfigField(config, 'taxPercent', 'percent', 13);
    const TAX_RATE = taxPercentValue ? taxPercentValue / 100 : 0;
    const convenienceCharges = getConfigField(config, 'convenienceCharge', 'amount', 0);
    const deliveryCharges = getConfigField(config, 'deliveryCharge', 'amount', 0);
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    return { TAX_RATE, convenienceCharges, deliveryCharges, tax };
}

/**
 * Calculates discount and type from promo code.
 */
async function calculateDiscount(subtotal: number, promoCodeId?: string) {
    let discount = 0;
    let discountType: DiscountType | undefined;
    if (promoCodeId) {
        const promo = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
        if (promo && promo.isActive && (!promo.expiresAt || new Date(promo.expiresAt) >= new Date())) {
            discountType = promo.discountType;
            if (promo.discountType === DiscountType.PERCENTAGE) {
                discount = +(subtotal * (Number(promo.discount) / 100)).toFixed(2);
            } else {
                discount = Number(promo.discount);
            }
        }
    }
    return { discount, discountType };
}

/**
 * Reduces product stock after order placement.
 */
async function reduceProductStock(items: Array<{ productId: string; quantity: number }>) {
    for (const item of items) {
        await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
        });
    }
}

// --- Main Order Creation ---
/**
 * Creates an order, calculates charges, applies promo, and updates stock.
 */
export async function createOrder({ userId, addressId, items, promoCodeId, deliveryDate }: {
    userId: string;
    addressId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    promoCodeId?: string;
    deliveryDate?: Date | string;
}) {
    // Validate delivery date
    if (deliveryDate) {
        const date = new Date(deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(date.getTime()) || date < today) {
            throw new Error("Delivery date must be today or in the future");
        }
    }

    // Validate items
    const products = await validateOrderItems(items);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const config = await getConfigObject();
    const { TAX_RATE, convenienceCharges, deliveryCharges, tax } = calculateCharges(config, subtotal);
    const { discount } = await calculateDiscount(subtotal, promoCodeId);

    // Prepare order data
    const orderData: any = {
        userId,
        addressId,
        promoCodeId,
        total: +(subtotal + tax + convenienceCharges + deliveryCharges - discount).toFixed(2),
        tax,
        convenienceCharges,
        deliveryCharges,
        discount,
        status: OrderStatus.PENDING,
        items: {
            create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            }))
        }
    };
    if (deliveryDate) orderData.deliveryDate = deliveryDate;

    // Create order and update stock
    const order = await prisma.order.create({
        data: orderData,
        include: { items: true }
    });
    await reduceProductStock(items);
    return order;
}
