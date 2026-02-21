/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    config: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('/api/public/config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all configs', async () => {
      const mockConfigs = [{ title: 'c1', value: 'v1' }]
      vi.mocked(prisma.config.findMany).mockResolvedValue(mockConfigs as any)

      const req = new Request('http://localhost/api/public/config')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ c1: 'v1' })
    })

    it('should return config by title', async () => {
      const mockConfig = { title: 'c1', value: 'v1' }
      vi.mocked(prisma.config.findFirst).mockResolvedValue(mockConfig as any)

      const req = new Request('http://localhost/api/public/config?title=c1')
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ c1: 'v1' })
    })

    it('should return 404 if config by title not found', async () => {
      vi.mocked(prisma.config.findFirst).mockResolvedValue(null)

      const req = new Request('http://localhost/api/public/config?title=c1')
      const res = await GET(req as any)
      expect(res.status).toBe(404)
    })
  })
})
