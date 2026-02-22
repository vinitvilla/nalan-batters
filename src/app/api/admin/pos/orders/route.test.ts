/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { requireAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'AB123',
    total: 31.86,
    tax: 3.38,
    discount: null,
    status: 'DELIVERED',
    orderType: 'POS',
    paymentMethod: 'CASH',
    createdAt: new Date('2026-02-21'),
    user: { fullName: 'Walk-in Customer', phone: 'WALK_IN_CUSTOMER' },
    items: [
      {
        id: 'item-1',
        quantity: 2,
        price: 12.99,
        product: { name: 'Dosa Batter' },
      },
    ],
  },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/admin/pos/orders');
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new Request(url.toString()) as any;
}

describe('GET /api/admin/pos/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any);
    vi.mocked(prisma.order.count).mockResolvedValue(1);
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);
  });

  // --- Auth Tests ---
  it('should return auth error if not admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  // --- Basic GET ---
  it('should return POS orders with pagination', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it('should filter by POS orderType only', async () => {
    await GET(makeRequest());

    // Verify POS filter is applied in the where clause
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          orderType: 'POS',
          isDelete: false,
        }),
      })
    );
  });

  // --- Pagination ---
  it('should apply pagination parameters', async () => {
    await GET(makeRequest({ page: '2', limit: '10' }));

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  // --- Search Filter ---
  it('should apply search filter on phone and orderNumber', async () => {
    await GET(makeRequest({ search: 'AB123' }));

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ orderNumber: expect.any(Object) }),
          ]),
        }),
      })
    );
  });

  // --- Status Filter ---
  it('should apply status filter', async () => {
    await GET(makeRequest({ status: 'DELIVERED' }));

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'DELIVERED',
        }),
      })
    );
  });

  it('should not apply status filter for "all"', async () => {
    await GET(makeRequest({ status: 'all' }));

    const callArgs = vi.mocked(prisma.order.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.status).toBeUndefined();
  });

  // --- Payment Method Filter ---
  it('should apply payment method filter', async () => {
    await GET(makeRequest({ paymentMethod: 'CASH' }));

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          paymentMethod: 'CASH',
        }),
      })
    );
  });

  // --- Response Transformation ---
  it('should transform Decimal fields to plain numbers', async () => {
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(typeof data.data[0].total).toBe('number');
    expect(typeof data.data[0].tax).toBe('number');
  });

  it('should include pagination metadata', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(45);

    const res = await GET(makeRequest({ page: '2', limit: '20' }));
    const data = await res.json();

    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(20);
    expect(data.pagination.totalPages).toBe(3);
    expect(data.pagination.hasNext).toBe(true);
    expect(data.pagination.hasPrev).toBe(true);
  });

  // --- Error Handling ---
  it('should return 500 on database error', async () => {
    vi.mocked(prisma.order.count).mockRejectedValue(new Error('DB connection failed'));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
