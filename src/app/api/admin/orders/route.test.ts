import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { getOrdersPaginated, getAllOrders } from '@/lib/utils/orderHelpers'

// Mock dependencies
vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/utils/orderHelpers', () => ({
  getOrdersPaginated: vi.fn(),
  getAllOrders: vi.fn(),
}))

describe('/api/admin/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if not admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const req = new Request('http://localhost/api/admin/orders')
      const res = await GET(req as any)
      expect(res.status).toBe(401)
    })

    it('should return all orders if no pagination params', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const mockOrders = [{ id: '1', total: 100 }]
      vi.mocked(getAllOrders).mockResolvedValue(mockOrders as any)

      const req = new Request('http://localhost/api/admin/orders')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ orders: mockOrders })
    })

    it('should return paginated orders if page param is present', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)
      const mockPaginatedResult = {
        orders: [{ id: '1', total: 100 }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }
      vi.mocked(getOrdersPaginated).mockResolvedValue(mockPaginatedResult as any)

      const req = new Request('http://localhost/api/admin/orders?page=1')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(getOrdersPaginated).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })
  })
})
