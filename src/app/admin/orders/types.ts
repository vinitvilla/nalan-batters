// Shared types and constants for admin orders

export type Order = {
    id: string;
    customerName: string;
    customerPhone: string;
    status: string;
    total: number;
    createdAt: string;
    items: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }>;
};

export const ORDER_STATUSES = ["all", "pending", "processing", "completed", "cancelled"];
