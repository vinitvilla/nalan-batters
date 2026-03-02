/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contactMessage: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/services/notification/notification.service', () => ({
  createContactMessageNotifications: vi.fn().mockResolvedValue(undefined),
}))

describe('/api/public/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST', () => {
    it('should create contact message', async () => {
      const newMessage = {
        name: 'John',
        mobile: '1234567890',
        message: 'Hello',
      }
      const createdMessage = { ...newMessage, id: '1', status: 'NEW' }
      vi.mocked(prisma.contactMessage.create).mockResolvedValue(createdMessage as any)

      const req = new Request('http://localhost/api/public/contact', {
        method: 'POST',
        body: JSON.stringify(newMessage),
      })
      const res = await POST(req as any)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.success).toBe(true)
    })

    it('should return 400 if fields missing', async () => {
      const req = new Request('http://localhost/api/public/contact', {
        method: 'POST',
        body: JSON.stringify({ name: 'John' }),
      })
      const res = await POST(req as any)
      expect(res.status).toBe(400)
    })

    it('should return 400 if mobile invalid', async () => {
      const req = new Request('http://localhost/api/public/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John',
          mobile: 'invalid',
          message: 'Hello',
        }),
      })
      const res = await POST(req as any)
      expect(res.status).toBe(400)
    })
  })
})
