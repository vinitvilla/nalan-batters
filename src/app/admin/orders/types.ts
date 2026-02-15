// Shared types and constants for admin orders

import { User } from "@/types/user";

export type Order = {
    id: string;
    orderNumber?: string; // Add the orderNumber field
    user: User;
    address?: {
        street?: string;
        unit?: string;
        city?: string;
        province?: string;
        postal?: string;
        country?: string;
    };
    status: string;
    orderType?: string; // Add orderType field
    paymentMethod?: string; // Add paymentMethod field
    total: number;
    createdAt: string;
    deliveryDate?: string | Date | null;
    items: Array<{
        productId: string;
        product?: { name: string };
        name?: string;
        quantity: number;
        price: number;
    }>;
    tax?: number;
    convenienceCharges?: number;
    deliveryCharges?: number;
    discount?: number;
    promoCode?: {
        code: string;
        discount: number;
    };
    driverId?: string;
    driver?: {
        id: string;
        fullName: string;
        phone: string;
    };
};

// Valid order statuses that match the Prisma OrderStatus enum
export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

// For filtering, we include "all" as well
export const ORDER_STATUS_FILTERS = ["all", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
