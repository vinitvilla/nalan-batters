// Shared types and constants for admin orders

import { UserType } from "@/types/UserType";

export type Order = {
    id: string;
    user: UserType;
    address?: {
        street?: string;
        unit?: string;
        city?: string;
        province?: string;
        postal?: string;
        country?: string;
    };
    status: string;
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
};

// Valid order statuses that match the Prisma OrderStatus enum
export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

// For filtering, we include "all" as well
export const ORDER_STATUS_FILTERS = ["all", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
