// Order status constants
export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const ORDER_STATUS_FILTERS = ["all", ...ORDER_STATUSES] as const;
export type OrderStatusFilter = typeof ORDER_STATUS_FILTERS[number];
