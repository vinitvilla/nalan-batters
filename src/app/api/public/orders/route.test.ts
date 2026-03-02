/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth-guard', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/utils/orderHelpers', () => ({
  createOrder: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    address: { findFirst: vi.fn() },
  },
}));

vi.mock('@/services/notification/notification.service', () => ({
  createOrderNotifications: vi.fn().mockResolvedValue(undefined),
}));

import { requireAuth } from '@/lib/auth-guard';
import { createOrder } from '@/lib/utils/orderHelpers';
import { prisma } from '@/lib/prisma';

// Compute a delivery date always 7 days from now so past-date validation never fires
function futureDateString(daysAhead = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

const validOrderBody = {
  userId: 'user-uuid-1',
  addressId: 'address-uuid-1',
  items: [
    { productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2, price: 12.99 },
  ],
  deliveryDate: futureDateString(),
  deliveryType: 'DELIVERY',
};

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/public/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

describe('POST /api/public/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({ id: 'user-uuid-1' } as any);
  });

  // --- Auth Tests ---
  it('should return auth error if not authenticated', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await POST(makeRequest(validOrderBody));
    expect(res.status).toBe(401);
  });

  // --- Validation Tests ---
  it('should reject request with no items', async () => {
    const res = await POST(makeRequest({ ...validOrderBody, items: [] }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation Error');
  });

  it('should reject request with missing userId', async () => {
    const res = await POST(makeRequest({ ...validOrderBody, userId: '' }));
    expect(res.status).toBe(400);
  });

  it('should reject request with invalid item productId', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      items: [{ productId: 'not-a-uuid', quantity: 1, price: 10 }],
    }));
    expect(res.status).toBe(400);
  });

  it('should reject request with zero quantity', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 0, price: 10 }],
    }));
    expect(res.status).toBe(400);
  });

  it('should reject request with negative price', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, price: -5 }],
    }));
    expect(res.status).toBe(400);
  });

  // --- Delivery Validation Tests ---
  it('should reject DELIVERY order without addressId', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      addressId: undefined,
      deliveryType: 'DELIVERY',
    }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Address is required');
  });

  it('should reject DELIVERY order without delivery date', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      deliveryDate: undefined,
      deliveryType: 'DELIVERY',
    }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Delivery date is required');
  });

  it('should reject DELIVERY order with past date', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      deliveryDate: '2020-01-01',
      deliveryType: 'DELIVERY',
    }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('past');
  });

  it('should reject DELIVERY order with invalid date format', async () => {
    const res = await POST(makeRequest({
      ...validOrderBody,
      deliveryDate: 'not-a-date',
      deliveryType: 'DELIVERY',
    }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid delivery date');
  });

  // --- PICKUP Tests ---
  it('should use system pickup address for PICKUP orders', async () => {
    vi.mocked(prisma.address.findFirst).mockResolvedValue({
      id: 'pickup-location-default',
      userId: 'system',
      street: '2308 Eglinton Ave',
      city: 'Scarborough',
      province: 'ON',
      country: 'CA',
      postal: 'M1K2M2',
      unit: null,
      isDeleted: false,
    } as any);
    vi.mocked(createOrder).mockResolvedValue({ id: 'order-1', orderNumber: 'ABC12' } as any);

    const res = await POST(makeRequest({
      ...validOrderBody,
      deliveryType: 'PICKUP',
      addressId: undefined,
      deliveryDate: undefined,
    }));
    expect(res.status).toBe(200);
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        addressId: 'pickup-location-default',
        orderType: 'PICKUP',
      })
    );
  });

  it('should return 500 when pickup location is not configured', async () => {
    vi.mocked(prisma.address.findFirst).mockResolvedValue(null);

    const res = await POST(makeRequest({
      ...validOrderBody,
      deliveryType: 'PICKUP',
      addressId: undefined,
      deliveryDate: undefined,
    }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Pickup location not configured');
  });

  // --- Successful Order ---
  it('should create order successfully for a valid DELIVERY request', async () => {
    const mockOrder = {
      id: 'order-uuid-1',
      orderNumber: 'XY123',
      total: 55.21,
      status: 'PENDING',
    };
    vi.mocked(createOrder).mockResolvedValue(mockOrder as any);

    const res = await POST(makeRequest(validOrderBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.order.id).toBe('order-uuid-1');
  });

  it('should pass promoCodeId to createOrder when provided', async () => {
    vi.mocked(createOrder).mockResolvedValue({ id: 'order-1' } as any);

    await POST(makeRequest({
      ...validOrderBody,
      promoCodeId: 'promo-uuid-1',
    }));

    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        promoCodeId: 'promo-uuid-1',
      })
    );
  });

  // --- Error Handling ---
  it('should return 400 with error message when createOrder throws', async () => {
    vi.mocked(createOrder).mockRejectedValue(new Error('Insufficient stock for Dosa Batter'));

    const res = await POST(makeRequest(validOrderBody));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Insufficient stock');
  });
});
