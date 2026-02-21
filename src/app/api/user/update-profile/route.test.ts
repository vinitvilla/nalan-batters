/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'
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

describe('/api/user/update-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PATCH', () => {
    it('should update profile', async () => {
      const mockCookies = { get: vi.fn().mockReturnValue({ value: 'token' }) }
      vi.mocked(cookies).mockResolvedValue(mockCookies as any)
      vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({ phone_number: '123' } as any)

      const mockUser = { id: 'u1', phone: '123' }
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any)
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, fullName: 'New Name' } as any)

      const req = new Request('http://localhost/api/user/update-profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: 'New Name' }),
      })
      const res = await PATCH(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.fullName).toBe('New Name')
    })

    it('should return 401 if no token', async () => {
      const mockCookies = { get: vi.fn().mockReturnValue(undefined) }
      vi.mocked(cookies).mockResolvedValue(mockCookies as any)

      const req = new Request('http://localhost/api/user/update-profile')
      const res = await PATCH(req as any)
      expect(res.status).toBe(401)
    })
  })
})
