/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/utils/orderHelpers', () => ({
  getOrderById: vi.fn(),
  updateOrderStatus: vi.fn(),
  softDeleteOrder: vi.fn(),
}));

import { requireAdmin } from '@/lib/requireAdmin';
import { getOrderById, updateOrderStatus, softDeleteOrder } from '@/lib/utils/orderHelpers';

const mockOrder = {
  id: 'order-uuid-1',
  orderNumber: 'XY123',
  total: 55.21,
  status: 'PENDING',
  user: { fullName: 'Test User' },
  items: [],
};

function makeRequest(method: string, body?: Record<string, unknown>) {
  const init: RequestInit = { method };
  if (body) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return new Request('http://localhost:3000/api/admin/orders/order-uuid-1', init) as any;
}

const mockParams = Promise.resolve({ orderId: 'order-uuid-1' });

describe('GET /api/admin/orders/[orderId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any);
  });

  it('should return 401 if not admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await GET(makeRequest('GET'), { params: mockParams });
    expect(res.status).toBe(401);
  });

  it('should return order by ID', async () => {
    vi.mocked(getOrderById).mockResolvedValue(mockOrder as any);

    const res = await GET(makeRequest('GET'), { params: mockParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.order.id).toBe('order-uuid-1');
  });

  it('should return 404 if order not found', async () => {
    vi.mocked(getOrderById).mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: mockParams });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Order not found');
  });
});

describe('PUT /api/admin/orders/[orderId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any);
  });

  it('should return 401 if not admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await PUT(makeRequest('PUT', { status: 'CONFIRMED' }), { params: mockParams });
    expect(res.status).toBe(401);
  });

  it('should update order status', async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' } as any);

    const res = await PUT(makeRequest('PUT', { status: 'CONFIRMED' }), { params: mockParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.order.status).toBe('CONFIRMED');
    expect(updateOrderStatus).toHaveBeenCalledWith('order-uuid-1', 'CONFIRMED');
  });

  it('should return 400 on error', async () => {
    vi.mocked(updateOrderStatus).mockRejectedValue(new Error('Invalid status'));

    const res = await PUT(makeRequest('PUT', { status: 'INVALID' }), { params: mockParams });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/orders/[orderId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any);
  });

  it('should return 401 if not admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await DELETE(makeRequest('DELETE'), { params: mockParams });
    expect(res.status).toBe(401);
  });

  it('should soft delete the order', async () => {
    vi.mocked(softDeleteOrder).mockResolvedValue({ ...mockOrder, isDelete: true } as any);

    const res = await DELETE(makeRequest('DELETE'), { params: mockParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.order.isDelete).toBe(true);
  });

  it('should return 400 on error', async () => {
    vi.mocked(softDeleteOrder).mockRejectedValue(new Error('Order not found'));

    const res = await DELETE(makeRequest('DELETE'), { params: mockParams });
    expect(res.status).toBe(400);
  });
});
