import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase/firebase-admin'
import { cookies } from 'next/headers'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    address: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/lib/firebase/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('/api/user/set-default-address', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PATCH', () => {
    it('should set default address', async () => {
      const mockCookies = { get: vi.fn().mockReturnValue({ value: 'token' }) }
      vi.mocked(cookies).mockResolvedValue(mockCookies as any)
      vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({ phone_number: '123' } as any)

      const mockUser = { id: 'u1', phone: '123' }
      const mockAddress = { id: 'addr1' }
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any)
      vi.mocked(prisma.address.findFirst).mockResolvedValue(mockAddress as any)
      vi.mocked(prisma.user.update).mockResolvedValue({ defaultAddress: mockAddress } as any)

      const req = new Request('http://localhost/api/user/set-default-address', {
        method: 'PATCH',
        body: JSON.stringify({ addressId: 'addr1' }),
      })
      const res = await PATCH(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockAddress)
    })

    it('should return 404 if address not found', async () => {
      const mockCookies = { get: vi.fn().mockReturnValue({ value: 'token' }) }
      vi.mocked(cookies).mockResolvedValue(mockCookies as any)
      vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({ phone_number: '123' } as any)

      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'u1' } as any)
      vi.mocked(prisma.address.findFirst).mockResolvedValue(null)

      const req = new Request('http://localhost/api/user/set-default-address', {
        method: 'PATCH',
        body: JSON.stringify({ addressId: 'addr1' }),
      })
      const res = await PATCH(req as any)
      expect(res.status).toBe(404)
    })
  })
})
