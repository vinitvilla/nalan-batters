import type { PosCustomerData } from './user';

// POS-specific types
export interface PosCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// POS Sale Request
export interface PosSaleRequest {
  items: PosCartItem[];
  customer?: PosCustomerData;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  promoCodeId?: string;
  receivedAmount?: number;
  change?: number;
}

// POS Sale Response
export interface PosSaleResponse {
  success: boolean;
  data?: {
    orderId: string;
    orderNumber: string;
    total: number;
    paymentMethod: string;
    timestamp: Date;
  };
  error?: string;
}

// POS Data (for dashboard/management)
export interface PosData {
  products: ProductResponse[];
  categories: CategoryResponse[];
  config: {
    taxRate: number;
    taxWaived: boolean;
  };
}

// Import dependent types
import type { ProductResponse, CategoryResponse } from './product';
