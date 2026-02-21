import type {
  OrderStatus,
  DeliveryType,
  OrderSource,
  PaymentMethod,
} from '@/generated/prisma';
import type { User, UserResponse } from './user';
import type { Address, AddressResponse } from './address';
import type { Product, ProductResponse } from './product';

// Order types based on Prisma model
export interface Order {
  id: string;
  userId: string;
  addressId: string;
  deliveryType: DeliveryType;
  orderType: OrderSource;
  paymentMethod: PaymentMethod;
  total: number;
  tax: number;
  discount: number | null;
  status: OrderStatus;
  convenienceCharges: number;
  deliveryCharges: number;
  orderNumber: string;
  deliveryDate?: Date | null;
  promoCodeId?: string | null;
  driverId?: string | null;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order for API responses
export interface OrderResponse {
  id: string;
  userId: string;
  addressId: string;
  deliveryType: DeliveryType;
  orderType: OrderSource;
  paymentMethod: PaymentMethod;
  total: number;
  tax: number;
  discount: number | null;
  status: OrderStatus;
  convenienceCharges: number;
  deliveryCharges: number;
  orderNumber: string;
  deliveryDate?: string | null;
  promoCodeId?: string | null;
  driverId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserResponse;
  address?: AddressResponse;
  items?: OrderItemResponse[];
  driver?: UserResponse;
}

// Order with relationships
export interface OrderWithDetails extends Order {
  user: User;
  address: Address;
  items: OrderItemWithProduct[];
}

// Order Item types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: ProductResponse;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

// Order creation types
export interface CreateOrderData {
  userId: string;
  addressId: string;
  deliveryType: DeliveryType;
  orderType: OrderSource;
  paymentMethod: PaymentMethod;
  total: number;
  tax: number;
  discount?: number;
  convenienceCharges?: number;
  deliveryCharges?: number;
  deliveryDate?: Date | string;
  promoCodeId?: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  productId: string;
  quantity: number;
  price: number;
}

// Order calculations for store
export interface OrderCalculations {
  subtotal: number;
  tax: number;
  taxRate: number;
  convenienceCharge: number;
  deliveryCharge: number;
  appliedDiscount: number;
  finalTotal: number;
  // Original amounts (before waiving)
  originalTax: number;
  originalConvenienceCharge: number;
  originalDeliveryCharge: number;
  // Waive flags
  isTaxWaived: boolean;
  isConvenienceWaived: boolean;
  isDeliveryWaived: boolean;
}

// Admin-specific order response with embedded relationships
// Used for delivery management UI where full address object is needed
export interface AdminOrderResponse extends OrderResponse {
  user: UserResponse;
  address?: {
    street?: string;
    unit?: string;
    city?: string;
    province?: string;
    postal?: string;
    country?: string;
  };
  driver?: {
    id: string;
    fullName: string;
    phone: string;
  };
  items: Array<{
    id: string;
    productId: string;
    product?: { name: string };
    quantity: number;
    price: number;
  }>;
  promoCode?: {
    code: string;
    discount: number;
  };
}

// Order charges for service layer
export interface OrderCharges {
  tax: number;
  convenienceCharge: number;
  deliveryCharge: number;
  originalTax: number;
  originalConvenienceCharge: number;
  originalDeliveryCharge: number;
  isTaxWaived: boolean;
  isConvenienceWaived: boolean;
  isDeliveryWaived: boolean;
}
