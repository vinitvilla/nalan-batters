import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma";
import { parse, isValid, startOfDay, endOfDay, isBefore } from 'date-fns';
import { getAllConfigs, parseChargeConfig, parseFreeDeliveryConfig } from '@/services/config/config.service';
import { isFreeDeliveryEligible, isDeliveryAvailable } from '@/services/order/delivery.service';
import { calculateOrderCharges, calculateDiscountAmount, calculateOrderTotal } from '@/services/order/orderCalculation.service';
import { validateAndApplyPromoCode, incrementPromoUsage } from '@/services/order/promoCode.service';

const MAX_ORDER_NUMBER_ATTEMPTS = 20;

async function generateUniqueOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
        let orderNumber = '';
        for (let i = 0; i < 5; i++) {
            orderNumber += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const existingOrder = await tx.order.findUnique({
            where: { orderNumber }
        });

        if (!existingOrder) {
            return orderNumber;
        }
    }

    throw new Error('Unable to generate unique order number after maximum attempts');
}

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

interface GetOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    orderType?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    deliveryDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function getOrdersPaginated({
    page = 1,
    limit = 25,
    search,
    status,
    orderType,
    paymentMethod,
    startDate,
    endDate,
    deliveryDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
}: GetOrdersParams) {
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: Prisma.OrderWhereInput = {
        isDelete: false,
    };

    // Search filter (name, phone, order number)
    if (search) {
        whereClause.OR = [
            {
                user: {
                    fullName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                user: {
                    phone: {
                        contains: search
                    }
                }
            },
            {
                orderNumber: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        ];
    }

    // Status filter
    if (status && status !== 'all') {
        if (status.startsWith('!')) {
            const excludedStatus = status.substring(1).toUpperCase();
            whereClause.status = { not: excludedStatus as OrderStatus };
        } else {
            whereClause.status = status.toUpperCase() as OrderStatus;
        }
    }

    // Order type filter
    if (orderType && orderType !== 'all') {
        whereClause.orderType = orderType.toUpperCase() as Prisma.EnumOrderSourceFilter["equals"];
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
        whereClause.paymentMethod = paymentMethod.toUpperCase() as Prisma.EnumPaymentMethodFilter["equals"];
    }

    // Date range filter (for order creation date)
    if (startDate || endDate) {
        const createdAtFilter: Prisma.DateTimeFilter = {};

        if (startDate) {
            const parsedStart = parse(startDate, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedStart)) {
                throw new Error(`Invalid start date format: ${startDate}. Expected format: YYYY-MM-DD`);
            }
            createdAtFilter.gte = startOfDay(parsedStart);
        }

        if (endDate) {
            const parsedEnd = parse(endDate, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedEnd)) {
                throw new Error(`Invalid end date format: ${endDate}. Expected format: YYYY-MM-DD`);
            }
            createdAtFilter.lte = endOfDay(parsedEnd);
        }

        whereClause.createdAt = createdAtFilter;
    }

    // Delivery date filter (for specific delivery date)
    if (deliveryDate) {
        const parsedDelivery = parse(deliveryDate, 'yyyy-MM-dd', new Date());

        if (!isValid(parsedDelivery)) {
            throw new Error(`Invalid delivery date format: ${deliveryDate}. Expected format: YYYY-MM-DD`);
        }

        whereClause.deliveryDate = {
            gte: startOfDay(parsedDelivery),
            lte: endOfDay(parsedDelivery)
        };
    }

    // Build orderBy clause for sorting
    const buildOrderBy = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        switch (sortBy) {
            case 'user.fullName':
                return { user: { fullName: sortOrder } };
            case 'total':
                return { total: sortOrder };
            case 'status':
                return { status: sortOrder };
            case 'orderType':
                return { orderType: sortOrder };
            case 'deliveryDate':
                return { deliveryDate: sortOrder };
            case 'orderNumber':
                return { orderNumber: sortOrder };
            case 'createdAt':
            default:
                return { createdAt: sortOrder };
        }
    };

    const orderByClause = buildOrderBy(sortBy, sortOrder);

    // Get total count for pagination
    const totalCount = await prisma.order.count({
        where: whereClause
    });

    // Get paginated orders
    const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
            user: true,
            address: true,
            items: { include: { product: true } }
        },
        orderBy: orderByClause,
        skip: offset,
        take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        orders,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
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
async function validateOrderItems(
    tx: Prisma.TransactionClient,
    items: Array<{ productId: string; quantity: number; price: number }>
) {
    const productIds = items.map(i => i.productId);
    const products = await tx.product.findMany({
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

async function reduceProductStock(
    tx: Prisma.TransactionClient,
    items: Array<{ productId: string; quantity: number }>
) {
    for (const item of items) {
        await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
        });
    }
}

// --- Main Order Creation (Atomic) ---
export async function createOrder({ userId, addressId, items, promoCodeId, deliveryDate, orderType, paymentMethod }: {
    userId: string;
    addressId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    promoCodeId?: string;
    deliveryDate?: Date | string;
    orderType?: 'PICKUP' | 'DELIVERY';
    paymentMethod?: 'CASH' | 'CARD' | 'ONLINE';
}) {
    // Validate delivery date before transaction
    let validDeliveryDate: Date | undefined;
    if (deliveryDate) {
        const date = typeof deliveryDate === 'string'
            ? parse(deliveryDate, 'yyyy-MM-dd', new Date())
            : deliveryDate;
        const today = startOfDay(new Date());

        if (!isValid(date) || isBefore(date, today)) {
            throw new Error("Delivery date must be today or in the future");
        }
        validDeliveryDate = date;
    }

    // Pre-fetch config and promo data outside transaction (read-only)
    const configs = await getAllConfigs();
    const chargeConfig = parseChargeConfig(configs);
    const freeDeliveryConfig = parseFreeDeliveryConfig(configs);

    const address = await prisma.address.findFirst({ where: { id: addressId } });

    if (orderType === 'DELIVERY') {
        if (!validDeliveryDate) {
            throw new Error("Delivery date is required for delivery orders");
        }
        if (!address || !isDeliveryAvailable(validDeliveryDate, address.city, freeDeliveryConfig)) {
            throw new Error("Delivery is not available for the selected date and location. Please choose a different date or location.");
        }
    }

    const isFreeDelivery = address && validDeliveryDate
        ? isFreeDeliveryEligible(validDeliveryDate, address.city, orderType || 'DELIVERY', freeDeliveryConfig)
        : false;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const charges = calculateOrderCharges(subtotal, chargeConfig, isFreeDelivery, orderType || 'DELIVERY');

    let discount = 0;
    if (promoCodeId) {
        const promoResult = await validateAndApplyPromoCode(promoCodeId, subtotal);
        if (promoResult.valid && promoResult.promo) {
            discount = calculateDiscountAmount(
                subtotal,
                promoResult.promo.discountType,
                promoResult.promo.discount,
                promoResult.promo.maxDiscount
            );
        }
    }

    const totals = calculateOrderTotal(subtotal, charges, discount, chargeConfig.taxPercent.percent);

    // Atomic transaction: validate stock, create order, decrement stock, increment promo
    return prisma.$transaction(async (tx) => {
        // Re-validate stock inside transaction to prevent race conditions
        await validateOrderItems(tx, items);

        const orderNumber = await generateUniqueOrderNumber(tx);

        const orderData: Prisma.OrderCreateInput = {
            orderNumber,
            user: { connect: { id: userId } },
            address: { connect: { id: addressId } },
            ...(promoCodeId && { promoCode: { connect: { id: promoCodeId } } }),
            total: totals.finalTotal,
            tax: charges.tax,
            convenienceCharges: charges.convenienceCharge,
            deliveryCharges: charges.deliveryCharge,
            discount,
            status: OrderStatus.PENDING,
            deliveryType: (orderType || 'DELIVERY') as 'PICKUP' | 'DELIVERY',
            paymentMethod: (paymentMethod || 'ONLINE') as 'CASH' | 'CARD' | 'ONLINE',
            ...(validDeliveryDate && { deliveryDate: validDeliveryDate }),
            items: {
                create: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                }))
            }
        };

        const order = await tx.order.create({
            data: orderData,
            include: { items: true }
        });

        await reduceProductStock(tx, items);

        if (promoCodeId && discount > 0) {
            await incrementPromoUsage(promoCodeId);
        }

        return order;
    });
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
