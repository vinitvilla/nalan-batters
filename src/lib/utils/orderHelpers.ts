import { prisma } from "@/lib/prisma";
import { DiscountType, OrderStatus } from "@/generated/prisma";
import moment from 'moment';

// --- Order Queries ---
export async function getAllOrders() {
    return prisma.order.findMany({
        where: { isDelete: false },
        include: {
            user: true,
            address: true,
            items: { include: { product: true } }
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function getOrderById(orderId: string) {
    return prisma.order.findFirst({
        where: { 
            id: orderId,
            isDelete: false 
        },
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
        where: { 
            id: { in: productIds }, 
            isActive: true,
            isDelete: false 
        },
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
    const configArr = await prisma.config.findMany({
        where: { isDelete: false }
    });
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
 * Validates if delivery is available for the given address and date
 */
function validateDeliveryAvailability(address: any, deliveryDate: Date, freeDeliveryConfig: any, orderType: string): boolean {
    // For pickup orders, no delivery validation needed
    if (orderType === 'PICKUP') return true;
    
    // For delivery orders, check if the date and location are supported
    if (!address?.city || !freeDeliveryConfig || !deliveryDate) {
        return false;
    }
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[deliveryDate.getDay()];
    
    const areasForDay = freeDeliveryConfig[dayName];
    if (!Array.isArray(areasForDay) || areasForDay.length === 0) {
        return false;
    }
    
    return areasForDay.some((area: string) => 
        area.toLowerCase().includes(address.city.toLowerCase()) ||
        address.city.toLowerCase().includes(area.toLowerCase())
    );
}

/**
 * Checks if an address qualifies for free delivery on a given date
 */
function isEligibleForFreeDelivery(address: any, deliveryDate: Date, freeDeliveryConfig: any): boolean {
    if (!address?.city || !freeDeliveryConfig || !deliveryDate) return false;
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[deliveryDate.getDay()];
    
    const areasForDay = freeDeliveryConfig[dayName];
    if (!Array.isArray(areasForDay)) return false;
    
    return areasForDay.some((area: string) => 
        area.toLowerCase().includes(address.city.toLowerCase()) ||
        address.city.toLowerCase().includes(area.toLowerCase())
    );
}

/**
 * Calculates charges (tax, convenience, delivery) from config and subtotal.
 * Applies waive logic and free delivery eligibility.
 */
function calculateCharges(config: any, subtotal: number, address: any = null, deliveryDate: Date | null = null) {
    // Get base rates with waive logic
    const taxPercentValue = getConfigField(config, 'taxPercent', 'percent', 13);
    const TAX_RATE = taxPercentValue ? taxPercentValue / 100 : 0;
    let convenienceCharges = getConfigField(config, 'convenienceCharge', 'amount', 0);
    let deliveryCharges = getConfigField(config, 'deliveryCharge', 'amount', 0);
    
    // Apply free delivery logic
    if (address && deliveryDate && deliveryCharges > 0) {
        const freeDeliveryConfig = config.freeDelivery?.value;
        if (isEligibleForFreeDelivery(address, deliveryDate, freeDeliveryConfig)) {
            deliveryCharges = 0;
            // Also waive convenience charge for free delivery areas
            convenienceCharges = 0;
        }
    }
    
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
        const promo = await prisma.promoCode.findFirst({ 
            where: { 
                id: promoCodeId,
                isDeleted: false 
            } 
        });
        if (promo && promo.isActive && (!promo.expiresAt || moment(promo.expiresAt).isSameOrAfter(moment()))) {
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
export async function createOrder({ userId, addressId, items, promoCodeId, deliveryDate, orderType, paymentMethod }: {
    userId: string;
    addressId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    promoCodeId?: string;
    deliveryDate?: Date | string;
    orderType?: 'PICKUP' | 'DELIVERY';
    paymentMethod?: 'CASH' | 'CARD' | 'ONLINE';
}) {
    // Validate delivery date
    let validDeliveryDate: Date | undefined;
    if (deliveryDate) {
        // Use moment.js for date validation
        const date = moment(deliveryDate);
        const today = moment().startOf('day');
        
        if (!date.isValid() || date.isBefore(today)) {
            throw new Error("Delivery date must be today or in the future");
        }
        validDeliveryDate = date.toDate();
    }

    // Validate items
    const products = await validateOrderItems(items);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const config = await getConfigObject();
    
    // Get address information for delivery validation and free delivery calculation
    const address = await prisma.address.findFirst({
        where: { id: addressId }
    });
    
    // For delivery orders, validate that delivery is available
    if (orderType === 'DELIVERY') {
        if (!validDeliveryDate) {
            throw new Error("Delivery date is required for delivery orders");
        }
        
        const freeDeliveryConfig = config.freeDelivery?.value;
        if (!validateDeliveryAvailability(address, validDeliveryDate, freeDeliveryConfig, orderType || 'DELIVERY')) {
            throw new Error("Delivery is not available for the selected date and location. Please choose a different date or location.");
        }
    }
    
    const { TAX_RATE, convenienceCharges, deliveryCharges, tax } = calculateCharges(config, subtotal, address, validDeliveryDate);
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
        orderType: orderType || 'DELIVERY', // Default to DELIVERY for online orders
        paymentMethod: paymentMethod || 'ONLINE', // Default to ONLINE for web orders
        items: {
            create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            }))
        }
    };
    if (validDeliveryDate) orderData.deliveryDate = validDeliveryDate;

    // Create order and update stock
    const order = await prisma.order.create({
        data: orderData,
        include: { items: true }
    });
    await reduceProductStock(items);
    return order;
}

/**
 * Soft deletes an order by marking it as deleted.
 */
export async function softDeleteOrder(orderId: string) {
    return prisma.order.update({
        where: { id: orderId },
        data: { isDelete: true }
    });
}
