import type { User, UserResponse } from './user';
import type { Address, AddressResponse } from './address';
import type { Product, ProductResponse } from './product';

// Order types based on Prisma model
export interface Order {
  id: string;
  userId: string;
  addressId: string;
  orderType: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'CASH' | 'CARD';
  total: number;
  tax: number;
  discount: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  convenienceCharges: number;
  deliveryCharges: number;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order for API responses
export interface OrderResponse {
  id: string;
  userId: string;
  addressId: string;
  orderType: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'CASH' | 'CARD';
  total: number;
  tax: number;
  discount: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  convenienceCharges: number;
  deliveryCharges: number;
  createdAt: string;
  updatedAt: string;
  user?: UserResponse;
  address?: AddressResponse;
  items?: OrderItemResponse[];
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
  orderType: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'CASH' | 'CARD';
  total: number;
  tax: number;
  discount?: number;
  convenienceCharges?: number;
  deliveryCharges?: number;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  productId: string;
  quantity: number;
  price: number;
}
