/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

// Mock dependencies
vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: { count: vi.fn() },
      order: { count: vi.fn(), aggregate: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
      product: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
      orderItem: { groupBy: vi.fn(), findMany: vi.fn() },
    }
  }
})

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('/api/admin/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return dashboard data if admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ admin: true } as any)

      // Mock all the prisma calls
      mockPrisma.user.count.mockResolvedValue(10)
      mockPrisma.order.count.mockResolvedValue(20)
      mockPrisma.order.aggregate.mockResolvedValue({ _sum: { total: 1000 } })
      mockPrisma.product.count.mockResolvedValue(5)
      mockPrisma.order.groupBy.mockResolvedValue([])
      mockPrisma.orderItem.groupBy.mockResolvedValue([])
      mockPrisma.orderItem.findMany.mockResolvedValue([])
      mockPrisma.order.findMany.mockResolvedValue([])
      mockPrisma.product.findMany.mockResolvedValue([])

      const req = new Request('http://localhost/api/admin/dashboard')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.overview.totalUsers).toBe(10)
      expect(data.overview.totalOrders).toBe(20)
    })

    it('should return 401 if not admin', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const req = new Request('http://localhost/api/admin/dashboard')
      const res = await GET(req as any)
      expect(res.status).toBe(401)
    })
  })
})
