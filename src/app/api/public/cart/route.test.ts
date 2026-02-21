/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/auth-guard', () => ({
  requireAuth: vi.fn().mockResolvedValue({ uid: 'user1', phone_number: '+1234567890' }),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

describe('/api/public/cart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return cart for user', async () => {
      const mockCart = { id: '1', items: [] }
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any)

      const req = new Request('http://localhost/api/public/cart?userId=user1')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200) // NextResponse.json defaults to 200
      expect(data).toEqual({ cart: mockCart })
    })

    it('should return 400 if userId is missing', async () => {
      const req = new Request('http://localhost/api/public/cart')
      const res = await GET(req as any)
      expect(res.status).toBe(400)
    })
  })

  describe('POST', () => {
    const testProductId = '550e8400-e29b-41d4-a716-446655440000'

    it('should upsert cart', async () => {
      const mockCart = { id: '1', items: [{ productId: testProductId, quantity: 1 }] }
      vi.mocked(prisma.cart.upsert).mockResolvedValue(mockCart as any)
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null)

      const req = new Request('http://localhost/api/public/cart', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          items: [{ productId: testProductId, quantity: 1 }],
        }),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ cart: mockCart })
    })

    it('should merge carts if merge flag is true', async () => {
      const existingCart = { items: [{ productId: testProductId, quantity: 1 }] }
      const mockMergedCart = { id: '1', items: [{ productId: testProductId, quantity: 2 }] }

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(existingCart as any)
      vi.mocked(prisma.cart.upsert).mockResolvedValue(mockMergedCart as any)

      const req = new Request('http://localhost/api/public/cart', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          items: [{ productId: testProductId, quantity: 1 }],
          merge: true
        }),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ cart: mockMergedCart })
    })
  })
})
