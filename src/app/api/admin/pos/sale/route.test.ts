/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    address: {
      findFirst: vi.fn(),
    },
    config: {
      findMany: vi.fn(),
    },
    promoCode: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/services/config/config.service', () => ({
  getAllConfigs: vi.fn(),
  parseChargeConfig: vi.fn(),
}));

vi.mock('@/services/order/orderCalculation.service', () => ({
  calculateOrderCharges: vi.fn(),
  calculateDiscountAmount: vi.fn(),
  calculateOrderTotal: vi.fn(),
}));

vi.mock('@/services/order/promoCode.service', () => ({
  validatePromoById: vi.fn(),
  incrementPromoUsage: vi.fn(),
}));

vi.mock('@/lib/utils/phoneUtils', () => ({
  formatPhoneNumber: vi.fn((p: string) => p),
  getPhoneVariations: vi.fn((p: string) => [p]),
}));

import { requireAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { getAllConfigs, parseChargeConfig } from '@/services/config/config.service';
import { calculateOrderCharges, calculateOrderTotal } from '@/services/order/orderCalculation.service';
import { validatePromoById } from '@/services/order/promoCode.service';

const mockChargeConfig = {
  taxPercent: { percent: 13, waive: false },
  convenienceCharge: { amount: 2.5, waive: false },
  deliveryCharge: { amount: 5, waive: false },
};

const mockCharges = {
  tax: 6.5,
  convenienceCharge: 2.5,
  deliveryCharge: 0,
  originalTax: 6.5,
  originalConvenienceCharge: 2.5,
  originalDeliveryCharge: 5,
  isTaxWaived: false,
  isConvenienceWaived: false,
  isDeliveryWaived: true,
};

const mockTotals = {
  subtotal: 50,
  tax: 6.5,
  taxRate: 13,
  convenienceCharge: 2.5,
  deliveryCharge: 0,
  appliedDiscount: 0,
  finalTotal: 59,
};

const validSaleBody = {
  items: [
    { id: 'product-1', name: 'Dosa Batter', price: 12.99, quantity: 2, total: 25.98 },
  ],
  subtotal: 25.98,
  tax: 3.38,
  discount: 0,
  total: 31.86,
  paymentMethod: 'cash' as const,
};

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/admin/pos/sale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

describe('POST /api/admin/pos/sale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any);
    vi.mocked(getAllConfigs).mockResolvedValue([]);
    vi.mocked(parseChargeConfig).mockReturnValue(mockChargeConfig as any);
    vi.mocked(calculateOrderCharges).mockReturnValue(mockCharges as any);
    vi.mocked(calculateOrderTotal).mockReturnValue(mockTotals as any);
  });

  // --- Auth Tests ---
  it('should return auth error if not admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await POST(makeRequest(validSaleBody));
    expect(res.status).toBe(401);
  });

  // --- Validation Tests ---
  it('should reject request with no items', async () => {
    const res = await POST(makeRequest({ ...validSaleBody, items: [] }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('No items');
  });

  it('should reject invalid payment method', async () => {
    const res = await POST(makeRequest({ ...validSaleBody, paymentMethod: 'bitcoin' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid payment method');
  });

  // --- Customer Handling Tests ---
  it('should use existing user ID when provided', async () => {
    const body = {
      ...validSaleBody,
      customer: { userId: 'existing-user-1', isExistingUser: true },
    };

    vi.mocked(prisma.address.findFirst).mockResolvedValue({ id: 'pickup-location-default' } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn({
        order: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'AB123', total: 31.86, createdAt: new Date() }) },
        product: { findFirst: vi.fn().mockResolvedValue({ id: 'product-1', name: 'Dosa', stock: 100, isActive: true, isDelete: false }), update: vi.fn() },
      });
    });

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(200);
  });

  it('should create new user when phone is provided but user does not exist', async () => {
    const body = {
      ...validSaleBody,
      customer: { phone: '4161234567', name: 'New Customer' },
    };

    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new-user-1', phone: '4161234567', fullName: 'New Customer' } as any);
    vi.mocked(prisma.address.findFirst).mockResolvedValue({ id: 'pickup-location-default' } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn({
        order: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'AB123', total: 31.86, createdAt: new Date() }) },
        product: { findFirst: vi.fn().mockResolvedValue({ id: 'product-1', name: 'Dosa', stock: 100, isActive: true, isDelete: false }), update: vi.fn() },
      });
    });

    await POST(makeRequest(body));
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should use walk-in customer when no customer info provided', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'walkin-user', phone: 'WALK_IN_CUSTOMER' } as any);
    vi.mocked(prisma.address.findFirst).mockResolvedValue({ id: 'pickup-location-default' } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn({
        order: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'AB123', total: 31.86, createdAt: new Date() }) },
        product: { findFirst: vi.fn().mockResolvedValue({ id: 'product-1', name: 'Dosa', stock: 100, isActive: true, isDelete: false }), update: vi.fn() },
      });
    });

    const res = await POST(makeRequest(validSaleBody));
    expect(res.status).toBe(200);
  });

  it('should return 500 when walk-in customer is not configured', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const res = await POST(makeRequest(validSaleBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Walk-in customer');
  });

  // --- Store Address Tests ---
  it('should return 500 when pickup location is not configured', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'walkin-user' } as any);
    vi.mocked(prisma.address.findFirst).mockResolvedValue(null);

    const res = await POST(makeRequest(validSaleBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Store pickup location not configured');
  });

  // --- Promo Code Tests ---
  it('should apply promo code discount when promoCodeId is provided', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'walkin-user' } as any);
    vi.mocked(prisma.address.findFirst).mockResolvedValue({ id: 'pickup-location-default' } as any);
    vi.mocked(validatePromoById).mockResolvedValue({
      valid: true,
      promo: { id: 'promo-1', code: 'SAVE10', discountType: 'PERCENTAGE', discount: 10 },
    } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn({
        order: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'AB123', total: 28.67, createdAt: new Date() }) },
        product: { findFirst: vi.fn().mockResolvedValue({ id: 'product-1', name: 'Dosa', stock: 100, isActive: true, isDelete: false }), update: vi.fn() },
      });
    });

    const body = { ...validSaleBody, promoCodeId: 'promo-1' };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(200);
    expect(validatePromoById).toHaveBeenCalledWith('promo-1', expect.any(Number));
  });

  // --- Error Handling ---
  it('should return 500 with friendly error for stock issues', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'walkin-user' } as any);
    vi.mocked(prisma.address.findFirst).mockResolvedValue({ id: 'pickup-location-default' } as any);
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error('Insufficient stock for Dosa Batter'));

    const res = await POST(makeRequest(validSaleBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Insufficient stock');
  });
});
